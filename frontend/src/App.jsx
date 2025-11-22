import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Contact from "./pages/Contact";
import Provider from "./pages/providers/Provider";
import Navbar from "./components/navbar";
import AboutUs from "./pages/AboutUs";
import Dashboard from "./pages/users/Dashboard";
import AdminDasboard from "./pages/AdminDashboard";
import UserProfile from "./pages/users/UserProfile";
import ProviderProfile from "./pages/providers/ProviderProfile";
import ProviderList from "./pages/providers/ProviderList";
import UsersList from "./pages/users/UsersList";
import AdminProfile from "./pages/AdminProfile";
import ProviderDashboard from "./pages/providers/ProviderDashboard";

import "./App.css";
import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <>
      <ToastContainer
        position="top-center"
        autoClose={1500}
        hideProgressBar={true}
        closeOnClick
        pauseOnHover
        draggable
        theme="colored"
        toastStyle={{
          backdropFilter: "blur(8px)",
          background: "rgba(255, 255, 255, 0.4)",
          color: "#000",
          minHeight: "38px",
          padding: "6px 14px",
          borderRadius: "10px",
          fontSize: "13px",
          fontWeight: 500,
        }}
      />
      <div className="py-5 items-center pt-18">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />}></Route>
          <Route path="/login" element={<Login />}></Route>
          <Route path="/register" element={<Register />}></Route>
          <Route path="/contact" element={<Contact />}></Route>
          <Route path="/provider" element={<Provider />}></Route>
          <Route path="/about" element={<AboutUs />}></Route>
          <Route path="/dashboard" element={<Dashboard />}></Route>
          <Route path="/adminDashboard" element={<AdminDasboard />}></Route>
          <Route path="/admin/user/:id" element={<UserProfile />}></Route>
          <Route
            path="/admin/provider/:id"
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
