import { useContext, useEffect, useMemo } from "react";
import UserContext from "../../context/User-Context";
import { useSelector, useDispatch } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin, PawPrint, Edit } from "lucide-react";
import { fetchProvider, fetchSingleProvider } from "../../slices/admin-slice";
import { updateProvider, deleteAccount } from "../../slices/Provider-slice";
import { toast } from "react-toastify";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog";

import {
  setOpenLogo,
  setOpenPersonal,
  setOpenServices,
  setDeleteOpen,
  setBusinessName,
  setContact,
  setPriceRange,
  setLogoFile,
  setLogoPreview,
  clearLogo,
  setServicesCopy,
  addPetType,
  removePetType,
  setPetTypeField,
  addSubService,
  removeSubService,
  setSubField,
  populateFromProvider,
} from "../../slices/Provider-slice";

export default function ProvidersPrfl() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  // select admin slice (providers)
  const {
    providers = [],
    selectedProvider = null,
    loading = false,
  } = useSelector((state) => state.admin || {});

  const ui = useSelector((state) => state.providerUi || {});
  const {
    openLogo,
    openPersonal,
    openServices,
    deleteOpen,
    businessName,
    contact,
    priceRange,
    logoFile,
    logoPreview,
    servicesCopy,
  } = ui;

  const { user, handleLogout } = useContext(UserContext);

  // fetch providers or single provider
  useEffect(() => {
    if (id) {
      dispatch(fetchSingleProvider(id));
      return;
    }
    dispatch(fetchProvider());
  }, [dispatch, id]);

  // when selectedProvider or providers change, populate UI with provider values
  useEffect(() => {
    const prov = id ? selectedProvider : null;
    const fallback = providers?.find((p) => String(p._id) === String(id));
    const toUse = prov ?? fallback ?? selectedProvider ?? null;
    if (toUse) {
      dispatch(populateFromProvider(toUse));
    }
  }, [dispatch, id, selectedProvider, providers]);

  const confirmDelete = () => {
    if (!ele) {
      toast.error("No provider selected");
      dispatch(setDeleteOpen(false));
      return;
    }

    dispatch(deleteAccount(ele._id))
      .then(() => {
        toast.success("Account deleted successfully");
        handleLogout?.();
        localStorage.removeItem("token");
        navigate("/", { replace: true });
      })
      .catch(() => toast.error("Failed to delete account"));

    dispatch(setDeleteOpen(false));
  };

  // determine current provider to show
  const ele = useMemo(() => {
    if (id) {
      if (selectedProvider?._id === id) return selectedProvider;
      return providers?.find((prov) => String(prov._id) === String(id)) ?? null;
    }

    if (user?.role === "provider" && user?._id) {
      const mine = providers?.find((prov) => {
        const provUser = prov.user?._id ?? prov.user;
        return provUser && String(provUser) === String(user._id);
      });
      if (mine) return mine;
    }

    return selectedProvider ?? null;
  }, [id, selectedProvider, providers, user]);

  // if provider owner and not approved -> navigate to pending
  useEffect(() => {
    if (!user || user.role !== "provider") return;
    if (ele) {
      const provUserId = ele.user?._id ?? ele.user;
      const isOwner = provUserId && String(provUserId) === String(user._id);

      if (isOwner && !ele.approvedByAdmin) {
        navigate("/provider/pending", { replace: true });
        return;
      }
    }
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

  const isOwner = Boolean(
    user?.role === "provider" &&
      ele?.user &&
      String(ele.user?._id ?? ele.user) === String(user?._id)
  );

  const openLogoDialog = () => {
    dispatch(setLogoPreview(ele.image || null));
    dispatch(setLogoFile(null));
    dispatch(setOpenLogo(true));
  };

  const onLogoChange = (e) => {
    const file = e.target.files?.[0] ?? null;
    dispatch(setLogoFile(file));
    if (!file) {
      dispatch(setLogoPreview(ele.image || null));
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      dispatch(setLogoPreview(ev.target.result));
    };
    reader.readAsDataURL(file);
  };

  const submitLogo = async () => {
    try {
      if (!logoFile) {
        toast.error("Please choose an image.");
        return;
      }
      const fd = new FormData();
      fd.append("image", logoFile);
      await dispatch(updateProvider({ id: ele._id, formData: fd })).unwrap();
      toast.success("Logo updated");
      dispatch(fetchProvider());
      dispatch(setOpenLogo(false));
      dispatch(clearLogo());
    } catch (err) {
      console.error("logo update failed", err);
      toast.error(err?.message || "Failed to update logo");
    }
  };

  // Personal handlers 
  const openPersonalDialog = () => {
    dispatch(setBusinessName(ele.businessName || ""));
    dispatch(setContact(ele.contact || ""));
    dispatch(setPriceRange(ele.priceRange || ""));
    dispatch(setOpenPersonal(true));
  };

  const handlePhoneChange = (value) => {
    let v = value.replace(/\s+/g, "");
    if (!v) {
      dispatch(setContact(""));
      return;
    }
    if (!v.startsWith("+91")) {
      v = v.replace(/^\+?91/, "");
      v = "+91" + v;
    }
    dispatch(setContact(v));
  };

  const submitPersonal = async () => {
    try {
      if (!businessName?.trim()) {
        toast.error("Business name required");
        return;
      }
      if (!contact?.trim()) {
        toast.error("Contact required");
        return;
      }

      const fd = new FormData();
      fd.append("businessName", businessName);
      fd.append("contact", contact);
      fd.append("priceRange", priceRange || "");

      await dispatch(updateProvider({ id: ele._id, formData: fd })).unwrap();
      toast.success("Profile updated");
      dispatch(fetchProvider());
      dispatch(setOpenPersonal(false));
    } catch (err) {
      console.error("personal update failed", err);
      toast.error(err?.message || "Failed to update profile");
    }
  };

  // Services handlers (redux-driven) 
  const openServicesDialog = () => {
    dispatch(setServicesCopy(JSON.parse(JSON.stringify(ele.servicesOffered || []))));
    dispatch(setBusinessName(ele.businessName || ""));
    dispatch(setContact(ele.contact || ""));
    dispatch(setPriceRange(ele.priceRange || ""));
    dispatch(setOpenServices(true));
  };

  const addPetTypeHandler = () => dispatch(addPetType());
  const removePetTypeHandler = (idx) => dispatch(removePetType(idx));
  const setPetTypeFieldHandler = (idx, v) => dispatch(setPetTypeField({ idx, value: v }));
  const addSubServiceHandler = (gIdx) => dispatch(addSubService(gIdx));
  const removeSubHandler = (gIdx, sIdx) => dispatch(removeSubService({ gIdx, sIdx }));
  const setSubFieldHandler = (gIdx, sIdx, field, v) =>
    dispatch(setSubField({ gIdx, sIdx, field, value: v }));

  const submitServices = async () => {
    try {
      if (!Array.isArray(servicesCopy) || servicesCopy.length === 0) {
        toast.error("Add at least one pet type.");
        return;
      }
      for (const grp of servicesCopy) {
        if (!grp.petType || !grp.petType.trim()) {
          toast.error("Each pet type must have a name.");
          return;
        }
        if (!Array.isArray(grp.subServices) || grp.subServices.length === 0) {
          toast.error("Each pet type must have at least one sub-service.");
          return;
        }
        for (const s of grp.subServices) {
          if (!s.service || !s.service.trim()) {
            toast.error("Each sub-service must have a name.");
            return;
          }
        }
      }

      const fd = new FormData();
      fd.append("businessName", (businessName && businessName.trim()) || ele.businessName || "");
      fd.append("contact", (contact && contact.trim()) || ele.contact || "");
      fd.append("priceRange", priceRange ?? ele.priceRange ?? "");

      (servicesCopy || []).forEach((group, i) => {
        fd.append(`servicesOffered[${i}][petType]`, group.petType || "");
        (group.subServices || []).forEach((sub, j) => {
          fd.append(`servicesOffered[${i}][subServices][${j}][service]`, sub.service || "");
          fd.append(`servicesOffered[${i}][subServices][${j}][description]`, sub.description || "");
          fd.append(
            `servicesOffered[${i}][subServices][${j}][price]`,
            sub.price !== undefined && sub.price !== null ? String(sub.price) : ""
          );
        });
      });

      await dispatch(updateProvider({ id: ele._id, formData: fd })).unwrap();

      toast.success("Services updated");
      dispatch(fetchProvider());
      dispatch(setOpenServices(false));
    } catch (err) {
      console.log("services update failed", err);
      toast.error(err?.message || "Failed to update services");
    }
  };

  const isContactValid = contact ? /^\+91\d{10}$/.test(contact.replace(/\s+/g, "")) : true;

  return (
    <div className="min-h-screen w-full px-4 py-10 flex justify-center">
      <div className="max-w-4xl w-full space-y-6">
        <Card className="shadow-lg border-none">
          <CardHeader className="flex flex-col items-center">
            <div
              className="h-28 w-28 rounded-full bg-gray-200 flex items-center justify-center text-4xl font-bold overflow-hidden cursor-pointer"
              onClick={isOwner ? openLogoDialog : undefined}
              title={isOwner ? "Click to update logo" : ""}
            >
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
              <div className="mt-4 flex items-center gap-3">
                <Button className="flex items-center gap-2" onClick={openPersonalDialog}>
                  <Edit className="h-4 w-4" />
                  Edit Profile
                </Button>

                <Button variant="outline" onClick={openServicesDialog}>
                  Edit Services
                </Button>
              </div>
            )}
          </CardHeader>
        </Card>

        {/* INFO CARD */}
        <Card className="shadow-md border-none">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <a href={`mailto:${ele.user?.email}`} className="block">
              <InfoRow icon={<Mail />} label="Email" value={ele.user?.email || "Not provided"} />
            </a>

            <a href={`tel:${ele.contact}`} className="block">
              <InfoRow icon={<Phone />} label="Phone" value={ele.contact || "Not provided"} />
            </a>

            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ele.location?.address)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <InfoRow icon={<MapPin />} label="Location" value={ele.location?.address || "Not available"} />
            </a>
          </CardContent>
        </Card>

        {/* SERVICES */}
        <Card className="shadow-md border-none">
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <CardTitle>Services Offered</CardTitle>
              {isOwner && (
                <Button size="sm" variant="ghost" onClick={openServicesDialog}>
                  Edit
                </Button>
              )}
            </div>
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

        {/* DELETE ACCOUNT BUTTON */}
        <div className="flex justify-center mt-10">
          <Button variant="destructive" onClick={() => dispatch(setDeleteOpen(true))} className="px-6 py-2">
            Delete Account
          </Button>
        </div>
      </div>

      {/*  Logo Dialog */}
      <Dialog open={openLogo} onOpenChange={(v) => dispatch(setOpenLogo(v))}>
        <DialogContent className="sm:max-w-sm max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Update Logo</DialogTitle>
            <DialogDescription>Upload a new business logo for your profile.</DialogDescription>
          </DialogHeader>

          <div className="mt-3 space-y-3">
            <input type="file" accept="image/*" onChange={onLogoChange} />
            {logoPreview && (
              <div className="mt-2">
                <img src={logoPreview} alt="preview" className="h-28 w-28 rounded object-cover" />
              </div>
            )}
          </div>

          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={submitLogo}>Save Logo</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/*  Personal Dialog  */}
      <Dialog open={openPersonal} onOpenChange={(v) => dispatch(setOpenPersonal(v))}>
        <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto transform-gpu motion-safe:animate-fade-in">
          <DialogHeader className="pb-2">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-gradient-to-br from-orange-200 to-orange-400 flex items-center justify-center text-white text-lg font-bold shadow-md overflow-hidden">
                {displayName ? displayName[0]?.toUpperCase() : "P"}
              </div>

              <div>
                <DialogTitle className="text-lg font-semibold">Edit Profile</DialogTitle>
                <DialogDescription className="text-sm text-neutral-500">Update your business details.</DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="mt-4 grid gap-4">
            <div>
              <label className="text-xs font-medium text-neutral-600 mb-1 inline-block">Business Name</label>
              <div className="mt-1 relative">
                <input value={businessName} onChange={(e) => dispatch(setBusinessName(e.target.value))} className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm shadow-sm" placeholder="e.g. Happy Paws Clinic" />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-neutral-600 mb-1 inline-block">Contact</label>
              <div className="mt-1 relative">
                <input value={contact} onChange={(e) => handlePhoneChange(e.target.value)} className="w-full rounded-lg border border-neutral-200 px-10 py-2 text-sm shadow-sm" placeholder="+91xxxxxxxxxx" />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-neutral-600 mb-1 inline-block">Price Range</label>
              <input value={priceRange} onChange={(e) => dispatch(setPriceRange(e.target.value))} className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm shadow-sm" placeholder="e.g. ₹500 - ₹2,000" />
              <p className="mt-2 text-xs text-neutral-500">Optional — a short hint visitors see on your profile.</p>
            </div>
          </div>

          <DialogFooter className="mt-6 flex items-center justify-end gap-3">
            <DialogClose asChild>
              <Button variant="outline" className="px-4 py-2">Cancel</Button>
            </DialogClose>

            <Button onClick={submitPersonal} disabled={!isContactValid} className={`px-4 py-2 rounded-md text-white font-medium shadow-sm ${isContactValid ? "bg-gradient-to-r from-orange-500 to-orange-600" : "opacity-60 cursor-not-allowed"}`}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/*  Services Dialog  */}
      <Dialog open={openServices} onOpenChange={(v) => dispatch(setOpenServices(v))}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto transform-gpu motion-safe:animate-fade-in">
          <DialogHeader className="pb-2">
            <div className="flex items-start justify-between gap-4">
              <div>
                <DialogTitle className="text-lg font-semibold">Edit Services</DialogTitle>
                <DialogDescription className="text-sm text-neutral-500 mt-1">Add or modify pet types and sub-services. Make sure each pet type has at least one service.</DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="mt-4 space-y-4">
            <div className="flex flex-wrap gap-2">
              {servicesCopy.length === 0 ? <div className="text-sm text-neutral-500">No pet types yet</div> : servicesCopy.map((g, idx) => (<span key={idx} className="px-3 py-1 rounded-full bg-slate-50 border border-slate-100 text-sm text-slate-700 shadow-sm">{g.petType || `Pet ${idx + 1}`}</span>))}
            </div>

            <div className="space-y-3">
              {servicesCopy.map((group, gi) => (
                <div key={gi} className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition">
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <label className="text-xs text-neutral-600">Pet type</label>
                      <input value={group.petType} onChange={(e) => setPetTypeFieldHandler(gi, e.target.value)} placeholder="Dog, Cat, etc." className="mt-1 w-full rounded-md border border-neutral-200 px-3 py-2 text-sm shadow-sm" />
                    </div>

                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="ghost" onClick={() => removePetTypeHandler(gi)}>Remove</Button>
                    </div>
                  </div>

                  <div className="mt-3 space-y-2">
                    {(group.subServices || []).map((sub, si) => (
                      <div key={si} className="grid grid-cols-12 gap-2 items-start">
                        <div className="col-span-5">
                          <label className="text-xs text-neutral-600">Service</label>
                          <input value={sub.service} onChange={(e) => setSubFieldHandler(gi, si, "service", e.target.value)} placeholder="Service name (e.g. Full Groom)" className="mt-1 w-full rounded-md border border-neutral-200 px-3 py-2 text-sm shadow-sm" />
                        </div>

                        <div className="col-span-5">
                          <label className="text-xs text-neutral-600">Description</label>
                          <input value={sub.description} onChange={(e) => setSubFieldHandler(gi, si, "description", e.target.value)} placeholder="Short description (optional)" className="mt-1 w-full rounded-md border border-neutral-200 px-3 py-2 text-sm shadow-sm" />
                        </div>

                        <div className="col-span-2">
                          <label className="text-xs text-neutral-600">Price</label>
                          <div className="mt-1 flex items-center gap-2">
                            <span className="text-sm px-2 py-1 rounded-l border border-r-0 border-neutral-200 bg-neutral-50">₹</span>
                            <input value={sub.price} onChange={(e) => setSubFieldHandler(gi, si, "price", e.target.value)} placeholder="0" className="w-full rounded-r-md border border-neutral-200 px-2 py-2 text-sm" />
                          </div>
                          <div className="mt-1 text-xs text-neutral-400">approx.</div>
                        </div>

                        <div className="col-span-12 flex justify-end">
                          <Button size="sm" variant="outline" onClick={() => removeSubHandler(gi, si)}>Remove service</Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 flex justify-end">
                    <Button size="sm" onClick={() => addSubServiceHandler(gi)}>+ Add sub-service</Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <Button onClick={() => addPetTypeHandler()}>+ Add pet type</Button>
            </div>
          </div>

          <DialogFooter className="mt-4 flex items-center justify-end gap-3">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>

            <Button onClick={submitServices}>Save Services</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DELETE ACCOUNT DIALOG */}
      <Dialog open={deleteOpen} onOpenChange={(v) => dispatch(setDeleteOpen(v))}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Provider Account?</DialogTitle>
            <DialogDescription>This action cannot be undone. Your provider profile, services and bookings will be permanently deleted.</DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button variant="destructive" onClick={confirmDelete}>Yes, Delete Account</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
