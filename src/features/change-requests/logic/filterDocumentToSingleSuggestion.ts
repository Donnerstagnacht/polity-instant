/**
 * Pure function that strips all suggestion marks from a plate-js document
 * EXCEPT those belonging to the specified suggestion IDs.
 *
 * Used for the editor preview inside CR cards:
 * the document shows the current state of the text with only the chosen
 * suggestions highlighted, so the user can focus on those specific changes.
 */
import type { Value, Descendant } from 'platejs';

interface SuggestionMark {
  id?: string;
  type?: string;
}

/**
 * Filter a plate-js document to only show the specified suggestions.
 *
 * All other suggestion marks are "resolved" in their reject direction
 * (i.e. inserted text from other suggestions is removed,
 *  removed text from other suggestions is kept without the mark).
 * The target suggestions are left intact with their marks.
 *
 * @param content - The plate-js document JSON
 * @param targetSuggestionIds - The suggestion IDs to keep
 * @returns A new document Value with only the target suggestions' marks
 */
export function filterDocumentToSuggestions(
  content: Value,
  targetSuggestionIds: Set<string>,
): Value {
  return processNodes(content, targetSuggestionIds) as Value;
}

function processNodes(
  nodes: Descendant[],
  targetIds: Set<string>,
): Descendant[] {
  const result: Descendant[] = [];

  for (const node of nodes) {
    const processed = processNode(node, targetIds);
    result.push(...processed);
  }

  return result;
}

function processNode(
  node: Descendant,
  targetIds: Set<string>,
): Descendant[] {
  const allSuggestionKeys = findAllSuggestionKeys(node);

  if (allSuggestionKeys.length === 0) {
    // Not a suggestion node — recurse into children
    if ('children' in node && Array.isArray(node.children)) {
      const processedChildren = processNodes(node.children, targetIds);
      return [{ ...node, children: processedChildren }];
    }
    return [node];
  }

  // Check if this node has any target suggestion
  const targetKey = allSuggestionKeys.find((key) => {
    const mark = (node as Record<string, unknown>)[key] as SuggestionMark;
    return targetIds.has(mark?.id ?? '');
  });

  // Get keys for non-target suggestions
  const otherKeys = allSuggestionKeys.filter((key) => {
    const mark = (node as Record<string, unknown>)[key] as SuggestionMark;
    return !targetIds.has(mark?.id ?? '');
  });

  // If node has no target suggestion, resolve all other suggestions as "reject"
  // (reject = revert to original: remove inserts, keep removals)
  if (!targetKey) {
    return resolveOtherSuggestions(node, otherKeys);
  }

  // Node has the target suggestion — strip only non-target marks
  let cleaned = { ...node } as Record<string, unknown>;
  for (const otherKey of otherKeys) {
    // For non-target marks, we need to resolve them
    const mark = cleaned[otherKey] as SuggestionMark;
    const type = mark?.type;

    if (type === 'insert') {
      // Another suggestion inserted this text — but we need the text for the target
      // Just strip the non-target mark
      delete cleaned[otherKey];
    } else if (type === 'remove' || type === 'replace') {
      delete cleaned[otherKey];
    } else if (type === 'update') {
      // Revert the non-target update (restore original properties)
      const fullMark = cleaned[otherKey] as SuggestionMark & { properties?: Record<string, unknown> };
      if (fullMark?.properties) {
        cleaned = { ...cleaned, ...fullMark.properties };
      }
      delete cleaned[otherKey];
    } else {
      delete cleaned[otherKey];
    }
  }

  return [cleaned as Descendant];
}

/**
 * Resolve non-target suggestions by "rejecting" them:
 * - insert: remove the text (it was added by a suggestion we don't want)
 * - remove: keep the text, strip the mark
 * - replace: remove the text (replacement we don't want)
 * - update: revert to original properties, strip the mark
 */
function resolveOtherSuggestions(
  node: Descendant,
  otherKeys: string[],
): Descendant[] {
  for (const key of otherKeys) {
    const mark = (node as Record<string, unknown>)[key] as SuggestionMark;
    const type = mark?.type;

    if (type === 'insert') {
      // Reject insert: remove the text entirely
      return [];
    }

    if (type === 'replace') {
      // Reject replace: remove the replacement text
      return [];
    }

    if (type === 'remove') {
      // Reject remove: keep the text, strip the mark
      const cleaned = { ...node } as Record<string, unknown>;
      delete cleaned[key];
      return [cleaned as Descendant];
    }

    if (type === 'update') {
      // Reject update: revert to original properties
      const cleaned = { ...node } as Record<string, unknown>;
      const fullMark = cleaned[key] as SuggestionMark & { properties?: Record<string, unknown> };
      if (fullMark?.properties) {
        Object.assign(cleaned, fullMark.properties);
      }
      delete cleaned[key];
      return [cleaned as Descendant];
    }
  }

  // Unknown type: just strip all marks
  const cleaned = { ...node } as Record<string, unknown>;
  for (const key of otherKeys) {
    delete cleaned[key];
  }
  return [cleaned as Descendant];
}

function findAllSuggestionKeys(node: Descendant): string[] {
  if (!node || typeof node !== 'object') return [];
  return Object.keys(node).filter((k) => k.startsWith('suggestion_'));
}
