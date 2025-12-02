import { useEffect, useState } from "react";

import AdminSidebar from "../../components/AdminSidebar";
import { roomService } from "../../services/roomService";
import { floorService } from "../../services/floorService";

function RoomsPage() {
  const [rooms, setRooms] = useState([]);
  const [floors, setFloors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const [roomsData, floorsData] = await Promise.all([
          roomService.getAllRooms(),
          floorService.getAllFloors(),
        ]);

        setRooms(roomsData || []);
        setFloors(floorsData || []);
      } catch (err) {
        console.error("Error fetching rooms/floors:", err);
        setError(err?.response?.data?.message || "Failed to load rooms");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Group rooms by floor
  const groupRoomsByFloor = () => {
    const grouped = {};
    
    rooms.forEach((room) => {
      let floorId, floorName;
      
      if (room.floor && typeof room.floor === "object") {
        floorId = room.floor._id;
        floorName = room.floor.name || "Unknown Floor";
      } else {
        floorId = room.floor;
        const floor = floors.find((f) => f._id === floorId);
        floorName = floor ? floor.name : "Unknown Floor";
      }
      
      if (!grouped[floorId]) {
        grouped[floorId] = {
          floorId,
          floorName,
          rooms: [],
        };
      }
      
      grouped[floorId].rooms.push(room);
    });
    
    // Sort floors by name, then sort rooms within each floor
    return Object.values(grouped)
      .sort((a, b) => a.floorName.localeCompare(b.floorName))
      .map((group) => ({
        ...group,
        rooms: group.rooms.sort((a, b) => a.name.localeCompare(b.name)),
      }));
  };

  const groupedRooms = groupRoomsByFloor();

  return (
    <div className="min-h-screen flex bg-slate-50">
      <AdminSidebar />

      <div className="flex-1 ml-64 p-6">
        <header className="bg-indigo-600 text-white p-4 rounded shadow mb-6">
          <h1 className="text-2xl font-bold">Rooms</h1>
          <p className="text-indigo-100 text-sm mt-1">
            View all meeting rooms organized by floor.
          </p>
        </header>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 p-3 mb-4 rounded">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {loading ? (
            <div className="bg-white rounded shadow p-4">
              <p className="text-gray-500">Loading rooms...</p>
            </div>
          ) : groupedRooms.length === 0 ? (
            <div className="bg-white rounded shadow p-4">
              <p className="text-gray-500">No rooms found.</p>
            </div>
          ) : (
            groupedRooms.map((floorGroup) => (
              <div key={floorGroup.floorId} className="bg-white rounded shadow overflow-hidden">
                <div className="bg-indigo-50 border-b border-indigo-200 px-6 py-4">
                  <h2 className="text-xl font-bold text-indigo-900">
                    {floorGroup.floorName}
                  </h2>
                  <p className="text-sm text-indigo-700 mt-1">
                    {floorGroup.rooms.length} {floorGroup.rooms.length === 1 ? "room" : "rooms"}
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Room Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Code
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Capacity
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Description
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {floorGroup.rooms.map((room) => (
                        <tr key={room._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {room.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {room.code || "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {room.capacity ?? "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span
                              className={`px-2 py-1 rounded text-xs font-semibold ${
                                room.status === "available"
                                  ? "bg-green-100 text-green-800"
                                  : room.status === "booked"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {room.status || "available"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate">
                            {room.description || "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default RoomsPage;


