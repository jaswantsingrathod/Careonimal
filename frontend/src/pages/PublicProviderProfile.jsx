// src/pages/PublicProviderProfile.jsx
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { fetchProvider } from "../slices/admin-slice";
import { createBooking } from "../slices/booking-slice";

import BookingModal from "../components/BookingModel";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";

import { Mail, Phone, MapPin, PawPrint } from "lucide-react";

export default function PublicProviderProfile() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // booking modal state (recommended)
  const [open, setOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [selectedSvc, setSelectedSvc] = useState(null);

  // redux state
  const { providers = [], loading } = useSelector((state) => state.admin);
  const { current, loading: bookingLoading } = useSelector(
    (state) => state.booking || {}
  );

  // load provider list if empty
  useEffect(() => {
    dispatch(fetchProvider());
  }, [dispatch]);

  const provider = providers.find((p) => String(p._id) === String(id));

  // OPTIONAL: if a booking was just created you may navigate to details
  useEffect(() => {
    if (current && current._id) {
      // navigate to booking details (or show toast)
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

  // Optional quick booking (fires createBooking thunk immediately).
  // NOTE: backend must accept this minimal payload — usually you SHOULD use the modal.
  const quickBook = async (svc) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please log in to book a service");
      navigate("/login");
      return;
    }

    // Use today as default bookingDate, and a default timeSlot
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const defaultSlot = "09:00";

    const payload = {
      provider: provider._id,
      petType:
        svc?.petType || provider.servicesOffered?.[0]?.petType || "Unknown",
      service: svc.service || svc.name || "",
      bookingDate: today,
      timeSlot: defaultSlot,
    };

    try {
      await dispatch(createBooking(payload)).unwrap();
      toast.success("Quick booking created");
      // navigate handled by effect (or do navigate here)
    } catch (err) {
      toast.error(err || "Quick booking failed");
    }
  };

  return (
    <div className="min-h-screen w-full px-4 py-10 flex justify-center">
      <div className="max-w-4xl w-full space-y-6">
        {/* TOP CARD */}
        <Card className="shadow-md border-none">
          <CardHeader className="flex flex-col items-center">
            <img
              src={provider.image}
              alt={provider.businessName}
              className="h-28 w-28 rounded-full object-cover border"
            />

            <CardTitle className="mt-4 text-2xl">
              {provider.businessName}
            </CardTitle>
            <p className="text-gray-500">{provider.serviceType}</p>

            <Badge variant="secondary" className="mt-2">
              {provider.approvedByAdmin
                ? "Verified Provider"
                : "Pending Approval"}
            </Badge>
          </CardHeader>
        </Card>

        {/* CONTACT INFO */}
        <Card className="shadow-md border-none">
          <CardHeader>
            <CardTitle>Contact</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <InfoRow
              icon={<Mail />}
              label="Email"
              value={provider.user?.email}
            />
            <InfoRow icon={<Phone />} label="Phone" value={provider.contact} />
            <InfoRow
              icon={<MapPin />}
              label="Location"
              value={provider.location?.address}
            />
          </CardContent>
        </Card>

        {/* SERVICES */}
        <Card className="shadow-md border-none">
          <CardHeader>
            <CardTitle>Services Offered</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {provider.servicesOffered?.map((svc, groupIndex) => (
              <div
                className="border p-4 rounded-lg bg-white"
                key={svc.petType || groupIndex}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <PawPrint className="h-5 w-5" />
                    <h4 className="text-lg font-semibold">{svc.petType}</h4>
                  </div>

                  <Badge variant="secondary">
                    {Array.isArray(svc.subServices)
                      ? svc.subServices.length
                      : 0}{" "}
                    services
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {svc.subServices?.map((sub, svcIndex) => (
                    <div
                      className="border rounded-lg bg-gray-50 p-3"
                      key={sub.service || svcIndex}
                    >
                      <p className="text-lg font-medium">{sub.service}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {sub.description || "No description"}
                      </p>

                      <p className="mt-2 font-semibold text-right">
                        ₹ {sub.price}
                      </p>

                      <div className="mt-3 flex gap-2">
                        {/* Recommended: open BookingModal so user enters details */}
                        <Button
                          className="flex-1"
                          onClick={() => {
                            setSelectedGroup(groupIndex);
                            setSelectedIndex(svcIndex);
                            setSelectedSvc(sub);
                            setOpen(true);
                          }}
                        >
                          Book Now
                        </Button>

                        {/* Optional quickBook — uncomment if you want instant booking */}
                        {/* <Button
                          className="flex-1"
                          variant="outline"
                          onClick={() => quickBook(sub)}
                          disabled={bookingLoading}
                        >
                          Quick Book
                        </Button> */}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Booking modal — pass the selected service info */}
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

// helper component
function InfoRow({ icon, label, value }) {
  return (
    <div className="flex gap-3 items-center">
      <div>{icon}</div>
      <div>
        <p className="font-medium">{label}</p>
        <p className="text-gray-600">{value}</p>
      </div>
    </div>
  );
}
