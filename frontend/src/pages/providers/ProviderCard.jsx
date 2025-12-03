export default function ProviderCard({ provider, onView }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col">
      <div className="flex items-center gap-4">
        <img src={provider.image || "/assets/placeholder-avatar.png"} alt={provider.businessName} className="h-16 w-16 rounded-full object-cover border" loading="lazy" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900 truncate">{provider.businessName}</h3>
            <div className="text-xs text-slate-500">{Number(provider.rating ?? 0).toFixed(1)} <span className="text-amber-400">★</span></div>
          </div>

          <p className="text-xs text-slate-500 mt-1 truncate">{provider.serviceType ?? "Provider"}</p>
          <p className="text-[12px] text-slate-400 mt-1 line-clamp-2">{provider.shortDescription ?? provider.description ?? ""}</p>

          {provider.distance != null && (
            <div className="mt-2 text-[12px] text-neutral-600">
              <span className="inline-flex items-center gap-2 text-sm font-medium">
                <span className="rounded-full px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100">{provider.distance} km</span>
                <span className="text-xs text-neutral-500">away</span>
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div>
          {provider.availability && <span className="text-[11px] mr-2 inline-block rounded-md px-2 py-1 border border-slate-200 bg-slate-50 text-slate-700">Available</span>}
          {provider.approvedByAdmin && <span className="text-[11px] inline-block rounded-md px-2 py-1 border border-sky-100 bg-sky-50 text-sky-700">Verified</span>}
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => onView?.(provider)} className="text-xs inline-flex items-center gap-2 rounded-full bg-orange-600 text-white px-3 py-1">
            View
          </button>
        </div>
      </div>
    </div>
  );
}
