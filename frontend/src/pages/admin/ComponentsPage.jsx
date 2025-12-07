import { useEffect, useState, useMemo, useCallback } from "react";
import { FiCpu, FiHardDrive, FiMonitor, FiPrinter, FiWifi, FiServer, FiTool } from "react-icons/fi";
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
  const [statusFilter, setStatusFilter] = useState("");

  // Get component icon based on type
  const getComponentIcon = (type) => {
    const typeLower = type?.toLowerCase() || '';
    switch (typeLower) {
      case 'projector':
      case 'datashow':
        return <FiMonitor className="w-5 h-5" />;
      case 'computer':
      case 'laptop':
        return <FiCpu className="w-5 h-5" />;
      case 'printer':
        return <FiPrinter className="w-5 h-5" />;
      case 'storage':
        return <FiHardDrive className="w-5 h-5" />;
      case 'server':
        return <FiServer className="w-5 h-5" />;
      case 'network':
      case 'wifi':
        return <FiWifi className="w-5 h-5" />;
      default:
        return <FiTool className="w-5 h-5" />;
    }
  };

  // Helper function to get room and floor info for a component
  const getComponentLocation = useCallback((component) => {
    let roomId, roomName, floorId, floorName;

    // Get room info
    if (component.room && typeof component.room === "object") {
      roomId = component.room._id;
      roomName = component.room.name || "Unknown Room";
      
      // Get floor info from room
      if (component.room.floor && typeof component.room.floor === "object") {
        floorId = component.room.floor._id;
        floorName = component.room.floor.name || "Unknown Floor";
      } else if (component.room.floor) {
        floorId = component.room.floor;
        const floor = floors.find((f) => f._id === floorId);
        floorName = floor ? floor.name : "Unknown Floor";
      }
    } else if (component.room) {
      roomId = component.room;
      const room = rooms.find((r) => r._id === roomId);
      roomName = room ? room.name : "Unknown Room";
      
      // Get floor info if available in room
      if (room?.floor) {
        if (typeof room.floor === "object") {
          floorId = room.floor._id;
          floorName = room.floor.name || "Unknown Floor";
        } else {
          floorId = room.floor;
          const floor = floors.find((f) => f._id === floorId);
          floorName = floor ? floor.name : "Unknown Floor";
        }
      }
    }

    return {
      roomId,
      roomName,
      floorId,
      floorName,
      displayName: roomName ? 
        (floorName ? `${roomName} (${floorName})` : roomName) : 
        (floorName ? `Floor: ${floorName}` : 'Unassigned')
    };
  }, [floors, rooms]);

  // Fetch data on component mount
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

  // Filter components based on selected filters
  const filteredComponents = useMemo(() => {
    return components.filter(component => {
      const location = getComponentLocation(component);
      
      const matchesType = !typeFilter || 
        (component.type && component.type.toLowerCase().includes(typeFilter.toLowerCase()));
      
      const matchesRoom = !roomFilter || 
        (location.roomName && location.roomName.toLowerCase().includes(roomFilter.toLowerCase()));
      
      const matchesFloor = !floorFilter || 
        (location.floorId && location.floorId === floorFilter);
      
      const matchesStatus = !statusFilter || 
        (component.status && component.status.toLowerCase() === statusFilter.toLowerCase());
      
      return matchesType && matchesRoom && matchesFloor && matchesStatus;
    });
  }, [components, typeFilter, roomFilter, floorFilter, statusFilter, getComponentLocation]);

  // Get unique component types for filter dropdown
  const componentTypes = useMemo(() => {
    const types = new Set();
    components.forEach(comp => {
      if (comp.type) {
        types.add(comp.type);
      }
    });
    return Array.from(types).sort();
  }, [components]);

  // Clear all filters
  const clearFilters = () => {
    setTypeFilter('');
    setRoomFilter('');
    setFloorFilter('');
    setStatusFilter('');
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 ml-64 p-6">
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Components</h1>
              <p className="text-gray-500 text-sm">
                {filteredComponents.length} of {components.length} components
              </p>
            </div>
            <button 
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              onClick={() => { /* Add component functionality */ }}
            >
              Add Component
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 p-3 mb-6 rounded">
            {error}
          </div>
        )}

        {/* Quick Filters */}
        <div className="mt-4 flex flex-wrap gap-2 mb-6">
          <button 
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              !typeFilter && !roomFilter && !floorFilter && !statusFilter 
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={clearFilters}
          >
            All Components ({components.length})
          </button>
          
          <button 
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              statusFilter === 'working' 
                ? 'bg-green-100 text-green-700' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setStatusFilter(prev => prev === 'working' ? '' : 'working')}
          >
            Working ({components.filter(c => c.status === 'working').length})
          </button>
          
          <button 
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              statusFilter === 'maintenance' 
                ? 'bg-yellow-100 text-yellow-700' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setStatusFilter(prev => prev === 'maintenance' ? '' : 'maintenance')}
          >
            Maintenance ({components.filter(c => c.status === 'maintenance').length})
          </button>
          
          <div className="ml-auto flex gap-2">
            <select 
              className="text-sm border border-gray-300 rounded-md px-3 py-1 bg-white"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="">All Types</option>
              {componentTypes.map(type => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            
            <select 
              className="text-sm border border-gray-300 rounded-md px-3 py-1 bg-white"
              value={floorFilter}
              onChange={(e) => {
                setFloorFilter(e.target.value);
                // Clear room filter when changing floor
                if (e.target.value) setRoomFilter('');
              }}
            >
              <option value="">All Floors</option>
              {floors.map(floor => (
                <option key={floor._id} value={floor._id}>
                  {floor.name}
                </option>
              ))}
            </select>
            
            <select 
              className="text-sm border border-gray-300 rounded-md px-3 py-1 bg-white"
              value={roomFilter}
              onChange={(e) => setRoomFilter(e.target.value)}
              disabled={!!floorFilter} // Disable if floor filter is active
            >
              <option value="">All Rooms</option>
              {rooms
                .filter(room => {
                  // If floor filter is active, only show rooms from that floor
                  if (floorFilter) {
                    const roomFloorId = room.floor?._id || room.floor;
                    return roomFloorId === floorFilter;
                  }
                  return true;
                })
                .map(room => (
                  <option key={room._id} value={room._id}>
                    {room.name}
                  </option>
                ))}
            </select>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <p className="text-gray-500">Loading components...</p>
            </div>
          ) : filteredComponents.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500">
                {components.length === 0 
                  ? 'No components found. Add your first component to get started.' 
                  : 'No components match the selected filters.'}
              </p>
              {components.length > 0 && (
                <button 
                  className="mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium"
                  onClick={clearFilters}
                >
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredComponents.map((component) => {
                const location = getComponentLocation(component);
                const isWorking = component.status === 'working';
                const isMaintenance = component.status === 'maintenance';
                
                return (
                  <div 
                    key={component._id} 
                    className="relative p-5 border border-gray-100 rounded-lg hover:shadow-md transition-shadow bg-white"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center">
                        <div className={`p-2 rounded-lg ${
                          isWorking 
                            ? 'bg-green-50 text-green-600' 
                            : isMaintenance 
                              ? 'bg-yellow-50 text-yellow-600' 
                              : 'bg-gray-50 text-gray-500'
                        }`}>
                          {getComponentIcon(component.type)}
                        </div>
                        <h3 className="ml-3 text-lg font-semibold text-gray-800">
                          {component.name}
                        </h3>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        isWorking 
                          ? 'bg-green-100 text-green-800' 
                          : isMaintenance 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-gray-100 text-gray-800'
                      }`}>
                        {component.status || 'unknown'}
                      </span>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500">Type</p>
                        <p className="text-gray-700 capitalize">
                          {component.type || 'N/A'}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500">Location</p>
                        <p className="text-gray-700">
                          {location.roomName || 'Unassigned'}
                          {location.floorName && (
                            <span className="text-gray-500 text-sm ml-2">
                              ({location.floorName})
                            </span>
                          )}
                        </p>
                      </div>
                      
                      {component.serialNumber && (
                        <div>
                          <p className="text-sm text-gray-500">Serial Number</p>
                          <p className="text-gray-700 font-mono text-sm">
                            {component.serialNumber}
                          </p>
                        </div>
                      )}
                      
                      {component.model && (
                        <div>
                          <p className="text-sm text-gray-500">Model</p>
                          <p className="text-gray-700 text-sm">{component.model}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end space-x-2">
                      <button 
                        className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 hover:bg-blue-50 rounded"
                        onClick={() => { /* Edit functionality */ }}
                      >
                        Edit
                      </button>
                      <button 
                        className="text-xs text-red-600 hover:text-red-800 px-2 py-1 hover:bg-red-50 rounded"
                        onClick={() => { /* Delete functionality */ }}
                      >
                        Delete
                      </button>
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

export default ComponentsPage;
