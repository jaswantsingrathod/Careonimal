// src/pages/UserProfile.jsx
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { fetchSingleUser } from "../slices/admin-slice";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Mail,
  Phone,
  Shield,
  CalendarDays,
  Clock,
  LogIn,
} from "lucide-react";

export default function UserProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { selectedUser, loading, error } = useSelector(
    (state) => state.admin
  );

  useEffect(() => {
      dispatch(fetchSingleUser(id));
  },[]);

  const ele = selectedUser;

  if (loading && !ele) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">Loading profile…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-slate-50">
        <p className="text-sm text-red-500">Error: {error}</p>
        <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
      </div>
    );
  }

  if (!ele) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-slate-50">
        <p className="text-sm text-slate-500">User not found.</p>
        <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
      </div>
    );
  }

  const initials = (ele.username)
    .slice(0, 2)
    .toUpperCase();

  const joined = ele.createdAt
    ? new Date(ele.createdAt).toLocaleDateString()
    : "—";

  // chips data (this is what we loop over – NOT selectedUser)
  const info = [
    {
      icon: Mail,
      label: "Email",
      value: ele.email,
    },
    {
      icon: Phone,
      label: "Phone",
      value: ele.phone,
    },
    {
      icon: Shield,
      label: "Role",
      value: ele.role,
    },
    {
      icon: LogIn,
      label: "Logins",
      value: ele.loginCount ?? 0,
    },
    {
      icon: CalendarDays,
      label: "Joined",
      value: joined,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-3">
        {/* back button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="h-8 w-8 text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>

        {/* MAIN CARD */}
        <Card className="rounded-3xl shadow-md border border-slate-200 bg-white py-6 px-6">
          {/* avatar + name center */}
          <CardHeader className="p-0 flex flex-col items-center">
            <div className="relative h-20 w-20 rounded-full bg-slate-200 flex items-center justify-center text-xl font-semibold text-slate-800 shadow">
              {initials}
            </div>

            <CardTitle className="mt-3 text-xl font-semibold text-slate-900">
              {ele.username}
            </CardTitle>
            <p className="text-xs text-slate-500">{ele.role}</p>
          </CardHeader>

          <CardContent className="mt-5 space-y-4">
            {/* round chips for email / role / phone / logins / joined */}
            <div className="flex flex-wrap justify-center gap-3">
              {info.map(({ icon: Icon, label, value }) => (
                <div
                  key={label}
                  className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-xs"
                >
                  <Icon className="h-3 w-3 text-slate-500" />
                  <div className="flex flex-col leading-tight">
                    <span className="text-[10px] uppercase tracking-wide text-slate-500">
                      {label}
                    </span>
                    <span className="text-[11px] font-medium text-slate-800">
                      {value}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* ID line */}
            <div className="pt-2 flex items-center justify-center gap-2 text-[11px] text-slate-500 border-t border-slate-100 mt-2">
              <Clock className="h-3 w-3" />
              <span className="break-all">ID: {ele._id}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
