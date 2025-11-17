import { useEffect, useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUsers, deleteUser, fetchSingleUser } from "../slices/admin-slice";
import {Users, PawPrint, Eye, Trash, Book    } from 'lucide-react';

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import UserContext from "../context/User-Context";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate()
  const { users, loading, error } = useSelector((state) => state.admin);
  const { user } = useContext(UserContext);

  useEffect(() => {
    dispatch(fetchUsers());
  }, []);

  const handleRefresh = () => {
    dispatch(fetchUsers());
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      dispatch(deleteUser(id));
    }
  };

  const handleView = (id) => {
    dispatch(fetchSingleUser(id))
    navigate(`/admin/user/${id}`)
  }

  const visibleUsers = users?.filter((ele) => ele._id !== user?._id) ?? [];
  const totalUsers = visibleUsers.filter((ele) => ele.role === "user").length;
  const totalProviders = visibleUsers.filter((ele) => ele.role === "provider").length;

  if (!user) 
    return (
     <p>Loading...</p>
    )

  return (
    <div className="min-h-screen bg-gray-50 p-6">
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
            Error: {typeof error === "string" ? error : JSON.stringify(error)}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Card className="h-24 w-full sm:w-auto p-2">
            <CardHeader>
              <CardTitle className="text-sm">
                <div className="flex flex-row justify-center items-center   gap-2">
                  <Users className="h-7 w-5 text-blue-600"/> 
                  <span>Total Users</span>
                </div>
              </CardTitle>
              <CardContent>
                <div className="text-2xl font-bold text-center">
                  {loading ? "—" : totalUsers}
                </div>
              </CardContent>
            </CardHeader>   
          </Card>

          <Card className="h-24 w-full sm:w-auto p-2">
            <CardHeader>
              <CardTitle className="text-sm">
                <div className="flex flex-row justify-center items-center gap-2"> 
                  <PawPrint className="h-7 w-5 text-green-600"/> 
                  <span>Total Providers</span>
                </div>
              </CardTitle>
              <CardContent>
                <div className="text-2xl font-bold text-center">
                  {loading ? "—" : totalProviders}
                </div>
              </CardContent>
            </CardHeader>
          </Card>

          <Card className="h-24 w-full sm:w-auto p-2">
            <CardHeader>
              <CardTitle className="text-sm">
                <div className="flex flex-row justify-center items-center gap-2">
                  <Book className="h-7 w-5 text-purple-600"/> 
                  <span>Total Bookings</span>
                </div>
              </CardTitle>
              <CardContent>
                <div className="text-2xl font-bold text-center">
                  {/* {loading ? "—" : totalProviders} */}
                  34
                </div>
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
                  {/* 🔹 use visibleUsers for empty state too */}
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

                  {/* 🔹 map visibleUsers so admin is hidden */}
                  {visibleUsers?.map((ele) => (
                    <tr key={ele._id} className="border-t">
                      <td className="py-3">
                        {ele.username ?? ele.name ?? "—"}
                      </td>
                      <td>{ele.email ?? "—"}</td>
                      <td>{ele.role ?? "—"}</td>
                      <td>
                        {ele.createdAt
                          ? new Date(ele.createdAt).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="px-4 py-2 border text-center">
                        <button className="px-3 py-1 bg-blue text-black-500 rounded-md hover:bg-blue-300 transition"
                        onClick={() => {
                          handleView(ele._id)
                        }}
                        >
                          <Eye/>
                        </button>

                        {user.role === "admin" && user._id !== ele._id && (
                          <button
                            onClick={() => handleDelete(ele._id)}
                            className="px-3 py-1 bg-blue text-red-500 rounded-md hover:bg-gray-700 transition"
                          >
                            <Trash/>
                          </button>
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
    </div>
  );
}
