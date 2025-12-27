import { useEffect, useContext, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUsers, fetchProvider } from "../../slices/admin-slice";
import {
  Users,
  PawPrint,
  RefreshCw,
  LayoutDashboard,
  UserCircle,
  TrendingUp,
  Clock,
  Briefcase,
  LogOut,
  CircleUserRound ,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import UserContext from "../../context/User-Context";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

export default function AdminDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, handleLogout } = useContext(UserContext);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);

  const {
    users = [],
    providers = [],
    usersPagination,
    providersPagination,
    loading,
    error,
  } = useSelector((state) => state.admin);

  /* ---------------- FETCH DATA ---------------- */
  useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchProvider({ page: 1, limit: 100 }));
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(fetchUsers());
    dispatch(fetchProvider({ page: 1, limit: 100 }));
  };

  /* ---------------- DERIVED DATA ---------------- */

  const totalUsers = usersPagination?.total ?? 0;
  const totalProviders = providersPagination?.total ?? 0;

  const pendingProviders = useMemo(
    () => providers.filter((p) => !p.approvedByAdmin),
    [providers]
  );

  const recentActivity = useMemo(() => {
    const all = [
      ...users.map((u) => ({ ...u, type: "user" })),
      ...providers.map((p) => ({ ...p, type: "provider" })),
    ];
    return all
      .filter((i) => i.createdAt)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);
  }, [users, providers]);

  const serviceStats = useMemo(() => {
    return providers.reduce((acc, p) => {
      acc[p.serviceType] = (acc[p.serviceType] || 0) + 1;
      return acc;
    }, {});
  }, [providers]);

  // Chart Data: Last 7 days registration trend
  const chartData = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString("en-US", { weekday: "short" });
      const dayStart = new Date(d.setHours(0, 0, 0, 0));
      const dayEnd = new Date(d.setHours(23, 59, 59, 999));

      const uCount = users.filter((u) => {
        const cAt = new Date(u.createdAt);
        return cAt >= dayStart && cAt <= dayEnd;
      }).length;

      const pCount = providers.filter((p) => {
        const cAt = new Date(p.createdAt);
        return cAt >= dayStart && cAt <= dayEnd;
      }).length;

      days.push({ name: dateStr, Users: uCount, Providers: pCount });
    }
    return days;
  }, [users, providers]);

  // Growth Stats
  const last7Days = new Date();
  last7Days.setDate(last7Days.getDate() - 7);
  const usersThisWeek = users.filter(
    (u) => new Date(u.createdAt) >= last7Days
  ).length;
  const providersThisWeek = providers.filter(
    (p) => new Date(p.createdAt) >= last7Days
  ).length;

  if (!user)
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );

  return (
    <div className="min-h-screen -[#F8FAFC] flex flex-col md:flex-row font-sans text-slate-900">
      {/* Sidebar */}
      <aside className="w-[260px] h-screen bg- border-r border-slate-200 fixed left-0 top-0">
        <div className="h-full flex flex-col px-6 py-25">
          {/* Admin Info */}
          <div className="mb-8 flex items-center gap-3 px-3 py-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold uppercase">
              {user?.email?.[0]}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900 leading-tight">
                Admin
              </p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1">
            {[
              {
                label: "Dashboard",
                icon: LayoutDashboard,
                path: "/admin/dashboard",
              },
              { label: "Users", icon: Users, path: "/admin/users/list" },
              {
                label: "Providers",
                icon: PawPrint,
                path: "/admin/providers/list",
              },
              {
                label: "Approvals",
                icon: Briefcase,
                path: "/admin/providers/list",
              },
              {
                label: "Profile",
                icon: CircleUserRound ,
                path: "/admin/profile"
              }
            ].map((item) => {
              const active = window.location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition
              ${
                active
                  ? "bg-slate-100 text-slate-900 font-semibold"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Logout */}
          <button
            onClick={() => setIsLogoutOpen(true)}
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 rounded-lg"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-[260px] min-h-screen p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-xl md:text-2xl font-black text-slate-900 leading-tight">
                Dashboard Overview
              </h1>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                Platform Metrics & Insights
              </p>
            </div>
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              className="rounded-xl border-slate-200 h-9 font-bold text-[11px] gap-2 px-4 shadow-sm"
              disabled={loading}
            >
              <RefreshCw
                className={`h-3 w-3 text-blue-600 ${
                  loading ? "animate-spin" : ""
                }`}
              />
              Refresh
            </Button>
          </div>

          {/* Stats Bar (Smaller Cards) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <CompactStatsCard
              title="Total Users"
              value={totalUsers}
              icon={Users}
              color="bg-blue-500"
              onClick={() => navigate("/admin/users/list")}
            />
            <CompactStatsCard
              title="Providers"
              value={totalProviders}
              icon={PawPrint}
              color="bg-emerald-500"
              onClick={() => navigate("/admin/providers/list")}
            />
            <CompactStatsCard
              title="Pending providers"
              value={pendingProviders.length}
              icon={Briefcase}
              color="bg-amber-500"
              onClick={() => navigate("/admin/providers/list")}
              // alert={pendingProviders.length > 0}
            />
            <CompactStatsCard
              title="7d Growth"
              value={usersThisWeek + providersThisWeek}
              icon={TrendingUp}
              color="bg-purple-500"
              subtitle={`+${usersThisWeek}U | +${providersThisWeek}P`}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* GROWTH CHART */}
            <Card className="lg:col-span-2 rounded-2xl border-slate-200 shadow-sm">
              <CardHeader className="p-5 pb-0">
                <CardTitle className="text-sm font-black flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                  Registration Trend (Weekly)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient
                        id="colorUsers"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#3b82f6"
                          stopOpacity={0.1}
                        />
                        <stop
                          offset="95%"
                          stopColor="#3b82f6"
                          stopOpacity={0}
                        />
                      </linearGradient>
                      <linearGradient
                        id="colorProviders"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#10b981"
                          stopOpacity={0.1}
                        />
                        <stop
                          offset="95%"
                          stopColor="#10b981"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#f1f5f9"
                    />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fontWeight: 700, fill: "#64748b" }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fontWeight: 700, fill: "#64748b" }}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "12px",
                        border: "none",
                        boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                        fontSize: "11px",
                        fontWeight: "bold",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="Users"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorUsers)"
                    />
                    <Area
                      type="monotone"
                      dataKey="Providers"
                      stroke="#10b981"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorProviders)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* SERVICE BREAKDOWN */}
            <Card className="rounded-2xl border-slate-200 shadow-sm">
              <CardHeader className="p-5 pb-0">
                <CardTitle className="text-sm font-black text-slate-900 border-l-4 border-blue-500 pl-3">
                  Service Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                {Object.entries(serviceStats).length > 0 ? (
                  Object.entries(serviceStats).map(([type, count]) => (
                    <div key={type} className="space-y-1.5">
                      <div className="flex justify-between text-[11px] font-black uppercase text-slate-500 tracking-wider">
                        <span className="truncate">{type}</span>
                        <span className="text-blue-600">{count}</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{
                            width: `${((count / totalProviders) * 100).toFixed(
                              0
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 text-[11px] font-bold text-slate-400">
                    No data
                  </div>
                )}
              </CardContent>
            </Card>

            {/* RECENT ACTIVITY */}
            <Card className="lg:col-span-3 rounded-2xl border-slate-200 shadow-sm overflow-hidden">
              <CardHeader className="p-5 border-b border-slate-50">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-black flex items-center gap-2">
                    <Clock className="h-4 w-4 text-emerald-500" />
                    Recent Onboarding
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-[10px] font-bold' text-blue-600"
                    onClick={() => navigate("/admin/users/list")}
                  >
                    View Users
                  </Button>
                </div>
              </CardHeader>
              <div className="divide-y divide-slate-50">
                {recentActivity.map((item) => (
                  <div
                    key={item._id}
                    className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${
                          item.type === "provider"
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-blue-50 text-blue-600"
                        }`}
                      >
                        {item.type === "provider" ? (
                          <Briefcase className="h-4 w-4" />
                        ) : (
                          <UserCircle className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <p className="text-[13px] font-bold text-slate-900 line-clamp-1">
                          {item.type === "provider"
                            ? item.businessName
                            : item.username}
                        </p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                          New {item.type} profile
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full inline-block mb-1">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                      <div className="flex items-center justify-end gap-1">
                        <span className="h-1 w-1 rounded-full bg-emerald-500" />
                        <span className="text-[9px] font-bold text-slate-400">
                          Active
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </main>

      {/* Logout Dialog */}
      <Dialog open={isLogoutOpen} onOpenChange={setIsLogoutOpen}>
        <DialogContent className="sm:max-w-[400px] rounded-3xl p-6 border-none shadow-2xl">
          <DialogHeader className="mb-6">
            <div className="h-12 w-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-4">
              <LogOut className="h-6 w-6" />
            </div>
            <div className="text-lg font-black text-slate-900 tracking-tight">
              End Session?
            </div>
            <div className="text-sm font-bold text-slate-500 leading-relaxed mt-1">
              Are you sure you want to sign out? You will need to
              re-authenticate to access the dashboard.
            </div>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setIsLogoutOpen(false)}
              className="rounded-xl h-12 font-black border-slate-200 text-slate-600"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                handleLogout();
                setIsLogoutOpen(false);
              }}
              className="rounded-xl h-12 font-black bg-red-500 shadow-lg shadow-red-200"
            >
              Sign Out
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CompactStatsCard({
  title,
  value,
  icon: Icon,
  color,
  onClick,
  subtitle,
  alert,
}) {
  return (
    <Card
      onClick={onClick}
      className={`rounded-2xl border-slate-200 overflow-hidden group transition-all duration-200 shadow-sm hover:shadow-md ${
        onClick ? "cursor-pointer hover:-translate-y-1" : ""
      }`}
    >
      <div className="p-4 flex items-center gap-4">
        <div
          className={`p-2.5 rounded-xl text-white ${color} shadow-lg shadow-current/20 transition-transform duration-300 group-hover:scale-110`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">
            {title}
          </p>
          <div className="flex items-baseline gap-2 overflow-hidden">
            <h3 className="text-xl font-black text-slate-900 tracking-tight transition-colors group-hover:text-blue-600">
              {value}
            </h3>
            {subtitle && (
              <span className="text-[9px] font-bold text-slate-400 truncate">
                {subtitle}
              </span>
            )}
          </div>
          {alert && (
            <div className="flex items-center gap-1 mt-0.5">
              <span className="h-1 w-1 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[8px] font-black text-red-500 uppercase tracking-tighter">
                Action Required
              </span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
