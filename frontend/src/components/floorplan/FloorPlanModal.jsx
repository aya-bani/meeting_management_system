import React from "react";
import { Stage, Layer, Rect, Line, Group, Text } from "react-konva";

/**
 * Expanded Floor Plan Modal - Shows full-size floor plan when clicked
 */
function FloorPlanModal({ floor, isOpen, onClose }) {
  if (!isOpen || !floor) return null;

  const width = 1000;
  const height = 700;
  const WALL_THICKNESS = 12;
  const FLOOR_STROKE = "#1F2937";
  const FLOOR_FILL = "#FFFFFF";
  const ROOM_FILL = "#F9FAFB";
  const ROOM_STROKE = "#6B7280";

  const rooms = floor.rooms || [];
  const roomCount = rooms.length;
  const floorWidth = width - WALL_THICKNESS * 2;
  const floorHeight = height - WALL_THICKNESS * 2;

  let roomLayouts = [];

  if (roomCount === 8) {
    const cols = 4;
    const rows = 2;
    const corridorHeight = 20;
    const wallGap = 12;
    const padding = 20;
    const cellW = (floorWidth - padding * 2 - (cols - 1) * wallGap) / cols;
    const cellH = (floorHeight - padding * 2 - corridorHeight - (rows - 1) * wallGap) / rows;

    roomLayouts = Array.from({ length: 8 }).map((_, idx) => {
      const r = Math.floor(idx / cols);
      const c = idx % cols;
      const yOffset = r === 1 ? corridorHeight : 0;
      return {
        x: WALL_THICKNESS + padding + c * (cellW + wallGap),
        y: WALL_THICKNESS + padding + r * (cellH + wallGap) + yOffset,
        width: cellW,
        height: cellH,
        label: `room${idx + 1}`,
        roomData: rooms[idx] || null,
      };
    });
  }

  return (
    <div
      className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white border border-slate-200 rounded-xl shadow-2xl p-8 max-w-6xl w-full mx-4 max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-2xl font-bold text-slate-800">{floor.name}</h3>
            <p className="text-sm text-slate-600 mt-1">
              {roomCount} rooms • Click outside to close
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 transition-colors"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <Stage width={width} height={height}>
            <Layer>
              {/* Outer floor boundary */}
              <Rect
                x={WALL_THICKNESS / 2}
                y={WALL_THICKNESS / 2}
                width={floorWidth}
                height={floorHeight}
                fill={FLOOR_FILL}
                stroke={FLOOR_STROKE}
                strokeWidth={WALL_THICKNESS}
                cornerRadius={8}
                shadowBlur={4}
                shadowColor="rgba(0,0,0,0.15)"
              />

              {/* Internal walls for 8 rooms */}
              {roomCount === 8 && (
                <>
                  {/* Vertical walls */}
                  {[1, 2, 3].map((col) => {
                    const corridorHeight = 20;
                    const wallGap = 12;
                    const padding = 20;
                    const cellW = (floorWidth - padding * 2 - 3 * wallGap) / 4;
                    const x = WALL_THICKNESS + padding + col * (cellW + wallGap);
                    return (
                      <Line
                        key={`wall-v-${col}`}
                        points={[x, WALL_THICKNESS, x, height - WALL_THICKNESS]}
                        stroke={FLOOR_STROKE}
                        strokeWidth={WALL_THICKNESS}
                        lineCap="round"
                      />
                    );
                  })}

                  {/* Central horizontal corridor wall */}
                  {(() => {
                    const corridorHeight = 20;
                    const wallGap = 12;
                    const padding = 20;
                    const cellH = (floorHeight - padding * 2 - corridorHeight - wallGap) / 2;
                    const y = WALL_THICKNESS + padding + cellH + wallGap / 2;
                    return (
                      <Line
                        key="wall-h-corridor"
                        points={[WALL_THICKNESS, y, width - WALL_THICKNESS, y]}
                        stroke={FLOOR_STROKE}
                        strokeWidth={WALL_THICKNESS}
                        lineCap="round"
                      />
                    );
                  })()}
                </>
              )}

              {/* Rooms */}
              {roomLayouts.map((layout, idx) => (
                <Group key={idx}>
                  <Rect
                    x={layout.x}
                    y={layout.y}
                    width={layout.width}
                    height={layout.height}
                    fill={ROOM_FILL}
                    stroke={ROOM_STROKE}
                    strokeWidth={3}
                    cornerRadius={4}
                  />
                  {/* Room label */}
                  {layout.label && (
                    <Text
                      x={layout.x + layout.width / 2}
                      y={layout.y + layout.height / 2 - 10}
                      text={layout.label}
                      fontSize={16}
                      fill="#6B7280"
                      align="center"
                      verticalAlign="middle"
                      width={layout.width}
                      offsetX={layout.width / 2}
                      offsetY={8}
                    />
                  )}
                  {/* Room name if available */}
                  {layout.roomData?.name && (
                    <Text
                      x={layout.x + layout.width / 2}
                      y={layout.y + layout.height / 2 + 10}
                      text={layout.roomData.name}
                      fontSize={14}
                      fontStyle="bold"
                      fill="#374151"
                      align="center"
                      verticalAlign="middle"
                      width={layout.width}
                      offsetX={layout.width / 2}
                      offsetY={8}
                    />
                  )}
                </Group>
              ))}
            </Layer>
          </Stage>
        </div>
      </div>
    </div>
  );
}

export default FloorPlanModal;

