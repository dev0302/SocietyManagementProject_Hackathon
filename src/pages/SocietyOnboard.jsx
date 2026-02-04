import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "sonner";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import { getCollegeByCode, createSocietyRequest } from "@/services/operations/collegeAPI";

function useQuery() {
  const { search } = useLocation();
  return new URLSearchParams(search);
}

function SocietyOnboard() {
  const query = useQuery();
  const [college, setCollege] = useState(null);
  const [loadingCollege, setLoadingCollege] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "TECH",
    logoUrl: "",
    facultyName: "",
    facultyEmail: "",
    presidentName: "",
    email: "",
    collegeCode: "",
  });

  useEffect(() => {
    const codeFromUrl = query.get("code") || "";
    if (codeFromUrl) {
      setFormData((prev) => ({ ...prev, collegeCode: codeFromUrl.toUpperCase() }));
      loadCollege(codeFromUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadCollege = async (code) => {
    setLoadingCollege(true);
    try {
      const response = await getCollegeByCode(code);
      if (response.success) {
        setCollege(response.data);
      } else {
        toast.error(response.message || "Invalid college code");
      }
    } catch (error) {
      const message = error?.message || "Failed to load college";
      toast.error(message);
    } finally {
      setLoadingCollege(false);
    }
  };

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.collegeCode) {
      toast.error("Society name, email and college code are required");
      return;
    }
    setSubmitting(true);
    try {
      const response = await createSocietyRequest(formData);
      if (!response.success) {
        throw new Error(response.message || "Failed to submit request");
      }
      toast.success("Request submitted to college admin. You will be contacted after review.");
      setFormData((prev) => ({
        ...prev,
        name: "",
        logoUrl: "",
        facultyName: "",
        facultyEmail: "",
        presidentName: "",
        email: "",
      }));
    } catch (error) {
      const message = error?.message || "Failed to submit request";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-50">
      <Navbar />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
        <Card>
          <CardHeader>
            <CardTitle>Society onboarding</CardTitle>
            <CardDescription>
              Fill in your society details and use the college&apos;s unique code to send a request
              to the admin.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingCollege ? (
              <p className="mb-4 text-xs text-slate-500">Validating college code…</p>
            ) : college ? (
              <div className="mb-4 rounded-md border border-slate-800 bg-slate-900/60 p-3 text-xs text-slate-300">
                <p className="font-medium text-slate-100">{college.name}</p>
                <p className="mt-1 font-mono text-[11px] text-sky-300">
                  College code: {college.uniqueCode}
                </p>
              </div>
            ) : formData.collegeCode ? (
              <p className="mb-4 text-xs text-slate-500">
                Entered code: {formData.collegeCode}. If this is incorrect, please check with your
                admin.
              </p>
            ) : null}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-300">Society name</label>
                <Input
                  value={formData.name}
                  onChange={handleChange("name")}
                  placeholder="e.g. Robotics Club"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-300">Category</label>
                <select
                  value={formData.category}
                  onChange={handleChange("category")}
                  className="w-full rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-sky-500"
                >
                  <option value="TECH">Tech</option>
                  <option value="NON_TECH">Non-tech</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-300">
                  Profile photo / logo URL (optional)
                </label>
                <Input
                  value={formData.logoUrl}
                  onChange={handleChange("logoUrl")}
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-300">
                  Faculty name (optional)
                </label>
                <Input
                  value={formData.facultyName}
                  onChange={handleChange("facultyName")}
                  placeholder="Faculty coordinator name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-300">
                  Faculty coordinator email (optional)
                </label>
                <Input
                  type="email"
                  value={formData.facultyEmail}
                  onChange={handleChange("facultyEmail")}
                  placeholder="faculty@college.edu"
                />
                <p className="text-[11px] text-slate-500">
                  If the faculty has already signed up, enter their platform email to grant them
                  society management rights.
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-300">
                  President name (optional)
                </label>
                <Input
                  value={formData.presidentName}
                  onChange={handleChange("presidentName")}
                  placeholder="Student president name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-300">Society contact email</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={handleChange("email")}
                  placeholder="official-society@college.edu"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-300">College unique code</label>
                <Input
                  value={formData.collegeCode}
                  onChange={handleChange("collegeCode")}
                  placeholder="e.g. ABC123"
                  className="font-mono"
                />
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Submitting..." : "Send request to admin"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}

export default SocietyOnboard;

