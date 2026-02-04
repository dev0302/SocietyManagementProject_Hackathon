import React from "react";
import LoginForm from "@/components/core/auth/LoginForm";
import OpenRoute from "@/components/core/auth/OpenRoute";
import Navbar from "@/components/common/Navbar";

function Login() {
  return (
    <OpenRoute>
      <div className="min-h-screen bg-slate-950">
        <Navbar />
        <div className="flex items-center justify-center px-4 py-10 sm:py-14">
          <LoginForm />
        </div>
      </div>
    </OpenRoute>
  );
}

export default Login;
