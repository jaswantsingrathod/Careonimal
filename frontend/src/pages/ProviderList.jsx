import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchUsers,
  deleteUser,
  setSelectedProvider,
  fetchProvider,
} from "../slices/admin-slice";
import { Eye, Trash } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
  DialogFooter,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";

import { toast } from "react-toastify";

export default function ProviderList() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { users = [], loading, providers = [] } = useSelector(
    (state) => state.admin
  );

  useEffect(() => {
    dispatch(fetchProvider());
    dispatch(fetchUsers());
  }, [dispatch]);

  // Confirm delete → delete → toast → refresh
  const handleDeleteConfirmed = (id) => {
    dispatch(deleteUser(id))
      .then(() => {
        toast.success("User deleted successfully");
        dispatch(fetchUsers());
        dispatch(fetchProvider());
      })
      .catch((err) => {
        toast.error(err?.message || "Delete failed");
      });
  };

  const handleView = (ele) => {
    const provider = providers.find((p) => p.user?._id === ele._id);
    if (!provider) {
      toast.info("This provider has not completed their profile.");
      return;
    }
    dispatch(setSelectedProvider(provider));
    navigate(`/admin/provider/${provider._id}`);
  };

  const filteredUsers = users.filter((ele) => ele.role === "provider");

  return (
    <Card className="w-full shadow-sm rounded-2xl border border-slate-200">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-center text-slate-800">
          Providers List
        </CardTitle>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="text-sm text-slate-600">
              <TableHead className="w-[120px]">Username</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="hidden md:table-cell">Role</TableHead>
              <TableHead className="hidden lg:table-cell">Joined</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {!loading && filteredUsers.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-6 text-center text-slate-500"
                >
                  No providers found.
                </TableCell>
              </TableRow>
            )}

            {filteredUsers.map((ele) => {
              const provider = providers.find(
                (p) => p.user?._id === ele._id
              );

              return (
                <TableRow
                  key={ele._id}
                  className="hover:bg-slate-50 transition"
                >
                  <TableCell className="font-medium">
                    {ele.username}
                  </TableCell>

                  <TableCell>{ele.email}</TableCell>

                  <TableCell className="hidden md:table-cell">
                    {ele.role}
                  </TableCell>

                  <TableCell className="hidden lg:table-cell">
                    {ele.createdAt
                      ? new Date(ele.createdAt).toLocaleDateString()
                      : "—"}
                  </TableCell>

                  <TableCell>
                    {provider ? (
                      provider.approvedByAdmin ? (
                        <Badge variant="secondary" 
                         className="text-[11px] border-emerald-100 bg-emerald-50 text-emerald-700"
                        >
                          Verified</Badge>
                      ) : (
                        <Badge variant="outline" 
                        className="text-[11px] border-red-100 bg-red-50 text-red-700"
                        >
                          Pending</Badge>
                      )
                    ) : (
                      <span className="text-xs text-slate-500">
                        No profile
                      </span>
                    )}
                  </TableCell>

                  <TableCell className="flex items-center justify-end gap-2">
                    {/* VIEW */}
                    <Button
                      className="px-3 py-1 bg-blue text-black-500 rounded-md hover:bg-blue-300 transition"
                      onClick={() => handleView(ele)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>

                    {/* DELETE with shadcn dialog */}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          className="px-3 py-1 bg-blue text-red-500 rounded-md hover:bg-gray-700 transition"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>

                      <DialogContent className="sm:max-w-sm">
                        <DialogHeader>
                          <DialogTitle>Delete user?</DialogTitle>
                          <DialogDescription>
                            This will permanently delete{" "}
                            <b>{ele.username}</b>. as Provider
                          </DialogDescription>
                        </DialogHeader>

                        <DialogFooter className="pt-4 flex justify-end gap-2">
                          <DialogClose asChild>
                            <Button variant="outline" size="sm">
                              Cancel
                            </Button>
                          </DialogClose>

                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() =>
                              handleDeleteConfirmed(ele._id)
                            }
                          >
                            Delete
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>

          <TableFooter />
        </Table>
      </CardContent>
    </Card>
  );
}
