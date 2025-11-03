import Subscription from "../models/provider-subscription-models.js";
import Provider from "../models/provider-models.js";
import { subscriptionValidation } from "../validations/provider-subscription-validation.js";

const providerSubscriptionController = {};

providerSubscriptionController.subscription = async (req, res) => {
  try {
    const body = req.body
    const { error, value } = subscriptionValidation.validate(body, { abortEarly: false });
    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Only providers can buy subscriptions
    if (req.role !== "provider") {
      return res.status(403).json({ error: "Only providers can buy subscriptions" });
    }

    // Find provider linked to this user
    const provider = await Provider.findOne({ user: req.userId });
    if (!provider) {
      return res.status(404).json({ error: "Provider profile not found" });
    }

    // Check if provider is approved by admin
    if (!provider.approvedByAdmin) {
      return res.status(403).json({ error: "Your profile is not approved by admin yet" });
    }

    // Prevent multiple active subscriptions
    const existing = await Subscription.findOne({
      provider: provider._id,
      isActive: true,
    });
    if (existing) {
      return res.status(400).json({ error: "You already have an active subscription" });
    }

    // Plan details
    const plans = {
      basic: { price: 299, duration: 30 },
      premium: { price: 799, duration: 90 },
      pro: { price: 1499, duration: 180 },
    };

    const plan = plans[value.planType];
    if (!plan) {
      return res.status(400).json({ error: "Invalid plan type" });
    }

    // Calculate end date
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + plan.duration);

    // Create new subscription
    const subscription = new Subscription({
      provider: provider._id, 
      planType: value.planType,
      price: plan.price,
      startDate,
      endDate,
      isActive: true,
    });

    await subscription.save();
    res.status(201).json({
      message: "Subscription activated successfully",
      subscription,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

providerSubscriptionController.mySubscription = async (req, res) => {
  try {
    const provider = await Provider.findOne({ user: req.userId });
    if (!provider) {
      return res.status(404).json({ error: "Provider profile not found" });
    }

    const subscription = await Subscription.findOne({ provider: provider._id })
      .sort({ createdAt: -1 })
      .populate("provider", "businessName serviceType contact");

    if (!subscription) {
      return res.status(404).json({ error: "No subscription found" });
    }

    res.status(200).json(subscription);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

providerSubscriptionController.allSubscriptions = async (req, res) => {
    try {
    const subscriptions = await Subscription.find()
      .populate("provider", " user businessName serviceType contact")
      .sort({ createdAt: -1 });

    if (!subscriptions.length) {
      return res.status(404).json({ message: "No subscriptions found" });
    }

    res.status(200).json(subscriptions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export default providerSubscriptionController;
