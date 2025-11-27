// src/pages/ProviderPending.jsx
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function PendingApproval() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center bg-white px-4">
      <div className="max-w-xl w-full">
        <Card className="text-center p-6">
          <CardHeader>
            <AlertCircle className="mx-auto h-12 w-12 text-orange-600" />
            <CardTitle className="mt-4 text-2xl">Profile Under Review</CardTitle>
          </CardHeader>

          <CardContent className="pt-4">
            <p className="text-gray-600">
              Thanks for joining — your provider profile is currently under review by our team.
              Once approved you'll be able to access your provider dashboard.
            </p>

            <div className="mt-6 flex justify-center gap-3">
              <Button variant="outline" onClick={() => navigate("/")}>Go to Home</Button>
              <Button onClick={() => navigate(-1)}>Back</Button>
            </div>

            <p className="text-xs text-gray-400 mt-4">
              If this is taking longer than expected, contact support.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
