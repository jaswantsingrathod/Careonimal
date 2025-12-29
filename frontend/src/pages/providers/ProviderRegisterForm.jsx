import { useState, useEffect, useContext } from "react";
import { useFormik } from "formik";
import { useDispatch, useSelector } from "react-redux";
import { createProvider } from "../../slices/Provider-slice";
import { useNavigate } from "react-router-dom";
import UserContext from "../../context/User-Context";
import { toast } from "react-toastify";
import Joi from "joi";

import {
  MapPin, Upload, Plus, Trash2, PawPrint,
  Store, ChevronRight, Building2, Stethoscope, Scissors
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

  //  JOI SCHEMA 
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

  //  VALIDATOR 
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
        if (!errors[dotKey]) errors[dotKey] = item.message.replace(/["]/g, "");
      }
      return errors;
    } catch { return {}; }
  }

  //  FORM 
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
          try { if (typeof handleLogout === "function") await handleLogout(); else localStorage.removeItem("token"); } catch { localStorage.removeItem("token"); }
          navigate("/", { state: { providerSubmitted: true } });
        } else {
          toast.error(action.payload || "Failed");
        }
      } catch { toast.error("Error submitting form"); }
      finally { setSubmitting(false); }
    },
  });

  useEffect(() => {
    if (!formik.values.imageFile) { setLogoPreview(null); return; }
    const reader = new FileReader();
    reader.onload = (e) => setLogoPreview(e.target.result);
    reader.readAsDataURL(formik.values.imageFile);
    return () => { try { reader.abort && reader.abort(); } catch { } };
  }, [formik.values.imageFile]);

  useEffect(() => {
    if (formik.isSubmitting && !formik.isValid) {
      console.log("Validation Errors:", formik.errors);
      toast.error("Please check the form for errors.");
    }
  }, [formik.isSubmitting, formik.isValid, formik.errors]);

  const addPetGroup = () => formik.setFieldValue("servicesOffered", [...formik.values.servicesOffered, { petType: "", subServices: [{ service: "", description: "", price: "" }] }]);
  const removePetGroup = (idx) => {
    const groups = [...formik.values.servicesOffered]; if (groups.length === 1) return; groups.splice(idx, 1); formik.setFieldValue("servicesOffered", groups);
  };
  const setPetType = (idx, v) => formik.setFieldValue(`servicesOffered.${idx}.petType`, v);
  const addSubService = (gIdx) => {
    const groups = [...formik.values.servicesOffered]; groups[gIdx].subServices.push({ service: "", description: "", price: "" }); formik.setFieldValue("servicesOffered", groups);
  };
  const removeSubService = (gIdx, sIdx) => {
    const groups = [...formik.values.servicesOffered]; if (groups[gIdx].subServices.length === 1) return; groups[gIdx].subServices.splice(sIdx, 1); formik.setFieldValue("servicesOffered", groups);
  };
  const setSubField = (gIdx, sIdx, f, v) => formik.setFieldValue(`servicesOffered.${gIdx}.subServices.${sIdx}.${f}`, v);

  const getAndFillLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const { latitude, longitude } = pos.coords;
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`);
        const data = await res.json();
        formik.setFieldValue("location", { latitude, longitude, address: data.display_name || `${latitude},${longitude}` });
      } catch { }
    }, () => alert("Location denied"));
  };

  const serviceOpts = [
    { value: "boarding", label: "Boarding", icon: Building2 },
    { value: "vet", label: "Vet", icon: Stethoscope },
    { value: "groomer", label: "Grooming", icon: Scissors },
  ];

  return (
    <div className="min-h-scree py-4 px-3 flex justify-center items-start">
      <div className="max-w-xl w-full">
        <div className="mb-4 text-center">
          <div className="inline-flex items-center justify-center p-2 bg-white rounded-full shadow-sm mb-1 border border-orange-100">
            <Store className="h-5 w-5 text-orange-500" />
          </div>
          <h1 className="text-lg font-bold text-gray-800">Register Business</h1>
        </div>

        <form onSubmit={formik.handleSubmit} className="space-y-3">
          <Card className="shadow-sm border-gray-200">
            <CardContent className="p-4 space-y-4">
              {/* Type */}
              <div>
                <Label className="text-xs text-gray-500 uppercase font-semibold mb-1.5 block">Business Type   <span className="text-red-500"> *</span></Label>
                <div className="grid grid-cols-3 gap-2">
                  {serviceOpts.map((opt) => {
                    const Icon = opt.icon;
                    const isSel = formik.values.serviceType === opt.value;
                    return (
                      <div key={opt.value} onClick={() => formik.setFieldValue("serviceType", opt.value)}
                        className={`cursor-pointer rounded border p-2 flex flex-col items-center justify-center gap-1 transition-all ${isSel ? "border-orange-500 bg-orange-50 text-orange-700" : "border-gray-200 hover:bg-gray-50 from-gray-500"}`}>
                        <Icon className={`h-4 w-4 ${isSel ? "text-orange-600" : "text-gray-400"}`} />
                        <span className="text-[10px] font-medium">{opt.label}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Business Name <span className="text-red-500">*</span></Label>
                  <Input {...formik.getFieldProps("businessName")} placeholder="Happy Paws" className={`h-8 text-sm ${formik.errors.businessName ? "border-red-500" : ""}`} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Contact <span className="text-red-500">*</span></Label>
                  <Input
                    value={formik.values.contact}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (!val.startsWith("+91")) return;
                      formik.setFieldValue("contact", "+91" + val.slice(3).replace(/\D/g, '').slice(0, 10));
                    }}
                    placeholder="+91" className={`h-8 text-sm ${formik.errors.contact ? "border-red-500" : ""}`} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Price Range <span className="text-red-500">*</span></Label>
                  <Input {...formik.getFieldProps("priceRange")} placeholder="₹500-2000" className={`h-8 text-sm ${formik.errors.priceRange ? "border-red-500" : ""}`} />
                </div>
                <div className="space-y-1 relative">
                  <Label className="text-xs">Address <span className="text-red-500">*</span></Label>
                  <div className="relative">
                    <Input {...formik.getFieldProps("location.address")} readOnly placeholder="Click icon to get current location" className={`h-8 text-sm pr-8 bg-gray-50 ${formik.errors["location.address"] ? "border-red-500" : ""}`} />
                    <button type="button" onClick={getAndFillLocation} className="absolute right-1 top-1 p-1 text-blue-500 hover:bg-blue-50 rounded" title="Use Current Location">
                      <MapPin className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Description & Logo row */}
              <div className="flex gap-3 items-start">
                <div className="flex-1 space-y-1">
                  <Label className="text-xs">Description</Label>
                  <Textarea {...formik.getFieldProps("description")} placeholder="Short bio..." className="h-10 min-h-[40px] text-sm resize-none" />
                </div>
                <div className="w-16 space-y-1">
                  <Label className="text-xs">Logo</Label>
                  <div className="relative h-10 w-full border border-dashed rounded overflow-hidden flex items-center justify-center bg-gray-50 hover:bg-gray-100 cursor-pointer">
                    {logoPreview ? <img src={logoPreview} className="h-full w-full object-cover" /> : <Upload className="h-4 w-4 text-gray-400" />}
                    <input type="file" accept="image/*" onChange={(e) => formik.setFieldValue("imageFile", e.currentTarget.files[0])} className="absolute inset-0 opacity-0 cursor-pointer" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SERVICES CARD */}
          <Card className="shadow-sm border-gray-200">
            <CardContent className="p-4 space-y-3">
              <div className="flex justify-between items-center mb-1">
                <Label className="text-xs text-gray-500 uppercase font-semibold">Services Offered  <span className="text-red-500">*</span></Label>
              </div>

              {formik.values.servicesOffered.map((group, gi) => (
                <div key={gi} className="bg-gray-50 rounded p-2 border border-gray-100">
                  <div className="flex items-center gap-2 mb-2">
                    <PawPrint className="h-3.5 w-3.5 text-gray-400" />
                    <Input placeholder="Pet Type (e.g. Dog)" value={group.petType} onChange={(e) => setPetType(gi, e.target.value)}
                      className={`h-7 text-xs bg-white ${formik.errors.servicesOffered?.[gi]?.petType ? "border-red-500" : ""}`} />
                    {formik.values.servicesOffered.length > 1 && (
                      <Trash2 className="h-3.5 w-3.5 text-gray-300 hover:text-red-500 cursor-pointer" onClick={() => removePetGroup(gi)} />
                    )}
                  </div>
                  <div className="space-y-1.5 pl-2 border-l-2 border-gray-200 ml-1.5">
                    {group.subServices.map((sub, si) => (
                      <div key={si} className="flex gap-1.5 items-center">
                        <Input placeholder="Service" value={sub.service} onChange={(e) => setSubField(gi, si, "service", e.target.value)}
                          className={`h-7 text-xs bg-white w-1/3 ${formik.errors.servicesOffered?.[gi]?.subServices?.[si]?.service ? "border-red-500" : ""}`} />
                        <Input placeholder="Desc (opt)" value={sub.description} onChange={(e) => setSubField(gi, si, "description", e.target.value)}
                          className={`h-7 text-xs bg-white flex-1 ${formik.errors.servicesOffered?.[gi]?.subServices?.[si]?.description ? "border-red-500" : ""}`} />
                        <Input placeholder="₹" value={sub.price} onChange={(e) => setSubField(gi, si, "price", e.target.value)}
                          className={`h-7 text-xs bg-white w-14 text-center ${formik.errors.servicesOffered?.[gi]?.subServices?.[si]?.price ? "border-red-500" : ""}`} />
                        {group.subServices.length > 1 && (
                          <Trash2 className="h-3 w-3 text-gray-300 hover:text-red-500 cursor-pointer shrink-0" onClick={() => removeSubService(gi, si)} />
                        )}
                      </div>
                    ))}
                    <div onClick={() => addSubService(gi)} className="text-[10px] text-blue-600 font-medium cursor-pointer flex items-center mt-1">
                      <Plus className="h-3 w-3 mr-1" /> Add Service
                    </div>
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addPetGroup} className="w-full h-8 text-xs border-dashed text-gray-500">
                + Add another Pet
              </Button>
            </CardContent>
          </Card>

          <Button type="submit" disabled={loading} className="w-full h-10 bg-orange-600 text-white hover:bg-orange-700 text-sm font-semibold">
            {loading ? "Registering..." : "Complete Registration"} <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </form>
      </div>
    </div>
  );
}
