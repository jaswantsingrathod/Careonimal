import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export default function Pagination({
  page,
  totalPages,
  search,
  onSearchChange,
  onPageChange,
}) {
  const [localSearch, setLocalSearch] = useState(search);

  // debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      onPageChange(1);             
      onSearchChange(localSearch);
    }, 600); 

    return () => clearTimeout(timer);
  }, [localSearch]);

  if (!totalPages) return null;

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mt-6">
      
      <input
        type="text"
        value={localSearch}
        onChange={(e) => setLocalSearch(e.target.value)}
        placeholder="Search..."
        className="w-full sm:w-64 px-3 py-2 text-sm border rounded-lg outline-none focus:ring-2 focus:ring-orange-400"
      />

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 flex-wrap">
          <Button
            size="sm"
            variant="outline"
            disabled={page === 1}
            onClick={() => onPageChange(page - 1)}
          >
            Prev
          </Button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Button
              key={p}
              size="sm"
              variant={p === page ? "default" : "outline"}
              onClick={() => onPageChange(p)}
            >
              {p}
            </Button>
          ))}

          <Button
            size="sm"
            variant="outline"
            disabled={page === totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
