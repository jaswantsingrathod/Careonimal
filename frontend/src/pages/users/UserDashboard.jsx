import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "react-toastify";

import {
  fetchBookingsForUser,
  cancelBooking,
} from "../../slices/booking-slice";

import ReviewModal from "../../components/ReviewModel";
import { fetchAllReviews } from "../../slices/review-slice";

export default function UserDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { list = [] } = useSelector((state) => state.booking || {});
  const authUser = useSelector((state) => state.auth);
  const allReviews = useSelector((state) => state.review?.all ?? []);

  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Review Modal State
  const [reviewOpen, setReviewOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  // Fetch user's bookings
  useEffect(() => {
    dispatch(fetchBookingsForUser());
    dispatch(fetchAllReviews());
  }, [dispatch]);

  const bookings = useMemo(
    () =>
      (list || []).map((b) => ({
        ...b,
        bookingStatus: b.bookingStatus ?? b.status ?? "pending",
      })),
    [list]
  );

  const hasReviewed = (bookingId) => {
    return allReviews.some(
      (r) =>
        r.booking === bookingId || // when backend returns just id
        r.booking?._id === bookingId // when populated
    );
  };

  const stats = useMemo(() => {
    const total = bookings.length;
    const upcoming = bookings.filter((b) =>
      ["pending", "confirmed"].includes(b.bookingStatus)
    ).length;
    const completed = bookings.filter(
      (b) => b.bookingStatus === "completed"
    ).length;
    const cancelled = bookings.filter(
      (b) => b.bookingStatus === "cancelled"
    ).length;

    return { total, upcoming, completed, cancelled };
  }, [bookings]);

  const { upcomingList, pastList } = useMemo(() => {
    const now = new Date();
    const upcoming = [];
    const past = [];

    bookings.forEach((b) => {
      const date = new Date(b.bookingDate);
      const status = b.bookingStatus;

      if (["pending", "confirmed"].includes(status) && date >= now) {
        upcoming.push(b);
      } else {
        past.push(b);
      }
    });

    return { upcomingList: upcoming, pastList: past };
  }, [bookings]);

  const filteredUpcoming = useMemo(() => {
    let list = [...upcomingList];

    if (statusFilter !== "all") {
      list = list.filter((b) => b.bookingStatus === statusFilter);
    }

    if (q.trim()) {
      const qq = q.toLowerCase();
      list = list.filter((b) => {
        const provider = b.provider?.businessName?.toLowerCase() || "";
        const service = b.service?.toLowerCase() || "";
        const pet = b.petType?.toLowerCase() || "";
        return (
          provider.includes(qq) || service.includes(qq) || pet.includes(qq)
        );
      });
    }

    return list;
  }, [upcomingList, q, statusFilter]);

  const filteredPast = useMemo(() => {
    let list = [...pastList];

    if (statusFilter !== "all") {
      list = list.filter((b) => b.bookingStatus === statusFilter);
    }

    if (q.trim()) {
      const qq = q.toLowerCase();
      list = list.filter((b) => {
        const provider = b.provider?.businessName?.toLowerCase() || "";
        const service = b.service?.toLowerCase() || "";
        const pet = b.petType?.toLowerCase() || "";
        return (
          provider.includes(qq) || service.includes(qq) || pet.includes(qq)
        );
      });
    }

    return list;
  }, [pastList, q, statusFilter]);

  const handleCancel = async (bookingId) => {
    const ok = window.confirm("Are you sure you want to cancel this booking?");
    if (!ok) return;

    try {
      await dispatch(cancelBooking(bookingId)).unwrap();
      toast.success("Booking cancelled");
      dispatch(fetchBookingsForUser());
    } catch (err) {
      toast.error(err?.message || "Failed to cancel booking");
    }
  };

  const badgeForStatus = (status) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-amber-100 text-amber-700">Pending</Badge>;
      case "confirmed":
        return (
          <Badge className="bg-emerald-100 text-emerald-700">Confirmed</Badge>
        );
      case "completed":
        return <Badge className="bg-blue-100 text-blue-700">Completed</Badge>;
      case "cancelled":
        return <Badge className="bg-rose-100 text-rose-700">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const badgeForPayment = (status) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-emerald-100 text-emerald-700">Paid</Badge>;
      case "pending":
        return (
          <Badge className="bg-amber-100 text-amber-700">Payment Pending</Badge>
        );
      case "failed":
        return (
          <Badge className="bg-rose-100 text-rose-700">Payment Failed</Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen px-4 sm:px-6 py-8 bg-gradient-to-b from-orange-50 to-white">
      {/* HEADER */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Hey {authUser?.username || "Pet Parent"} 🐾
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Track your bookings, payments and past visits for your pets.
            </p>
          </div>

          <Button variant="outline" onClick={() => navigate("/")}>
            Explore Providers
          </Button>
        </div>
      </div>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* MAIN CONTENT */}
        <section className="lg:col-span-8 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <p className="text-xs uppercase text-orange-500">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <p className="text-xs uppercase text-amber-500">Upcoming</p>
                <p className="text-2xl font-bold">{stats.upcoming}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <p className="text-xs uppercase text-emerald-500">Completed</p>
                <p className="text-2xl font-bold">{stats.completed}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <p className="text-xs uppercase text-rose-500">Cancelled</p>
                <p className="text-2xl font-bold">{stats.cancelled}</p>
              </CardContent>
            </Card>
          </div>

          {/* Search + Filters */}
          <Card>
            <CardContent className="p-4 flex flex-col sm:flex-row gap-3">
              <Input
                placeholder="Search..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
              <select
                className="rounded px-3 py-2 border"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </CardContent>
          </Card>

          {/* Upcoming bookings */}
          <Card>
            <CardHeader>
              <CardTitle>Past visits</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-72">
                {filteredPast.map((b) => (
                  <div
                    key={b._id}
                    className="p-3 border rounded-lg mb-2 bg-white"
                  >
                    <p className="text-sm font-semibold">
                      {b.petType} — {b.service}
                    </p>
                    <p className="text-xs">{b.provider?.businessName}</p>

                    <p className="text-xs mt-1">
                      {new Date(b.bookingDate).toLocaleDateString("en-IN")} •{" "}
                      {b.timeSlot}
                    </p>

                    <div className="flex gap-2 mt-2">
                      {badgeForStatus(b.bookingStatus)}
                      {badgeForPayment(b.paymentStatus)}
                    </div>

                    {/* Review button ONLY for completed bookings */}
                    {b.bookingStatus === "completed" && !hasReviewed(b._id) && (
                      <Button
                        size="sm"
                        className="mt-3 bg-orange-500 hover:bg-orange-600 text-white"
                        onClick={() => {
                          setSelectedBooking(b);
                          setReviewOpen(true);
                        }}
                      >
                        Write Review
                      </Button>
                    )}

                    {/* If already reviewed → show badge */}
                    {b.bookingStatus === "completed" && hasReviewed(b._id) && (
                      <Badge className="mt-3 bg-green-100 text-green-700 border-green-300">
                        Reviewed ★
                      </Badge>
                    )}
                  </div>
                ))}
              </ScrollArea>
            </CardContent>
          </Card>
        </section>

        {/* RIGHT SIDE: Past bookings */}
        <aside className="lg:col-span-4 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-72">
                {filteredUpcoming.map((b) => (
                  <div
                    key={b._id}
                    className="p-3 border rounded-lg mb-2 bg-white"
                  >
                    <p className="text-sm font-bold">
                      {b.petType} — {b.service}
                    </p>
                    <p className="text-xs">{b.provider?.businessName}</p>
                    <p className="text-xs mt-1">
                      {new Date(b.bookingDate).toLocaleDateString("en-IN")} •{" "}
                      {b.timeSlot}
                    </p>

                    <div className="flex justify-between items-center mt-2">
                      {badgeForStatus(b.bookingStatus)}
                      {["pending", "confirmed"].includes(b.bookingStatus) && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCancel(b._id)}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </CardContent>
          </Card>
        </aside>
      </main>

      {/* REVIEW MODAL */}
      <ReviewModal
        open={reviewOpen}
        onOpenChange={setReviewOpen}
        booking={selectedBooking}
      />
    </div>
  );
}
