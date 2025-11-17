import { useContext, useReducer } from "react";
import UserContext from "../context/User-Context";
import axios from "../config/axios";

// shadcn components
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
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

export default function Dashboard() {
  const { user, userDispatch } = useContext(UserContext);
  const [state, dispatch] = useReducer(reducer, initialState);

  const openEditForUser = () => {
    dispatch({
      type: "OPEN_EDIT",
      payload: {
        email: user.email,
        username: user.username,
        phone: user.phone,
      },
    });
  };

  const handleEdit = async (id, updatedData) => {
    if (!/^\d{10}$/.test(updatedData.phone)) {
      alert("Phone number must be exactly 10 digits");
      return;
    }
    try {
      dispatch({ type: "SET_SAVING", payload: true });
      const response = await axios.put(
        `/user/account/update/${id}`,
        updatedData,
        { headers: { Authorization: localStorage.getItem("token") } }
      );
      userDispatch({ type: "LOGIN", payload: response.data });
      dispatch({ type: "CLOSE_EDIT" });
      alert("User updated successfully!");
    } catch (err) {
      console.log("Update failed:", err?.response?.data?.error || err.message);
      alert(err?.response?.data?.error || "Update failed");
    } finally {
      dispatch({ type: "SET_SAVING", payload: false });
    }
  };

  if (!user)
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-500">
        Loading Dashboard...
      </div>
    );

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Welcome, {user.username}</CardTitle>
          <CardDescription>Here’s your account overview</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <p className="text-gray-600 text-sm">Email</p>
              <p className="font-medium">{user.email}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Phone</p>
              <p className="font-medium">{user.phone || "Not provided"}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Role</p>
              <p className="capitalize font-medium">{user.role}</p>
            </div>
          </div>

          <div className="mt-4">
            <Button onClick={openEditForUser}>Edit Profile</Button>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog
        open={state.openEdit}
        onOpenChange={(open) => {
          if (!open) dispatch({ type: "CLOSE_EDIT" });
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>Update your account information below and click save.</DialogDescription>
          </DialogHeader>

          <label className="block">
            <span className="text-sm text-gray-600">Email</span>
            <input
              className="w-full border rounded px-3 py-2 mt-1"
              value={state.editData.email ?? ""}
              onChange={(e) => dispatch({ type: "SET_FIELD", field: "email", value: e.target.value })}
            />
          </label>

          <div className="space-y-3 mt-4">
            <label className="block">
              <span className="text-sm text-gray-600">Username</span>
              <input
                className="w-full border rounded px-3 py-2 mt-1"
                value={state.editData.username ?? ""}
                onChange={(e) => dispatch({ type: "SET_FIELD", field: "username", value: e.target.value })}
              />
            </label>

            <label className="block">
              <span className="text-sm text-gray-600">Phone</span>
              <input
                className="w-full border rounded px-3 py-2 mt-1"
                type="tel"
                inputMode="numeric"
                maxLength={10}
                pattern="[0-9]{10}"
                placeholder="Enter 10 digit number"
                value={state.editData.phone ?? ""}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");
                  if (val.length <= 10) {
                    dispatch({ type: "SET_FIELD", field: "phone", value: val });
                  }
                }}
              />
            </label>
          </div>

          <DialogFooter className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => dispatch({ type: "CLOSE_EDIT" })}>Cancel</Button>
            <Button onClick={() => handleEdit(user._id, state.editData)} disabled={state.saving}>
              {state.saving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
