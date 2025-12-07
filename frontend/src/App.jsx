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

import "./App.css";
import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Skeleton } from "./components/ui/skeleton";

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
            "linear-gradient(180deg, rgba(255, 246, 235, 0.92), rgba(255, 239, 219, 0.92))", // warm pet cream
          color: "#5a3410", // warm brown text
          minHeight: "42px",
          padding: "8px 14px",
          borderRadius: "12px",
          fontSize: "13px",
          fontWeight: 600,
          border: "1px solid rgba(251,146,60,0.25)", // orange border
          boxShadow: "0 6px 25px rgba(255, 140, 60, 0.15)",
        }}
        progressStyle={{
          background: "#fb923c", // Tailwind orange-400
        }}
      />

      <div className="items-center pt-18 min-h-screen px-6 py-10 bg-gradient-to-b from-orange-50 to-white">
        <Navbar />
        <Skeleton />
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Home />}></Route>
          <Route path="/login" element={<Login />}></Route>
          <Route path="/register" element={<Register />}></Route>
          <Route path="/contact" element={<Contact />}></Route>
          <Route path="/provider" element={<Provider />}></Route>
          <Route path="/about" element={<AboutUs />}></Route>
          <Route path="/user/dashboard" element={<UserDashboard />}></Route>
          <Route path="/admin/dashboard" element={<AdminDasboard />}></Route>
          <Route path="/admin/user/:id" element={<UserProfile />}></Route>
          <Route path="/provider/profile" element={<ProviderPrfl />}></Route>
          <Route path="/user/profile" element={<UserPrfl />}></Route>
          <Route path="/provider/pending" element={<PendingApproval />}></Route>
          <Route
            path="/provider/:id"
            element={<PublicProviderProfile />}
          ></Route>
          <Route
            path="/provider/bookings"
            element={<ProviderBookings />}
          ></Route>

          <Route
            path="/admin/:id/provider"
            element={<ProviderProfile />}
          ></Route>
          <Route path="/admin/users/list" element={<UsersList />}></Route>
          <Route
            path="/admin/providers/list"
            element={<ProviderList />}
          ></Route>
          <Route path="/admin/profile" element={<AdminProfile />}></Route>
          <Route
            path="/provider/dashboard"
            element={<ProviderDashboard />}
          ></Route>
        </Routes>
      </div>
    </>
  );
}

export default App;
