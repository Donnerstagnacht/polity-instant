/**
 * Extract the base event ID from a potentially compound instance ID.
 *
 * Recurring events generate instance IDs like: eventId_instance_timestamp
 * This function extracts the original event UUID for navigation.
 *
 * @param instanceId - The event ID which might be an instance ID
 * @returns The base event UUID
 */
export function getBaseEventId(instanceId: string): string {
  // If the ID contains '_instance_', extract the base UUID
  if (instanceId.includes('_instance_')) {
    return instanceId.split('_instance_')[0];
  }

  // Otherwise return the ID as-is
  return instanceId;
}
