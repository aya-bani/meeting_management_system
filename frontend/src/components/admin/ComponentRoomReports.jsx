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
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <select
            value={componentTypeFilter}
            onChange={(e) => setComponentTypeFilter(e.target.value)}
            className="px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm font-medium bg-white shadow-sm hover:border-slate-400 transition-colors"
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
      
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {filteredComponents.length === 0 ? (
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
            </div>
            <p className="text-slate-500 font-medium">No components found</p>
            <p className="text-sm text-slate-400 mt-1">Try adjusting your filter</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {groupedComponentsByRoom.map((roomGroup) => (
              <div key={roomGroup.roomId} className="p-5 hover:bg-slate-50 transition-colors">
                <div className="mb-4 pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                      <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 text-lg">{roomGroup.roomName}</h3>
                      <p className="text-sm text-slate-600 mt-0.5">
                        Floor {roomGroup.floorName} • {roomGroup.components.length}{" "}
                        {roomGroup.components.length === 1 ? "component" : "components"}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {roomGroup.components.map((component) => (
                    <div
                      key={component._id}
                      className="group p-4 bg-gradient-to-br from-slate-50 to-white rounded-lg border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-900 mb-2">{component.name}</h4>
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold ${
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
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold ${
                                component.isWorking
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${component.isWorking ? 'bg-green-500' : 'bg-red-500'}`}></span>
                              {component.isWorking ? "Working" : "Not Working"}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => onDeleteComponent(component._id)}
                          className="ml-3 p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remove component"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                      <div className="text-sm text-slate-600 space-y-1">
                        <p>
                          <span className="font-medium">Quantity:</span> {component.quantity || 1}
                        </p>
                        {component.serialNumber && (
                          <p>
                            <span className="font-medium">Serial:</span> {component.serialNumber}
                          </p>
                        )}
                      </div>
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