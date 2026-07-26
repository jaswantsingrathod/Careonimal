import UserContext from "../context/User-Context";
import { useContext, useEffect, useState } from "react";
import { useFormik } from "formik";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import Joi from "joi";
import { toast } from "react-toastify";
import {
  User, Mail, Lock, Phone, PawPrint, ArrowRight,
  ShieldCheck, CalendarCheck, MapPin, Loader2, Eye, EyeOff, Home,
} from "lucide-react";

// A small scrapbook of real pet-parent moments across species — deliberately
// a different set from the Login page so the two screens feel like distinct
// moments, not the same photo recycled. Swap for your own shoot via @/assets
// if you prefer.
const SCRAPBOOK = [
  {
    src: "https://images.unsplash.com/photo-1562241450-662919105789?q=80&w=900&auto=format&fit=crop",
    alt: "A dog parent hugging their puppy",
    caption: "Bruno's first booking",
    rotate: "-rotate-3",
  },
  {
    src: "https://images.unsplash.com/photo-1450778869180-41d0601e046e?q=80&w=900&auto=format&fit=crop",
    alt: "A dog and cat cuddling together on grass",
    caption: "Luna, settling in",
    rotate: "rotate-6",
  },
  {
    src: "https://images.unsplash.com/photo-1579119134757-5c38803f34fc?q=80&w=900&auto=format&fit=crop",
    alt: "A dog kissing its owner",
    caption: "Welcome to the family",
    rotate: "-rotate-2",
  },
];

