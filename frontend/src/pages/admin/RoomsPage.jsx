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

  const getFloorName = (room) => {
    if (room.floor && typeof room.floor === "object") {
      return room.floor.name || "N/A";
    }
    const floorId = room.floor;
    const floor = floors.find((f) => f._id === floorId);
    return floor ? floor.name : "N/A";
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      <AdminSidebar />

      <div className="flex-1 ml-64 p-6">
        <header className="bg-indigo-600 text-white p-4 rounded shadow mb-6">
          <h1 className="text-2xl font-bold">Rooms</h1>
          <p className="text-indigo-100 text-sm mt-1">
            View all meeting rooms and their capacities.
          </p>
        </header>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 p-3 mb-4 rounded">
            {error}
          </div>
        )}

        <div className="bg-white rounded shadow p-4">
          {loading ? (
            <p className="text-gray-500">Loading rooms...</p>
          ) : rooms.length === 0 ? (
            <p className="text-gray-500">No rooms found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Floor
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Capacity
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {rooms.map((r) => (
                    <tr key={r._id}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {r.name}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                        {getFloorName(r)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                        {r.capacity ?? "-"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <span className="px-2 py-1 rounded text-xs font-semibold bg-gray-100 text-gray-800">
                          {r.status || "active"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RoomsPage;


