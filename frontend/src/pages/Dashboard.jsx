import { useContext, useEffect, useState } from "react";
import UserContext from "../context/User-Context";
import { useNavigate } from "react-router-dom";
import axios from "../config/axios";

// shadcn/ui components
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogHeader, DialogContent, DialogFooter, DialogTitle } from "@/components/ui/dialog";

export default function Dashboard() {
  const { user, isLoggedIn, userDispatch } = useContext(UserContext);

  const handleEdit = async (id, updatedData) => {
    console.log("id", id);
  try {
    const response = await axios.put(
      `/user/account/update/${id}`,
      updatedData, // send the body data here
      { headers: { Authorization: localStorage.getItem("token") } }
    );
    console.log("Updated User:", response.data);
    alert("User updated successfully!");
  } catch (err) {
    console.log("Update failed:", err?.response?.data?.error);
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
            <div>
                <Button onClick={() => {
                    handleEdit(user._id,)
                }}>Edit</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {user.role === "admin" && <AdminPanel />}
    </div>
  );
}

function AdminPanel() {
  const { userDispatch } = useContext(UserContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get("/users", {
        headers: { Authorization: token },
      });
      setUsers(res.data);
      userDispatch({ type: "SET_USERS", payload: res.data });
    } catch (err) {
      console.error("Failed to load users:", err.message);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Users</CardTitle>
        <CardDescription>Admin control panel</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p>Loading users...</p>
        ) : users.length === 0 ? (
          <p>No users found.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u._id}>
                  <TableCell>{u.username}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>{u.phone || "—"}</TableCell>
                  <TableCell className="capitalize">{u.role}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => alert(JSON.stringify(u, null, 2))}
                      >
                        View
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(u);
                          setOpenDialog(true);
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      {/* Delete confirmation dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p>
            Are you sure you want to delete{" "}
            <span className="font-semibold">{selectedUser?.username}</span>?
            This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive">
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
