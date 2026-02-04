import React, { useState } from "react";
import PrivateRoute from "@/components/core/auth/PrivateRoute";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Button from "@/components/ui/button";
import { ROLES } from "@/config/roles";
import { toast } from "sonner";
import { logMemberDecision, updateMemberRole } from "@/services/operations/coreAPI";

const initialPendingRequests = [
  { id: 1, name: "Aarav Sharma", email: "aarav.sharma@college.edu" },
  { id: 2, name: "Isha Patel", email: "isha.patel@college.edu" },
  { id: 3, name: "Rahul Verma", email: "rahul.verma@college.edu" },
];

const initialMembers = [
  { id: 11, name: "Neha Gupta", email: "neha.gupta@college.edu", role: "Member" },
  { id: 12, name: "Karan Singh", email: "karan.singh@college.edu", role: "Volunteer" },
  { id: 13, name: "Simran Kaur", email: "simran.kaur@college.edu", role: "Member" },
];

function ManageMembers() {
  const [pendingRequests, setPendingRequests] = useState(initialPendingRequests);
  const [members, setMembers] = useState(initialMembers);

  const handleApprove = async (request) => {
    setPendingRequests((prev) => prev.filter((r) => r.id !== request.id));
    setMembers((prev) => [...prev, { ...request, role: "Member" }]);

    try {
      await logMemberDecision({
        name: request.name,
        email: request.email,
        decision: "APPROVE",
      });
    } catch (error) {
      toast.error(error.message || "Failed to record approval in backend.");
    }
  };

  const handleReject = async (request) => {
    setPendingRequests((prev) => prev.filter((r) => r.id !== request.id));

    try {
      await logMemberDecision({
        name: request.name,
        email: request.email,
        decision: "REJECT",
      });
    } catch (error) {
      toast.error(error.message || "Failed to record rejection in backend.");
    }
  };

  const handleRoleChange = async (memberId, newRole) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, role: newRole } : m))
    );
    const updated = members.find((m) => m.id === memberId);

    if (!updated) return;

    try {
      await updateMemberRole({
        name: updated.name,
        email: updated.email,
        role: newRole,
      });
    } catch (error) {
      toast.error(error.message || "Failed to update role in backend.");
    }
  };

  return (
    <PrivateRoute allowedRoles={[ROLES.CORE]}>
      <div className="flex min-h-screen flex-col bg-slate-950 text-slate-50">
        <Navbar />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold tracking-tight">Manage Members</h1>
            <p className="mt-1 text-sm text-slate-400">
              Review join requests and manage roles for current members.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Pending Join Requests */}
            <Card className="bg-slate-900/60 border-slate-800">
              <CardHeader>
                <CardTitle className="text-base">Pending Join Requests</CardTitle>
                <CardDescription>Approve or reject new students who want to join.</CardDescription>
              </CardHeader>
              <CardContent>
                {pendingRequests.length === 0 ? (
                  <p className="text-sm text-slate-400">No pending requests right now.</p>
                ) : (
                  <div className="space-y-3">
                    {pendingRequests.map((req) => (
                      <div
                        key={req.id}
                        className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/40 px-3 py-2"
                      >
                        <div>
                          <p className="text-sm font-medium text-slate-100">{req.name}</p>
                          <p className="text-xs text-slate-400">{req.email}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleApprove(req)}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReject(req)}
                          >
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Current Members */}
            <Card className="bg-slate-900/60 border-slate-800">
              <CardHeader>
                <CardTitle className="text-base">Current Members</CardTitle>
                <CardDescription>Update roles for approved members.</CardDescription>
              </CardHeader>
              <CardContent>
                {members.length === 0 ? (
                  <p className="text-sm text-slate-400">No members added yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-800 text-xs uppercase tracking-wide text-slate-400">
                          <th className="py-2 pr-4 text-left font-medium">Name</th>
                          <th className="py-2 px-4 text-left font-medium">Email</th>
                          <th className="py-2 px-4 text-left font-medium">Role</th>
                        </tr>
                      </thead>
                      <tbody>
                        {members.map((member) => (
                          <tr key={member.id} className="border-b border-slate-900/80 last:border-0">
                            <td className="py-3 pr-4 font-medium text-slate-100">
                              {member.name}
                            </td>
                            <td className="py-3 px-4 text-slate-300">{member.email}</td>
                            <td className="py-3 px-4">
                              <select
                                className="rounded-md border border-slate-800 bg-slate-950/60 px-2 py-1 text-xs text-slate-50 shadow-sm outline-none ring-sky-500/50 focus:border-sky-500 focus:ring-2"
                                value={member.role}
                                onChange={(e) => handleRoleChange(member.id, e.target.value)}
                              >
                                <option value="Member">Member</option>
                                <option value="Volunteer">Volunteer</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
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

export default ManageMembers;

