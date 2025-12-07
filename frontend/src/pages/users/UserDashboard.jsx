import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { useNavigate } from "react-router-dom";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PawPrint, Clock, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "react-toastify";

import {
  fetchBookingsForUser,
  cancelBooking,
} from "../../slices/booking-slice";

export default function UserDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { list = [], loading = false } = useSelector(
    (s) => s.booking || {},
    shallowEqual
  );
  const authUser = useSelector((s) => s.auth?.user ?? null, shallowEqual);

  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Fetch user's bookings
  useEffect(() => {
    dispatch(fetchBookingsForUser());
  }, [dispatch]);

  // Normalize statuses
  const bookings = useMemo(
    () =>
      (list || []).map((b) => ({
        ...b,
        bookingStatus: b.bookingStatus ?? b.status ?? "pending",
      })),
    [list]
  );

  // Basic stats
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

  // Separate upcoming vs past lists
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

  // Filter + search
  const filteredUpcoming = useMemo(() => {
    let list = [...upcomingList];

    if (statusFilter !== "all") {
      list = list.filter((b) => b.bookingStatus === statusFilter);
    }

    if (q.trim()) {
      const qq = q.trim().toLowerCase();
      list = list.filter((b) => {
        const providerName = b.provider?.businessName || "";
        const service = b.service || "";
        const petType = b.petType || "";
        return (
          providerName.toLowerCase().includes(qq) ||
          service.toLowerCase().includes(qq) ||
          petType.toLowerCase().includes(qq)
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
      const qq = q.trim().toLowerCase();
      list = list.filter((b) => {
        const providerName = b.provider?.businessName || "";
        const service = b.service || "";
        const petType = b.petType || "";
        return (
          providerName.toLowerCase().includes(qq) ||
          service.toLowerCase().includes(qq) ||
          petType.toLowerCase().includes(qq)
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
      console.error(err);
      toast.error(
        typeof err === "string"
          ? err
          : err?.message || "Failed to cancel booking"
      );
    }
  };

  const badgeForStatus = (status) => {
    switch (status) {
      case "pending":
        return (
          <Badge className="bg-amber-100 text-amber-700 border-amber-200 capitalize">
            Pending
          </Badge>
        );
      case "confirmed":
        return (
          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 capitalize">
            Confirmed
          </Badge>
        );
      case "completed":
        return (
          <Badge className="bg-blue-100 text-blue-700 border-blue-200 capitalize">
            Completed
          </Badge>
        );
      case "cancelled":
        return (
          <Badge className="bg-rose-100 text-rose-700 border-rose-200 capitalize">
            Cancelled
          </Badge>
        );
      default:
        return <Badge className="capitalize">{status}</Badge>;
    }
  };

  const badgeForPayment = (status) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 capitalize">
            Paid
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-amber-100 text-amber-700 border-amber-200 capitalize">
            Payment Pending
          </Badge>
        );
      case "failed":
        return (
          <Badge className="bg-rose-100 text-rose-700 border-rose-200 capitalize">
            Payment Failed
          </Badge>
        );
      default:
        return <Badge className="capitalize">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen px-4 sm:px-6 py-8 bg-gradient-to-b from-orange-50 to-white">
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

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => navigate("/")}
              className="text-sm"
            >
              Explore Providers
            </Button>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: stats + upcoming */}
        <section className="lg:col-span-8 space-y-6">
          {/* Stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="rounded-2xl shadow-sm cursor-pointer hover:shadow-md transform hover:-translate-y-1 transition">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-orange-500 font-semibold">
                      Total Bookings
                    </p>
                    <p className="mt-2 text-2xl font-bold text-slate-900">
                      {stats.total}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">All time</p>
                  </div>
                  <div className="bg-orange-100 text-orange-600 p-3 rounded-full">
                    <PawPrint className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl shadow-sm cursor-pointer hover:shadow-md transform hover:-translate-y-1 transition">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-amber-500 font-semibold">
                      Upcoming
                    </p>
                    <p className="mt-2 text-2xl font-bold text-amber-600">
                      {stats.upcoming}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Confirmed & pending
                    </p>
                  </div>
                  <Clock className="w-5 h-5 text-amber-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl shadow-sm cursor-pointer hover:shadow-md transform hover:-translate-y-1 transition">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-emerald-500 font-semibold">
                      Completed
                    </p>
                    <p className="mt-2 text-2xl font-bold text-emerald-600">
                      {stats.completed}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">Visits done</p>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl shadow-sm cursor-pointer hover:shadow-md transform hover:-translate-y-1 transition">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-rose-500 font-semibold">
                      Cancelled
                    </p>
                    <p className="mt-2 text-2xl font-bold text-rose-600">
                      {stats.cancelled}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Missed / cancelled
                    </p>
                  </div>
                  <XCircle className="w-5 h-5 text-rose-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="rounded-2xl shadow-sm cursor-pointer hover:shadow-md transform hover:-translate-y-1 transition">
            <CardContent className="p-4 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
              <div className="flex-1 flex gap-2">
                <Input
                  placeholder="Search by provider, service or pet"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  className="text-sm"
                />
              </div>
              <div className="flex gap-2">
                <select
                  className="rounded-lg px-3 py-2 border text-sm"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All statuses</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming bookings */}
          <Card className="rounded-2xl shadow-sm cursor-pointer hover:shadow-md transform hover:-translate-y-1 transition">
            <CardHeader>
              <CardTitle>Upcoming bookings</CardTitle>
              <CardDescription className="text-sm">
                Vet visits and services that are scheduled for your pets.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-72">
                {loading ? (
                  <div className="text-center text-sm text-slate-500 py-10">
                    Loading your bookings...
                  </div>
                ) : filteredUpcoming.length === 0 ? (
                  <div className="text-center text-sm text-slate-500 py-10">
                    No upcoming bookings. Book a visit for your furry friend
                    🐶🐱
                  </div>
                ) : (
                  <div className="space-y-3 pr-1">
                    {filteredUpcoming.map((b) => {
                      const status = b.bookingStatus;
                      const providerName =
                        b.provider?.businessName || "Provider";

                      return (
                        <div
                          key={b._id}
                          className="flex flex-col sm:flex-row sm:items-stretch justify-between gap-3 p-3 rounded-xl border bg-white/90 hover:bg-orange-50/60 transition shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
                        >
                          {/* Left: avatar + main info */}
                          <div className="flex gap-3 flex-1">
                            <div className="w-10 h-10 rounded-full bg-orange-100 border border-orange-200 flex items-center justify-center text-orange-600 font-bold text-sm shrink-0">
                              {b.petType ? b.petType[0]?.toUpperCase() : "P"}
                            </div>

                            <div className="space-y-1">
                              {/* Pet + service */}
                              <p className="text-sm font-semibold text-slate-900">
                                {b.petType} — {b.service}
                              </p>

                              {/* Provider */}
                              <p className="text-xs font-medium text-slate-600">
                                <span className="text-[11px]  tracking-wide text-slate-400 mr-1">
                                  Provider - 
                                </span>
                                {providerName}
                              </p>

                              {/* Date & time */}
                              <p className="text-xs text-slate-500">
                                <span className="text-[11px]  tracking-wide text-slate-400 mr-1">
                                  Date - 
                                </span>
                                {new Date(b.bookingDate).toLocaleDateString(
                                  "en-IN"
                                )}
                              </p>

                              <p className="text-xs text-slate-500">
                                <span className="text-[11px]  tracking-wide text-slate-400 mr-1">
                                  Slot At -
                                </span>
                                 {b.timeSlot}
                              </p>

                              {/* Notes */}
                              {b.notes && (
                                <p className="text-xs text-slate-500">
                                  <span className="text-[11px]  tracking-wide text-slate-400 mr-1">
                                    Note -
                                  </span>
                                  {b.notes}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Right: status, payment, actions */}
                          <div className="flex flex-row sm:flex-col items-end sm:items-end justify-between gap-2 min-w-[170px]">
                            {/* Status + payment badges */}
                            <div className="flex flex-col items-end gap-1">
                              <div className="flex flex-wrap justify-end gap-1">
                                <span className="text-[11px] uppercase tracking-wide text-slate-400 mr-1">
                                  booking Status
                                </span>
                                {badgeForStatus(status)}
                              </div>

                              <div className="flex flex-wrap justify-end gap-1">
                                <span className="text-[11px] uppercase tracking-wide text-slate-400 mr-1">
                                  Payment status
                                </span>
                                {badgeForPayment(b.paymentStatus)}
                              </div>
                            </div>

                            {/* Cancel button */}
                            {["pending", "confirmed"].includes(status) && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs mt-1 border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300"
                                onClick={() => handleCancel(b._id)}
                              >
                                Cancel booking
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </section>

        {/* Right: history / tips */}
        <aside className="lg:col-span-4 space-y-6">
          {/* Past bookings */}
          <Card className="rounded-2xl shadow-sm cursor-pointer hover:shadow-md transform hover:-translate-y-1 transition">
            <CardHeader>
              <CardTitle>Past visits</CardTitle>
              <CardDescription className="text-sm">
                Your completed and cancelled bookings.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-72">
                {loading ? (
                  <div className="text-center text-sm text-slate-500 py-8">
                    Loading...
                  </div>
                ) : filteredPast.length === 0 ? (
                  <div className="text-center text-sm text-slate-500 py-8">
                    No past bookings yet.
                  </div>
                ) : (
                  <div className="space-y-3 pr-1">
                    {filteredPast.map((b) => {
                      const providerName =
                        b.provider?.businessName || "Provider";
                      return (
                        <div
                          key={b._id}
                          className="p-3 rounded-lg border bg-white"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-semibold">
                                {b.petType} — {b.service}
                              </p>
                              <p className="text-xs text-slate-500">
                                {providerName}
                              </p>
                              <p className="text-xs text-slate-500 mt-1">
                                {new Date(b.bookingDate).toLocaleDateString(
                                  "en-IN"
                                )}{" "}
                                • {b.timeSlot}
                              </p>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              {badgeForStatus(b.bookingStatus)}
                              {badgeForPayment(b.paymentStatus)}
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

          {/* Tips card */}
          <Card className="rounded-2xl shadow-sm cursor-pointer hover:shadow-md transform hover:-translate-y-1 transition bg-orange-50/80 border-orange-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-700">
                Caring for your buddy
                <PawPrint className="w-4 h-4" />
              </CardTitle>
              <CardDescription className="text-xs text-orange-700/80">
                Little reminders to keep your pet happy & safe.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-xs sm:text-sm space-y-2 text-orange-900/90">
                <li>
                  • Try to book{" "}
                  <span className="font-semibold">vaccinations</span> a few days
                  early to avoid last-minute rush.
                </li>
                <li>
                  • Arrive <span className="font-semibold">10–15 minutes</span>{" "}
                  before your slot so your pet can settle.
                </li>
                <li>
                  • If your pet is anxious, carry their{" "}
                  <span className="font-semibold">favorite toy or treat</span>{" "}
                  🐶
                </li>
                <li>
                  • If you can’t make it,{" "}
                  <span className="font-semibold">cancel early</span> so others
                  can use the slot.
                </li>
              </ul>
            </CardContent>
          </Card>
        </aside>
      </main>
    </div>
  );
}
