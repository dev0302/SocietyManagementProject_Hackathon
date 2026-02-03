import React from "react";
import { useSearchParams } from "react-router-dom";
import SignupForm from "@/components/core/auth/SignupForm";
import OpenRoute from "@/components/core/auth/OpenRoute";

function SignUp() {
  const [searchParams] = useSearchParams();
  const role = searchParams.get("role") || "student";

  return (
    <OpenRoute>
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
        <SignupForm role={role} />
      </div>
    </OpenRoute>
  );
}

export default SignUp;
