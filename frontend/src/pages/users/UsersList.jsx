import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchUsers,
  deleteUser,
  fetchSingleUser,
} from "../../slices/admin-slice";
import { Eye, Trash, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Pagination from "../../components/Pagination";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import {
  Table,
  TableBody,
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

export default function UsersList() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    users = [],
    loading,
    usersPagination,
  } = useSelector((state) => state.admin);

  const [page, setPage] = useState(1);
  const limit = 5;
  const [search, setSearch] = useState("");

  useEffect(() => {
    dispatch(fetchUsers({ page, limit, search }));
  }, [dispatch, page, search]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const handleDelete = (id) => {
    dispatch(deleteUser(id))
      .then(() => {
        toast.success("User deleted");
        dispatch(fetchUsers({ page, limit }));
      })
      .catch(() => toast.error("Failed to delete user"));
  };

  const handleView = (ele) => {
    dispatch(fetchSingleUser(ele._id));
    navigate(`/admin/user/${ele._id}`);
  };

  const filteredUsers = users;

  return (
    <div className="px-3 py-4 sm:px-6 sm:py-6">
      <Card className="rounded-2xl border border-slate-200 shadow-sm">
        {/* HEADER */}
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs w-fit"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go back
          </Button>

          <CardTitle className="text-lg font-bold text-slate-800">
            Users
          </CardTitle>

          <div className="text-xs text-slate-500"></div>
        </CardHeader>

        <CardContent className="flex flex-col h-[70vh]">
          {/* TABLE SCROLL  */}
          <div className="flex-1 overflow-x-auto overflow-y-auto rounded-lg border">
            <Table className="text-sm sm:text-base">
              <TableHeader className="sticky top-0 bg-slate-50 z-10">
                <TableRow className="text-sm text-slate-600">
                  <TableHead className="w-[160px]">Username</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="hidden md:table-cell">Role</TableHead>
                  <TableHead className="hidden lg:table-cell">Joined</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {!loading && filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="py-10 text-center text-slate-500"
                    >
                      No users found.
                    </TableCell>
                  </TableRow>
                )}

                {filteredUsers.map((ele) => (
                  <TableRow
                    key={ele._id}
                    className="hover:bg-slate-50 transition"
                  >
                    <TableCell className="font-medium break-all sm:break-normal">
                      {ele.username}
                    </TableCell>

                    <TableCell className="text-sm text-slate-700 break-all sm:break-normal">
                      {ele.email}
                    </TableCell>

                    <TableCell className="hidden md:table-cell capitalize">
                      {ele.role}
                    </TableCell>

                    <TableCell className="hidden lg:table-cell">
                      {ele.createdAt
                        ? new Date(ele.createdAt).toLocaleDateString()
                        : "—"}
                    </TableCell>

                    <TableCell className="flex flex-wrap justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleView(ele)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="px-2"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>

                        <DialogContent className="sm:max-w-sm">
                          <DialogHeader>
                            <DialogTitle>Delete user?</DialogTitle>
                            <DialogDescription>
                              This will permanently remove <b>{ele.username}</b>
                              .
                            </DialogDescription>
                          </DialogHeader>

                          <DialogFooter className="gap-2 pt-4">
                            <DialogClose asChild>
                              <Button variant="outline" size="sm">
                                Cancel
                              </Button>
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
            </Table>
          </div>

          {/* PAGINATION */}
          <Pagination
            page={page}
            totalPages={Math.max(usersPagination?.totalPages || 1, 1)}
            search={search}
            onSearchChange={setSearch}
            onPageChange={setPage}
            className="mt-3 sm:mt-4"
          />
        </CardContent>
      </Card>
    </div>
  );
}
