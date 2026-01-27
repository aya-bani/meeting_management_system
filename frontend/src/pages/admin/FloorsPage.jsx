import { useEffect, useState } from "react";
import { FiLayers } from "react-icons/fi";
import AdminSidebar from "../../components/AdminSidebar";
import { floorService } from "../../services/floorService";
import FloorPreview from "../../components/floorplan/FloorPreview";
import FloorPlanModal from "../../components/floorplan/FloorPlanModal";

function FloorsPage() {
  const [floors, setFloors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedFloor, setSelectedFloor] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchFloors = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await floorService.getAllFloors();
        setFloors(data || []);
      } catch (err) {
        console.error("Error fetching floors:", err);
        setError(err?.response?.data?.message || "Failed to load floors");
      } finally {
        setLoading(false);
      }
    };

    fetchFloors();
  }, []);

  return (
    <div className="min-h-screen flex bg-gray-50">
      <AdminSidebar />

      <div className="flex-1 ml-64 p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Floors</h1>
          <p className="text-gray-500 text-sm">Manage building floors</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 p-3 mb-6 rounded">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm p-6">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <p className="text-gray-500">Loading floors...</p>
            </div>
          ) : floors.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500">No floors found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {floors.map((floor, index) => (
                <div
                  key={floor._id}
                  className="relative p-5 border border-gray-100 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-blue-50 text-blue-600 rounded-full text-sm font-medium">
                    {index + 1}
                  </div>

                  <div className="flex items-center mb-3">
                    <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                      <FiLayers className="w-5 h-5" />
                    </div>
                    <h3 className="ml-3 text-lg font-semibold text-gray-800">
                      {floor.name}
                    </h3>
                  </div>

                  {/* Floor plan preview - clickable */}
                  <div
                    className="mb-4 h-40 w-full overflow-hidden rounded-md bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors border-2 border-transparent hover:border-blue-300"
                    onClick={() => {
                      setSelectedFloor(floor);
                      setIsModalOpen(true);
                    }}
                    title="Click to view full floor plan"
                  >
                    <FloorPreview floor={floor} />
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Rooms</p>
                      <p className="text-gray-700">
                        {floor.rooms?.length || 0} rooms
                        <span className="ml-2 text-sm text-green-600">
                          {floor.rooms?.filter((r) => r.status === "available").length || 0}{" "}
                          available
                        </span>
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Capacity</p>
                      <p className="text-gray-700">
                        {floor.rooms?.reduce(
                          (sum, room) => sum + (room.capacity || 0),
                          0
                        ) || 0}{" "}
                        total seats
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Floor Plan Modal */}
      <FloorPlanModal
        floor={selectedFloor}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedFloor(null);
        }}
      />
    </div>
  );
}

export default FloorsPage;


