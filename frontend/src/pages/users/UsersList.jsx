import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchUsers, deleteUser, fetchSingleUser } from "../../slices/admin-slice";
import { Eye, Trash, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

// shadcn UI
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// shadcn Table
import {
  Table,
  TableBody,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "@/components/ui/table";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function UsersList() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { users = [], loading } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  // delete confirmed from Dialog
  const handleDelete = (id) => {
    dispatch(deleteUser(id))
      .then(() => {
        toast.success("User deleted");
        dispatch(fetchUsers());
      })
      .catch((err) => {
        console.error("delete failed", err);
        toast.error(err?.message || "Failed to delete user");
      });
  };

  const handleView = (ele) => {
    dispatch(fetchSingleUser(ele._id));
    navigate(`/admin/user/${ele._id}`);
  };

  // only plain users
  const filteredUsers = (users || []).filter((ele) => ele.role === "user");

  return (
    <Card className="w-[90%] fixed left-[65px] z-20 shadow-sm rounded-2xl border border-slate-200">
      <CardHeader>
        <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-xs"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go back
            </Button>
        <CardTitle className="text-lg font-bold text-slate-800 text-center">Users</CardTitle>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="text-sm text-slate-600">
              <TableHead className="w-[120px]">Username</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="hidden md:table-cell">Role</TableHead>
              <TableHead className="hidden lg:table-cell">Joined</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {!loading && filteredUsers.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-6 text-center text-slate-500">
                  No users found.
                </TableCell>
              </TableRow>
            )}

            {filteredUsers.map((ele) => (
              <TableRow key={ele._id} className="hover:bg-slate-50 transition">
                <TableCell className="font-medium">{ele.username}</TableCell>

                <TableCell className="text-sm text-slate-700">{ele.email}</TableCell>

                <TableCell className="hidden md:table-cell">{ele.role}</TableCell>

                <TableCell className="hidden lg:table-cell">
                  {ele.createdAt ? new Date(ele.createdAt).toLocaleDateString() : "—"}
                </TableCell>

                <TableCell className="flex items-center justify-end gap-2">
                  <Button
                    className="px-3 py-1 bg-blue text-black-500 rounded-md hover:bg-blue-300 transition"
                    onClick={() => handleView(ele)}
                    aria-label={`View ${ele.username}`}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>

                  {/* Delete with shadcn Dialog (uncontrolled) */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        className="px-3 py-1 bg-blue text-red-500 rounded-md hover:bg-gray-700 transition"
                        aria-label={`Delete ${ele.username}`}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>

                    <DialogContent className="sm:max-w-sm">
                      <DialogHeader>
                        <DialogTitle>Delete user?</DialogTitle>
                        <DialogDescription>
                          Deleting <b>{ele.username}</b> will permanently remove this account.
                        </DialogDescription>
                      </DialogHeader>

                      <DialogFooter className="flex justify-end gap-2 pt-4">
                        <DialogClose asChild>
                          <Button variant="outline" size="sm">Cancel</Button>
                        </DialogClose>

                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(ele._id)}
                        >
                          Delete
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>

          <TableFooter />
        </Table>
      </CardContent>
    </Card>
  );
}
