import { useState } from "react";

function ComponentRoomReports({ 
  components, 
  rooms, 
  floors, 
  onDeleteComponent 
}) {
  const [componentTypeFilter, setComponentTypeFilter] = useState("");

  // Filter components by type
  const filteredComponents = componentTypeFilter
    ? components.filter((c) => c.type === componentTypeFilter)
    : components;

  // Group components by room
  const groupComponentsByRoom = () => {
    const grouped = {};

    filteredComponents.forEach((component) => {
      let roomId, roomName, floorName;

      // Get room info
      if (component.room && typeof component.room === "object") {
        roomId = component.room._id;
        roomName = component.room.name || "Unknown Room";
        
        if (component.room.floor && typeof component.room.floor === "object") {
          floorName = component.room.floor.name || "Unknown Floor";
        } else {
          const room = rooms.find((r) => r._id === roomId);
          if (room) {
            const roomFloorId = room.floor && typeof room.floor === "object" ? room.floor._id : room.floor;
            const floor = floors.find((f) => f._id === roomFloorId);
            floorName = floor ? floor.name : "Unknown Floor";
          } else {
            floorName = "Unknown Floor";
          }
        }
      } else {
        roomId = component.room;
        const room = rooms.find((r) => r._id === roomId);
        if (room) {
          roomName = room.name || "Unknown Room";
          const roomFloorId = room.floor && typeof room.floor === "object" ? room.floor._id : room.floor;
          const floor = floors.find((f) => f._id === roomFloorId);
          floorName = floor ? floor.name : "Unknown Floor";
        } else {
          roomName = "Unknown Room";
          floorName = "Unknown Floor";
        }
      }

      if (!grouped[roomId]) {
        grouped[roomId] = {
          roomId,
          roomName,
          floorName,
          components: [],
        };
      }

      grouped[roomId].components.push(component);
    });

    return Object.values(grouped)
      .sort((a, b) => {
        const floorCompare = a.floorName.localeCompare(b.floorName);
        if (floorCompare !== 0) return floorCompare;
        return a.roomName.localeCompare(b.roomName);
      })
      .map((roomGroup) => ({
        ...roomGroup,
        components: roomGroup.components.sort((a, b) => a.name.localeCompare(b.name)),
      }));
  };

  const groupedComponentsByRoom = groupComponentsByRoom();

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-slate-800">Manage Components</h2>
        <div className="flex items-center gap-3">
          <select
            value={componentTypeFilter}
            onChange={(e) => setComponentTypeFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
          >
            <option value="">All Types</option>
            <option value="camera">Camera</option>
            <option value="datashow">Datashow/Projector</option>
            <option value="whiteboard">Whiteboard</option>
            <option value="microphone">Microphone</option>
            <option value="screen">Screen</option>
            <option value="speaker">Speaker</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {filteredComponents.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No components found</div>
        ) : (
          <div className="divide-y divide-slate-200">
            {groupedComponentsByRoom.map((roomGroup) => (
              <div key={roomGroup.roomId} className="p-4">
                <div className="mb-3 pb-2 border-b border-slate-200">
                  <h3 className="font-semibold text-slate-800">{roomGroup.roomName}</h3>
                  <p className="text-sm text-slate-600">
                    Floor {roomGroup.floorName} • {roomGroup.components.length}{" "}
                    {roomGroup.components.length === 1 ? "component" : "components"}
                  </p>
                </div>
                
                <div className="space-y-2">
                  {roomGroup.components.map((component) => (
                    <div
                      key={component._id}
                      className="p-3 bg-slate-50 rounded-lg flex items-center justify-between hover:bg-slate-100 transition"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-slate-800">{component.name}</h4>
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-semibold ${
                              component.type === "camera"
                                ? "bg-blue-100 text-blue-800"
                                : component.type === "datashow"
                                ? "bg-purple-100 text-purple-800"
                                : component.type === "whiteboard"
                                ? "bg-gray-100 text-gray-800"
                                : component.type === "microphone"
                                ? "bg-pink-100 text-pink-800"
                                : component.type === "screen"
                                ? "bg-indigo-100 text-indigo-800"
                                : component.type === "speaker"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {component.type}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-semibold ${
                              component.isWorking
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {component.isWorking ? "Working" : "Not Working"}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 mt-1">
                          Quantity: {component.quantity || 1}
                          {component.serialNumber && ` • Serial: ${component.serialNumber}`}
                        </p>
                      </div>
                      <button
                        onClick={() => onDeleteComponent(component._id)}
                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm ml-4"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ComponentRoomReports;