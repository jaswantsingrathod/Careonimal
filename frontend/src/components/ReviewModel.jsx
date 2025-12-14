import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { makeReview } from "../slices/Review-slice.js";
import { toast } from "react-toastify";

export default function ReviewModal({ open, onOpenChange, booking }) {
  const dispatch = useDispatch();

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  if (!booking) return null;

  const handleSubmit = async () => {
    if (!rating) {
      toast.error("Please select a rating");
      return;
    }

    try {
      setLoading(true);

      await dispatch(
        makeReview({
          booking: booking._id,
          provider: booking.provider?._id,
          rating,
          comment,
        })
      ).unwrap();

      toast.success("Review submitted!");
      onOpenChange(false);
    } catch (err) {
      toast.error(err || "Failed to submit review");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Write a Review</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="font-medium text-gray-700">
            {booking.service} for {booking.petType}
          </p>

          <label className="text-sm font-medium">Rating (1–5)</label>
          <Input
            type="number"
            min="1"
            max="5"
            value={rating}
            onChange={(e) => setRating(e.target.value)}
          />

          <Textarea
            placeholder="Write your feedback..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />

          <Button
            className="w-full bg-orange-500 hover:bg-orange-600"
            disabled={loading}
            onClick={handleSubmit}
          >
            {loading ? "Submitting..." : "Submit Review"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
