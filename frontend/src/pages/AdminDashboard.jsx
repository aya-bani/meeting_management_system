// frontend/src/pages/AdminDashboard.jsx
import { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { bookingService } from '../services/bookingServices';
import { roomService } from '../services/roomService';
import { componentService } from '../services/componentService';
import { floorService } from '../services/floorService';
import AdminSidebar from '../components/AdminSidebar';
import AddRoomForm from '../components/admin/AddRoomForm';
import AddFloorForm from '../components/admin/AddFloorForm';
import AddComponentForm from '../components/admin/AddComponentForm';
import SystemOverview from '../components/admin/SystemOverview';
import ManageComponents from '../components/admin/ManageComponents';
import RecentBookings from '../components/admin/RecentBookings';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';

function AdminDashboard() {
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
        b => new Date(b.endTime) > new Date() && b.status !== 'canceled'
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
      await bookingService.cancelBooking(bookingId);
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
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <PageHeader
          title="Admin Dashboard"
          description="Central overview of bookings, rooms, and system health."
          actions={
            <>
              <span className="hidden md:inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
                Administrator
              </span>
            </>
          }
        />

        <main className="px-8 py-6 flex-1 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}
          
          {/* Success Message */}
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center gap-2">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{success}</span>
            </div>
          )}

          {/* Quick admin actions */}
          <section className="mb-4">
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="primary"
                onClick={() => setShowRoomModal(true)}
              >
                Add Room
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setShowFloorModal(true)}
              >
                Add Floor
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setShowComponentModal(true)}
              >
                Add Component
              </Button>
            </div>
          </section>

          {/* System Overview Component */}
          <SystemOverview stats={stats} />

          {/* Manage Components Component */}
          <ManageComponents
            components={components}
            rooms={rooms}
            floors={floors}
            onDeleteComponent={handleDeleteComponent}
          />

          {/* Recent Bookings Component */}
          <RecentBookings
            bookings={recentBookings}
            onAcceptBooking={handleAcceptBooking}
            onCancelBooking={handleCancelBooking}
          />
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