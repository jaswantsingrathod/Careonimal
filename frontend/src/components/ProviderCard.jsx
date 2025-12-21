import { MapPin, Star, Navigation } from "lucide-react";

export default function ProviderCard({ provider, onView }) {
  return (
    <div className="bg-white rounded-xl shadow-sm  border border-orange-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 relative overflow-hidden">
      {/* IMAGE */}
      <div className="relative h-32">
        <img
          src={provider.image || "/assets/provider-placeholder.jpg"}
          alt={provider.businessName}
          className="h-full w-full object-cover"
        />

        <span className="absolute top-2 right-2 bg-white px-1.5 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1 shadow">
          <Star className="h-3 w-3 text-yellow-500" />
          {provider.rating || 0}
        </span>

        {typeof provider.distance === "number" && (
          <span className="absolute top-2 left-2 bg-white px-1.5 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1 shadow">
            <Navigation className="h-3 w-3 text-orange-500" />
            {provider.distance} Km Away
          </span>
        )}
      </div>

      {/* CONTENT */}
      <div className="p-3 space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-semibold text-slate-800 text-sm truncate">
            {provider.businessName}
          </h3>
          {provider.priceRange && (
            <span className="text-[10px] font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded whitespace-nowrap">
              Price Range: ₹
              {provider.priceRange.replace(/\s+/g, "").replace("-", " – ₹")}
            </span>
          )}
        </div>
        <p className="text-[10px] text-orange-600 font-medium uppercase">
          {provider.serviceType}
        </p>

        <p className="text-xs text-slate-500 line-clamp-2">
          {provider.description || "Trusted pet care provider"}
        </p>

        <div className="flex items-center justify-between text-[10px] text-slate-400">
          <div className="flex items-center gap-1 truncate">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">
              {provider.location?.address || "Nearby"}
            </span>
          </div>
        </div>

        <button
          onClick={() => onView(provider)}
          className="mt-2 w-full bg-orange-600 hover:bg-orange-700 text-white py-1.5 rounded-lg text-xs font-medium"
        >
          View Profile
        </button>
      </div>
    </div>
  );
}
