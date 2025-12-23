import { Button } from "@/components/ui/button";

export default function Pagination({
  page,
  totalPages,
  search,
  onSearchChange,
  onPageChange,
}) {
  if (!totalPages) return null;

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mt-6">
      
      {/* 🔍 SEARCH */}
      <input
        type="text"
        value={search}
        onChange={(e) => {
          onPageChange(1); // reset page on search
          onSearchChange(e.target.value);
        }}
        placeholder="Search..."
        className="w-full sm:w-64 px-3 py-2 text-sm border rounded-lg outline-none focus:ring-2 focus:ring-orange-400"
      />

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
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
