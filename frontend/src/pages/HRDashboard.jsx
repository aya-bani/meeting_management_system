// frontend/src/pages/HRDashboard.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { bookingService } from '../services/bookingServices';
import { roomService } from '../services/roomService';
import { componentService } from '../services/componentService';
import HRSidebar from '../components/HRSidebar';

function HRDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    myBookings: 0,
    upcomingBookings: 0,
    totalRooms: 0,
  });
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    fetchHRData();
  }, []);

  const fetchHRData = async () => {
    try {
      setLoading(true);
      
      const [myBookingsData, roomsData, allBookingsData, componentsData] = await Promise.all([
        bookingService.getMyBookings(),
        roomService.getAllRooms(),
        bookingService.getAllBookings(),
        componentService.getAllComponents(),
      ]);

      // Filter upcoming bookings
      const upcoming = myBookingsData.filter(
        b => new Date(b.startTime) > new Date() && b.status !== 'cancelled'
      );

      // Get currently active bookings to determine available rooms
      const now = new Date();
      const activeBookings = allBookingsData.filter(
        b => new Date(b.startTime) <= now && new Date(b.endTime) > now && b.status === 'confirmed'
      );
      const bookedRoomIds = activeBookings.map(b => b.room?._id || b.room);

      // Mark rooms with their components and availability
      const roomsWithComponents = roomsData.map(room => {
        const roomComponents = componentsData.filter(comp => 
          room.components && room.components.includes(comp._id)
        );
        return {
          ...room,
          components: roomComponents,
          isAvailable: !bookedRoomIds.includes(room._id)
        };
      });

      setStats({
        myBookings: myBookingsData.length,
        upcomingBookings: upcoming.length,
        totalRooms: roomsData.length,
      });

      setUpcomingBookings(upcoming.slice(0, 5));
      setAvailableRooms(roomsWithComponents);
      setAllBookings(allBookingsData);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
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
      <HRSidebar />
      <div className="flex-1 ml-64">
        {/* Header */}
        <header className="bg-gradient-to-r from-indigo-600 to-purple-700 shadow-lg">
          <div className="px-6 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-white">HR Manager Dashboard</h1>
                <p className="text-indigo-100 mt-1">Welcome back, {user?.name || user?.email}!</p>
              </div>
              <div className="flex items-center space-x-4">
                <span className="px-3 py-1 bg-indigo-400 text-slate-900 rounded-full text-sm font-medium">
                  HR Manager
                </span>
              </div>
            </div>
          </div>
        </header>

        <main className="px-6 py-8">
        {/* Error Message */}
        {error && (
          <div className="bg-indigo-50 border border-amber-200 text-indigo-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Quick Actions for HR */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => navigate('/bookings')}
              className="bg-slate-50 p-6 rounded-lg shadow hover:shadow-md transition text-left"
            >
              <div className="flex items-center">
                <div className="bg-indigo-100 p-3 rounded-lg">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="font-semibold text-slate-900">Book a Meeting Room</h3>
                  <p className="text-sm text-slate-600">Schedule a new meeting</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => navigate('/bookings')}
              className="bg-slate-50 p-6 rounded-lg shadow hover:shadow-md transition text-left"
            >
              <div className="flex items-center">
                <div className="bg-indigo-100 p-3 rounded-lg">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="font-semibold text-slate-900">View My Bookings</h3>
                  <p className="text-sm text-slate-600">Manage your reservations</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Stats Cards - HR Focused */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">My Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-50 p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">My Total Bookings</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">{stats.myBookings}</p>
                </div>
                <div className="bg-indigo-100 p-3 rounded-full">
                  <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Upcoming Meetings</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">{stats.upcomingBookings}</p>
                </div>
                <div className="bg-indigo-100 p-3 rounded-full">
                  <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Available Rooms</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">{stats.totalRooms}</p>
                </div>
                <div className="bg-indigo-100 p-3 rounded-full">
                  <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Available Rooms with Components */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-slate-900">Available Rooms & Components</h2>
            <button
              onClick={() => navigate('/bookings')}
              className="text-indigo-600 hover:text-indigo-800 font-medium"
            >
              Book a Room →
            </button>
          </div>
          
          <div className="bg-slate-50 rounded-lg shadow overflow-hidden">
            {availableRooms.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <p>No rooms available</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-200">
                {availableRooms.map((room) => (
                  <div key={room._id} className="p-6 hover:bg-slate-50 transition">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <div className="bg-indigo-100 p-2 rounded-lg mr-4">
                            <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-slate-900">
                              {room.name}
                            </h3>
                            <p className="text-sm text-slate-600 mt-1">
                              Floor {room.floor?.floorNumber || 'N/A'} • Capacity: {room.capacity} people
                            </p>
                            {room.components && room.components.length > 0 && (
                              <div className="mt-3">
                                <p className="text-sm font-medium text-slate-700 mb-2">Components:</p>
                                <div className="flex flex-wrap gap-2">
                                  {room.components.map((component) => (
                                    <span
                                      key={component._id}
                                      className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded text-xs"
                                    >
                                      {component.name} ({component.type})
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            {(!room.components || room.components.length === 0) && (
                              <p className="text-sm text-slate-500 mt-2">No components available</p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          room.isAvailable
                            ? 'bg-indigo-100 text-indigo-800'
                            : 'bg-white-200 text-slate-600'
                        }`}>
                          {room.isAvailable ? 'Available' : 'Occupied'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* My Bookings */}
        <div>
          {/* <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-slate-900">My Bookings</h2>
            <button
              onClick={() => navigate('/bookings')}
              className="text-indigo-600 hover:text-indigo-800 font-medium"
            >
              View All →
            </button>
          </div> */}
          <div className="bg-slate-50 rounded-lg shadow overflow-hidden">
            {upcomingBookings.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <svg className="w-16 h-16 mx-auto text-slate-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-lg font-medium">No bookings yet</p>
                <button
                  onClick={() => navigate('/bookings')}
                  className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                  Book a Room
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-200">
                {upcomingBookings.map((booking) => (
                  <div key={booking._id} className="p-6 hover:bg-slate-50 transition">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <div className="bg-indigo-100 p-2 rounded-lg mr-4">
                            <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-slate-900">
                              {booking.room?.name || 'Room'}
                            </h3>
                            <p className="text-sm text-slate-600 mt-1">{booking.purpose}</p>
                            <div className="flex items-center mt-2 text-sm text-slate-500">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              {new Date(booking.startTime).toLocaleDateString('en-US', { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}
                            </div>
                            <div className="flex items-center mt-1 text-sm text-slate-500">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                              {new Date(booking.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          booking.status === 'confirmed' 
                            ? 'bg-indigo-100 text-indigo-800' 
                            : 'bg-indigo-100 text-indigo-800'
                        }`}>
                          {booking.status}
                        </span>
                        <p className="text-sm text-slate-500 mt-2">
                          {booking.attendees} attendees
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        </main>
      </div>
    </div>
  );
}

export default HRDashboard;