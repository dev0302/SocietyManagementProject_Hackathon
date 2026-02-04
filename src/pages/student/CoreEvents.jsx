import React, { useState } from "react";
import PrivateRoute from "@/components/core/auth/PrivateRoute";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Button from "@/components/ui/button";
import { ROLES } from "@/config/roles";
import { toast } from "sonner";
import { createEvent } from "@/services/operations/eventAPI";

const initialEvents = [
  {
    id: 1,
    title: "Orientation Meetup",
    date: "2026-02-10",
    venue: "Auditorium A",
    status: "Scheduled",
  },
  {
    id: 2,
    title: "Recruitment Drive",
    date: "2026-02-18",
    venue: "Block B, Room 204",
    status: "Draft",
  },
  {
    id: 3,
    title: "Annual Showcase",
    date: "2026-03-01",
    venue: "Main Ground",
    status: "Completed",
  },
];

function CoreEvents() {
  const [eventTitle, setEventTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [venue, setVenue] = useState("");
  const [description, setDescription] = useState("");
  const [events, setEvents] = useState(initialEvents);
  const [submitting, setSubmitting] = useState(false);

  const handleCreateEvent = async (e) => {
    e.preventDefault();

    if (!eventTitle.trim() || !eventDate || !eventTime || !venue.trim() || !description.trim()) {
      toast.error("Please fill in all fields.");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        title: eventTitle.trim(),
        description: description.trim(),
        // Combine date and time into a single ISO-like string. Backend will cast to Date.
        date: `${eventDate}T${eventTime}`,
      };

      const data = await createEvent(payload);

      if (!data.success) {
        throw new Error(data.message || "Failed to create event.");
      }

      // Update local list with a simple representation
      setEvents((prev) => [
        ...prev,
        {
          id: data.data?._id || Date.now(),
          title: eventTitle.trim(),
          date: eventDate,
          venue: venue.trim(),
          status: "Scheduled",
        },
      ]);

      toast.success("Event created successfully.");

      setEventTitle("");
      setEventDate("");
      setEventTime("");
      setVenue("");
      setDescription("");
    } catch (error) {
      toast.error(error.message || "Unable to create event. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PrivateRoute allowedRoles={[ROLES.CORE]}>
      <div className="flex min-h-screen flex-col bg-slate-950 text-slate-50">
        <Navbar />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Manage Events</h1>
              <p className="mt-1 text-sm text-slate-400">
                View and manage events for your society.
              </p>
            </div>
            <Button form="create-event-form" type="submit">
              Create Event
            </Button>
          </div>

          <Card className="mb-6 bg-slate-900/60 border-slate-800">
            <CardHeader>
              <CardTitle className="text-base">Create Event</CardTitle>
              <CardDescription>Fill in the details to add a new event.</CardDescription>
            </CardHeader>
            <CardContent>
              <form id="create-event-form" onSubmit={handleCreateEvent} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="event-title" className="text-xs font-medium text-slate-200">
                    Event title
                  </label>
                  <input
                    id="event-title"
                    type="text"
                    className="w-full rounded-md border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-slate-50 shadow-sm outline-none ring-sky-500/50 placeholder:text-slate-500 focus:border-sky-500 focus:ring-2"
                    placeholder="Eg. Hackathon Kickoff"
                    value={eventTitle}
                    onChange={(e) => setEventTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="event-date" className="text-xs font-medium text-slate-200">
                      Date
                    </label>
                    <input
                      id="event-date"
                      type="date"
                      className="w-full rounded-md border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-slate-50 shadow-sm outline-none ring-sky-500/50 focus:border-sky-500 focus:ring-2"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="event-time" className="text-xs font-medium text-slate-200">
                      Time
                    </label>
                    <input
                      id="event-time"
                      type="time"
                      className="w-full rounded-md border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-slate-50 shadow-sm outline-none ring-sky-500/50 focus:border-sky-500 focus:ring-2"
                      value={eventTime}
                      onChange={(e) => setEventTime(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="event-venue" className="text-xs font-medium text-slate-200">
                    Venue
                  </label>
                  <input
                    id="event-venue"
                    type="text"
                    className="w-full rounded-md border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-slate-50 shadow-sm outline-none ring-sky-500/50 placeholder:text-slate-500 focus:border-sky-500 focus:ring-2"
                    placeholder="Eg. Seminar Hall 1"
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="event-description" className="text-xs font-medium text-slate-200">
                    Description
                  </label>
                  <textarea
                    id="event-description"
                    className="min-h-[100px] w-full rounded-md border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-slate-50 shadow-sm outline-none ring-sky-500/50 placeholder:text-slate-500 focus:border-sky-500 focus:ring-2"
                    placeholder="Add a short description for this event..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={submitting}>
                    {submitting ? "Saving..." : "Save Event"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/60 border-slate-800">
            <CardHeader>
              <CardTitle className="text-base">Upcoming & Recent Events</CardTitle>
              <CardDescription>These are dummy events shown for now.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-800 text-xs uppercase tracking-wide text-slate-400">
                      <th className="py-2 pr-4 text-left font-medium">Title</th>
                      <th className="py-2 px-4 text-left font-medium">Date</th>
                      <th className="py-2 px-4 text-left font-medium">Venue</th>
                      <th className="py-2 px-4 text-left font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map((event) => (
                      <tr key={event.id} className="border-b border-slate-900/80 last:border-0">
                        <td className="py-3 pr-4 font-medium text-slate-100">{event.title}</td>
                        <td className="py-3 px-4 text-slate-300">{event.date}</td>
                        <td className="py-3 px-4 text-slate-300">{event.venue}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`
                              inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium
                              ${
                                event.status === "Scheduled"
                                  ? "bg-sky-500/10 text-sky-300 border border-sky-500/40"
                                  : event.status === "Completed"
                                  ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/40"
                                  : "bg-amber-500/10 text-amber-300 border border-amber-500/40"
                              }
                            `}
                          >
                            {event.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    </PrivateRoute>
  );
}

export default CoreEvents;

