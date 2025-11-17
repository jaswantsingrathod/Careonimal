import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { useFormik } from "formik";
import UserContext from "../context/User-Context";
import { useContext, useEffect } from "react";

export default function Login() {

  const { handleLogin, serverError, userDispatch } = useContext(UserContext);

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    onSubmit: (values, { resetForm }) => {
      console.log("FormData", values);
      handleLogin(values, resetForm);
    },
  });

  useEffect(() => {
    userDispatch({ type: "CLEAR_ERROR" });
  }, []);

  return (
    <div className="w-full min-h-screen flex flex-col justify-center items-center bg-gray-100 px-4">

      <h2 className="text-2xl font-bold text-gray-800 mb-3">
        Login
      </h2>

      {serverError && (
        <p className="text-red-500 font-medium mb-2">{serverError}</p>
      )}

      <form
        onSubmit={formik.handleSubmit}
        className="w-full flex justify-center"
      >
        <div className="flex flex-col justify-center items-center gap-3 p-6 
                        w-full max-w-xs bg-white rounded-xl shadow-md border">

          <Input
            type="text"
            placeholder="Enter Email"
            name="email"
            value={formik.values.email}
            onChange={formik.handleChange}
            className="p-2 border rounded-md focus:ring-2 focus:ring-blue-400 w-full"
          />

          <Input
            type="password"
            placeholder="Enter Password"
            name="password"
            value={formik.values.password}
            onChange={formik.handleChange}
            className="p-2 border rounded-md focus:ring-2 focus:ring-blue-400 w-full"
          />

          <Button
            type="submit"
            className="w-full py-2 text-base hover:bg-blue-700 text-white rounded-md shadow"
          >
            Login
          </Button>

          <ul className="mt-1 text-xs">
            <li>
              <Link to="/register" className="text-blue-600 hover:underline">
                Don't have an Account? Register
              </Link>
            </li>
          </ul>

        </div>
      </form>
    </div>
  );
}
