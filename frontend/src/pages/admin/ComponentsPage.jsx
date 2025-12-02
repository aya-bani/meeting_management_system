import { useEffect, useState } from "react";

import AdminSidebar from "../../components/AdminSidebar";
import { componentService } from "../../services/componentService";

function ComponentsPage() {
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchComponents = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await componentService.getAllComponents();
        setComponents(data || []);
      } catch (err) {
        console.error("Error fetching components:", err);
        setError(err?.response?.data?.message || "Failed to load components");
      } finally {
        setLoading(false);
      }
    };

    fetchComponents();
  }, []);

  return (
    <div className="min-h-screen flex bg-slate-50">
      <AdminSidebar />

      <div className="flex-1 ml-64 p-6">
        <header className="bg-indigo-600 text-white p-4 rounded shadow mb-6">
          <h1 className="text-2xl font-bold">Components</h1>
          <p className="text-indigo-100 text-sm mt-1">
            View all equipment/components available for rooms.
          </p>
        </header>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 p-3 mb-4 rounded">
            {error}
          </div>
        )}

        <div className="bg-white rounded shadow p-4">
          {loading ? (
            <p className="text-gray-500">Loading components...</p>
          ) : components.length === 0 ? (
            <p className="text-gray-500">No components found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {components.map((c) => (
                    <tr key={c._id}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {c.name}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                        {c.type || "N/A"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                        {c.quantity ?? "-"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <span className="px-2 py-1 rounded text-xs font-semibold bg-gray-100 text-gray-800">
                          {c.status || "active"}
                        </span>
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

export default ComponentsPage;


