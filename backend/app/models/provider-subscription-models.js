import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Provider",
    required: true,
  },
  planType: {
    type: String,
    enum: ["basic", "premium", "pro"],
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  startDate: {
    type: Date,
    default: Date.now,
  },
  endDate: {
    type: Date,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  paymentId: {
    type: String, // Optional, if Razorpay integrated
  },
}, { timestamps: true });

const Subscription = mongoose.model("Subscription", subscriptionSchema);
export default Subscription;
