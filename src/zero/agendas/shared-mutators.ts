import { defineMutator } from '@rocicorp/zero';
import {
  createAgendaItemSchema,
  updateAgendaItemSchema,
  deleteAgendaItemSchema,
  reorderAgendaItemsSchema,
  createSpeakerListSchema,
  deleteSpeakerListSchema,
  createAgendaItemChangeRequestSchema,
  updateAgendaItemChangeRequestSchema,
  deleteAgendaItemChangeRequestSchema,
  reorderAgendaItemChangeRequestsSchema,
  initializeChangeRequestVotingSchema,
  processCRVoteResultSchema,
} from './schema';
import { z } from 'zod';

/** Shared mutators — run on both client and server. Server mutators may override these. */
export const agendaSharedMutators = {
  // Create an agenda item
  createAgendaItem: defineMutator(createAgendaItemSchema, async ({ tx, ctx: { userID }, args }) => {
    const now = Date.now();
    await tx.mutate.agenda_item.insert({
      ...args,
      creator_id: userID,
      created_at: now,
      updated_at: now,
    });
  }),

  // Update an agenda item
  updateAgendaItem: defineMutator(updateAgendaItemSchema, async ({ tx, args }) => {
    const { id, ...fields } = args;
    await tx.mutate.agenda_item.update({
      id,
      ...fields,
      updated_at: Date.now(),
    });
  }),

  // Reorder agenda items
  reorderAgendaItems: defineMutator(reorderAgendaItemsSchema, async ({ tx, args }) => {
    for (const item of args.items) {
      await tx.mutate.agenda_item.update({
        id: item.id,
        order_index: item.order_index,
        updated_at: Date.now(),
      });
    }
  }),

  // Add a speaker to the speaker list
  addSpeaker: defineMutator(createSpeakerListSchema, async ({ tx, args }) => {
    const now = Date.now();
    await tx.mutate.speaker_list.insert({
      ...args,
      created_at: now,
    });
  }),

  // Delete an agenda item
  deleteAgendaItem: defineMutator(deleteAgendaItemSchema, async ({ tx, args }) => {
    await tx.mutate.agenda_item.delete({ id: args.id });
  }),

  // Remove a speaker from the speaker list
  removeSpeaker: defineMutator(deleteSpeakerListSchema, async ({ tx, args }) => {
    await tx.mutate.speaker_list.delete({ id: args.id });
  }),

  // Update a speaker in the speaker list
  updateSpeaker: defineMutator(
    z.object({
      id: z.string(),
      completed: z.boolean().optional(),
      order_index: z.number().optional(),
      time: z.number().optional(),
      start_time: z.number().nullable().optional(),
      end_time: z.number().nullable().optional(),
    }),
    async ({ tx, args }) => {
      await tx.mutate.speaker_list.update(args);
    }
  ),

  // ── Agenda Item Change Requests ────────────────────────────────────

  // Create a junction record linking a CR (or final vote) to an agenda item
  createAgendaItemChangeRequest: defineMutator(
    createAgendaItemChangeRequestSchema,
    async ({ tx, args }) => {
      const now = Date.now();
      await tx.mutate.agenda_item_change_request.insert({
        ...args,
        created_at: now,
        updated_at: now,
      });
    }
  ),

  // Update a junction record (e.g. link vote_id, change status)
  updateAgendaItemChangeRequest: defineMutator(
    updateAgendaItemChangeRequestSchema,
    async ({ tx, args }) => {
      const { id, ...fields } = args;
      await tx.mutate.agenda_item_change_request.update({
        id,
        ...fields,
        updated_at: Date.now(),
      });
    }
  ),

  // Reorder CR timeline items within an agenda item
  reorderAgendaItemChangeRequests: defineMutator(
    reorderAgendaItemChangeRequestsSchema,
    async ({ tx, args }) => {
      for (const item of args.items) {
        await tx.mutate.agenda_item_change_request.update({
          id: item.id,
          order_index: item.order_index,
          updated_at: Date.now(),
        });
      }
    }
  ),

  // Delete a junction record
  deleteAgendaItemChangeRequest: defineMutator(
    deleteAgendaItemChangeRequestSchema,
    async ({ tx, args }) => {
      await tx.mutate.agenda_item_change_request.delete({ id: args.id });
    }
  ),

  // Client-side no-op — server mutator handles the actual initialization
  initializeChangeRequestVoting: defineMutator(initializeChangeRequestVotingSchema, async () => {
    // Server-only: creates votes, choices, voters, and junction records
  }),

  // Client-side no-op — server mutator handles CR vote result processing
  processCRVoteResult: defineMutator(processCRVoteResultSchema, async () => {
    // Server-only: accepts/rejects suggestion, saves document version, advances timeline
  }),
};
