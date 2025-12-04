import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createBooking, clearBookingState } from "../slices/booking-slice";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { PawPrint, Calendar, Clock } from "lucide-react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export default function BookingModal({
  open,
  onOpenChange,
  provider,
  serviceGroupIndex,
  subServiceIndex,
  subService,
}) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, current } = useSelector((s) => s.booking || {});

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [qty, setQty] = useState(1);
  const [notes, setNotes] = useState("");

  const svc = useMemo(() => {
    if (subService) return subService;
    const g = provider?.servicesOffered?.[serviceGroupIndex];
    return g?.subServices?.[subServiceIndex] ?? null;
  }, [subService, provider, serviceGroupIndex, subServiceIndex]);

  const priceValue = svc ? Number(svc.price) : 0;
  const total = qty * priceValue;

  useEffect(() => {
    if (!open) {
      setDate("");
      setTime("");
      setQty(1);
      setNotes("");
      dispatch(clearBookingState());
    }
  }, [open, dispatch]);

  useEffect(() => {
    if (current && current._id) {
      toast.success("Booking created!");
      onOpenChange(false);
      navigate(`/booking/${current._id}`);
    }
  }, [current, navigate, onOpenChange]);

  const minDate = new Date().toISOString().slice(0, 10);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!svc) return toast.error("Missing service");
    if (!date) return toast.error("Select date");
    if (!time) return toast.error("Select time");

    const payload = {
      provider: provider._id,
      petType: provider.servicesOffered?.[serviceGroupIndex]?.petType,
      service: svc.service,
      bookingDate: date,
      timeSlot: time,
    };

    try {
      await dispatch(createBooking(payload)).unwrap();
    } catch (err) {
      toast.error(err || "Booking failed");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="
          sm:max-w-md 
          rounded-xl 
          p-0 
          overflow-hidden
        "
      >
        {/* HEADER */}
        <div className="bg-orange-400 p-3 text-white relative">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">
              Book Service
            </DialogTitle>
            <p className="text-xs opacity-90">
              {provider?.businessName} • {svc?.service}
            </p>
          </DialogHeader>
        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="p-4 space-y-3 text-sm max-h-[60vh] overflow-y-auto"
        >
          {/* Date + Time */}
          <div className="grid grid-cols-2 gap-3">
            <div className="border rounded-lg p-2">
              <label className="text-[10px] text-neutral-600 flex items-center gap-1">
                <Calendar className="h-3 w-3 text-orange-500" />
                Date
              </label>
              <input
                type="date"
                min={minDate}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1 w-full rounded border px-2 py-1 text-xs"
              />
            </div>

            <div className="border rounded-lg p-2">
              <label className="text-[10px] text-neutral-600 flex items-center gap-1">
                <Clock className="h-3 w-3 text-orange-500" />
                Time
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="mt-1 w-full rounded border px-2 py-1 text-xs"
              />
            </div>
          </div>

          {/* Quantity */}
          <div className="border rounded-lg p-2 w-28">
            <label className="text-[10px] text-neutral-600">Qty</label>
            <input
              type="number"
              min={1}
              value={qty}
              onChange={(e) => setQty(Number(e.target.value))}
              className="mt-1 w-full rounded border px-2 py-1 text-xs"
            />
          </div>

          {/* Notes */}
          <div className="border rounded-lg p-2">
            <label className="text-[10px] text-neutral-600">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="mt-1 w-full rounded border px-2 py-1 text-xs"
              placeholder="Optional"
            />
          </div>

          {/* FOOTER */}
          <DialogFooter className="mt-2 flex justify-between items-center">
            <div className="text-xs">
              <p className="font-medium">₹{priceValue}</p>
              <p className="text-[10px] text-neutral-500">
                Total: ₹{total.toLocaleString()}
              </p>
            </div>

            <div className="flex gap-2">
              <DialogClose asChild>
                <Button variant="outline" className="h-8 px-3 text-xs">
                  Cancel
                </Button>
              </DialogClose>

              <Button
                type="submit"
                disabled={loading}
                className="h-8 px-4 text-xs bg-orange-500 hover:bg-orange-600 text-white"
              >
                {loading ? "Booking..." : `Book ₹${priceValue}`}
              </Button>
            </div>
          </DialogFooter>
        </form>

        {/* FOOTER NOTE */}
        <div className="text-center text-[10px] pb-2 text-neutral-400">
          <PawPrint className="inline h-3 w-3 text-orange-400" />  
            Happy Paws, Happy You!
        </div>
      </DialogContent>
    </Dialog>
  );
}
