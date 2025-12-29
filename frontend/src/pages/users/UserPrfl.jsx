import { useContext, useReducer, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UserContext from "../../context/User-Context";
import axios from "../../config/axios";
import { toast } from "react-toastify";

import { User, Mail, Phone, ShieldCheck, Edit2 } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogHeader,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const initialState = {
  openEdit: false,
  saving: false,
  editData: { email: "", username: "", phone: "" },
};

function reducer(state, action) {
  switch (action.type) {
    case "OPEN_EDIT":
      return { ...state, openEdit: true, saving: false, editData: action.payload };
    case "CLOSE_EDIT":
      return { ...state, openEdit: false, saving: false };
    case "SET_FIELD":
      return { ...state, editData: { ...state.editData, [action.field]: action.value } };
    case "SET_SAVING":
      return { ...state, saving: action.payload };
    default:
      return state;
  }
}

export default function UserPrfl() {
  const { user, userDispatch } = useContext(UserContext);
  const [state, dispatch] = useReducer(reducer, initialState);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    if (user.role === "provider") navigate("/provider/dashboard", { replace: true });
    if (user.role === "admin") navigate("/admin/dashboard", { replace: true });
  }, [user, navigate]);

  const openEditForUser = () => {
    const digits = (user.phone || "").replace(/\D/g, "").slice(-10);
    dispatch({
      type: "OPEN_EDIT",
      payload: { email: user.email, username: user.username, phone: digits },
    });
  };

  const handleEdit = async (id, updatedData) => {
    const digits = updatedData.phone.replace(/\D/g, "");
    if (digits.length !== 10) {
      toast.error("Phone number must be 10 digits");
      return;
    }

    try {
      dispatch({ type: "SET_SAVING", payload: true });
      const res = await axios.put(
        `/user/account/update/${id}`,
        { ...updatedData, phone: `+91${digits}` },
        { headers: { Authorization: localStorage.getItem("token") } }
      );
      userDispatch({ type: "LOGIN", payload: res.data });
      dispatch({ type: "CLOSE_EDIT" });
      toast.success("Profile updated");
    } catch (err) {
      toast.error("Update failed");
    } finally {
      dispatch({ type: "SET_SAVING", payload: false });
    }
  };

  if (!user) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (user.role !== "user") return null;

  const initials = user.username?.slice(0, 2).toUpperCase() || "US";

  return (
    <div className="min-h-screen px-4 sm:px-6 py-6 sm:py-10">
      <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">

        {/* HEADER */}
        <div className="rounded-3xl bg-gradient-to-r from-orange-100 to-orange-50
                        border border-orange-200 shadow-md
                        p-4 sm:p-6 flex flex-col sm:flex-row
                        sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 sm:h-20 sm:w-20 border-4 border-orange-400 shadow">
              <AvatarImage src={user.avatar} />
              <AvatarFallback className="bg-orange-500 text-white text-lg sm:text-xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div>
              <h1 className="text-xl sm:text-3xl font-bold text-slate-900">
                Welcome, {user.username}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600">
                Manage your profile and account settings
              </p>
            </div>
          </div>

          <Button
            onClick={openEditForUser}
            className="bg-orange-500 hover:bg-orange-600 text-white
                       rounded-full px-5 py-2 w-full sm:w-auto"
          >
            <Edit2 className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">

          {/* PERSONAL */}
          <Card className="rounded-3xl border border-orange-200 shadow-md">
            <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
                <User className="w-5 h-5 text-orange-600" />
                Personal Details
              </h2>

              <DetailRow icon={Mail} label="Email" value={user.email} />
              <DetailRow icon={Phone} label="Phone" value={user.phone || "Not provided"} />
              <DetailRow icon={User} label="Username" value={user.username} />
            </CardContent>
          </Card>

          {/* STATUS */}
          <Card className="rounded-3xl border border-orange-200 shadow-md">
            <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-orange-600" />
                Account Status
              </h2>

              <div className="flex justify-between items-center bg-orange-50
                              border border-orange-200 rounded-2xl px-4 py-3">
                <span className="text-sm">Account Role</span>
                <span className="px-3 py-1 rounded-full bg-orange-200 text-orange-800 text-xs font-semibold capitalize">
                  {user.role}
                </span>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-2xl px-4 py-3 text-sm text-green-700">
                Account is active
              </div>
            </CardContent>
          </Card>
        </div>

        {/* EDIT  */}
        <Dialog open={state.openEdit} onOpenChange={(o) => !o && dispatch({ type: "CLOSE_EDIT" })}>
          <DialogContent className="max-w-md w-[95%] sm:w-full">
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
              <DialogDescription>Update your details</DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
              <input
                className="w-full rounded-xl border border-orange-200 bg-orange-50 px-3 py-2 text-sm"
                value={state.editData.email}
                onChange={(e) => dispatch({ type: "SET_FIELD", field: "email", value: e.target.value })}
              />
              <input
                className="w-full rounded-xl border border-orange-200 bg-orange-50 px-3 py-2 text-sm"
                value={state.editData.username}
                onChange={(e) => dispatch({ type: "SET_FIELD", field: "username", value: e.target.value })}
              />
              <input
                className="w-full rounded-xl border border-orange-200 bg-orange-50 px-3 py-2 text-sm"
                maxLength={10}
                value={state.editData.phone}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, "");
                  if (v.length <= 10) dispatch({ type: "SET_FIELD", field: "phone", value: v });
                }}
              />
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button variant="outline" className="w-full sm:w-auto"
                onClick={() => dispatch({ type: "CLOSE_EDIT" })}>
                Cancel
              </Button>
              <Button
                className="bg-orange-500 hover:bg-orange-600 text-white w-full sm:w-auto"
                disabled={state.saving}
                onClick={() => handleEdit(user._id, state.editData)}
              >
                {state.saving ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
}

function DetailRow({ icon: Icon, label, value }) {
  return (
    <div className="flex justify-between items-center bg-orange-50 border border-orange-200 rounded-2xl px-4 py-3">
      <div className="flex items-center gap-2 text-sm text-slate-600">
        <Icon className="w-4 h-4 text-orange-600" />
        {label}
      </div>
      <span className="text-sm font-medium text-slate-900 break-all">
        {value}
      </span>
    </div>
  );
}
