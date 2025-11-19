import { Button } from "@/components/ui/button";
import {
  PawPrint,
  MapPin,
  Calendar,
  Dog,
  Search,
} from "lucide-react";
import img from "../assets/dog.gif";

export default function Home() {
  return (
    // <div className="min-h-screen w-full flex items-center justify-center bg-white px-4">
      <div className="max-w-6xl w-full">

        {/* MAIN CARD */}
        <div className="min-w-screen bg-white shadow-xl border border-orange-100 overflow-hidden">
          <div className="grid md:grid-cols-2 gap-6 lg:gap-10 items-center px-6 lg:px-10 pt-10 pb-8">

            {/* LEFT SECTION */}
            <div className="space-y-6">
              <span className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-700">
                <PawPrint className="h-3 w-3" />
                🐾 Caring for pets, caring for you
              </span>

              <h1 className="text-4xl font-extrabold leading-snug text-neutral-900">
                Find Your Best <br />
                <span className="text-orange-600">Pet Care Center</span>
              </h1>

              <p className="text-neutral-600 text-sm max-w-md">
                Book trusted vets, groomers & pet boarders — all in one place.
                <br />
                <span className="font-semibold text-neutral-800">
                  Connecting pets with loving care — anytime, anywhere.
                </span>
              </p>

              <Button className="rounded-full px-6 text-sm bg-orange-600 hover:bg-orange-700">
                Get Started
              </Button>

              <Button className="rounded-full px-10 text-sm bg-green-300 hover:bg-green-500">Offer Care</Button>

              {/* Stats */}
              <div className="flex gap-10 pt-2">
                <Stat count="2K+" label="Verified vets" />
                <Stat count="12K+" label="Happy pets helped" />
              </div>
            </div>

            {/* RIGHT IMAGE BOX */}
            <div className="flex justify-center md:justify-end">
              <div className="h-72 w-72 lg:h-80 lg:w-80 bg-orange-100 rounded-[2.5rem] overflow-hidden flex items-end justify-center">
                <img src={img} className="h-full object-cover w-full" />
              </div>
            </div>
          </div>

          {/* SEARCH BAR */}
          <div className="border-t border-orange-100 bg-orange-50/50 px-6 py-4">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
              <div className="flex flex-wrap gap-3">
                <FilterBox icon={<Dog className="h-4 w-4 text-orange-500" />} label="I'm looking for" value="Dog Boarding" />
                <FilterBox icon={<MapPin className="h-4 w-4 text-orange-500" />} label="Location" value="Enter City / Pincode" />
                <FilterBox icon={<Calendar className="h-4 w-4 text-orange-500" />} label="Dates" value="Select Dates" />
                <FilterBox icon={<PawPrint className="h-4 w-4 text-orange-500" />} label="Pet Size" value="Small (0-15 kg)" />
              </div>

              <Button className="flex gap-2 rounded-full bg-orange-200 hover:bg-orange-300 px-5">
                <Search className="flex  h-4 w-4 px-30" /> Search
              </Button>
            </div>
          </div>
        </div>
      </div>
    // </div>
  );
}

/* --- REUSABLES --- */

function Stat({ count, label }) {
  return (
    <div>
      <p className="text-xl font-bold text-neutral-900">{count}</p>
      <p className="text-xs text-neutral-500">{label}</p>
    </div>
  );
}

function FilterBox({ icon, label, value }) {
  return (
    <div className="flex items-start gap-2 rounded-xl bg-white px-3 py-2 shadow-sm border border-orange-100 min-w-[180px]">
      <div className="mt-0.5">{icon}</div>
      <div className="flex flex-col">
        <span className="text-[11px] text-neutral-500">{label}</span>
        <span className="text-xs font-medium text-neutral-800">{value}</span>
      </div>
    </div>
  );
}