// Shown in place of any photo above that fails to load, so a dead hotlink
// never renders a broken-image icon.
const FALLBACK_IMG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect width="200" height="200" fill="#E9E1D0"/><text x="50%" y="50%" font-size="60" text-anchor="middle" dominant-baseline="central">🐾</text></svg>`
  );

function useCareonimalFonts() {
  useEffect(() => {
    if (document.getElementById("careonimal-fonts")) return;
    const link = document.createElement("link");
    link.id = "careonimal-fonts";
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap";
    document.head.appendChild(link);
  }, []);
}

export default function Register() {
  const { handleRegister, serverError, userDispatch } = useContext(UserContext);
  useCareonimalFonts();
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const registerSchema = Joi.object({
    username: Joi.string().required().messages({
      "string.empty": "Enter a username.",
    }),

    email: Joi.string()
      .email({ tlds: { allow: false } })
      .required()
      .messages({
        "string.empty": "Enter your email address.",
        "string.email": "Enter a valid email address.",
      }),

    password: Joi.string()
      .min(8)
      .pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])/)
      .required()
      .messages({
        "string.empty": "Enter a password.",
        "string.min": "Password must be at least 8 characters.",
        "string.pattern.base":
          "Password needs 1 uppercase, 1 number & 1 special character.",
      }),

    phone: Joi.string()
      .pattern(/^[6-9][0-9]{9}$/)
      .required()
      .messages({
        "string.empty": "Enter your mobile number.",
        "string.pattern.base": "Enter a valid 10 digit Indian mobile number.",
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

    validate: (values) => {
      const cleanedValues = {
        ...values,
        phone: values.phone?.replace(/\D/g, ""),
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

    onSubmit: (values, { resetForm }) => {
      toast.info("Creating your account...");

      const digits = values.phone.replace(/\D/g, "");

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

  useEffect(() => {
    if (serverError) toast.error(serverError);
  }, [serverError]);

  const fieldClass = (name) =>
    `h-11 rounded-xl bg-white pl-11 text-sm shadow-sm border-2 transition-colors focus-visible:ring-2 focus-visible:ring-[#E8A33D]/40 ${
      formik.errors[name]
        ? "border-[#D9694F] focus-visible:border-[#D9694F]"
        : "border-[#E9E1D0] focus-visible:border-[#1F3D36]"
    }`;

  return (
    <main
      className="fixed inset-0 z-40 min-h-screen w-full overflow-y-auto bg-[#F6EFE1] lg:grid lg:grid-cols-[60fr_40fr]"
      style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
    >
      {/* ---------- Story panel ---------- */}
      <section className="relative flex min-h-[560px] flex-col justify-between overflow-hidden bg-[#16241F] p-6 text-white sm:p-10 lg:min-h-screen lg:p-14">
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, white 1.5px, transparent 1.5px), radial-gradient(circle at 60% 70%, white 1.5px, transparent 1.5px)",
            backgroundSize: "56px 56px, 84px 84px",
          }}
        />
        <div className="absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-[#E8A33D]/[0.06] blur-3xl" />
        <div className="absolute -top-16 right-0 h-64 w-64 rounded-full bg-[#8FAE9B]/[0.08] blur-3xl" />

        <div className="relative z-10 flex h-full flex-col justify-between gap-10">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-bold tracking-wide backdrop-blur-sm">
            <PawPrint className="h-3.5 w-3.5 text-[#E8A33D]" />
            Careonimal
          </div>

          <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-center lg:gap-8">
            <div className="max-w-lg">
              <h1
                className="text-[2rem] leading-[1.14] font-semibold sm:text-[2.6rem] lg:text-[3rem]"
                style={{ fontFamily: "'Fraunces', Georgia, serif" }}
              >
                Because they aren't just pets — they're family.
              </h1>
              <p className="mt-4 max-w-sm text-[0.95rem] leading-6 text-white/78 sm:text-base">
                Join a community that understands the bond you share, and get
                trusted vets, groomers, and sitters ready whenever they're
                needed.
              </p>
            </div>

            {/* Signature element: a scattered polaroid stack of real
                pet-parent moments across species. Fades and rises in on
                mount, staggered per photo, then lifts and straightens on
                hover. */}
            <div className="relative hidden h-[220px] w-[260px] shrink-0 lg:block">
              {SCRAPBOOK.map((photo, i) => (
                <figure
                  key={photo.src}
                  className={`group absolute rounded-xl bg-white p-2 pb-6 shadow-2xl shadow-black/40 transition-all duration-700 ease-out hover:z-20 hover:-translate-y-2 hover:rotate-0 hover:shadow-black/60 ${
                    mounted
                      ? `opacity-100 translate-y-0 ${photo.rotate}`
                      : "opacity-0 translate-y-6 rotate-0"
                  }`}
                  style={{
                    top: `${i * 26}px`,
                    left: `${i * 34}px`,
                    zIndex: i + 1,
                    transitionDelay: mounted ? `${i * 180}ms` : "0ms",
                  }}
                >
                  <div className="h-28 w-32 overflow-hidden rounded-md bg-[#E9E1D0]">
                    <img
                      src={photo.src}
                      alt={photo.alt}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = FALLBACK_IMG;
                      }}
                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                    />
                  </div>
                  <figcaption
                    className="mt-1.5 text-center text-[10px] font-semibold text-[#3D4A44]"
                    style={{ fontFamily: "'Fraunces', Georgia, serif" }}
                  >
                    {photo.caption}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 border-t border-white/10 pt-6">
            {[
              { icon: CalendarCheck, label: "Visits kept" },
              { icon: ShieldCheck, label: "Vetted care" },
              { icon: MapPin, label: "Nearby & ready" },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3.5 py-2 text-xs font-bold uppercase tracking-wide text-white/85"
              >
                <Icon className="h-3.5 w-3.5 text-[#E8A33D]" />
                {label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Form panel ---------- */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white p-5 py-10 sm:p-10 lg:p-16">
        <PawPrint className="pointer-events-none absolute -right-8 -top-8 h-36 w-36 rotate-12 text-[#1F3D36]/[0.04]" />
        <PawPrint className="pointer-events-none absolute -bottom-10 -left-8 h-44 w-44 -rotate-12 text-[#1F3D36]/[0.04]" />

        <div className="relative z-10 w-full max-w-md">
          <div className="mb-6 flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#D9694F]">
                Create account
              </p>
              <h2
                className="mt-2 text-[1.9rem] font-semibold text-[#16241F] sm:text-[2.15rem]"
                style={{ fontFamily: "'Fraunces', Georgia, serif" }}
              >
                Join our community
              </h2>
              <p className="mt-2 text-sm leading-6 text-[#5B6660]">
                A few details and you're in — bookings, providers, and
                reminders will all be waiting for you.
              </p>
            </div>
            <Link
              to="/"
              className="inline-flex shrink-0 items-center gap-2 rounded-full border border-[#E9E1D0] bg-[#F6EFE1] px-3.5 py-2 text-sm font-semibold text-[#1F3D36] shadow-sm transition hover:border-[#1F3D36] hover:bg-white"
            >
              <Home className="h-4 w-4" />
              Home
            </Link>
          </div>

          {serverError && (
            <div className="mb-4 rounded-xl border border-[#F3C9BC] bg-[#FCEEE9] px-4 py-3 text-sm font-semibold text-[#B14A34]">
              {serverError}
            </div>
          )}

          <form onSubmit={formik.handleSubmit} className="space-y-4" noValidate>
            <div>
              <label className="mb-2 block text-sm font-bold text-[#16241F]">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 h-5 w-5 text-[#8FAE9B]" />
                <Input
                  name="username"
                  {...formik.getFieldProps("username")}
                  placeholder="Choose a username"
                  className={fieldClass("username")}
                />
              </div>
              {formik.errors.username && (
                <p className="mt-1.5 text-xs font-semibold text-[#D9694F]">
                  {formik.errors.username}
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-[#16241F]">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-5 w-5 text-[#8FAE9B]" />
                <Input
                  name="email"
                  {...formik.getFieldProps("email")}
                  placeholder="you@example.com"
                  className={fieldClass("email")}
                />
              </div>
              {formik.errors.email && (
                <p className="mt-1.5 text-xs font-semibold text-[#D9694F]">
                  {formik.errors.email}
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-[#16241F]">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-5 w-5 text-[#8FAE9B]" />
                <Input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  {...formik.getFieldProps("password")}
                  placeholder="Create a password"
                  className={`${fieldClass("password")} pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-3 text-[#8FAE9B] hover:text-[#1F3D36]"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {formik.errors.password && (
                <p className="mt-1.5 text-xs font-semibold text-[#D9694F]">
                  {formik.errors.password}
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-[#16241F]">
                Mobile number
              </label>
              <div
                className={`flex h-11 items-center rounded-xl border-2 bg-white pl-3.5 pr-3 shadow-sm transition-colors focus-within:ring-2 focus-within:ring-[#E8A33D]/40 ${
                  formik.errors.phone
                    ? "border-[#D9694F] focus-within:border-[#D9694F]"
                    : "border-[#E9E1D0] focus-within:border-[#1F3D36]"
                }`}
              >
                <Phone className="h-5 w-5 text-[#8FAE9B]" />
                <span className="ml-2 mr-1 text-sm font-bold text-[#3D4A44]">
                  +91
                </span>
                <Input
                  type="tel"
                  name="phone"
                  {...formik.getFieldProps("phone")}
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  className="h-full flex-1 border-0 bg-transparent p-0 pl-1 text-sm shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
              {formik.errors.phone && (
                <p className="mt-1.5 text-xs font-semibold text-[#D9694F]">
                  {formik.errors.phone}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={formik.isSubmitting}
              className="h-12 w-full rounded-xl bg-[#E8A33D] text-sm font-bold text-[#16241F] shadow-lg shadow-[#E8A33D]/30 transition hover:bg-[#D8932E] disabled:opacity-70"
            >
              {formik.isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Create account <ArrowRight className="ml-1 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-[#5B6660]">
            Already have an account?{" "}
            <Link className="font-bold text-[#1F3D36] hover:text-[#D9694F]" to="/login">
              Log in
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}