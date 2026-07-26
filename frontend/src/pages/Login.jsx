import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useFormik } from "formik";
import UserContext from "../context/User-Context";
import { useContext, useEffect, useState } from "react";
import Joi from "joi";
import { toast } from "react-toastify";
import {
  Mail, Lock, PawPrint, ArrowRight, ShieldCheck,
  Stethoscope, CalendarCheck, MapPin, Loader2,
} from "lucide-react";

// A small scrapbook of real pet-parent moments across species — dog, cat, and
// rabbit — so the page never reads as "just a dog app." Swap any of these for
// your own shoot via @/assets if you prefer.
const SCRAPBOOK = [
  {
    src: "https://images.unsplash.com/photo-1522276498395-f4f68f7f8454?q=80&w=900&auto=format&fit=crop",
    alt: "A dog parent hugging their dog outdoors",
    caption: "Milo's evening walk",
    rotate: "-rotate-6",
  },
  {
    src: "https://images.unsplash.com/photo-1632498301446-5f78baad40d0?q=80&w=900&auto=format&fit=crop",
    alt: "A pet parent kissing their dog on the cheek",
    caption: "Nimbus, freshly groomed",
    rotate: "rotate-3",
  },
  {
    src: "https://images.unsplash.com/photo-1599169713100-120531cef331?q=80&w=900&auto=format&fit=crop",
    alt: "A pet parent gently holding a rabbit",
    caption: "Clover's checkup day",
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

// One-time Google Fonts load: Fraunces (warm, characterful display serif)
// paired with Plus Jakarta Sans (friendly, rounded body/UI face).
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

export default function Login() {
  const { handleLogin, serverError, userDispatch } = useContext(UserContext);
  useCareonimalFonts();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const loginSchema = Joi.object({
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .required()
      .messages({
        "string.empty": "Enter your email address.",
        "string.email": "Enter a valid email address.",
      }),
    password: Joi.string()
      .min(8)
      .pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).*/)
      .required()
      .messages({
        "string.empty": "Enter your password.",
        "string.min": "Password must be at least 8 characters.",
        "string.pattern.base": "Password must include uppercase, lowercase, and a number.",
      }),
  });

  const validateWithJoi = (values) => {
    const { error } = loginSchema.validate(values, { abortEarly: false });
    if (!error) return {};
    const errors = {};
    error.details.forEach((item) => {
      errors[item.path[0]] = item.message.replace(/"/g, "");
    });
    return errors;
  };

  const formik = useFormik({
    initialValues: { email: "", password: "" },
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
    if (serverError) toast.error(serverError);
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

  const fieldClass = (name) =>
    `h-12 rounded-xl bg-white pl-11 text-sm shadow-sm border-2 transition-colors focus-visible:ring-2 focus-visible:ring-[#E8A33D]/40 ${
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
      <section className="relative flex min-h-[520px] flex-col justify-between overflow-hidden bg-[#16241F] p-6 text-white sm:p-10 lg:min-h-screen lg:p-14">
        {/* Subtle organic texture instead of a flat photo background */}
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
                className="text-[2.1rem] leading-[1.12] font-semibold sm:text-[2.8rem] lg:text-[3.2rem]"
                style={{ fontFamily: "'Fraunces', Georgia, serif" }}
              >
                Welcome back to the one who waits by the door.
              </h1>
              <p className="mt-4 max-w-sm text-[0.95rem] leading-6 text-white/78 sm:text-base">
                Sign in to reach trusted vets, groomers, and sitters — and keep
                every promise you made to the one who trusts you most,
                whatever they walk, hop, or fly on.
              </p>
            </div>

            {/* Signature element: a scattered polaroid stack of real pet-parent
                moments across species. Fades and rises in on mount, staggered
                per photo, then lifts and straightens on hover. */}
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

          {/* Trust strip, redesigned as inline chips rather than boxes on a photo */}
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
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white p-5 sm:p-10 lg:p-16">
        {/* faint paw print texture, signature echo from the story panel */}
        <PawPrint className="pointer-events-none absolute -right-8 -top-8 h-36 w-36 rotate-12 text-[#1F3D36]/[0.04]" />
        <PawPrint className="pointer-events-none absolute -bottom-10 -left-8 h-44 w-44 -rotate-12 text-[#1F3D36]/[0.04]" />

        <div className="relative z-10 w-full max-w-md">
            <div className="mb-6">
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#D9694F]">
                Sign in
              </p>
              <h2
                className="mt-2 text-[1.9rem] font-semibold text-[#16241F] sm:text-[2.15rem]"
                style={{ fontFamily: "'Fraunces', Georgia, serif" }}
              >
                Good to see you again
              </h2>
              <p className="mt-2 text-sm leading-6 text-[#5B6660]">
                Pick up right where you left off — bookings, providers, and
                reminders are all right here.
              </p>
            </div>

            {/* <div className="mb-5">
              <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-[#8FAE9B]">
                Peek around as a demo
              </p>
              <div className="grid grid-cols-3 gap-2 rounded-xl border border-[#E9E1D0] bg-[#FAF6EC] p-1.5">
                {[
                  { role: "user", label: "Parent", icon: PawPrint },
                  { role: "provider", label: "Provider", icon: Stethoscope },
                  { role: "admin", label: "Admin", icon: ShieldCheck },
                ].map(({ role, label, icon: Icon }) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => demo(role)}
                    className="group flex flex-col items-center gap-1.5 rounded-lg px-2 py-2.5 text-xs font-bold text-[#3D4A44] transition hover:bg-white hover:shadow-sm"
                  >
                    <Icon className="h-4 w-4 text-[#1F3D36] transition group-hover:text-[#D9694F]" />
                    {label}
                  </button>
                ))}
              </div>
            </div> */}

            {serverError && (
              <div className="mb-4 rounded-xl border border-[#F3C9BC] bg-[#FCEEE9] px-4 py-3 text-sm font-semibold text-[#B14A34]">
                {serverError}
              </div>
            )}

            <form onSubmit={formik.handleSubmit} className="space-y-4" noValidate>
              <div>
                <label className="mb-2 block text-sm font-bold text-[#16241F]">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 h-5 w-5 text-[#8FAE9B]" />
                  <Input
                    type="email"
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
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-sm font-bold text-[#16241F]">Password</label>
                  <Link
                    to="/forgot-password"
                    className="text-xs font-bold text-[#1F3D36] hover:text-[#D9694F]"
                  >
                    Forgot it?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 h-5 w-5 text-[#8FAE9B]" />
                  <Input
                    type="password"
                    name="password"
                    {...formik.getFieldProps("password")}
                    placeholder="Enter your password"
                    className={fieldClass("password")}
                  />
                </div>
                {formik.errors.password && (
                  <p className="mt-1.5 text-xs font-semibold text-[#D9694F]">
                    {formik.errors.password}
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
                    Sign in <ArrowRight className="ml-1 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

          <p className="mt-6 text-center text-sm text-[#5B6660]">
            New to Careonimal?{" "}
            <Link className="font-bold text-[#1F3D36] hover:text-[#D9694F]" to="/register">
              Create an account
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}