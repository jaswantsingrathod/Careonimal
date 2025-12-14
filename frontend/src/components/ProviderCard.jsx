import { MapPin, Star } from "lucide-react";

export default function ProviderCard({ provider, onView }) {
  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition overflow-hidden border border-orange-100">
      <div className="relative h-40">
        <img
          src={provider.image || "/assets/provider-placeholder.jpg"}
          alt={provider.businessName}
          className="h-full w-full object-cover"
        />
        <span className="absolute top-3 right-3 bg-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow">
          <Star className="h-3 w-3 text-yellow-500" />
          {provider.avgRating || "4.5"}
        </span>
      </div>

      <div className="p-4 space-y-2">
        <h3 className="font-semibold text-slate-800 text-lg">
          {provider.businessName}
        </h3>

        <p className="text-xs text-orange-600 font-medium uppercase">
          {provider.serviceType}
        </p>

        <p className="text-sm text-slate-500 line-clamp-2">
          {provider.description || "Trusted pet care provider"}
        </p>

        <div className="flex items-center gap-1 text-xs text-slate-400">
          <MapPin className="h-3 w-3" />
          {provider.location?.address || "Nearby"}
        </div>

        <button
          onClick={() => onView(provider)}
          className="mt-3 w-full bg-orange-600 hover:bg-orange-700 text-white py-2 rounded-xl text-sm font-medium"
        >
          View Profile
        </button>
      </div>
    </div>
  );
}
