import { defineMutator } from '@rocicorp/zero'
import {
  createAgendaItemSchema,
  updateAgendaItemSchema,
  deleteAgendaItemSchema,
  reorderAgendaItemsSchema,
  createSpeakerListSchema,
  deleteSpeakerListSchema,
} from './schema'
import { z } from 'zod'

/** Shared mutators — run on both client and server. Server mutators may override these. */
export const agendaSharedMutators = {
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
      await tx.mutate.speaker_list.update(args)
    }
  ),
}
