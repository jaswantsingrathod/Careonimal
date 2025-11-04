import Booking from "../models/booking-model.js";
import Review from "../models/review-model.js";
import Provider from "../models/provider-models.js";
import { reviewValidation } from "../validations/review-validation.js";

const ReviewController = {};

ReviewController.makeReview = async (req, res) => {
  try {
    const body = req.body;
    const review = reviewValidation.validate(body, { abortEarly: false });
    if (!review) {
      return res.status(400).json({ error: "Invalid review data" });
    }
    // check if booking belongs to user and is completed
    const booking = await Booking.findOne({
      _id: body.booking,
      user: req.userId,
    });
    // only allow review if booking exists and is completed
    if (!booking) {
      return res
        .status(403)
        .json({ error: "You can only review your own bookings" });
    }
    if (booking.bookingStatus !== "completed") {
      return res
        .status(403)
        .json({ error: "You can only review completed bookings" });
    }
    const newReview = new Review({
      user: req.userId,
      provider: body.provider,
      booking: body.booking,
      rating: body.rating,
      comment: body.comment,
    });
    await newReview.save();

    const provider = await Provider.findById(body.provider);
    if (provider) {
      provider.totalReviews += 1;
      provider.rating =
        (provider.rating * (provider.totalReviews - 1) + body.rating) /
        provider.totalReviews;
      await provider.save();
    }
    res
      .status(201)
      .json({ message: "Review submitted successfully", review: newReview });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

ReviewController.myReviews = async (req, res) => {
  try {
    // Find provider profile of logged-in user
    const provider = await Provider.findOne({ user: req.userId });
    if (!provider) {
      return res.status(404).json({ error: "Provider profile not found" });
    }

    // Fetch all reviews for this provider
    const reviews = await Review.find({ provider: provider._id })
      .populate("user", "username").populate('provider', 'businessName')
      .sort({ createdAt: -1 });

    if (!reviews.length) {
      return res.status(404).json({ message: "No reviews yet" });
    }

    res.status(200).json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

ReviewController.allReviews = async (req, res) => {
  try {
    const body = req.body;
    const reviews = await Review.find(body)
      .populate("user", "username email")
      .populate("provider", "businessName, serviceType");
    res.status(200).json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export default ReviewController;
