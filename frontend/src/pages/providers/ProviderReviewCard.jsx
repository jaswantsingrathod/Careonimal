import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";
import { fetchAllReviews } from "../../slices/Review-slice.js";

export default function ProviderReviewsCard({ providerId }) {
  const dispatch = useDispatch();
  const allReviews = useSelector((s) => s.review?.all ?? []);

  useEffect(() => {
    dispatch(fetchAllReviews());
  }, [dispatch]);

  const reviews = allReviews.filter((r) => {
    const pid = typeof r.provider === "string" ? r.provider : r.provider?._id;
    return String(pid) === String(providerId);
  });

  if (!reviews.length)
    return (
      <Card className="shadow-md mt-6">
        <CardHeader>
          <CardTitle>Customer Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-500 py-6">No reviews yet.</p>
        </CardContent>
      </Card>
    );

  // Duplicate for infinite scroll
  const looped = [...reviews, ...reviews];

  return (
    <Card className="shadow-md mt-6 border-none">
      <CardHeader>
        <CardTitle>Customer Reviews</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="relative overflow-hidden w-full">
          <div className="flex gap-6 animate-scroll whitespace-nowrap">

            {looped.map((r, i) => (
              <Card
                key={i}
                className="w-[330px] h-auto shrink-0 border shadow-sm rounded-2xl px-5 py-4 bg-white"
              >
                {/* Stars */}
                <div className="flex mb-2">
                  {Array.from({ length: r.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 text-yellow-500 fill-yellow-500"
                    />
                  ))}
                </div>

                {/* Comment */}
                <p className="text-sm text-gray-700 leading-relaxed line-clamp-4">
                  {r.comment}
                </p>

                {/* User Row */}
                <div className="flex items-center gap-3 mt-4">
                  <img
                    src={
                      r.user?.avatar ||
                      "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                    }
                    alt="user"
                    className="w-10 h-10 rounded-full object-cover"
                  />

                  <div>
                    <p className="font-semibold text-sm">
                      {r.user?.username || "User"}
                    </p>
                    <p className="text-xs text-gray-500">{r.booking?.service}</p>
                  </div>
                </div>

                {/* Date */}
                <p className="text-[11px] text-gray-400 mt-2">
                  {new Date(r.createdAt).toLocaleDateString("en-IN")}
                </p>
              </Card>
            ))}

          </div>
        </div>
      </CardContent>
    </Card>
  );
}
