import Booking from "../models/booking-model.js";
import User from "../models/user-model.js";
import Provider from "../models/provider-models.js";
import { sendMail } from "../../utils/sendMail.js";
const BookingController = {};
import { bookingValidation } from "../validations/booking-validation.js";

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
    // ✅ Check if the selected slot is already booked
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
    // craetes booking
    const booking = new Booking({
      ...value,
      user: req.userId,
      price: servicePrice,
    });
    await booking.save();
    res.status(201).json({ message: "Booking created successfully", booking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

BookingController.userBookings = async (req, res) => {
  try {
     const filter =
      req.role === "admin"? {} : { user: req.userId }; // user → only their bookings
    const bookings = await Booking.find(filter)
      .populate("provider", "businessName contact")
      .sort({ createdAt: -1 })
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

    const bookings = await Booking.find({ provider: provider._id, bookingStatus: {$ne: "cancelled"} })
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

    res.status(200).json({ message: "Booking status updated", booking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

BookingController.cancel = async (req, res) => {
  try {
    const id = req.params.id;
    const user = req.userId;
    const booking = await Booking.findByIdAndUpdate(
      { _id: id, user },
      { bookingStatus: "cancelled" },
      { new: true }
    );
    if (!booking) {
      return res
        .status(404)
        .json({ error: "Booking not found or unauthorized" });
    }
    if (booking.bookingStatus === "cancelled") {
      return res.status(400).json({ message: "Booking is already cancelled" });
    }
    booking.bookingStatus = "cancelled";
    await booking.save();
    res
      .status(200)
      .json({ message: "Booking cancelled successfully", booking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

BookingController.delete = async (req, res)=> {
    try{
        const id = req.params.id
        const booking = await Booking.findByIdAndDelete(id)
        if(!booking){
            return res.status(404).json({error: "Booking not found"})
        }
        res.status(200).json({message: "Booking deleted successfully"})
    }catch(err){
        res.status(500).json({error: err.message})
    }
}

export default BookingController;
