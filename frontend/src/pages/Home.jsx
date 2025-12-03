// src/pages/Home.jsx
import { useEffect, useContext } from "react";
import { Button } from "@/components/ui/button";
import { PawPrint, Calendar, Dog, Search } from "lucide-react";
import img from "../assets/dog.gif";
import Footer from "../components/Footer";
import { useLocation, useNavigate } from "react-router-dom";
import UserContext from "../context/User-Context";
import { toast } from "react-toastify";
import ProviderCard from "../pages/providers/ProviderCard";
import { useSelector, useDispatch } from "react-redux";
import {
  setQService,
  setQPetType,
  setRadiusKm,
  setConfirmOpen,
  setUserCoords,
  setSearchingNearby,
  fetchNearbyProviders,
  applyClientFilters,
} from "../slices/nearby-slice";

export default function Home() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn, user } = useContext(UserContext);

  const dispatch = useDispatch();
  const {
    providers,
    loadingProviders,
    searchingNearby,
    userCoords,
    qService,
    qPetType,
    radiusKm,
    confirmOpen,
  } = useSelector((s) => s.nearby);

  useEffect(() => {
    if (state?.providerSubmitted) {
      toast.success(state.message || "Provider form submitted!", {
        autoClose: 9000,
      });
    }
  }, [state?.providerSubmitted]);

  // openConfirm toggles modal; uses Permissions API to early-detect 'denied'
  const openConfirm = async (e) => {
    e?.preventDefault?.();
    if (!("geolocation" in navigator)) {
      toast.error("Geolocation not supported by your browser.");
      return;
    }

    if (navigator.permissions) {
      try {
        const perm = await navigator.permissions.query({ name: "geolocation" });
        if (perm.state === "denied") {
          toast.error(
            "Location permission is blocked. Please enable it in your browser/site settings and try again."
          );
          return;
        }
      } catch (err) {
        // ignore and continue to open modal
      }
    }

    dispatch(setConfirmOpen(true));
  };

  const onModalAllow = (e) => {
    e?.preventDefault?.();
    dispatch(setConfirmOpen(false));
    dispatch(setSearchingNearby(true));

    // Call getCurrentPosition immediately so the browser will show prompt
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        dispatch(setUserCoords({ lat, lng }));

        // dispatch thunk to fetch from server
        dispatch(fetchNearbyProviders({ lat, lng, radiusKm }))
          .unwrap()
          .then(() => {
            // apply client-side filters (if any)
            dispatch(applyClientFilters());
          })
          .catch((err) => {
            console.warn("Nearby fetch failed — falling back to client Haversine:", err);
            toast.info("Server lookup failed; showing local results if available.");
          });
      },
      (err) => {
        console.error("Geolocation error:", err);
        dispatch(setSearchingNearby(false));
        if (err.code === err.PERMISSION_DENIED) {
          toast.error(
            "You denied location access. Please enable it in your browser/site settings if you want nearby results."
          );
        } else {
          toast.error("Failed to get location. Try again.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  const onModalDeny = () => {
    dispatch(setConfirmOpen(false));
    toast.info("Location permission required to show nearby providers.");
  };

  const openProfile = (prov) => {
    if (!isLoggedIn) {
      toast.error("Please login to view provider profile");
      navigate("/login");
      return;
    }
    navigate(`/provider/${prov._id}`);
  };

  return (
    <main className="min-h-screen w-full bg-gradient-to-b from-white to-orange-50 px-4 py-8">
      <div className="w-full max-w-7xl mx-auto">
        {/* HERO & SEARCH */}
        <section className="relative bg-white rounded-3xl shadow-xl border border-orange-50 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center p-8 lg:p-10">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-3 rounded-full bg-orange-50 px-4 py-1 text-xs font-semibold text-orange-700 w-max shadow-sm">
                <PawPrint className="h-4 w-4" />
                <span>Trusted pet services nearby</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight text-slate-900">
                Find the best <span className="text-orange-600">pet care</span>{" "}
                near you
              </h1>

              <p className="text-neutral-600 text-sm max-w-xl">
                Book vets, groomers & boarders with verified profiles and real
                reviews. Quick search — instant results.
              </p>

              <div className="flex flex-wrap gap-3 items-center">
                {user?.role !== "provider" && (
                  <button
                    onClick={() => {
                      if (!isLoggedIn) navigate("/login");
                      else navigate("/provider");
                    }}
                    className="rounded-full px-6 py-2 text-sm bg-green-500 hover:bg-green-600 text-white shadow"
                  >
                    Offer Pet Care
                  </button>
                )}
              </div>
            </div>

            <div className="flex justify-center md:justify-end">
              <div className="relative h-72 w-72 lg:h-80 lg:w-80 rounded-2xl overflow-hidden bg-gradient-to-br from-orange-50 to-white shadow-inner">
                <img src={img} alt="happy dog" className="h-full w-full object-cover" />
              </div>
            </div>
          </div>

          {/* SEARCH PANEL */}
          <div className="px-6 pb-6">
            <form
              onSubmit={openConfirm}
              className="-mt-8 mx-auto max-w-4xl bg-white rounded-xl shadow-lg border border-orange-100 p-4 flex flex-col md:flex-row gap-3 items-stretch"
            >
              <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="flex items-center gap-3 rounded-lg border border-orange-100 px-3 py-2">
                  <div className="text-orange-500">
                    <Dog className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col w-full">
                    <label className="text-[11px] text-neutral-500">Service</label>
                    <select
                      value={qService}
                      onChange={(e) => dispatch(setQService(e.target.value))}
                      className="text-sm font-medium text-neutral-800 bg-transparent outline-none w-full"
                    >
                      <option value="">Any</option>
                      <option value="boarding">Boarding</option>
                      <option value="vet">Vet</option>
                      <option value="groomer">Groomer</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-lg border border-orange-100 px-3 py-2">
                  <div className="text-orange-500">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col w-full">
                    <label className="text-[11px] text-neutral-500">Pet Type</label>
                    <input
                      value={qPetType}
                      onChange={(e) => dispatch(setQPetType(e.target.value))}
                      placeholder="Dog, Cat..."
                      className="text-sm font-medium text-neutral-800 bg-transparent outline-none w-full"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 md:ml-4">
                <div className="flex items-center gap-2 rounded-lg border border-orange-100 px-3 py-2">
                  <label className="text-[11px] text-neutral-500 mr-2">Radius</label>
                  <input
                    type="number"
                    min={1}
                    value={radiusKm}
                    onChange={(e) => dispatch(setRadiusKm(Number(e.target.value)))}
                    className="w-20 text-sm font-medium text-neutral-800 bg-transparent outline-none"
                  />
                  <span className="text-xs text-neutral-400">km</span>
                </div>

                <Button
                  type="submit"
                  disabled={searchingNearby}
                  className="flex items-center gap-2 rounded-full bg-orange-600 hover:bg-orange-700 px-5 py-2 text-white shadow"
                >
                  <Search className="h-4 w-4" />
                  <span className="font-medium">{searchingNearby ? "Searching..." : "Search"}</span>
                </Button>
              </div>
            </form>

            <div className="mt-3 text-xs text-neutral-500 text-center">
              Tip: Try "<b>Grooming</b>" or "<b>Vet</b>" — results update when you search.
            </div>
          </div>
        </section>

        {/* Confirmation modal (redux-driven) */}
        {confirmOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white p-6 rounded shadow-lg w-96">
              <h3 className="text-lg font-semibold mb-2">Allow location access?</h3>
              <p className="mb-4 text-sm text-neutral-600">
                We need your location to find providers near you. The browser will ask for permission.
              </p>
              <div className="flex justify-end gap-2">
                <button onClick={onModalDeny} className="px-3 py-1 rounded border">
                  Cancel
                </button>
                <button onClick={onModalAllow} className="px-3 py-1 rounded bg-blue-600 text-white">
                  Allow
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PROVIDERS GRID */}
        <section className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Providers</h2>
            <div className="text-sm text-neutral-500">
              {userCoords ? `Showing near (${userCoords.lat.toFixed(3)}, ${userCoords.lng.toFixed(3)})` : `${providers.length} results`}
            </div>
          </div>

          {loadingProviders || searchingNearby ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin h-7 w-7 border-2 border-orange-400 rounded-full" />
            </div>
          ) : providers.length === 0 ? (
            <div className="text-center text-sm text-slate-500 py-12">
              <div className="mx-auto w-40 h-40 rounded-xl bg-orange-50 flex items-center justify-center mb-4">
                <img src="/assets/placeholder-dog.svg" alt="no providers" className="w-24 h-24 opacity-80" />
              </div>
              <div className="font-medium text-slate-700 mb-1">No providers found</div>
              <div className="text-xs text-neutral-500">Try increasing radius or clearing filters.</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {providers.map((prov) => (
                <ProviderCard key={prov._id} provider={prov} onView={openProfile} />
              ))}
            </div>
          )}
        </section>

        <Footer />
      </div>
    </main>
  );
}
