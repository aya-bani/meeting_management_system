import { useNavigate } from "react-router-dom";
import Card from "../ui/Card";
import Button from "../ui/Button";
import DataTable from "../ui/DataTable";

function RecentBookings({ bookings, onAcceptBooking, onCancelBooking }) {
  const navigate = useNavigate();

  const getStatusBadge = (status) => {
    const statusConfig = {
      confirmed: {
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        dot: "bg-emerald-500",
      },
      pending: {
        bg: "bg-amber-50",
        text: "text-amber-700",
        dot: "bg-amber-500",
      },
      canceled: {
        bg: "bg-rose-50",
        text: "text-rose-700",
        dot: "bg-rose-500",
      },
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`}></span>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const columns = [
    {
      key: "room",
      label: "Room",
      render: (booking) => (
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 h-9 w-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
          <div>
            <div className="text-sm font-medium text-slate-900">
              {booking.room?.name || "N/A"}
            </div>
            <div className="text-xs text-slate-500">
              Floor {booking.room?.floor?.floorNumber || "N/A"}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "bookedBy",
      label: "Booked By",
      render: (booking) => (
        <span className="text-sm text-slate-800">
          {booking.bookedBy?.name ||
            booking.bookedBy?.email ||
            "N/A"}
        </span>
      ),
    },
    {
      key: "datetime",
      label: "Date & Time",
      render: (booking) => (
        <div className="text-sm">
          <div className="text-slate-900">
            {new Date(booking.startTime).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </div>
          <div className="text-slate-500">
            {new Date(booking.startTime).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>
      ),
    },
    {
      key: "purpose",
      label: "Purpose",
      render: (booking) => (
        <div
          className="text-sm text-slate-800 max-w-xs truncate"
          title={booking.purpose}
        >
          {booking.purpose}
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (booking) => getStatusBadge(booking.status),
    },
    {
      key: "actions",
      label: "Actions",
      render: (booking) => (
        <div className="flex items-center gap-2">
          {booking.status === "pending" && (
            <Button
              size="sm"
              variant="primary"
              onClick={() => onAcceptBooking(booking._id)}
              className="text-xs"
            >
              Accept
            </Button>
          )}
          {booking.status !== "canceled" && (
            <Button
              size="sm"
              variant="subtle"
              onClick={() => onCancelBooking(booking._id)}
              className="text-xs text-rose-700"
            >
              Cancel
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <section className="mt-8">
      <div className="flex items-center justify-between mb-4 gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Recent Bookings
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Latest booking requests and their current status.
          </p>
        </div>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => navigate("/admin/bookings")}
        >
          View all bookings
        </Button>
      </div>

      <Card>
        {bookings.length === 0 ? (
          <div className="p-10 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 mb-3">
              <svg
                className="w-6 h-6 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <p className="text-sm font-medium text-slate-600">
              No bookings yet
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Bookings will appear here once created.
            </p>
          </div>
        ) : (
          <div className="p-4">
            <DataTable
              columns={columns}
              data={bookings}
              renderRowKey={(booking) => booking._id}
              emptyState="No recent bookings."
            />
          </div>
        )}
      </Card>
    </section>
  );
}

export default RecentBookings;

