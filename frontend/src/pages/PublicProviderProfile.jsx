import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";

import { fetchProvider } from "../slices/admin-slice.js";
import { fetchAllReviews } from "../slices/review-slice.js";

import BookingModal from "../components/BookingModel";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { Mail, Phone, MapPin, PawPrint, Star } from "lucide-react";

export default function PublicProviderProfile() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [selectedSvc, setSelectedSvc] = useState(null);
  const [activeTab, setActiveTab] = useState("services");

  const { providers = [], loading } = useSelector((state) => state.admin);
  const allReviews = useSelector((state) => state.review.all || []);
  const { current } = useSelector((state) => state.booking || {});

  useEffect(() => {
    dispatch(fetchProvider());
    dispatch(fetchAllReviews());
  }, [dispatch]);

  const provider = providers.find((p) => String(p._id) === String(id));

  const providerReviews =
    allReviews.filter((r) => {
      const pid = typeof r.provider === "string" ? r.provider : r.provider?._id;
      return String(pid) === String(id);
    }) || [];

  useEffect(() => {
    if (current && current._id) {
      navigate(`/booking/${current._id}`);
    }
  }, [current, navigate]);

  if (loading || !providers.length) {
    return (
      <div className="flex justify-center p-10 text-gray-600">Loading...</div>
    );
  }

  if (!provider) {
    return (
      <div className="flex justify-center p-10 text-gray-600">
        Provider not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/*  HEADER  */}
      <div className="relativ bg-gradient-to-r from-orange-500 to-orange-300 rounded-3xl h-50 w-[95%] mx-auto mb-10 shadow-md overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 h-full flex items-end pb-6">
          <div className="flex items-end gap-4">
            {/* PROFILE IMAGE */}
            <img
              src={provider.image}
              alt={provider.businessName}
              className="h-32 w-32 rounded-full object-cover border-4 border-white shadow-lg"
            />

            {/* INFO */}
            <div className="text-white space-y-1">
              <h1 className="text-3xl font-bold">{provider.businessName}</h1>

              {/* SERVICE TYPE BADGE */}
              <span
                className="inline-block mt-1 px-3 py-1 rounded-full
                     bg-white/20 backdrop-blur
                     text-xs font-semibold uppercase tracking-wide"
              >
                {provider.serviceType}
              </span>

              {/* AVERAGE RATING */}
              {provider.rating !== undefined && (
                <div className="flex items-center gap-2 mt-2">
                  {/* STARS */}
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.round(provider.rating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-white/40"
                        }`}
                      />
                    ))}
                  </div>

                  {/* NUMBER */}
                  <span className="text-sm font-semibold">
                    {provider.rating.toFixed(1)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/*  TABS */}
      <div className="max-w-6xl mx-auto px-6 mt-6">
        <div className="flex gap-6 border-b">
          <button
            onClick={() => setActiveTab("services")}
            className={`pb-3 text-sm font-medium ${
              activeTab === "services"
                ? "border-b-2 border-orange-600 text-orange-600"
                : "text-gray-500"
            }`}
          >
            Services
          </button>

          <button
            onClick={() => setActiveTab("reviews")}
            className={`pb-3 text-sm font-medium ${
              activeTab === "reviews"
                ? "border-b-2 border-orange-600 text-orange-600"
                : "text-gray-500"
            }`}
          >
            Reviews
          </button>

          <button
            onClick={() => setActiveTab("about")}
            className={`pb-3 text-sm font-medium ${
              activeTab === "about"
                ? "border-b-2 border-orange-600 text-orange-600"
                : "text-gray-500"
            }`}
          >
            About
          </button>
        </div>
      </div>

      {/*  MAIN CONTENT */}
      <div className="max-w-6xl mx-auto px-6 mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT */}
        <div className="lg:col-span-2 space-y-6">
          {/* SERVICES TAB */}
          {activeTab === "services" && (
            <Card>
              <CardHeader>
                <CardTitle>Services Offered</CardTitle>
              </CardHeader>

              <CardContent className="space-y-5">
                {provider.servicesOffered?.map((svc, groupIndex) => (
                  <div
                    key={groupIndex}
                    className="border rounded-xl bg-slate-50 p-4"
                  >
                    <div className="flex justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <PawPrint className="text-orange-600 h-5 w-5" />
                        <h3 className="font-semibold text-lg">{svc.petType}</h3>
                      </div>

                      <Badge variant="secondary">
                        {svc.subServices?.length} Options
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {svc.subServices?.map((sub, svcIndex) => (
                        <div
                          key={svcIndex}
                          className="bg-white border rounded-xl p-4 shadow-sm"
                        >
                          <div className="flex justify-between">
                            <div>
                              <p className="font-semibold">{sub.service}</p>
                              <p className="text-xs text-gray-500">
                                {sub.description || "Best doctors"}
                              </p>
                            </div>

                            <span>
                              ₹{sub.price}
                            </span>
                          </div>

                          <Button
                            className="mt-4 w-full bg-orange-500 hover:bg-orange-600"
                            onClick={() => {
                              setSelectedGroup(groupIndex);
                              setSelectedIndex(svcIndex);
                              setSelectedSvc({
                                ...sub,
                                petType: svc.petType,
                              });
                              setOpen(true);
                            }}
                          >
                            Book Now
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* REVIEWS TAB */}
          {activeTab === "reviews" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
                  Customer Reviews
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                {providerReviews.length === 0 ? (
                  <p className="text-center text-gray-500 py-10">
                    No reviews yet
                  </p>
                ) : (
                  providerReviews.map((r) => (
                    <div
                      key={r._id}
                      className="border rounded-xl p-4 bg-slate-50"
                    >
                      <div className="flex justify-between">
                        <div className="flex">
                          {Array.from({ length: r.rating }).map((_, i) => (
                            <Star
                              key={i}
                              className="h-4 w-4 fill-yellow-500 text-yellow-500"
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(r.createdAt).toLocaleDateString("en-IN")}
                        </span>
                      </div>

                      <p className="text-sm mt-2 text-gray-700">{r.comment}</p>
                      <p className="mt-3 text-xs font-medium text-gray-600">
                        — {r.user.username}
                      </p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          )}

          {/* ABOUT TAB */}
          {activeTab === "about" && (
            <Card>
              <CardHeader>
                <CardTitle>About {provider.businessName}</CardTitle>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* DESCRIPTION */}
                <p className="text-sm text-gray-700 leading-relaxed">
                  {provider.description ||
                    "This provider offers trusted and professional pet care services with a focus on safety, comfort, and love for animals."}
                </p>

                {/* INFO GRID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="border rounded-lg p-4 bg-slate-50">
                    <p className="text-gray-500 text-xs mb-1">Service Type</p>
                    <p className="font-medium capitalize">
                      {provider.serviceType}
                    </p>
                  </div>

                  <div className="border rounded-lg p-4 bg-slate-50">
                    <p className="text-gray-500 text-xs mb-1">
                      Business Status
                    </p>
                    <p className="font-medium">
                      {provider.approvedByAdmin
                        ? "Verified Provider"
                        : "Pending Approval"}
                    </p>
                  </div>

                  <div className="border rounded-lg p-4 bg-slate-50">
                    <p className="text-gray-500 text-xs mb-1">Total Reviews</p>
                    <p className="font-medium">{provider.totalReviews || 0}</p>
                  </div>

                  <div className="border rounded-lg p-4 bg-slate-50">
                    <p className="text-gray-500 text-xs mb-1">Rating</p>
                    <p className="font-medium">
                      {provider.rating ? provider.rating.toFixed(1) : "N/A"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* RIGHT */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Details</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4 text-sm">
              {/* EMAIL */}
              <InfoRow
                icon={<Mail />}
                label="Email"
                value={
                  <a href={`mailto:${provider.user?.email}`}>
                    {provider.user?.email}
                  </a>
                }
              />

              {/* PHONE */}
              <InfoRow
                icon={<Phone />}
                label="Phone"
                value={
                  <a href={`tel:${provider.contact}`}>{provider.contact}</a>
                }
              />

              {/* ADDRESS */}
              <InfoRow
                icon={<MapPin />}
                label="Address"
                value={
                  <a
                    href={`https://www.google.com/maps?q=${provider.location?.latitude},${provider.location?.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {provider.location?.address}
                  </a>
                }
              />
            </CardContent>
          </Card>

          {/* MAP */}
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle>Location</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <iframe
                title="map"
                className="w-full h-60 border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://www.google.com/maps?q=${provider.location.latitude},${provider.location.longitude}&z=15&output=embed`}
              ></iframe>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* BOOKING MODAL */}
      <BookingModal
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) {
            setSelectedGroup(null);
            setSelectedIndex(null);
            setSelectedSvc(null);
          }
        }}
        provider={provider}
        serviceGroupIndex={selectedGroup}
        subServiceIndex={selectedIndex}
        subService={selectedSvc}
      />
    </div>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex gap-3 items-start">
      <div className="text-orange-600">{icon}</div>
      <div>
        <p className="font-medium">{label}</p>
        <p className="text-gray-600">{value}</p>
      </div>
    </div>
  );
}
