// frontend/src/pages/AdminDashboard.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { bookingService } from '../services/bookingServices';
import { roomService } from '../services/roomService';
import { componentService } from '../services/componentService';
import { floorService } from '../services/floorService';
import AdminSidebar from '../components/AdminSidebar';
import AddRoomForm from '../components/admin/AddRoomForm';
import AddFloorForm from '../components/admin/AddFloorForm';
import AddComponentForm from '../components/admin/AddComponentForm';
import ComponentRoomReports from '../components/admin/ComponentRoomReports';

function AdminDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalRooms: 0,
    totalComponents: 0,
    totalFloors: 0,
    activeBookings: 0,
    pendingBookings: 0,
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [components, setComponents] = useState([]);
  const [floors, setFloors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Modal states
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [showFloorModal, setShowFloorModal] = useState(false);
  const [showComponentModal, setShowComponentModal] = useState(false);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      
      const [bookingsData, roomsData, componentsData, floorsData] = await Promise.all([
        bookingService.getAllBookings(),
        roomService.getAllRooms(),
        componentService.getAllComponents(),
        floorService.getAllFloors(),
      ]);
      
      setFloors(floorsData);
      setRooms(roomsData);
      setComponents(componentsData);

      const activeBookings = bookingsData.filter(
        b => new Date(b.endTime) > new Date() && b.status !== 'cancelled'
      );

      const pendingBookings = bookingsData.filter(b => b.status === 'pending');

      setStats({
        totalBookings: bookingsData.length,
        totalRooms: roomsData.length,
        totalComponents: componentsData.length,
        totalFloors: floorsData.length,
        activeBookings: activeBookings.length,
        pendingBookings: pendingBookings.length,
      });

      setRecentBookings(bookingsData.slice(0, 5));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptBooking = async (bookingId) => {
    setError('');
    setSuccess('');
    try {
      await bookingService.updateBooking(bookingId, { status: 'confirmed' });
      setSuccess('Booking accepted successfully!');
      fetchAdminData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to accept booking');
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }
    
    setError('');
    setSuccess('');
    try {
      await bookingService.updateBooking(bookingId, { status: 'cancelled' });
      setSuccess('Booking cancelled successfully!');
      fetchAdminData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel booking');
    }
  };

  const handleDeleteRoom = async (roomId) => {
    if (!window.confirm('Are you sure you want to delete this room?')) {
      return;
    }
    
    setError('');
    setSuccess('');
    try {
      await roomService.deleteRoom(roomId);
      setSuccess('Room deleted successfully!');
      fetchAdminData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete room');
    }
  };

  const handleDeleteFloor = async (floorId) => {
    if (!window.confirm('Are you sure you want to delete this floor?')) {
      return;
    }
    
    setError('');
    setSuccess('');
    try {
      await floorService.deleteFloor(floorId);
      setSuccess('Floor deleted successfully!');
      fetchAdminData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete floor');
    }
  };

  const handleDeleteComponent = async (componentId) => {
    if (!window.confirm('Are you sure you want to delete this component?')) {
      return;
    }
    
    setError('');
    setSuccess('');
    try {
      await componentService.deleteComponent(componentId);
      setSuccess('Component deleted successfully!');
      fetchAdminData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete component');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <AdminSidebar />
      <div className="flex-1 ml-64">
        {/* Header */}
        <header className="bg-gradient-to-r from-indigo-600 to-purple-700 shadow-lg">
          <div className="px-6 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-indigo-100 mt-1">System Overview & Management</p>
              </div>
              <div className="flex items-center space-x-4">
                <span className="px-3 py-1 bg-indigo-400 text-slate-900 rounded-full text-sm font-bold">
                  Administrator
                </span>
              </div>
            </div>
          </div>
        </header>

        <main className="px-6 py-8">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}
          
          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
              {success}
            </div>
          )}

          {/* Admin Quick Actions */}
      

          {/* Stats Cards */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">System Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-600">Total Bookings</p>
                    <p className="text-2xl font-bold text-slate-800 mt-1">{stats.totalBookings}</p>
                  </div>
                  <div className="bg-indigo-100 p-2 rounded-lg">
                    <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-600">Active Now</p>
                    <p className="text-2xl font-bold text-indigo-600 mt-1">{stats.activeBookings}</p>
                  </div>
                  <div className="bg-indigo-100 p-2 rounded-lg">
                    <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-600">Pending</p>
                    <p className="text-2xl font-bold text-indigo-600 mt-1">{stats.pendingBookings}</p>
                  </div>
                  <div className="bg-indigo-100 p-2 rounded-lg">
                    <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-600">Total Rooms</p>
                    <p className="text-2xl font-bold text-indigo-600 mt-1">{stats.totalRooms}</p>
                  </div>
                  <div className="bg-indigo-100 p-2 rounded-lg">
                    <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-600">Components</p>
                    <p className="text-2xl font-bold text-indigo-600 mt-1">{stats.totalComponents}</p>
                  </div>
                  <div className="bg-indigo-100 p-2 rounded-lg">
                    <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-600">Floors</p>
                    <p className="text-2xl font-bold text-indigo-600 mt-1">{stats.totalFloors}</p>
                  </div>
                  <div className="bg-indigo-100 p-2 rounded-lg">
                    <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Manage Rooms Section */}
          {/* <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-slate-800">Manage Rooms</h2>
            </div>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {rooms.length === 0 ? (
                <div className="p-8 text-center text-slate-500">No rooms yet</div>
              ) : (
                <div className="divide-y divide-slate-200">
                  {rooms.map((room) => (
                    <div key={room._id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                      <div>
                        <h3 className="font-semibold text-slate-800">{room.name}</h3>
                        <p className="text-sm text-slate-600">Floor {room.floor?.floorNumber || 'N/A'} • Capacity: {room.capacity}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteRoom(room._id)}
                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div> */}

          {/* Manage Floors Section */}
          {/* <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-slate-800">Manage Floors</h2>
            </div>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {floors.length === 0 ? (
                <div className="p-8 text-center text-slate-500">No floors yet</div>
              ) : (
                <div className="divide-y divide-slate-200">
                  {floors.map((floor) => (
                    <div key={floor._id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                      <div>
                        <h3 className="font-semibold text-slate-800">Floor {floor.floorNumber} - {floor.name}</h3>
                        {floor.description && <p className="text-sm text-slate-600">{floor.description}</p>}
                      </div>
                      <button
                        onClick={() => handleDeleteFloor(floor._id)}
                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div> */}

          {/* Component Reports - Now using separate component */}
          <ComponentRoomReports
            components={components}
            rooms={rooms}
            floors={floors}
            onDeleteComponent={handleDeleteComponent}
          />

          {/* All Bookings Table */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-slate-800">Recent Bookings</h2>
              <button
                onClick={() => navigate('/admin/bookings')}
                className="text-indigo-600 hover:text-indigo-800 font-medium"
              >
                View All →
              </button>
            </div>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {recentBookings.length === 0 ? (
                <div className="p-8 text-center text-slate-500">No bookings yet.</div>
              ) : (
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Room</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Booked By</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date & Time</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Purpose</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {recentBookings.map((booking) => (
                      <tr key={booking._id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-slate-800">{booking.room?.name || 'N/A'}</div>
                          <div className="text-sm text-slate-500">Floor {booking.room?.floor?.floorNumber}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-slate-800">{booking.bookedBy?.name || booking.bookedBy?.email || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-slate-800">{new Date(booking.startTime).toLocaleDateString()}</div>
                          <div className="text-sm text-slate-500">{new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-slate-800 max-w-xs truncate">{booking.purpose}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            booking.status === 'confirmed' 
                              ? 'bg-green-100 text-green-800' 
                              : booking.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {booking.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex space-x-2">
                            {booking.status === 'pending' && (
                              <button
                                onClick={() => handleAcceptBooking(booking._id)}
                                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition"
                              >
                                Accept
                              </button>
                            )}
                            {booking.status !== 'cancelled' && (
                              <button
                                onClick={() => handleCancelBooking(booking._id)}
                                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition"
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Modals - Now using separate components */}
      <AddRoomForm
        showModal={showRoomModal}
        onClose={() => setShowRoomModal(false)}
        onSuccess={fetchAdminData}
      />

      <AddFloorForm
        showModal={showFloorModal}
        onClose={() => setShowFloorModal(false)}
        onSuccess={fetchAdminData}
      />

      <AddComponentForm
        showModal={showComponentModal}
        onClose={() => setShowComponentModal(false)}
        onSuccess={fetchAdminData}
      />
    </div>
  );
}

export default AdminDashboard;