import { createServerFn } from '@tanstack/react-start'
import { createClient } from '@supabase/supabase-js'

import {
  getDirectSubgroups,
  calculateDelegateAllocations,
  finalizeDelegateSelection,
} from '../utils/delegate-calculations'
import { notifyDelegatesFinalized } from '../utils/notification-helpers'

function getSupabase() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

export const finalizeDelegatesFn = createServerFn({ method: 'POST' })
  .validator((data: unknown) => data as { eventId: string; senderId?: string })
  .handler(async ({ data }) => {
    const supabase = getSupabase()

    try {
      const { eventId, senderId } = data

      if (!eventId) {
        throw new Error('Event ID is required')
      }

      // Query event with its group
      const { data: eventRow, error: eventError } = await supabase
        .from('event')
        .select('*, group:group_id(*)')
        .eq('id', eventId)
        .single()

      if (eventError || !eventRow) {
        throw new Error('Event not found')
      }

      const parentGroupId = eventRow.group_id
      if (!parentGroupId) {
        throw new Error('Event has no associated group')
      }

      // Query delegates for this event
      const { data: delegates } = await supabase
        .from('event_delegate')
        .select('*, user:user_id(*), group:group_id(*)')
        .eq('event_id', eventId)

      // Query group relationships
      const { data: groupRelationships } = await supabase
        .from('group_relationship')
        .select('*, childGroup:related_group_id(*), parentGroup:group_id(*)')
        .eq('group_id', parentGroupId)

      // Attach delegates to event for business logic compatibility
      const event = { ...eventRow, delegates: delegates || [] }

      // --- Business logic (mirrors buildFinalizeDelegatesTransactions) ---

      if (event.event_type !== 'delegate_conference') {
        throw new Error('Event is not a delegate conference')
      }

      if (event.delegates_finalized) {
        throw new Error('Delegates already finalized for this event')
      }

      const subgroups = getDirectSubgroups(
        parentGroupId,
        (groupRelationships || []) as any,
      )

      if (subgroups.length === 0) {
        throw new Error('No subgroups found for this group')
      }

      const totalMembers = subgroups.reduce(
        (sum: number, g: any) => sum + g.memberCount,
        0,
      )
      const totalDelegates = Math.max(1, Math.floor(totalMembers / 50))

      const allocations = calculateDelegateAllocations(
        subgroups.map((g: any) => ({ id: g.id, memberCount: g.memberCount })),
        totalDelegates,
      )

      const nominations = event.delegates || []

      const finalizedDelegates = finalizeDelegateSelection(
        nominations.map((d: any) => ({
          id: d.id,
          groupId: d.group?.id || d.group_id || '',
          userId: d.user?.id || d.user_id || '',
          priority: d.priority || 0,
          status: d.status || 'nominated',
        })),
        allocations,
      )

      // --- Execute mutations with Supabase ---

      // 1. Mark event delegates as finalized
      await supabase
        .from('event')
        .update({
          delegates_finalized: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', event.id)

      // 2. Upsert group delegate allocations
      for (const allocation of allocations) {
        await supabase.from('group_delegate_allocation').upsert(
          {
            event_id: event.id,
            group_id: allocation.groupId,
            allocated_delegates: allocation.allocatedDelegates,
            member_count: allocation.memberCount,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'event_id,group_id' },
        )
      }

      // 3. Update delegate statuses
      for (const { id, status } of finalizedDelegates) {
        await supabase
          .from('event_delegate')
          .update({ status, updated_at: new Date().toISOString() })
          .eq('id', id)
      }

      // 4. Send notification
      if (senderId) {
        // Inline notification creation via Supabase instead of the helper
        await supabase.from('notification').insert({
          sender_id: senderId,
          type: 'delegates_finalized',
          title: 'Delegates Finalized',
          message: `Delegates have been finalized for "${event.title || 'Event'}"`,
          action_url: `/event/${event.id}`,
          related_event_id: event.id,
        })
      }

      return { success: true, message: 'Delegates finalized successfully' }
    } catch (error) {
      console.error('Error finalizing delegates:', error)
      throw new Error(
        error instanceof Error ? error.message : 'Failed to finalize delegates',
      )
    }
  })
