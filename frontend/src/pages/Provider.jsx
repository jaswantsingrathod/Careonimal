import { useFormik } from "formik";
import { useDispatch, useSelector } from "react-redux";
import { createProvider } from "../slices/Provider-slice";
import { Button } from "@/components/ui/button";

export default function ProviderForm() {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((s) => s.provider || {});

  const formik = useFormik({
    initialValues: {
      serviceType: "boarding",
      businessName: "",
      description: "",
      location: { latitude: "", longitude: "", address: "" },
      priceRange: "",
      contact: "",
      imageFile: null,
      servicesOffered: [
        {
          petType: "",
          subServices: [{ service: "", description: "", price: "" }],
        },
      ],
    },
    onSubmit: (values) => {
      const fd = new FormData();
      fd.append("serviceType", values.serviceType);
      fd.append("businessName", values.businessName);
      fd.append("description", values.description || "");
      fd.append("priceRange", values.priceRange || "");
      fd.append("contact", values.contact || "");
      fd.append("location[latitude]", values.location.latitude);
      fd.append("location[longitude]", values.location.longitude);
      fd.append("location[address]", values.location.address || "");
      if (values.imageFile) fd.append("image", values.imageFile);

      (values.servicesOffered || []).forEach((group, i) => {
        fd.append(`servicesOffered[${i}][petType]`, group.petType || "");
        (group.subServices || []).forEach((sub, j) => {
          fd.append(
            `servicesOffered[${i}][subServices][${j}][service]`,
            sub.service || ""
          );
          fd.append(
            `servicesOffered[${i}][subServices][${j}][description]`,
            sub.description || ""
          );
          fd.append(
            `servicesOffered[${i}][subServices][${j}][price]`,
            sub.price !== "" ? String(sub.price) : ""
          );
        });
      });

      dispatch(createProvider(fd));
    },
  });

  // dynamic helpers
  const addPetGroup = () => {
    formik.setFieldValue("servicesOffered", [
      ...formik.values.servicesOffered,
      {
        petType: "",
        subServices: [{ service: "", description: "", price: "" }],
      },
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
    groups[gIdx].subServices = [
      ...(groups[gIdx].subServices || []),
      { service: "", description: "", price: "" },
    ];
    formik.setFieldValue("servicesOffered", groups);
  };

  const removeSubService = (gIdx, sIdx) => {
    const groups = [...formik.values.servicesOffered];
    if (!groups[gIdx].subServices || groups[gIdx].subServices.length === 1)
      return;
    groups[gIdx].subServices = groups[gIdx].subServices.filter(
      (_, i) => i !== sIdx
    );
    formik.setFieldValue("servicesOffered", groups);
  };

  const setSubField = (gIdx, sIdx, field, val) => {
    const groups = [...formik.values.servicesOffered];
    groups[gIdx].subServices[sIdx] = {
      ...groups[gIdx].subServices[sIdx],
      [field]: val,
    };
    formik.setFieldValue("servicesOffered", groups);
  };

  const setLocationField = (k, v) =>
    formik.setFieldValue("location", { ...formik.values.location, [k]: v });

  // compact classes
  const inputCls = "border p-1.5 text-sm rounded";
  const tinyBtnCls = "py-1 px-2 text-xs";

  // ---------------------- REVERSE GEOCODE ----------------------
  const reverseGeocode = async (lat, lon) => {
		try {
			const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}`

			const res = await fetch(url, {
				headers: { Accept: "application/json" },
			});

			if (!res.ok) throw new Error("Failed to reverse geocode");
			const data = await res.json();
			const address = data.display_name || (data.address && Object.values(data.address).join(", "));
      // console.log(address)
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
          address: fullAddress,
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
    { enableHighAccuracy: true, timeout: 3000 }
  );
  };


  return (
    <div className="max-w-2xl mx-auto p-3">
      <div className="flex items-center gap-2 mb-2">
        <h2 className="text-base font-semibold">Provider Registration</h2>
      </div>

      <form
        onSubmit={formik.handleSubmit}
        className="space-y-2 bg-white rounded p-3 shadow-sm"
      >
        {/* serviceType + businessName */}
        <div className="grid grid-cols-3 gap-2">
          <select
            name="serviceType"
            value={formik.values.serviceType}
            onChange={formik.handleChange}
            className={`${inputCls} col-span-1`}
          >
            <option value="boarding">Boarding</option>
            <option value="vet">Vet</option>
            <option value="groomer">Groomer</option>
          </select>

          <input
            name="businessName"
            value={formik.values.businessName}
            onChange={formik.handleChange}
            placeholder="Business name"
            className={`${inputCls} col-span-2`}
          />
        </div>

        <textarea
          name="description"
          rows={2}
          value={formik.values.description}
          onChange={formik.handleChange}
          placeholder="Short description (optional)"
          className={`${inputCls} w-full`}
        />

        <div className="grid grid-cols-3 gap-2">
          <input
            name="location.latitude"
            value={formik.values.location.latitude}
            onChange={(e) => setLocationField("latitude", e.target.value)}
            placeholder="Lat"
            className={inputCls}
          />
          <input
            name="location.longitude"
            value={formik.values.location.longitude}
            onChange={(e) => setLocationField("longitude", e.target.value)}
            placeholder="Lng"
            className={inputCls}
          />
          <input
            name="location.address"
            value={formik.values.location.address}
            onChange={(e) => setLocationField("address", e.target.value)}
            placeholder="Address"
            className={inputCls}
          />
        </div>
        <Button
          type="button"
          onClick={getAndFillLocation}
          className="bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded w-full"
        >
          Use My Location
        </Button>

        <div className="grid grid-cols-2 gap-2">
          <input
            name="priceRange"
            value={formik.values.priceRange}
            onChange={formik.handleChange}
            placeholder="Price range"
            className={inputCls}
          />
          <input
            name="contact"
            value={formik.values.contact}
            onChange={formik.handleChange}
            placeholder="Contact number"
            className={inputCls}
          />
        </div>

        <div className="flex items-center gap-3 text-xs">
          <label className="text-xs text-slate-600">Image</label>
          <input
            type="file"
            onChange={(e) =>
              formik.setFieldValue(
                "imageFile",
                e.currentTarget.files?.[0] || null
              )
            }
            className="text-sm"
          />
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
                  </div>

                  <div className="space-y-1">
                    {group.subServices.map((sub, si) => {
                      const subCount = group.subServices.length;
                      return (
                        <div
                          key={si}
                          className="grid grid-cols-3 gap-2 items-start mb-1"
                        >
                          <input
                            value={sub.service}
                            onChange={(e) =>
                              setSubField(gi, si, "service", e.target.value)
                            }
                            placeholder="Service"
                            className="border p-1.5 text-sm rounded"
                          />
                          <input
                            value={sub.description}
                            onChange={(e) =>
                              setSubField(gi, si, "description", e.target.value)
                            }
                            placeholder="Short desc"
                            className="border p-1.5 text-sm rounded"
                          />
                          <div className="flex gap-2">
                            <input
                              value={sub.price}
                              onChange={(e) =>
                                setSubField(gi, si, "price", e.target.value)
                              }
                              placeholder="Price"
                              className="border p-1.5 text-sm rounded flex-1"
                            />
                            {/* show remove only if > 1 */}
                            {subCount > 1 ? (
                              <Button
                                type="button"
                                onClick={() => removeSubService(gi, si)}
                                className={tinyBtnCls}
                              >
                                Remove
                              </Button>
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* group-level controls below inputs */}
                  <div className="flex items-center justify-between mt-2">
                    {/* remove group only shown when more than 1 group */}
                    <div>
                      {groupCount > 1 ? (
                        <Button
                          type="button"
                          onClick={() => removePetGroup(gi)}
                          className={tinyBtnCls}
                        >
                          Remove pet-type
                        </Button>
                      ) : null}
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        onClick={() => addSubService(gi)}
                        className={tinyBtnCls}
                      >
                        + Add sub-service
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add Pet Type button placed under all groups; always visible */}
          <div className="flex justify-end mt-2">
            <Button type="button" onClick={addPetGroup} className={tinyBtnCls}>
              + Add pet type
            </Button>
          </div>
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            disabled={loading}
            className="w-full py-1.5 text-sm"
          >
            {loading ? "Submitting..." : "Register Provider"}
          </Button>
        </div>
      </form>
    </div>
  );
}
