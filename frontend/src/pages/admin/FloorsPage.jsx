import { useEffect, useState } from "react";

import AdminSidebar from "../../components/AdminSidebar";
import { floorService } from "../../services/floorService";

function FloorsPage() {
  const [floors, setFloors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchFloors = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await floorService.getAllFloors();
        setFloors(data || []);
      } catch (err) {
        console.error("Error fetching floors:", err);
        setError(err?.response?.data?.message || "Failed to load floors");
      } finally {
        setLoading(false);
      }
    };

    fetchFloors();
  }, []);

  return (
    <div className="min-h-screen flex bg-slate-50">
      <AdminSidebar />

      <div className="flex-1 ml-64 p-6">
        <header className="bg-indigo-600 text-white p-4 rounded shadow mb-6">
          <h1 className="text-2xl font-bold">Floors</h1>
          <p className="text-indigo-100 text-sm mt-1">
            View all floors configured for meeting rooms.
          </p>
        </header>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 p-3 mb-4 rounded">
            {error}
          </div>
        )}

        <div className="bg-white rounded shadow p-4">
          {loading ? (
            <p className="text-gray-500">Loading floors...</p>
          ) : floors.length === 0 ? (
            <p className="text-gray-500">No floors found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Number
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {floors.map((f) => (
                    <tr key={f._id}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {f.name}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                        {f.number ?? "-"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 max-w-xs truncate">
                        {f.description || "—"}
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

export default FloorsPage;


