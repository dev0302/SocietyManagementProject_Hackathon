import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import About from "@/pages/About";
import Login from "@/pages/Login";
import SignUp from "@/pages/SignUp";
import Dashboard from "@/pages/Dashboard";
import PlatformConfig from "@/pages/admin/PlatformConfig";
import CreateSociety from "@/pages/faculty/CreateSociety";
import CreateApplication from "@/pages/student/CreateApplication";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/admin/platform-config" element={<PlatformConfig />} />
      <Route path="/faculty/create-society" element={<CreateSociety />} />
      <Route path="/student/create-application" element={<CreateApplication />} />
    </Routes>
  );
}

export default App;