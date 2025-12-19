import { useEffect, useState } from "react";
import AdminSidebar from "../../components/AdminSidebar";
import { reportService } from "../../services/reportService";
import { bookingService } from "../../services/bookingServices";
import { roomService } from "../../services/roomService";
import { componentService } from "../../services/componentService";
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import FilterBar from "../../components/ui/FilterBar";
import KpiCard from "../../components/ui/KpiCard";
import DataTable from "../../components/ui/DataTable";

function ReportsPage() {
  const [activeTab, setActiveTab] = useState("issues"); // issues, bookings, utilization, components
  const [reports, setReports] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Filters
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [roomFilter, setRoomFilter] = useState("");
  const [organizerFilter, setOrganizerFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");

  // Summary stats
  const [summaryStats, setSummaryStats] = useState({
    totalIssues: 0,
    pendingIssues: 0,
    fixedIssues: 0,
    totalBookings: 0,
    confirmedBookings: 0,
    canceledBookings: 0,
    totalRooms: 0,
    totalComponents: 0,
  });

  useEffect(() => {
    fetchAllData();
  }, [statusFilter, dateFrom, dateTo, roomFilter, organizerFilter, priorityFilter, activeTab]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError("");

      // Fetch issue reports
      const reportsData = await reportService.getAllReports(statusFilter || undefined);
      let filteredReports = reportsData || [];

      // Apply filters
      if (dateFrom) {
        filteredReports = filteredReports.filter(
          (r) => new Date(r.createdAt) >= new Date(dateFrom)
        );
      }
      if (dateTo) {
        filteredReports = filteredReports.filter(
          (r) => new Date(r.createdAt) <= new Date(dateTo + "T23:59:59")
        );
      }
      if (roomFilter) {
        filteredReports = filteredReports.filter(
          (r) => r.room?._id === roomFilter || r.room?._id === roomFilter
        );
      }
      if (priorityFilter) {
        filteredReports = filteredReports.filter((r) => r.priority === priorityFilter);
      }
      setReports(filteredReports);

      // Fetch bookings for booking reports
      const bookingsData = await bookingService.getAllBookings();
      let filteredBookings = bookingsData || [];

      // Apply date filters to bookings
      if (dateFrom) {
        filteredBookings = filteredBookings.filter(
          (b) => new Date(b.date || b.startTime) >= new Date(dateFrom)
        );
      }
      if (dateTo) {
        filteredBookings = filteredBookings.filter(
          (b) => new Date(b.date || b.startTime) <= new Date(dateTo + "T23:59:59")
        );
      }
      if (roomFilter) {
        filteredBookings = filteredBookings.filter(
          (b) => b.room?._id === roomFilter || b.room === roomFilter
        );
      }
      if (organizerFilter) {
        filteredBookings = filteredBookings.filter(
          (b) => b.hr?._id === organizerFilter || b.bookedBy?._id === organizerFilter
        );
      }
      setBookings(filteredBookings);

      // Fetch rooms and components for utilization reports
      const roomsData = await roomService.getAllRooms();
      setRooms(roomsData || []);

      const componentsData = await componentService.getAllComponents();
      setComponents(componentsData || []);

      // Calculate summary stats
      const pendingIssues = filteredReports.filter((r) => r.status === "pending").length;
      const fixedIssues = filteredReports.filter((r) => r.status === "fixed").length;
      const confirmedBookings = filteredBookings.filter((b) => b.status === "confirmed" || b.status === "booked").length;
      const canceledBookings = filteredBookings.filter((b) => b.status === "canceled").length;

      setSummaryStats({
        totalIssues: filteredReports.length,
        pendingIssues,
        fixedIssues,
        totalBookings: filteredBookings.length,
        confirmedBookings,
        canceledBookings,
        totalRooms: roomsData?.length || 0,
        totalComponents: componentsData?.length || 0,
      });
    } catch (err) {
      console.error("Error fetching reports:", err);
      setError(err?.response?.data?.message || "Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (reportId, newStatus) => {
    try {
      setError("");
      setSuccess("");

      await reportService.updateReport(reportId, { status: newStatus });
      setSuccess("Report status updated successfully");
      fetchAllData();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Error updating report:", err);
      setError(err?.response?.data?.message || "Failed to update report status");
    }
  };

  // Export functions
  const exportToCSV = () => {
    let csvContent = "";
    let headers = [];
    let rows = [];

    if (activeTab === "issues") {
      headers = ["Room", "Component", "Issue", "Priority", "Status", "Reported By", "Reported Date"];
      rows = reports.map((r) => [
        r.room?.name || "N/A",
        r.component?.name || "Room Issue",
        r.issue || "",
        r.priority || "medium",
        r.status || "pending",
        r.reportedBy?.name || r.reportedBy?.email || "N/A",
        r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "N/A",
      ]);
    } else if (activeTab === "bookings") {
      headers = ["Room", "Floor", "Organizer", "Date", "Start Time", "End Time", "Purpose", "Attendees", "Status"];
      rows = bookings.map((b) => [
        b.room?.name || "N/A",
        b.room?.floor?.floorNumber || "N/A",
        b.hr?.name || b.bookedBy?.name || "N/A",
        b.date || new Date(b.startTime).toLocaleDateString(),
        b.startTime || "",
        b.endTime || "",
        b.purpose || "",
        b.attendees || b.attendeesCount || 0,
        b.status || "booked",
      ]);
    } else if (activeTab === "utilization") {
      headers = ["Room", "Floor", "Capacity", "Total Bookings", "Utilization Rate"];
      const roomStats = rooms.map((room) => {
        const roomBookings = bookings.filter(
          (b) => (b.room?._id || b.room) === room._id && (b.status === "confirmed" || b.status === "booked")
        );
        const utilizationRate = bookings.length > 0 ? ((roomBookings.length / bookings.length) * 100).toFixed(1) : "0.0";
        return [
          room.name || "N/A",
          room.floor?.floorNumber || "N/A",
          room.capacity || 0,
          roomBookings.length,
          `${utilizationRate}%`,
        ];
      });
      rows = roomStats;
    } else if (activeTab === "components") {
      headers = ["Component", "Type", "Room", "Floor", "Status", "Quantity"];
      rows = components.map((c) => [
        c.name || "N/A",
        c.type || "N/A",
        c.room?.name || "N/A",
        c.room?.floor?.floorNumber || "N/A",
        c.isWorking ? "Working" : "Not Working",
        c.quantity || 1,
      ]);
    }

    csvContent = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${activeTab}_report_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
    // Simple PDF export using window.print() for now
    // In production, you'd use a library like jsPDF or pdfmake
    window.print();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-amber-100 text-amber-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "fixed":
        return "bg-green-100 text-green-800";
      case "confirmed":
      case "booked":
        return "bg-green-100 text-green-800";
      case "canceled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-orange-100 text-orange-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const clearFilters = () => {
    setStatusFilter("");
    setDateFrom("");
    setDateTo("");
    setRoomFilter("");
    setOrganizerFilter("");
    setPriorityFilter("");
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 ml-64">
        <div className="p-8">
          <PageHeader
            title="Reports & Analytics"
            subtitle="Comprehensive reporting and analytics for meetings, rooms, and components"
          />

          {/* Success/Error Messages */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg shadow-sm flex items-center gap-3">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-lg shadow-sm flex items-center gap-3">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{success}</span>
            </div>
          )}

          {/* Summary KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <KpiCard
              label="Total Issues"
              value={summaryStats.totalIssues}
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              }
            />
            <KpiCard
              label="Pending Issues"
              value={summaryStats.pendingIssues}
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
            <KpiCard
              label="Total Bookings"
              value={summaryStats.totalBookings}
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              }
            />
            <KpiCard
              label="Confirmed Bookings"
              value={summaryStats.confirmedBookings}
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
          </div>

          {/* Report Type Tabs */}
          <Card className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                {[
                  { id: "issues", label: "Issue Reports" },
                  { id: "bookings", label: "Booking Reports" },
                  { id: "utilization", label: "Room Utilization" },
                  { id: "components", label: "Component Reports" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? "border-blue-600 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </Card>

          {/* Filters */}
          <Card className="mb-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Clear All
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date From</label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date To</label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                {activeTab === "issues" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="fixed">Fixed</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                      <select
                        value={priorityFilter}
                        onChange={(e) => setPriorityFilter(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">All Priorities</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>
                    </div>
                  </>
                )}
                {(activeTab === "bookings" || activeTab === "issues") && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Room</label>
                    <select
                      value={roomFilter}
                      onChange={(e) => setRoomFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">All Rooms</option>
                      {rooms.map((room) => (
                        <option key={room._id} value={room._id}>
                          {room.name} - Floor {room.floor?.floorNumber || "N/A"}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                {activeTab === "bookings" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Organizer</label>
                    <select
                      value={organizerFilter}
                      onChange={(e) => setOrganizerFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">All Organizers</option>
                      {Array.from(new Set(bookings.map((b) => b.hr?._id || b.bookedBy?._id).filter(Boolean))).map((id) => {
                        const booking = bookings.find((b) => (b.hr?._id || b.bookedBy?._id) === id);
                        return (
                          <option key={id} value={id}>
                            {booking?.hr?.name || booking?.bookedBy?.name || "Unknown"}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Export Actions */}
          <div className="flex justify-end gap-3 mb-6">
            <Button variant="outline" onClick={exportToCSV}>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export CSV
            </Button>
            <Button variant="outline" onClick={exportToPDF}>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Export PDF
            </Button>
          </div>

          {/* Report Content */}
          <Card>
            {loading ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading reports...</p>
              </div>
            ) : activeTab === "issues" ? (
              reports.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                  <p>No issue reports found.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Component</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issue</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reported By</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reported Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {reports.map((report) => (
                        <tr key={report._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{report.room?.name || "N/A"}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{report.component?.name || "Room Issue"}</td>
                          <td className="px-6 py-4 text-sm text-gray-700 max-w-xs">
                            <div className="truncate" title={report.issue}>{report.issue}</div>
                            {report.notes && (
                              <div className="text-xs text-gray-500 mt-1 truncate" title={report.notes}>Notes: {report.notes}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${getPriorityColor(report.priority)}`}>
                              {report.priority || "medium"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {report.reportedBy?.name || report.reportedBy?.email || "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(report.status)}`}>
                              {report.status || "pending"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {report.createdAt ? new Date(report.createdAt).toLocaleDateString() : "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {report.status !== "fixed" && (
                              <div className="flex gap-2">
                                {report.status !== "in_progress" && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleStatusUpdate(report._id, "in_progress")}
                                  >
                                    In Progress
                                  </Button>
                                )}
                                <Button size="sm" onClick={() => handleStatusUpdate(report._id, "fixed")}>
                                  Mark Fixed
                                </Button>
                              </div>
                            )}
                            {report.status === "fixed" && (
                              <span className="text-xs text-gray-500">
                                Fixed {report.resolvedAt ? new Date(report.resolvedAt).toLocaleDateString() : ""}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            ) : activeTab === "bookings" ? (
              bookings.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                  <p>No bookings found.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Floor</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organizer</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purpose</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attendees</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {bookings.map((booking) => (
                        <tr key={booking._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.room?.name || "N/A"}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            Floor {booking.room?.floor?.floorNumber || "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {booking.hr?.name || booking.bookedBy?.name || "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {booking.date || (booking.startTime ? new Date(booking.startTime).toLocaleDateString() : "N/A")}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {booking.startTime || ""} - {booking.endTime || ""}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate" title={booking.purpose}>
                            {booking.purpose || "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {booking.attendees || booking.attendeesCount || 0}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(booking.status)}`}>
                              {booking.status || "booked"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            ) : activeTab === "utilization" ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Floor</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Bookings</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilization Rate</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {rooms.map((room) => {
                      const roomBookings = bookings.filter(
                        (b) => (b.room?._id || b.room) === room._id && (b.status === "confirmed" || b.status === "booked")
                      );
                      const utilizationRate =
                        bookings.length > 0 ? ((roomBookings.length / bookings.length) * 100).toFixed(1) : "0.0";
                      return (
                        <tr key={room._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{room.name || "N/A"}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            Floor {room.floor?.floorNumber || "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{room.capacity || 0}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{roomBookings.length}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{utilizationRate}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Component</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Floor</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {components.map((component) => (
                      <tr key={component._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{component.name || "N/A"}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{component.type || "N/A"}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{component.room?.name || "N/A"}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          Floor {component.room?.floor?.floorNumber || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span
                            className={`px-2 py-1 rounded text-xs font-semibold ${
                              component.isWorking ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                            }`}
                          >
                            {component.isWorking ? "Working" : "Not Working"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{component.quantity || 1}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

export default ReportsPage;
