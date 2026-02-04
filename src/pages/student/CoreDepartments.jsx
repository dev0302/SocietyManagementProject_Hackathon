import React, { useEffect, useState } from "react";
import PrivateRoute from "@/components/core/auth/PrivateRoute";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { ROLES } from "@/config/roles";
import { toast } from "sonner";
import {
  fetchDepartments,
  createHeadInviteLink,
  createHeadInviteByEmail,
} from "@/services/operations/coreAPI";
import { createDepartment } from "@/services/operations/societyAPI";

const PRESET_NAMES = [
  "Technical",
  "Sponsor",
  "Event Management",
  "Social Media",
];

function CoreDepartments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingDept, setAddingDept] = useState(false);
  const [newDeptName, setNewDeptName] = useState("");
  const [selectedDept, setSelectedDept] = useState(null);
  const [inviteLink, setInviteLink] = useState(null);
  const [inviteLinkLoading, setInviteLinkLoading] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteEmailLoading, setInviteEmailLoading] = useState(false);

  const loadDepartments = async () => {
    try {
      setLoading(true);
      const data = await fetchDepartments();
      if (data?.success && Array.isArray(data.data)) {
        setDepartments(data.data);
      } else {
        setDepartments([]);
      }
    } catch (error) {
      toast.error(error?.message || "Failed to load departments.");
      setDepartments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  const handleAddDepartment = async (e) => {
    e?.preventDefault();
    const name = (newDeptName || "").trim();
    if (!name) {
      toast.error("Enter a department name.");
      return;
    }
    try {
      setAddingDept(true);
      const data = await createDepartment({ name });
      if (data?.success) {
        toast.success("Department added.");
        setNewDeptName("");
        loadDepartments();
      } else {
        throw new Error(data?.message || "Failed to add department.");
      }
    } catch (error) {
      toast.error(error?.message || "Failed to add department.");
    } finally {
      setAddingDept(false);
    }
  };

  const handleGenerateInviteLink = async () => {
    if (!selectedDept?._id) return;
    try {
      setInviteLinkLoading(true);
      setInviteLink(null);
      const data = await createHeadInviteLink(selectedDept._id);
      if (data?.success && data?.data?.link) {
        setInviteLink(data.data.link);
        toast.success("Invite link generated. Share it; whoever uses it becomes Head.");
      } else {
        throw new Error(data?.message || "Failed to generate link.");
      }
    } catch (error) {
      toast.error(error?.message || "Failed to generate invite link.");
    } finally {
      setInviteLinkLoading(false);
    }
  };

  const copyLink = () => {
    if (!inviteLink) return;
    navigator.clipboard.writeText(inviteLink);
    toast.success("Link copied to clipboard.");
  };

  const handleInviteByEmail = async (e) => {
    e?.preventDefault();
    const email = (inviteEmail || "").trim();
    if (!email || !selectedDept?._id) {
      toast.error("Enter an email address.");
      return;
    }
    try {
      setInviteEmailLoading(true);
      const data = await createHeadInviteByEmail(selectedDept._id, email);
      if (data?.success) {
        toast.success("Invite created. Share the link with the user.");
        if (data?.data?.link) setInviteLink(data.data.link);
        setInviteEmail("");
      } else {
        throw new Error(data?.message || "Failed to send invite.");
      }
    } catch (error) {
      toast.error(error?.message || "Failed to send invite.");
    } finally {
      setInviteEmailLoading(false);
    }
  };

  const headLabel = (head) => {
    if (!head) return "—";
    if (typeof head === "string") return head;
    const n = [head.firstName, head.lastName].filter(Boolean).join(" ");
    return n || head.email || "—";
  };

  return (
    <PrivateRoute allowedRoles={[ROLES.CORE]}>
      <div className="flex min-h-screen flex-col bg-slate-950 text-slate-50">
        <Navbar />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                Departments &amp; Heads
              </h1>
              <p className="mt-1 text-sm text-slate-400">
                Add departments and invite heads via link or email.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <form
                onSubmit={handleAddDepartment}
                className="flex flex-wrap items-center gap-2"
              >
                <select
                  className="rounded-md border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-slate-50 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/50"
                  value={newDeptName}
                  onChange={(e) => setNewDeptName(e.target.value)}
                  placeholder="Department name"
                >
                  <option value="">Select or type below</option>
                  {PRESET_NAMES.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
                <Input
                  className="min-w-[180px]"
                  placeholder="Or type custom name"
                  value={newDeptName}
                  onChange={(e) => setNewDeptName(e.target.value)}
                />
                <Button type="submit" disabled={addingDept}>
                  {addingDept ? "Adding…" : "Add Department"}
                </Button>
              </form>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="bg-slate-900/60 border-slate-800">
              <CardHeader>
                <CardTitle className="text-base">Departments</CardTitle>
                <CardDescription>
                  Click a department to get an invite link or add by email.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-sm text-slate-400">Loading…</p>
                ) : departments.length === 0 ? (
                  <p className="text-sm text-slate-400">
                    No departments yet. Add one using the button above.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {departments.map((dept) => (
                      <button
                        key={dept._id}
                        type="button"
                        onClick={() => {
                          setSelectedDept(dept);
                          setInviteLink(null);
                          setInviteEmail("");
                        }}
                        className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                          selectedDept?._id === dept._id
                            ? "border-sky-500/50 bg-sky-500/10"
                            : "border-slate-800 bg-slate-950/40 hover:bg-slate-900/60"
                        }`}
                      >
                        <span className="font-medium text-slate-100">
                          {dept.name}
                        </span>
                        <span className="text-xs text-slate-400">
                          Head: {headLabel(dept.head)}
                          {typeof dept.membersCount === "number" && (
                            <> · {dept.membersCount} members</>
                          )}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-slate-900/60 border-slate-800">
              <CardHeader>
                <CardTitle className="text-base">Invite as Head</CardTitle>
                <CardDescription>
                  {selectedDept
                    ? `Options for ${selectedDept.name}`
                    : "Select a department first."}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {!selectedDept ? (
                  <p className="text-sm text-slate-400">
                    Click a department in the list to see invite options.
                  </p>
                ) : (
                  <>
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-slate-300">
                        Invite link
                      </p>
                      <p className="text-xs text-slate-400">
                        Share this link. Whoever uses it will be added as Head
                        of this department.
                      </p>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          size="sm"
                          onClick={handleGenerateInviteLink}
                          disabled={inviteLinkLoading}
                        >
                          {inviteLinkLoading ? "Generating…" : "Generate link"}
                        </Button>
                        {inviteLink && (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={copyLink}
                          >
                            Copy link
                          </Button>
                        )}
                      </div>
                      {inviteLink && (
                        <p className="break-all rounded border border-slate-800 bg-slate-950/60 px-2 py-1 text-xs text-slate-300">
                          {inviteLink}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2 border-t border-slate-800 pt-4">
                      <p className="text-xs font-medium text-slate-300">
                        Add by email
                      </p>
                      <p className="text-xs text-slate-400">
                        Invite a specific person by email; they will be added as
                        Head when they accept.
                      </p>
                      <form
                        onSubmit={handleInviteByEmail}
                        className="flex flex-wrap gap-2"
                      >
                        <Input
                          type="email"
                          placeholder="email@example.com"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                          className="min-w-[200px]"
                        />
                        <Button
                          type="submit"
                          size="sm"
                          disabled={inviteEmailLoading}
                        >
                          {inviteEmailLoading ? "Sending…" : "Send invite"}
                        </Button>
                      </form>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    </PrivateRoute>
  );
}

export default CoreDepartments;
