import React from 'react';

interface ClickableBaseEdgeProps {
  id: string;
  path: string;
  style?: React.CSSProperties;
  markerEnd?: string;
  markerStart?: string;
  interactionWidth?: number;
  onClick?: (event: React.MouseEvent) => void;
  onDoubleClick?: (event: React.MouseEvent) => void;
}

const ClickableBaseEdge = ({
  id,
  path,
  style,
  markerEnd,
  markerStart,
  interactionWidth = 20,
  onClick,
  onDoubleClick,
}: ClickableBaseEdgeProps) => {
  return (
    <>
      <path
        id={id}
        style={style}
        d={path}
        fill="none"
        className="react-flow__edge-path"
        markerEnd={markerEnd}
        markerStart={markerStart}
      />
      {interactionWidth && (
        <path
          d={path}
          fill="none"
          strokeOpacity={0}
          strokeWidth={interactionWidth}
          className="react-flow__edge-interaction"
          onClick={onClick}
          onDoubleClick={onDoubleClick}
        />
      )}
    </>
  );
};

ClickableBaseEdge.displayName = 'BaseEdge';

export default ClickableBaseEdge;
