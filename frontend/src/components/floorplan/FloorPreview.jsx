import React from "react";

/**
 * Minimal top-down floor preview drawn with SVG.
 * Uses only the number of rooms to partition the space.
 */
function FloorPreview({ roomCount = 0, width = 260, height = 160 }) {
  const WALL_THICKNESS = 6;
  const ROOM_STROKE = "#111827"; // dark gray
  const ROOM_FILL = "#F9FAFB"; // very light gray

  const rooms = Math.max(roomCount, 1);

  // Simple grid layout: up to 4 rooms per row
  const cols = Math.min(rooms, 4);
  const rows = Math.ceil(rooms / cols);

  const innerWidth = width - WALL_THICKNESS * 2;
  const innerHeight = height - WALL_THICKNESS * 2;

  const cellW = innerWidth / cols;
  const cellH = innerHeight / rows;

  const roomRects = Array.from({ length: rooms }).map((_, idx) => {
    const r = Math.floor(idx / cols);
    const c = idx % cols;
    return {
      id: idx,
      x: WALL_THICKNESS + c * cellW + 2,
      y: WALL_THICKNESS + r * cellH + 2,
      w: cellW - 4,
      h: cellH - 4,
    };
  });

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      height="100%"
      role="img"
      aria-label="Floor layout preview"
    >
      {/* Outer wall */}
      <rect
        x={WALL_THICKNESS / 2}
        y={WALL_THICKNESS / 2}
        width={width - WALL_THICKNESS}
        height={height - WALL_THICKNESS}
        fill="#FFFFFF"
        stroke={ROOM_STROKE}
        strokeWidth={WALL_THICKNESS}
      />

      {/* Rooms (subdivisions) */}
      {roomRects.map((room) => (
        <rect
          key={room.id}
          x={room.x}
          y={room.y}
          width={room.w}
          height={room.h}
          fill={ROOM_FILL}
          stroke={ROOM_STROKE}
          strokeWidth={2}
        />
      ))}
    </svg>
  );
}

export default FloorPreview;


