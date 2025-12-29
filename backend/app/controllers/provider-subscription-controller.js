import Subscription from "../models/provider-subscription-models.js";
import Provider from "../models/provider-models.js";
import { subscriptionValidation } from "../validations/provider-subscription-validation.js";

const providerSubscriptionController = {};

import razorpay from "../../config/razorpay.js"
import crypto from "crypto";

// Central plan configuration (price + duration in days)
const PLANS = {
  basic:  { price: 299,  duration: 30 },
  premium:{ price: 799,  duration: 90 },
  pro:    { price: 1499, duration: 180 },
};

providerSubscriptionController.subscription = async (req, res) => {
  try {
    const body = req.body;
    const { error, value } = subscriptionValidation.validate(body, {
      abortEarly: false,
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Only providers can buy subscriptions
    if (req.role !== "provider") {
      return res
        .status(403)
        .json({ error: "Only providers can buy subscriptions" });
    }

    // Find provider linked to this user
    const provider = await Provider.findOne({ user: req.userId });
    if (!provider) {
      return res
        .status(404)
        .json({ error: "Provider profile not found" });
    }

    // Check if provider is approved by admin
    if (!provider.approvedByAdmin) {
      return res.status(403).json({
        error: "Your profile is not approved by admin yet",
      });
    }

    // Prevent multiple active subscriptions
    const existing = await Subscription.findOne({
      provider: provider._id,
      isActive: true,
    });

    if (existing) {
      return res
        .status(400)
        .json({ error: "You already have an active subscription" });
    }

    // Get plan config
    const plan = PLANS[value.planType];
    if (!plan) {
      return res.status(400).json({ error: "Invalid plan type" });
    }

    // Calculate dates
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + plan.duration);

    // Razorpay paymentId from frontend
    const paymentId = value.paymentId || body.paymentId || null;

    // Create new subscription
    const subscription = new Subscription({
      provider: provider._id,
      planType: value.planType,
      price: plan.price,   // price taken from backend config, not client
      startDate,
      endDate,
      isActive: true,
      paymentId: paymentId || undefined,
    });

    await subscription.save();

    // Sync provider with this subscription
    provider.subscription = subscription._id;
    provider.subscriptionPlan = value.planType;
    provider.subscriptionExpiresAt = endDate;
    await provider.save();

    res.status(201).json({
      message: "Subscription activated successfully",
      subscription,
    });
  } catch (err) {
    console.error("Subscription error:", err);
    res.status(500).json({ error: err.message });
  }
};

providerSubscriptionController.mySubscription = async (req, res) => {
  try {
    // Ensure only provider can hit this (optional but recommended)
    if (req.role !== "provider") {
      return res
        .status(403)
        .json({ error: "Only providers can access this" });
    }

    const provider = await Provider.findOne({ user: req.userId });
    if (!provider) {
      return res
        .status(404)
        .json({ error: "Provider profile not found" });
    }

    // Get latest subscription for that provider (prefer active)
    let subscription = await Subscription.findOne({
      provider: provider._id,
    })
      .sort({ createdAt: -1 })
      .populate("provider", "businessName serviceType contact");

    if (!subscription) {
      return res
        .status(404)
        .json({ error: "No subscription found" });
    }

    // Extra safety: if expired but still marked active, update it here also
    const now = new Date();
    if (subscription.isActive && subscription.endDate < now) {
      subscription.isActive = false;
      await subscription.save();

      // downgrade provider as well
      provider.subscriptionPlan = "free";
      provider.subscriptionExpiresAt = null;
      provider.subscription = null;
      await provider.save();
    }

    res.status(200).json(subscription);
  } catch (err) {
    console.error("MySubscription error:", err);
    res.status(500).json({ error: err.message });
  }
};

providerSubscriptionController.allSubscriptions = async (req, res) => {
  try {
    // Optional: restrict to admin
    if (req.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Only admins can view all subscriptions" });
    }

    const subscriptions = await Subscription.find()
      .populate("provider", "user businessName serviceType contact")
      .sort({ createdAt: -1 });

    if (!subscriptions.length) {
      return res
        .status(404)
        .json({ message: "No subscriptions found" });
    }

    res.status(200).json(subscriptions);
  } catch (err) {
    console.error("AllSubscriptions error:", err);
    res.status(500).json({ error: err.message });
  }
};

// CREATE RAZORPAY ORDER FOR SUBSCRIPTION
providerSubscriptionController.createOrder = async (req, res) => {
  try {
    const { planType } = req.body;

    if (!planType || !PLANS[planType]) {
      return res.status(400).json({ error: "Invalid plan type" });
    }

    // Only providers
    if (req.role !== "provider") {
      return res
        .status(403)
        .json({ error: "Only providers can buy subscriptions" });
    }

    // Find provider linked to this user
    const provider = await Provider.findOne({ user: req.userId });
    if (!provider) {
      return res.status(404).json({ error: "Provider profile not found" });
    }

    if (!provider.approvedByAdmin) {
      return res
        .status(403)
        .json({ error: "Your profile is not approved by admin yet" });
    }

    // Prevent multiple active subscriptions
    const existing = await Subscription.findOne({
      provider: provider._id,
      isActive: true,
    });
    if (existing) {
      return res
        .status(400)
        .json({ error: "You already have an active subscription" });
    }

    const plan = PLANS[planType];
    const amountPaise = plan.price * 100;

    const order = await razorpay.orders.create({
      amount: amountPaise,
      currency: "INR",
      notes: {
        providerId: provider._id.toString(),
        planType,
        type: "provider_subscription",
      },
    });

    return res.status(201).json({
      message: "Razorpay order created",
      order,
      keyId: process.env.RAZORPAY_KEY_ID,
      planType,
      amount: plan.price,
    });
  } catch (err) {
    console.error("Error creating subscription order:", err);
    return res.status(500).json({ error: "Failed to create order" });
  }
};

// VERIFY PAYMENT & ACTIVATE SUBSCRIPTION  
providerSubscriptionController.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      planType,
    } = req.body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !planType
    ) {
      return res.status(400).json({ error: "Missing payment details" });
    }

    if (!PLANS[planType]) {
      return res.status(400).json({ error: "Invalid plan type" });
    }

    // Verify Razorpay signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ error: "Payment verification failed" });
    }

    // Find provider
    const provider = await Provider.findOne({ user: req.userId });
    if (!provider) {
      return res.status(404).json({ error: "Provider profile not found" });
    }

    const existing = await Subscription.findOne({
      provider: provider._id,
      isActive: true,
    });
    if (existing) {
      return res.status(400).json({
        error: "You already have an active subscription",
      });
    }

    const plan = PLANS[planType];

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + plan.duration);

    // create subscription
    const subscription = new Subscription({
      provider: provider._id,
      planType,
      price: plan.price,
      startDate,
      endDate,
      isActive: true,
      paymentId: razorpay_payment_id,
    });

    await subscription.save();

    provider.subscription = subscription._id;
    provider.subscriptionPlan = planType;
    provider.subscriptionExpiresAt = endDate;

    await provider.save();

    return res.status(201).json({
      message: "Subscription activated successfully",
      subscription,
    });
  } catch (err) {
    console.error("verifyPayment error:", err);
    return res.status(500).json({ error: "Failed to verify payment" });
  }
};


export default providerSubscriptionController;
