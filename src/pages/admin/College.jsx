import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import PrivateRoute from "@/components/core/auth/PrivateRoute";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import { ROLES } from "@/config/roles";
import { PlusCircle, ListChecks, Pencil, Calendar, Users2 } from "lucide-react";
import {
  getMyCollege,
  upsertMyCollege,
  getMySocietyRequests,
  getMyCollegeSocieties,
  getCollegeEvents,
  approveSocietyRequest,
  rejectSocietyRequest,
} from "@/services/operations/collegeAPI";
import { sendOTP } from "@/services/operations/otpAPI";

function College() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [college, setCollege] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
    profileImageUrl: "",
    phoneNumber: "",
    otp: "",
  });
  const [loading, setLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [requests, setRequests] = useState([]);
  const [societies, setSocieties] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [loadingSocieties, setLoadingSocieties] = useState(false);
  const [showProfileEditor, setShowProfileEditor] = useState(false);
  const [showAddSociety, setShowAddSociety] = useState(false);
  const [showPendingRequests, setShowPendingRequests] = useState(false);
  const [activeNav, setActiveNav] = useState("society"); // "society" | "events"
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [eventFilter, setEventFilter] = useState("upcoming"); // upcoming, today, yesterday, tomorrow, past
  const [eventCategory, setEventCategory] = useState(""); // "", "TECH", "NON_TECH"

  const inviteUrl = useMemo(() => {
    if (!college) return "";
    const base =
      import.meta.env.VITE_APP_URL ||
      (typeof window !== "undefined" ? window.location.origin : "");
    return `${base}/society/onboard?code=${encodeURIComponent(college.uniqueCode)}`;
  }, [college]);

  useEffect(() => {
    const loadCollegeAndRelations = async () => {
      setLoading(true);
      try {
        const response = await getMyCollege();
        if (response.success && response.data) {
          setCollege(response.data);
          setFormData((prev) => ({
            ...prev,
            name: response.data.name || "",
            email: response.data.email || "",
            address: response.data.address || "",
            profileImageUrl: response.data.profileImageUrl || "",
            phoneNumber: response.data.phoneNumber || "",
          }));
          // Default view for existing college: show societies, keep editor collapsed
          setShowProfileEditor(false);
        } else {
          // No college yet – open editor by default
          setShowProfileEditor(true);
        }
      } catch (error) {
        const message = error?.message || "Failed to load college profile";
        toast.error(message);
      } finally {
        setLoading(false);
      }

      // Load requests and societies in parallel (best-effort)
      setLoadingRequests(true);
      setLoadingSocieties(true);
      try {
        const [reqRes, socRes] = await Promise.allSettled([
          getMySocietyRequests(),
          getMyCollegeSocieties(),
        ]);
        if (reqRes.status === "fulfilled" && reqRes.value.success) {
          setRequests(reqRes.value.data || []);
        }
        if (socRes.status === "fulfilled" && socRes.value.success) {
          setSocieties(socRes.value.data || []);
        }
      } finally {
        setLoadingRequests(false);
        setLoadingSocieties(false);
      }
    };

    loadCollegeAndRelations();
  }, []);

  useEffect(() => {
    if (activeNav !== "events" || !college) return;
    const loadEvents = async () => {
      setLoadingEvents(true);
      try {
        const params = {};
        if (eventFilter) params.filter = eventFilter;
        if (eventCategory) params.category = eventCategory;
        const res = await getCollegeEvents(params);
        if (res.success) setEvents(res.data || []);
      } catch {
        setEvents([]);
      } finally {
        setLoadingEvents(false);
      }
    };
    loadEvents();
  }, [activeNav, college, eventFilter, eventCategory]);

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSendOtp = async () => {
    if (!formData.email) {
      toast.error("Please enter the college email first");
      return;
    }
    setSendingOtp(true);
    try {
      const response = await sendOTP(formData.email, "college");
      if (response.success) {
        toast.success("OTP sent to college email");
      } else {
        toast.error(response.message || "Failed to send OTP");
      }
    } catch (error) {
      const message = error?.message || "Failed to send OTP";
      toast.error(message);
    } finally {
      setSendingOtp(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.otp) {
      toast.error("Name, email, and OTP are required");
      return;
    }
    setLoading(true);
    try {
      const response = await upsertMyCollege(formData);
      if (!response.success) {
        throw new Error(response.message || "Failed to save college profile");
      }
      setCollege(response.data);
      toast.success("College profile saved");
    } catch (error) {
      const message = error?.message || "Failed to save college profile";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyInvite = async () => {
    if (!inviteUrl) return;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      toast.success("Invite link copied to clipboard");
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const refreshRequestsAndSocieties = async () => {
    setLoadingRequests(true);
    setLoadingSocieties(true);
    try {
      const [reqRes, socRes] = await Promise.allSettled([
        getMySocietyRequests(),
        getMyCollegeSocieties(),
      ]);
      if (reqRes.status === "fulfilled" && reqRes.value.success) {
        setRequests(reqRes.value.data || []);
      }
      if (socRes.status === "fulfilled" && socRes.value.success) {
        setSocieties(socRes.value.data || []);
      }
    } finally {
      setLoadingRequests(false);
      setLoadingSocieties(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      const response = await approveSocietyRequest(id);
      if (!response.success) {
        throw new Error(response.message || "Failed to approve request");
      }
      toast.success("Society request approved");
      await refreshRequestsAndSocieties();
    } catch (error) {
      const message = error?.message || "Failed to approve request";
      toast.error(message);
    }
  };

  const handleReject = async (id) => {
    try {
      const response = await rejectSocietyRequest(id);
      if (!response.success) {
        throw new Error(response.message || "Failed to reject request");
      }
      toast.info("Society request rejected");
      await refreshRequestsAndSocieties();
    } catch (error) {
      const message = error?.message || "Failed to reject request";
      toast.error(message);
    }
  };

  return (
    <PrivateRoute allowedRoles={[ROLES.ADMIN]}>
      <div className="flex min-h-screen flex-col bg-slate-950 text-slate-50">
        <Navbar />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
          <div className="mb-6 flex items-center justify-between gap-3">
            <Button variant="outline" size="sm" onClick={() => navigate("/dashboard")}>
              ← Back to Dashboard
            </Button>
            {college && (
              <div className="rounded-full bg-slate-900 px-3 py-1 text-xs text-slate-300">
                College code:{" "}
                <span className="font-mono text-sky-300">{college.uniqueCode}</span>
              </div>
            )}
          </div>

          {college && (
            <>
              <Card className="mb-4">
                <CardHeader>
                  <CardTitle>{college.name}</CardTitle>
                  <CardDescription>
                    {college.email}
                    {college.address && ` • ${college.address}`}
                  </CardDescription>
                </CardHeader>
              </Card>

              <nav className="mb-6 flex flex-wrap gap-1 rounded-lg border border-slate-800 bg-slate-900/60 p-1">
                <button
                  type="button"
                  onClick={() => setActiveNav("society")}
                  className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                    activeNav === "society"
                      ? "bg-slate-800 text-slate-100"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Users2 className="h-4 w-4" />
                  Society
                </button>
                <button
                  type="button"
                  onClick={() => setActiveNav("events")}
                  className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                    activeNav === "events"
                      ? "bg-slate-800 text-slate-100"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Calendar className="h-4 w-4" />
                  Events
                </button>
              </nav>

              {activeNav === "society" && (
                <div className="mb-6 flex flex-wrap items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setShowAddSociety((prev) => !prev);
                      setShowPendingRequests(false);
                      setShowProfileEditor(false);
                    }}
                  >
                    <PlusCircle className="mr-1 h-4 w-4" />
                    Add society
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setShowPendingRequests((prev) => !prev);
                      setShowAddSociety(false);
                      setShowProfileEditor(false);
                    }}
                  >
                    <ListChecks className="mr-1 h-4 w-4" />
                    Pending requests
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setShowProfileEditor((prev) => !prev);
                      setShowAddSociety(false);
                      setShowPendingRequests(false);
                    }}
                  >
                    <Pencil className="mr-1 h-4 w-4" />
                    Edit profile
                  </Button>
                </div>
              )}
            </>
          )}

          {activeNav === "events" && college && (
            <div className="mb-6">
              <Card>
                <CardHeader>
                  <CardTitle>College events</CardTitle>
                  <CardDescription>
                    Events from all societies. Filter by date and society type.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 flex flex-wrap gap-2">
                    {["upcoming", "today", "yesterday", "tomorrow", "past"].map((f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setEventFilter(f)}
                        className={`rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors ${
                          eventFilter === f
                            ? "bg-sky-500/20 text-sky-300"
                            : "bg-slate-800 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                    <span className="mx-1 text-slate-600">|</span>
                    {["", "TECH", "NON_TECH"].map((c) => (
                      <button
                        key={c || "all"}
                        type="button"
                        onClick={() => setEventCategory(c)}
                        className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                          eventCategory === c
                            ? "bg-sky-500/20 text-sky-300"
                            : "bg-slate-800 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        {c || "All"}
                      </button>
                    ))}
                  </div>
                  {loadingEvents ? (
                    <p className="text-sm text-slate-500">Loading events…</p>
                  ) : events.length === 0 ? (
                    <p className="text-sm text-slate-500">No events found.</p>
                  ) : (
                    <div className="space-y-3">
                      {events.map((ev) => (
                        <div
                          key={ev._id}
                          className="flex flex-wrap items-start gap-3 rounded-md border border-slate-800 bg-slate-900/70 p-3"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-100">{ev.title}</p>
                            {ev.description && (
                              <p className="mt-0.5 line-clamp-2 text-xs text-slate-400">
                                {ev.description}
                              </p>
                            )}
                            <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                              <span>
                                {ev.date ? new Date(ev.date).toLocaleString() : ""}
                              </span>
                              {ev.venue && <span>• {ev.venue}</span>}
                              {ev.society?.name && (
                                <span className="rounded-full bg-slate-800 px-2 py-0.5 font-mono text-sky-300">
                                  {ev.society.name}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {showProfileEditor && (!college || activeNav === "society") && (
            <Card>
              <CardHeader>
                <CardTitle>College profile</CardTitle>
                <CardDescription>
                  Configure your institution details. A unique code (3 letters + 3 digits) will
                  identify this college for societies and recruitment.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-300">College name</label>
                    <Input
                      value={formData.name}
                      onChange={handleChange("name")}
                      placeholder="e.g. ABC Institute of Technology"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-300">College email</label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={handleChange("email")}
                      placeholder="deanoffice@college.edu"
                      required
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-xs font-medium text-slate-300">Address</label>
                    <textarea
                      value={formData.address}
                      onChange={handleChange("address")}
                      rows={3}
                      className="w-full rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-sky-500"
                      placeholder="Full postal address of the institution"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-300">Profile image URL</label>
                    <Input
                      value={formData.profileImageUrl}
                      onChange={handleChange("profileImageUrl")}
                      placeholder="https://..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-300">Telephone number</label>
                    <Input
                      value={formData.phoneNumber}
                      onChange={handleChange("phoneNumber")}
                      placeholder="+91 011 1234 5678"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-300">
                      OTP sent to college email
                    </label>
                    <div className="flex gap-2">
                      <Input
                        value={formData.otp}
                        onChange={handleChange("otp")}
                        placeholder="Enter OTP"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleSendOtp}
                        disabled={sendingOtp}
                      >
                        {sendingOtp ? "Sending..." : "Send OTP"}
                      </Button>
                    </div>
                  </div>
                  <div className="md:col-span-2 flex justify-end">
                    <Button type="submit" disabled={loading}>
                      {loading ? "Saving..." : "Save college profile"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {college && activeNav === "society" && showAddSociety && (
            <div className="mt-8">
              <Card>
                <CardHeader>
                  <CardTitle>Add society</CardTitle>
                  <CardDescription>
                    Share this invite link or QR with society leaders so they can submit a request
                    to join your college using the unique code.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-300">Invite link</label>
                    <div className="flex items-center gap-2">
                      <Input value={inviteUrl} readOnly />
                      <Button type="button" variant="outline" onClick={handleCopyInvite}>
                        Copy
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-300">QR code</label>
                    {inviteUrl ? (
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                          inviteUrl,
                        )}`}
                        alt="Society invite QR"
                        className="h-40 w-40 rounded-md border border-slate-800 bg-slate-900 p-2"
                      />
                    ) : (
                      <p className="text-xs text-slate-500">
                        Save college profile to generate invite link and QR.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {college && activeNav === "society" && showPendingRequests && (
            <div className="mt-8">
              <Card>
                <CardHeader>
                  <CardTitle>Pending society requests</CardTitle>
                  <CardDescription>
                    Review incoming societies requesting to onboard under this college.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-slate-300">
                  {loadingRequests ? (
                    <p className="text-xs text-slate-500">Loading requests…</p>
                  ) : requests.length === 0 ? (
                    <p className="text-xs text-slate-500">No pending requests at the moment.</p>
                  ) : (
                    <div className="space-y-3">
                      {requests.map((r) => (
                        <div
                          key={r._id}
                          className="rounded-md border border-slate-800 bg-slate-900/70 p-3"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-sm font-medium text-slate-100">{r.name}</p>
                              <p className="text-xs text-slate-400">{r.email}</p>
                              <p className="mt-1 text-[11px] text-slate-500">
                                {r.facultyName && `Faculty: ${r.facultyName} `}
                                {r.presidentName && `| President: ${r.presidentName}`}
                              </p>
                              <span className="mt-1 inline-flex rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-sky-300">
                                {r.category}
                              </span>
                            </div>
                            <div className="flex flex-col gap-2">
                              <Button size="xs" onClick={() => handleApprove(r._id)}>
                                ✓ Accept
                              </Button>
                              <Button
                                size="xs"
                                variant="outline"
                                onClick={() => handleReject(r._id)}
                              >
                                ✕ Reject
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {college && activeNav === "society" && (
            <div className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>College societies</CardTitle>
                  <CardDescription>
                    Societies that have been approved and belong to this college.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-slate-300">
                  {loadingSocieties ? (
                    <p className="text-xs text-slate-500">Loading societies…</p>
                  ) : societies.length === 0 ? (
                    <p className="text-xs text-slate-500">
                      No societies have been added for this college yet.
                    </p>
                  ) : (
                    <div className="grid gap-3 md:grid-cols-2">
                      {societies.map((s) => (
                        <Link
                          key={s._id}
                          to={`/society/${s._id}`}
                          state={s}
                          className="flex items-start gap-3 rounded-md border border-slate-800 bg-slate-900/70 p-3 transition-colors hover:border-slate-700 hover:bg-slate-800/80 cursor-pointer"
                        >
                          {s.logoUrl && (
                            <img
                              src={s.logoUrl}
                              alt={s.name}
                              className="h-10 w-10 rounded-md border border-slate-800 object-cover"
                            />
                          )}
                          <div className="flex-1">
                            <p className="text-sm font-medium text-slate-100">{s.name}</p>
                            <p className="text-[11px] text-slate-500">
                              {s.category} • {s.contactEmail}
                            </p>
                            {(s.facultyName || s.presidentName) && (
                              <p className="mt-1 text-[11px] text-slate-500">
                                {s.facultyName && `Faculty: ${s.facultyName} `}
                                {s.presidentName && `| President: ${s.presidentName}`}
                              </p>
                            )}
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </main>
        <Footer />
      </div>
    </PrivateRoute>
  );
}

export default College;

