// src/pages/UserProfile.jsx
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { fetchSingleUser } from "../slices/admin-slice";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail, Shield, CalendarDays, Clock } from "lucide-react";

export default function UserProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { selectedUser, loading, error } = useSelector(
    (state) => state.admin
  );

  useEffect(() => {
    if (id) {
      dispatch(fetchSingleUser(id));
    }
  }, [id, dispatch]);

  const u = selectedUser;

  if (loading && !u) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-sm text-gray-500">Loading profile…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-gray-50">
        <p className="text-sm text-red-500">Error: {error}</p>
        <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
      </div>
    );
  }

  if (!u) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-gray-50">
        <p className="text-sm text-gray-500">User not found.</p>
        <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
      </div>
    );
  }

  const initials =
    (u.username || u.name || u.email || "U")
      .split(" ")
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center py-10 px-4">
      <div className="w-full max-w-3xl space-y-4">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <h1 className="text-lg font-semibold text-gray-900">
            User Profile
          </h1>
        </div>

        {/* Profile card */}
        <Card className="shadow-sm border border-gray-200 rounded-2xl">
          <CardHeader className="flex flex-col items-center gap-3 pt-6 pb-3">
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 via-emerald-400 to-amber-300 flex items-center justify-center text-2xl font-semibold text-white shadow-md">
              {initials}
            </div>
            <div className="text-center space-y-0.5">
              <CardTitle className="text-base">
                {u.username ?? u.name ?? "Unnamed User"}
              </CardTitle>
              <p className="text-xs text-gray-500 capitalize">
                {u.role ?? "member"}
              </p>
            </div>
          </CardHeader>

          <CardContent className="space-y-3 text-sm px-6 pb-6">
            <div className="flex items-center gap-2 text-gray-700">
              <Mail className="h-4 w-4 text-gray-400" />
              <span>{u.email ?? "No email"}</span>
            </div>

            <div className="flex items-center gap-2 text-gray-700">
              <Shield className="h-4 w-4 text-gray-400" />
              <span className="capitalize">
                Role: {u.role ?? "member"}
              </span>
            </div>

            <div className="flex items-center gap-2 text-gray-700">
              <CalendarDays className="h-4 w-4 text-gray-400" />
              <span>
                Joined:{" "}
                {u.createdAt
                  ? new Date(u.createdAt).toLocaleDateString()
                  : "—"}
              </span>
            </div>

            <div className="flex items-center gap-2 text-gray-700 border-t border-gray-100 pt-3 mt-1">
              <Clock className="h-4 w-4 text-gray-400" />
              <span className="text-xs break-all">
                ID: {u._id}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
