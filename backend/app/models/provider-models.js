import mongoose from "mongoose";

const subServiceSchema = new mongoose.Schema({
  service: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  price: { type: Number, min: 0 },
});

const serviceOfferedSchema = new mongoose.Schema({
  petType: { type: String, required: true, trim: true },
  subServices: [subServiceSchema],
});

const providerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    serviceType: {
      type: String,
      enum: ["boarding", "vet", "groomer"],
      required: true,
    },
    businessName: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    location: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
      address: String,
    },
    priceRange: {
      type: String,
      trim: true,
    },
    contact: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      default: "",
    },
    availability: {
      type: Boolean,
      default: true,
    },
    approvedByAdmin: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      default: 0,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    servicesOffered: [serviceOfferedSchema], //  nested array of objects

    subscription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subscription",
      default: null,
    },
    subscriptionPlan: {
      type: String,
      enum: ["free","basic", "premium", "pro"],
      default: "free",
    },
    subscriptionExpiresAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const Provider = mongoose.model("Provider", providerSchema);
export default Provider;
