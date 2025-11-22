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
      localStorage.setItem("token", response.data.token);

      const userRes = await axios.get("/users/account", {headers: {Authorization: localStorage.getItem("token")}});
      const user = userRes.data;

      userDispatch({ type: "LOGIN", payload: user });

      if (user.role === "admin") {
        navigate("/adminDashboard");
      } else if (user.role === "provider") {
        navigate("/provider/dashboard");
      } else {
        navigate("/");
      }

      resetForm();
      toast.success("Successfully Logged in");
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
    userDispatch({ type: "LOGOUT" });
    toast.success("Logged out")
    navigate("/");
  };

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const response = await axios.get(`/users/account`, {
          headers: { Authorization: localStorage.getItem("token") },
        });
        userDispatch({ type: "LOGIN", payload: response.data });
      } catch (err) {
        console.log(err.message);
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
