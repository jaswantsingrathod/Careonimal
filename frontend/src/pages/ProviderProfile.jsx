// src/pages/ProviderProfile.jsx
import { useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  ArrowLeft,
  Mail,
  MapPin,
  Phone,
  PawPrint,
  IndianRupee 
} from "lucide-react";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchProvider } from "../slices/admin-slice";

export default function ProviderProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch()

  const { selectedProvider, providers } = useSelector((state) => state.admin);

    useEffect(()=>{
        dispatch(fetchProvider())
    },[])

  const ele = selectedProvider?._id === id
      ? selectedProvider
      : providers.find((prov) => prov._id === id);

  if (!ele) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-600">Provider not found.</p>
        <Button
          variant="outline"
          className="mt-2"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>
    );
  }

  const offerings = ele.servicesOffered ?? [];
  const rating = ele.rating ?? 0;
  const totalReviews = ele.totalReviews ?? 0;

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 flex justify-center">
      <div className="w-full max-w-5xl space-y-4">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-600 hover:text-slate-900"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <h1 className="text-lg font-semibold text-slate-900">
            Provider Profile
          </h1>
          <div />
        </div>

        {/* Main two-column layout */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* LEFT: profile card */}
          <Card className="md:w-72 w-full rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
            <CardHeader className="flex flex-col items-center gap-3 pt-6 pb-4">
              <img
                src={ele.image}
                alt={ele.businessName}
                className="h-24 w-24 rounded-full object-cover border border-slate-200 shadow-sm"
              />

              <div className="text-center space-y-1">
                <CardTitle className="text-base font-semibold">
                  {ele.businessName}
                </CardTitle>

                <p className="text-xs text-slate-500 capitalize">
                  {ele.serviceType || "Provider"}
                </p>
              </div>

              {/* Rating row */}
              <div className="flex items-center gap-1 text-xs">
                <span className="font-semibold text-emerald-600">
                  {rating.toFixed(1)}
                </span>
                <span className="text-amber-400">★</span>
                <span className="text-slate-500">
                  ({totalReviews})
                </span>
              </div>

              <p className="text-[11px] text-slate-500 text-center max-w-[210px]">
                {ele.description}
              </p>
            </CardHeader>

            <CardContent className="border-t border-slate-100 pt-4 space-y-3 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-slate-400" />
                <span className="truncate">{ele.user?.email}</span>
              </div>

              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-slate-400" />
                <span>{ele.contact}</span>
              </div>

              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                <span className="capitalize">
                  {ele.city}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <IndianRupee  className="h-3.5 w-3.5 text-slate-400" />
                <span>{ele.priceRange}</span>
              </div>

              <div className="pt-3">
                <Button
                  className="w-full text-xs rounded-lg"
                  variant="default"
                >
                  View Bookings
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* RIGHT: description + services */}
          <div className="flex-1 flex flex-col gap-4">
            {/* Description / about */}
            <Card className="rounded-2xl border border-slate-200 shadow-sm">
              <CardContent className="pt-5 pb-4 px-5 space-y-3">
                <h2 className="text-sm font-semibold text-slate-900 mb-1">
                  About this provider
                </h2>
                <p className="text-sm leading-relaxed text-slate-700">
                  {ele.description ||
                    "This provider offers quality pet care services for your furry friends."}
                </p>

                <div className="flex flex-wrap gap-2 pt-2">
                  {ele.availability && (
                    <Badge
                      variant="outline"
                      className="text-[11px] border-emerald-100 bg-emerald-50 text-emerald-700"
                    >
                      Available
                    </Badge>
                  )}
                  {!ele.approvedByAdmin && (
                    <Badge
                      variant="outline"
                      className="text-[11px] border-amber-100 bg-amber-50 text-amber-700"
                    >
                      Pending admin approval
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Services offered at bottom in neutral colors */}
            <Card className="rounded-2xl border border-slate-200 shadow-sm">
              <CardHeader className="pb-2 px-5 pt-4">
                <CardTitle className="text-sm font-semibold text-slate-900">
                  Services Offered
                </CardTitle>
              </CardHeader>

              <CardContent className="px-5 pb-4">
                {offerings.length === 0 ? (
                  <p className="text-xs text-slate-500">
                    No services added yet.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {offerings.map((service, idx) => (
                      <div key={idx} className="space-y-2">
                        {/* pet type pill */}
                        <Badge
                          variant="outline"
                          className="text-[11px] border-slate-200 bg-slate-50 text-slate-700"
                        >
                          {service.petType}
                        </Badge>

                        {/* sub services list */}
                        <div className="space-y-1.5">
                          {service.subServices?.map((sub, i) => (
                            <div
                              key={i}
                              className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 py-2"
                            >
                              <div>
                                <p className="text-xs font-medium text-slate-800">
                                  {sub.service}
                                </p>
                                {sub.description && (
                                  <p className="text-[11px] text-slate-500">
                                    {sub.description}
                                  </p>
                                )}
                              </div>
                              {sub.price && (
                                <p className="text-[11px] font-semibold text-emerald-600">
                                  ₹{sub.price}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
