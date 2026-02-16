/**
 * Event Factory
 *
 * Creates events with participants and agenda items for E2E tests.
 */

import { FactoryBase } from './factory-base';
import { adminTransact, tx } from '../admin-db';
import { DEFAULT_EVENT_ROLES } from '../../../db/rbac/constants';

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
  async createEvent(organizerId: string, overrides: CreateEventOptions = {}): Promise<CreatedEvent> {
    this._counter++;
    const eventId = overrides.id ?? this.generateId();
    const title = overrides.title ?? `E2E Event ${this._counter}`;
    const now = new Date();
    const startDate = overrides.startDate ?? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const endDate = overrides.endDate ?? new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString();

    const organizerRoleId = this.generateId();
    const participantRoleId = this.generateId();
    const txns: any[] = [];

    // Create event entity
    const eventTx = tx.events[eventId].update({
      title,
      description: overrides.description ?? `Test event ${this._counter}`,
      startDate,
      endDate,
      isPublic: overrides.isPublic ?? true,
      visibility: overrides.visibility ?? 'public',
      location: overrides.location ?? '',
      status: overrides.status ?? 'upcoming',
      eventType: overrides.eventType ?? 'open_assembly',
      createdAt: now,
      updatedAt: now,
    });

    if (overrides.groupId) {
      txns.push(eventTx.link({ organizer: organizerId, group: overrides.groupId }));
      this.trackLink('events', eventId, 'group', overrides.groupId);
    } else {
      txns.push(eventTx.link({ organizer: organizerId }));
    }
    this.trackEntity('events', eventId);
    this.trackLink('events', eventId, 'organizer', organizerId);

    // Create Organizer role
    const orgTemplate = DEFAULT_EVENT_ROLES.find(r => r.name === 'Organizer');
    txns.push(
      tx.roles[organizerRoleId]
        .update({
          name: 'Organizer',
          description: 'Event organizer with full permissions',
          scope: 'event',
          createdAt: now,
          updatedAt: now,
        })
        .link({ event: eventId })
    );
    this.trackEntity('roles', organizerRoleId);
    this.trackLink('roles', organizerRoleId, 'event', eventId);

    // Create Participant role
    txns.push(
      tx.roles[participantRoleId]
        .update({
          name: 'Participant',
          description: 'Regular event participant',
          scope: 'event',
          createdAt: now,
          updatedAt: now,
        })
        .link({ event: eventId })
    );
    this.trackEntity('roles', participantRoleId);
    this.trackLink('roles', participantRoleId, 'event', eventId);

    // Create action rights for Organizer role
    if (orgTemplate) {
      for (const perm of orgTemplate.permissions) {
        const rightId = this.generateId();
        txns.push(
          tx.actionRights[rightId]
            .update({ resource: perm.resource, action: perm.action })
            .link({ roles: organizerRoleId, event: eventId })
        );
        this.trackEntity('actionRights', rightId);
      }
    }

    // Create action rights for Participant role
    const partTemplate = DEFAULT_EVENT_ROLES.find(r => r.name === 'Participant');
    if (partTemplate) {
      for (const perm of partTemplate.permissions) {
        const rightId = this.generateId();
        txns.push(
          tx.actionRights[rightId]
            .update({ resource: perm.resource, action: perm.action })
            .link({ roles: participantRoleId, event: eventId })
        );
        this.trackEntity('actionRights', rightId);
      }
    }

    // Add organizer as event participant
    const orgParticipantId = this.generateId();
    txns.push(
      tx.eventParticipants[orgParticipantId]
        .update({ status: 'confirmed', createdAt: now, visibility: 'public' })
        .link({ event: eventId, user: organizerId, role: organizerRoleId })
    );
    this.trackEntity('eventParticipants', orgParticipantId);

    await adminTransact(txns);

    return { id: eventId, title, organizerRoleId, participantRoleId };
  }

  /**
   * Add a participant to an event.
   */
  async addParticipant(
    eventId: string,
    userId: string,
    roleId: string,
    status: string = 'confirmed'
  ): Promise<string> {
    const participantId = this.generateId();
    await adminTransact([
      tx.eventParticipants[participantId]
        .update({ status, createdAt: new Date(), visibility: 'public' })
        .link({ event: eventId, user: userId, role: roleId }),
    ]);
    this.trackEntity('eventParticipants', participantId);
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
    const now = new Date();

    const agendaTx = tx.agendaItems[agendaItemId]
      .update({
        title: overrides.title ?? 'Test Agenda Item',
        description: overrides.description ?? '',
        type: overrides.type ?? 'discussion',
        status: overrides.status ?? 'pending',
        order: overrides.order ?? 0,
        createdAt: now,
        updatedAt: now,
      })
      .link({ event: eventId, creator: creatorId });

    const txns: any[] = [agendaTx];

    if (overrides.amendmentId) {
      txns.push(tx.agendaItems[agendaItemId].link({ amendment: overrides.amendmentId }));
    }

    await adminTransact(txns);
    this.trackEntity('agendaItems', agendaItemId);
    return agendaItemId;
  }
}
