import { defineMutator } from '@rocicorp/zero'
import type { ReadonlyJSONValue } from '@rocicorp/zero'
import { mutators } from '../mutators'
import { zql } from '../schema'
import { fireNotification } from '../server-notify'
import { eventTitle, recomputeEventCounters } from '../server-helpers'
import {
  deleteAgendaItemSchema,
  updateAgendaItemSchema,
  createSpeakerListSchema,
  initializeChangeRequestVotingSchema,
  processCRVoteResultSchema,
} from './schema'
import { applySuggestionToContent } from '@/features/change-requests/logic/applySuggestionToContent'

/** Server-only mutators — override the shared mutators with additional server-side logic (e.g. notifications). */
export const agendaServerMutators = {
  deleteAgendaItem: defineMutator(deleteAgendaItemSchema, async ({ tx, ctx, args }) => {
    const item = await tx.run(zql.agenda_item.where('id', args.id).one())

    await mutators.agendas.deleteAgendaItem.fn({ tx, ctx, args })

    if (item?.event_id) {
      await recomputeEventCounters(tx, item.event_id)
      const eTitle = await eventTitle(tx, item.event_id)
      fireNotification('notifyAgendaItemDeleted', {
        senderId: ctx.userID,
        eventId: item.event_id,
        agendaItemId: args.id,
        agendaItemTitle: item.title,
        eventTitle: eTitle,
      })
    }
  }),

  updateAgendaItem: defineMutator(updateAgendaItemSchema, async ({ tx, ctx, args }) => {
    const oldItem = await tx.run(zql.agenda_item.where('id', args.id).one())

    await mutators.agendas.updateAgendaItem.fn({ tx, ctx, args })

    if (!oldItem) return

    if (oldItem.event_id) {
      await recomputeEventCounters(tx, oldItem.event_id)
    }
    if (args.event_id && args.event_id !== oldItem.event_id) {
      await recomputeEventCounters(tx, args.event_id)
    }

    if (args.status === 'in-progress' && oldItem.status !== 'in-progress' && oldItem.event_id) {
      const eTitle = await eventTitle(tx, oldItem.event_id)
      fireNotification('notifyAgendaItemActivated', {
        senderId: ctx.userID,
        eventId: oldItem.event_id,
        eventTitle: eTitle,
        agendaItemId: args.id,
        agendaItemTitle: oldItem.title,
        agendaItemType: oldItem.type,
      })
    }

    if (args.event_id && args.event_id !== oldItem.event_id && oldItem.event_id) {
      const [sourceTitle, targetTitle] = await Promise.all([
        eventTitle(tx, oldItem.event_id),
        eventTitle(tx, args.event_id),
      ])
      fireNotification('notifyAgendaItemTransferred', {
        senderId: ctx.userID,
        agendaItemId: args.id,
        agendaItemTitle: oldItem.title,
        sourceEventTitle: sourceTitle,
        targetEventId: args.event_id,
        targetEventTitle: targetTitle,
      })
    }
  }),

  addSpeaker: defineMutator(createSpeakerListSchema, async ({ tx, ctx, args }) => {
    await mutators.agendas.addSpeaker.fn({ tx, ctx, args })

    if (args.agenda_item_id) {
      const ai = await tx.run(zql.agenda_item.where('id', args.agenda_item_id).one())
      if (ai?.event_id) {
        const eTitle = await eventTitle(tx, ai.event_id)
        fireNotification('notifySpeakerListJoined', {
          senderId: ctx.userID,
          eventId: ai.event_id,
          eventTitle: eTitle,
          agendaItemId: args.agenda_item_id,
        })
      }
    }
  }),

  /**
   * Initialize all change-request votes + final amendment vote for an agenda item.
   * Called server-side when an amendment transitions to `event_voting`.
   *
   * Creates:
   *  - One vote + 3 choices (yes/no/abstain) per open change request
   *  - One final "accept amendment as modified" vote + 3 choices
   *  - Junction records in `agenda_item_change_request` for each
   *  - Voter records from accredited participants
   */
  initializeChangeRequestVoting: defineMutator(
    initializeChangeRequestVotingSchema,
    async ({ tx, args }) => {
      const { amendment_id, agenda_item_id } = args
      const now = Date.now()

      // 1. Fetch open change requests for this amendment
      const changeRequests = await tx.run(
        zql.change_request
          .where('amendment_id', amendment_id)
          .where('status', 'open')
          .orderBy('created_at', 'asc')
      )

      // 2. Fetch accredited voters for this agenda item
      const agendaItem = await tx.run(zql.agenda_item.where('id', agenda_item_id).one())
      const accreditations = agendaItem?.event_id
        ? await tx.run(zql.accreditation.where('event_id', agendaItem.event_id))
        : []

      const CHOICE_LABELS = ['yes', 'no', 'abstain'] as const

      // Helper: create a vote with 3 choices and voters
      async function createVoteWithChoicesAndVoters(voteTitle: string) {
        const voteId = crypto.randomUUID()
        await tx.mutate.vote.insert({
          id: voteId,
          agenda_item_id,
          amendment_id,
          title: voteTitle,
          description: null,
          status: 'indicative',
          majority_type: 'relative',
          closing_type: 'moderator',
          closing_duration_seconds: null,
          closing_end_time: null,
          visibility: 'public',
          created_at: now,
          updated_at: now,
        })

        // Create yes/no/abstain choices
        for (let i = 0; i < CHOICE_LABELS.length; i++) {
          await tx.mutate.vote_choice.insert({
            id: crypto.randomUUID(),
            vote_id: voteId,
            label: CHOICE_LABELS[i],
            order_index: i,
            created_at: now,
          })
        }

        // Create voter records from accreditation
        for (const acc of accreditations) {
          await tx.mutate.voter.insert({
            id: crypto.randomUUID(),
            vote_id: voteId,
            user_id: acc.user_id,
            created_at: now,
          })
        }

        return voteId
      }

      // 3. Create one vote per change request + junction records
      for (let i = 0; i < changeRequests.length; i++) {
        const cr = changeRequests[i]
        const voteId = await createVoteWithChoicesAndVoters(
          cr.title ?? `Change Request ${i + 1}`
        )

        await tx.mutate.agenda_item_change_request.insert({
          id: crypto.randomUUID(),
          agenda_item_id,
          change_request_id: cr.id,
          vote_id: voteId,
          order_index: i,
          is_final_vote: false,
          status: 'pending',
          created_at: now,
          updated_at: now,
        })
      }

      // 4. Create final amendment vote + junction record (always last)
      const finalVoteId = await createVoteWithChoicesAndVoters(
        'Accept amendment as modified'
      )

      await tx.mutate.agenda_item_change_request.insert({
        id: crypto.randomUUID(),
        agenda_item_id,
        change_request_id: null,
        vote_id: finalVoteId,
        order_index: changeRequests.length,
        is_final_vote: true,
        status: 'pending',
        created_at: now,
        updated_at: now,
      })
    }
  ),

  /**
   * Process the result of a CR vote: accept or reject the plate-js suggestion,
   * update the change request status, and advance the timeline.
   *
   * - If vote passed (simple majority yes > no, ignoring abstains):
   *   accept the plate-js suggestion in the document and set CR status to 'accepted'
   * - If vote rejected or tied:
   *   reject the plate-js suggestion in the document and set CR status to 'rejected'
   * - Always marks the agenda_item_change_request junction as 'completed'
   *
   * The link between a change_request and its plate-js suggestion lives in the
   * `amendment.discussions` JSON column: `TDiscussion.changeRequestEntityId` points
   * to the change_request row, and `TDiscussion.id` is the suggestion UUID used in
   * document content as `suggestion_<uuid>` marks.
   */
  processCRVoteResult: defineMutator(
    processCRVoteResultSchema,
    async ({ tx, ctx, args }) => {
      const { agenda_item_change_request_id, vote_result } = args
      const now = Date.now()

      // 1. Fetch the junction record
      const junction = await tx.run(
        zql.agenda_item_change_request
          .where('id', agenda_item_change_request_id)
          .one()
      )
      if (!junction) return

      // 2. If this is a per-CR vote (not the final amendment vote), process the suggestion
      if (junction.change_request_id) {
        const cr = await tx.run(
          zql.change_request.where('id', junction.change_request_id).one()
        )

        if (cr?.amendment_id) {
          const amendmentRow = await tx.run(
            zql.amendment.where('id', cr.amendment_id).one()
          )

          // Find the suggestion ID from the discussions JSON on the amendment.
          // Each discussion entry has `changeRequestEntityId` linking to the
          // change_request row and `id` matching the plate-js suggestion UUID.
          interface DiscussionEntry {
            id: string
            changeRequestEntityId?: string
            crId?: string
            status?: string
            [key: string]: unknown
          }

          const discussions: DiscussionEntry[] = Array.isArray(amendmentRow?.discussions)
            ? (amendmentRow.discussions as DiscussionEntry[])
            : []

          const matchingDiscussion = discussions.find(
            (d) => d.changeRequestEntityId === cr.id
          )
          const suggestionId = matchingDiscussion?.id

          if (amendmentRow?.document_id) {
            const doc = await tx.run(
              zql.document.where('id', amendmentRow.document_id).one()
            )

            if (doc?.content && suggestionId) {
              const action = vote_result === 'passed' ? 'accept' : 'reject'
              const crLabel = matchingDiscussion?.crId ?? cr.title ?? 'Change Request'
              const versionSummary = vote_result === 'passed'
                ? `${crLabel} accepted by vote`
                : `${crLabel} rejected by vote`

              // Create a version snapshot BEFORE modifying the document
              const latestVersion = await tx.run(
                zql.document_version
                  .where('document_id', doc.id)
                  .orderBy('version_number', 'desc')
                  .limit(1)
                  .one()
              )
              const nextVersionNumber = (latestVersion?.version_number ?? 0) + 1

              await tx.mutate.document_version.insert({
                id: crypto.randomUUID(),
                document_id: doc.id,
                amendment_id: cr.amendment_id,
                blog_id: null,
                content: doc.content as ReadonlyJSONValue,
                version_number: nextVersionNumber,
                change_summary: versionSummary,
                author_id: ctx.userID,
                created_at: now,
              })

              // Apply or reject the suggestion in the document
              const updatedContent = applySuggestionToContent(
                doc.content as Parameters<typeof applySuggestionToContent>[0],
                suggestionId,
                action
              )

              await tx.mutate.document.update({
                id: doc.id,
                content: updatedContent as unknown as ReadonlyJSONValue,
                updated_at: now,
              })
            }
          }

          // Update discussion status in the amendment.discussions JSON
          if (matchingDiscussion && discussions.length > 0) {
            const discussionStatus = vote_result === 'passed' ? 'accepted' : 'rejected'
            const updatedDiscussions = discussions.map((d) =>
              d.id === matchingDiscussion.id
                ? { ...d, status: discussionStatus }
                : d
            )
            await tx.mutate.amendment.update({
              id: cr.amendment_id,
              discussions: updatedDiscussions as unknown as ReadonlyJSONValue,
              updated_at: now,
            })
          }
        }

        // Update the change request status and voting_status
        if (cr) {
          const crStatus = vote_result === 'passed' ? 'accepted' : 'rejected'
          await tx.mutate.change_request.update({
            id: cr.id,
            status: crStatus,
            voting_status: 'completed',
            updated_at: now,
          })
        }
      }

      // 3. Mark the junction record as completed
      await tx.mutate.agenda_item_change_request.update({
        id: agenda_item_change_request_id,
        status: 'completed',
        updated_at: now,
      })
    }
  ),
}
