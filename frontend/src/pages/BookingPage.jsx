import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { bookingService } from "../services/bookingServices";
import { roomService } from "../services/roomService";
import { floorService } from "../services/floorService";
import { componentService } from "../services/componentService";
import { authService } from "../services/authService";

import AdminSidebar from "../components/AdminSidebar";
import HRSidebar from "../components/HRSidebar";

function BookingPage() {
  const navigate = useNavigate();

  // Logged user
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("create");

  // Form data
  const [formData, setFormData] = useState({
    room: "",
    date: "",
    startTime: "",
    endTime: "",
    purpose: "",
    attendeesCount: 1,
    components: [],
  });

  // Data from backend
  const [floors, setFloors] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [allRooms, setAllRooms] = useState([]);
  const [components, setComponents] = useState([]);
  const [myBookings, setMyBookings] = useState([]);

  // UI state
  const [selectedFloor, setSelectedFloor] = useState("");
  const [selectedRoom, setSelectedRoom] = useState("");
  const [selectedComponents, setSelectedComponents] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (activeTab === "my-bookings") {
      fetchMyBookings();
    }
  }, [activeTab]);

  // Load floors, rooms, components
  const fetchInitialData = async () => {
    try {
      setLoading(true);
      console.log('Fetching initial data...');
      
      const [fData, rData, cData] = await Promise.all([
        floorService.getAllFloors(),
        roomService.getAllRooms(),
        componentService.getAllComponents(),
      ]);

      console.log('Floors loaded:', fData);
      console.log('Rooms loaded:', rData);
      console.log('Components loaded:', cData);

      setFloors(fData || []);
      setAllRooms(rData || []);
      setRooms(rData || []);
      setComponents(cData || []);

      if (!rData || rData.length === 0) {
        setError("No rooms available. Please contact admin to add rooms.");
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.response?.data?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const fetchMyBookings = async () => {
    try {
      const data = await bookingService.getMyBookings();
      setMyBookings(data || []);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError(err.response?.data?.message || "Failed to load bookings");
    }
  };

  // Select floor → filter rooms
  const handleFloorChange = (floorId) => {
    console.log('Floor changed to:', floorId);
    setSelectedFloor(floorId);
    
    if (!floorId || floorId === "") {
      // Show all rooms
      console.log('Showing all rooms:', allRooms);
      setRooms(allRooms);
    } else {
      // Filter by floor
      const filtered = allRooms.filter((r) => {
        // Handle both populated and non-populated floor references
        const roomFloorId = typeof r.floor === 'object' ? r.floor._id : r.floor;
        return roomFloorId === floorId;
      });
      console.log('Filtered rooms for floor:', filtered);
      setRooms(filtered);
      
      if (filtered.length === 0) {
        setError("No rooms available on this floor.");
      }
    }
    
    // Reset selected room
    setFormData({ ...formData, room: "" });
  };

  // Select component
  const toggleComponent = (id) => {
    const selected = selectedComponents.includes(id)
      ? selectedComponents.filter((x) => x !== id)
      : [...selectedComponents, id];

    setSelectedComponents(selected);
  };

  // Form changes
  const handleInput = (e) => {
    const { name, value } = e.target;
    console.log('Form input changed:', name, value);
    setFormData({ ...formData, [name]: value });
    
    // Update selectedRoom when room is changed
    if (name === 'room') {
      setSelectedRoom(value);
    }
  };

  // Validate time (HH:mm)
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

  // Submit booking
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    console.log('Submitting booking:', formData);

    if (!formData.room) {
      setError("Please select a room");
      return;
    }

    if (!validateTime()) {
      setError("End time must be after start time");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        ...formData,
        attendeesCount: Number(formData.attendeesCount),
        components: selectedComponents,
      };

      console.log('Booking payload:', payload);

      await bookingService.createBooking(payload);

      setSuccess("Booking created successfully!");

      // Reset form
      setFormData({
        room: "",
        date: "",
        startTime: "",
        endTime: "",
        purpose: "",
        attendeesCount: 1,
        components: [],
      });
      setSelectedComponents([]);
      setSelectedFloor("");

      setTimeout(() => {
        setActiveTab("my-bookings");
      }, 1500);
    } catch (err) {
      console.error('Booking error:', err);
      setError(err.response?.data?.message || "Failed to create booking");
    } finally {
      setLoading(false);
    }
  };

  // Cancel booking
  const handleCancel = async (bookingId) => {
    if (!window.confirm("Cancel this booking?")) return;

    try {
      await bookingService.updateBooking(bookingId, { status: "cancelled" });
      setSuccess("Booking cancelled");
      fetchMyBookings();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to cancel booking");
    }
  };

  const role = user?.role?.toLowerCase();
  const isAdmin = role === "admin";

  return (
    <div className="min-h-screen flex bg-slate-50">
      {isAdmin ? <AdminSidebar /> : <HRSidebar />}

      <div className="flex-1 ml-64 p-6">
        <header className="bg-indigo-600 text-white p-4 rounded shadow mb-6">
          <h1 className="text-2xl font-bold">Room Booking</h1>
        </header>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 p-3 mb-4 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 p-3 mb-4 rounded">
            {success}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            className={`px-4 py-2 rounded ${
              activeTab === "create"
                ? "bg-indigo-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
            onClick={() => setActiveTab("create")}
          >
            Create Booking
          </button>

          <button
            className={`px-4 py-2 rounded ${
              activeTab === "my-bookings"
                ? "bg-indigo-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
            onClick={() => setActiveTab("my-bookings")}
          >
            My Bookings
          </button>
        </div>

        {/* CREATE BOOKING */}
        {activeTab === "create" && (
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow">
            {/* Debug Info - Remove in production */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mb-4 p-3 bg-gray-100 rounded text-xs">
                <p><strong>Debug Info:</strong></p>
                <p>Total Rooms: {allRooms.length}</p>
                <p>Filtered Rooms: {rooms.length}</p>
                <p>Selected Floor: {selectedFloor || 'None'}</p>
              </div>
            )}

            {/* Floor selection */}
            <div className="mb-6">
              <label className="block font-medium mb-2 text-gray-700">
                Select Floor (Optional)
              </label>
              <select
                value={selectedFloor}
                onChange={(e) => handleFloorChange(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Floors</option>
                {floors.map((f) => (
                  <option key={f._id} value={f._id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Room selection */}
            <div className="mb-6">
              <label className="block font-medium mb-2 text-gray-700">
                Select Room *
              </label>
              <select
                name="room"
                value={formData.room}
                onChange={handleInput}
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              >
                <option value="">-- Select a Room --</option>
                {rooms.length === 0 ? (
                  <option value="" disabled>No rooms available</option>
                ) : (
                  rooms.map((r) => (
                    <option key={r._id} value={r._id}>
                      {r.name} {r.capacity ? `(Capacity: ${r.capacity})` : ''}
                    </option>
                  ))
                )}
              </select>
              {rooms.length === 0 && allRooms.length > 0 && (
                <p className="text-sm text-amber-600 mt-1">
                  No rooms on this floor. Try selecting "All Floors"
                </p>
              )}
            </div>

            {/* Date */}
            <div className="mb-6">
              <label className="block font-medium mb-2 text-gray-700">
                Date *
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInput}
                min={new Date().toISOString().split('T')[0]}
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            {/* Times */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block font-medium mb-2 text-gray-700">
                  Start Time *
                </label>
                <input
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleInput}
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block font-medium mb-2 text-gray-700">
                  End Time *
                </label>
                <input
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleInput}
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>

            {/* Purpose */}
            <div className="mb-6">
              <label className="block font-medium mb-2 text-gray-700">
                Purpose
              </label>
              <textarea
                name="purpose"
                value={formData.purpose}
                onChange={handleInput}
                rows="3"
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Meeting purpose..."
              />
            </div>

            {/* Attendees */}
            <div className="mb-6">
              <label className="block font-medium mb-2 text-gray-700">
                Number of Attendees *
              </label>
              <input
                type="number"
                name="attendeesCount"
                value={formData.attendeesCount}
                onChange={handleInput}
                min="1"
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            {/* Components */}
            {components.length > 0 && (
              <div className="mb-6">
                <label className="block font-medium mb-3 text-gray-700">
                  Required Equipment
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {components.map((c) => (
                    <label
                      key={c._id}
                      className="flex items-center gap-2 p-3 border rounded hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedComponents.includes(c._id)}
                        onChange={() => toggleComponent(c._id)}
                        className="w-4 h-4"
                      />
                      <span>{c.name}</span>
                      {c.type && (
                        <span className="text-sm text-gray-500">({c.type})</span>
                      )}
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="bg-indigo-600 text-white px-6 py-3 rounded hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? "Creating..." : "Create Booking"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setFormData({
                    room: "",
                    date: "",
                    startTime: "",
                    endTime: "",
                    purpose: "",
                    attendeesCount: 1,
                    components: [],
                  });
                  setSelectedComponents([]);
                  setSelectedFloor("");
                  setError("");
                }}
                className="bg-gray-300 text-gray-700 px-6 py-3 rounded hover:bg-gray-400"
              >
                Reset
              </button>
            </div>
          </form>
        )}

        {/* MY BOOKINGS */}
        {activeTab === "my-bookings" && (
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-xl font-bold mb-4">My Bookings</h2>
            {myBookings.length === 0 ? (
              <p className="text-gray-500">No bookings found</p>
            ) : (
              <div className="space-y-4">
                {myBookings.map((b) => (
                  <div
                    key={b._id}
                    className="border rounded p-4 flex justify-between items-start hover:shadow-md transition"
                  >
                    <div className="space-y-1">
                      <p>
                        <strong>Room:</strong> {b.room?.name || 'N/A'}
                      </p>
                      <p>
                        <strong>Date:</strong> {new Date(b.date).toLocaleDateString()}
                      </p>
                      <p>
                        <strong>Time:</strong> {b.startTime} → {b.endTime}
                      </p>
                      <p>
                        <strong>Purpose:</strong> {b.purpose || 'N/A'}
                      </p>
                      <p>
                        <strong>Status:</strong>{" "}
                        <span
                          className={`px-2 py-1 rounded text-sm ${
                            b.status === "booked"
                              ? "bg-green-100 text-green-800"
                              : b.status === "cancelled"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {b.status}
                        </span>
                      </p>
                    </div>

                    {b.status === "booked" && (
                      <button
                        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                        onClick={() => handleCancel(b._id)}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default BookingPage;