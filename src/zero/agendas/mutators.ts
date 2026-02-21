import { defineMutator } from '@rocicorp/zero'
import { zql } from '../schema'
import {
  createAgendaItemSchema,
  updateAgendaItemSchema,
  deleteAgendaItemSchema,
  reorderAgendaItemsSchema,
  createSpeakerListSchema,
  deleteSpeakerListSchema,
} from './schema'
import {
  createElectionSchema,
  updateElectionSchema,
  createElectionCandidateSchema,
  updateElectionCandidateSchema,
  deleteElectionCandidateSchema,
} from '../elections/schema'
import {
  createElectionVoteSchema,
  updateElectionVoteSchema,
  deleteElectionVoteSchema,
} from '../votes/schema'
import { z } from 'zod'

export const agendaMutators = {
  // Create an agenda item
  createAgendaItem: defineMutator(
    createAgendaItemSchema,
    async ({ tx, ctx: { userID }, args }) => {
      const now = Date.now()
      await tx.mutate.agenda_item.insert({
        ...args,
        creator_id: userID,
        created_at: now,
        updated_at: now,
      })
    }
  ),

  // Update an agenda item
  updateAgendaItem: defineMutator(
    updateAgendaItemSchema,
    async ({ tx, args }) => {
      const { id, ...fields } = args
      await tx.mutate.agenda_item.update({
        id,
        ...fields,
        updated_at: Date.now(),
      })
    }
  ),

  // Reorder agenda items
  reorderAgendaItems: defineMutator(
    reorderAgendaItemsSchema,
    async ({ tx, args }) => {
      for (const item of args.items) {
        await tx.mutate.agenda_item.update({
          id: item.id,
          order_index: item.order_index,
          updated_at: Date.now(),
        })
      }
    }
  ),

  // Add a speaker to the speaker list
  addSpeaker: defineMutator(
    createSpeakerListSchema,
    async ({ tx, args }) => {
      const now = Date.now()
      await tx.mutate.speaker_list.insert({
        ...args,
        created_at: now,
      })
    }
  ),

  // Create an election
  createElection: defineMutator(
    createElectionSchema,
    async ({ tx, args }) => {
      const now = Date.now()
      await tx.mutate.election.insert({
        ...args,
        created_at: now,
        updated_at: now,
      })
    }
  ),

  // Add a candidate to an election
  addCandidate: defineMutator(
    createElectionCandidateSchema,
    async ({ tx, args }) => {
      const now = Date.now()
      await tx.mutate.election_candidate.insert({
        ...args,
        created_at: now,
      })
    }
  ),

  // Cast a vote in an election
  castElectionVote: defineMutator(
    createElectionVoteSchema,
    async ({ tx, ctx: { userID }, args }) => {
      const now = Date.now()
      await tx.mutate.election_vote.insert({
        ...args,
        voter_id: userID,
        created_at: now,
        updated_at: now,
      })
    }
  ),

  // Delete an agenda item
  deleteAgendaItem: defineMutator(
    deleteAgendaItemSchema,
    async ({ tx, args }) => {
      await tx.mutate.agenda_item.delete({ id: args.id })
    }
  ),

  // Remove a speaker from the speaker list
  removeSpeaker: defineMutator(
    deleteSpeakerListSchema,
    async ({ tx, args }) => {
      await tx.mutate.speaker_list.delete({ id: args.id })
    }
  ),

  // Update an election
  updateElection: defineMutator(
    updateElectionSchema,
    async ({ tx, args }) => {
      await tx.mutate.election.update({
        ...args,
        updated_at: Date.now(),
      })
    }
  ),

  // Update an election candidate
  updateCandidate: defineMutator(
    updateElectionCandidateSchema,
    async ({ tx, args }) => {
      await tx.mutate.election_candidate.update(args)
    }
  ),

  // Update an election vote
  updateElectionVote: defineMutator(
    updateElectionVoteSchema,
    async ({ tx, args }) => {
      await tx.mutate.election_vote.update({
        ...args,
        updated_at: Date.now(),
      })
    }
  ),

  // Delete an election vote
  deleteElectionVote: defineMutator(
    deleteElectionVoteSchema,
    async ({ tx, args }) => {
      await tx.mutate.election_vote.delete({ id: args.id })
    }
  ),

  // Delete an election candidate
  deleteCandidate: defineMutator(
    deleteElectionCandidateSchema,
    async ({ tx, args }) => {
      await tx.mutate.election_candidate.delete({ id: args.id })
    }
  ),

  // Update a speaker in the speaker list
  updateSpeaker: defineMutator(
    z.object({ id: z.string(), completed: z.boolean().optional(), order_index: z.number().optional(), time: z.number().optional() }),
    async ({ tx, args }) => {
      await tx.mutate.speaker_list.update(args)
    }
  ),
}
