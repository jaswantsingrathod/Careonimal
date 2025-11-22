import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { useFormik } from "formik";
import UserContext from "../context/User-Context";
import { useContext, useEffect } from "react";

import { toast } from "react-toastify";

export default function Login() {
  const { handleLogin, serverError, userDispatch } = useContext(UserContext);

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    onSubmit: (values, { resetForm }) => {
      toast.info("Logging you in...");
      handleLogin(values, resetForm);
    },
  });

  useEffect(() => {
    userDispatch({ type: "CLEAR_ERROR" });
  }, [userDispatch]);

  // whenever serverError changes, show toast
  useEffect(() => {
    if (serverError) {
      toast.error(serverError);
    }
  }, [serverError]);

  return (
    <div className="w-full min-h-screen flex flex-col justify-center items-center  px-4">
      <div className="w-120 h-screen p-20">
        {/* Heading */}
        <h2 className="text-center text-xl font-bold text-slate-900 mb-4">
          Login
        </h2>

        {/* Inline error text if you still want it */}
        {serverError && (
          <p className="text-xs text-red-500 text-center mb-2">
            {serverError}
          </p>
        )}

        <form
          onSubmit={formik.handleSubmit}
          className="w-full"
        >
          <div className="flex flex-col gap-3 p-5 bg-white rounded-xl shadow-sm border border-slate-200">
            {/* Email */}
            <Input
              type="email"
              placeholder="Enter Email"
              name="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              className="h-9 text-sm focus:ring-2 focus:ring-blue-400"
            />

            {/* Password */}
            <Input
              type="password"
              placeholder="Enter Password"
              name="password"
              value={formik.values.password}
              onChange={formik.handleChange}
              className="h-9 text-sm focus:ring-2 focus:ring-blue-400"
            />

            {/* Submit */}
            <Button
              type="submit"
              className="w-full h-9 text-sm font-medium rounded-md mt-1"
            >
              Login
            </Button>

            {/* Link */}
            <p className="mt-1 text-[11px] text-center text-slate-500">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-blue-600 hover:underline font-medium"
              >
                Register
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
