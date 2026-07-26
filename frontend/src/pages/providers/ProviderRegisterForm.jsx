import { useState, useEffect, useContext } from "react";
import { useFormik } from "formik";
import { useDispatch, useSelector } from "react-redux";
import { createProvider } from "../../slices/Provider-slice";
import { useNavigate } from "react-router-dom";
import UserContext from "../../context/User-Context";
import { toast } from "react-toastify";
import Joi from "joi";

import {
  MapPin, Plus, Trash2, PawPrint, Store, ChevronRight, Building2,
  Stethoscope, Scissors, HeartHandshake, ShieldCheck, Sparkles, Camera,
  CheckCircle2, Heart, Star, Home
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function ProviderForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { handleLogout } = useContext(UserContext) || {};
  const { loading } = useSelector((s) => s.provider || {});
  const [logoPreview, setLogoPreview] = useState(null);

  const providerSchema = Joi.object({
    serviceType: Joi.string().valid("boarding", "vet", "groomer").required(),
    businessName: Joi.string().trim().min(2).max(100).required(),
    description: Joi.string().allow("").max(500),
    location: Joi.object({
      latitude: Joi.number().optional().allow("", null),
      longitude: Joi.number().optional().allow("", null),
      address: Joi.string().trim().min(3).required(),
    }).required(),
    priceRange: Joi.string().trim().min(1).max(50).required(),
    contact: Joi.string().pattern(/^\+91[6-9][0-9]{9}$/).message("Invalid mobile number").required(),
    imageFile: Joi.any().optional().allow(null),
    servicesOffered: Joi.array()
      .items(
        Joi.object({
          petType: Joi.string().trim().min(1).required(),
          subServices: Joi.array()
            .items(
              Joi.object({
                service: Joi.string().trim().min(1).required(),
                description: Joi.string().allow("").max(300),
                price: Joi.alternatives().try(Joi.number().min(0), Joi.string().allow("")),
              })
            ).min(1).required(),
        })
      ).min(1).required(),
  });

  function validateWithJoi(values) {
    try {
      const { error } = providerSchema.validate(values, {
        abortEarly: false,
        allowUnknown: true,
        convert: true,
      });
      if (!error) return {};
      const errors = {};
      for (const item of error.details) {
        const dotKey = item.path.map((p) => String(p)).join(".");
        if (!errors[dotKey]) errors[dotKey] = getFriendlyError(dotKey, item.type);
      }
      return errors;
    } catch {
      return {};
    }
  }

  function getFriendlyError(path, type) {
    if (path === "businessName") return "Enter your business name.";
    if (path === "contact") return "Enter a valid Indian mobile number starting with +91.";
    if (path === "priceRange") return "Enter your price range.";
    if (path === "location.address") return "Use the location button or add your address.";
    if (path.includes(".petType")) return "Enter a pet type, like Dog or Cat.";
    if (path.includes(".subServices.") && path.endsWith(".service")) return "Enter a service name.";
    if (path.includes(".subServices.") && path.endsWith(".description") && type === "string.max") return "Keep the description under 300 characters.";
    if (path.includes(".subServices.") && path.endsWith(".price")) return "Enter a valid price or leave it empty.";
    if (path === "description") return "Keep the description under 500 characters.";
    return "Please check this field.";
  }

  const formik = useFormik({
    validateOnChange: false,
    validateOnBlur: false,
    initialValues: {
      serviceType: "boarding",
      businessName: "",
      description: "",
      location: { latitude: "", longitude: "", address: "" },
      priceRange: "",
      contact: "+91",
      imageFile: null,
      servicesOffered: [{ petType: "", subServices: [{ service: "", description: "", price: "" }] }],
    },
    validate: validateWithJoi,
    onSubmit: async (values, { setSubmitting }) => {
      setSubmitting(true);
      try {
        const fd = new FormData();
        fd.append("serviceType", values.serviceType);
        fd.append("businessName", values.businessName);
        fd.append("description", values.description || "");
        fd.append("priceRange", values.priceRange || "");
        fd.append("contact", values.contact || "");
        if (values.location.address) fd.append("location[address]", values.location.address);
        if (values.location.latitude) fd.append("location[latitude]", values.location.latitude);
        if (values.location.longitude) fd.append("location[longitude]", values.location.longitude);
        if (values.imageFile) fd.append("image", values.imageFile);

        (values.servicesOffered || []).forEach((group, i) => {
          fd.append(`servicesOffered[${i}][petType]`, group.petType || "");
          (group.subServices || []).forEach((sub, j) => {
            fd.append(`servicesOffered[${i}][subServices][${j}][service]`, sub.service || "");
            fd.append(`servicesOffered[${i}][subServices][${j}][description]`, sub.description || "");
            fd.append(`servicesOffered[${i}][subServices][${j}][price]`, sub.price);
          });
        });

        const action = await dispatch(createProvider(fd));
        if (createProvider.fulfilled.match(action)) {
          toast.success("Success!");
          try {
            if (typeof handleLogout === "function") await handleLogout();
            else localStorage.removeItem("token");
          } catch {
            localStorage.removeItem("token");
          }
          navigate("/", { state: { providerSubmitted: true } });
        } else {
          toast.error(action.payload || "Failed");
        }
      } catch {
        toast.error("Error submitting form");
      } finally {
        setSubmitting(false);
      }
    },
  });

  useEffect(() => {
    if (!formik.values.imageFile) { setLogoPreview(null); return; }
    const reader = new FileReader();
    reader.onload = (e) => setLogoPreview(e.target.result);
    reader.readAsDataURL(formik.values.imageFile);
    return () => {
      try { reader.abort && reader.abort(); }
      catch (error) { console.warn("Unable to stop image preview loading", error); }
    };
  }, [formik.values.imageFile]);

  useEffect(() => {
    if (formik.isSubmitting && !formik.isValid) {
      console.log("Validation Errors:", formik.errors);
      toast.error("Please check the form for errors.");
    }
  }, [formik.isSubmitting, formik.isValid, formik.errors]);

  const addPetGroup = () => formik.setFieldValue("servicesOffered", [...formik.values.servicesOffered, { petType: "", subServices: [{ service: "", description: "", price: "" }] }]);
  const removePetGroup = (idx) => {
    const groups = [...formik.values.servicesOffered];
    if (groups.length === 1) return;
    groups.splice(idx, 1);
    formik.setFieldValue("servicesOffered", groups);
  };
  const setPetType = (idx, v) => formik.setFieldValue(`servicesOffered.${idx}.petType`, v);
  const addSubService = (gIdx) => {
    const groups = [...formik.values.servicesOffered];
    groups[gIdx].subServices.push({ service: "", description: "", price: "" });
    formik.setFieldValue("servicesOffered", groups);
  };
  const removeSubService = (gIdx, sIdx) => {
    const groups = [...formik.values.servicesOffered];
    if (groups[gIdx].subServices.length === 1) return;
    groups[gIdx].subServices.splice(sIdx, 1);
    formik.setFieldValue("servicesOffered", groups);
  };
  const setSubField = (gIdx, sIdx, f, v) => formik.setFieldValue(`servicesOffered.${gIdx}.subServices.${sIdx}.${f}`, v);
  const hasError = (path) => Boolean(formik.errors[path]);
  const errorText = (path) => formik.errors[path];
  const InlineError = ({ path }) => {
    const message = errorText(path);
    if (!message) return null;
    return <p className="mt-1.5 text-xs font-semibold text-red-600">{message}</p>;
  };

  const getAndFillLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const { latitude, longitude } = pos.coords;
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`);
        const data = await res.json();
        formik.setFieldValue("location", { latitude, longitude, address: data.display_name || `${latitude},${longitude}` });
      } catch (error) {
        console.warn("Unable to resolve current location", error);
      }
    }, () => alert("Location denied"));
  };

  const serviceOpts = [
    { value: "boarding", label: "Boarding", icon: Building2, copy: "Safe stays, daily care, trusted comfort.", tone: "border-orange-200 bg-orange-50 text-orange-700" },
    { value: "vet", label: "Veterinary", icon: Stethoscope, copy: "Healing hands for worried pet parents.", tone: "border-teal-200 bg-teal-50 text-teal-700" },
    { value: "groomer", label: "Grooming", icon: Scissors, copy: "Fresh coats, gentle care, happy faces.", tone: "border-rose-200 bg-rose-50 text-rose-700" },
  ];

  const selectedService = serviceOpts.find((opt) => opt.value === formik.values.serviceType) || serviceOpts[0];
  const SelectedIcon = selectedService.icon;

  return (
    <div className="min-h-screen bg-orange-50 px-3 py-4 text-slate-900 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto grid w-full max-w-7xl gap-5 lg:grid-cols-[minmax(330px,0.9fr)_minmax(0,1.35fr)] lg:items-start">
        <aside className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg shadow-slate-900/5 lg:sticky lg:top-6">
          <div className="relative overflow-hidden bg-[#18343a] px-5 py-7 text-white sm:px-8 sm:py-9">
            <div className="absolute bottom-0 left-0 h-28 w-full bg-[linear-gradient(0deg,rgba(244,162,97,0.34),rgba(244,162,97,0))]" />
            <div className="absolute right-4 top-5 hidden h-24 w-24 rotate-6 rounded-lg border border-white/10 bg-white/5 sm:block" />
            <div className="relative z-10">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold">
                <Store className="h-4 w-4 text-[#f4a261]" />
                Careonimal partner onboarding
              </div>
              <h1 className="max-w-md text-3xl font-black leading-tight sm:text-4xl lg:text-[2.65rem]">
                Let pet parents feel your care before they even call.
              </h1>
              <p className="mt-4 max-w-md text-sm leading-6 text-white/80 sm:text-base">
                Build a warm, trustworthy profile for families searching for a safe place, a skilled doctor, or a gentle grooming hand for their pet.
              </p>
              <div className="mt-6 flex flex-wrap gap-2 text-xs font-semibold">
                <span className="inline-flex items-center gap-1 rounded-full bg-white/12 px-3 py-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-teal-200" /> Trust-ready</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-white/12 px-3 py-1.5"><Heart className="h-3.5 w-3.5 text-rose-200" /> Pet-first</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-white/12 px-3 py-1.5"><Star className="h-3.5 w-3.5 text-amber-200" /> Easy to choose</span>
              </div>
            </div>
          </div>

          <div className="space-y-5 p-5 sm:p-7">
            <div className="rounded-lg border border-slate-100 bg-white p-4 shadow-sm">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border ${selectedService.tone}`}>
                    <SelectedIcon className="h-6 w-6" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-950">{formik.values.businessName || "Your pet care business"}</p>
                    <p className="text-xs font-medium text-slate-500">{selectedService.label} partner</p>
                  </div>
                </div>
                <div className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">Preview</div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-md bg-orange-50 px-2 py-3">
                  <Heart className="mx-auto h-4 w-4 text-orange-600" />
                  <p className="mt-1 text-[11px] font-bold text-slate-700">Kind care</p>
                </div>
                <div className="rounded-md bg-teal-50 px-2 py-3">
                  <Home className="mx-auto h-4 w-4 text-teal-700" />
                  <p className="mt-1 text-[11px] font-bold text-slate-700">Near you</p>
                </div>
                <div className="rounded-md bg-rose-50 px-2 py-3">
                  <ShieldCheck className="mx-auto h-4 w-4 text-rose-700" />
                  <p className="mt-1 text-[11px] font-bold text-slate-700">Verified</p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-600">
                {formik.values.description || "A calm, caring place where pets are seen, understood, and looked after like family."}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <div className="flex gap-3 rounded-lg border border-orange-100 bg-orange-50/70 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-orange-700 shadow-sm">
                  <HeartHandshake className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Tell the story behind your work</p>
                  <p className="mt-1 text-sm leading-5 text-slate-600">Share what makes your space, team, and care style feel dependable.</p>
                </div>
              </div>
              <div className="flex gap-3 rounded-lg border border-teal-100 bg-teal-50/70 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-teal-700 shadow-sm">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Make trust easy to understand</p>
                  <p className="mt-1 text-sm leading-5 text-slate-600">Clear services, pricing, and location help families choose with confidence.</p>
                </div>
              </div>
            </div>

            <div className={`rounded-lg border p-4 ${selectedService.tone}`}>
              <div className="flex items-center gap-2 text-sm font-bold">
                <SelectedIcon className="h-4 w-4" />
                {selectedService.label} profile
              </div>
              <p className="mt-2 text-sm leading-5 text-slate-700">{selectedService.copy}</p>
            </div>
          </div>
        </aside>

        <form onSubmit={formik.handleSubmit} className="space-y-5 pb-24 sm:pb-0">
          <Card className="overflow-hidden rounded-lg border-slate-200 bg-white shadow-lg shadow-slate-900/5">
            <CardContent className="p-0">
              <div className="border-b border-orange-100 px-4 py-5 sm:px-7">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-orange-600">Step 1</p>
                    <h2 className="mt-1 text-xl font-black text-slate-950 sm:text-2xl">Your business identity</h2>
                    <p className="mt-1 text-sm leading-5 text-slate-500">The details pet parents scan first when deciding who feels right.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6 p-4 sm:p-7">
                <div>
                  <Label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">Business Type <span className="text-red-500">*</span></Label>
                  <div className="grid gap-3 min-[520px]:grid-cols-3">
                    {serviceOpts.map((opt) => {
                      const Icon = opt.icon;
                      const isSel = formik.values.serviceType === opt.value;
                      return (
                        <button key={opt.value} type="button" onClick={() => formik.setFieldValue("serviceType", opt.value)}
                          className={`group min-h-24 rounded-lg border p-4 text-left transition-all sm:min-h-32 ${isSel ? "border-orange-500 bg-orange-50 shadow-md shadow-orange-900/10 ring-2 ring-orange-100" : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-orange-200 hover:bg-orange-50/50 hover:shadow-md"}`}>
                          <div className={`flex h-10 w-10 items-center justify-center rounded-lg border ${isSel ? selectedService.tone : "border-slate-200 bg-slate-50 text-slate-400 group-hover:bg-white"}`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <span className="mt-3 block text-sm font-bold text-slate-900">{opt.label}</span>
                          <span className="mt-1 block text-xs leading-4 text-slate-500">{opt.copy}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Business Name <span className="text-red-500">*</span></Label>
                    <Input {...formik.getFieldProps("businessName")} placeholder="Happy Paws Care Studio" className={`h-12 rounded-lg bg-white text-sm shadow-sm ${hasError("businessName") ? "border-red-500" : "border-slate-200"}`} />
                    <InlineError path="businessName" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Contact <span className="text-red-500">*</span></Label>
                    <Input
                      value={formik.values.contact}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (!val.startsWith("+91")) return;
                        formik.setFieldValue("contact", "+91" + val.slice(3).replace(/\D/g, "").slice(0, 10));
                      }}
                      placeholder="+919876543210" className={`h-12 rounded-lg bg-white text-sm shadow-sm ${hasError("contact") ? "border-red-500" : "border-slate-200"}`} />
                    <InlineError path="contact" />
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-[0.85fr_1.4fr]">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Price Range <span className="text-red-500">*</span></Label>
                    <Input {...formik.getFieldProps("priceRange")} placeholder="Rs. 500 - Rs. 2000" className={`h-12 rounded-lg bg-white text-sm shadow-sm ${hasError("priceRange") ? "border-red-500" : "border-slate-200"}`} />
                    <InlineError path="priceRange" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Address <span className="text-red-500">*</span></Label>
                    <div className="relative">
                      <Input {...formik.getFieldProps("location.address")} readOnly placeholder="Use location button to fill your address" className={`h-12 rounded-lg bg-slate-50 pr-12 text-sm shadow-sm ${hasError("location.address") ? "border-red-500" : "border-slate-200"}`} />
                      <button type="button" onClick={getAndFillLocation} className="absolute right-1.5 top-1.5 flex h-9 w-9 items-center justify-center rounded-lg bg-white text-teal-700 shadow-sm transition hover:bg-teal-50" title="Use current location">
                        <MapPin className="h-4 w-4" />
                      </button>
                    </div>
                    <InlineError path="location.address" />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_170px]">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Description</Label>
                    <Textarea {...formik.getFieldProps("description")} placeholder="Tell families how you care, what pets feel in your space, and what makes your service special." className="min-h-32 resize-none rounded-lg border-slate-200 bg-white text-sm leading-6 shadow-sm" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Logo or photo</Label>
                    <div className="relative flex min-h-32 items-center justify-center overflow-hidden rounded-lg border border-dashed border-orange-300 bg-orange-50 transition hover:border-orange-400 md:min-h-full">
                      {logoPreview ? (
                        <img src={logoPreview} className="h-full min-h-32 w-full object-cover" alt="Business preview" />
                      ) : (
                        <div className="px-4 text-center">
                          <Camera className="mx-auto h-7 w-7 text-orange-500" />
                          <p className="mt-2 text-xs font-bold text-orange-900">Add your place, team, or logo</p>
                          <p className="mt-1 text-[11px] leading-4 text-slate-500">Photos build trust fast.</p>
                        </div>
                      )}
                      <input type="file" accept="image/*" onChange={(e) => formik.setFieldValue("imageFile", e.currentTarget.files[0])} className="absolute inset-0 cursor-pointer opacity-0" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden rounded-lg border-slate-200 bg-white shadow-lg shadow-slate-900/5">
            <CardContent className="p-0">
              <div className="border-b border-slate-200 bg-white px-4 py-5 sm:px-7">
                <p className="text-xs font-bold uppercase tracking-wide text-teal-700">Step 2</p>
                <h2 className="mt-1 text-xl font-black text-slate-950 sm:text-2xl">Services pets can come home happy from</h2>
                <p className="mt-1 text-sm leading-5 text-slate-600">Group services by pet type so families quickly see what fits their companion.</p>
              </div>

              <div className="space-y-4 p-4 sm:p-7">
                {formik.values.servicesOffered.map((group, gi) => (
                  <div key={gi} className="rounded-lg border border-slate-200 bg-slate-50 p-3 shadow-sm sm:p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-700 shadow-sm">
                        <PawPrint className="h-4 w-4" />
                      </div>
                      <Input placeholder="Pet type, e.g. Dog, Cat, Rabbit" value={group.petType} onChange={(e) => setPetType(gi, e.target.value)}
                        className={`h-11 rounded-lg bg-white text-sm shadow-sm ${hasError(`servicesOffered.${gi}.petType`) ? "border-red-500" : "border-slate-200"}`} />
                      {formik.values.servicesOffered.length > 1 && (
                        <button type="button" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-slate-400 shadow-sm hover:bg-red-50 hover:text-red-500" onClick={() => removePetGroup(gi)} title="Remove pet type">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <InlineError path={`servicesOffered.${gi}.petType`} />

                    <div className="hidden grid-cols-[1fr_1.25fr_100px_40px] gap-2 px-1 pb-2 text-[11px] font-bold uppercase tracking-wide text-slate-400 sm:grid">
                      <span>Service</span>
                      <span>Description</span>
                      <span>Price</span>
                      <span />
                    </div>

                    <div className="space-y-3">
                      {group.subServices.map((sub, si) => (
                        <div key={si} className="grid gap-2 rounded-lg border border-slate-100 bg-white p-3 shadow-sm sm:grid-cols-[1fr_1.25fr_100px_40px]">
                          <div>
                            <Input placeholder="Service" value={sub.service} onChange={(e) => setSubField(gi, si, "service", e.target.value)}
                              className={`h-11 rounded-lg text-sm ${hasError(`servicesOffered.${gi}.subServices.${si}.service`) ? "border-red-500" : "border-slate-200"}`} />
                            <InlineError path={`servicesOffered.${gi}.subServices.${si}.service`} />
                          </div>
                          <div>
                            <Input placeholder="Short note, optional" value={sub.description} onChange={(e) => setSubField(gi, si, "description", e.target.value)}
                              className={`h-11 rounded-lg text-sm ${hasError(`servicesOffered.${gi}.subServices.${si}.description`) ? "border-red-500" : "border-slate-200"}`} />
                            <InlineError path={`servicesOffered.${gi}.subServices.${si}.description`} />
                          </div>
                          <div>
                            <Input placeholder="Rs." value={sub.price} onChange={(e) => setSubField(gi, si, "price", e.target.value)}
                              className={`h-11 rounded-lg text-sm ${hasError(`servicesOffered.${gi}.subServices.${si}.price`) ? "border-red-500" : "border-slate-200"}`} />
                            <InlineError path={`servicesOffered.${gi}.subServices.${si}.price`} />
                          </div>
                          {group.subServices.length > 1 ? (
                            <button type="button" className="flex h-11 w-full items-center justify-center rounded-lg bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500" onClick={() => removeSubService(gi, si)} title="Remove service">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          ) : <div className="hidden sm:block" />}
                        </div>
                      ))}
                    </div>

                    <Button type="button" variant="ghost" size="sm" onClick={() => addSubService(gi)} className="mt-3 h-10 rounded-lg px-3 text-sm font-bold text-teal-700 hover:bg-teal-50 hover:text-teal-800">
                      <Plus className="mr-1 h-4 w-4" /> Add service
                    </Button>
                  </div>
                ))}

                <Button type="button" variant="outline" onClick={addPetGroup} className="h-12 w-full rounded-lg border-dashed border-teal-300 bg-white text-sm font-bold text-teal-700 hover:bg-teal-50">
                  <Plus className="mr-2 h-4 w-4" /> Add another pet type
                </Button>

                <div className="hidden border-t border-slate-200 pt-4 sm:block">
                  <Button type="submit" disabled={loading} className="h-12 w-full rounded-lg bg-[#e76f51] text-sm font-bold text-white shadow-sm hover:bg-[#d65f43]">
                    {loading ? "Creating your profile..." : "Complete Registration"} <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                  <p className="mt-3 text-center text-xs leading-5 text-slate-500">
                    After approval, pet parents can discover your care, services, and contact details.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="fixed inset-x-0 bottom-0 z-30 border-t border-orange-100 bg-white/95 p-3 shadow-[0_-12px_30px_rgba(15,23,42,0.12)] backdrop-blur sm:hidden">
            <Button type="submit" disabled={loading} className="h-12 w-full rounded-lg bg-[#e76f51] text-sm font-bold text-white shadow-sm hover:bg-[#d65f43]">
              {loading ? "Creating your profile..." : "Complete Registration"} <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
