/**
 * Event Factory
 *
 * Creates events with participants and agenda items for E2E tests.
 */

import { FactoryBase } from './factory-base';
import { adminUpsert } from '../admin-db';
import { DEFAULT_EVENT_ROLES } from '../../../src/zero/rbac/constants';

export interface CreateEventOptions {
  id?: string;
  title?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  isPublic?: boolean;
  visibility?: string;
  location?: string;
  status?: string;
  eventType?: string;
  groupId?: string;
}

export interface CreatedEvent {
  id: string;
  title: string;
  organizerRoleId: string;
  participantRoleId: string;
}

export class EventFactory extends FactoryBase {
  private _counter = 0;

  /**
   * Create an event with Organizer + Participant roles,
   * action rights, and the organizer as a participant.
   */
  async createEvent(
    organizerId: string,
    overrides: CreateEventOptions = {}
  ): Promise<CreatedEvent> {
    this._counter++;
    const eventId = overrides.id ?? this.generateId();
    const title = overrides.title ?? `E2E Event ${this._counter}`;
    const now = new Date().toISOString();
    const startDate =
      overrides.startDate ?? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const endDate =
      overrides.endDate ?? new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString();

    const organizerRoleId = this.generateId();
    const participantRoleId = this.generateId();

    // Create event entity
    await adminUpsert('event', {
      id: eventId,
      title,
      description: overrides.description ?? `Test event ${this._counter}`,
      start_date: startDate,
      end_date: endDate,
      is_public: overrides.isPublic ?? true,
      visibility: overrides.visibility ?? 'public',
      status: overrides.status ?? 'upcoming',
      event_type: overrides.eventType ?? 'open',
      group_id: overrides.groupId ?? null,
      creator_id: organizerId,
      created_at: now,
      updated_at: now,
    });
    this.trackEntity('event', eventId);

    // Create Organizer role
    await adminUpsert('role', {
      id: organizerRoleId,
      name: 'Organizer',
      description: 'Event organizer with full permissions',
      scope: 'event',
      event_id: eventId,
      created_at: now,
    });
    this.trackEntity('role', organizerRoleId);

    // Create Participant role
    await adminUpsert('role', {
      id: participantRoleId,
      name: 'Participant',
      description: 'Regular event participant',
      scope: 'event',
      event_id: eventId,
      created_at: now,
    });
    this.trackEntity('role', participantRoleId);

    // Create action rights for Organizer role
    const orgTemplate = DEFAULT_EVENT_ROLES.find(r => r.name === 'Organizer');
    if (orgTemplate) {
      const rights = orgTemplate.permissions.map(perm => {
        const rightId = this.generateId();
        this.trackEntity('action_right', rightId);
        return {
          id: rightId,
          resource: perm.resource,
          action: perm.action,
          role_id: organizerRoleId,
          event_id: eventId,
        };
      });
      await adminUpsert('action_right', rights);
    }

    // Create action rights for Participant role
    const partTemplate = DEFAULT_EVENT_ROLES.find(r => r.name === 'Participant');
    if (partTemplate) {
      const rights = partTemplate.permissions.map(perm => {
        const rightId = this.generateId();
        this.trackEntity('action_right', rightId);
        return {
          id: rightId,
          resource: perm.resource,
          action: perm.action,
          role_id: participantRoleId,
          event_id: eventId,
        };
      });
      await adminUpsert('action_right', rights);
    }

    // Add organizer as event participant
    const orgParticipantId = this.generateId();
    await adminUpsert('event_participant', {
      id: orgParticipantId,
      event_id: eventId,
      user_id: organizerId,
      role_id: organizerRoleId,
      status: 'confirmed',
      visibility: 'public',
      created_at: now,
    });
    this.trackEntity('event_participant', orgParticipantId);

    return { id: eventId, title, organizerRoleId, participantRoleId };
  }

  /**
   * Add a participant to an event.
   */
  async addParticipant(
    eventId: string,
    userId: string,
    roleId: string,
    status = 'confirmed'
  ): Promise<string> {
    const participantId = this.generateId();
    await adminUpsert('event_participant', {
      id: participantId,
      event_id: eventId,
      user_id: userId,
      role_id: roleId,
      status,
      visibility: 'public',
      created_at: new Date().toISOString(),
    });
    this.trackEntity('event_participant', participantId);
    return participantId;
  }

  /**
   * Create an agenda item for an event.
   */
  async createAgendaItem(
    eventId: string,
    creatorId: string,
    overrides: {
      id?: string;
      title?: string;
      description?: string;
      type?: string;
      status?: string;
      order?: number;
      amendmentId?: string;
    } = {}
  ): Promise<string> {
    const agendaItemId = overrides.id ?? this.generateId();
    const now = new Date().toISOString();

    await adminUpsert('agenda_item', {
      id: agendaItemId,
      event_id: eventId,
      creator_id: creatorId,
      amendment_id: overrides.amendmentId ?? null,
      title: overrides.title ?? 'Test Agenda Item',
      description: overrides.description ?? '',
      type: overrides.type ?? 'discussion',
      status: overrides.status ?? 'pending',
      order_index: overrides.order ?? 0,
      created_at: now,
      updated_at: now,
    });
    this.trackEntity('agenda_item', agendaItemId);
    return agendaItemId;
  }
}
