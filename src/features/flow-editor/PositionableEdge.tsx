import {
  EdgeLabelRenderer,
  getBezierPath,
  getSmoothStepPath,
  getStraightPath,
  useReactFlow,
} from 'reactflow';

import type { EdgeProps } from 'reactflow';

import ClickableBaseEdge from './ClickableBaseEdge.tsx';
import './PositionableEdge.css';

interface PositionHandler {
  x: number;
  y: number;
  active: boolean;
}

interface PositionableEdgeData {
  type?: 'straight' | 'smoothstep' | 'default';
  positionHandlers?: PositionHandler[];
}

export default function PositionableEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
  label,
}: EdgeProps<PositionableEdgeData>) {
  const reactFlowInstance = useReactFlow();
  const positionHandlers = data?.positionHandlers ?? [];
  const type = data?.type ?? 'default';
  const edgeSegmentsCount = positionHandlers.length + 1;
  const edgeSegmentsArray: { edgePath: string; labelX: number; labelY: number }[] = [];

  let pathFunction;
  switch (type) {
    case 'straight':
      pathFunction = getStraightPath;
      break;
    case 'smoothstep':
      pathFunction = getSmoothStepPath;
      break;
    default:
      pathFunction = getBezierPath;
  }

  // calculate the origin and destination of all the segments
  for (let i = 0; i < edgeSegmentsCount; i++) {
    let segmentSourceX, segmentSourceY, segmentTargetX, segmentTargetY;

    if (i === 0) {
      segmentSourceX = sourceX;
      segmentSourceY = sourceY;
    } else {
      const handler = positionHandlers[i - 1];
      segmentSourceX = handler.x;
      segmentSourceY = handler.y;
    }

    if (i === edgeSegmentsCount - 1) {
      segmentTargetX = targetX;
      segmentTargetY = targetY;
    } else {
      const handler = positionHandlers[i];
      segmentTargetX = handler.x;
      segmentTargetY = handler.y;
    }

    const [edgePath, labelX, labelY] = pathFunction({
      sourceX: segmentSourceX,
      sourceY: segmentSourceY,
      sourcePosition,
      targetX: segmentTargetX,
      targetY: segmentTargetY,
      targetPosition,
    });
    edgeSegmentsArray.push({ edgePath, labelX, labelY });
  }

  const middleSegmentIndex = Math.floor(edgeSegmentsArray.length / 2);
  const { labelX, labelY } = edgeSegmentsArray[middleSegmentIndex];

  return (
    <>
      {edgeSegmentsArray.map(({ edgePath }, index) => (
        <ClickableBaseEdge
          onDoubleClick={event => {
            const position = reactFlowInstance.screenToFlowPosition({
              x: event.clientX,
              y: event.clientY,
            });

            reactFlowInstance.setEdges(edges =>
              edges.map(edge => {
                if (edge.id === id) {
                  const newPositionHandlers = [...(edge.data?.positionHandlers ?? [])];
                  newPositionHandlers.splice(index, 0, {
                    x: position.x,
                    y: position.y,
                    active: false,
                  });
                  return {
                    ...edge,
                    data: {
                      ...edge.data,
                      positionHandlers: newPositionHandlers,
                    },
                  };
                }
                return edge;
              })
            );
          }}
          key={`edge${id}_segment${index}`}
          id={`edge${id}_segment${index}`}
          path={edgePath}
          markerEnd={index === edgeSegmentsArray.length - 1 ? markerEnd : undefined}
          style={style}
        />
      ))}
      {label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              background: 'white',
              padding: '2px 5px',
              borderRadius: 4,
              fontSize: 12,
              fontWeight: 700,
              pointerEvents: 'all',
              border: '1px solid #ddd',
            }}
            className="nodrag nopan"
          >
            {label}
          </div>
        </EdgeLabelRenderer>
      )}
      {positionHandlers.map(({ x, y, active }, handlerIndex) => (
        <EdgeLabelRenderer key={`edge${id}_handler${handlerIndex}`}>
          <div
            className="nopan positionHandlerContainer"
            style={{
              transform: `translate(-50%, -50%) translate(${x}px,${y}px)`,
            }}
          >
            <div
              className={`positionHandlerEventContainer ${active ? 'active' : ''}`}
              onMouseMove={event => {
                if (!active) {
                  return;
                }
                const position = reactFlowInstance.screenToFlowPosition({
                  x: event.clientX,
                  y: event.clientY,
                });
                reactFlowInstance.setEdges(edges =>
                  edges.map(edge => {
                    if (edge.id === id) {
                      const newPositionHandlers = [...(edge.data?.positionHandlers ?? [])];
                      newPositionHandlers[handlerIndex] = {
                        ...newPositionHandlers[handlerIndex],
                        x: position.x,
                        y: position.y,
                      };
                      return {
                        ...edge,
                        data: {
                          ...edge.data,
                          positionHandlers: newPositionHandlers,
                        },
                      };
                    }
                    return edge;
                  })
                );
              }}
              onMouseUp={() => {
                reactFlowInstance.setEdges(edges =>
                  edges.map(edge => {
                    if (edge.data?.positionHandlers) {
                      const newPositionHandlers = edge.data.positionHandlers.map(
                        (h: PositionHandler) => ({
                          ...h,
                          active: false,
                        })
                      );
                      return {
                        ...edge,
                        data: {
                          ...edge.data,
                          positionHandlers: newPositionHandlers,
                        },
                      };
                    }
                    return edge;
                  })
                );
              }}
            >
              <button
                className="positionHandler"
                onMouseDown={() => {
                  reactFlowInstance.setEdges(edges =>
                    edges.map(edge => {
                      if (edge.id === id) {
                        const newPositionHandlers = [...(edge.data?.positionHandlers ?? [])];
                        newPositionHandlers[handlerIndex] = {
                          ...newPositionHandlers[handlerIndex],
                          active: true,
                        };
                        return {
                          ...edge,
                          data: {
                            ...edge.data,
                            positionHandlers: newPositionHandlers,
                          },
                        };
                      }
                      return edge;
                    })
                  );
                }}
                onContextMenu={event => {
                  event.preventDefault();
                  reactFlowInstance.setEdges(edges =>
                    edges.map(edge => {
                      if (edge.id === id) {
                        const newPositionHandlers = [...(edge.data?.positionHandlers ?? [])];
                        newPositionHandlers.splice(handlerIndex, 1);
                        return {
                          ...edge,
                          data: {
                            ...edge.data,
                            positionHandlers: newPositionHandlers,
                          },
                        };
                      }
                      return edge;
                    })
                  );
                }}
              ></button>
            </div>
          </div>
        </EdgeLabelRenderer>
      ))}
    </>
  );
}
