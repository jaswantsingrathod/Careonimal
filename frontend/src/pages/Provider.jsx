import { useDispatch, useSelector } from "react-redux";
import { createProvider } from "../slices/Provider-slice";
import { useContext } from "react";
import UserContext from "../context/User-Context";
// shadcn/ui (keeps the style consistent with your app)
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { Formik, FieldArray } from "formik";

const initialValues = {
  businessName: "",
  serviceType: "boarding", // enum: boarding | vet | groomer
  description: "",
  address: {
    latitude: "",
    longitude: "",
  },
  city: "",
  priceRange: "",
  contact: "",
  imageFile: null,
  servicesOffered: [
    {
      petType: "",
      subServices: [{ service: "", price: "", description: "" }],
    },
  ],
};

export default function ProviderForm() {
  const dispatch = useDispatch();

  const { loading, error, success } = useSelector((s) => s.provider || {});



  // Build FormData using bracket keys to match your model shape
  const buildFormData = (values) => {
    const fd = new FormData();

    fd.append("businessName", values.businessName || "");
    fd.append("serviceType", values.serviceType || "");
    fd.append("description", values.description || "");
    fd.append("city", values.city || "");
    fd.append("priceRange", values.priceRange || "");
    fd.append("contact", values.contact || "");

    // address
    fd.append("address[latitude]", values.address.latitude || "");
    fd.append("address[longitude]", values.address.longitude || "");

    if (values.imageFile) fd.append("image", values.imageFile);

    (values.servicesOffered || []).forEach((group, i) => {
      fd.append(`servicesOffered[${i}][petType]`, group.petType || "");

      (group.subServices || []).forEach((sub, j) => {
        // Convert price to number if present
        fd.append(
          `servicesOffered[${i}][subServices][${j}][service]`,
          sub.service || ""
        );
        fd.append(
          `servicesOffered[${i}][subServices][${j}][price]`,
          sub.price !== "" ? String(Number(sub.price)) : ""
        );
        fd.append(
          `servicesOffered[${i}][subServices][${j}][description]`,
          sub.description || ""
        );
      });
    });

    return fd;
  };

  // manual validation (no Yup)
  const validate = (values) => {
    const errors = {};

    if (!values.businessName) errors.businessName = "Required";
    if (!values.city) errors.city = "Required";

    if (
      !values.address ||
      values.address.latitude === "" ||
      values.address.longitude === ""
    ) {
      errors.address = {};
      if (values.address.latitude === "") errors.address.latitude = "Required";
      if (values.address.longitude === "") errors.address.longitude = "Required";
    } else {
      // optional: ensure numbers
      if (isNaN(Number(values.address.latitude)))
        errors.address = { ...(errors.address || {}), latitude: "Must be a number" };
      if (isNaN(Number(values.address.longitude)))
        errors.address = { ...(errors.address || {}), longitude: "Must be a number" };
    }

    if (!values.contact || values.contact.replace(/\D/g, "").length < 10)
      errors.contact = "Enter at least 10 digits";

    // servicesOffered
    values.servicesOffered.forEach((g, gi) => {
      if (!g.petType) {
        if (!errors.servicesOffered) errors.servicesOffered = [];
        errors.servicesOffered[gi] = { ...(errors.servicesOffered[gi] || {}), petType: "Required" };
      }

      g.subServices.forEach((s, si) => {
        if (!s.service) {
          if (!errors.servicesOffered) errors.servicesOffered = [];
          errors.servicesOffered[gi] = {
            ...(errors.servicesOffered[gi] || {}),
            subServices: [
              ...((errors.servicesOffered[gi] && errors.servicesOffered[gi].subServices) || []),
            ],
          };
          errors.servicesOffered[gi].subServices[si] = {
            ...(errors.servicesOffered[gi].subServices[si] || {}),
            service: "Required",
          };
        }

        if (s.price !== "" && isNaN(Number(s.price))) {
          if (!errors.servicesOffered) errors.servicesOffered = [];
          errors.servicesOffered[gi] = {
            ...(errors.servicesOffered[gi] || {}),
            subServices: [
              ...((errors.servicesOffered[gi] && errors.servicesOffered[gi].subServices) || []),
            ],
          };
          errors.servicesOffered[gi].subServices[si] = {
            ...(errors.servicesOffered[gi].subServices[si] || {}),
            price: "Must be a number",
          };
        }
      });
    });

    return errors;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Provider Registration</CardTitle>
            <CardDescription className="text-xs">
              Small form matching Provider model
            </CardDescription>
          </CardHeader>

          <CardContent>
            {error && <p className="text-xs text-red-600 mb-2">{error}</p>}
            {success && <p className="text-xs text-green-600 mb-2">{success}</p>}

            <Formik
              initialValues={initialValues}
              validate={validate}
              onSubmit={(values, { setSubmitting }) => {
                const fd = buildFormData(values);
                dispatch(createProvider(fd));
                setSubmitting(false);
              }}
            >
              {({
                values,
                errors,
                touched,
                handleChange,
                handleSubmit,
                setFieldValue,
              }) => (
                <form onSubmit={handleSubmit} className="space-y-3 max-h-[70vh] overflow-auto">
                  {/* businessName */}
                  <div>
                    <input
                      name="businessName"
                      value={values.businessName}
                      onChange={handleChange}
                      placeholder="Business Name"
                      className="w-full border p-2 text-sm rounded"
                    />
                    {touched.businessName && errors.businessName && (
                      <p className="text-xs text-red-500 mt-1">{errors.businessName}</p>
                    )}
                  </div>

                  {/* serviceType */}
                  <div>
                    <select
                      name="serviceType"
                      value={values.serviceType}
                      onChange={handleChange}
                      className="w-full border p-2 text-sm rounded"
                    >
                      <option value="boarding">Boarding</option>
                      <option value="vet">Vet</option>
                      <option value="groomer">Groomer</option>
                    </select>
                  </div>

                  {/* description */}
                  <div>
                    <textarea
                      name="description"
                      value={values.description}
                      onChange={handleChange}
                      placeholder="Description (optional)"
                      rows={2}
                      className="w-full border p-2 text-sm rounded"
                    />
                  </div>

                  {/* address (latitude/longitude) */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <input
                        name="address.latitude"
                        value={values.address.latitude}
                        onChange={(e) =>
                          setFieldValue("address", { ...values.address, latitude: e.target.value })
                        }
                        placeholder="Latitude"
                        className="w-full border p-2 text-sm rounded"
                      />
                      {errors.address && errors.address.latitude && (
                        <p className="text-xs text-red-500 mt-1">{errors.address.latitude}</p>
                      )}
                    </div>

                    <div>
                      <input
                        name="address.longitude"
                        value={values.address.longitude}
                        onChange={(e) =>
                          setFieldValue("address", { ...values.address, longitude: e.target.value })
                        }
                        placeholder="Longitude"
                        className="w-full border p-2 text-sm rounded"
                      />
                      {errors.address && errors.address.longitude && (
                        <p className="text-xs text-red-500 mt-1">{errors.address.longitude}</p>
                      )}
                    </div>
                  </div>

                  {/* city */}
                  <div>
                    <input
                      name="city"
                      value={values.city}
                      onChange={handleChange}
                      placeholder="City"
                      className="w-full border p-2 text-sm rounded"
                    />
                    {touched.city && errors.city && (
                      <p className="text-xs text-red-500 mt-1">{errors.city}</p>
                    )}
                  </div>

                  {/* priceRange */}
                  <div>
                    <input
                      name="priceRange"
                      value={values.priceRange}
                      onChange={handleChange}
                      placeholder="Price Range (optional)"
                      className="w-full border p-2 text-sm rounded"
                    />
                  </div>

                  {/* contact */}
                  <div>
                    <input
                      name="contact"
                      value={values.contact}
                      maxLength={15}
                      onChange={(e) =>
                        setFieldValue("contact", e.target.value.replace(/\D/g, ""))
                      }
                      placeholder="Contact (digits only)"
                      className="w-full border p-2 text-sm rounded"
                    />
                    {touched.contact && errors.contact && (
                      <p className="text-xs text-red-500 mt-1">{errors.contact}</p>
                    )}
                  </div>

                  {/* servicesOffered */}
                  <div className="border-t pt-2">
                    <h3 className="text-sm font-medium mb-2">Services Offered</h3>

                    <FieldArray name="servicesOffered">
                      {(groupHelpers) => (
                        <div>
                          {values.servicesOffered.map((group, gi) => (
                            <div key={gi} className="border p-2 rounded mb-2 bg-white">
                              <div className="flex items-center gap-2 mb-2">
                                <input
                                  name={`servicesOffered[${gi}].petType`}
                                  value={group.petType}
                                  onChange={handleChange}
                                  placeholder="Pet Type (Dog/Cat)"
                                  className="flex-1 border p-2 text-sm rounded"
                                />
                                <div className="flex gap-1">
                                  <Button
                                    type="button"
                                    onClick={() => groupHelpers.remove(gi)}
                                    className="py-1 px-2 text-xs"
                                  >
                                    Remove
                                  </Button>
                                  <Button
                                    type="button"
                                    onClick={() =>
                                      groupHelpers.insert(gi + 1, {
                                        petType: "",
                                        subServices: [{ service: "", price: "", description: "" }],
                                      })
                                    }
                                    className="py-1 px-2 text-xs"
                                  >
                                    + Pet
                                  </Button>
                                </div>
                              </div>

                              {errors.servicesOffered &&
                                errors.servicesOffered[gi] &&
                                errors.servicesOffered[gi].petType && (
                                  <div className="text-xs text-red-500 mb-1">
                                    {errors.servicesOffered[gi].petType}
                                  </div>
                                )}

                              <FieldArray name={`servicesOffered[${gi}].subServices`}>
                                {(subHelpers) => (
                                  <div>
                                    {group.subServices.map((sub, si) => (
                                      <div key={si} className="grid grid-cols-3 gap-2 mb-2">
                                        <input
                                          name={`servicesOffered[${gi}].subServices[${si}].service`}
                                          value={sub.service}
                                          onChange={handleChange}
                                          placeholder="Service"
                                          className="border p-2 text-sm rounded"
                                        />
                                        <input
                                          name={`servicesOffered[${gi}].subServices[${si}].price`}
                                          value={sub.price}
                                          onChange={handleChange}
                                          placeholder="Price"
                                          className="border p-2 text-sm rounded"
                                        />
                                        <input
                                          name={`servicesOffered[${gi}].subServices[${si}].description`}
                                          value={sub.description}
                                          onChange={handleChange}
                                          placeholder="Description"
                                          className="border p-2 text-sm rounded"
                                        />

                                        <div className="col-span-3 flex gap-2 mt-1">
                                          <Button
                                            type="button"
                                            onClick={() => subHelpers.push({ service: "", price: "", description: "" })}
                                            className="py-1 px-2 text-xs"
                                          >
                                            + Sub
                                          </Button>
                                          {group.subServices.length > 1 && (
                                            <Button
                                              type="button"
                                              onClick={() => subHelpers.remove(si)}
                                              className="py-1 px-2 text-xs"
                                            >
                                              Remove Sub
                                            </Button>
                                          )}
                                        </div>

                                        {errors.servicesOffered &&
                                          errors.servicesOffered[gi] &&
                                          errors.servicesOffered[gi].subServices &&
                                          errors.servicesOffered[gi].subServices[si] &&
                                          errors.servicesOffered[gi].subServices[si].service && (
                                            <div className="col-span-3 text-xs text-red-500">
                                              {errors.servicesOffered[gi].subServices[si].service}
                                            </div>
                                          )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </FieldArray>
                            </div>
                          ))}

                          <div className="flex justify-start">
                            <Button
                              type="button"
                              onClick={() =>
                                groupHelpers.push({
                                  petType: "",
                                  subServices: [{ service: "", price: "", description: "" }],
                                })
                              }
                              className="py-1 px-2 text-xs"
                            >
                              + Add Pet Type
                            </Button>
                          </div>
                        </div>
                      )}
                    </FieldArray>
                  </div>

                  {/* image */}
                  <div>
                    <label className="text-xs block mb-1">Image (optional)</label>
                    <input
                      name="imageFile"
                      type="file"
                      onChange={(e) => setFieldValue("imageFile", e.currentTarget.files?.[0] || null)}
                      className="text-xs"
                    />
                  </div>

                  {/* submit */}
                  <div>
                    <Button type="submit" disabled={loading} className="w-full py-2 text-sm">
                      {loading ? "Registering..." : "Register Provider"}
                    </Button>
                  </div>
                </form>
              )}
            </Formik>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
