import { useEffect, useContext, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchUsers,
  deleteUser,
  fetchSingleUser,
  fetchProvider,
  setSelectedProvider,
} from "../../slices/admin-slice";
import { Users, PawPrint, Eye, Trash, Book, LogOut } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import UserContext from "../../context/User-Context";
import { useNavigate } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
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

export default function AdminDasboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { users, loading, error, providers = [] } = useSelector(
    (state) => state.admin
  );
  const { user, handleLogout } = useContext(UserContext);

  useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchProvider({ page: 1, limit: 100 }));
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(fetchUsers());
    dispatch(fetchProvider());
  };

  const visibleUsers = users?.filter((ele) => ele._id !== user?._id) ?? [];
  const totalUsers = visibleUsers.filter((ele) => ele.role === "user").length;
  // const totalProviders = providers.length;

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
                <div className="text-sm font-semibold">{"Admin"}</div>
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
                  <Dialog>
                    <DialogTrigger asChild></DialogTrigger>

                    <DialogContent className="max-w-sm">
                      <DialogHeader>
                        <DialogTitle className="text-lg font-semibold">
                          Logout?
                        </DialogTitle>
                        <DialogDescription>
                          Are you sure you want to logout?
                        </DialogDescription>
                      </DialogHeader>

                      <DialogFooter className="flex justify-end gap-2">
                        <DialogClose asChild>
                          <Button variant="outline">Cancel</Button>
                        </DialogClose>

                        <DialogClose asChild>
                          <Button
                            className="bg-red-600 hover:bg-red-700"
                            onClick={handleLogout}
                          >
                            Logout
                          </Button>
                        </DialogClose>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
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
                        {providers.length}
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
          </div>
        </main>
      </div>
    </div>
  );
}
