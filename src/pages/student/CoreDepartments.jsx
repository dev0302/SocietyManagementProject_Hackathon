import React, { useEffect, useState } from "react";
import PrivateRoute from "@/components/core/auth/PrivateRoute";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ROLES } from "@/config/roles";
import { toast } from "sonner";
import { fetchDepartments } from "@/services/operations/coreAPI";

const initialDepartments = [
  {
    id: 1,
    name: "Technical",
    head: "Arjun Mehta",
    membersCount: 24,
  },
  {
    id: 2,
    name: "Design",
    head: "Sara Khan",
    membersCount: 15,
  },
  {
    id: 3,
    name: "Public Relations",
    head: "Rohan Das",
    membersCount: 18,
  },
  {
    id: 4,
    name: "Operations",
    head: "Priya Iyer",
    membersCount: 20,
  },
];

function CoreDepartments() {
  const [departments, setDepartments] = useState(initialDepartments);

  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const data = await fetchDepartments();
        if (data?.success && Array.isArray(data.data)) {
          setDepartments(data.data);
        }
      } catch (error) {
        toast.error(error.message || "Failed to load departments from backend.");
      }
    };

    loadDepartments();
  }, []);

  return (
    <PrivateRoute allowedRoles={[ROLES.CORE]}>
      <div className="flex min-h-screen flex-col bg-slate-950 text-slate-50">
        <Navbar />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold tracking-tight">Departments &amp; Heads</h1>
            <p className="mt-1 text-sm text-slate-400">
              Overview of your society&apos;s departments and their current heads.
            </p>
          </div>

          <Card className="bg-slate-900/60 border-slate-800">
            <CardHeader>
              <CardTitle className="text-base">Departments</CardTitle>
              <CardDescription>Read-only summary of departments and leadership.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-800 text-xs uppercase tracking-wide text-slate-400">
                      <th className="py-2 pr-4 text-left font-medium">Department</th>
                      <th className="py-2 px-4 text-left font-medium">Head</th>
                      <th className="py-2 px-4 text-left font-medium">Members</th>
                    </tr>
                  </thead>
                  <tbody>
                    {departments.map((dept) => (
                      <tr key={dept.id} className="border-b border-slate-900/80 last:border-0">
                        <td className="py-3 pr-4 font-medium text-slate-100">
                          {dept.name}
                        </td>
                        <td className="py-3 px-4 text-slate-300">
                          {dept.head}
                        </td>
                        <td className="py-3 px-4 text-slate-300">
                          {dept.membersCount ?? "-"}
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

export default CoreDepartments;

