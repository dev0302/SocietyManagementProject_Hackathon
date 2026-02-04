import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import PrivateRoute from "@/components/core/auth/PrivateRoute";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Button from "@/components/ui/button";
import { ROLES } from "@/config/roles";
import { getMyCollege } from "@/services/operations/collegeAPI";
import { fetchMyAnnouncements } from "@/services/operations/announcementAPI";
import {
  LayoutDashboard,
  Settings2,
  Users2,
  Megaphone,
  CalendarDays,
  IdCard,
  ClipboardList,
} from "lucide-react";

function Dashboard() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [coreAnnouncements, setCoreAnnouncements] = useState([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(false);
  const [college, setCollege] = useState(null);
  const [loadingCollege, setLoadingCollege] = useState(false);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  useEffect(() => {
    const loadAnnouncements = async () => {
      if (user.role !== ROLES.CORE) return;
      try {
        setLoadingAnnouncements(true);
        const data = await fetchMyAnnouncements();
        if (data?.success && Array.isArray(data.data)) {
          setCoreAnnouncements(data.data);
        }
      } catch (error) {
        // silently ignore on dashboard; we don't want to block the view
        // console error is handled by interceptor if needed
      } finally {
        setLoadingAnnouncements(false);
      }
    };

    loadAnnouncements();
  }, [user.role]);

  useEffect(() => {
    const loadCollege = async () => {
      if (user.role !== ROLES.ADMIN) return;
      try {
        setLoadingCollege(true);
        const response = await getMyCollege();
        if (response.success) {
          setCollege(response.data || null);
        }
      } catch {
        // ignore on dashboard
      } finally {
        setLoadingCollege(false);
      }
    };

    loadCollege();
  }, [user.role]);

  const getDashboardContent = () => {
    switch (user.role) {
      case ROLES.ADMIN:
        return (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <LayoutDashboard className="h-4 w-4 text-sky-400" />
                  Admin dashboard
                </CardTitle>
                <CardDescription>
                  Manage your college profile, platform configuration, faculty access, and other
                  institution-wide settings.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-slate-300">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="max-w-md">
                    Configure your college once and use its unique code to onboard societies and
                    faculty in a structured way.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" onClick={() => navigate("/admin/platform-config")}>
                      Platform configuration
                    </Button>
                    <Button onClick={() => navigate("/admin/college")}>
                      {college ? "View college interface" : "Set up college profile"}
                    </Button>
                  </div>
                </div>
                <div className="mt-2">
                  {loadingCollege ? (
                    <p className="text-xs text-slate-500">Loading college profile…</p>
                  ) : college ? (
                    <div className="flex flex-wrap items-center gap-4 rounded-lg border border-slate-800 bg-slate-900/60 p-3">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-slate-100">
                          {college.name}
                        </span>
                        <span className="text-xs text-slate-400">{college.email}</span>
                        {college.address && (
                          <span className="mt-1 text-xs text-slate-400">{college.address}</span>
                        )}
                      </div>
                      <div className="ml-auto flex flex-col items-end gap-1 text-xs">
                        <span className="rounded-full bg-slate-800 px-2 py-0.5 font-mono text-[11px] text-sky-300">
                          Code: {college.uniqueCode}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          Status: {college.isVerified ? "Verified" : "Pending verification"}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500">
                      No college profile configured yet. Click &quot;Set up college profile&quot; to
                      get started.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      case ROLES.FACULTY:
        return (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <LayoutDashboard className="h-4 w-4 text-sky-400" />
                  Faculty dashboard
                </CardTitle>
                <CardDescription>
                  Create and supervise societies, and keep recruitment aligned with policy.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-slate-300">
                <p>
                  Create societies you supervise, invite core members, and keep an eye on recruitment
                  rounds without leaving this dashboard.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button onClick={() => navigate("/faculty/create-society")}>
                    Create a society
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      case ROLES.STUDENT:
        return (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <LayoutDashboard className="h-4 w-4 text-sky-400" />
                  Student dashboard
                </CardTitle>
                <CardDescription>
                  Discover, apply to, and track societies from one place.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-slate-300">
                <p>
                  See which recruitments are open, submit applications, and follow the status
                  without chasing multiple chats.
                </p>
                <Button onClick={() => navigate("/student/create-application")}>
                  Apply to a society
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        );
      case ROLES.CORE:
        return (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="grid gap-5 lg:grid-cols-[1.3fr,1.1fr]"
          >
            <div className="space-y-5">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <LayoutDashboard className="h-4 w-4 text-sky-400" />
                    Student core dashboard
                  </CardTitle>
                  <CardDescription>
                    Balance your role as a student and society leader with clear workflows.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-slate-300">
                  <p>
                    Plan events, communicate with members, and keep faculty in the loop from a single
                    place.
                  </p>
                  <div className="grid gap-3 md:grid-cols-2">
                    <Button onClick={() => navigate("/student/create-application")}>
                      View recruitment as student
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => navigate("/student/core/manage-members")}
                    >
                      Manage members
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Core quick actions</CardTitle>
                  <CardDescription>
                    High-impact actions you&apos;ll use most often while running your society.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3 md:grid-cols-2">
                  <Button
                    className="justify-start gap-2"
                    onClick={() => navigate("/student/core/announcements")}
                  >
                    <Megaphone className="h-4 w-4" />
                    Post announcement
                  </Button>
                  <Button
                    className="justify-start gap-2"
                    onClick={() => navigate("/student/core/events")}
                  >
                    <CalendarDays className="h-4 w-4" />
                    Manage events
                  </Button>
                  <Button
                    className="justify-start gap-2"
                    onClick={() => navigate("/student/core/manage-members")}
                  >
                    <Users2 className="h-4 w-4" />
                    Manage members
                  </Button>
                  <Button
                    className="justify-start gap-2"
                    onClick={() => navigate("/student/core/departments")}
                  >
                    <IdCard className="h-4 w-4" />
                    View departments &amp; heads
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recent announcements</CardTitle>
                <CardDescription>
                  Announcements you have posted recently across your societies.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingAnnouncements ? (
                  <p className="text-sm text-slate-400">Loading announcements...</p>
                ) : coreAnnouncements.length === 0 ? (
                  <p className="text-sm text-slate-400">
                    No announcements posted yet. Use &quot;Post announcement&quot; to create one.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {coreAnnouncements.map((a) => (
                      <div key={a._id} className="rounded-md border border-slate-800 px-3 py-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="text-sm font-medium text-slate-100">{a.title}</h3>
                          <span className="rounded-full bg-sky-500/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-sky-300">
                            {a.audience || "ALL"}
                          </span>
                        </div>
                        <p className="mt-1 line-clamp-2 text-xs text-slate-400">{a.message}</p>
                        <p className="mt-1 text-[10px] text-slate-500">
                          {a.createdAt ? new Date(a.createdAt).toLocaleString() : ""}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        );
      default:
        return (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Welcome</CardTitle>
                <CardDescription>Your dashboard</CardDescription>
              </CardHeader>
            </Card>
          </motion.div>
        );
    }
  };

  return (
    <PrivateRoute>
      <div className="flex min-h-screen flex-col bg-slate-950 text-slate-50">
        <Navbar />
        <main className="flex-1">
          <div className="mx-auto w-full max-w-6xl px-4 py-8">
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="mb-6 flex flex-wrap items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <Avatar className="h-11 w-11">
                  {user.avatarUrl ? (
                    <AvatarImage src={user.avatarUrl} alt="Avatar" />
                  ) : (
                    <AvatarFallback>
                      {user.firstName?.[0]}
                      {user.lastName?.[0]}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <h1 className="text-sm font-semibold md:text-base">
                    {user.firstName} {user.lastName}
                  </h1>
                  <p className="text-xs text-slate-400">{user.email}</p>
                  <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-200">
                    {user.role}
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                <span className="rounded-full bg-slate-900 px-2 py-1">
                  This space changes based on your role.
                </span>
              </div>
            </motion.div>

            {getDashboardContent()}
          </div>
        </main>
        <Footer />
      </div>
    </PrivateRoute>
  );
}

export default Dashboard;
