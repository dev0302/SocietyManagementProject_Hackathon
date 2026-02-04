import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Button from "@/components/ui/button";
import PrivateRoute from "@/components/core/auth/PrivateRoute";
import { getSocietyEvents } from "@/services/operations/eventAPI";

function SocietyDetail() {
  const { state } = useLocation();
  const { id } = useParams();
  const navigate = useNavigate();
  const society = state;
  const societyId = society?._id || id;
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [eventFilter, setEventFilter] = useState("upcoming");
  const [eventCategory, setEventCategory] = useState("");

  useEffect(() => {
    if (!societyId) return;
    const load = async () => {
      setLoadingEvents(true);
      try {
        const params = {};
        if (eventFilter) params.filter = eventFilter;
        if (eventCategory) params.category = eventCategory;
        const res = await getSocietyEvents(societyId, params);
        if (res.success) setEvents(res.data || []);
      } catch {
        setEvents([]);
      } finally {
        setLoadingEvents(false);
      }
    };
    load();
  }, [societyId, eventFilter, eventCategory]);

  return (
    <PrivateRoute>
      <div className="flex min-h-screen flex-col bg-slate-950 text-slate-50">
        <Navbar />
        <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
          <div className="mb-6">
            <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
              ← Back
            </Button>
          </div>

          {society ? (
            <Card>
              <CardHeader>
                <div className="flex items-start gap-4">
                  {society.logoUrl && (
                    <img
                      src={society.logoUrl}
                      alt={society.name}
                      className="h-16 w-16 rounded-lg border border-slate-800 object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <CardTitle className="text-xl">{society.name}</CardTitle>
                    {society.category && (
                      <CardDescription className="mt-1">
                        {society.category}
                      </CardDescription>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-slate-300">
                {society.description && (
                  <div>
                    <p className="mb-1 font-medium text-slate-200">About</p>
                    <p>{society.description}</p>
                  </div>
                )}
                {society.contactEmail && (
                  <div>
                    <p className="mb-1 font-medium text-slate-200">Contact</p>
                    <p>{society.contactEmail}</p>
                  </div>
                )}
                {(society.facultyName || society.presidentName) && (
                  <div>
                    <p className="mb-1 font-medium text-slate-200">Leadership</p>
                    <p>
                      {society.facultyName && `Faculty: ${society.facultyName}`}
                      {society.facultyName && society.presidentName && " • "}
                      {society.presidentName && `President: ${society.presidentName}`}
                    </p>
                  </div>
                )}
                {society._id && (
                  <div className="rounded-md border border-slate-800 bg-slate-900/50 px-3 py-2">
                    <p className="text-[11px] font-medium text-slate-400">Society ID</p>
                    <p className="font-mono text-xs text-sky-300">{society._id}</p>
                  </div>
                )}

                {societyId && (
                  <div className="mt-6 border-t border-slate-800 pt-6">
                    <p className="mb-3 font-medium text-slate-200">Society events</p>
                    <div className="mb-3 flex flex-wrap gap-2">
                      {["upcoming", "today", "yesterday", "tomorrow", "past"].map((f) => (
                        <button
                          key={f}
                          type="button"
                          onClick={() => setEventFilter(f)}
                          className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${
                            eventFilter === f ? "bg-sky-500/20 text-sky-300" : "bg-slate-800 text-slate-400 hover:text-slate-200"
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
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            eventCategory === c ? "bg-sky-500/20 text-sky-300" : "bg-slate-800 text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          {c || "All"}
                        </button>
                      ))}
                    </div>
                    {loadingEvents ? (
                      <p className="text-xs text-slate-500">Loading events…</p>
                    ) : events.length === 0 ? (
                      <p className="text-xs text-slate-500">No events found.</p>
                    ) : (
                      <div className="space-y-2">
                        {events.map((ev) => (
                          <div
                            key={ev._id}
                            className="rounded-md border border-slate-800 bg-slate-900/50 px-3 py-2"
                          >
                            <p className="text-sm font-medium text-slate-100">{ev.title}</p>
                            {ev.description && (
                              <p className="mt-0.5 line-clamp-2 text-xs text-slate-400">{ev.description}</p>
                            )}
                            <p className="mt-1 text-[11px] text-slate-500">
                              {ev.date ? new Date(ev.date).toLocaleString() : ""}
                              {ev.venue && ` • ${ev.venue}`}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-slate-400">
                <p>Society details not available.</p>
                <p className="mt-1 text-xs">
                  Please navigate from the college interface to view society information.
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => navigate("/admin/college")}
                >
                  Go to college interface
                </Button>
              </CardContent>
            </Card>
          )}
        </main>
        <Footer />
      </div>
    </PrivateRoute>
  );
}

export default SocietyDetail;
