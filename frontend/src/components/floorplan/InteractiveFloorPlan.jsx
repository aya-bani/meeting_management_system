import React, { useRef, useState } from "react";
import { Stage, Layer, Rect, Text, Group, Line } from "react-konva";

/**
 * Interactive 2D Floor Plan using Konva.js
 * Features: Zoom, Pan, Click to select rooms, Professional styling, Room availability
 */
function InteractiveFloorPlan({ 
  rooms = [], 
  selectedRoom, 
  onRoomSelect, 
  width = 800, 
  height = 600,
  roomAvailability = {} // { roomId: boolean } - optional availability map
}) {
  const stageRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const WALL_THICKNESS = 10;
  const ROOM_PADDING = 8;
  const MIN_SCALE = 0.5;
  const MAX_SCALE = 3;

  // Calculate room layout - optimized for 8 rooms (2x4 grid)
  const roomCount = rooms.length || 1;
  // For 8 rooms, use 4 columns x 2 rows layout
  const cols = roomCount === 8 ? 4 : Math.min(roomCount, 4);
  const rows = Math.ceil(roomCount / cols);
  const innerWidth = width - WALL_THICKNESS * 2;
  const innerHeight = height - WALL_THICKNESS * 2;
  const wallGap = 8;
  const cellW = (innerWidth - (cols - 1) * wallGap) / cols;
  const cellH = (innerHeight - (rows - 1) * wallGap) / rows;

  // Handle wheel zoom
  const handleWheel = (e) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    const oldScale = scale;
    const pointer = stage.getPointerPosition();

    const mousePointTo = {
      x: (pointer.x - position.x) / oldScale,
      y: (pointer.y - position.y) / oldScale,
    };

    const newScale = e.evt.deltaY > 0 ? oldScale * 0.95 : oldScale * 1.05;
    const clampedScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, newScale));

    setScale(clampedScale);
    setPosition({
      x: pointer.x - mousePointTo.x * clampedScale,
      y: pointer.y - mousePointTo.y * clampedScale,
    });
  };

  // Handle drag start
  const handleDragStart = () => {
    setIsDragging(true);
  };

  // Handle drag end
  const handleDragEnd = (e) => {
    setIsDragging(false);
    const newPos = {
      x: e.target.x(),
      y: e.target.y(),
    };
    setPosition(newPos);
  };

  // Reset zoom and pan
  const resetView = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  if (rooms.length === 0) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px] text-gray-500 bg-gray-50 rounded-lg">
        <div className="text-center">
          <svg
            className="w-16 h-16 mx-auto mb-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
          <p>No rooms available on this floor</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
      {/* Controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <button
          onClick={resetView}
          className="px-3 py-2 bg-white rounded-lg shadow-md hover:bg-gray-50 text-sm font-medium text-gray-700 border border-gray-200"
          title="Reset view"
        >
          Reset View
        </button>
        <div className="px-3 py-2 bg-white rounded-lg shadow-md text-sm font-medium text-gray-700 border border-gray-200">
          Zoom: {Math.round(scale * 100)}%
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute top-4 left-4 z-10 px-3 py-2 bg-blue-50 rounded-lg shadow-md text-xs text-blue-700 border border-blue-200">
        <p>🖱️ Scroll to zoom | 🖱️ Drag to pan | Click room to select</p>
      </div>

      <Stage
        width={width}
        height={height}
        onWheel={handleWheel}
        ref={stageRef}
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        x={position.x}
        y={position.y}
        scaleX={scale}
        scaleY={scale}
        style={{ cursor: isDragging ? "grabbing" : "grab" }}
      >
        <Layer>
          {/* Outer wall */}
          <Rect
            x={WALL_THICKNESS / 2}
            y={WALL_THICKNESS / 2}
            width={width - WALL_THICKNESS}
            height={height - WALL_THICKNESS}
            fill="#FFFFFF"
            stroke="#1F2937"
            strokeWidth={WALL_THICKNESS}
            shadowBlur={4}
            shadowColor="rgba(0,0,0,0.1)"
          />

          {/* Internal walls - draw grid walls for 8 rooms */}
          {roomCount === 8 && (
            <>
              {/* Vertical walls */}
              {[1, 2, 3].map(col => (
                <Line
                  key={`wall-v-${col}`}
                  points={[
                    WALL_THICKNESS + col * (cellW + wallGap),
                    WALL_THICKNESS,
                    WALL_THICKNESS + col * (cellW + wallGap),
                    height - WALL_THICKNESS,
                  ]}
                  stroke="#D1D5DB"
                  strokeWidth={6}
                  lineCap="round"
                />
              ))}
              {/* Horizontal wall */}
              <Line
                key="wall-h-1"
                points={[
                  WALL_THICKNESS,
                  WALL_THICKNESS + cellH + wallGap / 2,
                  width - WALL_THICKNESS,
                  WALL_THICKNESS + cellH + wallGap / 2,
                ]}
                stroke="#D1D5DB"
                strokeWidth={6}
                lineCap="round"
              />
            </>
          )}

          {/* Rooms */}
          {rooms.map((room, idx) => {
            const r = Math.floor(idx / cols);
            const c = idx % cols;
            const x = WALL_THICKNESS + c * (cellW + wallGap) + ROOM_PADDING;
            const y = WALL_THICKNESS + r * (cellH + wallGap) + ROOM_PADDING;
            const w = cellW - ROOM_PADDING * 2;
            const h = cellH - ROOM_PADDING * 2;
            const isSelected = selectedRoom?._id === room._id;
            const isAvailable = roomAvailability[room._id] !== false; // Default to available if not specified

            // Color scheme based on selection and availability
            const fillColor = isSelected 
              ? "#DBEAFE" 
              : isAvailable 
              ? "#F0FDF4" 
              : "#FEF2F2";
            const strokeColor = isSelected 
              ? "#3B82F6" 
              : isAvailable 
              ? "#22C55E" 
              : "#EF4444";
            const textColor = isSelected 
              ? "#1E40AF" 
              : isAvailable 
              ? "#166534" 
              : "#991B1B";

            return (
              <Group key={room._id} onClick={() => onRoomSelect(room)}>
                {/* Room rectangle */}
                <Rect
                  x={x}
                  y={y}
                  width={w}
                  height={h}
                  fill={fillColor}
                  stroke={strokeColor}
                  strokeWidth={isSelected ? 4 : 3}
                  cornerRadius={8}
                  shadowBlur={isSelected ? 10 : 4}
                  shadowColor={isSelected ? "rgba(59, 130, 246, 0.4)" : "rgba(0,0,0,0.15)"}
                  onMouseEnter={(e) => {
                    const stage = e.target.getStage();
                    stage.container().style.cursor = "pointer";
                    // Slight scale on hover
                    e.target.scale({ x: 1.02, y: 1.02 });
                  }}
                  onMouseLeave={(e) => {
                    const stage = e.target.getStage();
                    stage.container().style.cursor = "grab";
                    e.target.scale({ x: 1, y: 1 });
                  }}
                />

                {/* Availability indicator dot */}
                <Rect
                  x={x + w - 20}
                  y={y + 8}
                  width={12}
                  height={12}
                  fill={isAvailable ? "#22C55E" : "#EF4444"}
                  cornerRadius={6}
                  shadowBlur={2}
                  shadowColor="rgba(0,0,0,0.2)"
                />

                {/* Room name */}
                <Text
                  x={x + w / 2}
                  y={y + h / 2 - 25}
                  text={room.name || `Room ${idx + 1}`}
                  fontSize={18}
                  fontStyle="bold"
                  fill={textColor}
                  align="center"
                  verticalAlign="middle"
                  width={w}
                  offsetX={w / 2}
                />

                {/* Room capacity */}
                <Text
                  x={x + w / 2}
                  y={y + h / 2}
                  text={`${room.capacity || 0} seats`}
                  fontSize={13}
                  fill={isSelected ? "#3B82F6" : "#6B7280"}
                  align="center"
                  verticalAlign="middle"
                  width={w}
                  offsetX={w / 2}
                />

                {/* Availability status text */}
                <Text
                  x={x + w / 2}
                  y={y + h / 2 + 18}
                  text={isAvailable ? "Available" : "Occupied"}
                  fontSize={11}
                  fontStyle="italic"
                  fill={isAvailable ? "#22C55E" : "#EF4444"}
                  align="center"
                  verticalAlign="middle"
                  width={w}
                  offsetX={w / 2}
                />

                {/* Selection indicator */}
                {isSelected && (
                  <Rect
                    x={x - 3}
                    y={y - 3}
                    width={w + 6}
                    height={h + 6}
                    stroke="#3B82F6"
                    strokeWidth={3}
                    cornerRadius={10}
                    dash={[8, 4]}
                    shadowBlur={4}
                    shadowColor="rgba(59, 130, 246, 0.5)"
                  />
                )}
              </Group>
            );
          })}
        </Layer>
      </Stage>
    </div>
  );
}

export default InteractiveFloorPlan;

