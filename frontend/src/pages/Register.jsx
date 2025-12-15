import UserContext from "../context/User-Context";
import { useContext, useEffect } from "react";
import { useFormik } from "formik";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import Joi from "joi";
import { toast } from "react-toastify";
import { User, Mail, Lock, Phone, PawPrint, ArrowRight } from "lucide-react";
import img from "@/assets/293.jpg";

export default function Register() {
  const { handleRegister, serverError, userDispatch } =
    useContext(UserContext);

  // ✅ Joi schema EXPECTS +91XXXXXXXXXX
  const registerSchema = Joi.object({
    username: Joi.string().required(),

    email: Joi.string().email({ tlds: false }).required(),

    password: Joi.string()
      .min(8)
      .pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])/)
      .required()
      .messages({
        "string.min": "Password must be at least 8 characters",
        "string.pattern.base":
          "Password must contain 1 uppercase, 1 number & 1 special character",
      }),

    phone: Joi.string()
      .pattern(/^\+91[6-9][0-9]{9}$/)
      .required()
      .messages({
        "string.pattern.base": "Enter a valid 10 digit Indian mobile number",
      }),
  });

  const formik = useFormik({
    validateOnChange: false,
    validateOnBlur: false,

    initialValues: {
      username: "",
      email: "",
      password: "",
      phone: "",
    },

    // ✅ Convert phone to +91XXXXXXXXXX BEFORE validation
    validate: (values) => {
      const digits = values.phone?.replace(/\D/g, "").slice(-10);

      const cleanedValues = {
        ...values,
        phone: digits ? `+91${digits}` : "",
      };

      const { error } = registerSchema.validate(cleanedValues, {
        abortEarly: false,
      });

      if (!error) return {};

      const errors = {};
      error.details.forEach((d) => {
        errors[d.path[0]] = d.message;
      });

      return errors;
    },

    // ✅ Send +91XXXXXXXXXX to backend
    onSubmit: (values, { resetForm }) => {
      toast.info("Registering your account...");

      const digits = values.phone.replace(/\D/g, "").slice(-10);

      handleRegister(
        {
          ...values,
          phone: `+91${digits}`,
        },
        resetForm
      );
    },
  });

  useEffect(() => {
    userDispatch({ type: "CLEAR_ERROR" });
  }, [userDispatch]);

  return (
    <div className="h-screen w-full grid lg:grid-cols-2 overflow-hidden">

      {/* LEFT SIDE */}
      <div className="hidden lg:flex flex-col relative items-center justify-center p-8 overflow-hidden border-r border-orange-200/50">
        <div className="text-center z-10 mb-8 max-w-md">
          <h1 className="text-4xl font-extrabold text-slate-800 flex items-center justify-center gap-3">
            <PawPrint className="text-orange-600" size={32} />
            Careonimal
          </h1>
          <h2 className="text-2xl font-bold text-slate-700 leading-tight">
            Because they aren't just pets, <br />
            <span className="text-orange-600">they are family.</span>
          </h2>
          <p className="text-sm text-slate-600 mt-4 leading-relaxed px-4">
            Join a community that understands the bond you share.
          </p>
        </div>

        <div className="relative w-full max-w-[380px] aspect-[4/5] rounded-3xl overflow-hidden rotate-2 hover:rotate-0 transition-all duration-700">
          <img
            src={img}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
            alt="Human and dog bonding"
          />
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center justify-center p-4">
        <div className="w-full max-w-[340px] bg-white/95 backdrop-blur-sm p-5 rounded-2xl shadow-xl">

          <div className="text-center mb-4">
            <h2 className="text-xl font-black text-slate-800 tracking-tight">
              Create Account
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Join our community in seconds
            </p>
          </div>

          {serverError && (
            <div className="mb-3 bg-red-50 text-red-600 px-3 py-2 rounded-lg text-[10px] font-bold border border-red-100 text-center uppercase tracking-wide">
              {serverError}
            </div>
          )}

          <form onSubmit={formik.handleSubmit} className="space-y-2.5">

            {/* Username */}
            <div>
              <Input
                name="username"
                {...formik.getFieldProps("username")}
                placeholder="Username"
                className="h-8 text-xs"
              />
              {formik.errors.username && (
                <p className="text-[10px] text-red-500 font-bold">
                  {formik.errors.username}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <Input
                name="email"
                {...formik.getFieldProps("email")}
                placeholder="Email"
                className="h-8 text-xs"
              />
              {formik.errors.email && (
                <p className="text-[10px] text-red-500 font-bold">
                  {formik.errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <Input
                type="password"
                name="password"
                {...formik.getFieldProps("password")}
                placeholder="Password"
                className="h-8 text-xs"
              />
              {formik.errors.password && (
                <p className="text-[10px] text-red-500 font-bold">
                  {formik.errors.password}
                </p>
              )}
            </div>

            {/* Phone */}
            <div>
              <div className={`flex items-center border rounded-xl px-3 ${formik.errors.phone ? "border-red-300" : "border-slate-200"}`}>
                <Phone size={12} className="text-slate-400 mr-2" />
                <PhoneInput
                  defaultCountry="IN"
                  value={formik.values.phone}
                  onChange={(value) => formik.setFieldValue("phone", value)}
                  placeholder="Mobile Number"
                  className="PhoneInputInput outline-none bg-transparent w-full text-xs h-8"
                />
              </div>
              {formik.errors.phone && (
                <p className="text-[10px] text-red-500 font-bold">
                  {formik.errors.phone}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-9 text-xs font-bold rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white"
            >
              Register <ArrowRight size={12} className="ml-1.5" />
            </Button>

            <div className="text-center pt-2">
              <Link to="/login" className="text-[10px] text-slate-400 hover:text-orange-600 font-bold">
                Already have an account? <span className="text-orange-600">Log in</span>
              </Link>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
