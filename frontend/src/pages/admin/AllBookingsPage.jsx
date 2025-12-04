import { useEffect, useState, useMemo } from "react";

import AdminSidebar from "../../components/AdminSidebar";
import { bookingService } from "../../services/bookingServices";
import { floorService } from "../../services/floorService";

function AllBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [floors, setFloors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [floorFilter, setFloorFilter] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const [bookingsData, floorsData] = await Promise.all([
          bookingService.getAllBookings(),
          floorService.getAllFloors(),
        ]);

        setBookings(bookingsData || []);
        setFloors(floorsData || []);
      } catch (err) {
        console.error("Error fetching bookings/floors:", err);
        setError(err?.response?.data?.message || "Failed to load bookings");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter bookings by date and floor
  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      // Filter by date
      if (dateFilter) {
        const bookingDate = booking.date
          ? new Date(booking.date).toISOString().split("T")[0]
          : null;
        if (bookingDate !== dateFilter) {
          return false;
        }
      }

      // Filter by floor
      if (floorFilter) {
        const roomFloorId =
          booking.room?.floor && typeof booking.room.floor === "object"
            ? booking.room.floor._id
            : booking.room?.floor;
        if (roomFloorId !== floorFilter) {
          return false;
        }
      }

      return true;
    });
  }, [bookings, dateFilter, floorFilter]);

  return (
    <div className="min-h-screen flex bg-slate-50">
      <AdminSidebar />

      <div className="flex-1 ml-64 p-6">
        <header className="bg-indigo-600 text-white p-4 rounded shadow mb-6">
          <h1 className="text-2xl font-bold">All Bookings</h1>
          <p className="text-indigo-100 text-sm mt-1">
            View all room bookings in the system.
          </p>
        </header>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 p-3 mb-4 rounded">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded shadow p-4 mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Filter by Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Date
              </label>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Filter by Floor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Floor
              </label>
              <select
                value={floorFilter}
                onChange={(e) => setFloorFilter(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Floors</option>
                {floors.map((floor) => (
                  <option key={floor._id} value={floor._id}>
                    {floor.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Clear Filters Button */}
          {(dateFilter || floorFilter) && (
            <div className="mt-4">
              <button
                onClick={() => {
                  setDateFilter("");
                  setFloorFilter("");
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition text-sm"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>

        <div className="bg-white rounded shadow p-4">
          {loading ? (
            <p className="text-gray-500">Loading bookings...</p>
          ) : filteredBookings.length === 0 ? (
            <p className="text-gray-500">
              {bookings.length === 0
                ? "No bookings found."
                : "No bookings match the selected filters."}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <div className="mb-4 text-sm text-gray-600">
                Showing {filteredBookings.length} of {bookings.length} bookings
              </div>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Room
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Floor
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      HR Manager
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Attendees
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Purpose
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredBookings.map((b) => (
                    <tr key={b._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {b.room?.name || "N/A"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                        {b.room?.floor?.name ||
                          (b.room?.floor &&
                            floors.find((f) => f._id === b.room.floor)?.name) ||
                          "N/A"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                        {b.date ? new Date(b.date).toLocaleDateString() : "N/A"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                        {b.startTime} – {b.endTime}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                        {b.hr?.name ||
                          b.hr?.fullName ||
                          b.hr?.email ||
                          b.user?.name ||
                          b.user?.fullName ||
                          b.user?.email ||
                          "N/A"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                        {b.attendeesCount ?? "-"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            b.status === "booked"
                              ? "bg-green-100 text-green-800"
                              : b.status === "cancelled"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {b.status || "N/A"}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 max-w-xs truncate">
                        {b.purpose || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AllBookingsPage;


