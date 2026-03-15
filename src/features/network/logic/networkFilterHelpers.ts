import type { Edge, Node } from '@xyflow/react';

/**
 * Filter edges by selected right types. Edges without rights data (e.g. member edges)
 * are always kept. Returns filtered edges with updated rights data for the custom edge renderer.
 */
export function filterEdgesByRights(
  edges: Edge[],
  selectedRights: Set<string>,
  alwaysShowEdgeIds?: Set<string>,
): Edge[] {
  return edges
    .map(edge => {
      if (alwaysShowEdgeIds?.has(edge.id)) return edge;

      if (!edge.data?.rights) return edge;

      const rights = edge.data.rights as string[];
      if (rights.length === 0) return edge; // Member edges

      const visibleRights = rights.filter(right => selectedRights.has(right));

      if (visibleRights.length === 0) return null;

      if (visibleRights.length === rights.length) return edge;

      return {
        ...edge,
        data: { ...edge.data, visibleRights },
      };
    })
    .filter((edge): edge is Edge => edge !== null);
}

/**
 * Filter nodes to only show those connected via visible edges.
 * Nodes listed in alwaysIncludeIds are always kept.
 */
export function filterNodesByEdges<T extends Node>(
  nodes: T[],
  edges: Edge[],
  alwaysIncludeIds: string[],
): T[] {
  const connectedNodeIds = new Set<string>(alwaysIncludeIds);

  edges.forEach(edge => {
    connectedNodeIds.add(edge.source);
    connectedNodeIds.add(edge.target);
  });

  return nodes.filter(node => connectedNodeIds.has(node.id));
}
