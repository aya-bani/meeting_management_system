import { useEffect, useState } from "react";

import HRSidebar from "../../components/HRSidebar";
import { roomService } from "../../services/roomService";
import { componentService } from "../../services/componentService";
import { reportService } from "../../services/reportService";

function ComponentReport() {
  const [rooms, setRooms] = useState([]);
  const [components, setComponents] = useState([]);
  const [formData, setFormData] = useState({
    room: "",
    component: "",
    issue: "",
    priority: "medium",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError("");
        const [roomsData, componentsData] = await Promise.all([
          roomService.getAllRooms(),
          componentService.getAllComponents(),
        ]);
        setRooms(roomsData || []);
        setComponents(componentsData || []);
      } catch (err) {
        console.error("Error loading rooms/components for report:", err);
        setError(
          err?.response?.data?.message ||
            "Failed to load rooms/components for reporting"
        );
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.room || !formData.component || !formData.issue.trim()) {
      setError("Room, component and issue description are required.");
      return;
    }

    try {
      setLoading(true);
      await reportService.createReport({
        room: formData.room,
        component: formData.component,
        issue: formData.issue.trim(),
        priority: formData.priority,
        notes: formData.notes,
      });

      setSuccess("Issue reported successfully.");
      setFormData({
        room: "",
        component: "",
        issue: "",
        priority: "medium",
        notes: "",
      });
    } catch (err) {
      console.error("Error creating component report:", err);
      setError(err?.response?.data?.message || "Failed to submit report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      <HRSidebar />

      <div className="flex-1 ml-64 p-6">
        <header className="bg-indigo-600 text-white p-4 rounded shadow mb-6">
          <h1 className="text-2xl font-bold">Report Component Issue</h1>
          <p className="text-indigo-100 text-sm mt-1">
            Let the admin know when a room component is not working.
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

        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded shadow max-w-xl"
        >
          <div className="mb-4">
            <label className="block font-medium mb-2 text-gray-700">
              Room *
            </label>
            <select
              name="room"
              value={formData.room}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            >
              <option value="">Select a room</option>
              {rooms.map((r) => (
                <option key={r._id} value={r._id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block font-medium mb-2 text-gray-700">
              Component *
            </label>
            <select
              name="component"
              value={formData.component}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            >
              <option value="">Select a component</option>
              {components.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name} {c.type ? `(${c.type})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block font-medium mb-2 text-gray-700">
              Issue description *
            </label>
            <textarea
              name="issue"
              value={formData.issue}
              onChange={handleChange}
              rows="4"
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Describe what is not working..."
              required
            />
          </div>

          <div className="mb-4">
            <label className="block font-medium mb-2 text-gray-700">
              Priority
            </label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div className="mb-6">
            <label className="block font-medium mb-2 text-gray-700">
              Additional notes (optional)
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Any extra details for the admin..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 text-white px-6 py-3 rounded hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? "Submitting..." : "Submit Report"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ComponentReport;


