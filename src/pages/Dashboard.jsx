import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Navigate } from "react-router-dom";
import PrivateRoute from "@/components/core/auth/PrivateRoute";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Button from "@/components/ui/button";
import { ROLES } from "@/config/roles";
import { fetchMyAnnouncements } from "@/services/operations/announcementAPI";

function Dashboard() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [coreAnnouncements, setCoreAnnouncements] = useState([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(false);

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

  const getDashboardContent = () => {
    switch (user.role) {
      case ROLES.ADMIN:
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Admin Dashboard</CardTitle>
                <CardDescription>Manage platform configuration and faculty access</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-300">
                  Platform admin controls. Manage faculty whitelist and admin emails.
                </p>
                <Button onClick={() => navigate("/admin/platform-config")}>
                  Platform Configuration
                </Button>
              </CardContent>
            </Card>
          </div>
        );
      case ROLES.FACULTY:
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Faculty Dashboard</CardTitle>
                <CardDescription>Manage your societies and coordinate activities</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-300">
                  Create societies, invite core members, and oversee recruitment processes.
                </p>
                <div className="flex gap-2">
                  <Button onClick={() => navigate("/faculty/create-society")}>
                    Create Society
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      case ROLES.STUDENT:
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Student Dashboard</CardTitle>
                <CardDescription>Apply to societies and manage your applications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-300">
                  Browse available societies, submit applications, and track your recruitment status.
                </p>
                <Button onClick={() => navigate("/student/create-application")}>
                  Apply to Society
                </Button>
              </CardContent>
            </Card>
          </div>
        );
      case ROLES.CORE:
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Student Core Dashboard</CardTitle>
                <CardDescription>Apply to societies and manage your applications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-300">
                  Browse available societies, submit applications, and track your recruitment status.
                </p>
                <Button onClick={() => navigate("/student/create-application")}>
                  Apply to Society
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Core Actions</CardTitle>
                <CardDescription>Manage core-specific responsibilities for your societies</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-300">
                  Quick tools available only to core members of your societies.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button onClick={() => navigate("/student/core/announcements")}>
                    Post Announcement
                  </Button>
                  <Button onClick={() => navigate("/student/core/events")}>
                    Manage Events
                  </Button>
                  <Button onClick={() => navigate("/student/core/manage-members")}>
                    Manage Members
                  </Button>
                  <Button onClick={() => navigate("/student/core/departments")}>
                    View Departments &amp; Heads
                  </Button>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Recent Announcements</CardTitle>
                <CardDescription>
                  Announcements you have posted recently.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingAnnouncements ? (
                  <p className="text-sm text-slate-400">Loading announcements...</p>
                ) : coreAnnouncements.length === 0 ? (
                  <p className="text-sm text-slate-400">
                    No announcements posted yet. Use &quot;Post Announcement&quot; to create one.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {coreAnnouncements.map((a) => (
                      <div
                        key={a._id}
                        className="rounded-lg border border-slate-800 bg-slate-950/40 px-3 py-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="text-sm font-medium text-slate-100">
                            {a.title}
                          </h3>
                          <span className="rounded-full bg-sky-500/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-sky-300">
                            {a.audience || "ALL"}
                          </span>
                        </div>
                        <p className="mt-1 line-clamp-2 text-xs text-slate-400">
                          {a.message}
                        </p>
                        <p className="mt-1 text-[10px] text-slate-500">
                          {a.createdAt ? new Date(a.createdAt).toLocaleString() : ""}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );
      default:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Welcome</CardTitle>
              <CardDescription>Your dashboard</CardDescription>
            </CardHeader>
          </Card>
        );
    }
  };

  return (
    <PrivateRoute>
      <div className="flex min-h-screen flex-col bg-slate-950 text-slate-50">
        <Navbar />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
          <div className="mb-6 flex items-center gap-4">
            <Avatar>
              {user.avatarUrl ? (
                <AvatarImage src={user.avatarUrl} alt="Avatar" />
              ) : (
                <AvatarFallback>
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <h1 className="text-xl font-semibold">
                {user.firstName} {user.lastName}
              </h1>
              <p className="text-xs text-slate-400">{user.email}</p>
              <span className="mt-1 inline-block rounded-full bg-sky-500/10 px-2 py-0.5 text-[10px] text-sky-400">
                {user.role}
              </span>
            </div>
          </div>
          {getDashboardContent()}
        </main>
        <Footer />
      </div>
    </PrivateRoute>
  );
}

export default Dashboard;
