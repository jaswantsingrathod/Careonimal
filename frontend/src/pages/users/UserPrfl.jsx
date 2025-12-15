import { useContext, useReducer, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UserContext from "../../context/User-Context";
import axios from "../../config/axios";
import { toast } from "react-toastify";
import { User, Mail, Phone, Shield, Edit2 } from "lucide-react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogHeader,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

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
      toast.error("Phone number must be exactly 10 digits");
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
      toast.success("Profile updated successfully!");
      dispatch({ type: "CLOSE_EDIT" });
    } catch (err) {
      toast.error(err?.response?.data?.error || "Update failed");
    } finally {
      dispatch({ type: "SET_SAVING", payload: false });
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen  py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* HEADER */}
        <div className="bg-gradient-to-r from-orange-100 to-transparent p-6 rounded-2xl border border-orange-200">
          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
              <AvatarImage src={user.profilePicture} />
              <AvatarFallback className="text-2xl font-bold bg-orange-500 text-white">
                {user.username.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <h1 className="text-3xl font-bold text-orange-900">
                Welcome, {user.username}
              </h1>
              <p className="text-orange-700 text-sm">
                Manage your profile and account settings
              </p>
            </div>

            <Button
              onClick={openEditForUser}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              <Edit2 className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          </div>
        </div>

        {/* CARDS */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-orange-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-700">
                <User className="w-5 h-5" /> Personal Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4 p-3 rounded-lg bg-orange-100">
                <Mail className="w-4 h-4 text-orange-600" />
                <div>
                  <p className="text-xs text-orange-600 uppercase">Email</p>
                  <p className="font-medium text-orange-900">{user.email}</p>
                </div>
              </div>

              <div className="flex gap-4 p-3 rounded-lg bg-orange-100">
                <Phone className="w-4 h-4 text-orange-600" />
                <div>
                  <p className="text-xs text-orange-600 uppercase">Phone</p>
                  <p className="font-medium text-orange-900">
                    {user.phone || "Not provided"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-orange-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-700">
                <Shield className="w-5 h-5" /> Account Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center bg-orange-100 p-3 rounded-lg">
                <span className="font-medium text-orange-800">Role</span>
                <Badge className="bg-orange-500 text-white capitalize">
                  {user.role}
                </Badge>
              </div>

              <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg text-center text-orange-700 text-sm">
                Your account is active
              </div>
            </CardContent>
          </Card>
        </div>

        {/* EDIT DIALOG */}
        <Dialog open={state.openEdit} onOpenChange={() => dispatch({ type: "CLOSE_EDIT" })}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-orange-700">Edit Profile</DialogTitle>
              <DialogDescription>Update your details</DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
              {["email", "username"].map((field) => (
                <input
                  key={field}
                  className="w-full border border-orange-300 rounded-md p-2 focus:ring-2 focus:ring-orange-400"
                  value={state.editData[field]}
                  onChange={(e) =>
                    dispatch({ type: "SET_FIELD", field, value: e.target.value })
                  }
                />
              ))}

              <input
                type="tel"
                maxLength={10}
                value={state.editData.phone}
                onChange={(e) =>
                  dispatch({
                    type: "SET_FIELD",
                    field: "phone",
                    value: e.target.value.replace(/\D/g, "").slice(0, 10),
                  })
                }
                className="w-full border border-orange-300 rounded-md p-2 focus:ring-2 focus:ring-orange-400"
                placeholder="10 digit mobile number"
              />
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => dispatch({ type: "CLOSE_EDIT" })}>
                Cancel
              </Button>
              <Button
                onClick={() => handleEdit(user._id, state.editData)}
                className="bg-orange-500 hover:bg-orange-600 text-white"
                disabled={state.saving}
              >
                {state.saving ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
