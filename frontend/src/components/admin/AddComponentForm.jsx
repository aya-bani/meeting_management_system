import { useState, useEffect } from "react";
import { componentService } from "../../services/componentService";
import { roomService } from "../../services/roomService";

function AddComponentForm({ showModal, onClose, onSuccess }) {
  const [rooms, setRooms] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const [componentForm, setComponentForm] = useState({
    room: "",
    type: "",
    name: "",
    serialNumber: "",
    quantity: 1,
    isWorking: true,
    notes: "",
  });

  useEffect(() => {
    if (showModal) {
      fetchRooms();
    }
  }, [showModal]);

  const fetchRooms = async () => {
    try {
      const roomsData = await roomService.getAllRooms();
      setRooms(roomsData);
    } catch (err) {
      setError("Failed to load rooms");
    }
  };

  const handleCreateComponent = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await componentService.createComponent({
        ...componentForm,
        quantity: parseInt(componentForm.quantity) || 1,
      });

      setSuccess("Component created successfully!");
      setComponentForm({
        room: "",
        type: "",
        name: "",
        serialNumber: "",
        quantity: 1,
        isWorking: true,
        notes: "",
      });
      
      setTimeout(() => {
        setSuccess("");
        onSuccess?.();
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create component");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setComponentForm({
      room: "",
      type: "",
      name: "",
      serialNumber: "",
      quantity: 1,
      isWorking: true,
      notes: "",
    });
    setError("");
    setSuccess("");
    onClose();
  };

  if (!showModal) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-slate-800">Add New Component</h3>
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

        <form onSubmit={handleCreateComponent} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Room *</label>
            <select
              value={componentForm.room}
              onChange={(e) => setComponentForm({ ...componentForm, room: e.target.value })}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select a room</option>
              {rooms.map((room) => (
                <option key={room._id} value={room._id}>
                  {room.name} - Floor {room.floor?.floorNumber || "N/A"}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Type *</label>
            <select
              value={componentForm.type}
              onChange={(e) => setComponentForm({ ...componentForm, type: e.target.value })}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select component type</option>
              <option value="camera">Camera</option>
              <option value="datashow">Datashow/Projector</option>
              <option value="whiteboard">Whiteboard</option>
              <option value="microphone">Microphone</option>
              <option value="screen">Screen</option>
              <option value="speaker">Speaker</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Component Name *</label>
            <input
              type="text"
              value={componentForm.name}
              onChange={(e) => setComponentForm({ ...componentForm, name: e.target.value })}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Serial Number</label>
            <input
              type="text"
              value={componentForm.serialNumber}
              onChange={(e) => setComponentForm({ ...componentForm, serialNumber: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Quantity *</label>
            <input
              type="number"
              min="1"
              value={componentForm.quantity}
              onChange={(e) => setComponentForm({ ...componentForm, quantity: parseInt(e.target.value) || 1 })}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={componentForm.isWorking}
                onChange={(e) => setComponentForm({ ...componentForm, isWorking: e.target.checked })}
                className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
              />
              <span className="text-sm font-medium text-slate-700">Is Working</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
            <textarea
              rows="3"
              value={componentForm.notes}
              onChange={(e) => setComponentForm({ ...componentForm, notes: e.target.value })}
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
              {loading ? "Creating..." : "Create Component"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddComponentForm;