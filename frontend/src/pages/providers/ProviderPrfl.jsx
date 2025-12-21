import { useContext, useEffect, useMemo, useState } from "react";
import UserContext from "../../context/User-Context";
import { useSelector, useDispatch } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin, PawPrint, Edit, Settings, Plus, Trash2, IndianRupee } from "lucide-react";
import {
  fetchProvider,
  fetchSingleProvider,
} from "../../slices/admin-slice.js";
import { updateProvider, deleteAccount } from "../../slices/Provider-slice.js";
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
} from "../../slices/Provider-slice.js";

export default function ProvidersPrfl() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  const [logoFile, setLogoFileLocal] = useState(null);

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

  // Helper to find current provider
  const getCurrentProvider = () => {
    if (id) {
      return selectedProvider?._id === id
        ? selectedProvider
        : providers?.find((p) => String(p._id) === String(id)) ?? null;
    }

    if (user?.role === "provider" && user?._id) {
      return providers?.find((p) => {
        const provUser = p.user?._id ?? p.user;
        return provUser && String(provUser) === String(user._id);
      }) ?? null;
    }
    return selectedProvider ?? null;
  };

  useEffect(() => {
    const provider = getCurrentProvider();
    if (provider) {
      dispatch(populateFromProvider(provider));
    }
  }, [dispatch, id, selectedProvider, providers, user]);

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

  // Get current provider to display
  const ele = useMemo(() => getCurrentProvider(), [id, selectedProvider, providers, user]);

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

  //  LOGO  
  const openLogoDialog = () => {
    dispatch(setLogoPreview(ele.image || null));
    setLogoFileLocal(null);
    dispatch(setOpenLogo(true));
  };

  const onLogoChange = (e) => {
    const file = e.target.files?.[0] ?? null;
    setLogoFileLocal(file);

    if (!file) {
      dispatch(setLogoPreview(ele.image || null));
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => dispatch(setLogoPreview(ev.target.result));
    reader.readAsDataURL(file);
  };

  const submitLogo = async () => {
    if (!logoFile) {
      toast.error("Please choose an image.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("image", logoFile);

      await dispatch(updateProvider({ id: ele._id, formData })).unwrap();

      toast.success("Logo updated successfully");
      dispatch(fetchProvider());
      dispatch(setOpenLogo(false));
      setLogoFileLocal(null);
      dispatch(clearLogo());
    } catch (err) {
      console.error("Logo update failed:", err);
      toast.error(err?.message || "Failed to update logo");
    }
  };

  // PERSONAL INFO 
  const openPersonalDialog = () => {
    dispatch(setBusinessName(ele.businessName || ""));
    dispatch(setContact(ele.contact || ""));
    dispatch(setPriceRange(ele.priceRange || ""));
    dispatch(setOpenPersonal(true));
  };

  const handlePhoneChange = (value) => {
    const digits = value.replace(/\D/g, "");
    const truncated = digits.slice(0, 10);
    dispatch(setContact(`+91${truncated}`));
  };

  const submitPersonal = async () => {
    if (!businessName?.trim()) {
      toast.error("Business name is required");
      return;
    }
    if (!contact?.trim()) {
      toast.error("Contact is required");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("businessName", businessName);
      formData.append("contact", contact);
      formData.append("priceRange", priceRange || "");

      await dispatch(updateProvider({ id: ele._id, formData })).unwrap();

      toast.success("Profile updated successfully");
      dispatch(fetchProvider());
      dispatch(setOpenPersonal(false));
    } catch (err) {
      console.error("Personal info update failed:", err);
      toast.error(err?.message || "Failed to update profile");
    }
  };

  //  SERVICES HANDLERS
  const openServicesDialog = () => {
    dispatch(setServicesCopy(JSON.parse(JSON.stringify(ele.servicesOffered || []))));
    dispatch(setOpenServices(true));
  };

  const addPetTypeHandler = () => dispatch(addPetType());
  const removePetTypeHandler = (idx) => dispatch(removePetType(idx));
  const setPetTypeFieldHandler = (idx, value) => dispatch(setPetTypeField({ idx, value }));
  const addSubServiceHandler = (gIdx) => dispatch(addSubService(gIdx));
  const removeSubHandler = (gIdx, sIdx) => dispatch(removeSubService({ gIdx, sIdx }));
  const setSubFieldHandler = (gIdx, sIdx, field, value) =>
    dispatch(setSubField({ gIdx, sIdx, field, value }));

  const validateServices = () => {
    if (!Array.isArray(servicesCopy) || servicesCopy.length === 0) {
      toast.error("Add at least one pet type");
      return false;
    }

    for (const group of servicesCopy) {
      if (!group.petType?.trim()) {
        toast.error("Each pet type must have a name");
        return false;
      }

      if (!Array.isArray(group.subServices) || group.subServices.length === 0) {
        toast.error("Each pet type must have at least one sub-service");
        return false;
      }

      for (const service of group.subServices) {
        if (!service.service?.trim()) {
          toast.error("Each sub-service must have a name");
          return false;
        }
      }
    }

    return true;
  };

  const submitServices = async () => {
    if (!validateServices()) return;

    try {
      const formData = new FormData();

      // Only append services data - no business info here
      servicesCopy.forEach((group, i) => {
        formData.append(`servicesOffered[${i}][petType]`, group.petType || "");

        (group.subServices || []).forEach((sub, j) => {
          formData.append(
            `servicesOffered[${i}][subServices][${j}][service]`,
            sub.service || ""
          );
          formData.append(
            `servicesOffered[${i}][subServices][${j}][description]`,
            sub.description || ""
          );
          formData.append(
            `servicesOffered[${i}][subServices][${j}][price]`,
            sub.price !== undefined && sub.price !== null ? String(sub.price) : ""
          );
        });
      });

      await dispatch(updateProvider({ id: ele._id, formData })).unwrap();

      toast.success("Services updated successfully");
      dispatch(fetchProvider());
      dispatch(setOpenServices(false));
    } catch (err) {
      console.error("Services update failed:", err);
      toast.error(err?.message || "Failed to update services");
    }
  };

  const isContactValid = contact
    ? /^\+91\d{10}$/.test(contact.replace(/\s+/g, ""))
    : true;

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
                <img
                  src={ele.image}
                  alt={displayName}
                  className="h-full w-full object-cover"
                />
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
                <Button
                  className="flex items-center gap-2"
                  onClick={openPersonalDialog}
                >
                  <Edit className="h-4 w-4" />
                  Edit Profile
                </Button>

                <Button variant="outline" onClick={openServicesDialog}>
                  Manage Services
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
              <InfoRow
                icon={<Mail />}
                label="Email"
                value={ele.user?.email || "Not provided"}
              />
            </a>

            <a href={`tel:${ele.contact}`} className="block">
              <InfoRow
                icon={<Phone />}
                label="Phone"
                value={ele.contact || "Not provided"}
              />
            </a>

            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                ele.location?.address
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <InfoRow
                icon={<MapPin />}
                label="Location"
                value={ele.location?.address || "Not available"}
              />
            </a>
          </CardContent>
        </Card>

        {/* SERVICES */}
        <Card className="shadow-md border-none">
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <CardTitle>Services Offered</CardTitle>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {Array.isArray(ele.servicesOffered) &&
              ele.servicesOffered.length ? (
              ele.servicesOffered.map((svc) => (
                <div
                  key={svc._id ?? svc.petType}
                  className="border rounded-lg p-4 bg-white"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <PawPrint className="h-5 w-5 text-slate-600" />
                      <h4 className="text-lg font-semibold">{svc.petType}</h4>
                    </div>
                    <Badge variant="secondary" className="text-sm">
                      {Array.isArray(svc.subServices)
                        ? svc.subServices.length
                        : 0}{" "}
                      item
                      {Array.isArray(svc.subServices) &&
                        svc.subServices.length !== 1
                        ? "s"
                        : ""}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Array.isArray(svc.subServices) &&
                      svc.subServices.length ? (
                      svc.subServices.map((sub) => (
                        <div
                          key={sub._id ?? `${svc._id}-${sub.service}`}
                          className="p-3 rounded-lg border bg-gray-50 hover:shadow-sm"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-medium">{sub.service}</p>
                              <p className="text-sm text-gray-600 mt-1">
                                {sub.description || "No description"}
                              </p>
                            </div>

                            <div className="text-right">
                              <p className="font-semibold">
                                {typeof sub.price === "number"
                                  ? sub.price.toLocaleString("en-IN", {
                                    style: "currency",
                                    currency: "INR",
                                    maximumFractionDigits: 0,
                                  })
                                  : sub.price ?? "—"}
                              </p>
                              <p className="text-xs text-gray-500">approx.</p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500">
                        No sub-services for this pet type
                      </p>
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
          <Button
            variant="destructive"
            onClick={() => dispatch(setDeleteOpen(true))}
            className="px-6 py-2"
          >
            Delete Account
          </Button>
        </div>
      </div>

      {/*  Logo Dialog */}
      <Dialog open={openLogo} onOpenChange={(v) => dispatch(setOpenLogo(v))}>
        <DialogContent className="sm:max-w-sm max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Update Logo</DialogTitle>
            <DialogDescription>
              Upload a new business logo for your profile.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-3 space-y-3">
            <input type="file" accept="image/*" onChange={onLogoChange} />
            {logoPreview && (
              <div className="mt-2">
                <img
                  src={logoPreview}
                  alt="preview"
                  className="h-28 w-28 rounded object-cover"
                />
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
      <Dialog
        open={openPersonal}
        onOpenChange={(v) => dispatch(setOpenPersonal(v))}
      >
        <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto transform-gpu motion-safe:animate-fade-in">
          <DialogHeader className="pb-2">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-gradient-to-br from-orange-200 to-orange-400 flex items-center justify-center text-white text-lg font-bold shadow-md overflow-hidden">
                {displayName ? displayName[0]?.toUpperCase() : "P"}
              </div>

              <div>
                <DialogTitle className="text-lg font-semibold">
                  Edit Profile
                </DialogTitle>
                <DialogDescription className="text-sm text-neutral-500">
                  Update your business details.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="mt-4 grid gap-4">
            <div>
              <label className="text-xs font-medium text-neutral-600 mb-1 inline-block">
                Business Name
              </label>
              <div className="mt-1 relative">
                <input
                  value={businessName}
                  onChange={(e) => dispatch(setBusinessName(e.target.value))}
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm shadow-sm"
                  placeholder="e.g. Happy Paws Clinic"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-neutral-600 mb-1 inline-block">
                Contact
              </label>
              <div className="mt-1 relative flex items-center">
                <span className="absolute left-3 text-sm text-gray-500 font-medium">+91</span>
                <input
                  value={contact.startsWith("+91") ? contact.slice(3) : contact}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  className="w-full rounded-lg border border-neutral-200 pl-10 pr-3 py-2 text-sm shadow-sm"
                  placeholder="xxxxxxxxxx"
                  maxLength={10}
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-neutral-600 mb-1 inline-block">
                Price Range
              </label>
              <input
                value={priceRange}
                onChange={(e) => dispatch(setPriceRange(e.target.value))}
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm shadow-sm"
                placeholder="e.g. ₹500 - ₹2,000"
              />
            </div>
          </div>

          <DialogFooter className="mt-6 flex items-center justify-end gap-3">
            <DialogClose asChild>
              <Button variant="outline" className="px-4 py-2">
                Cancel
              </Button>
            </DialogClose>

            <Button
              onClick={submitPersonal}
              disabled={!isContactValid}
              className={`px-4 py-2 rounded-md text-white font-medium shadow-sm ${isContactValid
                ? "bg-gradient-to-r from-orange-500 to-orange-600"
                : "opacity-60 cursor-not-allowed"
                }`}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/*  Services Dialog  */}
      <Dialog open={openServices} onOpenChange={(v) => dispatch(setOpenServices(v))}>
        <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto bg-[#FFF9F2] p-0 rounded-2xl shadow-xl">

          {/* HEADER */}
          <DialogHeader className="px-6 py-4 border-b bg-[#FFF3E6] rounded-t-2xl">
            <DialogTitle className="text-xl font-semibold text-slate-800 flex items-center gap-2">
              <Settings className="h-5 w-5 text-orange-500" />
              Manage Services
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-600 mt-1">
              Customize the services you offer to pet owners.
            </DialogDescription>
          </DialogHeader>

          {/* CONTENT */}
          <div className="px-6 py-4 space-y-5">

            {/* ACTIVE PET TYPES */}
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-sm font-medium text-slate-700">
                Active Pet Types:
              </span>

              {servicesCopy.map((g, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white border border-orange-200 text-sm text-orange-700 shadow-sm"
                >
                  <PawPrint className="h-3.5 w-3.5" />
                  {g.petType || `Pet ${i + 1}`}
                </span>
              ))}
            </div>

            {/* PET TYPE CARDS */}
            {servicesCopy.map((group, gi) => (
              <div
                key={gi}
                className="rounded-2xl bg-white border shadow-sm overflow-hidden"
              >
                {/* PET TYPE HEADER */}
                <div className="flex items-center justify-between px-5 py-4 bg-slate-50 border-b">
                  <div className="flex items-center gap-2">
                    <PawPrint className="h-5 w-5 text-orange-500" />
                    <h3 className="text-lg font-semibold text-slate-800">
                      {group.petType}
                    </h3>
                  </div>

                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-red-500 hover:bg-red-50"
                    onClick={() => removePetTypeHandler(gi)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {/* SUB SERVICES */}
                <div className="p-5 space-y-4">
                  {(group.subServices || []).map((sub, si) => (
                    <div
                      key={si}
                      className="flex items-center gap-3 bg-slate-50 rounded-xl p-4 border"
                    >
                      <input
                        value={sub.service}
                        onChange={(e) =>
                          setSubFieldHandler(gi, si, "service", e.target.value)
                        }
                        className="flex-1 rounded-lg border px-3 py-2 text-sm"
                        placeholder="Service name"
                      />

                      <input
                        value={sub.description}
                        onChange={(e) =>
                          setSubFieldHandler(gi, si, "description", e.target.value)
                        }
                        className="flex-[2] rounded-lg border px-3 py-2 text-sm"
                        placeholder="Description"
                      />

                      <div className="flex items-center border rounded-lg overflow-hidden bg-white">
                        <span className="px-2 text-slate-500 ">
                          <IndianRupee className="h-4 w-4" />
                        </span>
                        <input
                          value={sub.price}
                          onChange={(e) =>
                            setSubFieldHandler(gi, si, "price", e.target.value)
                          }
                          className="w-20 px-2 py-2 text-sm outline-none"
                          placeholder="0"
                        />
                      </div>

                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-red-500 hover:bg-red-50"
                        onClick={() => removeSubHandler(gi, si)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}

                  <Button
                    size="sm"
                    variant="outline"
                    className="flex items-center gap-2"
                    onClick={() => addSubServiceHandler(gi)}
                  >
                    <Plus className="h-4 w-4" />
                    Add sub-service
                  </Button>
                </div>
              </div>
            ))}

            <Button
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
              onClick={addPetTypeHandler}
            >
              <Plus className="h-4 w-4" />
              Add pet type
            </Button>
          </div>

          {/* FOOTER */}
          <DialogFooter className="sticky bottom-0 bg-white px-6 py-4 border-t flex justify-end gap-3 rounded-b-2xl">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>

            <Button
              className="bg-black hover:bg-gray-900 text-white px-6"
              onClick={submitServices}
            >
              Save All Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      {/* DELETE ACCOUNT DIALOG */}
      <Dialog
        open={deleteOpen}
        onOpenChange={(v) => dispatch(setDeleteOpen(v))}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Provider Account?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. Your provider profile, services and
              bookings will be permanently deleted.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button variant="destructive" onClick={confirmDelete}>
              Yes, Delete Account
            </Button>
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
