import { describe, expect, it } from 'vitest';

import { getBaseEventId } from '../eventIdUtils';

describe('getBaseEventId', () => {
  it('returns plain event ids unchanged', () => {
    expect(getBaseEventId('123e4567-e89b-12d3-a456-426614174000')).toBe(
      '123e4567-e89b-12d3-a456-426614174000'
    );
  });

  it('extracts the base id from legacy recurring instances', () => {
    expect(
      getBaseEventId('123e4567-e89b-12d3-a456-426614174000_instance_1741885200000')
    ).toBe('123e4567-e89b-12d3-a456-426614174000');
  });

  it('extracts the base id from rrule recurring instances', () => {
    expect(getBaseEventId('123e4567-e89b-12d3-a456-426614174000_rrule_5')).toBe(
      '123e4567-e89b-12d3-a456-426614174000'
    );
  });
});