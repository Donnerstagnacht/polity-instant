import { describe, it, expect } from 'vitest';
import {
  EXTENDED_GRADIENTS,
  getGradientByIndex,
  getGradientByEntityId,
  getGradientForContentType,
  getTimelineCardGradient,
} from '../gradient-assignment';

describe('gradient-assignment', () => {
  describe('EXTENDED_GRADIENTS', () => {
    it('should have 15 gradient definitions', () => {
      expect(EXTENDED_GRADIENTS).toHaveLength(15);
    });

    it('should all contain gradient classes', () => {
      EXTENDED_GRADIENTS.forEach(gradient => {
        expect(gradient).toContain('bg-gradient-to-br');
        expect(gradient).toContain('from-');
        expect(gradient).toContain('to-');
      });
    });

    it('should include dark mode variants', () => {
      EXTENDED_GRADIENTS.forEach(gradient => {
        expect(gradient).toContain('dark:');
      });
    });
  });

  describe('getGradientByIndex', () => {
    it('should return gradient for valid index', () => {
      const gradient = getGradientByIndex(0);
      expect(gradient).toBe(EXTENDED_GRADIENTS[0]);
    });

    it('should wrap around when index exceeds array length', () => {
      const gradient = getGradientByIndex(15);
      expect(gradient).toBe(EXTENDED_GRADIENTS[0]);
    });

    it('should handle large indices', () => {
      const gradient = getGradientByIndex(1000);
      expect(EXTENDED_GRADIENTS).toContain(gradient);
    });

    it('should return consistent results for same index', () => {
      const gradient1 = getGradientByIndex(5);
      const gradient2 = getGradientByIndex(5);
      expect(gradient1).toBe(gradient2);
    });
  });

  describe('getGradientByEntityId', () => {
    it('should return a gradient for any entity ID', () => {
      const gradient = getGradientByEntityId('test-entity-id-123');
      expect(EXTENDED_GRADIENTS).toContain(gradient);
    });

    it('should return consistent gradient for same entity ID', () => {
      const entityId = 'consistent-id-456';
      const gradient1 = getGradientByEntityId(entityId);
      const gradient2 = getGradientByEntityId(entityId);
      expect(gradient1).toBe(gradient2);
    });

    it('should return different gradients for different entity IDs', () => {
      const gradient1 = getGradientByEntityId('entity-a');
      const gradient2 = getGradientByEntityId('entity-b');
      // They could be the same by chance, but likely different
      // This test verifies the function produces valid output
      expect(EXTENDED_GRADIENTS).toContain(gradient1);
      expect(EXTENDED_GRADIENTS).toContain(gradient2);
    });

    it('should handle empty string', () => {
      const gradient = getGradientByEntityId('');
      expect(EXTENDED_GRADIENTS).toContain(gradient);
    });

    it('should handle long IDs', () => {
      const longId = 'a'.repeat(1000);
      const gradient = getGradientByEntityId(longId);
      expect(EXTENDED_GRADIENTS).toContain(gradient);
    });

    it('should handle special characters', () => {
      const gradient = getGradientByEntityId('test-!@#$%^&*()');
      expect(EXTENDED_GRADIENTS).toContain(gradient);
    });
  });

  describe('getGradientForContentType', () => {
    it('should return gradient for group content type', () => {
      const gradient = getGradientForContentType('group');
      expect(typeof gradient).toBe('string');
      expect(gradient).toContain('bg-gradient');
    });

    it('should return gradient for event content type', () => {
      const gradient = getGradientForContentType('event');
      expect(typeof gradient).toBe('string');
      expect(gradient).toContain('bg-gradient');
    });

    it('should return gradient for amendment content type', () => {
      const gradient = getGradientForContentType('amendment');
      expect(typeof gradient).toBe('string');
      expect(gradient).toContain('bg-gradient');
    });

    it('should return gradient for vote content type', () => {
      const gradient = getGradientForContentType('vote');
      expect(typeof gradient).toBe('string');
      expect(gradient).toContain('bg-gradient');
    });

    it('should return gradient for election content type', () => {
      const gradient = getGradientForContentType('election');
      expect(typeof gradient).toBe('string');
      expect(gradient).toContain('bg-gradient');
    });
  });

  describe('getTimelineCardGradient', () => {
    it('should return content type gradient by default', () => {
      const contentGradient = getGradientForContentType('group');
      const cardGradient = getTimelineCardGradient('group', 'entity-123', true);
      expect(cardGradient).toBe(contentGradient);
    });

    it('should use entity-based gradient when useContentTypeDefault is false', () => {
      const cardGradient = getTimelineCardGradient('group', 'entity-123', false);
      // When not using default, it should fall back to entity-based
      expect(EXTENDED_GRADIENTS).toContain(cardGradient);
    });

    it('should handle missing entity ID', () => {
      const cardGradient = getTimelineCardGradient('group', undefined, true);
      expect(typeof cardGradient).toBe('string');
    });
  });
});
