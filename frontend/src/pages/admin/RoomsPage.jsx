import { useEffect, useState, useCallback, useMemo } from "react";
import { FiMonitor, FiUsers, FiClock, FiTool } from "react-icons/fi";
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

  // Function to get status color and icon
  const getStatusInfo = (status) => {
    switch (status) {
      case 'available':
        return { color: 'green', icon: '✓' };
      case 'occupied':
        return { color: 'yellow', icon: '👥' };
      case 'maintenance':
        return { color: 'red', icon: '🔧' };
      default:
        return { color: 'gray', icon: '❓' };
    }
  };

  // Function to get floor name by ID
  const getFloorName = useCallback((floorId) => {
    if (!floorId) return 'Unknown Floor';
    const floor = floors.find(f => f._id === floorId);
    return floor ? floor.name : 'Unknown Floor';
  }, [floors]);

  // Get all rooms in a flattened array for the grid view
  const allRooms = useMemo(() => {
    return groupedRooms.flatMap(group => 
      group.rooms.map(room => ({
        ...room,
        floorName: group.floorName
      }))
    );
  }, [groupedRooms]);

  return (
    <div className="min-h-screen flex bg-gray-50">
      <AdminSidebar />

      <div className="flex-1 ml-64 p-6">
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Rooms</h1>
              <p className="text-gray-500 text-sm">
                {allRooms.length} of {allRooms.length} rooms
              </p>
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
              Add Room
            </button>
          </div>
          
          <div className="mt-4 flex flex-wrap gap-2">
            <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
              All Rooms ({allRooms.length})
            </button>
            <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
              Available ({allRooms.filter(r => r.status === 'available').length})
            </button>
            <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
              Occupied ({allRooms.filter(r => r.status === 'occupied').length})
            </button>
            <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
              Maintenance ({allRooms.filter(r => r.status === 'maintenance').length})
            </button>
            
            <div className="ml-auto flex gap-2">
              <select className="text-sm border border-gray-300 rounded-md px-3 py-1 bg-white">
                <option>All Rooms</option>
                {floors.map(floor => (
                  <option key={floor._id} value={floor._id}>
                    {floor.name}
                  </option>
                ))}
              </select>
              <select className="text-sm border border-gray-300 rounded-md px-3 py-1 bg-white">
                <option>All Floors</option>
                {floors.map(floor => (
                  <option key={floor._id} value={floor._id}>
                    {floor.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 p-3 mb-6 rounded">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm p-6">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <p className="text-gray-500">Loading rooms...</p>
            </div>
          ) : allRooms.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500">No rooms found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {allRooms.map((room) => {
                const statusInfo = getStatusInfo(room.status);
                
                return (
                  <div 
                    key={room._id} 
                    className="relative p-5 border border-gray-100 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">{room.name}</h3>
                        <p className="text-sm text-gray-500">{getFloorName(room.floor)}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        statusInfo.color === 'green' ? 'bg-green-100 text-green-800' :
                        statusInfo.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {statusInfo.icon} {room.status}
                      </span>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500">Capacity</p>
                        <p className="text-gray-700 flex items-center">
                          <FiUsers className="mr-2" />
                          {room.capacity || 0} people
                        </p>
                      </div>
                      

                      {room.components && room.components.length > 0 && (
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Equipment</p>
                          <div className="flex flex-wrap gap-1">
                            {room.components.slice(0, 4).map((comp, idx) => (
                              <span 
                                key={idx} 
                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                              >
                                {typeof comp === 'object' ? comp.name : comp}
                              </span>
                            ))}
                            {room.components.length > 4 && (
                              <span className="text-xs text-gray-500">
                                +{room.components.length - 4} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RoomsPage;


