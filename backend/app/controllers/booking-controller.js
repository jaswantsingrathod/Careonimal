import Booking from "../models/booking-model.js";
import User from "../models/user-model.js";
import Provider from "../models/provider-models.js";
import { sendMail } from "../../utils/sendMail.js";
import { bookingValidation } from "../validations/booking-validation.js";
import instance from "../../config/razorpay.js";
import crypto from "crypto";

const BookingController = {};

BookingController.create = async (req, res) => {
  try {
    const body = req.body;
    const { error, value } = bookingValidation.validate(body, {
      abortEarly: false,
    });
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    // checks if providers exists
    const provider = await Provider.findById(value.provider);
    if (!provider) {
      return res.status(404).json({ error: "Provider not found" });
    }

    // checks if users exists
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    if (user.role !== "user") {
      return res.status(400).json({ error: "Only user can create booking" });
    }
    // gets service price from provider
    let servicePrice = null;

    provider.servicesOffered.forEach((pet) => {
      if (pet.petType.toLowerCase() === value.petType.toLowerCase()) {
        pet.subServices.forEach((sub) => {
          if (sub.service.toLowerCase() === value.service.toLowerCase()) {
            servicePrice = sub.price;
          }
        });
      }
    });

    if (servicePrice === null) {
      return res
        .status(400)
        .json({ error: "Selected service not found for this provider" });
    }
    // Check if the selected slot is already booked
    const existingBooking = await Booking.findOne({
      provider: value.provider,
      bookingDate: new Date(value.bookingDate),
      timeSlot: value.timeSlot,
      bookingStatus: { $ne: "cancelled" }, // ignore cancelled slots
    });

    if (existingBooking) {
      return res.status(400).json({
        error: "This time slot is already booked for the selected date.",
      });
    }
    // creates booking
    const booking = new Booking({
      ...value,
      user: req.userId,
      price: servicePrice,
    });
    await booking.save();

    // optional: email user about booking creation (non-payment booking)
    try {
      await sendMail(
        user.email,
        "Booking created",
        `Hi ${user.username || "there"}, your booking for ${value.petType} - ${
          value.service
        } on ${new Date(value.bookingDate).toLocaleDateString()} at ${
          value.timeSlot
        } has been created.`
      );
    } catch (mailErr) {
      console.error("Booking create mail error:", mailErr.message);
    }

    res.status(201).json({ message: "Booking created successfully", booking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

BookingController.userBookings = async (req, res) => {
  try {
    const filter = req.role === "admin" ? {} : { user: req.userId }; // user → only their bookings
    const bookings = await Booking.find(filter)
      .populate("provider", "businessName contact")
      .sort({ createdAt: -1 });
    if (!bookings.length) {
      return res.status(404).json({ message: "No bookings found" });
    }
    res.status(200).json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

BookingController.providerBookings = async (req, res) => {
  try {
    const provider = await Provider.findOne({ user: req.userId });
    if (!provider) {
      return res.status(404).json({ error: "Provider profile not found" });
    }

    const bookings = await Booking.find({
      provider: provider._id,
      bookingStatus: { $ne: "cancelled" },
    })
      .populate("user", "username email contact")
      .sort({ createdAt: -1 });

    if (!bookings.length) {
      return res.status(404).json({ message: "No bookings found" });
    }

    res.status(200).json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

BookingController.updateStatus = async (req, res) => {
  try {
    const { bookingStatus } = req.body;
    console.log("status", bookingStatus);

    const validStatuses = ["pending", "confirmed", "completed", "cancelled"];

    if (!validStatuses.includes(bookingStatus)) {
      return res.status(400).json({ error: "Invalid booking status" });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    const provider = await Provider.findOne({ user: req.userId });
    if (!provider || booking.provider.toString() !== provider._id.toString()) {
      return res
        .status(403)
        .json({ error: "Not authorized to update this booking" });
    }

    booking.bookingStatus = bookingStatus;
    await booking.save();

    // email user about status change
    try {
      const user = await User.findById(booking.user).select("email username");
      if (user?.email) {
        await sendMail(
          user.email,
          "Booking status updated",
          `Hi ${user.username || "there"}, your booking for ${
            booking.petType
          } - ${booking.service} is now marked as "${bookingStatus}".`
        );
      }
    } catch (mailErr) {
      console.error("Status update mail error:", mailErr.message);
    }

    res.status(200).json({ message: "Booking status updated", booking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

BookingController.cancel = async (req, res) => {
  try {
    const id = req.params.id;
    const user = req.userId;

    // Find booking owned by user
    const booking = await Booking.findOne({ _id: id, user });

    if (!booking) {
      return res
        .status(404)
        .json({ error: "Booking not found or unauthorized" });
    }

    // If already cancelled
    if (booking.bookingStatus === "cancelled") {
      return res
        .status(200)
        .json({ message: "Booking already cancelled", booking });
    }

    // Cancel booking
    booking.bookingStatus = "cancelled";
    booking.paymentStatus = "failed";
    await booking.save();

    return res.status(200).json({
      message: "Booking cancelled successfully",
      booking,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

BookingController.delete = async (req, res) => {
  try {
    const id = req.params.id;
    const booking = await Booking.findByIdAndDelete(id);
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }
    res.status(200).json({ message: "Booking deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create booking + Razorpay order
BookingController.createRazorpayOrder = async (req, res) => {
  try {
    const body = req.body;
    const { error, value } = bookingValidation.validate(body, {
      abortEarly: false,
    });
    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // provider check
    const provider = await Provider.findById(value.provider);
    if (!provider) {
      return res.status(404).json({ error: "Provider not found" });
    }

    // user check
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    if (user.role !== "user") {
      return res.status(400).json({ error: "Only user can create booking" });
    }

    // price
    let servicePrice = null;
    provider.servicesOffered.forEach((pet) => {
      if (pet.petType.toLowerCase() === value.petType.toLowerCase()) {
        pet.subServices.forEach((sub) => {
          if (sub.service.toLowerCase() === value.service.toLowerCase()) {
            servicePrice = sub.price;
          }
        });
      }
    });

    if (servicePrice === null) {
      return res
        .status(400)
        .json({ error: "Selected service not found for this provider" });
    }

    // check slot — only confirmed / completed block the slot
    const existingBooking = await Booking.findOne({
      provider: value.provider,
      bookingDate: new Date(value.bookingDate),
      timeSlot: value.timeSlot,
      bookingStatus: { $in: ["confirmed", "completed"] },
    });

    if (existingBooking) {
      return res.status(400).json({
        error: "This time slot is already booked for the selected date.",
      });
    }

    // NO BOOKING CREATED HERE
    // just create Razorpay order
    const order = await instance.orders.create({
      amount: servicePrice * 100,
      currency: "INR",
      receipt: `booking_${Date.now()}`,
    });

    // send everything needed to create booking later
    return res.status(201).json({
      success: true,
      key: process.env.RAZORPAY_KEY_ID,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      // backend-controlled booking payload for later
      bookingData: {
        provider: value.provider,
        user: req.userId,
        petType: value.petType,
        service: value.service,
        bookingDate: value.bookingDate,
        timeSlot: value.timeSlot,
        notes: value.notes || "",
        price: servicePrice,
      },
    });
  } catch (err) {
    console.error("CreateRazorpayOrder error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Verify payment + mark booking paid + emails
BookingController.verifyRazorpayPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      bookingData, // ⬅️ comes from frontend (returned earlier by createRazorpayOrder)
    } = req.body;

    const signBody = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(signBody.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ error: "Invalid payment signature" });
    }

    // re-validate minimal things
    if (!bookingData?.provider || !bookingData?.user) {
      return res.status(400).json({ error: "Invalid booking data" });
    }

    // optional: re-check slot is still free (only confirmed/completed block)
    const slotTaken = await Booking.findOne({
      provider: bookingData.provider,
      bookingDate: new Date(bookingData.bookingDate),
      timeSlot: bookingData.timeSlot,
      bookingStatus: { $in: ["confirmed", "completed"] },
    });

    if (slotTaken) {
      // in a real system you might refund here;
      // for now we just tell client it failed to create booking
      return res.status(400).json({
        error:
          "Payment succeeded but the selected slot has just been taken. Please contact support.",
      });
    }

    // ✅ now actually create the booking
    const booking = await Booking.create({
      ...bookingData,
      paymentStatus: "completed",
      bookingStatus: "pending", // provider to confirm
    });

    // mail user about successful payment
    try {
      const user = await User.findById(bookingData.user).select(
        "email username"
      );
      if (user?.email) {
        await sendMail(
          user.email,
          "Payment successful — Booking confirmed",
          `Hi ${
            user.username || "there"
          }, your payment was successful and your booking for ${
            booking.petType
          } - ${booking.service} is now confirmed 🎉`
        );
      }
    } catch (mailErr) {
      console.error("VerifyPayment mail error:", mailErr.message);
    }

    return res.status(200).json({
      success: true,
      message: "Payment verified and booking confirmed",
      booking,
    });
  } catch (err) {
    console.error("VerifyRazorpayPayment error:", err);
    res.status(500).json({ error: err.message });
  }
};


export default BookingController;
