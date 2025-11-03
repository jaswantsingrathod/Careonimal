import Booking from "../models/booking-model.js";
import Review from "../models/review-model.js";

import { reviewValidation } from "../validations/review-validation.js";

const ReviewController = {};

ReviewController.makeReview = async (req, res) => {
  try {
    const body = req.body;
    const { error, value } = reviewValidation.validate(body, {
      abortEarly: false,
    });
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    // check if booking belongs to user and is completed
    const booking = await Booking.findOne({
      _id: value.booking,
      user: req.userId,
      bookingStatus: "completed",
    });
    if (!booking) {
      return res
        .status(403)
        .json({ error: "You can only review completed bookings" });
    }
    // create review
    const review = new Review({
        user:req.userId,
        provider: value.provider,
        booking: value.booking,
        rating: value.rating,
        comment: value.comment
    })
    await review.save()
    res.status(201).json({ message: "Review submitted successfully", review });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export default ReviewController;
