'use client';

import * as React from 'react';

interface RemoteCursor {
  id: string;
  name: string;
  color: string;
  position: {
    x: number;
    y: number;
  } | null;
}

interface RemoteCursorOverlayProps {
  cursors: RemoteCursor[];
}

export function RemoteCursorOverlay({ cursors }: RemoteCursorOverlayProps) {
  return (
    <>
      {cursors.map(cursor => {
        if (!cursor.position) return null;

        return (
          <div
            key={cursor.id}
            className="pointer-events-none fixed z-50 transition-all duration-100"
            style={{
              left: `${cursor.position.x}px`,
              top: `${cursor.position.y}px`,
            }}
          >
            {/* Cursor line */}
            <div className="h-5 w-0.5 animate-pulse" style={{ backgroundColor: cursor.color }} />
            {/* Cursor label */}
            <div
              className="mt-1 whitespace-nowrap rounded rounded-bl-none px-1.5 py-0.5 text-xs text-white"
              style={{ backgroundColor: cursor.color }}
            >
              {cursor.name}
            </div>
          </div>
        );
      })}
    </>
  );
}
