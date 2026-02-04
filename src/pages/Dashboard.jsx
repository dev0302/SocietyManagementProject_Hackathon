import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
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
  Users2,
  Megaphone,
  CalendarDays,
  IdCard,
} from "lucide-react";
import { toast } from "sonner";
import {
  fetchDepartmentMembers,
  createMemberInviteLink,
  createMemberInviteByEmail,
} from "@/services/operations/headAPI";
import Input from "@/components/ui/input";

function Dashboard() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [coreAnnouncements, setCoreAnnouncements] = useState([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(false);
  const [college, setCollege] = useState(null);
  const [loadingCollege, setLoadingCollege] = useState(false);

  const [headShowAddMembers, setHeadShowAddMembers] = useState(false);
  const [headInviteLink, setHeadInviteLink] = useState(null);
  const [headInviteLinkLoading, setHeadInviteLinkLoading] = useState(false);
  const [headInviteEmail, setHeadInviteEmail] = useState("");
  const [headInviteEmailLoading, setHeadInviteEmailLoading] = useState(false);
  const [headMembers, setHeadMembers] = useState([]);
  const [headMembersLoading, setHeadMembersLoading] = useState(false);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Faculty: redirect to college view (college details + Society | Events)
  if (user.role === ROLES.FACULTY) {
    return <Navigate to="/admin/college" replace />;
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

  const loadHeadMembers = async () => {
    if (user?.role !== ROLES.HEAD) return;
    try {
      setHeadMembersLoading(true);
      const data = await fetchDepartmentMembers();
      if (data?.success && Array.isArray(data.data)) {
        setHeadMembers(data.data);
      } else {
        setHeadMembers([]);
      }
    } catch {
      setHeadMembers([]);
    } finally {
      setHeadMembersLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === ROLES.HEAD) loadHeadMembers();
  }, [user?.role]);

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
                  <Button variant="outline" onClick={() => navigate("/admin/platform-config")}>
                    Platform configuration
                  </Button>
                </div>
                <div className="mt-2">
                  {loadingCollege ? (
                    <p className="text-xs text-slate-500">Loading college profile…</p>
                  ) : college ? (
                    <Link
                      to="/admin/college"
                      state={college}
                      className="flex flex-wrap items-center gap-4 rounded-lg border border-slate-800 bg-slate-900/60 p-3 transition-colors hover:border-slate-700 hover:bg-slate-800/80 cursor-pointer block"
                    >
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
                    </Link>
                  ) : (
                    <Button onClick={() => navigate("/admin/college")}>
                      Set up college profile
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      case ROLES.FACULTY:
        return null; // Faculty redirects to /admin/college above
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
      case ROLES.HEAD: {
        const memberLabel = (m) => {
          if (!m?.student) return "—";
          const n = [m.student.firstName, m.student.lastName].filter(Boolean).join(" ");
          return n || m.student.email || "—";
        };
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
                  Student head dashboard
                </CardTitle>
                <CardDescription>
                  You are the head of your department. Add members and manage your team.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={() => setHeadShowAddMembers((v) => !v)}>
                  <Users2 className="mr-2 h-4 w-4" />
                  {headShowAddMembers ? "Hide add members" : "Add members"}
                </Button>

                {headShowAddMembers && (
                  <div className="space-y-6 rounded-lg border border-slate-800 bg-slate-950/40 p-4">
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-slate-300">Invite link</p>
                      <p className="text-xs text-slate-400">
                        Share this link. Whoever uses it will be added as a Member of your
                        department.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          onClick={async () => {
                            setHeadInviteLink(null);
                            setHeadInviteLinkLoading(true);
                            try {
                              const data = await createMemberInviteLink();
                              if (data?.success && data?.data?.link) {
                                setHeadInviteLink(data.data.link);
                                toast.success("Link generated. Share it to add members.");
                              } else throw new Error(data?.message);
                            } catch (e) {
                              toast.error(e?.message || "Failed to generate link.");
                            } finally {
                              setHeadInviteLinkLoading(false);
                            }
                          }}
                          disabled={headInviteLinkLoading}
                        >
                          {headInviteLinkLoading ? "Generating…" : "Generate link"}
                        </Button>
                        {headInviteLink && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              navigator.clipboard.writeText(headInviteLink);
                              toast.success("Link copied.");
                            }}
                          >
                            Copy link
                          </Button>
                        )}
                      </div>
                      {headInviteLink && (
                        <p className="break-all rounded border border-slate-800 bg-slate-900/60 px-2 py-1 text-xs text-slate-300">
                          {headInviteLink}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2 border-t border-slate-800 pt-4">
                      <p className="text-xs font-medium text-slate-300">Add by email</p>
                      <p className="text-xs text-slate-400">
                        Invite a specific person by email; they will be added as Member when
                        they accept.
                      </p>
                      <form
                        className="flex flex-wrap gap-2"
                        onSubmit={async (e) => {
                          e.preventDefault();
                          const email = headInviteEmail.trim();
                          if (!email) {
                            toast.error("Enter an email.");
                            return;
                          }
                          setHeadInviteEmailLoading(true);
                          try {
                            const data = await createMemberInviteByEmail(email);
                            if (data?.success) {
                              toast.success("Invite created. Share the link with the user.");
                              if (data?.data?.link) setHeadInviteLink(data.data.link);
                              setHeadInviteEmail("");
                              // Refetch members so list stays in sync with backend
                              const refetch = await fetchDepartmentMembers();
                              if (refetch?.success && Array.isArray(refetch.data)) {
                                setHeadMembers(refetch.data);
                              }
                            } else throw new Error(data?.message);
                          } catch (err) {
                            toast.error(err?.message || "Failed to send invite.");
                          } finally {
                            setHeadInviteEmailLoading(false);
                          }
                        }}
                      >
                        <Input
                          type="email"
                          placeholder="email@example.com"
                          value={headInviteEmail}
                          onChange={(e) => setHeadInviteEmail(e.target.value)}
                          className="min-w-[200px]"
                        />
                        <Button type="submit" size="sm" disabled={headInviteEmailLoading}>
                          {headInviteEmailLoading ? "Sending…" : "Send invite"}
                        </Button>
                      </form>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-start justify-between gap-2">
                <div>
                  <CardTitle className="text-base">Department members</CardTitle>
                  <CardDescription>
                    Students who have joined your department as members.
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadHeadMembers}
                  disabled={headMembersLoading}
                >
                  {headMembersLoading ? "Refreshing…" : "Refresh"}
                </Button>
              </CardHeader>
              <CardContent>
                {headMembersLoading ? (
                  <p className="text-sm text-slate-400">Loading members…</p>
                ) : headMembers.length === 0 ? (
                  <p className="text-sm text-slate-400">
                    No members yet. Use &quot;Add members&quot; to invite students.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {headMembers.map((m) => (
                      <div
                        key={m._id}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-800 bg-slate-950/40 px-3 py-2"
                      >
                        <div>
                          <p className="text-sm font-medium text-slate-100">
                            {memberLabel(m)}
                          </p>
                          {m.student?.email && (
                            <p className="text-xs text-slate-400">{m.student.email}</p>
                          )}
                        </div>
                        <span className="rounded-full bg-slate-700/80 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-300">
                          {m.role === "HEAD" ? "Head" : "Member"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        );
      }
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
