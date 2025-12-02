import { useEffect, useState } from "react";

import AdminSidebar from "../../components/AdminSidebar";
import { reportService } from "../../services/reportService";

function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    fetchReports();
  }, [statusFilter]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const data = await reportService.getAllReports(statusFilter || undefined);
      setReports(data || []);
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
      
      // Refresh reports
      fetchReports();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Error updating report:", err);
      setError(err?.response?.data?.message || "Failed to update report status");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "fixed":
        return "bg-green-100 text-green-800";
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

  return (
    <div className="min-h-screen flex bg-slate-50">
      <AdminSidebar />

      <div className="flex-1 ml-64 p-6">
        <header className="bg-indigo-600 text-white p-4 rounded shadow mb-6">
          <h1 className="text-2xl font-bold">Component & Room Reports</h1>
          <p className="text-indigo-100 text-sm mt-1">
            View and manage component issues reported by HR managers.
          </p>
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

        {/* Filter by Status */}
        <div className="bg-white rounded shadow p-4 mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full md:w-64 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="fixed">Fixed</option>
          </select>
        </div>

        <div className="bg-white rounded shadow p-4">
          {loading ? (
            <p className="text-gray-500">Loading reports...</p>
          ) : reports.length === 0 ? (
            <p className="text-gray-500">No reports found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Room
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Component
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Issue
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reported By
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reported Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reports.map((report) => (
                    <tr key={report._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {report.room?.name || "N/A"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                        {report.component?.name || "Room Issue"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 max-w-xs">
                        <div className="truncate" title={report.issue}>
                          {report.issue}
                        </div>
                        {report.notes && (
                          <div className="text-xs text-gray-500 mt-1 truncate" title={report.notes}>
                            Notes: {report.notes}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${getPriorityColor(
                            report.priority
                          )}`}
                        >
                          {report.priority || "medium"}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                        {report.reportedBy?.name || report.reportedBy?.email || "N/A"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(
                            report.status
                          )}`}
                        >
                          {report.status || "pending"}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                        {report.createdAt
                          ? new Date(report.createdAt).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        {report.status !== "fixed" && (
                          <div className="flex gap-2">
                            {report.status !== "in_progress" && (
                              <button
                                onClick={() => handleStatusUpdate(report._id, "in_progress")}
                                className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                              >
                                Mark In Progress
                              </button>
                            )}
                            <button
                              onClick={() => handleStatusUpdate(report._id, "fixed")}
                              className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                            >
                              Mark Fixed
                            </button>
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
          )}
        </div>
      </div>
    </div>
  );
}

export default ReportsPage;

