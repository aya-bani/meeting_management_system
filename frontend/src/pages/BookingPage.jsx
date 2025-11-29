// frontend/src/pages/BookingPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingService } from '../services/bookingServices';
import { roomService } from '../services/roomService';
import { floorService } from '../services/floorService';
import { componentService } from '../services/componentService';
import { authService } from '../services/authService';

function BookingPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('create'); // 'create' or 'my-bookings'
  
  // Form state
  const [formData, setFormData] = useState({
    room: '',
    startTime: '',
    endTime: '',
    purpose: '',
    attendees: 1,
    components: [],
  });

  // Data lists
  const [floors, setFloors] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [allRooms, setAllRooms] = useState([]);
  const [components, setComponents] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  
  // UI state
  const [selectedFloor, setSelectedFloor] = useState('');
  const [selectedComponents, setSelectedComponents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (activeTab === 'my-bookings') {
      fetchMyBookings();
    }
  }, [activeTab]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [floorsData, roomsData, componentsData] = await Promise.all([
        floorService.getAllFloors(),
        roomService.getAllRooms(),
        componentService.getAllComponents(),
      ]);
      
      setFloors(floorsData);
      setAllRooms(roomsData);
      setRooms(roomsData);
      setComponents(componentsData);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyBookings = async () => {
    try {
      setLoading(true);
      const data = await bookingService.getMyBookings();
      setMyBookings(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleFloorChange = (floorId) => {
    setSelectedFloor(floorId);
    if (floorId) {
      const filteredRooms = allRooms.filter(room => room.floor === floorId);
      setRooms(filteredRooms);
    } else {
      setRooms(allRooms);
    }
    setFormData({ ...formData, room: '' });
  };

  const handleComponentToggle = (componentId) => {
    const isSelected = selectedComponents.includes(componentId);
    if (isSelected) {
      setSelectedComponents(selectedComponents.filter(id => id !== componentId));
    } else {
      setSelectedComponents([...selectedComponents, componentId]);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (new Date(formData.startTime) >= new Date(formData.endTime)) {
      setError('End time must be after start time');
      return;
    }

    try {
      setLoading(true);
      const bookingData = {
        ...formData,
        components: selectedComponents,
      };
      
      await bookingService.createBooking(bookingData);
      setSuccess('Booking created successfully!');
      
      // Reset form
      setFormData({
        room: '',
        startTime: '',
        endTime: '',
        purpose: '',
        attendees: 1,
        components: [],
      });
      setSelectedComponents([]);
      setSelectedFloor('');
      
      // Refresh bookings after 2 seconds
      setTimeout(() => {
        setActiveTab('my-bookings');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      setLoading(true);
      await bookingService.updateBooking(bookingId, { status: 'cancelled' });
      setSuccess('Booking cancelled successfully');
      fetchMyBookings();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel booking');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="bg-stone-50 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-stone-900">Meeting Room Booking</h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 text-stone-700 hover:text-stone-900 transition"
              >
                ← Back to Dashboard
              </button>
              <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
                {user?.role === 'admin' ? 'Admin' : 'Manager'}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-stone-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('create')}
                className={`${
                  activeTab === 'create'
                    ? 'border-amber-500 text-amber-600'
                    : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition`}
              >
                Create Booking
              </button>
              <button
                onClick={() => setActiveTab('my-bookings')}
                className={`${
                  activeTab === 'my-bookings'
                    ? 'border-amber-500 text-amber-600'
                    : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition`}
              >
                My Bookings
              </button>
            </nav>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}

        {/* Create Booking Tab */}
        {activeTab === 'create' && (
          <div className="bg-stone-50 rounded-lg shadow p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Floor Selection */}
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    Select Floor (Optional)
                  </label>
                  <select
                    value={selectedFloor}
                    onChange={(e) => handleFloorChange(e.target.value)}
                    className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  >
                    <option value="">All Floors</option>
                    {floors.map((floor) => (
                      <option key={floor._id} value={floor._id}>
                        Floor {floor.floorNumber} - {floor.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Room Selection */}
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    Select Room *
                  </label>
                  <select
                    name="room"
                    value={formData.room}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  >
                    <option value="">Choose a room...</option>
                    {rooms.map((room) => (
                      <option key={room._id} value={room._id}>
                        {room.name} (Capacity: {room.capacity})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Start Time */}
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    Start Time *
                  </label>
                  <input
                    type="datetime-local"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>

                {/* End Time */}
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    End Time *
                  </label>
                  <input
                    type="datetime-local"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>

                {/* Number of Attendees */}
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    Number of Attendees *
                  </label>
                  <input
                    type="number"
                    name="attendees"
                    value={formData.attendees}
                    onChange={handleInputChange}
                    min="1"
                    required
                    className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>

                {/* Purpose */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    Meeting Purpose *
                  </label>
                  <textarea
                    name="purpose"
                    value={formData.purpose}
                    onChange={handleInputChange}
                    required
                    rows="3"
                    className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="Brief description of the meeting..."
                  />
                </div>
              </div>

              {/* Components Selection */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-3">
                  Required Equipment (Optional)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {components.map((component) => (
                    <div
                      key={component._id}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition ${
                        selectedComponents.includes(component._id)
                          ? 'border-amber-500 bg-amber-50'
                          : 'border-stone-200 hover:border-stone-300'
                      }`}
                      onClick={() => handleComponentToggle(component._id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-stone-900">{component.name}</h4>
                          <p className="text-sm text-stone-600">{component.type}</p>
                          <p className="text-xs text-stone-500 mt-1">
                            Available: {component.quantity - (component.inUse || 0)}
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={selectedComponents.includes(component._id)}
                          onChange={() => {}}
                          className="h-5 w-5 text-amber-600"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="px-6 py-2 border border-stone-300 text-stone-700 rounded-lg hover:bg-stone-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating...' : 'Create Booking'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* My Bookings Tab */}
        {activeTab === 'my-bookings' && (
          <div className="bg-stone-50 rounded-lg shadow overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto"></div>
                <p className="mt-2 text-stone-600">Loading bookings...</p>
              </div>
            ) : myBookings.length === 0 ? (
              <div className="p-8 text-center text-stone-500">
                <svg className="w-16 h-16 mx-auto text-stone-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-lg font-medium">No bookings yet</p>
                <p className="text-sm mt-1">Create your first booking to get started!</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-stone-200">
                  <thead className="bg-stone-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                        Room
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                        Date & Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                        Purpose
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                        Attendees
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-stone-50 divide-y divide-stone-200">
                    {myBookings.map((booking) => (
                      <tr key={booking._id} className="hover:bg-stone-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-stone-900">
                            {booking.room?.name || 'N/A'}
                          </div>
                          <div className="text-sm text-stone-500">
                            Floor {booking.room?.floor?.floorNumber}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-stone-900">
                            {new Date(booking.startTime).toLocaleDateString()}
                          </div>
                          <div className="text-sm text-stone-500">
                            {new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(booking.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-stone-900">{booking.purpose}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-900">
                          {booking.attendees}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            booking.status === 'confirmed' 
                              ? 'bg-amber-100 text-amber-800' 
                              : booking.status === 'pending'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {booking.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {booking.status !== 'cancelled' && (
                            <button
                              onClick={() => handleCancelBooking(booking._id)}
                              className="text-amber-600 hover:text-amber-900 font-medium"
                            >
                              Cancel
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default BookingPage;