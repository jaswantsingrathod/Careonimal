import { useEffect, useMemo } from "react";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { useNavigate } from "react-router-dom";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { fetchMySubscription } from "../../slices/subscription-slice.js";
import { fetchProvider } from "../../slices/admin-slice.js";

export default function SubscriptionCard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const subscription = useSelector(
    (s) => s.subscription?.data ?? null,
    shallowEqual
  );
  const subLoading = useSelector((s) => s.subscription?.loading ?? false);
  const subError = useSelector((s) => s.subscription?.error ?? null);

  useEffect(() => {
    dispatch(fetchMySubscription());
    dispatch(fetchProvider());
  }, [dispatch]);

  const subscriptionMeta = useMemo(() => {
    if (!subscription) {
      return {
        hasActive: false,
        isExpired: true,
        daysLeft: 0,
        startDate: null,
        endDate: null,
        planLabel: "No active plan",
      };
    }

    const now = new Date();
    const start = new Date(subscription.startDate);
    const end = new Date(subscription.endDate);

    const expiredByDate = end < now;
    const expiredByFlag = subscription.isActive === false;
    const isExpired = expiredByDate || expiredByFlag;

    const msLeft = isExpired ? 0 : end - now;
    const daysLeft = Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24)));

    return {
      hasActive: !isExpired,
      isExpired,
      daysLeft,
      startDate: start,
      endDate: end,
      planLabel: subscription.planType?.toUpperCase() || "UNKNOWN",
    };
  }, [subscription]);

  return (
    <Card className="rounded-2xl shadow-sm border border-orange-100  cursor-pointer transform hover:-translate-y-1 transition">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-xl">🐾</span>
          <span>Subscription</span>
        </CardTitle>
        <CardDescription className="text-sm">
          Your provider access & visibility status
        </CardDescription>
      </CardHeader>

      <CardContent>
        {/* LOADING */}
        {subLoading && (
          <p className="text-sm text-slate-500">Checking subscription...</p>
        )}

        {/* NO SUBSCRIPTION TAKEN */}
        {!subLoading && !subscription && (
          <div className="space-y-3 text-center">
            <p className="text-sm font-semibold text-red-500">
              No active subscription
            </p>

            <p className="text-xs text-slate-500">
              Get a plan to start receiving bookings and connect with pet
              parents today 🐾
            </p>

            <Button
              size="sm"
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold"
              onClick={() => navigate("/provider/subscription")}
            >
              Buy a Plan
            </Button>
          </div>
        )}

        {/* ACTIVE / EXPIRED SUBSCRIPTION */}
        {!subLoading && subscription && (
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Plan</span>
              <Badge className="capitalize bg-orange-100 text-orange-700">
                {subscription.planType}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-600">Price</span>
              <span className="font-medium">₹{subscription.price}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-600">Started</span>
              <span>{subscriptionMeta.startDate?.toLocaleDateString()}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-600">Ends</span>
              <span>{subscriptionMeta.endDate?.toLocaleDateString()}</span>
            </div>

            {/* STATUS MESSAGE */}
            {subscriptionMeta.isExpired ? (
              <p className="text-xs text-red-500 font-medium">
                Subscription expired. Renew to unlock bookings.
              </p>
            ) : (
              <p className="text-xs text-emerald-600 font-medium">
                {subscriptionMeta.daysLeft} day
                {subscriptionMeta.daysLeft !== 1 && "s"} remaining
              </p>
            )}

            <Button
              size="sm"
              variant="outline"
              className="mt-2 w-full border-orange-300 text-orange-700 hover:bg-orange-50"
              onClick={() => navigate("/provider/subscription")}
            >
              {subscriptionMeta.isExpired ? "Renew Plan" : "Manage / Upgrade"}
            </Button>
          </div>
        )}

        {/* ERROR */}
        {subError && <p className="mt-2 text-xs text-red-500">{subError}</p>}
      </CardContent>
    </Card>
  );
}
