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
import { toast } from "react-toastify";

import {
  fetchMySubscription,
  createSubscriptionOrder,
  verifySubscriptionPayment,
} from "../../slices/subscription-slice.js";

const PLANS = [
  {
    id: "basic",
    label: "Basic",
    price: 299,
    durationText: "30 days",
    description: "Perfect to get started and test the platform.",
  },
  {
    id: "premium",
    label: "Premium",
    price: 799,
    durationText: "90 days",
    description: "Better visibility and long-term stability.",
  },
  {
    id: "pro",
    label: "Pro",
    price: 1499,
    durationText: "180 days",
    description: "For providers who get bookings regularly.",
  },
];

export default function ProviderSubscriptionPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const subscription = useSelector(
    (s) => s.subscription?.data ?? null,
    shallowEqual
  );
  const subLoading = useSelector((s) => s.subscription?.loading ?? false);
  const subError = useSelector((s) => s.subscription?.error ?? null);
  const buying = useSelector((s) => s.subscription?.buying ?? false);
  const buyError = useSelector((s) => s.subscription?.buyError ?? null);

  // load subscription on mount
  useEffect(() => {
    dispatch(fetchMySubscription());
  }, [dispatch]);

  const subscriptionMeta = useMemo(() => {
    if (!subscription) {
      return {
        hasActive: false,
        isExpired: true,
        daysLeft: 0,
        startDate: null,
        endDate: null,
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
    };
  }, [subscription]);

  const isCurrentPlan = (planId) =>
    subscription &&
    subscription.planType === planId &&
    subscriptionMeta.hasActive;

  const handleBuy = async (planType) => {
    try {
      if (!window.Razorpay) {
        toast.error("Razorpay SDK not loaded");
        return;
      }

      // Create order on backend
      const data = await dispatch(createSubscriptionOrder(planType)).unwrap();

      const { order, keyId, amount } = data;

      const options = {
        key: keyId,
        amount: order.amount, // in paise
        currency: order.currency || "INR",
        name: "careonimal",
        description: `${planType.toUpperCase()} Subscription`,
        order_id: order.id,
        handler: async function (response) {
          try {
            await dispatch(
              verifySubscriptionPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                planType,
              })
            ).unwrap();

            toast.success("Subscription activated successfully!");
            // navigate("/provider/dashboard");
          } catch (err) {
            toast.error(
              err || "Payment verified but subscription activation failed"
            );
          }
        },
        theme: {
          color: "#fb923c", // orange-400
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error(err || "Failed to start payment");
    }
  };

  return (
    <div className="min-h-screen px-6 py-10 bg-gradient-to-b from-orange-50 to-white">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Manage Subscription
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Choose a plan to receive bookings and stay visible to pet parents.
            </p>
            {subscriptionMeta.hasActive && subscription && (
              <p className="text-xs text-emerald-600 mt-1">
                You currently have an active{" "}
                <span className="font-semibold capitalize">
                  {subscription.planType}
                </span>{" "}
                plan.
              </p>
            )}
            {!subscriptionMeta.hasActive && !subLoading && (
              <p className="text-xs text-red-500 mt-1 font-medium">
                No active plan. Bookings and provider features may be limited.
              </p>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            className="border-slate-300 text-slate-700"
            onClick={() => navigate("/provider/dashboard")}
          >
            Back to Dashboard
          </Button>
        </header>

        {/* Current subscription summary */}
        <Card className="rounded-2xl shadow-sm cursor-pointer transform hover:-translate-y-1 transition">
          <CardHeader>
            <CardTitle>Current Subscription</CardTitle>
            <CardDescription className="text-sm">
              Your active or last used plan.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {subLoading ? (
              <p className="text-sm text-slate-500">
                Loading your subscription...
              </p>
            ) : !subscription ? (
              <p className="text-sm text-slate-600">
                You don&apos;t have any subscription yet. Pick a plan below to
                get started.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-sm">
                <div>
                  <p className="text-xs text-slate-500">Plan</p>
                  <p className="font-semibold capitalize">
                    {subscription.planType}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Price</p>
                  <p className="font-semibold">₹{subscription.price}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Valid till</p>
                  <p className="font-semibold">
                    {subscriptionMeta.endDate?.toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Status</p>
                  {subscriptionMeta.isExpired ? (
                    <span className="text-xs font-semibold text-red-500">
                      Expired
                    </span>
                  ) : (
                    <span className="text-xs font-semibold text-emerald-600">
                      Active • {subscriptionMeta.daysLeft} day
                      {subscriptionMeta.daysLeft !== 1 && "s"} left
                    </span>
                  )}
                </div>
              </div>
            )}

            {(subError || buyError) && (
              <p className="mt-2 text-xs text-red-500">
                {subError || buyError}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Plans */}
        <section className="space-y-3">
          <h2 className="text-base font-semibold text-slate-900">
            Choose a plan
          </h2>
          <p className="text-xs text-slate-500">
            All plans unlock the same features. Only duration and price change.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PLANS.map((plan) => {
              const isActiveCurrent = isCurrentPlan(plan.id);
              const isProcessing = buying && !isActiveCurrent;

              return (
                <Card
                  key={plan.id}
                  className={`rounded-2xl shadow-sm cursor-pointer transform hover:-translate-y-1 transition border ${
                    isActiveCurrent
                      ? "border-emerald-400 bg-emerald-50"
                      : "border-orange-100 bg-white"
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between gap-2">
                      <CardTitle className="text-lg font-semibold text-slate-900">
                        {plan.label}
                      </CardTitle>
                      {isActiveCurrent && (
                        <Badge className="bg-emerald-500 text-white">
                          Current
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="text-sm text-slate-500">
                      {plan.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-extrabold text-slate-900">
                        ₹{plan.price}
                      </span>
                      <span className="text-xs text-slate-500">
                        / {plan.durationText}
                      </span>
                    </div>

                    <ul className="text-xs text-slate-600 space-y-1">
                      <li>• Full access to provider bookings</li>
                      <li>• Listed to pet parents searching nearby</li>
                      <li>• No usage limits, only time based</li>
                    </ul>

                    <Button
                      size="sm"
                      disabled={isProcessing || isActiveCurrent}
                      className={`mt-2 w-full ${
                        isActiveCurrent
                          ? "bg-emerald-500 hover:bg-emerald-500 text-white cursor-default"
                          : "bg-orange-500 hover:bg-orange-600 text-white"
                      }`}
                      onClick={() => handleBuy(plan.id)}
                    >
                      {isActiveCurrent
                        ? "Current Plan"
                        : isProcessing
                        ? "Processing..."
                        : "Buy this Plan"}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
