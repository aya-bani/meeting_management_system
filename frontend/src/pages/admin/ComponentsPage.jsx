import { useEffect, useState, useMemo, useCallback } from "react";

import AdminSidebar from "../../components/AdminSidebar";
import { componentService } from "../../services/componentService";
import { roomService } from "../../services/roomService";
import { floorService } from "../../services/floorService";

function ComponentsPage() {
  const [components, setComponents] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [floors, setFloors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [roomFilter, setRoomFilter] = useState("");
  const [floorFilter, setFloorFilter] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const [componentsData, roomsData, floorsData] = await Promise.all([
          componentService.getAllComponents(),
          roomService.getAllRooms(),
          floorService.getAllFloors(),
        ]);

        setComponents(componentsData || []);
        setRooms(roomsData || []);
        setFloors(floorsData || []);
      } catch (err) {
        console.error("Error fetching components/rooms/floors:", err);
        setError(err?.response?.data?.message || "Failed to load components");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Helper function to get room and floor info for a component
  const getComponentLocation = useCallback((component) => {
    let roomId, roomName, floorId, floorName;

    // Get room info
    if (component.room && typeof component.room === "object") {
      roomId = component.room._id;
      roomName = component.room.name || "Unknown Room";
      // Check if room has floor populated
      if (component.room.floor && typeof component.room.floor === "object") {
        floorId = component.room.floor._id;
        floorName = component.room.floor.name || "Unknown Floor";
      } else {
        // Find floor from rooms array
        const room = rooms.find((r) => r._id === roomId);
        if (room) {
          const roomFloorId = room.floor && typeof room.floor === "object" 
            ? room.floor._id 
            : room.floor;
          floorId = roomFloorId;
          const floor = floors.find((f) => f._id === roomFloorId);
          floorName = floor ? floor.name : "Unknown Floor";
        } else {
          floorId = "unknown";
          floorName = "Unknown Floor";
        }
      }
    } else {
      roomId = component.room;
      const room = rooms.find((r) => r._id === roomId);
      if (room) {
        roomName = room.name || "Unknown Room";
        const roomFloorId = room.floor && typeof room.floor === "object" 
          ? room.floor._id 
          : room.floor;
        floorId = roomFloorId;
        const floor = floors.find((f) => f._id === roomFloorId);
        floorName = floor ? floor.name : "Unknown Floor";
      } else {
        roomName = "Unknown Room";
        floorId = "unknown";
        floorName = "Unknown Floor";
      }
    }

    return { roomId, roomName, floorId, floorName };
  }, [rooms, floors]);

  // Filter components by type, room, and floor
  const filteredComponents = components.filter((component) => {
    // Filter by type
    if (typeFilter && component.type !== typeFilter) {
      return false;
    }

    // Get component location
    const { roomId, floorId } = getComponentLocation(component);

    // Filter by room
    if (roomFilter && roomId !== roomFilter) {
      return false;
    }

    // Filter by floor
    if (floorFilter && floorId !== floorFilter) {
      return false;
    }

    return true;
  });

  // Group components by floor -> room
  const groupedData = useMemo(() => {
    const grouped = {};

    filteredComponents.forEach((component) => {
      const { roomId, roomName, floorId, floorName } = getComponentLocation(component);

      if (!grouped[floorId]) {
        grouped[floorId] = {
          floorId,
          floorName,
          rooms: {},
        };
      }

      if (!grouped[floorId].rooms[roomId]) {
        grouped[floorId].rooms[roomId] = {
          roomId,
          roomName,
          components: [],
        };
      }

      grouped[floorId].rooms[roomId].components.push(component);
    });

    const floorArray = Object.values(grouped);
    floorArray.sort((a, b) => a.floorName.localeCompare(b.floorName));
    
    return floorArray.map((floorGroup) => {
      const roomArray = Object.values(floorGroup.rooms);
      roomArray.sort((a, b) => a.roomName.localeCompare(b.roomName));
      
      const processedRooms = roomArray.map((roomGroup) => {
        const sortedComponents = [...roomGroup.components];
        sortedComponents.sort((a, b) => a.name.localeCompare(b.name));
        return {
          ...roomGroup,
          components: sortedComponents,
        };
      });
      
      return {
        ...floorGroup,
        rooms: processedRooms,
      };
    });
  }, [filteredComponents, getComponentLocation]);

  const getStatusColor = (isWorking) => {
    return isWorking
      ? "bg-green-100 text-green-800"
      : "bg-red-100 text-red-800";
  };

  const getTypeColor = (type) => {
    const colors = {
      camera: "bg-blue-100 text-blue-800",
      datashow: "bg-purple-100 text-purple-800",
      whiteboard: "bg-gray-100 text-gray-800",
      microphone: "bg-pink-100 text-pink-800",
      screen: "bg-indigo-100 text-indigo-800",
      speaker: "bg-yellow-100 text-yellow-800",
      other: "bg-gray-100 text-gray-800",
    };
    return colors[type] || colors.other;
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      <AdminSidebar />

      <div className="flex-1 ml-64 p-6">
        <header className="bg-indigo-600 text-white p-4 rounded shadow mb-6">
          <h1 className="text-2xl font-bold">Components</h1>
          <p className="text-indigo-100 text-sm mt-1">
            View all equipment/components organized by floor and room.
          </p>
        </header>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 p-3 mb-4 rounded">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded shadow p-4 mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Filter by Floor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Floor
              </label>
              <select
                value={floorFilter}
                onChange={(e) => setFloorFilter(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Floors</option>
                {floors.map((floor) => (
                  <option key={floor._id} value={floor._id}>
                    {floor.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter by Room */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Room
              </label>
              <select
                value={roomFilter}
                onChange={(e) => setRoomFilter(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Rooms</option>
                {rooms
                  .filter((room) => {
                    // If floor filter is set, only show rooms from that floor
                    if (floorFilter) {
                      const roomFloorId =
                        room.floor && typeof room.floor === "object"
                          ? room.floor._id
                          : room.floor;
                      return roomFloorId === floorFilter;
                    }
                    // Otherwise show all rooms
                    return true;
                  })
                  .map((room) => {
                    // Get floor name for display
                    const roomFloorId =
                      room.floor && typeof room.floor === "object"
                        ? room.floor._id
                        : room.floor;
                    const floor = floors.find((f) => f._id === roomFloorId);
                    const floorName = floor ? floor.name : "";
                    
                    return (
                      <option key={room._id} value={room._id}>
                        {room.name} {floorName && `(${floorName})`}
                      </option>
                    );
                  })}
              </select>
            </div>

            {/* Filter by Component Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Component Type
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
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

          {/* Clear Filters Button */}
          {(typeFilter || roomFilter || floorFilter) && (
            <div className="mt-4">
              <button
                onClick={() => {
                  setTypeFilter("");
                  setRoomFilter("");
                  setFloorFilter("");
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition text-sm"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {loading ? (
            <div className="bg-white rounded shadow p-4">
              <p className="text-gray-500">Loading components...</p>
            </div>
          ) : groupedData.length === 0 ? (
            <div className="bg-white rounded shadow p-4">
              <p className="text-gray-500">No components found.</p>
            </div>
          ) : (
            groupedData.map((floorGroup) => (
              <div key={floorGroup.floorId} className="bg-white rounded shadow overflow-hidden">
                <div className="bg-indigo-50 border-b border-indigo-200 px-6 py-4">
                  <h2 className="text-xl font-bold text-indigo-900">
                    {floorGroup.floorName}
                  </h2>
                  <p className="text-sm text-indigo-700 mt-1">
                    {Object.values(floorGroup.rooms).reduce(
                      (sum, room) => sum + room.components.length,
                      0
                    )}{" "}
                    components across {floorGroup.rooms.length}{" "}
                    {floorGroup.rooms.length === 1 ? "room" : "rooms"}
                  </p>
                </div>

                <div className="space-y-4 p-6">
                  {floorGroup.rooms.map((roomGroup) => (
                    <div
                      key={roomGroup.roomId}
                      className="border border-gray-200 rounded-lg overflow-hidden"
                    >
                      <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
                        <h3 className="text-lg font-semibold text-gray-800">
                          {roomGroup.roomName}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {roomGroup.components.length}{" "}
                          {roomGroup.components.length === 1
                            ? "component"
                            : "components"}
                        </p>
                      </div>

                      {roomGroup.components.length === 0 ? (
                        <div className="p-4 text-center text-gray-500 text-sm">
                          No components in this room
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Component Name
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Type
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Quantity
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Serial Number
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Status
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Notes
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {roomGroup.components.map((component) => (
                                <tr key={component._id} className="hover:bg-gray-50">
                                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {component.name}
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                                    <span
                                      className={`px-2 py-1 rounded text-xs font-semibold ${getTypeColor(
                                        component.type
                                      )}`}
                                    >
                                      {component.type || "N/A"}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                                    {component.quantity ?? 1}
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                                    {component.serialNumber || "-"}
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                                    <span
                                      className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(
                                        component.isWorking
                                      )}`}
                                    >
                                      {component.isWorking ? "Working" : "Not Working"}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-700 max-w-xs truncate">
                                    {component.notes || "-"}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default ComponentsPage;
