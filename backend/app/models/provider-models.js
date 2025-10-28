import mongoose from "mongoose";

const providerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", 
    required: true
  },
  serviceType: {
    type: String,
    enum: ["boarding", "vet", "groomer"],
    required: true
  },
  businessName: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  priceRange: {
    type: String,
    trim: true
  },
  contactNumber: {
    type: String,
    required: true
  },
  image: {
    type: String, 
    default: "default.jpg"
  },
  availability: {
    type: Boolean,
    default: true
  },
  approvedByAdmin: {
    type: Boolean,
    default: false
  },
  rating: {
    type: Number,
    default: 0
  },
  totalReviews: {
    type: Number,
    default: 0
  }
}, {timestamps: true});

const Provider = mongoose.model("Provider", providerSchema);
export default Provider;
