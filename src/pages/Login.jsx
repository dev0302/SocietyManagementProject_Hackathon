import React from "react";
import LoginForm from "@/components/core/auth/LoginForm";
import OpenRoute from "@/components/core/auth/OpenRoute";

function Login() {
  return (
    <OpenRoute>
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
        <LoginForm />
      </div>
    </OpenRoute>
  );
}

export default Login;
