import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Contact from "./pages/Contact";
import Provider from "./pages/providers/Provider";
import Navbar from "./components/Navbar";
import AboutUs from "./pages/AboutUs";
import UserDashboard from "./pages/users/UserDashboard";
import AdminDasboard from "./pages/admin/AdminDashboard";
import UserProfile from "./pages/users/UserProfile";
import ProviderProfile from "./pages/providers/ProviderProfile";
import ProviderList from "./pages/providers/ProviderList";
import UsersList from "./pages/users/UsersList";
import AdminProfile from "./pages/admin/AdminProfile";
import ProviderPrfl from "./pages/providers/ProviderPrfl";
import UserPrfl from "./pages/users/UserPrfl";
import ProviderDashboard from "./pages/providers/ProviderDashboard";
import PendingApproval from "./pages/providers/PendingApprovel";
import PublicProviderProfile from "./pages/PublicProviderProfile";
import ScrollToTop from "./pages/ScrollToTop";
import ProviderBookings from "./pages/providers/ProviderBookings";
import ProviderSubscriptionPage from "./pages/providers/ProviderSubscriptionPage";

import "./App.css";
import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Skeleton } from "./components/ui/skeleton";

import ProtectedRoute from "./components/ProtectedRoutes";

function App() {
  return (
    <>
      <ToastContainer
        position="top-center"
        autoClose={1500}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
        theme="light"
        toastStyle={{
          backdropFilter: "blur(6px)",
          background:
            "linear-gradient(180deg, rgba(255, 246, 235, 0.92), rgba(255, 239, 219, 0.92))",
          color: "#5a3410",
          minHeight: "42px",
          padding: "8px 14px",
          borderRadius: "12px",
          fontSize: "13px",
          fontWeight: 600,
          border: "1px solid rgba(251,146,60,0.25)",
          boxShadow: "0 6px 25px rgba(255, 140, 60, 0.15)",
        }}
        progressStyle={{
          background: "#fb923c",
        }}
      />

      <div className="items-center pt-18 min-h-screen px-6 py-10 bg-gradient-to-b from-orange-50 to-white">
        <Navbar />
        <Skeleton />
        <ScrollToTop />

        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/provider" element={<Provider />} />
          <Route path="/provider/:id" element={<PublicProviderProfile />} />
          <Route
            path="/provider/subscription"
            element={<ProviderSubscriptionPage />}
          />

          {/* USER protected routes */}
          <Route
            path="/user/dashboard"
            element={
              <ProtectedRoute allowedRoles={["user"]}>
                <UserDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/profile"
            element={
              <ProtectedRoute allowedRoles={["user"]}>
                <UserPrfl />
              </ProtectedRoute>
            }
          />

          {/* PROVIDER protected routes */}
          <Route
            path="/provider/profile"
            element={
              <ProtectedRoute allowedRoles={["provider"]}>
                <ProviderPrfl />
              </ProtectedRoute>
            }
          />
          <Route
            path="/provider/dashboard"
            element={
              <ProtectedRoute allowedRoles={["provider"]}>
                <ProviderDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/provider/pending"
            element={
              <ProtectedRoute allowedRoles={["provider"]}>
                <PendingApproval />
              </ProtectedRoute>
            }
          />
          <Route
            path="/provider/bookings"
            element={
              <ProtectedRoute allowedRoles={["provider"]}>
                <ProviderBookings />
              </ProtectedRoute>
            }
          />

          {/* ADMIN protected routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDasboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/user/:id"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <UserProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/:id/provider"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <ProviderProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users/list"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <UsersList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/providers/list"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <ProviderList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/profile"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminProfile />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </>
  );
}

export default App;
