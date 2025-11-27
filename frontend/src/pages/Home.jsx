import { Button } from "@/components/ui/button";
import { PawPrint, MapPin, Calendar, Dog, Search } from "lucide-react";
import img from "../assets/dog.gif";
import Footer from "../components/Footer";
import { useLocation, useNavigate } from "react-router-dom";
import UserContext from "../context/User-Context";
import { toast } from "react-toastify";
import { useContext, useEffect } from "react";

export default function Home() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn, user } = useContext(UserContext);

  // Show toast when redirected after provider form submission
  useEffect(() => {
    if (state?.providerSubmitted) {
      toast.success(state.message || "Provider form submitted!", {
        autoClose: 9000, // only this toast stays 4-5 seconds
      });
    }
  }, [state?.providerSubmitted]);

  return (
    <main className="min-h-screen w-full bg-white px-4 flex items-start justify-center">
      <div className="w-full max-w-6xl">
        {/* HERO CARD */}
        <section className="bg-white rounded-2xl shadow-lg border border-orange-50 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center px-6 lg:px-10 pt-8 pb-6">
            {/* LEFT */}
            <div className="space-y-6 md:pr-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-700 w-max">
                <PawPrint className="h-3 w-3" />
                <span>Caring for pets, caring for you</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight text-neutral-900">
                Find Your Best <br />
                <span className="text-orange-600">Pet Care Center</span>
              </h1>

              <p className="text-neutral-600 text-sm max-w-xl">
                Book trusted vets, groomers & pet boarders — all in one place.
                <br />
                <span className="font-semibold text-neutral-800">
                  Connecting pets with loving care — anytime, anywhere.
                </span>
              </p>

              <div className="flex flex-wrap gap-3 items-center">
                {user?.role !== "provider" && (
                  <button
                    onClick={() => {
                      if (!isLoggedIn) navigate("/login");
                      else navigate("/provider");
                    }}
                    className="rounded-full px-6 py-2 text-sm bg-green-500 hover:bg-green-600"
                  >
                    Offer Pet Care
                  </button>
                )}
              </div>

              {/* Stats */}
              <div className="flex gap-8 pt-2 items-center">
                <StatCard count="2K+" label="Verified vets" />
                <StatCard count="12K+" label="Happy pets helped" />
              </div>
            </div>

            {/* RIGHT IMAGE */}
            <div className="flex justify-center md:justify-end">
              <div className="relative h-72 w-72 lg:h-80 lg:w-80 bg-gradient-to-b from-orange-50 to-white rounded-2xl overflow-hidden flex items-end justify-center">
                <img
                  src={img}
                  alt="happy dog"
                  className="h-full w-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white/90 to-transparent" />
              </div>
            </div>
          </div>

          {/* SEARCH BAR */}
          <div className="border-t border-orange-100 bg-orange-50/50 px-6 py-5">
            <form className="flex flex-col lg:flex-row items-stretch gap-3 lg:gap-4 justify-between">
              <div className="flex flex-wrap gap-3 flex-1">
                <FilterInput
                  icon={<Dog className="h-4 w-4 text-orange-500" />}
                  label="I'm looking for"
                  value="Dog Boarding"
                />
                <FilterInput
                  icon={<MapPin className="h-4 w-4 text-orange-500" />}
                  label="Location"
                  value="Enter city / pincode"
                />
                <FilterInput
                  icon={<Calendar className="h-4 w-4 text-orange-500" />}
                  label="Dates"
                  value="Select dates"
                />
              </div>

              <div className="flex items-center lg:items-stretch">
                <Button
                  type="submit"
                  className="flex items-center gap-2 rounded-full bg-orange-600 hover:bg-orange-700 px-5 py-2 text-white"
                >
                  <Search className="h-4 w-4" />
                  <span className="font-medium">Search</span>
                </Button>
              </div>
            </form>

            <div className="mt-3 text-xs text-neutral-500">
              Tip: Try "Grooming" or "Vet near me" — results update as you type.
            </div>
          </div>
        </section>

        {/* FEATURE CARDS */}
        <section className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <FeatureCard
            title="Trusted Professionals"
            desc="Background-checked vets, groomers & boarding"
          />
          <FeatureCard
            title="Easy Booking"
            desc="Book instantly, pay securely"
          />
          <FeatureCard
            title="24/7 Support"
            desc="We're here whenever you need us"
          />
        </section>

        <Footer />
      </div>
    </main>
  );
}

/* --- small reusable components --- */
function StatCard({ count, label }) {
  return (
    <div className="flex flex-col">
      <p className="text-xl sm:text-2xl font-bold text-neutral-900">{count}</p>
      <p className="text-xs text-neutral-500">{label}</p>
    </div>
  );
}

function FilterInput({ icon, label, value }) {
  return (
    <label className="flex items-start gap-3 rounded-xl bg-white px-3 py-2 shadow-sm border border-orange-100 min-w-[180px]">
      <div className="mt-0.5">{icon}</div>
      <div className="flex flex-col">
        <span className="text-[11px] text-neutral-500">{label}</span>
        <input
          aria-label={label}
          defaultValue={value}
          className="text-sm font-medium text-neutral-800 bg-transparent outline-none"
        />
      </div>
    </label>
  );
}

function FeatureCard({ title, desc }) {
  return (
    <div className="rounded-xl border border-orange-100 bg-white p-4 shadow-sm">
      <h3 className="font-semibold text-sm text-neutral-900">{title}</h3>
      <p className="text-xs text-neutral-500 mt-1">{desc}</p>
    </div>
  );
}
