import { useEffect, useContext, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchUsers,
  deleteUser,
  fetchSingleUser,
  fetchProvider,
  setSelectedProvider,
} from "../slices/admin-slice";
import { Users, PawPrint, Eye, Trash, Book, LogOut } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import UserContext from "../context/User-Context";
import { useNavigate } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function AdminDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { users, loading, error, providers } = useSelector(
    (state) => state.admin
  );
  const { user, handleLogout } = useContext(UserContext);

  useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchProvider());
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(fetchUsers());
    dispatch(fetchProvider());
  };

  const handleDelete = (id) => {
    dispatch(deleteUser(id));
  };

  const handleView = (record) => {
    if (record.role === "provider") {
      const provider = providers.find((ele) => ele.user?._id === record._id);
      if (!provider) {
        alert("This provider has not completed their provider profile yet.");
        return;
      }
      dispatch(setSelectedProvider(provider));
      navigate(`/admin/provider/${provider._id}`);
    } else {
      dispatch(fetchSingleUser(record._id));
      navigate(`/admin/user/${record._id}`);
    }
  };

  const visibleUsers = users?.filter((ele) => ele._id !== user?._id) ?? [];
  const totalUsers = visibleUsers.filter((ele) => ele.role === "user").length;
  const totalProviders = visibleUsers.filter(
    (ele) => ele.role === "provider"
  ).length;

  if (!user) return <p>Loading...</p>;

  // Sidebar click handlers (minimal — no extra features)
  const goUsers = () => navigate("/admin/users/list");
  const goProviders = () => navigate("/admin/providers/list");
  const goProfile = () => navigate("/admin/profile");

  return (
    <div className="min-h-screen  p-6 cursor-pointer">
      <div className="max-w-7xl mx-auto flex gap-6">
        <aside className="w-64 bg-white border border-slate-200 rounded-lg overflow-hidden sticky top-6">
          <div className="p-4">
            {/* PROFILE CHIP - shadcn Avatar */}
            <div>
              <div>
                <div className="text-sm font-semibold">
                  {"Admin"}
                </div>
                <div className="text-xs text-slate-500 flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                  <span>Online</span>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <Separator />
            </div>

            <ScrollArea className="mt-3 h-[calc(100vh-220px)] pr-2">
              <nav className="flex flex-col gap-1">
                <button
                  onClick={goUsers}
                  className={`flex items-center gap-3 w-full text-sm px-3 py-2 rounded-md transition text-slate-700 hover:bg-slate-50 }`}
                >
                  <Users className="h-5 w-5" />
                  <span>Users</span>
                </button>

                <button
                  onClick={goProviders}
                  className={`flex items-center gap-3 w-full text-sm px-3 py-2 rounded-md transition text-slate-700 hover:bg-slate-50 `}
                >
                  <PawPrint className="h-5 w-5" />
                  <span>Providers</span>
                </button>

                <button
                  onClick={goProfile}
                  className={`flex items-center gap-3 w-full text-sm px-3 py-2 rounded-md transition text-slate-700 hover:bg-slate-50 `}
                >
                  <Book className="h-5 w-5" />
                  <span>Profile</span>
                </button>

                <div className="mt-2 border-t border-slate-100 pt-2">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full text-sm px-3 py-2 rounded-md text-red-600 hover:bg-slate-50"
                  >
                    <LogOut />
                    <span>Logout</span>
                  </button>
                </div>
              </nav>
            </ScrollArea>
          </div>
        </aside>

        {/* MAIN CONTENT (kept exactly as before) */}
        <main className="flex-1">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
              <div className="flex items-center gap-2">
                <Button onClick={handleRefresh} variant="outline" size="sm">
                  Refresh
                </Button>
              </div>
            </div>

            {error && (
              <div className="mb-4 text-red-600">
                Error:{" "}
                {typeof error === "string" ? error : JSON.stringify(error)}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div onClick={() => navigate("/admin/users/list")}>
                <Card className="h-24 w-full sm:w-auto p-2">
                <CardHeader>
                  <CardTitle className="text-sm">
                    <div className="flex flex-row justify-center items-center   gap-2">
                      <Users className="h-7 w-5 text-blue-600" />
                      <span>Total Users</span>
                    </div>
                  </CardTitle>
                  <CardContent>
                    <div className="text-2xl font-bold text-center">
                      {totalUsers}
                    </div>
                  </CardContent>
                </CardHeader>
              </Card>
              </div>

              <div onClick={() => navigate("/admin/providers/list")}>
                <Card className="h-24 w-full sm:w-auto p-2">
                <CardHeader>
                  <CardTitle className="text-sm">
                    <div className="flex flex-row justify-center items-center gap-2">
                      <PawPrint className="h-7 w-5 text-green-600" />
                      <span>Total Providers</span>
                    </div>
                  </CardTitle>
                  <CardContent>
                    <div className="text-2xl font-bold text-center">
                      {totalProviders}
                    </div>
                  </CardContent>
                </CardHeader>
              </Card>
              </div>

              <Card className="h-24 w-full sm:w-auto p-2">
                <CardHeader>
                  <CardTitle className="text-sm">
                    <div className="flex flex-row justify-center items-center gap-2">
                      <Book className="h-7 w-5 text-purple-600" />
                      <span>Total Bookings</span>
                    </div>
                  </CardTitle>
                  <CardContent>
                    <div className="text-2xl font-bold text-center">34</div>
                  </CardContent>
                </CardHeader>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Users</CardTitle>
                <div className="text-xs text-gray-500 mt-1">
                  {loading
                    ? "Loading..."
                    : `${totalUsers} user(s) returned from API`}
                </div>
              </CardHeader>

              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs text-black">
                        <th className="py-2">Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Joined</th>
                        {user?.role == "admin" && <th>Action</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {!loading && visibleUsers?.length === 0 && (
                        <tr>
                          <td
                            colSpan={4}
                            className="py-6 text-center text-gray-500"
                          >
                            No users found
                          </td>
                        </tr>
                      )}

                      {visibleUsers?.map((ele) => (
                        <tr key={ele._id} className="border-t">
                          <td className="py-3">{ele.username}</td>
                          <td>{ele.email}</td>
                          <td>{ele.role}</td>
                          <td>
                            {ele.createdAt
                              ? new Date(ele.createdAt).toLocaleDateString()
                              : "—"}
                          </td>
                          <td className="px-4 py-2 border text-center">
                            <button
                              className="px-3 py-1 bg-blue text-black-500 rounded-md hover:bg-blue-300 transition"
                              onClick={() => handleView(ele)}
                            >
                              <Eye />
                            </button>

                            {user.role === "admin" && user._id !== ele._id && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <button className="px-3 py-1 bg-blue text-red-500 rounded-md hover:bg-gray-700 transition">
                                    <Trash />
                                  </button>
                                </AlertDialogTrigger>

                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Are you sure?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This action cannot be undone. This will
                                      permanently delete the user.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>

                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Cancel
                                    </AlertDialogCancel>

                                    <AlertDialogAction
                                      onClick={() => handleDelete(ele._id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </td>
                        </tr>
                      ))}

                      {loading && (
                        <tr>
                          <td
                            colSpan={4}
                            className="py-6 text-center text-gray-400"
                          >
                            Loading...
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
