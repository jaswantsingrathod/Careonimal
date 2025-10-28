import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Provider",
    required: true
  },
  serviceType: {
    type: String,
    enum: ["boarding", "vet", "groomer"],
    required: true
  },
  bookingDate: {
    type: Date,
    required: true
  },
  timeSlot: {
    type: String,
    required: true 
  },
  status: {
    type: String,
    enum: ["pending", "confirmed", "completed", "cancelled"],
    default: "pending"
  },
  notes: {
    type: String,
    trim: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "failed"],
    default: "pending"
  },
  paymentMethod: {
    type: String,
    enum: ["cash", "online"],
    default: "cash"
  },
  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point"
    },
    coordinates: {
      type: [Number], 
    }
  }
}, {timestamps: true});

bookingSchema.index({ location: "2dsphere" });

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;
