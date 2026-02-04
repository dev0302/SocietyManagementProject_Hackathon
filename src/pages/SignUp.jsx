import React from "react";
import { useSearchParams } from "react-router-dom";
import SignupForm from "@/components/core/auth/SignupForm";
import OpenRoute from "@/components/core/auth/OpenRoute";
import Navbar from "@/components/common/Navbar";

function SignUp() {
  const [searchParams] = useSearchParams();
  const role = searchParams.get("role") || "student";

  return (
    <OpenRoute>
      <div className="min-h-screen bg-slate-950">
        <Navbar />
        <div className="flex items-center justify-center px-4 py-10 sm:py-14">
          <SignupForm role={role} />
        </div>
      </div>
    </OpenRoute>
  );
}

export default SignUp;
