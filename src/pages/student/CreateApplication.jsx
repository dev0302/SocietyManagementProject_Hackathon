import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { createApplication } from "@/services/operations/recruitmentAPI";
import { addApplication } from "@/redux/slices/applicationSlice";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import { SpinnerCustom } from "@/components/ui/spinner";
import PrivateRoute from "@/components/core/auth/PrivateRoute";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { ROLES } from "@/config/roles";

function CreateApplication() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({ societyId: "", departmentId: "", answers: {} });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.societyId.trim()) {
      toast.error("Please enter a society ID");
      return;
    }

    setLoading(true);

    try {
      const response = await createApplication({
        societyId: formData.societyId,
        departmentId: formData.departmentId || null,
        answers: formData.answers,
      });
      if (response.success) {
        dispatch(addApplication(response.data));
        toast.success("Application submitted successfully!");
        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);
      }
    } catch (err) {
      const errorMessage = err?.response?.data?.message || err?.message || "Failed to submit application. Please try again.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PrivateRoute allowedRoles={[ROLES.STUDENT]}>
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
                <CardTitle>Apply to Society</CardTitle>
                <CardDescription>
                  Submit your application to join a society. You can only have one active application per society.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Society ID</label>
                    <Input
                      type="text"
                      placeholder="Enter society ID"
                      value={formData.societyId}
                      onChange={(e) => setFormData({ ...formData, societyId: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Department ID (Optional)</label>
                    <Input
                      type="text"
                      placeholder="Enter department ID if applicable"
                      value={formData.departmentId}
                      onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Why do you want to join? (Optional)</label>
                    <textarea
                      className="flex min-h-[100px] w-full rounded-md border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
                      placeholder="Tell us about yourself..."
                      value={formData.answers?.why || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          answers: { ...formData.answers, why: e.target.value },
                        })
                      }
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? <SpinnerCustom /> : "Submit Application"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    </PrivateRoute>
  );
}

export default CreateApplication;
