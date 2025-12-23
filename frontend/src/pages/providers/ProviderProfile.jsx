import { useSelector, useDispatch } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useMemo } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  ArrowLeft,
  Mail,
  MapPin,
  Phone,
  IndianRupee,
  Check,
  Eye,
  Loader2,
} from "lucide-react";

import { fetchProvider, approveProvider } from "../../slices/admin-slice.js";

export default function ProviderProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { selectedProvider, providers, approving, loading } = useSelector(
    (state) => state.admin
  );

  useEffect(() => {
    // fetch providers list (keeps selectedProvider up-to-date)
    dispatch(fetchProvider());
  }, [dispatch]);

  // find provider either from selectedProvider or providers list
  const ele = useMemo(() => {
    if (!id) return selectedProvider ?? null;
    if (selectedProvider?._id === id) return selectedProvider;
    return providers?.find((prov) => prov._id === id) ?? null;
  }, [id, selectedProvider, providers]);

  const offerings = ele?.servicesOffered ?? [];
  const rating = ele?.rating ?? 0;
  const totalReviews = ele?.totalReviews ?? 0;

  const busy = approving === ele?._id;

  const handleApprove = async (id) => {
    dispatch(approveProvider(id));
    // re-fetch to refresh status
    dispatch(fetchProvider());
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin h-6 w-6 text-slate-500" />
          <p className="text-sm text-slate-600">Loading provider...</p>
        </div>
      </div>
    );
  }

  if (!ele) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4">
        <p className="text-sm text-slate-600">Provider not found.</p>
        <Button variant="outline" className="mt-3" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>
    );
  }

  return (
    // center everything vertically & horizontally and limit width so content looks centered on large screens
    <div className="min-h-screen flex items-center justify-center  py-10 px-4">
      <div className="w-full max-w-6xl">
        {/* Top controls */}
        <div className="w-[53%] flex items-center justify-between mb-6">
          <Button variant="ghost" size="sm" className="text-xs" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to list
          </Button>
          <div className="text-sm text-slate-500">
            <div className="text-bold text-center w-full flex justify-center text-slate-600 font-bold">Provider Details</div>
            </div>
        </div>

        {/* Main grid: left profile | center details | right actions */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* LEFT: profile card (col-span 3 on md) */}
          <div className="md:col-span-3 col-span-1">
            <Card className="rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between h-full">
              <CardHeader className="flex flex-col items-center gap-3 pt-6 pb-4">
                <img
                  src={ele.image || "/assets/placeholder-avatar.png"}
                  alt={ele.businessName}
                  className="h-28 w-28 rounded-full object-cover border border-slate-200 shadow-sm"
                />

                <div className="text-center space-y-1">
                  <CardTitle className="text-base font-semibold">{ele.businessName}</CardTitle>
                  <p className="text-xs text-slate-500 capitalize">{ele.serviceType || "Provider"}</p>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="font-semibold text-emerald-600">{Number(rating).toFixed(1)}</span>
                  <span className="text-amber-400">★</span>
                  <span className="text-slate-500">({totalReviews})</span>
                </div>

                <p className="text-[12px] text-slate-500 text-center px-4">{ele.shortDescription ?? ele.description}</p>
              </CardHeader>

              <CardContent className="border-t border-slate-100 pt-4 space-y-3 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-slate-400" />
                  <button className="truncate text-left">{ele.user?.email ?? "-"}</button>
                </div>

                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-slate-400" />
                  <button className="text-left">{ele.contact ?? "-"}</button>
                </div>

                <div className="flex items-start gap-2">
                  <MapPin className="h-3.5 w-3.5 text-slate-400 mt-1" />
                  <div className="text-left">{ele.location?.address ?? "Address not provided"}</div>
                </div>

                <div className="flex items-center gap-2">
                  <IndianRupee className="h-3.5 w-3.5 text-slate-400" />
                  <span>{ele.priceRange ?? "-"}</span>
                </div>

                <div className="pt-2">
                  <Badge variant="outline" className="text-[11px] border-slate-200 bg-slate-50 text-slate-700">
                    Member since {new Date(ele.createdAt || Date.now()).toLocaleDateString()}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* CENTER: main details & services (col-span 6 on md) */}
          <div className="md:col-span-6 col-span-1">
            <div className="space-y-4">
              <Card className="rounded-2xl border border-slate-200 shadow-sm">
                <CardContent className="pt-5 pb-4 px-5 space-y-3">
                  <h2 className="text-sm font-semibold text-slate-900">About this provider</h2>
                  <p className="text-sm leading-relaxed text-slate-700">{ele.description || "This provider offers quality pet care services for your furry friends."}</p>

                  <div className="flex flex-wrap gap-2 pt-2">
                    {ele.availability && (
                      <Badge variant="outline" className="text-[11px] border-emerald-100 bg-emerald-50 text-emerald-700">Available</Badge>
                    )}

                    {!ele.approvedByAdmin && (
                      <Badge variant="outline" className="text-[11px] border-amber-100 bg-amber-50 text-amber-700">Pending admin approval</Badge>
                    )}

                    {ele.approvedByAdmin && (
                      <Badge variant="outline" className="text-[11px] border-sky-100 bg-sky-50 text-sky-700">Verified</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border border-slate-200 shadow-sm">
                <CardHeader className="pb-2 px-5 pt-4">
                  <CardTitle className="text-sm font-semibold text-slate-900">Services Offered</CardTitle>
                </CardHeader>

                <CardContent className="px-5 pb-4">
                  {offerings.length === 0 ? (
                    <p className="text-xs text-slate-500">No services added yet.</p>
                  ) : (
                    <div className="space-y-4">
                      {offerings.map((service, idx) => (
                        <div key={idx} className="space-y-3">
                          <Badge variant="outline" className="text-[11px] border-slate-200 bg-slate-50 text-slate-700">{service.petType}</Badge>

                          <div className="space-y-2 mt-2">
                            {service.subServices?.map((sub, i) => (
                              <div key={i} className="flex items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-3">
                                <div>
                                  <p className="text-sm font-medium text-slate-800">{sub.service}</p>
                                  {sub.description && <p className="text-[12px] text-slate-500">{sub.description}</p>}
                                </div>
                                {sub.price && <p className="text-sm font-semibold text-emerald-600">₹{sub.price}</p>}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* RIGHT: action card (col-span 3 on md) */}
          <div className="md:col-span-3 col-span-1">
            <Card className="rounded-2xl border border-slate-200 shadow-sm sticky top-6">
              <CardHeader className="px-4 pt-4 pb-2">
                <h3 className="text-sm font-semibold text-slate-900">Actions</h3>
              </CardHeader>

              <CardContent className="px-4 pb-4 space-y-3">
                {/* Approve */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="default"
                      size="sm"
                      className="w-full flex items-center justify-center gap-2 text-xs"
                      disabled={busy || ele.approvedByAdmin}
                    >
                      {busy ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Working...
                        </>
                      ) : ele.approvedByAdmin ? (
                        <>
                          <Check className="h-4 w-4" />
                          Approved
                        </>
                      ) : (
                        <>
                          <Check className="h-4 w-4" />
                          Approve
                        </>
                      )}
                    </Button>
                  </DialogTrigger>

                  <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                      <DialogTitle>Approve Provider?</DialogTitle>
                      <DialogDescription>
                        Approving <b>{ele.businessName}</b> will make this provider visible to customers.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="pt-4 flex justify-end gap-2">
                      <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                      </DialogClose>
                      <Button variant="default" onClick={() => handleApprove(ele._id)}>
                        Confirm
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <div className="mt-3 text-[12px] text-slate-500 border-t border-slate-100 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px]">Provider ID</span>
                    <span className="text-[11px] break-all">{ele._id}</span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[11px]">Status</span>
                    <span className="text-[11px] capitalize">{ele.approvedByAdmin ? "Approved" : "Pending"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
