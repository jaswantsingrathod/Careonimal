import Provider from "../models/provider-models.js";

export const requireActiveSubscription = async (req, res, next) => {
  try {
    const provider = await Provider.findOne({ user: req.userId });

    if (!provider) {
      return res.status(404).json({ message: "Provider profile not found" });
    }

    const now = new Date();

    if (!provider.subscriptionExpiresAt || provider.subscriptionExpiresAt < now) {
      return res.status(403).json({
        message: "Your subscription has expired or is missing. Please buy a plan.",
      });
    }

    next();
  } catch (err) {
    console.error("requireActiveSubscription error:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
