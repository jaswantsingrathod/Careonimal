import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Clock,
  CheckCircle2,
  Circle,
  Home,
  ShieldCheck,
  Info,
  ArrowLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

export default function PendingApproval() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Main Status Card */}
        <Card className="border border-slate-200 shadow-lg rounded-2xl overflow-hidden">
          <CardContent className="p-8 md:p-12 space-y-8">
            {/* Icon and Title */}
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-50 rounded-full border-2 border-orange-200">
                <Clock className="h-10 w-10 text-orange-500" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                  Verification in Progress
                </h1>
                <p className="text-slate-500 mt-2 text-base">
                  Your provider profile is currently under review
                </p>
              </div>
            </div>

            {/* Description */}
            <p className="text-slate-600 text-center leading-relaxed">
              Thank you for registering! Our team is reviewing your profile to
              ensure quality standards. You'll receive access to your provider
              dashboard once approved.
            </p>

            {/* Progress Stepper */}
            <div className="py-6">
              <div className="flex justify-between items-center max-w-md mx-auto relative">
                {/* Progress Line */}
                <div className="absolute top-6 left-0 w-full h-0.5 bg-slate-200 -z-10">
                  <div className="h-full bg-orange-500 w-1/2" />
                </div>

                <StepItem
                  icon={<CheckCircle2 className="w-5 h-5" />}
                  label="Registration"
                  completed
                />
                <StepItem
                  icon={<ShieldCheck className="w-5 h-5" />}
                  label="Review"
                  active
                />
                <StepItem
                  icon={<Circle className="w-5 h-5" />}
                  label="Dashboard"
                />
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3">
              <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-semibold mb-1">Expected Timeline</p>
                <p className="text-blue-800">
                  Most profiles are reviewed within 24-48 hours. You'll be
                  notified via email once your profile is approved.
                </p>
              </div>
            </div>

            {/* Action Button */}
            <div className="flex justify-center pt-2">
              <Button
                onClick={() => navigate("/")}
                className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 text-white px-8 py-5 rounded-xl"
              >
                <Home className="w-4 h-4 mr-2" />
                Return Home
              </Button>
            </div>

            <button
              onClick={() => navigate(-1)}
              className="text-slate-500 hover:text-slate-700 text-sm flex items-center gap-1 mx-auto transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </button>
          </CardContent>
        </Card>

        {/* Support Footer */}
        <p className="text-center mt-6 text-slate-500 text-sm">
          Any inquiry?{" "}
          <Link to="/contact" className="text-orange-500 hover:underline">
            Contact us
          </Link>
        </p>
      </div>
    </div>
  );
}

function StepItem({ icon, label, completed, active }) {
  return (
    <div className="flex flex-col items-center gap-2 relative">
      <div
        className={`
        z-10 w-12 h-12 rounded-full flex items-center justify-center transition-colors shadow-sm border-2
        ${completed ? "bg-orange-500 border-orange-500 text-white" : ""}
        ${active ? "bg-white border-orange-500 text-orange-600" : ""}
        ${
          !completed && !active
            ? "bg-white border-slate-200 text-slate-300"
            : ""
        }
      `}
      >
        {icon}
      </div>
      <span
        className={`
        text-xs font-medium
        ${completed || active ? "text-slate-700" : "text-slate-400"}
      `}
      >
        {label}
      </span>
    </div>
  );
}
