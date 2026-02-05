import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import PrivateRoute from "@/components/core/auth/PrivateRoute";
import { getEventById, issueCertificate, addEventParticipants } from "@/services/operations/eventAPI";
import { ROLES } from "@/config/roles";
import { ArrowLeft } from "lucide-react";

function EventDetail() {
  const { eventId } = useParams();
  const { user } = useSelector((state) => state.auth);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [certSerialNos, setCertSerialNos] = useState({});
  const [submitting, setSubmitting] = useState({});
  const [newParticipants, setNewParticipants] = useState([{ email: "", role: "Participant" }]);
  const [showAddParticipants, setShowAddParticipants] = useState(false);
  const [addingParticipants, setAddingParticipants] = useState(false);

  const loadEvent = async (showLoading = true) => {
    if (!eventId) return;
    if (showLoading) setLoading(true);
    try {
      const res = await getEventById(eventId);
      if (res.success && res.data) {
        setEvent(res.data);
        const initial = {};
        (res.data.participants || []).forEach((p) => {
          const cert = (res.data.certificates || []).find(
            (c) => String(c.student?._id) === String(p.student?._id),
          );
          if (cert?.serialNo) initial[p.student?._id] = cert.serialNo;
        });
        setCertSerialNos(initial);
      }
    } catch (err) {
      if (showLoading) toast.error(err?.message || "Failed to load event");
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    loadEvent();
  }, [eventId]);

  const isPast =
    event?.date && new Date(event.date) < new Date(new Date().setHours(23, 59, 59, 999));
  const facultyCoordinatorId =
    event?.society?.facultyCoordinator?._id || event?.society?.facultyCoordinator;
  const canAddCertificates =
    user?.role === ROLES.FACULTY &&
    user?.id &&
    String(facultyCoordinatorId) === String(user.id) &&
    isPast;
  const canAddParticipants =
    (user?.role === ROLES.FACULTY || user?.role === ROLES.CORE || user?.role === ROLES.HEAD) &&
    user?.id &&
    String(facultyCoordinatorId) === String(user.id);

  const handleSerialChange = (studentId, value) => {
    setCertSerialNos((prev) => ({ ...prev, [studentId]: value }));
  };

  const handleAddParticipantRow = () => {
    setNewParticipants((prev) => [...prev, { email: "", role: "Participant" }]);
  };
  const handleNewParticipantChange = (idx, field) => (e) => {
    const v = e.target.value;
    setNewParticipants((prev) =>
      prev.map((p, i) => (i === idx ? { ...p, [field]: v } : p)),
    );
  };
  const handleRemoveNewParticipant = (idx) => {
    setNewParticipants((prev) =>
      prev.length > 1 ? prev.filter((_, i) => i !== idx) : [{ email: "", role: "Participant" }],
    );
  };
  const handleSubmitNewParticipants = async (e) => {
    e.preventDefault();
    const list = newParticipants.filter((p) => p.email?.trim()).map((p) => ({ email: p.email.trim(), role: p.role || "Participant" }));
    if (list.length === 0) {
      toast.error("Add at least one participant with email");
      return;
    }
    setAddingParticipants(true);
    try {
      const res = await addEventParticipants(eventId, list);
      if (res.success) {
        toast.success("Participants added");
        setShowAddParticipants(false);
        setNewParticipants([{ email: "", role: "Participant" }]);
        loadEvent(false);
      } else {
        throw new Error(res.message || "Failed to add participants");
      }
    } catch (err) {
      toast.error(err?.message || "Failed to add participants");
    } finally {
      setAddingParticipants(false);
    }
  };

  const handleIssueCertificate = async (studentId) => {
    const serialNo = certSerialNos[studentId]?.trim();
    if (!serialNo) {
      toast.error("Enter a serial number");
      return;
    }
    if (!event?.society?._id) return;
    setSubmitting((prev) => ({ ...prev, [studentId]: true }));
    try {
      const res = await issueCertificate({
        studentId,
        societyId: event.society._id,
        eventId: event._id,
        serialNo,
      });
      if (res.success) {
        toast.success("Certificate added");
        loadEvent(false);
        setCertSerialNos((prev) => ({ ...prev, [studentId]: "" }));
      } else {
        throw new Error(res.message);
      }
    } catch (err) {
      toast.error(err?.message || "Failed to issue certificate");
    } finally {
      setSubmitting((prev) => ({ ...prev, [studentId]: false }));
    }
  };

  if (loading) {
    return (
      <PrivateRoute>
        <div className="flex min-h-screen flex-col bg-slate-950 text-slate-50">
          <Navbar />
          <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
            <p className="text-slate-400">Loading event…</p>
          </main>
          <Footer />
        </div>
      </PrivateRoute>
    );
  }

  if (!event) {
    return (
      <PrivateRoute>
        <div className="flex min-h-screen flex-col bg-slate-950 text-slate-50">
          <Navbar />
          <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
            <p className="text-slate-400">Event not found.</p>
            <Link to="/admin/college?tab=events" className="mt-2 inline-block text-sky-400">
              ← Back to events
            </Link>
          </main>
          <Footer />
        </div>
      </PrivateRoute>
    );
  }

  const hasCertificate = (studentId) =>
    (event.certificates || []).some(
      (c) => String(c.student?._id) === String(studentId) || String(c.student) === String(studentId),
    );

  return (
    <PrivateRoute>
      <div className="flex min-h-screen flex-col bg-slate-950 text-slate-50">
        <Navbar />
        <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
          <Link
            to="/admin/college?tab=events"
            className="mb-4 inline-flex items-center gap-1 text-sm text-slate-400 hover:text-sky-400"
          >
            <ArrowLeft className="h-4 w-4" /> Back to events
          </Link>

          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-start gap-4">
                {event.posterUrl && (
                  <img
                    src={event.posterUrl}
                    alt=""
                    className="h-24 w-24 rounded-lg object-cover"
                  />
                )}
                <div className="flex-1">
                  <CardTitle>{event.title}</CardTitle>
                  <CardDescription>
                    {event.date && new Date(event.date).toLocaleString()}
                    {event.venue && ` • ${event.venue}`}
                    {event.eventType && ` • ${event.eventType}`}
                  </CardDescription>
                  {event.society?.name && (
                    <p className="mt-1 text-xs text-sky-400">{event.society.name}</p>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {event.description && (
                <p className="text-sm text-slate-300">{event.description}</p>
              )}

              <div>
                <h3 className="text-sm font-medium text-slate-200">Participants & roles</h3>
                <ul className="mt-2 space-y-2">
                  {(event.participants || []).map((p) => {
                    const displayName = p.student
                      ? `${(p.student.firstName || "").trim()} ${(p.student.lastName || "").trim()}`.trim() || p.student.email || "—"
                      : (p.displayName || p.email || "—");
                    const subText = p.student ? p.student.email : p.email || "";
                    return (
                    <li
                      key={p._id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-slate-800 bg-slate-900/50 px-3 py-2"
                    >
                      <div>
                        <span className="text-sm text-slate-100">{displayName}</span>
                        <span className="ml-2 text-xs text-slate-500">
                          {subText ? `(${subText})` : ""} {p.role ? `• ${p.role}` : ""}
                        </span>
                      </div>
                      {isPast && (
                        <div className="flex items-center gap-2">
                          {hasCertificate(p.student?._id) ? (
                            <span className="text-xs text-emerald-400">Certificate added</span>
                          ) : canAddCertificates ? (
                            <>
                              <Input
                                placeholder="Certificate serial no."
                                value={certSerialNos[p.student?._id] || ""}
                                onChange={(e) =>
                                  handleSerialChange(p.student?._id, e.target.value)
                                }
                                className="h-8 w-40 text-xs"
                              />
                              <Button
                                size="sm"
                                disabled={submitting[p.student?._id]}
                                onClick={() => handleIssueCertificate(p.student?._id)}
                              >
                                {submitting[p.student?._id] ? "Adding…" : "Add"}
                              </Button>
                            </>
                          ) : null}
                        </div>
                      )}
                    </li>
                  ); })}
                </ul>
                {(event.participants || []).length === 0 && (
                  <p className="text-xs text-slate-500">No participants listed.</p>
                )}

                {canAddParticipants && (
                  <div className="mt-3">
                    {!showAddParticipants ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowAddParticipants(true)}
                      >
                        + Add more participants
                      </Button>
                    ) : (
                      <form onSubmit={handleSubmitNewParticipants} className="mt-2 space-y-2 rounded-md border border-slate-800 bg-slate-900/30 p-3">
                        <p className="text-xs font-medium text-slate-300">Add participants (email + role)</p>
                        {newParticipants.map((p, idx) => (
                          <div key={idx} className="flex flex-wrap items-center gap-2">
                            <Input
                              type="email"
                              value={p.email}
                              onChange={handleNewParticipantChange(idx, "email")}
                              placeholder="student@college.edu"
                              className="min-w-[180px] flex-1"
                            />
                            <Input
                              value={p.role}
                              onChange={handleNewParticipantChange(idx, "role")}
                              placeholder="Role"
                              className="w-32"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="shrink-0 text-red-400 hover:bg-red-500/10"
                              onClick={() => handleRemoveNewParticipant(idx)}
                            >
                              Remove
                            </Button>
                          </div>
                        ))}
                        <div className="flex flex-wrap items-center gap-2">
                          <Button type="button" variant="outline" size="sm" onClick={handleAddParticipantRow}>
                            + Add row
                          </Button>
                          <Button type="submit" size="sm" disabled={addingParticipants}>
                            {addingParticipants ? "Adding…" : "Save participants"}
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => { setShowAddParticipants(false); setNewParticipants([{ email: "", role: "Participant" }]); }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    )}
                  </div>
                )}
              </div>

              {isPast && canAddCertificates && (
                <p className="text-xs text-slate-500">
                  Add a unique certificate serial number for each participant. This stores the
                  student with their certificate code for this event.
                </p>
              )}
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    </PrivateRoute>
  );
}

export default EventDetail;
