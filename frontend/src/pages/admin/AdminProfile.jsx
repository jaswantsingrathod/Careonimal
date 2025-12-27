import { useContext, useReducer, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import UserContext from "../../context/User-Context";
import axios from "../../config/axios";
import { toast } from "react-toastify";
import {
  User,
  Mail,
  Phone,
  Shield,
  Edit2,
  LayoutDashboard,
  Users,
  Briefcase,
  Settings
} from "lucide-react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
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

export default function AdminProfile() {
  const { user, userDispatch } = useContext(UserContext);
  const [state, dispatch] = useReducer(reducer, initialState);
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.role !== "admin") {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  const openEditDialog = () => {
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

  const handleUpdate = async (id, updatedData) => {
    const digits = (updatedData.phone || "").replace(/\D/g, "");
    if (digits && digits.length !== 10) {
      toast.error("Phone number must be exactly 10 digits");
      return;
    }
    const phoneToSend = digits ? `+91${digits}` : "";
    const payload = { ...updatedData, phone: phoneToSend };

    try {
      dispatch({ type: "SET_SAVING", payload: true });
      const response = await axios.put(
        `/user/account/update/${id}`,
        payload,
        { headers: { Authorization: localStorage.getItem("token") } }
      );
      userDispatch({ type: "LOGIN", payload: response.data });
      dispatch({ type: "CLOSE_EDIT" });
      toast.success("Admin profile updated!");
    } catch (err) {
      toast.error(err?.response?.data?.error || "Update failed");
    } finally {
      dispatch({ type: "SET_SAVING", payload: false });
    }
  };

  const getInitials = (name) => name?.substring(0, 2).toUpperCase() || "AD";

  if (!user) return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Back to Dashboard */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Link to="/admin/dashboard" className="hover:text-primary transition-colors flex items-center gap-1">
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium">Profile</span>
        </div>

        <div className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-orange-600 to-amber-700 rounded-3xl p-8 text-white shadow-xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-400/20 rounded-full -ml-10 -mb-10 blur-2xl" />

          <div className="relative flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
            <div className="relative group">
              <Avatar className="h-28 w-28 border-4 border-white/30 shadow-2xl transition-transform duration-300 group-hover:scale-105">
                <AvatarImage src={user.profilePicture} />
                <AvatarFallback className="bg-white text-orange-600 font-bold text-3xl">
                  {getInitials(user.username)}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="flex-1 space-y-3">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                  {user.username}
                </h1>
                <Badge className="bg-white/20 hover:bg-white/30 text-white border-none px-3 py-1 backdrop-blur-sm">
                  System Admin
                </Badge>
              </div>
              <p className="text-orange-100 text-lg font-medium opacity-90 max-w-lg">
                High-level system management and platform oversight.
              </p>
            </div>

            <Button
              onClick={openEditDialog}
              size="lg"
              className="bg-white text-orange-700 hover:bg-orange-50 font-bold shadow-lg border-none transition-all active:scale-95"
            >
              <Edit2 className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Personal Info */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-4 border-b border-slate-100 mb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="w-5 h-5 text-orange-600" />
                  Account Credentials
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex items-start gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="p-2.5 bg-orange-100 rounded-lg">
                    <Mail className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Email Address</p>
                    <p className="font-semibold text-slate-700 truncate">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="p-2.5 bg-orange-100 rounded-lg">
                    <Phone className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Mobile Contact</p>
                    <p className="font-semibold text-slate-700">
                      {user.phone || <span className="text-slate-400 italic font-normal">Not configured</span>}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="grid sm:grid-cols-2 gap-6">
              <ManagementCard
                title="User Management"
                description="Monitor all platform users, update statuses, and manage access."
                icon={<Users className="w-8 h-8" />}
                link="/admin/users/list"
                color="bg-blue-500"
              />
              <ManagementCard
                title="Provider Management"
                description="Review service providers, approve registrations, and verify services."
                icon={<Briefcase className="w-8 h-8" />}
                link="/admin/providers/list"
                color="bg-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Edit Dialog */}
        <Dialog open={state.openEdit} onOpenChange={(open) => !open && dispatch({ type: "CLOSE_EDIT" })}>
          <DialogContent className="sm:max-w-md bg-white p-0 overflow-hidden rounded-2xl">
            <DialogHeader className="p-6 bg-slate-50 border-b border-slate-100">
              <DialogTitle className="text-xl flex items-center gap-2 text-slate-800">
                <Edit2 className="w-5 h-5 text-orange-600" />
                Edit Admin Profile
              </DialogTitle>
              <DialogDescription className="text-slate-500">
                Update your administrative account information.
              </DialogDescription>
            </DialogHeader>

            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Username</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    className="w-full h-10 pl-10 pr-4 rounded-lg border border-slate-200 bg-slate-50/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-sm"
                    value={state.editData.username}
                    onChange={(e) => dispatch({ type: "SET_FIELD", field: "username", value: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    className="w-full h-10 pl-10 pr-4 rounded-lg border border-slate-200 bg-slate-50/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-sm"
                    value={state.editData.email}
                    onChange={(e) => dispatch({ type: "SET_FIELD", field: "email", value: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Phone (10 Digits)</label>
                <div className="relative flex items-center">
                  <Phone className="absolute left-3 h-4 w-4 text-slate-400" />
                  <span className="absolute left-10 text-slate-400 text-sm border-r pr-2 border-slate-200">+91</span>
                  <input
                    className="w-full h-10 pl-20 pr-4 rounded-lg border border-slate-200 bg-slate-50/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-sm"
                    placeholder="xxxxxxxxxx"
                    maxLength={10}
                    value={state.editData.phone}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                      dispatch({ type: "SET_FIELD", field: "phone", value: val });
                    }}
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row gap-2">
              <Button variant="ghost" onClick={() => dispatch({ type: "CLOSE_EDIT" })} className="flex-1 text-slate-600">
                Cancel
              </Button>
              <Button
                onClick={() => handleUpdate(user._id, state.editData)}
                disabled={state.saving}
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white shadow-md shadow-orange-200"
              >
                {state.saving ? "Saving Changes..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

function ManagementCard({ title, description, icon, link, color }) {
  return (
    <Link to={link}>
      <Card className="group border-none shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white overflow-hidden h-full">
        <div className="flex h-full">
          <div className={`w-3 ${color} opacity-80 group-hover:opacity-100 transition-opacity`} />
          <div className="p-6 space-y-3">
            <div className={`${color.replace('bg-', 'text-')} p-3 bg-slate-50 rounded-2xl w-fit shadow-inner group-hover:scale-110 transition-transform duration-300`}>
              {icon}
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                {title}
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed mt-2">
                {description}
              </p>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}