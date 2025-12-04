import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "react-toastify";
import {
  fetchBookingsForProvider,
  updateBookingStatus,
  cancelBooking,
} from "../../slices/booking-slice";

export default function ProviderBookings() {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const initialFilter = location.state?.filterStatus || "all";

  const bookings = useSelector((s) => s.booking?.list ?? [], shallowEqual);
  const loading = useSelector((s) => s.booking?.loading ?? false);
  const [statusFilter, setStatusFilter] = useState(initialFilter);
  const [q, setQ] = useState("");

  useEffect(() => {
    dispatch(fetchBookingsForProvider());
  }, [dispatch]);

  const filtered = useMemo(() => {
    let list = bookings || [];

    if (statusFilter && statusFilter !== "all") {
      list = list.filter((b) => String(b.bookingStatus) === String(statusFilter));
    }

    if (q && q.trim()) {
      const qq = q.trim().toLowerCase();
      list = list.filter((b) => {
        const username = (b.user?.username || "").toLowerCase();
        const email = (b.user?.email || "").toLowerCase();
        return (
          username.includes(qq) ||
          email.includes(qq) ||
          (b.service || "").toLowerCase().includes(qq) ||
          (b.petType || "").toLowerCase().includes(qq)
        );
      });
    }

    return list;
  }, [bookings, statusFilter, q]);

  const handleStatusChange = async (booking, newStatus) => {
    // map frontend actions to your bookingStatus enum values:
    // Accept => "confirmed", Reject => "cancelled", Complete => "completed"
    const payload = { id: booking._id, bookingStatus: newStatus };
    console.log("Updating booking status with payload:", payload);
    if (!confirm(`Are you sure you want to set this booking to "${newStatus}"?`)) return;
    try {
      await dispatch(updateBookingStatus(payload)).unwrap();
      toast.success(`Booking ${newStatus}`);
      dispatch(fetchBookingsForProvider());
    } catch (err) {
      toast.error(err?.message || "Action failed");
    }
  };

  return (
    <div className="min-h-screen px-6 py-10 bg-gradient-to-b from-orange-50 to-white">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Bookings</h2>
            <p className="text-sm text-slate-600">Manage all booking requests and history.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => navigate("/provider/dashboard")}>Back to Dashboard</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-4">
          <div className="lg:col-span-3 flex gap-3">
            <Input placeholder="Search by customer, service or pet type" value={q} onChange={(e) => setQ(e.target.value)} />
            <select className="rounded px-3 py-2 border" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All</option>
              <option value="pending">pending</option>
              <option value="confirmed">confirmed</option>
              <option value="completed">completed</option>
              <option value="cancelled">cancelled</option>
            </select>
          </div>
          <div className="flex items-center justify-end gap-2">
            <Button onClick={() => dispatch(fetchBookingsForProvider())}>Refresh</Button>
          </div>
        </div>

        <Card className="rounded-2xl shadow-sm">
          <CardContent>
            <ScrollArea className="h-[60vh]">
              {loading ? (
                <div className="text-center text-sm text-slate-500 py-10">Loading bookings...</div>
              ) : filtered.length === 0 ? (
                <div className="text-center text-sm text-slate-500 py-10">No bookings match your filters.</div>
              ) : (
                <div className="space-y-3 p-2">
                  {filtered.map((b) => {
                    const status = b.bookingStatus || "pending";
                    const payer = b.user || {};
                    return (
                      <div key={b._id} className="flex items-start gap-4 p-4 rounded-lg border bg-white">
                        <div className="w-12 h-12 rounded-full bg-orange-50 border flex items-center justify-center text-orange-600 font-bold">
                          {b.petType ? b.petType[0]?.toUpperCase() : "P"}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <div className="text-sm font-semibold">
                                {payer.username || payer.email || "Customer"}
                              </div>
                              <div className="text-xs text-slate-500">
                                {b.petType} • {b.service}
                              </div>
                              <div className="text-xs text-slate-500 mt-1">
                                {payer.email && <span>{payer.email} • </span>}
                                Price: ₹{b.price}
                              </div>
                            </div>

                            <div className="text-right">
                              <div className="text-sm font-medium">
                                {new Date(b.bookingDate).toLocaleDateString("en-IN")}
                              </div>
                              <div className="text-xs text-slate-500">{b.timeSlot}</div>
                              <div className="text-xs text-slate-400 mt-1">Booked: {new Date(b.createdAt).toLocaleString("en-IN")}</div>
                            </div>
                          </div>

                          {b.notes && <div className="mt-2 text-sm text-slate-600">{b.notes}</div>}

                          <div className="mt-3 flex items-center gap-2">
                            {["pending"].includes(status) && (
                              <>
                                <Button size="sm" onClick={() => handleStatusChange(b, "confirmed")}>Accept</Button>
                                <Button size="sm" variant="destructive" onClick={() => handleStatusChange(b, "cancelled")}>Reject</Button>
                              </>
                            )}

                            {["confirmed","running"].includes(status) && (
                              <Button size="sm" variant="outline" onClick={() => handleStatusChange(b, "completed")}>Mark as Completed</Button>
                            )}

                            {status !== "cancelled" && status !== "completed" && (
                              <Button size="sm" variant="ghost" onClick={() => handleStatusChange(b, "cancelled")}>Cancel</Button>
                            )}

                            <Badge className="ml-auto capitalize">{status}</Badge>
                          </div>

                          <div className="mt-2 text-xs">
                            Payment: <span className="font-medium">{b.paymentStatus}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
