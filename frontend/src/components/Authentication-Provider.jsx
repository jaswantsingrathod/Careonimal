import UserContext from "../context/User-Context";
import { useEffect, useReducer } from "react";
import UserReducer from "../reducer/UserReducer";
import axios from "../config/axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function AuthenticationProvider(props) {
  const navigate = useNavigate();

  const [userState, userDispatch] = useReducer(UserReducer, {
    user: null,
    isLoggedIn: false,
    serverError: "",
    role: "",
  });

  const handleRegister = async (formData, resetForm) => {
    try {
      const response = await axios.post(`/users/register`, formData);
      console.log(response.data);
      resetForm();
      toast.success("successfully registered");
      navigate("/login");
    } catch (err) {
      userDispatch({ type: "SERVER_ERRORS", payload: err.response.data.error });
    }
  };

  const handleLogin = async (formData, resetForm) => {
    try {
      const response = await axios.post("/users/login", formData);
      const data = response.data;

      if (data?.pending) {
        // store small info to show on pending page (optional)
        sessionStorage.setItem(
          "pendingProviderUser",
          JSON.stringify({
            id: data.user?._id,
            username: data.user?.username,
            message: data.message || "Your provider profile is under review",
          })
        );

        // ensure no token is persisted
        localStorage.removeItem("token");
        // navigate to the pending page (user is not logged in)
        navigate("/provider/pending", { replace: true });
        resetForm?.();
        return;
      }

      // --- normal login flow (token issued) ---
      if (data?.token) {
        // persist token
        localStorage.setItem("token", data.token);
        // fetch the account/user details using persisted token (your existing endpoint)
        const userRes = await axios.get("/users/account", {
          headers: { Authorization: localStorage.getItem("token") },
        });
        const user = userRes.data;

        userDispatch({ type: "LOGIN", payload: user });

        if (user.role === "admin") {
          navigate("/adminDashboard");
        } else if (user.role === "provider") {
          navigate("/provider/profile");
        } else {
          navigate("/");
        }

        resetForm?.();
        toast.success("Successfully Logged in");
        return;
      }

      // unexpected response
      toast.error("Unexpected response from server during login");
    } catch (err) {
      console.log(err?.response?.data?.error);
      userDispatch({
        type: "SERVER_ERRORS",
        payload: err?.response?.data?.error || "Login failed",
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
    userDispatch({ type: "LOGOUT" });
    toast.success("Logged out");
    navigate("/");
  };

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const response = await axios.get(`/users/account`, {
          headers: { Authorization: token },
        });
        userDispatch({ type: "LOGIN", payload: response.data });
      } catch (err) {
        console.log(err.message);
        // token may be invalid -> clear it
        localStorage.removeItem("token");
      }
    };
    fetchUser();
  }, []);

  return (
    <div>
      <UserContext.Provider
        value={{
          ...userState,
          userDispatch,
          handleRegister,
          handleLogin,
          handleLogout,
        }}
      >
        {props.children}
      </UserContext.Provider>
    </div>
  );
}
