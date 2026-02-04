import React, { useState } from "react";
import PrivateRoute from "@/components/core/auth/PrivateRoute";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";

function PostAnnouncement() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [audience, setAudience] = useState("ALL");

  const handleSubmit = (e) => {
    e.preventDefault();

    const announcement = {
      title,
      message,
      audience,
    };

    // For now, just log to console as requested
    // eslint-disable-next-line no-console
    console.log("Posting announcement:", announcement);

    // Optional: reset form after submit
    setTitle("");
    setMessage("");
    setAudience("ALL");
  };

  return (
    <PrivateRoute>
      <div className="flex min-h-screen flex-col bg-slate-950 text-slate-50">
        <Navbar />
        <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
          <Card className="bg-slate-900/60 border-slate-800">
            <CardHeader>
              <CardTitle>Post Announcement</CardTitle>
              <CardDescription>Create and share an announcement with your society.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-200" htmlFor="announcement-title">
                    Announcement title
                  </label>
                  <Input
                    id="announcement-title"
                    type="text"
                    placeholder="Eg. Recruitment Drive Update"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-200" htmlFor="announcement-message">
                    Announcement message
                  </label>
                  <textarea
                    id="announcement-message"
                    className="min-h-[140px] w-full rounded-md border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-slate-50 shadow-sm outline-none ring-sky-500/50 placeholder:text-slate-500 focus:border-sky-500 focus:ring-2"
                    placeholder="Write the details of your announcement here..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-200" htmlFor="announcement-audience">
                    Target audience (optional)
                  </label>
                  <select
                    id="announcement-audience"
                    className="w-full rounded-md border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-slate-50 shadow-sm outline-none ring-sky-500/50 focus:border-sky-500 focus:ring-2"
                    value={audience}
                    onChange={(e) => setAudience(e.target.value)}
                  >
                    <option value="ALL">All</option>
                    <option value="MEMBERS">Members</option>
                    <option value="VOLUNTEERS">Volunteers</option>
                  </select>
                </div>

                <div className="flex justify-end">
                  <Button type="submit">
                    Post
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    </PrivateRoute>
  );
}

export default PostAnnouncement;

