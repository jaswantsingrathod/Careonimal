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
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "react-toastify";
import { PawPrint, Star } from "lucide-react";

import { BarChart } from "@mui/x-charts/BarChart";
import { useTheme } from "@mui/material/styles";

import { fetchProvider } from "../../slices/admin-slice.js";
import {
  fetchBookingsForProvider,
  updateBookingStatus,
} from "../../slices/booking-slice.js";
import { fetchMyProviderReviews } from "../../slices/Review-slice.js";

import SubscriptionCard from "./SubscriptionCard";

/* -------------------- helpers -------------------- */
const startOfDay = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};
const sameMonthYear = (d1, d2) =>
  d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear();

/* -------------------- component -------------------- */
export default function ProviderDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();

  // state for quick-action processing
  const [processingId, setProcessingId] = useState(null);

  // selectors
  const providers = useSelector((s) => s.admin?.providers ?? [], shallowEqual);
  const selectedProvider = useSelector(
    (s) => s.admin?.selectedProvider ?? null,
    shallowEqual
  );
  const bookings = useSelector((s) => s.booking?.list ?? [], shallowEqual);
  const bookingsLoading = useSelector((s) => s.booking?.loading ?? false);
  const authUser = useSelector((s) => s.auth?.user ?? null, shallowEqual);
  const myReviews = useSelector((state) => state.review?.items ?? []);

  // resolve provider (if needed)
  const provider = useMemo(() => {
    if (selectedProvider && selectedProvider._id) return selectedProvider;
    if (!authUser) return null;
    return (
      providers.find((p) => {
        const provUser = p.user?._id ?? p.user;
        return provUser && String(provUser) === String(authUser._id);
      }) ?? null
    );
  }, [selectedProvider, providers, authUser]);

  // initial loads
  useEffect(() => {
    dispatch(fetchProvider());
    dispatch(fetchMyProviderReviews());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchBookingsForProvider());
  }, [dispatch, provider?._id]);

  // normalize bookingStatus
  const normalizedBookings = useMemo(
    () =>
      bookings.map((b) => ({
        ...b,
        bookingStatus: b.bookingStatus ?? b.status ?? "pending",
      })),
    [bookings]
  );

  // stats
  const stats = useMemo(() => {
    const total = normalizedBookings.length;
    const completed = normalizedBookings.filter(
      (b) => b.bookingStatus === "completed"
    ).length;
    const confirmed = normalizedBookings.filter(
      (b) => b.bookingStatus === "confirmed"
    ).length;
    const pending = normalizedBookings.filter(
      (b) => b.bookingStatus === "pending"
    ).length;
    return { total, completed, confirmed, pending };
  }, [normalizedBookings]);

  // chart data: last 7 days completed counts
  const chartData = useMemo(() => {
    const today = startOfDay(new Date());
    const days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - (6 - i));
      return {
        date: d,
        label: d.toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
        }),
        count: 0,
      };
    });

    normalizedBookings.forEach((b) => {
      if (!b.bookingDate) return;
      const bd = startOfDay(new Date(b.bookingDate));
      const idx = days.findIndex((x) => x.date.getTime() === bd.getTime());
      if (idx >= 0 && b.bookingStatus === "completed") days[idx].count++;
    });

    // MUI x-charts wants xAxis.data (labels) and series.data arrays of same length
    const labels = days.map((d) => d.label);
    const values = days.map((d) => d.count);
    return { labels, values, days };
  }, [normalizedBookings]);

  // counts for today and month
  const counts = useMemo(() => {
    const now = new Date();
    const todayStart = startOfDay(now).getTime();
    const todayCompleted = normalizedBookings.filter((b) => {
      if (!b.bookingDate) return false;
      const bd = new Date(b.bookingDate).getTime();
      return bd >= todayStart && b.bookingStatus === "completed";
    }).length;

    const monthCompleted = normalizedBookings.filter((b) => {
      if (!b.bookingDate) return false;
      const bd = new Date(b.bookingDate);
      return sameMonthYear(bd, now) && b.bookingStatus === "completed";
    }).length;

    return { todayCompleted, monthCompleted };
  }, [normalizedBookings]);

  // lists
  const pendingList = normalizedBookings
    .filter((b) => b.bookingStatus === "pending")
    .slice(0, 6);
  const upcomingList = normalizedBookings
    .filter((b) => b.bookingStatus === "confirmed")
    .slice(0, 6);

  // navigation
  const goToBookings = (filterStatus) =>
    navigate("/provider/bookings", { state: { filterStatus } });

  // small confirm helper with toast
  const confirmWithToast = (message, processingText = "Processing...") => {
    const ok = window.confirm(message);
    if (ok) toast.info(processingText, { autoClose: 1200 });
    else toast.info("Action cancelled", { autoClose: 800 });
    return ok;
  };

  // Quick accept/decline with processing state + toast + refresh
  const runQuickAction = async (bookingId, status, successMsg) => {
    if (!confirmWithToast(`Are you sure?`, `${successMsg} — processing...`))
      return;
    setProcessingId(bookingId);
    try {
      await dispatch(updateBookingStatus({ id: bookingId, status })).unwrap();
      toast.success(successMsg);
      await dispatch(fetchBookingsForProvider());
    } catch (err) {
      console.error(err);
      toast.error(
        err?.response?.data?.message || err?.message || "Action failed"
      );
    } finally {
      setProcessingId(null);
    }
  };

  const handleQuickAccept = (b) =>
    runQuickAction(b._id, "confirmed", "Accepted");
  const handleQuickDecline = (b) =>
    runQuickAction(b._id, "cancelled", "Declined");

  return (
    <div className="min-h-screen px-6 py-10 bg-gradient-to-b from-orange-50 to-white">
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
              Provider Dashboard
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Manage bookings, services and availability — all in one place.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-4" />
        </div>
      </div>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left */}
        <section className="lg:col-span-9 space-y-6">
          {/* stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card
              onClick={() => goToBookings()}
              className="rounded-2xl shadow-sm cursor-pointer transform hover:-translate-y-1 transition"
            >
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-orange-500 font-semibold">
                      Total Bookings
                    </div>
                    <div className="mt-2 text-3xl font-extrabold text-slate-900">
                      {stats.total}
                    </div>
                    <div className="mt-1 text-xs text-slate-500">All time</div>
                  </div>
                  <div className="bg-orange-100 text-orange-600 p-3 rounded-full">
                    <PawPrint className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card
              onClick={() => goToBookings("completed")}
              className="rounded-2xl shadow-sm cursor-pointer hover:shadow-md transform hover:-translate-y-1 transition"
            >
              <CardContent className="p-5">
                <div>
                  <div className="text-xs uppercase tracking-wide text-emerald-600 font-semibold">
                    Completed
                  </div>
                  <div className="mt-2 text-2xl font-bold">
                    {stats.completed}
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    Past bookings
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card
              onClick={() => goToBookings("confirmed")}
              className="rounded-2xl shadow-sm cursor-pointer hover:shadow-md transform hover:-translate-y-1 transition"
            >
              <CardContent className="p-5">
                <div>
                  <div className="text-xs uppercase tracking-wide text-teal-600 font-semibold">
                    Confirmed
                  </div>
                  <div className="mt-2 text-2xl font-bold">
                    {stats.confirmed}
                  </div>
                  <div className="mt-1 text-xs text-slate-500">Upcoming</div>
                </div>
              </CardContent>
            </Card>

            <Card
              onClick={() => goToBookings("pending")}
              className="rounded-2xl shadow-sm cursor-pointer hover:shadow-md transform hover:-translate-y-1 transition"
            >
              <CardContent className="p-5">
                <div>
                  <div className="text-xs uppercase tracking-wide text-amber-500 font-semibold">
                    Pending
                  </div>
                  <div className="mt-2 text-2xl font-bold text-amber-600">
                    {stats.pending}
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    Needs your action
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick lists */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="rounded-2xl shadow-sm cursor-pointer transform hover:-translate-y-1 transition">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  Customer Reviews
                </CardTitle>
              </CardHeader>

              <CardContent>
                <ScrollArea className="h-64 pr-2">
                  {myReviews.length === 0 ? (
                    <p className="text-center text-sm text-gray-500 py-6">
                      No reviews yet for your services.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {myReviews.map((r) => (
                        <div
                          key={r._id}
                          className="border p-3 rounded-xl bg-white shadow-sm"
                        >
                          {/* Header */}
                          <div className="flex justify-between items-center">
                            <p className="text-sm font-semibold">
                              {r.user?.username || "User"}
                            </p>

                            <div className="flex">
                              {Array.from({ length: r.rating }).map((_, i) => (
                                <Star
                                  key={i}
                                  className="w-4 h-4 text-yellow-500 fill-yellow-500"
                                />
                              ))}
                            </div>
                          </div>

                          {/* Comment */}
                          <p className="text-sm text-gray-700 mt-1">
                            {r.comment}
                          </p>
                          <p className="text-[11px] text-gray-400 mt-1">
                            {new Date(r.createdAt).toLocaleDateString("en-IN")}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
            <Card className="rounded-2xl shadow-sm cursor-pointer transform hover:-translate-y-1 transition">
              <CardHeader>
                <CardTitle>Upcoming</CardTitle>
                <CardDescription className="text-sm">
                  Next scheduled bookings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-56 flex flex-col gap-3 overflow-auto">
                  {upcomingList.length === 0 ? (
                    <div className="text-sm text-slate-500 text-center">
                      No upcoming bookings
                    </div>
                  ) : (
                    upcomingList.map((next) => (
                      <div
                        key={next._id}
                        className="p-3 rounded-lg border bg-white w-full"
                      >
                        <div className="font-medium">
                          {next.user?.username || next.user?.email}
                        </div>
                        <div className="text-xs text-slate-500">
                          {new Date(next.bookingDate).toLocaleDateString()} •{" "}
                          {next.timeSlot}
                        </div>
                        <div className="text-xs text-slate-500 mt-2">
                          {next.petType} — {next.service}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chart */}
          <Card className="rounded-2xl shadow-sm cursor-pointer transform hover:-translate-y-1 transition">
            <CardHeader>
              <CardTitle className="text-orange-600">
                Completed Bookings — Last 7 days
              </CardTitle>
              <CardDescription className="text-sm text-slate-500">
                Today: {counts.todayCompleted} • This month:{" "}
                {counts.monthCompleted}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="w-full h-[260px]">
                <div className="w-full h-full rounded-lg p-4 bg-slate-900">
                  <BarChart
                    xAxis={[{ id: "days", data: chartData.labels }]}
                    series={[
                      {
                        data: chartData.values,
                        label: "Completed",
                        color: "#fb923c", // orange-400
                      },
                    ]}
                    height={220}
                    slotProps={{
                      legend: { hidden: true }, // no warning + minimal UI
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Right */}
        <aside className="lg:col-span-3 space-y-6">
          <SubscriptionCard />
          <Card className="rounded-2xl shadow-sm cursor-pointer transform hover:-translate-y-1 transition">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription className="text-sm">
                Recent status changes and actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {normalizedBookings.slice(0, 6).map((b) => (
                  <div
                    key={b._id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-white"
                  >
                    <div>
                      <div className="text-sm font-medium">
                        {b.user?.username || b.user?.email}
                      </div>
                      <div className="text-xs text-slate-500">
                        {b.petType} — {b.service}
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="text-xs">
                        <Badge className="capitalize">{b.bookingStatus}</Badge>
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        {new Date(b.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-sm cursor-pointer transform hover:-translate-y-1 transition border border-orange-100">
            <CardHeader>
              <CardTitle className="text-orange-700 font-semibold flex items-center gap-2">
                <span className="text-xl">🐾</span> Helpful Tips
              </CardTitle>

              <CardDescription className="text-sm text-orange-600 leading-snug">
                Little habits that make pet parents feel cared for.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <ul className="text-sm space-y-3 text-orange-700">
                <li className="flex items-start gap-2">
                  <span className="text-orange-500">•</span>
                  <span className="leading-snug">
                    Keep your{" "}
                    <span className="font-semibold">availability updated</span>{" "}
                    so owners know when you're free.
                  </span>
                </li>

                <li className="flex items-start gap-2">
                  <span className="text-orange-500">•</span>
                  <span className="leading-snug">
                    Reply within <span className="font-semibold">24 hours</span>{" "}
                    — quick responses build trust instantly.
                  </span>
                </li>

                <li className="flex items-start gap-2">
                  <span className="text-orange-500">•</span>
                  <span className="leading-snug">
                    Remember: every booking is someone’s furry family member —
                    treat them with love and care.
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </aside>
      </main>
    </div>
  );
}
