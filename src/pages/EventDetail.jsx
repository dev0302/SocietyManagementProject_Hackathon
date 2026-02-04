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
import { getEventById, issueCertificate } from "@/services/operations/eventAPI";
import { ROLES } from "@/config/roles";
import { ArrowLeft } from "lucide-react";

function EventDetail() {
  const { eventId } = useParams();
  const { user } = useSelector((state) => state.auth);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [certSerialNos, setCertSerialNos] = useState({});
  const [submitting, setSubmitting] = useState({});

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

  const handleSerialChange = (studentId, value) => {
    setCertSerialNos((prev) => ({ ...prev, [studentId]: value }));
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
                  {(event.participants || []).map((p) => (
                    <li
                      key={p.student?._id || p._id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-slate-800 bg-slate-900/50 px-3 py-2"
                    >
                      <div>
                        <span className="text-sm text-slate-100">
                          {p.student?.firstName} {p.student?.lastName}
                        </span>
                        <span className="ml-2 text-xs text-slate-500">
                          ({p.student?.email}) • {p.role}
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
                  ))}
                </ul>
                {(event.participants || []).length === 0 && (
                  <p className="text-xs text-slate-500">No participants listed.</p>
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
