import UserContext from "../context/User-Context";
import { useEffect, useReducer } from "react";
import UserReducer from "../reducer/UserReducer";
import axios from "../config/axios";
import { useNavigate } from "react-router-dom";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function AuthenticationProvider(props) {
  const navigate = useNavigate();
  const [userState, userDispatch] = useReducer(UserReducer, {
    user: null,
    isLoggedIn: false,
    serverError: "",
  });

  const handleRegister = async (formData, resetForm) => {
    try {
      const response = await axios.post(`/users/register`, formData);
      console.log(response.data);
      resetForm();
      alert("successfully registered");
      navigate("/login");
    } catch (err) {
      userDispatch({ type: "SERVER_ERRORS", payload: err.response.data.error });
    }
  };

  const handleLogin = async (formData, resetForm) => {
    try {
      const response = await axios.post(`/users/login`, formData);
      const { token, user, users } = response.data;
      localStorage.setItem("token", token);
      console.log("login",response.data)
      userDispatch({ type: "LOGIN", payload: user });

      const userRes = await axios.get(`/users/account`, {
        headers: { Authorization: localStorage.getItem("token") },
      });
      console.log("userRes", userRes.data);
      userDispatch({ type: "LOGIN", payload: userRes.data });

      if (user.role === "admin" && users) {
        userDispatch({ type: "SET_USERS", payload: users });
      }

      resetForm();
      alert("Successfully Logged in");
      alert(`Welcome ${user.username}`);
      navigate("/dashboard");
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
    navigate("/login");
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
