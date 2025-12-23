import { useEffect, useContext, useState } from "react";
import { Button } from "@/components/ui/button";
import { PawPrint, Calendar, Dog, Search } from "lucide-react";
import img from "../assets/dog.gif";
import Footer from "../components/Footer";
import { useLocation, useNavigate } from "react-router-dom";
import UserContext from "../context/User-Context";
import { toast } from "react-toastify";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import ProviderCard from "../components/ProviderCard";
import { useSelector, useDispatch } from "react-redux";
import {
  setServiceType,
  setPetType,
  setRadiusKm,
  setConfirmOpen,
  setUserCoords,
  setSearchingNearby,
  fetchNearbyProviders,
} from "../slices/nearby-slice";

export default function Home() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn, user } = useContext(UserContext);
  const dispatch = useDispatch();

  const {
    providers,
    loading,
    searchingNearby,
    userCoords,
    serviceType: reduxServiceType,
    petType: reduxPetType,
    radiusKm: reduxRadiusKm,
    confirmOpen,
  } = useSelector((state) => state.nearby);

  // Local state to prevent Redux dispatch on every keystroke
  const [localPetType, setLocalPetType] = useState(reduxPetType || "");
  const [localServiceType, setLocalServiceType] = useState(reduxServiceType || "");
  const [localRadius, setLocalRadius] = useState(reduxRadiusKm || 10);

  useEffect(() => {
    if (state?.providerSubmitted) {
      toast.success(state.message || "Provider form submitted!", {
        autoClose: 9000,
      });
    }
  }, [state?.providerSubmitted]);

  // Sync redux state to local state if needed (e.g. coming back to page)
  useEffect(() => {
    setLocalPetType(reduxPetType || "");
    setLocalServiceType(reduxServiceType || "all");
    setLocalRadius(reduxRadiusKm || 10);
  }, [reduxPetType, reduxServiceType, reduxRadiusKm]);

  // ---------------- SEARCH HANDLER  --------------
  const openConfirm = async (e) => {
    e?.preventDefault?.();

    // Check permissions first
    if (!("geolocation" in navigator)) {
      toast.error("Geolocation not supported by your browser.");
      return;
    }

    if (navigator.permissions) {
      try {
        const perm = await navigator.permissions.query({ name: "geolocation" });
        if (perm.state === "denied") {
          toast.error("Location permission is blocked. Enable it in browser settings.");
          return;
        }
      } catch { }
    }

    // Sync local state to Redux before searching
    dispatch(setPetType(localPetType));
    dispatch(setServiceType(localServiceType));
    dispatch(setRadiusKm(localRadius));

    if (userCoords?.lat && userCoords?.lng) {
      dispatch(setSearchingNearby(true));
      dispatch(
        fetchNearbyProviders({
          lat: userCoords.lat,
          lng: userCoords.lng,
          radiusKm: localRadius,
          serviceType: localServiceType === "all" ? "" : localServiceType,
          petType: localPetType,
        })
      );
      return;
    }

    dispatch(setConfirmOpen(true));
  };

  /* ---------------- ALLOW LOCATION ---------------- */
  const onModalAllow = (e) => {
    e?.preventDefault?.();
    dispatch(setConfirmOpen(false));
    dispatch(setSearchingNearby(true));

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        dispatch(setUserCoords({ lat, lng }));

        // Ensure Redux is updated (in case search didn't run via openConfirm path)
        dispatch(setPetType(localPetType));
        dispatch(setServiceType(localServiceType));
        dispatch(setRadiusKm(localRadius));

        dispatch(
          fetchNearbyProviders({
            lat,
            lng,
            radiusKm: localRadius,
            serviceType: localServiceType === "all" ? "" : localServiceType,
            petType: localPetType,
          })
        );
      },
      (err) => {
        dispatch(setSearchingNearby(false));
        if (err.code === err.PERMISSION_DENIED) {
          toast.error("Location access denied.");
        } else {
          toast.error("Failed to get location.");
        }
      },
      { enableHighAccuracy: false, timeout: 20000, maximumAge: 60000 }
    );
  };

  const onModalDeny = () => {
    dispatch(setConfirmOpen(false));
    toast.info("Location permission required to search nearby providers.");
  };

  /* ---------------- OPEN PROFILE ---------------- */
  const openProfile = (prov) => {
    if (!isLoggedIn) {
      toast.error("Please login to view provider profile");
      navigate("/login");
      return;
    }
    navigate(`/provider/${prov._id}`);
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* HERO */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center p-8 lg:p-10">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-3 rounded-full bg-orange-50 px-4 py-1 text-xs font-semibold text-orange-700 w-max shadow-sm">
            <PawPrint className="h-4 w-4" />
            <span>Trusted pet services nearby</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900">
            Find the best <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">pet care</span> near you
          </h1>

          <p className="text-neutral-600 text-sm max-w-xl">
            Book vets, groomers & boarders with verified profiles and reviews.
          </p>

          {user?.role !== "provider" && (
            <button
              onClick={() => !isLoggedIn ? navigate("/login") : navigate("/provider")}
              className="rounded-full px-6 py-2 text-sm bg-green-500 hover:bg-green-600 text-white shadow"
            >
              Offer Pet Care
            </button>
          )}
        </div>

        <div className="flex justify-center md:justify-end">
          <div className="relative h-72 w-72 lg:h-80 lg:w-80 rounded-2xl overflow-hidden bg-orange-50 shadow-inner">
            <img src={img} alt="happy dog" className="h-full w-full object-cover" />
          </div>
        </div>
      </div>

      {/* SEARCH PANEL */}
      <div className="px-4 sm:px-6 pb-2">
        <form
          onSubmit={openConfirm}
          className="mx-auto max-w-4xl bg-white rounded-2xl shadow-xl border border-orange-200
               p-4 sm:p-5
               flex flex-col gap-4
               md:flex-row md:items-center"
        >
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Service */}
            <div className="flex items-center gap-3 rounded-xl border px-3 py-2 sm:px-4 sm:py-3 bg-white">
              <Dog className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500 shrink-0" />

              <Select
                value={localServiceType}
                onValueChange={setLocalServiceType}
              >
                <SelectTrigger className="border-none shadow-none focus:ring-0 focus:ring-offset-0 h-auto p-0 text-sm font-medium text-slate-700">
                  <SelectValue placeholder="Any Service" />
                </SelectTrigger>

                <SelectContent className="rounded-xl">
                  <SelectItem value="all">Any service</SelectItem>
                  <SelectItem value="vet">Veterinary Care </SelectItem>
                  <SelectItem value="groomer">Pet Grooming</SelectItem>
                  <SelectItem value="boarding">Pet Boarding</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Pet Type */}
            <div className="flex items-center gap-3 rounded-xl border px-3 py-2 sm:px-4 sm:py-3">
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500" />
              <input
                value={localPetType}
                onChange={(e) => setLocalPetType(e.target.value)}
                placeholder="Dog, Cat..."
                className="text-sm font-medium bg-transparent outline-none w-full"
              />
            </div>
          </div>

          {/* ACTIONS */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            {/* Radius */}
            <div className="flex items-center justify-between sm:justify-start gap-2 rounded-xl border px-3 py-2 sm:px-4 sm:py-3">
              <label className="text-xs text-slate-500">Radius</label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min={1}
                  value={localRadius}
                  onChange={(e) => setLocalRadius(Number(e.target.value))}
                  className="w-14 sm:w-16 text-sm outline-none"
                />
                <span className="text-xs text-neutral-400">km</span>
              </div>
            </div>

            {/* Search Button */}
            <Button
              type="submit"
              disabled={searchingNearby}
              className="rounded-full bg-orange-600 hover:bg-orange-700
                   px-5 py-2.5 sm:px-6 sm:py-3
                   text-sm text-white
                   w-full sm:w-auto"
            >
              <Search className="h-4 w-4 mr-2" />
              {searchingNearby ? "Searching..." : "Search"}
            </Button>
          </div>
        </form>
      </div>

      {/* CONFIRM MODAL */}
      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white p-6 rounded-xl w-96">
            <h3 className="font-semibold mb-2">Allow location access?</h3>
            <p className="text-sm text-neutral-600 mb-4">
              We need your location to show nearby providers.
            </p>
            <div className="flex justify-end gap-2">
              <button onClick={onModalDeny} className="px-3 py-1 border rounded">Cancel</button>
              <button onClick={onModalAllow} className="px-3 py-1 bg-blue-600 text-white rounded">Allow</button>
            </div>
          </div>
        </div>
      )}

      {/* PROVIDERS */}
      <section className="mt-10">
        {loading || searchingNearby ? (
          <div className="flex justify-center py-14">
            <div className="animate-spin h-8 w-8 border-2 border-orange-400 border-t-transparent rounded-full" />
          </div>
        ) : !userCoords ? (
          <div className="text-center py-20 text-slate-500">
            Please search to find nearby providers
          </div>
        ) : providers.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            No providers found. Try changing filters.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {providers.map((prov) => (
              <ProviderCard
                key={prov._id}
                provider={prov}
                onView={openProfile}
              />
            ))}
          </div>
        )}
      </section>
      <Footer />
    </div>
  );
}
``