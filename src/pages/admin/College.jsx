import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getMyCollege, upsertMyCollege } from "@/services/operations/collegeAPI";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import { SpinnerCustom } from "@/components/ui/spinner";
import PrivateRoute from "@/components/core/auth/PrivateRoute";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { ROLES } from "@/config/roles";

function College() {
  const navigate = useNavigate();
  const [college, setCollege] = useState({
    name: "",
    email: "",
    address: "",
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCollege();
  }, []);

  const loadCollege = async () => {
    setLoading(true);
    try {
      const response = await getMyCollege();
      if (response.success && response.data) {
        setCollege({
          name: response.data.name || "",
          email: response.data.email || "",
          address: response.data.address || "",
        });
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || error?.message || "Failed to load college profile";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!college.name.trim() || !college.email.trim()) {
      toast.error("Name and email are required");
      return;
    }

    setSaving(true);
    try {
      const response = await upsertMyCollege(college);
      if (response.success) {
        toast.success("College profile saved successfully");
        setCollege(response.data || college);
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || error?.message || "Failed to save college profile";
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <PrivateRoute allowedRoles={[ROLES.ADMIN]}>
        <div className="flex min-h-screen flex-col bg-slate-950 text-slate-50">
          <Navbar />
          <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
            <div className="flex items-center justify-center p-8">
              <SpinnerCustom />
            </div>
          </main>
          <Footer />
        </div>
      </PrivateRoute>
    );
  }

  return (
    <PrivateRoute allowedRoles={[ROLES.ADMIN]}>
      <div className="flex min-h-screen flex-col bg-slate-950 text-slate-50">
        <Navbar />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
          <div className="mb-6">
            <Button variant="outline" size="sm" onClick={() => navigate("/dashboard")}>
              ← Back to Dashboard
            </Button>
          </div>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>College Profile</CardTitle>
                <CardDescription>
                  Configure your college details. This information will be used when onboarding
                  societies and faculty members.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">College Name</label>
                  <Input
                    placeholder="Your College Name"
                    value={college.name}
                    onChange={(e) => setCollege({ ...college, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Email</label>
                  <Input
                    type="email"
                    placeholder="contact@college.edu"
                    value={college.email}
                    onChange={(e) => setCollege({ ...college, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Address (Optional)</label>
                  <Input
                    placeholder="College address"
                    value={college.address}
                    onChange={(e) => setCollege({ ...college, address: e.target.value })}
                  />
                </div>
                <Button onClick={handleSave} disabled={saving} className="w-full">
                  {saving ? <SpinnerCustom /> : "Save College Profile"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    </PrivateRoute>
  );
}

export default College;
