// src/pages/ProviderDashboard.jsx
import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";


export default function ProviderDashboard() {
  return (
    <div className="min-h-screen  px-6 py-10">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex items-center justify-between gap-6">
          <div className="flex-1">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">Dashboard</h1>
            <p className="text-sm text-slate-600 mt-1">
              Plan, prioritize, and accomplish your bookings with ease.
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-4">
            <div className="w-56 h-14 rounded-full overflow-hidden shadow-lg border">
              <img
                src="/mnt/data/Screenshot 2025-11-23 034956.png"
                alt="header"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main grid */}
      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left (main) */}
        <section className="lg:col-span-9 space-y-6">
          {/* Stats row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="overflow-hidden rounded-2xl shadow-sm">
              <CardContent className="bg-gradient-to-br from-emerald-600 to-emerald-500 text-white p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-wider opacity-90">Total Bookings</div>
                    <div className="mt-2 text-3xl font-extrabold">—</div>
                    <div className="mt-2 text-xs opacity-90">Increased from last month</div>
                  </div>
                  <div className="flex items-center justify-center w-10 h-10 rounded bg-white/20">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-white">
                      <path d="M5 12h14" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 5l7 7-7 7" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl shadow-sm">
              <CardContent className="p-5">
                <div className="text-xs text-slate-500">Ended Bookings</div>
                <div className="mt-2 text-2xl font-bold">—</div>
                <div className="mt-2 text-xs text-slate-400">Previous period</div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl shadow-sm">
              <CardContent className="p-5">
                <div className="text-xs text-slate-500">Running</div>
                <div className="mt-2 text-2xl font-bold">—</div>
                <div className="mt-2 text-xs text-slate-400">Active now</div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl shadow-sm">
              <CardContent className="p-5">
                <div className="text-xs text-slate-500">Pending</div>
                <div className="mt-2 text-2xl font-bold text-amber-600">—</div>
                <div className="mt-2 text-xs text-slate-400">Awaiting approval</div>
              </CardContent>
            </Card>
          </div>

          {/* Analytics + Reminder row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2 rounded-2xl shadow-sm">
              <CardHeader>
                <CardTitle>Booking Analytics</CardTitle>
                <CardDescription className="text-sm">Visual overview of bookings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mt-2 h-44 rounded-lg bg-white border border-dashed border-slate-100 flex items-center justify-center text-slate-400">
                  Chart placeholder
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl shadow-sm">
              <CardHeader>
                <CardTitle>Reminders</CardTitle>
                <CardDescription className="text-sm">Upcoming pickups & meetings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3">
                  <div className="p-3 rounded-lg bg-slate-50 border">
                    <div className="text-sm font-medium">No reminders</div>
                    <div className="text-xs text-slate-500 mt-1">You're all caught up</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Progress / Team row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="md:col-span-2 rounded-2xl shadow-sm">
              <CardHeader>
                <CardTitle>Team & Contacts</CardTitle>
                <CardDescription className="text-sm">Your team and collaborators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm text-slate-500 text-center py-8">No team members</div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl shadow-sm">
              <CardHeader>
                <CardTitle>Today's Progress</CardTitle>
                <CardDescription className="text-sm">Completion rate</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-28 rounded-lg bg-white border border-dashed border-slate-100 flex items-center justify-center text-slate-400">
                  Progress widget
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bookings lists */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="rounded-2xl shadow-sm">
              <CardHeader>
                <CardTitle>Pending Bookings</CardTitle>
                <CardDescription className="text-sm">Approve or decline new requests</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-56">
                  <div className="flex items-center justify-center h-full text-sm text-slate-500">
                    No pending bookings
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card className="rounded-2xl shadow-sm">
              <CardHeader>
                <CardTitle>Previous Bookings</CardTitle>
                <CardDescription className="text-sm">History & records</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-slate-500 text-center py-8">No previous bookings</div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Right column */}
        <aside className="lg:col-span-3 space-y-6">
          <Card className="rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3">
                <Button className="w-full">Add Service</Button>
                <Button variant="outline" className="w-full">Manage Availability</Button>
                <Button variant="ghost" className="w-full">Settings</Button>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle>Upcoming Booking</CardTitle>
              <CardDescription className="text-sm">Next scheduled appointment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-slate-500 text-center py-6">No upcoming bookings</div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle>Time Tracker</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-24 rounded-lg bg-white border border-dashed border-slate-100 flex items-center justify-center text-slate-400">
                Time tracker placeholder
              </div>
            </CardContent>
          </Card>
        </aside>
      </main>
    </div>
  );
}
