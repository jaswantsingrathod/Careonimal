import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchProvider, deleteUser } from "../../slices/admin-slice";
import { Eye, Trash, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Pagination from "../../components/Pagination";

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

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "@/components/ui/table";

import { toast } from "react-toastify";

export default function ProviderList() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { providers, loading, pagination } = useSelector(
    (state) => state.admin
  );

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const limit = 5;

  useEffect(() => {
    dispatch(fetchProvider({ page, limit, search }));
  }, [dispatch, page, search]);

  const handleDeleteConfirmed = (id) => {
    dispatch(deleteUser(id))
      .unwrap()
      .then(() => {
        toast.success("Provider deleted successfully");
        dispatch(fetchProvider({ page, limit, search }));
      })
      .catch((err) => {
        toast.error(err || "Delete failed");
      });
  };

  return (
    <div className="px-3 py-4 sm:px-6 sm:py-6">
      <Card className="rounded-2xl border border-slate-200 shadow-sm">
        {/* HEADER */}
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button
            variant="ghost"
            size="sm"
            className="w-fit"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go back
          </Button>

          <CardTitle className="text-lg font-bold text-slate-800">
            Providers
          </CardTitle>

          <div className="text-xs text-slate-500">
            Total: {pagination?.total ?? 0}
          </div>
        </CardHeader>

        {/* CONTENT */}
        <CardContent className="flex flex-col h-[70vh]">
          {/* TABLE */}
          <div className="flex-1 overflow-x-auto overflow-y-auto rounded-lg border">
            <Table className="text-sm sm:text-base">
              <TableHeader className="sticky top-0 bg-slate-50 z-10">
                <TableRow className="text-slate-600">
                  <TableHead>Business</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {!loading && providers.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="py-10 text-center text-slate-500"
                    >
                      No providers found.
                    </TableCell>
                  </TableRow>
                )}

                {providers.map((p) => (
                  <TableRow
                    key={p._id}
                    className="hover:bg-slate-50 transition"
                  >
                    <TableCell className="font-medium break-all sm:break-normal">
                      {p.businessName}
                    </TableCell>

                    <TableCell className="break-all sm:break-normal">
                      {p.user?.username}
                    </TableCell>

                    <TableCell className="break-all sm:break-normal">
                      {p.user?.email}
                    </TableCell>

                    <TableCell>
                      {p.approvedByAdmin ? (
                        <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs">
                          Verified
                        </Badge>
                      ) : (
                        <Badge className="bg-red-50 text-red-700 border border-red-200 text-xs">
                          Pending
                        </Badge>
                      )}
                    </TableCell>

                    <TableCell className="flex flex-wrap justify-end gap-2">
                      {/* VIEW */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/admin/${p._id}/provider`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>

                      {/* DELETE */}
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="destructive">
                            <Trash className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>

                        <DialogContent className="sm:max-w-sm">
                          <DialogHeader>
                            <DialogTitle>Delete provider?</DialogTitle>
                            <DialogDescription>
                              This will permanently remove{" "}
                              <b>{p.businessName}</b>.
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
                                handleDeleteConfirmed(p.user?._id)
                              }
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
            totalPages={Math.max(pagination?.totalPages || 1, 1)}
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
