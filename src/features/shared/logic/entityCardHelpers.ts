/**
 * Pure functions for entity card display in typeahead and search results.
 */

import { ENTITY_COLORS, type EntityType } from '@/features/shared/utils/entity-colors';
import { Users, Calendar, FileText, BookOpen, User } from 'lucide-react';

/**
 * Returns gradient classes for an entity type card background.
 */
export function getEntityGradient(entityType: EntityType): string {
  const config = ENTITY_COLORS[entityType];
  return `bg-gradient-to-br ${config.gradient} ${config.gradientDark}`;
}

/**
 * Returns the Lucide icon component for an entity type.
 */
export function getEntityIcon(entityType: string) {
  switch (entityType) {
    case 'group':
      return Users;
    case 'event':
      return Calendar;
    case 'amendment':
      return FileText;
    case 'blog':
      return BookOpen;
    case 'user':
      return User;
    default:
      return FileText;
  }
}

/**
 * Format a display label for an entity based on its type.
 */
export function formatEntityLabel(
  entity: { name?: string; title?: string; code?: string; first_name?: string; last_name?: string; handle?: string },
  entityType: string,
): string {
  switch (entityType) {
    case 'user':
      if (entity.first_name || entity.last_name) {
        return [entity.first_name, entity.last_name].filter(Boolean).join(' ');
      }
      return entity.handle || entity.name || 'Unknown User';
    case 'amendment':
      return entity.code || entity.title || entity.name || 'Amendment';
    default:
      return entity.name || entity.title || 'Unknown';
  }
}
