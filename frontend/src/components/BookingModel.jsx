import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "react-toastify";
import { loadRazorpay } from "../config/loadRazorpay";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
  cancelBooking,
} from "../slices/booking-slice";

export default function BookingModal({
  open,
  onOpenChange,
  provider,
  subService,
}) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [bookingDate, setBookingDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  if (!subService) return null;

  const handleBookAndPay = async () => {
    if (!bookingDate || !timeSlot) {
      toast.error("Please select date & time");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login to continue");
      navigate("/login");
      return;
    }

    try {
      setLoading(true);

      // Load Razorpay
      const loaded = await loadRazorpay();
      if (!loaded) {
        toast.error("Razorpay failed to load");
        setLoading(false);
        return;
      }

      //  Create Order + Booking via Redux thunk
      const orderData = await dispatch(
        createRazorpayOrder({
          provider: provider._id,
          petType: subService.petType,
          service: subService.service,
          bookingDate,
          timeSlot,
          notes,
        })
      ).unwrap();

      const { orderId, amount, currency, key, bookingData } = orderData;

      // Open Razorpay Checkout
      const options = {
        key,
        amount,
        currency,
        name: "Pet Care Booking",
        description: subService.service,
        order_id: orderId,

        // ENABLE UPI + keep others
        method: {
          upi: true,
          card: true,
          netbanking: true,
          wallet: false,
        },

        handler: async function (response) {
          try {
            toast.info("Verifying payment...");

            // Verify payment via Redux thunk
            const verifyRes = await dispatch(
              verifyRazorpayPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                bookingData, // send what backend gave you
              })
            ).unwrap();

            if (verifyRes.success) {
              toast.success("🐾 Payment Successfull! Booking Confirmed");
              onOpenChange(false);
              navigate("/user/dashboard");
            } else {
              toast.error("Payment verification failed");
            }
          } catch (err) {
            console.error(err);
            toast.error(
              typeof err === "string" ? err : "Payment verification error"
            );
          } finally {
            setLoading(false);
          }
        },

        modal: {
          ondismiss: async function () {
            toast.info("Payment cancelled");
            try {
              await dispatch(cancelBooking(bookingId)).unwrap();
            } catch (e) {
              console.error("Failed to cancel booking on dismiss", e);
            } finally {
              setLoading(false);
            }
          },
        },

        theme: {
          color: "#fb923c", // your pet orange theme
        },
      };

      const razorpay = new window.Razorpay(options);

      // If payment fails (bank rejects / bad card / 400 etc)
      razorpay.on("payment.failed", async function (response) {
        console.error("Payment failed:", response.error);
        toast.error(response.error?.description || "Payment failed");

        try {
          await dispatch(cancelBooking(bookingId)).unwrap();
          toast.info("Booking auto-cancelled");
        } catch (e) {
          console.error("Failed to cancel booking after payment failure", e);
          toast.error("Auto-cancel failed");
        } finally {
          setLoading(false);
        }
      });

      razorpay.open();
    } catch (err) {
      console.error(err);
      toast.error(
        typeof err === "string" ? err : "Booking failed, please try again"
      );
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Book & Pay</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="font-semibold">{subService.service}</p>
          <p className="text-sm text-gray-500">₹ {subService.price}</p>

          <Input
            type="date"
            value={bookingDate}
            onChange={(e) => setBookingDate(e.target.value)}
          />

          <Input
            type="time"
            value={timeSlot}
            onChange={(e) => setTimeSlot(e.target.value)}
          />

          <Input
            placeholder="Notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <Button
            onClick={handleBookAndPay}
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600"
          >
            {loading ? "Processing..." : "Book & Pay"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
