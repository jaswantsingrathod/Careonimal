import { useContext, useEffect, useMemo } from "react";
import UserContext from "../../context/User-Context";
import { useSelector, useDispatch } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin, PawPrint, Edit, AlertCircle } from "lucide-react";
import { fetchProvider, fetchSingleProvider } from "../../slices/admin-slice";

export default function ProvidersPrfl() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  const {
    providers = [],
    selectedProvider = null,
    loading = false,
  } = useSelector((state) => state.admin || {});

  const { isLoggedIn, user } = useContext(UserContext); // logged-in user

  // fetch either a single provider (if id in URL) or the provider list (to find current user's provider)
  useEffect(() => {
    if (id) {
      dispatch(fetchSingleProvider(id));
      return;
    }
    dispatch(fetchProvider());
  }, [dispatch, id]);

  // determine which provider to show (never fall back to providers[0])
  const ele = useMemo(() => {
    if (id) {
      if (selectedProvider?._id === id) return selectedProvider;
      return providers?.find((prov) => String(prov._id) === String(id)) ?? null;
    }

    // no id: prefer provider that belongs to the logged-in user
    if (user?.role === "provider" && user?._id) {
      const mine = providers?.find((prov) => {
        const provUser = prov.user?._id ?? prov.user;
        return provUser && String(provUser) === String(user._id);
      });
      if (mine) return mine;
    }

    // don't show a random provider
    return selectedProvider ?? null;
  }, [id, selectedProvider, providers, user]);

  useEffect(() => {
    if (!user || user.role !== "provider") return;
    // if we have the provider record for this user
    if (ele) {
      const provUserId = ele.user?._id ?? ele.user;
      const isOwner = provUserId && String(provUserId) === String(user._id);

      if (isOwner && !ele.approvedByAdmin) {
        navigate("/provider/pending", { replace: true });
        return;
      }
    } 
    // else {
    //   if (!loading && Array.isArray(providers)) {
    //     // no provider found for this logged-in provider user
    //     navigate("/provider/pending", { replace: true });
    //   }
    // }
  }, [ele, user, providers, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-gray-600">Loading profile...</p>
      </div>
    );
  }

  if (!ele) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-gray-600">Provider not found.</p>
      </div>
    );
  }

  const displayName = ele.businessName;
  const initial = displayName && displayName[0]?.toUpperCase();

  // owner flag to conditionally show Edit button
  const isOwner = Boolean(
    user?.role === "provider" &&
    ele?.user &&
    String(ele.user?._id ?? ele.user) === String(user?._id)
  );

  return (
    <div className="min-h-screen w-full px-4 py-10 flex justify-center">
      <div className="max-w-4xl w-full space-y-6">
        <Card className="shadow-lg border-none">
          <CardHeader className="flex flex-col items-center">
            <div className="h-28 w-28 rounded-full bg-gray-200 flex items-center justify-center text-4xl font-bold overflow-hidden">
              {ele.image ? (
                <img src={ele.image} alt={displayName} className="h-full w-full object-cover" />
              ) : (
                initial
              )}
            </div>

            <CardTitle className="mt-4 text-2xl">{displayName}</CardTitle>
            <p className="text-gray-500">{ele.serviceType}</p>

            <Badge variant="secondary" className="mt-2">
              {ele.approvedByAdmin ? "Approved" : "Pending Approval"}
            </Badge>

            {isOwner && (
              <Button className="mt-4 flex items-center gap-2">
                <Edit className="h-4 w-4" />
                Edit Profile
              </Button>
            )}
          </CardHeader>
        </Card>

        {/* INFO CARD */}
        <Card className="shadow-md border-none">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <InfoRow icon={<Mail />} label="Email" value={ele.user?.email} />
            <InfoRow icon={<Phone />} label="Phone" value={ele.contact} />
            <InfoRow icon={<MapPin />} label="Location" value={ele.location?.address} />
          </CardContent>
        </Card>

        {/* STATS CARD */}
        <Card className="shadow-md border-none">
          <CardHeader>
            <CardTitle>Statistics</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-4 text-center">
            <StatBox label="Total Bookings" value={ele.totalBookings || 0} />
            <StatBox label="Completed" value={ele.completed || 0} />
            <StatBox label="Pending" value={ele.pending || 0} />
          </CardContent>
        </Card>

        {/* SERVICES */}
        <Card className="shadow-md border-none">
          <CardHeader>
            <CardTitle>Services Offered</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {Array.isArray(ele.servicesOffered) && ele.servicesOffered.length ? (
              ele.servicesOffered.map((svc) => (
                <div key={svc._id ?? svc.petType} className="border rounded-lg p-4 bg-white">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <PawPrint className="h-5 w-5 text-slate-600" />
                      <h4 className="text-lg font-semibold">{svc.petType}</h4>
                    </div>
                    <Badge variant="secondary" className="text-sm">
                      {Array.isArray(svc.subServices) ? svc.subServices.length : 0} item
                      {Array.isArray(svc.subServices) && svc.subServices.length !== 1 ? "s" : ""}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Array.isArray(svc.subServices) && svc.subServices.length ? (
                      svc.subServices.map((sub) => (
                        <div key={sub._id ?? `${svc._id}-${sub.service}`} className="p-3 rounded-lg border bg-gray-50 hover:shadow-sm">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-medium">{sub.service}</p>
                              <p className="text-sm text-gray-600 mt-1">{sub.description || "No description"}</p>
                            </div>

                            <div className="text-right">
                              <p className="font-semibold">
                                {typeof sub.price === "number"
                                  ? sub.price.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })
                                  : sub.price ?? "—"}
                              </p>
                              <p className="text-xs text-gray-500">approx.</p>
                            </div>
                          </div>

                          <div className="mt-3 flex items-center gap-2">
                            <Button size="sm" variant="ghost" onClick={() => alert(`Book ${sub.service}`)}>Book</Button>
                            <Button size="sm" variant="outline" onClick={() => alert(`More about ${sub.service}`)}>Details</Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500">No sub-services for this pet type</p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No services added</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/* helpers */
function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3">
      <div className="text-gray-700">{icon}</div>
      <div>
        <p className="font-medium">{label}</p>
        <p className="text-gray-600">{value || "Not provided"}</p>
      </div>
    </div>
  );
}

function StatBox({ label, value }) {
  return (
    <div className="p-4 bg-gray-50 rounded-xl shadow-sm">
      <p className="text-xl font-semibold">{value}</p>
      <p className="text-gray-500 text-sm">{label}</p>
    </div>
  );
}
