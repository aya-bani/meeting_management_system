import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import HRSidebar from "../../components/HRSidebar";
import { floorService } from "../../services/floorService";
import { roomService } from "../../services/roomService";
import { bookingService } from "../../services/bookingServices";
import { componentService } from "../../services/componentService";
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import InteractiveFloorPlan from "../../components/floorplan/InteractiveFloorPlan";

function HRBookingPage() {
  const navigate = useNavigate();
  const [floors, setFloors] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [components, setComponents] = useState([]);
  const [selectedFloor, setSelectedFloor] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Booking form state
  const [formData, setFormData] = useState({
    date: "",
    startTime: "",
    endTime: "",
    purpose: "",
    attendeesCount: 1,
    components: [],
  });
  const [selectedComponents, setSelectedComponents] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedFloor) {
      fetchRoomsForFloor(selectedFloor._id);
    }
  }, [selectedFloor]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");
      const [floorsData, componentsData] = await Promise.all([
        floorService.getAllFloors(),
        componentService.getAllComponents(),
      ]);
      setFloors(floorsData || []);
      setComponents(componentsData || []);
      if (floorsData && floorsData.length > 0) {
        setSelectedFloor(floorsData[0]);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err?.response?.data?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const fetchRoomsForFloor = async (floorId) => {
    try {
      const roomsData = await roomService.getAllRooms();
      const filteredRooms = roomsData.filter((room) => {
        const roomFloorId =
          typeof room.floor === "object" ? room.floor._id : room.floor;
        return roomFloorId === floorId;
      });
      setRooms(filteredRooms || []);
    } catch (err) {
      console.error("Error fetching rooms:", err);
      setError("Failed to load rooms for this floor");
    }
  };

  const handleRoomClick = (room) => {
    setSelectedRoom(room);
    setFormData({ ...formData, room: room._id });
  };

  const toggleComponent = (componentId) => {
    setSelectedComponents((prev) =>
      prev.includes(componentId)
        ? prev.filter((id) => id !== componentId)
        : [...prev, componentId]
    );
  };

  const validateTime = () => {
    const s = formData.startTime;
    const e = formData.endTime;
    if (!s || !e) return false;

    const [sh, sm] = s.split(":").map(Number);
    const [eh, em] = e.split(":").map(Number);

    const start = sh * 60 + sm;
    const end = eh * 60 + em;

    return end > start;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!selectedRoom) {
      setError("Please select a room from the floor plan");
      return;
    }

    if (!validateTime()) {
      setError("End time must be after start time");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        room: selectedRoom._id,
        ...formData,
        attendeesCount: Number(formData.attendeesCount),
        components: selectedComponents,
      };

      await bookingService.createBooking(payload);
      setSuccess("Booking created successfully!");

      // Reset form
      setFormData({
        date: "",
        startTime: "",
        endTime: "",
        purpose: "",
        attendeesCount: 1,
        components: [],
      });
      setSelectedComponents([]);
      setSelectedRoom(null);

      setTimeout(() => {
        navigate("/hr/my-bookings");
      }, 2000);
    } catch (err) {
      console.error("Booking error:", err);
      setError(err?.response?.data?.message || "Failed to create booking");
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <div className="min-h-screen flex bg-gray-50">
      <HRSidebar />
      <div className="flex-1 ml-64">
        <div className="p-8">
          <PageHeader
            title="Book a Room"
            subtitle="Select a floor and room from the interactive floor plan"
          />

          {/* Success/Error Messages */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg shadow-sm flex items-center gap-3">
              <svg
                className="w-5 h-5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-lg shadow-sm flex items-center gap-3">
              <svg
                className="w-5 h-5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{success}</span>
            </div>
          )}

          {loading ? (
            <Card className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading floors and rooms...</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Floor Selection & Floor Plan */}
              <div className="lg:col-span-2 space-y-6">
                {/* Floor Selection */}
                <Card>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Floor
                    </label>
                    <select
                      value={selectedFloor?._id || ""}
                      onChange={(e) => {
                        const floor = floors.find((f) => f._id === e.target.value);
                        setSelectedFloor(floor);
                        setSelectedRoom(null);
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {floors.map((floor) => (
                        <option key={floor._id} value={floor._id}>
                          {floor.name} ({floor.rooms?.length || 0} rooms)
                        </option>
                      ))}
                    </select>
                  </div>
                </Card>

                {/* Interactive Floor Plan */}
                <Card>
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {selectedFloor?.name || "Floor Plan"}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Click on a room to select it • Scroll to zoom • Drag to pan
                    </p>
                  </div>
                  <div className="min-h-[600px]">
                    <InteractiveFloorPlan
                      rooms={rooms}
                      selectedRoom={selectedRoom}
                      onRoomSelect={handleRoomClick}
                      width={800}
                      height={600}
                    />
                  </div>
                </Card>

                {/* Selected Room Details */}
                {selectedRoom && (
                  <Card>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Selected Room: {selectedRoom.name}
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Floor</p>
                        <p className="font-medium">
                          {selectedRoom.floor?.name ||
                            `Floor ${selectedRoom.floor?.floorNumber || "N/A"}`}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Capacity</p>
                        <p className="font-medium">{selectedRoom.capacity || 0} people</p>
                      </div>
                      {selectedRoom.description && (
                        <div className="col-span-2">
                          <p className="text-sm text-gray-600">Description</p>
                          <p className="font-medium">{selectedRoom.description}</p>
                        </div>
                      )}
                    </div>
                  </Card>
                )}
              </div>

              {/* Right Column: Booking Form */}
              <div className="lg:col-span-1">
                <Card>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Booking Details
                  </h3>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Date */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date *
                      </label>
                      <input
                        type="date"
                        value={formData.date}
                        onChange={(e) =>
                          setFormData({ ...formData, date: e.target.value })
                        }
                        min={new Date().toISOString().split("T")[0]}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    {/* Start Time */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Time *
                      </label>
                      <input
                        type="time"
                        value={formData.startTime}
                        onChange={(e) =>
                          setFormData({ ...formData, startTime: e.target.value })
                        }
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    {/* End Time */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        End Time *
                      </label>
                      <input
                        type="time"
                        value={formData.endTime}
                        onChange={(e) =>
                          setFormData({ ...formData, endTime: e.target.value })
                        }
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    {/* Purpose */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Purpose
                      </label>
                      <textarea
                        value={formData.purpose}
                        onChange={(e) =>
                          setFormData({ ...formData, purpose: e.target.value })
                        }
                        rows="3"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Meeting purpose..."
                      />
                    </div>

                    {/* Attendees */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Number of Attendees *
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formData.attendeesCount}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            attendeesCount: parseInt(e.target.value) || 1,
                          })
                        }
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    {/* Components */}
                    {components.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Required Equipment
                        </label>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {components.map((component) => (
                            <label
                              key={component._id}
                              className="flex items-center gap-2 p-2 border rounded hover:bg-gray-50 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={selectedComponents.includes(component._id)}
                                onChange={() => toggleComponent(component._id)}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              />
                              <span className="text-sm">
                                {component.name} ({component.type})
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      disabled={!selectedRoom || submitting}
                      className="w-full"
                    >
                      {submitting ? "Creating..." : "Create Booking"}
                    </Button>
                  </form>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default HRBookingPage;
