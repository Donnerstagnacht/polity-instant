import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath } from '@xyflow/react';
import type { EdgeProps } from '@xyflow/react';
import { RightBadge } from '@/features/network/ui/RightBadge';
import { useEdgeClickContext } from '@/features/network/ui/NetworkFlowBase';

export function RightsLabelEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
  markerEnd,
  data,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  const onEdgeClick = useEdgeClickContext();
  // visibleRights reflects the current filter selection; rights is the full set
  const displayRights = Array.isArray(data?.visibleRights)
    ? (data.visibleRights as string[])
    : Array.isArray(data?.rights)
      ? (data.rights as string[])
      : [];

  const handleLabelClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdgeClick) {
      onEdgeClick(id);
    }
  };

  return (
    <>
      <BaseEdge id={id} path={edgePath} style={style} markerEnd={markerEnd} />
      {displayRights.length > 0 && (
        <EdgeLabelRenderer>
          <button
            type="button"
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="nodrag nopan cursor-pointer"
            onClick={handleLabelClick}
          >
            <div className="flex flex-wrap gap-0.5 rounded-md border border-border/60 bg-background/95 px-1.5 py-1 shadow-sm backdrop-blur-sm">
              {displayRights.map((right) => (
                <RightBadge
                  key={right}
                  right={right}
                  className="px-1.5 py-0.5 text-[10px] leading-tight"
                />
              ))}
            </div>
          </button>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
