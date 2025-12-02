// frontend/src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { authService } from './services/authService';

// Pages
import Login from './pages/Login';
import HRDashboard from './pages/HRDashboard';
import AdminDashboard from './pages/AdminDashboard';
import BookingPage from './pages/BookingPage';
import AllBookingsPage from './pages/admin/AllBookingsPage';
import RoomsPage from './pages/admin/RoomsPage';
import ComponentsPage from './pages/admin/ComponentsPage';
import FloorsPage from './pages/admin/FloorsPage';

// Protected Route Component
function ProtectedRoute({ children, allowedRoles }) {
  const isAuthenticated = authService.isAuthenticated();
  const user = authService.getCurrentUser();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user?.role) {
    // Case-insensitive role check
    const userRole = user.role.toLowerCase().trim();
    const normalizedAllowedRoles = allowedRoles.map(role => role.toLowerCase().trim());
    
    if (!normalizedAllowedRoles.includes(userRole)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children;
}

// Role-based Dashboard Redirect Component
function DashboardRedirect() {
  const user = authService.getCurrentUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Get and normalize the role
  const roleValue = user.role || user.userRole || user.roleName || user.type;
  const userRole = roleValue ? String(roleValue).toLowerCase().trim() : '';
  
  // Check for admin role FIRST
  if (userRole === 'admin' || userRole === 'administrator') {
    return <Navigate to="/admin/dashboard" replace />;
  } 
  
  // Then check for HR
  if (userRole === 'hr' || userRole === 'hr_manager' || userRole === 'hrmanager') {
    return <Navigate to="/hr/dashboard" replace />;
  } 
  
  // Default fallback to HR dashboard
  return <Navigate to="/admin/dashboard" replace />;
}

// Unauthorized Page
function Unauthorized() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50">
      <div className="text-center">
        <div className="bg-amber-100 p-6 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
          <svg className="w-12 h-12 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-stone-900 mb-2">Access Denied</h1>
        <p className="text-stone-600 mb-6">You don't have permission to access this page.</p>
        <button
          onClick={() => window.location.href = '/dashboard'}
          className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Dashboard Route - Redirects based on role */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardRedirect />
            </ProtectedRoute>
          } 
        />

        {/* HR Manager Routes - ONLY HR can access */}
        <Route 
          path="/hr/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['hr']}>
              <HRDashboard />
            </ProtectedRoute>
          } 
        />

        {/* Admin Routes - ONLY Admin can access */}
        <Route 
          path="/admin/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />

        {/* Shared Routes (Both HR and Admin can access) */}
        <Route 
          path="/bookings" 
          element={
            <ProtectedRoute allowedRoles={['hr', 'admin']}>
              <BookingPage />
            </ProtectedRoute>
          } 
        />

        {/* Admin Only Routes */}
        <Route 
          path="/admin/rooms" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <RoomsPage />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/admin/components" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ComponentsPage />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/admin/floors" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'administrator']}>
              <FloorsPage />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/admin/reports" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'administrator']}>
              <div className="p-8 text-center">
                <h1 className="text-2xl font-bold">Reports & Analytics</h1>
                <p className="text-gray-600 mt-2">Coming soon...</p>
              </div>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/admin/bookings" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'administrator']}>
              <AllBookingsPage />
            </ProtectedRoute>
          } 
        />

        {/* Default Route */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} /> 

        {/* 404 Page */}
        <Route 
          path="*" 
          element={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
                <p className="text-xl text-gray-600 mb-6">Page not found</p>
                <button
                  onClick={() => window.location.href = '/dashboard'}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Go to Dashboard
                </button>
              </div>
            </div>
          } 
        />
      </Routes> 
    </BrowserRouter>
  );
}

export default App;