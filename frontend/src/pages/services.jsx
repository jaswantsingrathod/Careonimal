import {
  Stethoscope,
  Scissors,
  Home,
  ShieldCheck,
  Clock,
  CheckCircle2,
  ArrowRight,
  Star,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import { Button } from "@/components/ui/button";

export default function Services() {
  const navigate = useNavigate();

  const services = [
    {
      id: "vet",
      title: "Veterinary Care",
      subtitle: "Expert health support",
      desc: "Connect with certified veterinarians for checkups, vaccinations, and emergency care. Your pet's health is our top priority.",
      icon: <Stethoscope className="h-8 w-8 text-white" />,
      gradient: "from-orange-400 to-red-500",
      shadow: "shadow-orange-200",
      features: ["24/7 Availability", "Verified Vets", "Emergency Care"],
    },
    {
      id: "groomer",
      title: "Pet Grooming",
      subtitle: "Spa days for pets",
      desc: "Pamper your friend with professional baths, haircuts, and styling. We ensure a stress-free and hygienic experience.",
      icon: <Scissors className="h-8 w-8 text-white" />,
      gradient: "from-blue-400 to-indigo-500",
      shadow: "shadow-blue-200",
      features: ["Organic Shampoos", "Nail Trimming", "Breed Specific"],
    },
    {
      id: "boarding",
      title: "Pet Boarding",
      subtitle: "Safe stays away",
      desc: "Going away? Find safe, loving homes or facilities where your pet will be treated like family while you're gone.",
      icon: <Home className="h-8 w-8 text-white" />,
      gradient: "from-green-400 to-emerald-500",
      shadow: "shadow-green-200",
      features: ["Daily Updates", "Playtime Included", "Video Calls"],
    },
  ];

  const steps = [
    { num: "01", title: "Search", desc: "Choose your service, pet type and location" },
    { num: "02", title: "Compare", desc: "Read reviews & check profiles" },
    { num: "03", title: "Book", desc: "Schedule instant appointments" },
    { num: "04", title: "Relax", desc: "Get real-time updates" },
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans overflow-x-hidden">

      {/* ---------------- HERO ---------------- */}
      <section className="relative pt-24 sm:pt-8 pb-20 overflow-hidden">
        {/* Background blobs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-50 border border-orange-100 text-orange-600 text-xs font-bold uppercase tracking-wider mb-8 shadow-sm">
            <Star className="h-3 w-3 fill-current" />
            Premium Pet Care
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-slate-900 mb-6 leading-tight">
            Services that make <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">
              tails wag
            </span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-10 font-medium">
            We bring the best professionals in your neighborhood directly to your fingertips.
            Safe, verified, and loved by pets.
          </p>

          <Button
            onClick={() => navigate("/")}
            className="h-12 sm:h-14 px-6 sm:px-8 rounded-full bg-slate-900 text-white hover:bg-slate-800 shadow-xl hover:-translate-y-1 transition-all duration-300 text-base sm:text-lg font-bold"
          >
            Find a Service
          </Button>
        </div>
      </section>

      {/* ---------------- SERVICES ---------------- */}
      <section className="py-20 px-4 sm:px-6 -mt-10 relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {services.map((s) => (
            <div
              key={s.id}
              className="group relative bg-white/80 backdrop-blur-md
                         rounded-2xl sm:rounded-[2.5rem]
                         p-6 sm:p-8
                         border border-white shadow-xl hover:shadow-2xl
                         transition-all duration-500 hover:-translate-y-2"
            >
              <div
                className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br ${s.gradient}
                            shadow-lg flex items-center justify-center mb-6`}
              >
                {s.icon}
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mb-1">
                {s.title}
              </h3>

              <p className={`text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r ${s.gradient} mb-4`}>
                {s.subtitle}
              </p>

              <p className="text-slate-500 mb-6 leading-relaxed text-sm sm:text-base">
                {s.desc}
              </p>

              <ul className="space-y-3 mb-6">
                {s.features.map((feat, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                    <CheckCircle2 className="h-4 w-4 text-orange-500" />
                    {feat}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => navigate("/")}
                className="w-full py-3 rounded-xl bg-slate-50 text-slate-900 font-bold hover:bg-slate-100 transition flex items-center justify-center gap-2"
              >
                Book Now <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/*  HOW IT WORKS  */}
      <section className="py-20 ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 mb-4">
              How it works
            </h2>
            <p className="text-slate-500 text-base sm:text-lg">
              Simple steps to happy pets
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white border-4 border-orange-100 text-orange-600 font-black text-lg flex items-center justify-center mb-4 shadow-lg">
                  {step.num}
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">
                  {step.title}
                </h3>
                <p className="text-slate-500 text-sm max-w-[180px]">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/*  TRUST  */}
      <section className="bg-slate-900 rounded-4xl py-20 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: "Verified Providers", val: "500+", icon: <ShieldCheck /> },
              { label: "Bookings Completed", val: "12k+", icon: <Clock /> },
              { label: "5-Star Reviews", val: "98%", icon: <Star /> },
              { label: "Cities Covered", val: "25+", icon: <Home /> },
            ].map((stat, i) => (
              <div
                key={i}
                className="bg-slate-800/50 rounded-xl p-5 text-center border border-slate-700"
              >
                <div className="text-orange-500 mb-2 flex justify-center">
                  {stat.icon}
                </div>
                <div className="text-2xl font-black">{stat.val}</div>
                <div className="text-xs text-slate-400 font-bold uppercase mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
