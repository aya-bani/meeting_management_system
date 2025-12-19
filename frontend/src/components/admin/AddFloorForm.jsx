import { useState } from "react";
import { floorService } from "../../services/floorService";

function AddFloorForm({ showModal, onClose, onSuccess }) {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const [floorForm, setFloorForm] = useState({
    floorNumber: "",
    name: "",
    description: "",
  });

  const handleCreateFloor = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await floorService.createFloor({
        ...floorForm,
        floorNumber: parseInt(floorForm.floorNumber),
      });

      setSuccess("Floor created successfully!");
      setFloorForm({ floorNumber: "", name: "", description: "" });
      
      setTimeout(() => {
        setSuccess("");
        onSuccess?.();
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create floor");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFloorForm({ floorNumber: "", name: "", description: "" });
    setError("");
    setSuccess("");
    onClose();
  };

  if (!showModal) return null;

  return (
    <div
      className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-lg p-6 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-slate-800">Add New Floor</h3>
          <button onClick={handleClose} className="text-slate-500 hover:text-slate-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
            {success}
          </div>
        )}

        <form onSubmit={handleCreateFloor} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Floor Number *</label>
            <input
              type="number"
              min="1"
              value={floorForm.floorNumber}
              onChange={(e) => setFloorForm({ ...floorForm, floorNumber: e.target.value })}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Floor Name *</label>
            <input
              type="text"
              value={floorForm.name}
              onChange={(e) => setFloorForm({ ...floorForm, name: e.target.value })}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea
              rows="3"
              value={floorForm.description}
              onChange={(e) => setFloorForm({ ...floorForm, description: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              {loading ? "Creating..." : "Create Floor"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddFloorForm;