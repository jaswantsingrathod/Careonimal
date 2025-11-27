import UserContext from "../context/User-Context";
import { useContext, useEffect } from "react";
import { useFormik } from "formik";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";

import { toast } from "react-toastify";

export default function Register() {
  const { handleRegister, serverError, userDispatch } = useContext(UserContext);

  const formik = useFormik({
    initialValues: {
      username: "",
      email: "",
      password: "",
      phone: "",
    },

    validate: (values) => {
      const errors = {};

      // Extract digits from phone
      const digits = values.phone?.replace(/\D/g, ""); // "+91 98765 43210" → "919876543210"

      if (!digits) {
        errors.phone = "Phone number is required";
      } else if (!digits.startsWith("91") || digits.length !== 12) {
        errors.phone = "Enter a valid 10 digit Indian number";
      }
      return errors;
    },

    onSubmit: (values, { resetForm }) => {
      toast.info("Registering your account...");
      handleRegister(values, resetForm);
    },
  });

  useEffect(() => {
    userDispatch({ type: "CLEAR_ERROR" });
  }, [userDispatch]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4">
      <div className="w-100 h-screen p-10">
        
        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="text-xl text-slate-900 font-bold">Create Account</h1>
        </div>

        {/* Backend error */}
        {serverError && (
          <p className="text-xs text-red-500 text-center mb-2">
            {serverError}
          </p>
        )}

        {/* Form */}
        <form
          onSubmit={formik.handleSubmit}
          className="bg-white/95 border border-slate-200 rounded-xl shadow-sm px-4 py-5 space-y-3"
        >
          {/* Username */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">Username</label>
            <Input
              type="text"
              name="username"
              value={formik.values.username}
              onChange={formik.handleChange}
              placeholder="Enter username"
              className="h-9 text-sm"
            />
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">Email</label>
            <Input
              type="email"
              name="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              placeholder="Enter email"
              className="h-9 text-sm"
            />
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">Password</label>
            <Input
              type="password"
              name="password"
              value={formik.values.password}
              onChange={formik.handleChange}
              placeholder="Enter password"
              className="h-9 text-sm"
            />
          </div>

          {/* Phone */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">Phone number</label>
            
            <div className="border border-slate-200 rounded-md px-2 py-1.5 bg-white text-sm focus-within:ring-2 focus-within:ring-blue-400">
              <PhoneInput
                defaultCountry="IN" // <-- +91 by default
                value={formik.values.phone}
                onChange={(value) => formik.setFieldValue("phone", value)}
                placeholder="Enter phone number"
                className="PhoneInputInput outline-none w-full text-sm"
              />
            </div>

            {formik.errors.phone && (
              <p className="text-[11px] text-red-500">
                {formik.errors.phone}
              </p>
            )}
          </div>

          {/* Submit */}
          <Button
            type="submit"
            className="w-full h-9 text-sm font-medium rounded-md mt-1"
          >
            Register
          </Button>
            <p className="mt-1 text-[11px] text-center text-slate-500">
              Already registered?{" "}
              <Link
                to="/login"
                className="text-blue-600 hover:underline font-medium"
              >
                Login
              </Link>
            </p>
        </form>
      </div>
    </div>
  );
}
