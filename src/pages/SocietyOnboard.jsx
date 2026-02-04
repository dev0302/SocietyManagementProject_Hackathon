import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getCollegeByCode, createSocietyRequest } from "@/services/operations/collegeAPI";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import { SpinnerCustom } from "@/components/ui/spinner";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";

function SocietyOnboard() {
  const navigate = useNavigate();
  const [collegeCode, setCollegeCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [college, setCollege] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleLookup = async () => {
    if (!collegeCode.trim()) {
      toast.error("Please enter a college code");
      return;
    }

    setLoading(true);
    try {
      const response = await getCollegeByCode(collegeCode.trim());
      if (response.success && response.data) {
        setCollege(response.data);
        toast.success("College found!");
      } else {
        toast.error("College not found with this code");
        setCollege(null);
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || error?.message || "Failed to find college";
      toast.error(errorMessage);
      setCollege(null);
    } finally {
      setLoading(false);
    }
  };

  const handleRequest = async () => {
    if (!college) {
      toast.error("Please find a college first");
      return;
    }

    setSubmitting(true);
    try {
      const response = await createSocietyRequest({
        collegeId: college._id,
        collegeCode: collegeCode.trim(),
      });
      if (response.success) {
        toast.success("Society request submitted successfully!");
        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || error?.message || "Failed to submit request";
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-50">
      <Navbar />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Onboard Society to College</CardTitle>
            <CardDescription>
              Enter your college&apos;s unique code to request onboarding for your society.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">College Code</label>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter college code"
                  value={collegeCode}
                  onChange={(e) => {
                    setCollegeCode(e.target.value);
                    setCollege(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleLookup();
                    }
                  }}
                />
                <Button onClick={handleLookup} disabled={loading}>
                  {loading ? <SpinnerCustom /> : "Lookup"}
                </Button>
              </div>
            </div>

            {college && (
              <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
                <h3 className="text-sm font-semibold text-slate-100">{college.name}</h3>
                {college.email && (
                  <p className="mt-1 text-xs text-slate-400">{college.email}</p>
                )}
                {college.address && (
                  <p className="mt-1 text-xs text-slate-400">{college.address}</p>
                )}
                <div className="mt-3">
                  <Button onClick={handleRequest} disabled={submitting} className="w-full">
                    {submitting ? <SpinnerCustom /> : "Request Onboarding"}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}

export default SocietyOnboard;
