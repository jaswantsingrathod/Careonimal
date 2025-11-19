import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchUsers, deleteUser, fetchSingleUser } from "../slices/admin-slice";
import { Eye, Trash } from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  Table,
  TableBody,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "@/components/ui/table";

export default function UsersList() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { users, loading } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const handleDelete = (id) => {
    const ok = window.confirm("Are you sure?");
    if (!ok) return;
    dispatch(deleteUser(id));
  };

  const handleView = (ele) => {
    dispatch(fetchSingleUser(ele._id));
    navigate(`/admin/user/${ele._id}`);
  };

  // ➜ ONLY USERS WITH ROLE == "user"
  const filteredUsers = users.filter((ele) => ele.role === "user");

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Username</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Joined</TableHead>
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
            <TableRow key={ele._id}>
              <TableCell className="font-medium">{ele.username}</TableCell>
              <TableCell>{ele.email}</TableCell>
              <TableCell>{ele.role}</TableCell>
              <TableCell>
                {ele.createdAt ? new Date(ele.createdAt).toLocaleDateString() : "—"}
              </TableCell>
              <TableCell className="flex items-center justify-end gap-2">
                <button
                  onClick={() => handleView(ele)}
                  className="px-3 py-1 bg-blue text-black-500 rounded-md hover:bg-blue-300 transition"
                >
                  <Eye />
                </button>

                <button
                  onClick={() => handleDelete(ele._id)}
                  className="px-3 py-1 bg-blue text-red-500 rounded-md hover:bg-gray-700 transition"
                >
                  <Trash />
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>

        <TableFooter />
      </Table>
    </div>
  );
}
