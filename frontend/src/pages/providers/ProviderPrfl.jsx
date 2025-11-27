import { useContext, useEffect, useMemo, useState } from "react";
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

export default function ProvidersPrfl() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  // ---- local UI state for dialogs & form fields ----
  const [openLogo, setOpenLogo] = useState(false);
  const [openPersonal, setOpenPersonal] = useState(false);
  const [openServices, setOpenServices] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // personal fields
  const [businessName, setBusinessName] = useState("");
  const [contact, setContact] = useState("");
  const [priceRange, setPriceRange] = useState("");

  // logo
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  // services (editable copy)
  const [servicesCopy, setServicesCopy] = useState([]);

  // select admin slice (providers)
  const {
    providers = [],
    selectedProvider = null,
    loading = false,
  } = useSelector((state) => state.admin || {});

  const { user, handleLogout } = useContext(UserContext);

  // fetch providers or single provider
  useEffect(() => {
    if (id) {
      dispatch(fetchSingleProvider(id));
      return;
    }
    dispatch(fetchProvider());
  }, [dispatch, id]);

  const confirmDelete = () => {
    dispatch(deleteAccount(ele._id))
      .then(() => {
        toast.success("Account deleted successfully");
        handleLogout();
        localStorage.removeItem("token");
        navigate("/", { replace: true });
      })
      .catch(() => toast.error("Failed to delete account"));

    setDeleteOpen(false);
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

  /* ---------------- Logo handlers ---------------- */
  const openLogoDialog = () => {
    // set preview from current image if exists
    setLogoPreview(ele.image || null);
    setLogoFile(null);
    setOpenLogo(true);
  };

  const onLogoChange = (e) => {
    const file = e.target.files?.[0] ?? null;
    setLogoFile(file);
    if (!file) {
      setLogoPreview(ele.image || null);
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => setLogoPreview(ev.target.result);
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
      // call update provider: adjust updateProvider thunk to accept { id, formData } as you're already doing
      await dispatch(updateProvider({ id: ele._id, formData: fd })).unwrap();
      toast.success("Logo updated");
      // refresh list
      dispatch(fetchProvider());
      setOpenLogo(false);
    } catch (err) {
      console.error("logo update failed", err);
      toast.error(err?.message || "Failed to update logo");
    }
  };

  /* ---------------- Personal handlers ---------------- */
  const openPersonalDialog = () => {
    setBusinessName(ele.businessName || "");
    setContact(ele.contact || "");
    setPriceRange(ele.priceRange || "");
    setOpenPersonal(true);
  };

  // ensure phone starts with +91 and keep digits/spaces trimmed sensibly
  const handlePhoneChange = (value) => {
    // remove all spaces first
    let v = value.replace(/\s+/g, "");
    // if user deletes to empty, allow empty
    if (!v) {
      setContact("");
      return;
    }
    // ensure starts with +91
    if (!v.startsWith("+91")) {
      // remove any leading + or leading 91
      v = v.replace(/^\+?91/, "");
      v = "+91" + v;
    }
    setContact(v);
  };

  const submitPersonal = async () => {
    try {
      // basic client validation
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
      setOpenPersonal(false);
    } catch (err) {
      console.error("personal update failed", err);
      toast.error(err?.message || "Failed to update profile");
    }
  };

  /* ---------------- Services handlers ---------------- */
  const openServicesDialog = () => {
    // deep copy the services so user can edit without mutating source
    setServicesCopy(JSON.parse(JSON.stringify(ele.servicesOffered || [])));
    setOpenServices(true);
  };

  const addPetType = () => {
    setServicesCopy((prev) => [
      ...prev,
      {
        petType: "",
        subServices: [{ service: "", description: "", price: "" }],
      },
    ]);
  };

  const removePetType = (idx) => {
    setServicesCopy((prev) => prev.filter((_, i) => i !== idx));
  };

  const setPetTypeField = (idx, v) => {
    setServicesCopy((prev) => {
      const n = [...prev];
      n[idx] = { ...n[idx], petType: v };
      return n;
    });
  };

  const addSubService = (gIdx) => {
    setServicesCopy((prev) => {
      const n = [...prev];
      n[gIdx].subServices = n[gIdx].subServices || [];
      n[gIdx].subServices.push({ service: "", description: "", price: "" });
      return n;
    });
  };

  const removeSub = (gIdx, sIdx) => {
    setServicesCopy((prev) => {
      const n = [...prev];
      n[gIdx].subServices = n[gIdx].subServices.filter((_, i) => i !== sIdx);
      return n;
    });
  };

  const setSubField = (gIdx, sIdx, field, v) => {
    setServicesCopy((prev) => {
      const n = [...prev];
      n[gIdx].subServices = n[gIdx].subServices || [];
      n[gIdx].subServices[sIdx] = {
        ...n[gIdx].subServices[sIdx],
        [field]: v,
      };
      return n;
    });
  };

  const submitServices = async () => {
    try {
      // basic validation
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

      // Build nested FormData same as createProvider did
      const fd = new FormData();

      (servicesCopy || []).forEach((group, i) => {
        // petType
        fd.append(`servicesOffered[${i}][petType]`, group.petType || "");

        // ensure subServices array exists
        (group.subServices || []).forEach((sub, j) => {
          fd.append(
            `servicesOffered[${i}][subServices][${j}][service]`,
            sub.service || ""
          );
          fd.append(
            `servicesOffered[${i}][subServices][${j}][description]`,
            sub.description || ""
          );
          // convert price to string (empty allowed)
          fd.append(
            `servicesOffered[${i}][subServices][${j}][price]`,
            sub.price !== undefined && sub.price !== null
              ? String(sub.price)
              : ""
          );
        });
      });

      // call updateProvider thunk (keep same signature)
      await dispatch(updateProvider({ id: ele._id, formData: fd })).unwrap();

      toast.success("Services updated");
      dispatch(fetchProvider());
      setOpenServices(false);
    } catch (err) {
      console.error("services update failed", err);
      toast.error(err?.message || "Failed to update services");
    }
  };

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
            {/* Email */}
            <a href={`mailto:${ele.user?.email}`} className="block">
              <InfoRow
                icon={<Mail />}
                label="Email"
                value={ele.user?.email || "Not provided"}
              />
            </a>

            {/* Phone */}
            <a href={`tel:${ele.contact}`} className="block">
              <InfoRow
                icon={<Phone />}
                label="Phone"
                value={ele.contact || "Not provided"}
              />
            </a>

            {/* Location */}
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

        {/* STATS */}
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

                          <div className="mt-3 flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => alert(`Book ${sub.service}`)}
                            >
                              Book
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => alert(`More about ${sub.service}`)}
                            >
                              Details
                            </Button>
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
            onClick={() => setDeleteOpen(true)}
            className="px-6 py-2"
          >
            Delete Account
          </Button>
        </div>
      </div>

      {/* ========== Logo Dialog ========== */}
      <Dialog open={openLogo} onOpenChange={setOpenLogo}>
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

      {/* ========== Personal Details Dialog ========== */}
      <Dialog open={openPersonal} onOpenChange={setOpenPersonal}>
        <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Update your business details (phone auto +91).
            </DialogDescription>
          </DialogHeader>

          <div className="mt-2 space-y-3">
            <div>
              <label className="text-sm">Business Name</label>
              <input
                className="border p-2 rounded w-full mt-1"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm">Contact</label>
              <input
                className="border p-2 rounded w-full mt-1"
                value={contact}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="+91xxxxxxxxxx"
              />
            </div>

            <div>
              <label className="text-sm">Price Range</label>
              <input
                className="border p-2 rounded w-full mt-1"
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={submitPersonal}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========== Services Dialog ========== */}
      <Dialog open={openServices} onOpenChange={setOpenServices}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Services Offered</DialogTitle>
            <DialogDescription>
              Add / modify pet types and sub-services.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-3 space-y-3">
            {servicesCopy.map((group, gi) => (
              <div key={gi} className="border rounded p-3 bg-gray-50">
                <div className="flex items-center gap-2">
                  <input
                    value={group.petType}
                    onChange={(e) => setPetTypeField(gi, e.target.value)}
                    placeholder="Pet type (Dog, Cat...)"
                    className="flex-1 border p-2 rounded"
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removePetType(gi)}
                  >
                    Remove
                  </Button>
                </div>

                <div className="mt-2 space-y-2">
                  {group.subServices?.map((sub, si) => (
                    <div
                      key={si}
                      className="grid grid-cols-3 gap-2 items-start"
                    >
                      <input
                        value={sub.service}
                        onChange={(e) =>
                          setSubField(gi, si, "service", e.target.value)
                        }
                        placeholder="Service name"
                        className="border p-2 rounded"
                      />
                      <input
                        value={sub.description}
                        onChange={(e) =>
                          setSubField(gi, si, "description", e.target.value)
                        }
                        placeholder="Short description"
                        className="border p-2 rounded"
                      />
                      <div className="flex gap-2">
                        <input
                          value={sub.price}
                          onChange={(e) =>
                            setSubField(gi, si, "price", e.target.value)
                          }
                          placeholder="Price"
                          className="border p-2 rounded flex-1"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeSub(gi, si)}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-2 flex justify-end">
                  <Button size="sm" onClick={() => addSubService(gi)}>
                    + Add sub-service
                  </Button>
                </div>
              </div>
            ))}

            <div className="flex justify-end">
              <Button onClick={addPetType}>+ Add pet type</Button>
            </div>
          </div>

          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={submitServices}>Save Services</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ------------------- DELETE ACCOUNT DIALOG ------------------- */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
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
