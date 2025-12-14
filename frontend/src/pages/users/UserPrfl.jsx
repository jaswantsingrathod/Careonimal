import { useContext, useReducer, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UserContext from "../../context/User-Context";
import axios from "../../config/axios";
import { toast } from "react-toastify";

// shadcn components
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
      return {
        ...state,
        openEdit: true,
        saving: false,
        editData: action.payload,
      };
    case "CLOSE_EDIT":
      return { ...state, openEdit: false, saving: false };
    case "SET_FIELD":
      return {
        ...state,
        editData: { ...state.editData, [action.field]: action.value },
      };
    case "SET_SAVING":
      return { ...state, saving: action.payload };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

export default function UserPrfl() {
  const { user, userDispatch } = useContext(UserContext);
  const [state, dispatch] = useReducer(reducer, initialState);
  const navigate = useNavigate();

  // redirect providers / admins away from this page
  useEffect(() => {
    if (!user) return;
    if (user.role === "provider") {
      navigate("/provider/dashboard", { replace: true });
    } else if (user.role === "admin") {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [user, navigate]);

  const openEditForUser = () => {
    const digits = (user.phone || "").replace(/\D/g, "").slice(-10);
    dispatch({
      type: "OPEN_EDIT",
      payload: {
        email: user.email,
        username: user.username,
        phone: digits,
      },
    });
  };

  const handleEdit = async (id, updatedData) => {
    const digits = (updatedData.phone || "").replace(/\D/g, "");
    if (digits.length !== 10) {
      alert("Phone number must be exactly 10 digits");
      return;
    }
    const phoneToSend = `+91${digits}`;
    const payload = { ...updatedData, phone: phoneToSend };
    try {
      dispatch({ type: "SET_SAVING", payload: true });
      const response = await axios.put(`/user/account/update/${id}`, payload, {
        headers: { Authorization: localStorage.getItem("token") },
      });
      userDispatch({ type: "LOGIN", payload: response.data });
      dispatch({ type: "CLOSE_EDIT" });
      toast.success("User updated successfully!");
    } catch (err) {
      alert(err?.response?.data?.error || "Update failed");
    } finally {
      dispatch({ type: "SET_SAVING", payload: false });
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-500">
        Loading Dashboard...
      </div>
    );
  }

  if (user.role !== "user") return null;

  const initials = user.username?.slice(0, 2).toUpperCase() || "US";
  const joined = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-IN")
    : "—";

  return (
    <div className="min-h-screen px-6 py-10">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* ===== TOP HEADER CARD ===== */}
        <div
          className="rounded-3xl bg-gradient-to-r from-orange-100 to-orange-50
                      border border-orange-200 shadow-md
                      px-8 py-6 flex items-center justify-between"
        >
          <div className="flex items-center gap-6">
            <Avatar className="h-20 w-20 border-4 border-orange-400 shadow">
              <AvatarImage src={user.avatar} />
              <AvatarFallback className="bg-orange-500 text-white text-xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Hello, {user.username}!
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                Manage your profile and account settings
              </p>
            </div>
          </div>

          <Button
            className="bg-orange-500 hover:bg-orange-600 text-white
                     rounded-full px-6 py-3 shadow"
            onClick={openEditForUser}
          >
            Edit Profile
          </Button>
        </div>

        {/* CONTENT GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* PERSONAL DETAILS */}
          <Card className="rounded-3xl shadow-md border border-orange-200">
            <CardContent className="p-6 space-y-6">
              <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                👤 Personal Details
              </h2>

              <DetailRow label="Email" value={user.email} />
              <DetailRow label="Phone" value={user.phone || "Not provided"} />
              <DetailRow label="Username" value={user.username} />
            </CardContent>
          </Card>

          {/* ACCOUNT STATUS */}
          <Card className="rounded-3xl shadow-md border border-orange-200">
            <CardContent className="p-6 space-y-6">
              <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                🛡️ Account Status
              </h2>

              <div
                className="flex items-center justify-between bg-orange-50
                            border border-orange-200 rounded-2xl px-4 py-3"
              >
                <span className="text-sm text-slate-700">Account Role</span>
                <span
                  className="px-3 py-1 rounded-full bg-orange-200
                               text-orange-800 text-xs font-semibold capitalize"
                >
                  {user.role}
                </span>
              </div>

              <div
                className="rounded-2xl bg-green-50 border border-green-200
                            px-4 py-3 text-sm text-green-700"
              >
                ✅ Your account is active
              </div>
            </CardContent>
          </Card>
        </div>

        {/* EDIT DIALOG */}
        <Dialog
          open={state.openEdit}
          onOpenChange={(open) => {
            if (!open) dispatch({ type: "CLOSE_EDIT" });
          }}
        >
          <DialogContent className="max-w-md border border-orange-200 bg-white">
            <DialogHeader>
              <DialogTitle>Edit profile</DialogTitle>
              <DialogDescription>
                Update your information and save.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 mt-2">
              <input
                className="w-full rounded-xl border border-orange-200 bg-orange-50
                         px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-300"
                value={state.editData.email}
                onChange={(e) =>
                  dispatch({
                    type: "SET_FIELD",
                    field: "email",
                    value: e.target.value,
                  })
                }
                placeholder="Email"
              />

              <input
                className="w-full rounded-xl border border-orange-200 bg-orange-50
                         px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-300"
                value={state.editData.username}
                onChange={(e) =>
                  dispatch({
                    type: "SET_FIELD",
                    field: "username",
                    value: e.target.value,
                  })
                }
                placeholder="Username"
              />

              <input
                className="w-full rounded-xl border border-orange-200 bg-orange-50
                         px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-300"
                type="tel"
                maxLength={10}
                value={state.editData.phone}
                placeholder="Phone"
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");
                  if (val.length <= 10) {
                    dispatch({
                      type: "SET_FIELD",
                      field: "phone",
                      value: val,
                    });
                  }
                }}
              />
            </div>

            <DialogFooter className="mt-4 flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => dispatch({ type: "CLOSE_EDIT" })}
              >
                Cancel
              </Button>
              <Button
                className="bg-orange-500 hover:bg-orange-600 text-white"
                onClick={() => handleEdit(user._id, state.editData)}
                disabled={state.saving}
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

function DetailRow({ label, value }) {
  return (
    <div className="flex justify-between items-center bg-orange-50
                    border border-orange-200 rounded-2xl px-4 py-3">
      <span className="text-sm text-slate-600">{label}</span>
      <span className="text-sm font-medium text-slate-900 break-all">
        {value}
      </span>
    </div>
  );
}

