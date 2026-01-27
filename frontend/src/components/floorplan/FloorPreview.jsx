import React from "react";
import { Stage, Layer, Rect, Line, Group, Text } from "react-konva";

/**
 * Floor Preview - Shows the entire floor as a cohesive floor plan
 * Displays the whole floor outline with rooms positioned within it
 */
function FloorPreview({ floor, width = 260, height = 160 }) {
  const WALL_THICKNESS = 8;
  const FLOOR_STROKE = "#1F2937"; // dark gray
  const FLOOR_FILL = "#FFFFFF"; // white
  const ROOM_FILL = "#F9FAFB"; // very light gray
  const ROOM_STROKE = "#6B7280"; // medium gray
  const INTERNAL_WALL_STROKE = "#D1D5DB"; // light gray

  // If no floor data, show empty state
  if (!floor) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded">
        <p className="text-xs text-gray-400">No floor data</p>
      </div>
    );
  }

  const rooms = floor.rooms || [];
  const roomCount = rooms.length;

  // Calculate floor dimensions (scaled to fit preview)
  const floorWidth = width - WALL_THICKNESS * 2;
  const floorHeight = height - WALL_THICKNESS * 2;

  // If we have room data with actual positions, use them
  // Otherwise, create a realistic layout based on room count
  const hasRoomPositions = rooms.some(r => r.x !== undefined && r.y !== undefined);

  let roomLayouts = [];

  if (hasRoomPositions && rooms.length > 0) {
    // Use actual room positions if available
    const minX = Math.min(...rooms.map(r => r.x || 0));
    const minY = Math.min(...rooms.map(r => r.y || 0));
    const maxX = Math.max(...rooms.map(r => (r.x || 0) + (r.width || 100)));
    const maxY = Math.max(...rooms.map(r => (r.y || 0) + (r.height || 100)));

    const scaleX = floorWidth / (maxX - minX || 1);
    const scaleY = floorHeight / (maxY - minY || 1);
    const scale = Math.min(scaleX, scaleY) * 0.9; // 90% to add padding

    roomLayouts = rooms.map(room => ({
      x: WALL_THICKNESS + (room.x - minX) * scale,
      y: WALL_THICKNESS + (room.y - minY) * scale,
      width: (room.width || 100) * scale,
      height: (room.height || 100) * scale,
    }));
  } else {
    // Create a realistic floor layout based on room count
    if (roomCount === 0) {
      // Empty floor - just show the outline
      roomLayouts = [];
    } else if (roomCount === 1) {
      // Single large room
      roomLayouts = [{
        x: WALL_THICKNESS + 10,
        y: WALL_THICKNESS + 10,
        width: floorWidth - 20,
        height: floorHeight - 20,
      }];
    } else if (roomCount === 2) {
      // Two rooms side by side
      roomLayouts = [
        {
          x: WALL_THICKNESS + 10,
          y: WALL_THICKNESS + 10,
          width: (floorWidth - 30) / 2,
          height: floorHeight - 20,
        },
        {
          x: WALL_THICKNESS + 20 + (floorWidth - 30) / 2,
          y: WALL_THICKNESS + 10,
          width: (floorWidth - 30) / 2,
          height: floorHeight - 20,
        },
      ];
    } else if (roomCount === 3) {
      // L-shaped or T-shaped layout
      roomLayouts = [
        {
          x: WALL_THICKNESS + 10,
          y: WALL_THICKNESS + 10,
          width: (floorWidth - 30) / 2,
          height: floorHeight - 20,
        },
        {
          x: WALL_THICKNESS + 20 + (floorWidth - 30) / 2,
          y: WALL_THICKNESS + 10,
          width: (floorWidth - 30) / 2,
          height: (floorHeight - 30) / 2,
        },
        {
          x: WALL_THICKNESS + 20 + (floorWidth - 30) / 2,
          y: WALL_THICKNESS + 20 + (floorHeight - 30) / 2,
          width: (floorWidth - 30) / 2,
          height: (floorHeight - 30) / 2,
        },
      ];
    } else if (roomCount === 8) {
      // Specific layout for 8 rooms: 2 rows x 4 columns with central corridor
      const cols = 4;
      const rows = 2;
      const corridorHeight = 12; // Central corridor space
      const wallGap = 8;
      const padding = 12;
      const cellW = (floorWidth - padding * 2 - (cols - 1) * wallGap) / cols;
      const cellH = (floorHeight - padding * 2 - corridorHeight - (rows - 1) * wallGap) / rows;

      roomLayouts = Array.from({ length: 8 }).map((_, idx) => {
        const r = Math.floor(idx / cols);
        const c = idx % cols;
        const yOffset = r === 1 ? corridorHeight : 0; // Bottom row has corridor above it
        return {
          x: WALL_THICKNESS + padding + c * (cellW + wallGap),
          y: WALL_THICKNESS + padding + r * (cellH + wallGap) + yOffset,
          width: cellW,
          height: cellH,
          label: `room${idx + 1}`,
        };
      });
    } else {
      // Multiple rooms - create a grid-like but realistic layout
      const cols = Math.ceil(Math.sqrt(roomCount));
      const rows = Math.ceil(roomCount / cols);
      const wallGap = 5;
      const padding = 10;
      const cellW = (floorWidth - padding * 2 - (cols - 1) * wallGap) / cols;
      const cellH = (floorHeight - padding * 2 - (rows - 1) * wallGap) / rows;

      roomLayouts = Array.from({ length: roomCount }).map((_, idx) => {
        const r = Math.floor(idx / cols);
        const c = idx % cols;
        return {
          x: WALL_THICKNESS + padding + c * (cellW + wallGap),
          y: WALL_THICKNESS + padding + r * (cellH + wallGap),
          width: cellW,
          height: cellH,
        };
      });
    }
  }

  return (
    <div className="w-full h-full bg-gray-50 rounded overflow-hidden">
      <Stage width={width} height={height}>
        <Layer>
          {/* Outer floor boundary - the whole floor */}
          <Rect
            x={WALL_THICKNESS / 2}
            y={WALL_THICKNESS / 2}
            width={floorWidth}
            height={floorHeight}
            fill={FLOOR_FILL}
            stroke={FLOOR_STROKE}
            strokeWidth={WALL_THICKNESS}
            cornerRadius={roomCount === 8 ? 8 : 4}
            shadowBlur={2}
            shadowColor="rgba(0,0,0,0.1)"
          />

          {/* Internal walls between rooms - draw all walls systematically */}
          {roomLayouts.length > 1 && (() => {
            const walls = [];
            // Determine grid layout based on room count
            let cols, rows;
            if (roomCount === 8) {
              cols = 4;
              rows = 2;
              const corridorHeight = 12;
              const wallGap = 8;
              const padding = 12;
              const cellW = (floorWidth - padding * 2 - (cols - 1) * wallGap) / cols;
              const cellH = (floorHeight - padding * 2 - corridorHeight - (rows - 1) * wallGap) / rows;
              
              // Draw vertical walls (between columns) - full height
              for (let c = 0; c < cols - 1; c++) {
                const x = WALL_THICKNESS + padding + (c + 1) * (cellW + wallGap);
                walls.push(
                  <Line
                    key={`wall-v-${c}`}
                    points={[x, WALL_THICKNESS, x, height - WALL_THICKNESS]}
                    stroke={FLOOR_STROKE}
                    strokeWidth={8}
                    lineCap="round"
                  />
                );
              }
              
              // Draw central horizontal corridor wall
              const corridorY = WALL_THICKNESS + padding + cellH + wallGap / 2;
              walls.push(
                <Line
                  key="wall-h-corridor"
                  points={[WALL_THICKNESS, corridorY, width - WALL_THICKNESS, corridorY]}
                  stroke={FLOOR_STROKE}
                  strokeWidth={8}
                  lineCap="round"
                />
              );
            } else {
              cols = Math.ceil(Math.sqrt(roomCount));
              rows = Math.ceil(roomCount / cols);

              // Draw vertical walls (between columns)
              for (let c = 0; c < cols - 1; c++) {
                const x = roomLayouts[c].x + roomLayouts[c].width;
                const minY = Math.min(...roomLayouts.filter((_, idx) => idx % cols === c).map(r => r.y));
                const maxY = Math.max(...roomLayouts.filter((_, idx) => idx % cols === c).map(r => r.y + r.height));
                walls.push(
                  <Line
                    key={`wall-v-${c}`}
                    points={[x, minY, x, maxY]}
                    stroke={INTERNAL_WALL_STROKE}
                    strokeWidth={4}
                    lineCap="round"
                  />
                );
              }

              // Draw horizontal walls (between rows)
              for (let r = 0; r < rows - 1; r++) {
                const y = roomLayouts[r * cols].y + roomLayouts[r * cols].height;
                const minX = Math.min(...roomLayouts.filter((_, idx) => Math.floor(idx / cols) === r).map(room => room.x));
                const maxX = Math.max(...roomLayouts.filter((_, idx) => Math.floor(idx / cols) === r).map(room => room.x + room.width));
                walls.push(
                  <Line
                    key={`wall-h-${r}`}
                    points={[minX, y, maxX, y]}
                    stroke={INTERNAL_WALL_STROKE}
                    strokeWidth={4}
                    lineCap="round"
                  />
                );
              }
            }

            return walls;
          })()}

          {/* Rooms inside the floor */}
          {roomLayouts.map((layout, idx) => (
            <Group key={idx}>
              <Rect
                x={layout.x}
                y={layout.y}
                width={layout.width}
                height={layout.height}
                fill={ROOM_FILL}
                stroke={ROOM_STROKE}
                strokeWidth={2}
                cornerRadius={2}
              />
              {/* Room labels for 8-room layout */}
              {layout.label && (
                <Text
                  x={layout.x + layout.width / 2}
                  y={layout.y + layout.height / 2}
                  text={layout.label}
                  fontSize={10}
                  fill="#6B7280"
                  align="center"
                  verticalAlign="middle"
                  width={layout.width}
                  offsetX={layout.width / 2}
                  offsetY={5}
                />
              )}
            </Group>
          ))}
        </Layer>
      </Stage>
    </div>
  );
}

export default FloorPreview;
