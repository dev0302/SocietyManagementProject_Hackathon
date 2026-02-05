import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { toast } from "sonner";
import PrivateRoute from "@/components/core/auth/PrivateRoute";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import { ROLES } from "@/config/roles";
import { PlusCircle, ListChecks, Pencil, Calendar, Users2, Plus } from "lucide-react";
import {
  getMyCollege,
  getFacultyCollege,
  upsertMyCollege,
  getMySocietyRequests,
  getMyCollegeSocieties,
  getCollegeEvents,
  getFacultySocieties,
  getFacultyEvents,
  getFacultyAllSocieties,
  getFacultyAllEvents,
  approveSocietyRequest,
  rejectSocietyRequest,
  createSocietyInviteLink,
} from "@/services/operations/collegeAPI";
import { sendOTP } from "@/services/operations/otpAPI";
import { createEvent } from "@/services/operations/eventAPI";

function College() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
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
  const [facultyHeadEmail, setFacultyHeadEmail] = useState("");
  const [generatedLink, setGeneratedLink] = useState("");
  const [generatingLink, setGeneratingLink] = useState(false);
  const [activeNav, setActiveNav] = useState("society"); // "society" | "events"
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [eventFilter, setEventFilter] = useState("upcoming"); // upcoming, today, yesterday, tomorrow, past
  const [eventCategory, setEventCategory] = useState(""); // "", "TECH", "NON_TECH"
  const [eventsView, setEventsView] = useState("my"); // "my" | "all" (faculty only)
  const [allEvents, setAllEvents] = useState([]);
  const [loadingAllEvents, setLoadingAllEvents] = useState(false);
  const [allSocieties, setAllSocieties] = useState([]);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [eventFormData, setEventFormData] = useState({
    title: "",
    description: "",
    posterUrl: "",
    venue: "",
    date: "",
    eventType: "TECH",
    sendReminder: false,
    reminderAt: "",
    societyId: "",
    participants: [{ email: "", role: "Participant" }],
  });
  const [submittingEvent, setSubmittingEvent] = useState(false);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "events") setActiveNav("events");
  }, [searchParams]);

  const inviteUrl = useMemo(() => {
    if (!college) return "";
    const base =
      import.meta.env.VITE_APP_URL ||
      (typeof window !== "undefined" ? window.location.origin : "");
    return `${base}/society/onboard?code=${encodeURIComponent(college.uniqueCode)}`;
  }, [college]);

  useEffect(() => {
    const loadCollegeAndRelations = async () => {
      if (user?.role === ROLES.FACULTY) {
        setLoading(true);
        setLoadingSocieties(true);
        try {
          const [collegeRes, myRes, allRes] = await Promise.all([
            getFacultyCollege(),
            getFacultySocieties(),
            getFacultyAllSocieties(),
          ]);
          if (collegeRes.success && collegeRes.data) setCollege(collegeRes.data);
          if (myRes.success) setSocieties(myRes.data || []);
          if (allRes.success) setAllSocieties(allRes.data || []);
        } catch (err) {
          toast.error(err?.message || "Failed to load data");
          setSocieties([]);
          setAllSocieties([]);
        } finally {
          setLoading(false);
          setLoadingSocieties(false);
        }
        return;
      }

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
          // Show editor if college name is empty (newly created)
          setShowProfileEditor(!response.data.name || !response.data.name.trim());
        } else {
          setShowProfileEditor(true);
        }
      } catch (error) {
        const message = error?.message || "Failed to load college profile";
        toast.error(message);
        setShowProfileEditor(true);
      } finally {
        setLoading(false);
      }

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
  }, [user?.role]);

  const isAdmin = user?.role === ROLES.ADMIN;
  const isFaculty = user?.role === ROLES.FACULTY;

  useEffect(() => {
    if (activeNav !== "events") return;
    if (isAdmin && !college) return;
    const loadEvents = async () => {
      setLoadingEvents(true);
      try {
        const params = {};
        if (eventFilter) params.filter = eventFilter;
        if (eventCategory) params.category = eventCategory;
        const res = isFaculty
          ? await getFacultyEvents(params)
          : await getCollegeEvents(params);
        if (res.success) setEvents(res.data || []);
      } catch {
        setEvents([]);
      } finally {
        setLoadingEvents(false);
      }
    };
    loadEvents();
  }, [activeNav, college, eventFilter, eventCategory, isAdmin, isFaculty]);

  useEffect(() => {
    if (activeNav !== "events" || !isFaculty || eventsView !== "all") return;
    const loadAll = async () => {
      setLoadingAllEvents(true);
      try {
        const params = {};
        if (eventFilter) params.filter = eventFilter;
        if (eventCategory) params.category = eventCategory;
        const res = await getFacultyAllEvents(params);
        if (res.success) setAllEvents(res.data || []);
      } catch {
        setAllEvents([]);
      } finally {
        setLoadingAllEvents(false);
      }
    };
    loadAll();
  }, [activeNav, eventsView, eventFilter, eventCategory, isFaculty]);

  const handleAddEventChange = (field) => (e) => {
    const v = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setEventFormData((prev) => ({ ...prev, [field]: v }));
  };

  const handleAddParticipant = () => {
    setEventFormData((prev) => ({
      ...prev,
      participants: [...prev.participants, { email: "", role: "Participant" }],
    }));
  };

  const handleParticipantChange = (idx, field) => (e) => {
    const v = e.target.value;
    setEventFormData((prev) => ({
      ...prev,
      participants: prev.participants.map((p, i) =>
        i === idx ? { ...p, [field]: v } : p,
      ),
    }));
  };

  const handleRemoveParticipant = (idx) => {
    setEventFormData((prev) => ({
      ...prev,
      participants: prev.participants.filter((_, i) => i !== idx).length > 0
        ? prev.participants.filter((_, i) => i !== idx)
        : [{ email: "", role: "Participant" }],
    }));
  };

  const handleSubmitEvent = async (e) => {
    e.preventDefault();
    if (!eventFormData.title || !eventFormData.date) {
      toast.error("Title and date are required");
      return;
    }
    if (!eventFormData.societyId && societies.length > 0) {
      toast.error("Please select a society");
      return;
    }
    setSubmittingEvent(true);
    try {
      const participants = eventFormData.participants
        .filter((p) => p.email?.trim())
        .map((p) => ({ email: p.email.trim(), role: p.role || "Participant" }));
      const res = await createEvent({
        title: eventFormData.title,
        description: eventFormData.description,
        posterUrl: eventFormData.posterUrl || undefined,
        venue: eventFormData.venue,
        date: eventFormData.date,
        eventType: eventFormData.eventType,
        sendReminder: eventFormData.sendReminder,
        reminderAt: eventFormData.reminderAt || undefined,
        societyId: eventFormData.societyId || (societies[0]?._id),
        participants,
      });
      if (res.success) {
        toast.success("Event created");
        setShowAddEvent(false);
        setEventFormData({
          title: "",
          description: "",
          posterUrl: "",
          venue: "",
          date: "",
          eventType: "TECH",
          sendReminder: false,
          reminderAt: "",
          societyId: societies[0]?._id || "",
          participants: [{ email: "", role: "Participant" }],
        });
        if (activeNav === "events") {
          const params = {};
          if (eventFilter) params.filter = eventFilter;
          if (eventCategory) params.category = eventCategory;
          const evRes = await getFacultyEvents(params);
          if (evRes.success) setEvents(evRes.data || []);
        }
      } else {
        throw new Error(res.message || "Failed to create event");
      }
    } catch (err) {
      toast.error(err?.message || "Failed to create event");
    } finally {
      setSubmittingEvent(false);
    }
  };

  const handleGenerateInviteLink = async (e) => {
    e.preventDefault();
    if (!facultyHeadEmail?.trim()) {
      toast.error("Please enter faculty head email");
      return;
    }
    setGeneratingLink(true);
    try {
      const res = await createSocietyInviteLink(facultyHeadEmail.trim());
      if (res.success && res.data?.link) {
        setGeneratedLink(res.data.link);
        toast.success("Invite link created. Share it with the faculty head.");
      } else {
        throw new Error(res.message || "Failed to create link");
      }
    } catch (err) {
      toast.error(err?.message || "Failed to create invite link");
    } finally {
      setGeneratingLink(false);
    }
  };

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
    <PrivateRoute allowedRoles={[ROLES.ADMIN, ROLES.FACULTY]}>
      <div className="flex min-h-screen flex-col bg-slate-950 text-slate-50">
        <Navbar />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
          <div className="mb-6 flex items-center justify-between gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(isFaculty ? "/" : "/dashboard")}
            >
              ← {isFaculty ? "Back to Home" : "Back to Dashboard"}
            </Button>
            {(isAdmin || isFaculty) && college && (
              <div className="rounded-full bg-slate-900 px-3 py-1 text-xs text-slate-300">
                College code:{" "}
                <span className="font-mono text-sky-300">{college.uniqueCode}</span>
              </div>
            )}
          </div>

          {loading && (
            <Card>
              <CardContent className="py-12 text-center text-slate-400">
                <p>Loading college profile...</p>
              </CardContent>
            </Card>
          )}

          {isAdmin && college && (
            <div className="mb-4 flex items-start gap-3">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setShowProfileEditor((prev) => !prev);
                  setShowAddSociety(false);
                  setShowPendingRequests(false);
                  setActiveNav("society");
                }}
              >
                <Pencil className="mr-1 h-4 w-4" />
                Edit profile
              </Button>
              <Card className="flex-1">
                <CardHeader>
                  <CardTitle>{college.name}</CardTitle>
                  <CardDescription>
                    {college.email}
                    {college.address && ` • ${college.address}`}
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          )}
          {isFaculty && college && (
            <Card className="mb-4">
              <CardHeader>
                <CardTitle>{college.name}</CardTitle>
                <CardDescription>
                  Your societies belong to this college.
                  {college.email && ` ${college.email}`}
                  {college.uniqueCode && (
                    <span className="ml-1 font-mono text-sky-300">
                      (Code: {college.uniqueCode})
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
            </Card>
          )}

          {(college || isFaculty) && (
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
          )}

          {activeNav === "society" && isAdmin && college && (
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
            </div>
          )}

          {activeNav === "events" && (college || isFaculty) && (
            <div className="mb-6 space-y-4">
              {isFaculty && (
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      setShowAddEvent((prev) => !prev);
                      setEventFormData((prev) => ({
                        ...prev,
                        societyId: societies[0]?._id || "",
                      }));
                    }}
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    Add event
                  </Button>
                </div>
              )}
              {isFaculty && showAddEvent && (
                <Card>
                  <CardHeader>
                    <CardTitle>New event</CardTitle>
                    <CardDescription>
                      Event name, poster, venue, timing, type (tech/non-tech), reminder, and
                      participants (by email). Participants can also join via event invite link.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmitEvent} className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <label className="text-xs font-medium text-slate-300">Event name</label>
                          <Input
                            value={eventFormData.title}
                            onChange={handleAddEventChange("title")}
                            placeholder="e.g. Hackathon 2025"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-medium text-slate-300">Society</label>
                          <select
                            value={eventFormData.societyId}
                            onChange={handleAddEventChange("societyId")}
                            className="w-full rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-100"
                          >
                            <option value="">Select society</option>
                            {societies.map((s) => (
                              <option key={s._id} value={s._id}>
                                {s.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-slate-300">
                          Description (optional)
                        </label>
                        <textarea
                          value={eventFormData.description}
                          onChange={handleAddEventChange("description")}
                          rows={2}
                          className="w-full rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-100"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-slate-300">
                          Poster URL (optional)
                        </label>
                        <Input
                          value={eventFormData.posterUrl}
                          onChange={handleAddEventChange("posterUrl")}
                          placeholder="https://..."
                        />
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <label className="text-xs font-medium text-slate-300">Venue</label>
                          <Input
                            value={eventFormData.venue}
                            onChange={handleAddEventChange("venue")}
                            placeholder="Room / Online"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-medium text-slate-300">
                            Date & time (required)
                          </label>
                          <Input
                            type="datetime-local"
                            value={eventFormData.date}
                            onChange={handleAddEventChange("date")}
                            required
                          />
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-medium text-slate-300">Type</label>
                          <select
                            value={eventFormData.eventType}
                            onChange={handleAddEventChange("eventType")}
                            className="rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-100"
                          >
                            <option value="TECH">Tech</option>
                            <option value="NON_TECH">Non-tech</option>
                          </select>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="sendReminder"
                            checked={eventFormData.sendReminder}
                            onChange={handleAddEventChange("sendReminder")}
                            className="rounded border-slate-700"
                          />
                          <label htmlFor="sendReminder" className="text-xs text-slate-300">
                            Send reminder
                          </label>
                        </div>
                        {eventFormData.sendReminder && (
                          <div className="space-y-2">
                            <label className="text-xs font-medium text-slate-300">
                              Reminder at
                            </label>
                            <Input
                              type="datetime-local"
                              value={eventFormData.reminderAt}
                              onChange={handleAddEventChange("reminderAt")}
                            />
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-medium text-slate-300">
                            Participants (email + role, optional). Add multiple; details will show on event page.
                          </label>
                          <Button type="button" variant="outline" size="sm" onClick={handleAddParticipant}>
                            + Add participant
                          </Button>
                        </div>
                        {eventFormData.participants.map((p, idx) => (
                          <div key={`participant-${idx}-${p.email || ""}`} className="flex flex-wrap items-center gap-2">
                            <Input
                              type="email"
                              value={p.email}
                              onChange={handleParticipantChange(idx, "email")}
                              placeholder="student@college.edu"
                              className="min-w-[180px] flex-1"
                            />
                            <Input
                              value={p.role}
                              onChange={handleParticipantChange(idx, "role")}
                              placeholder="Role (e.g. Organizer, Volunteer)"
                              className="w-36"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="shrink-0 text-red-400 hover:bg-red-500/10"
                              onClick={() => handleRemoveParticipant(idx)}
                              title="Remove this participant row"
                            >
                              Remove
                            </Button>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Button type="submit" disabled={submittingEvent}>
                          {submittingEvent ? "Creating…" : "Create event"}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowAddEvent(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}
              <Card>
                <CardHeader>
                  <CardTitle>
                    {isFaculty
                      ? eventsView === "my"
                        ? "My society events"
                        : "All college events"
                      : "College events"}
                  </CardTitle>
                  <CardDescription>
                    {isFaculty
                      ? eventsView === "my"
                        ? "Events from societies you coordinate. Past events: add certificate serial no. from event detail."
                        : "All events from your college (your societies + others). View only."
                      : "Events from all societies. Filter by date and society type."}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isFaculty && (
                    <div className="mb-3 flex gap-2">
                      <button
                        type="button"
                        onClick={() => setEventsView("my")}
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          eventsView === "my"
                            ? "bg-sky-500/20 text-sky-300"
                            : "bg-slate-800 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        My society events
                      </button>
                      <button
                        type="button"
                        onClick={() => setEventsView("all")}
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          eventsView === "all"
                            ? "bg-sky-500/20 text-sky-300"
                            : "bg-slate-800 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        All college events
                      </button>
                    </div>
                  )}
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
                  {loadingEvents || (isFaculty && eventsView === "all" && loadingAllEvents) ? (
                    <p className="text-sm text-slate-500">Loading events…</p>
                  ) : (isFaculty && eventsView === "all" ? allEvents : events).length === 0 ? (
                    <p className="text-sm text-slate-500">No events found.</p>
                  ) : (
                    <div className="space-y-3">
                      {(isFaculty && eventsView === "all" ? allEvents : events).map((ev) => {
                        const isPast =
                          ev.date && new Date(ev.date) < new Date(new Date().setHours(0, 0, 0, 0));
                        return (
                          <div
                            key={ev._id}
                            className="flex flex-wrap items-start gap-3 rounded-md border border-slate-800 bg-slate-900/70 p-3"
                          >
                            {ev.posterUrl && (
                              <img
                                src={ev.posterUrl}
                                alt=""
                                className="h-16 w-16 rounded object-cover"
                              />
                            )}
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
                                {ev.eventType && (
                                  <span className="rounded-full bg-slate-800 px-2 py-0.5">
                                    {ev.eventType}
                                  </span>
                                )}
                                {ev.society?.name && (
                                  <span className="rounded-full bg-slate-800 px-2 py-0.5 font-mono text-sky-300">
                                    {ev.society.name}
                                  </span>
                                )}
                              </div>
                              {isFaculty && (
                                <Link
                                  to={`/events/${ev._id}`}
                                  className="mt-2 inline-block text-xs text-sky-400 hover:text-sky-300"
                                >
                                  {isPast ? "View details & add certificates" : "View details"}
                                </Link>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {showProfileEditor && isAdmin && (!college || activeNav === "society") && (
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

          {college && isAdmin && activeNav === "society" && showAddSociety && (
            <div className="mt-8 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Add society (invite by faculty head email)</CardTitle>
                  <CardDescription>
                    Enter the faculty head email to generate a unique link. When that person signs in
                    and opens the link, they can create the society and will be set as faculty head.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <form onSubmit={handleGenerateInviteLink} className="space-y-3">
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-slate-300">
                        Faculty head email
                      </label>
                      <div className="flex gap-2">
                        <Input
                          type="email"
                          value={facultyHeadEmail}
                          onChange={(e) => setFacultyHeadEmail(e.target.value)}
                          placeholder="faculty@college.edu"
                          required
                        />
                        <Button type="submit" disabled={generatingLink}>
                          {generatingLink ? "Generating…" : "Generate link"}
                        </Button>
                      </div>
                    </div>
                  </form>
                  {generatedLink && (
                    <>
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-slate-300">Generated link</label>
                        <div className="flex items-center gap-2">
                          <Input value={generatedLink} readOnly />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={async () => {
                              try {
                                await navigator.clipboard.writeText(generatedLink);
                                toast.success("Link copied");
                              } catch {
                                toast.error("Failed to copy");
                              }
                            }}
                          >
                            Copy
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-slate-300">QR code</label>
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                            generatedLink,
                          )}`}
                          alt="Society invite QR"
                          className="h-40 w-40 rounded-md border border-slate-800 bg-slate-900 p-2"
                        />
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Or: general onboarding link</CardTitle>
                  <CardDescription>
                    Share this link so anyone can submit a society request using your college code.
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

          {college && isAdmin && activeNav === "society" && showPendingRequests && (
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
                              {r.facultyEmail && (
                                <p className="mt-0.5 text-[11px] text-sky-400">
                                  Faculty coordinator: {r.facultyEmail}
                                </p>
                              )}
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

          {(college || isFaculty) && activeNav === "society" && (
            <div className="mt-4 space-y-6">
              {isFaculty && (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle>My societies</CardTitle>
                      <CardDescription>
                        Societies you coordinate. Click to view and edit society profile.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm text-slate-300">
                      {loadingSocieties ? (
                        <p className="text-xs text-slate-500">Loading…</p>
                      ) : societies.length === 0 ? (
                        <p className="text-xs text-slate-500">No societies yet.</p>
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
                                <p className="mt-1 text-[10px] text-sky-400">Edit profile →</p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Other societies</CardTitle>
                      <CardDescription>
                        View other societies in your college. You cannot edit them.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm text-slate-300">
                      {allSocieties.filter((s) => !societies.some((m) => m._id === s._id)).length ===
                      0 ? (
                        <p className="text-xs text-slate-500">No other societies.</p>
                      ) : (
                        <div className="grid gap-3 md:grid-cols-2">
                          {allSocieties
                            .filter((s) => !societies.some((m) => m._id === s._id))
                            .map((s) => (
                              <Link
                                key={s._id}
                                to={`/society/${s._id}`}
                                state={s}
                                className="flex items-start gap-3 rounded-md border border-slate-800 bg-slate-900/70 p-3 transition-colors hover:border-slate-700 opacity-90 cursor-pointer"
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
                                    {s.category} • View only
                                  </p>
                                </div>
                              </Link>
                            ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </>
              )}
              {!isFaculty && (
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
              )}
            </div>
          )}
        </main>
        <Footer />
      </div>
    </PrivateRoute>
  );
}

export default College;

