import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import Login from "@/pages/Login";
import SignUp from "@/pages/SignUp";
import Dashboard from "@/pages/Dashboard";
import Profile from "@/pages/Profile";
import PlatformConfig from "@/pages/admin/PlatformConfig";
import College from "@/pages/admin/College";
import SocietyOnboard from "@/pages/SocietyOnboard";
import SocietyDetail from "@/pages/SocietyDetail";
import CreateSociety from "@/pages/faculty/CreateSociety";
import CreateApplication from "@/pages/student/CreateApplication";
import PostAnnouncement from "@/pages/student/PostAnnouncement";
import CoreEvents from "@/pages/student/CoreEvents";
import ManageMembers from "@/pages/student/ManageMembers";
import CoreDepartments from "@/pages/student/CoreDepartments";
<<<<<<< HEAD
import EventDetail from "@/pages/EventDetail";
=======
import AcceptInvite from "@/pages/AcceptInvite";
>>>>>>> a91402f3032014389c9f9f6a46168e2de876dd7a

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/accept-invite" element={<AcceptInvite />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/admin/platform-config" element={<PlatformConfig />} />
      <Route path="/admin/college" element={<College />} />
      <Route path="/society/onboard" element={<SocietyOnboard />} />
      <Route path="/society/:id" element={<SocietyDetail />} />
      <Route path="/events/:eventId" element={<EventDetail />} />
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