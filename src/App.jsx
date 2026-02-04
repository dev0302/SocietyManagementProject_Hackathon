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
import PostAnnouncement from "@/pages/student/PostAnnouncement";
import CoreEvents from "@/pages/student/CoreEvents";
import ManageMembers from "@/pages/student/ManageMembers";
import CoreDepartments from "@/pages/student/CoreDepartments";

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
      <Route path="/student/core/announcements" element={<PostAnnouncement />} />
      <Route path="/student/core/events" element={<CoreEvents />} />
      <Route path="/student/core/manage-members" element={<ManageMembers />} />
      <Route path="/student/core/departments" element={<CoreDepartments />} />
    </Routes>
  );
}

export default App;