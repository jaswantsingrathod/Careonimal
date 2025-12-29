import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { useFormik } from "formik";
import UserContext from "../context/User-Context";
import { useContext, useEffect } from "react";

import Joi from "joi";
import { toast } from "react-toastify";
import { Mail, Lock, PawPrint, ArrowRight } from "lucide-react";

export default function Login() {
  const { handleLogin, serverError, userDispatch } = useContext(UserContext);

  //  JOI SCHEMA  
  const loginSchema = Joi.object({
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .required()
      .messages({
        "string.empty": "Email is required",
        "string.email": "Enter a valid email address",
      }),

    password: Joi.string()
      .min(8)
      .pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).*/)
      .required()
      .messages({
        "string.empty": "Password is required",
        "string.min": "Password must be at least 8 characters",
        "string.pattern.base":
          "Password must contain 1 uppercase, 1 lowercase and 1 number",
      }),
  });

  //  VALIDATOR 
  const validateWithJoi = (values) => {
    const { error } = loginSchema.validate(values, {
      abortEarly: false,
    });

    if (!error) return {};

    const errors = {};
    error.details.forEach((item) => {
      errors[item.path[0]] = item.message.replace(/"/g, "");
    });
    return errors;
  };

  //  FORMIK  
  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validateOnChange: false,
    validateOnBlur: false,
    validate: validateWithJoi,
    onSubmit: (values, { resetForm }) => {
      toast.info("Logging you in...");
      handleLogin(values, resetForm);
    },
  });

  useEffect(() => {
    userDispatch({ type: "CLEAR_ERROR" });
  }, [userDispatch]);

  useEffect(() => {
    if (serverError) {
      toast.error(serverError);
    }
  }, [serverError]);

  const demo = (role) => {
    const creds = {
      admin: { email: "admin@gmail.com", password: "Admin@123" },
      provider: { email: "provider@test.com", password: "provider" },
      user: { email: "user@test.com", password: "User@123" },
    }[role];

    if (!creds) return;

    formik.setFieldValue("email", creds.email);
    formik.setFieldValue("password", creds.password);
    handleLogin(creds, formik.resetForm);
  };

  return (
    <div className="min-h-fit w-full grid lg:grid-cols-2 overflow-hidden pt-10">
      {/* LEFT SIDE */}
      <div className="hidden lg:flex flex-col relative items-center justify-center p-8 overflow-hidden">
        <div className="text-center z-10 mb-8 max-w-md">
          <h1 className="text-4xl font-extrabold text-slate-800 flex items-center justify-center gap-3 mb-3">
            <PawPrint className="text-orange-600" size={32} /> Careonimal
          </h1>
          <h2 className="text-2xl font-bold text-slate-700 leading-tight">
            Welcome back, <br />
            <span className="text-orange-600">we missed you!</span>
          </h2>
          <p className="text-sm text-slate-600 mt-4 leading-relaxed px-4">
            Your furry friends are waiting. <br />
            Log in to continue your journey of love and care.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center justify-center p-4">
        <div className="w-full max-w-[340px] bg-white/95 backdrop-blur-sm p-5 rounded-2xl shadow-xl border border-orange-200">
          <div className="text-center mb-4">
            <h2 className="text-xl font-black text-slate-800 tracking-tight">
              Welcome Back
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Please enter your details
            </p>
          </div>

          <div className="flex items-center justify-center gap-4 mb-4">
            {["admin", "provider", "user"].map((role) => (
              <button key={role} onClick={() => demo(role)}>
                {role}
              </button>
            ))}
          </div>

          {serverError && (
            <div className="mb-3 bg-red-50 text-red-600 px-3 py-2 rounded-lg text-[10px] font-bold border border-red-100 text-center uppercase tracking-wide">
              {serverError}
            </div>
          )}

          <form onSubmit={formik.handleSubmit} className="space-y-2.5">
            <div className="space-y-2.5">
              <div className="relative group">
                <Mail
                  className="absolute left-3 top-2.5 text-slate-400 group-focus-within:text-orange-500 transition-colors"
                  size={12}
                />
                <Input
                  type="email"
                  name="email"
                  {...formik.getFieldProps("email")}
                  placeholder="Email Address"
                  className="pl-8 h-8 text-xs font-medium bg-slate-50 border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 rounded-xl transition-all"
                />
              </div>
              {formik.errors.email && (
                <p className="text-[10px] text-red-500 ml-1 font-bold leading-none">
                  {formik.errors.email}
                </p>
              )}

              <div className="relative group">
                <Lock
                  className="absolute left-3 top-2.5 text-slate-400 group-focus-within:text-orange-500 transition-colors"
                  size={12}
                />
                <Input
                  type="password"
                  name="password"
                  {...formik.getFieldProps("password")}
                  placeholder="Password"
                  className="pl-8 h-8 text-xs font-medium bg-slate-50 border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 rounded-xl transition-all"
                />
              </div>
              {formik.errors.password && (
                <p className="text-[10px] text-red-500 ml-1 font-bold leading-none">
                  {formik.errors.password}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-9 text-xs font-bold uppercase tracking-wider rounded-xl mt-1 shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 transition-all bg-gradient-to-r from-orange-500 to-orange-600 hover:to-orange-700 text-white"
            >
              Sign In <ArrowRight size={12} className="ml-1.5" />
            </Button>

            <div className="text-center pt-2">
                Don't have an account?{" "}
                <Link className="hover:text-orange-600"  to="/register">Register</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
