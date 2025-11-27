import { useState, useEffect, useContext } from "react";
import { useFormik } from "formik";
import { useDispatch, useSelector } from "react-redux";
import { createProvider } from "../../slices/Provider-slice";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import Joi from "joi";
import { useNavigate } from "react-router-dom";
import UserContext from "../../context/User-Context";
import { toast } from "react-toastify";

export default function ProviderForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { handleLogout } = useContext(UserContext) || {};
  const { loading, error } = useSelector((s) => s.provider || {});
  const [logoPreview, setLogoPreview] = useState(null);

  // ---------------------- JOI SCHEMA ----------------------
  const providerSchema = Joi.object({
    serviceType: Joi.string().valid("boarding", "vet", "groomer").required()
      .messages({ "any.only": "Invalid service type", "any.required": "Service type required" }),
    businessName: Joi.string().trim().min(2).max(100).required().messages({
      "string.empty": "Business name is required",
      "string.min": "Business name must be at least 2 characters",
    }),
    description: Joi.string().allow("").max(500).messages({
      "string.max": "Description must be 500 characters or less",
    }),
    location: Joi.object({
      latitude: Joi.number().optional().allow("", null),
      longitude: Joi.number().optional().allow("", null),
      address: Joi.string().trim().min(3).required().messages({
        "string.empty": "Address is required",
        "string.min": "Please enter a valid address",
      }),
    }).required(),
    priceRange: Joi.string().allow("").max(50),
    contact: Joi.string()
      .trim()
      .pattern(/^[0-9+\-\s()]{6,20}$/)
      .required()
      .messages({
        "string.empty": "Contact number is required",
        "string.pattern.base": "Enter a valid contact number",
      }),
    imageFile: Joi.any().optional().allow(null),
    servicesOffered: Joi.array().items(
      Joi.object({
        petType: Joi.string().trim().min(1).required().messages({
          "string.empty": "Pet type is required",
        }),
        subServices: Joi.array().items(
          Joi.object({
            service: Joi.string().trim().min(1).required().messages({
              "string.empty": "Service name is required",
            }),
            description: Joi.string().allow("").max(300),
            price: Joi.alternatives().try(Joi.number().min(0), Joi.string().allow("")).messages({
              "number.base": "Price must be a number",
            }),
          })
        ).min(1).required(),
      })
    ).min(1).required(),
  });

  // ---------------------- VALIDATOR ----------------------
  function validateWithJoi(values) {
    try {
      // convert:true allows Joi to coerce numeric strings to numbers (more forgiving)
      const { error } = providerSchema.validate(values, {
        abortEarly: false,
        allowUnknown: true,
        convert: true, // <-- changed to true for better validation/coercion
      });
      if (!error) return {};
      const errors = {};

      for (const item of error.details) {
        const dotKey = item.path.map((p) => String(p)).join(".");
        if (!errors[dotKey]) {
          errors[dotKey] = item.message.replace(/["]/g, "");
        }
      }
      return errors;
    } catch (e) {
      console.error("validateWithJoi unexpected error:", e);
      return {};
    }
  }

  // ---------------------- FORM / FORMik ----------------------
  const formik = useFormik({
    initialValues: {
      serviceType: "boarding",
      businessName: "",
      description: "",
      location: { latitude: "", longitude: "", address: "" },
      priceRange: "",
      contact: "",
      imageFile: null, // logo
      servicesOffered: [
        {
          petType: "",
          subServices: [{ service: "", description: "", price: "" }],
        },
      ],
    },
    validate: validateWithJoi,
    onSubmit: async (values, { setSubmitting, setErrors }) => {
      setSubmitting(true);
      try {
        const fd = new FormData();
        fd.append("serviceType", values.serviceType);
        fd.append("businessName", values.businessName);
        fd.append("description", values.description || "");
        fd.append("priceRange", values.priceRange || "");
        fd.append("contact", values.contact || "");
        // keep bracket form as you had (no structural backend change)
        if (values.location.address) fd.append("location[address]", values.location.address);
        if (values.location.latitude !== "") fd.append("location[latitude]", values.location.latitude);
        if (values.location.longitude !== "") fd.append("location[longitude]", values.location.longitude);
        if (values.imageFile) fd.append("image", values.imageFile);

        (values.servicesOffered || []).forEach((group, i) => {
          fd.append(`servicesOffered[${i}][petType]`, group.petType || "");
          (group.subServices || []).forEach((sub, j) => {
            fd.append(`servicesOffered[${i}][subServices][${j}][service]`, sub.service || "");
            fd.append(`servicesOffered[${i}][subServices][${j}][description]`, sub.description || "");
            fd.append(`servicesOffered[${i}][subServices][${j}][price]`, sub.price !== "" ? String(sub.price) : "");
          });
        });

        // dispatch and wait result
        const action = await dispatch(createProvider(fd));

        // success
        if (createProvider.fulfilled.match(action)) {
          toast.success("Provider submitted successfully — logging out...");
          // logout if available
          try {
            if (typeof handleLogout === "function") {
              await handleLogout();
            } else {
              localStorage.removeItem("token");
            }
          } catch (err) {
            // still continue even if logout fails
            console.warn("Logout failed:", err);
            localStorage.removeItem("token");
          }

          navigate("/", {
            state: {
              providerSubmitted: true,
              message: "Your provider form has been submitted. We will notify you once profile is approved.",
            },
          });
          return;
        }

        // rejected -> show error, keep user on form
        if (createProvider.rejected.match(action)) {
          const payload = action.payload;
          const errMsg = payload || action.error?.message || "Failed to create provider";
          toast.error(errMsg);

          // If backend returned Joi-like details, map to formik errors
          // e.g. payload = { error: "...", details: [ { message, path: [...] }, ... ] }
          if (payload && typeof payload === "object" && Array.isArray(payload.details)) {
            const mapped = {};
            for (const d of payload.details) {
              const key = Array.isArray(d.path) ? d.path.join(".") : String(d.path || "");
              if (key) mapped[key] = d.message || "Invalid value";
            }
            if (Object.keys(mapped).length) {
              setErrors(mapped);
            }
          }
          return;
        }

        // fallback (shouldn't happen)
        toast.error("Unexpected response from server.");
      } catch (err) {
        console.error("onSubmit unexpected error:", err);
        toast.error("Something went wrong while submitting. Check console.");
      } finally {
        setSubmitting(false);
      }
    },
  });

  // --- preview cleanup when imageFile changes externally (if needed) ---
  useEffect(() => {
    if (!formik.values.imageFile) {
      setLogoPreview(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => setLogoPreview(e.target.result);
    reader.readAsDataURL(formik.values.imageFile);
    return () => {
      try {
        reader.abort && reader.abort();
      } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.imageFile]);

  // dynamic helpers
  const addPetGroup = () => {
    formik.setFieldValue("servicesOffered", [
      ...formik.values.servicesOffered,
      { petType: "", subServices: [{ service: "", description: "", price: "" }] },
    ]);
  };

  const removePetGroup = (idx) => {
    const groups = [...formik.values.servicesOffered];
    if (groups.length === 1) return;
    groups.splice(idx, 1);
    formik.setFieldValue("servicesOffered", groups);
  };

  const setPetType = (idx, v) => {
    const groups = [...formik.values.servicesOffered];
    groups[idx] = { ...groups[idx], petType: v };
    formik.setFieldValue("servicesOffered", groups);
  };

  const addSubService = (gIdx) => {
    const groups = [...formik.values.servicesOffered];
    groups[gIdx].subServices = [...(groups[gIdx].subServices || []), { service: "", description: "", price: "" }];
    formik.setFieldValue("servicesOffered", groups);
  };

  const removeSubService = (gIdx, sIdx) => {
    const groups = [...formik.values.servicesOffered];
    if (!groups[gIdx].subServices || groups[gIdx].subServices.length === 1) return;
    groups[gIdx].subServices = groups[gIdx].subServices.filter((_, i) => i !== sIdx);
    formik.setFieldValue("servicesOffered", groups);
  };

  const setSubField = (gIdx, sIdx, field, val) => {
    const groups = [...formik.values.servicesOffered];
    groups[gIdx].subServices[sIdx] = { ...groups[gIdx].subServices[sIdx], [field]: val };
    formik.setFieldValue("servicesOffered", groups);
  };

  const setLocationField = (k, v) => formik.setFieldValue("location", { ...formik.values.location, [k]: v });

  // compact classes
  const inputCls = "border p-1.5 text-sm rounded";
  const tinyBtnCls = "py-1 px-2 text-xs";

  // ---------------------- REVERSE GEOCODE ----------------------
  const reverseGeocode = async (lat, lon) => {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}`;
      const res = await fetch(url, { headers: { Accept: "application/json" } });
      if (!res.ok) throw new Error("Failed to reverse geocode");
      const data = await res.json();
      const address = data.display_name || (data.address && Object.values(data.address).join(", "));
      return address || "";
    } catch (e) {
      console.error("reverseGeocode error:", e);
      return "";
    }
  };

  // ---------------------- GET DEVICE LOCATION ----------------------
  const getAndFillLocation = () => {
    if (!navigator.geolocation) {
      alert("Your browser does not support geolocation.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const fullAddress = await reverseGeocode(latitude, longitude);
          formik.setFieldValue("location", {
            latitude: Number(latitude),
            longitude: Number(longitude),
            address: fullAddress || `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
          });
          alert("Location added successfully!");
        } catch (err) {
          console.error(err);
          alert("Failed to retrieve address.");
        }
      },
      (err) => {
        if (err.code === 1) {
          alert("Permission denied. Please allow location access.");
        } else {
          alert("Unable to get your location.");
        }
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  return (
    <div className="max-w-2xl mx-auto p-3">
      {error ? <p className="text-sm text-red-600 mt-2">{error}</p> : null}
      <div className="flex items-center gap-2 mb-2">
        <h2 className="text-base font-semibold">Provider Registration</h2>
      </div>

      <form onSubmit={formik.handleSubmit} className="space-y-2 bg-white rounded p-3 shadow-sm">
        {/* serviceType + businessName */}
        <div className="grid grid-cols-3 gap-2">
          <select name="serviceType" value={formik.values.serviceType} onChange={formik.handleChange} className={`${inputCls} col-span-1`}>
            <option value="boarding">Boarding</option>
            <option value="vet">Vet</option>
            <option value="groomer">Groomer</option>
          </select>

          <div className="col-span-2">
            <input
              name="businessName"
              value={formik.values.businessName}
              onChange={formik.handleChange}
              placeholder="Business name"
              className={`${inputCls} w-full`}
            />
            {formik.errors["businessName"] && <p className="text-xs text-red-600 mt-1">{formik.errors["businessName"]}</p>}
          </div>
        </div>

        <textarea
          name="description"
          rows={2}
          value={formik.values.description}
          onChange={formik.handleChange}
          placeholder="Short description (optional)"
          className={`${inputCls} w-full`}
        />

        {/* ADDRESS only (no visible lat/lng) */}
        <div className="grid grid-cols-1 gap-2">
          <label className="text-xs text-neutral-600">Address</label>
          <input
            name="location.address"
            value={formik.values.location.address}
            onChange={(e) => setLocationField("address", e.target.value)}
            placeholder="Enter your address (city, street, pincode)"
            className={`${inputCls} w-full`}
          />
          {formik.errors["location.address"] && <p className="text-xs text-red-600 mt-1">{formik.errors["location.address"]}</p>}
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            onClick={getAndFillLocation}
            className="rounded-full px-6 py-2 text-sm bg-blue-400 border hover:bg-blue-500"
          >
            <MapPin className="h-3 w-3 text-white" />
            Fetch location
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <input name="priceRange" value={formik.values.priceRange} onChange={formik.handleChange} placeholder="Price range" className={inputCls} />
          <div>
            <input name="contact" value={formik.values.contact} onChange={formik.handleChange} placeholder="Contact number" className={inputCls} />
            {formik.errors["contact"] && <p className="text-xs text-red-600 mt-1">{formik.errors["contact"]}</p>}
          </div>
        </div>

        {/* Logo Upload (simple) */}
        <div className="pt-2">
          <label className="text-xs font-medium text-neutral-700 block mb-1">Upload Logo</label>

          <input
            type="file"
            accept="image/*"
            onChange={(e) => formik.setFieldValue("imageFile", e.currentTarget.files?.[0] || null)}
            className="text-sm border rounded p-1.5 w-full"
          />

          <p className="text-[11px] text-neutral-500 mt-1">Upload your business logo.</p>
        </div>

        {/* Services Offered */}
        <div className="pt-2 border-t">
          <h3 className="text-sm font-medium mb-2">Services Offered</h3>

          <div className="space-y-2">
            {formik.values.servicesOffered.map((group, gi) => {
              const groupCount = formik.values.servicesOffered.length;
              return (
                <div key={gi} className="p-2 border rounded-sm bg-gray-50">
                  <div className="mb-1">
                    <input
                      value={group.petType}
                      onChange={(e) => setPetType(gi, e.target.value)}
                      placeholder={`Pet type #${gi + 1} (Dog, Cat...)`}
                      className="w-full border p-1.5 text-sm rounded"
                    />
                    {formik.errors[`servicesOffered.${gi}.petType`] && (
                      <p className="text-xs text-red-600 mt-1">{formik.errors[`servicesOffered.${gi}.petType`]}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    {group.subServices.map((sub, si) => {
                      const subCount = group.subServices.length;
                      return (
                        <div key={si} className="grid grid-cols-3 gap-2 items-start mb-1">
                          <div>
                            <input
                              value={sub.service}
                              onChange={(e) => setSubField(gi, si, "service", e.target.value)}
                              placeholder="Service"
                              className="border p-1.5 text-sm rounded"
                            />
                            {formik.errors[`servicesOffered.${gi}.subServices.${si}.service`] && (
                              <p className="text-xs text-red-600 mt-1">{formik.errors[`servicesOffered.${gi}.subServices.${si}.service`]}</p>
                            )}
                          </div>

                          <input
                            value={sub.description}
                            onChange={(e) => setSubField(gi, si, "description", e.target.value)}
                            placeholder="Short desc"
                            className="border p-1.5 text-sm rounded"
                          />
                          <div className="flex gap-2">
                            <input
                              value={sub.price}
                              onChange={(e) => setSubField(gi, si, "price", e.target.value)}
                              placeholder="Price"
                              className="border p-1.5 text-sm rounded flex-1"
                            />
                            {subCount > 1 ? (
                              <Button type="button" onClick={() => removeSubService(gi, si)} className={tinyBtnCls}>
                                Remove
                              </Button>
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <div>{groupCount > 1 ? <Button type="button" onClick={() => removePetGroup(gi)} className={tinyBtnCls}>Remove pet-type</Button> : null}</div>

                    <div className="flex items-center gap-2">
                      <Button type="button" onClick={() => addSubService(gi)} className={tinyBtnCls}>
                        + Add sub-service
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end mt-2">
            <Button type="button" onClick={addPetGroup} className={tinyBtnCls}>
              + Add pet type
            </Button>
          </div>
        </div>

        <div className="pt-2">
          <Button type="submit" disabled={loading || formik.isSubmitting} className="w-full py-1.5 text-sm">
            {loading || formik.isSubmitting ? "Submitting..." : "Register Provider"}
          </Button>
        </div>
      </form>
    </div>
  );
}
