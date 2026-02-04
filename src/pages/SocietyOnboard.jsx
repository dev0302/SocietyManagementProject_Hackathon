import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import {
  getCollegeByCode,
  createSocietyRequest,
  getSocietyInviteByToken,
  createSocietyFromInvite,
} from "@/services/operations/collegeAPI";

function useQuery() {
  const { search } = useLocation();
  return new URLSearchParams(search);
}

function SocietyOnboard() {
  const query = useQuery();
  const navigate = useNavigate();
  const { user, token } = useSelector((state) => state.auth);
  const [college, setCollege] = useState(null);
  const [loadingCollege, setLoadingCollege] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [inviteData, setInviteData] = useState(null);
  const [loadingInvite, setLoadingInvite] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "TECH",
    logoUrl: "",
    facultyName: "",
    facultyEmail: "",
    presidentName: "",
    email: "",
    collegeCode: "",
  });

  const tokenFromUrl = query.get("token") || "";
  const codeFromUrl = query.get("code") || "";

  useEffect(() => {
    if (tokenFromUrl) {
      loadInvite(tokenFromUrl);
    } else if (codeFromUrl) {
      setFormData((prev) => ({ ...prev, collegeCode: codeFromUrl.toUpperCase() }));
      loadCollege(codeFromUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenFromUrl, codeFromUrl]);

  const loadInvite = async (token) => {
    setLoadingInvite(true);
    try {
      const res = await getSocietyInviteByToken(token);
      if (res.success && res.data) {
        setInviteData({ ...res.data, token });
        setFormData((prev) => ({
          ...prev,
          collegeCode: res.data.collegeCode || "",
          facultyEmail: res.data.facultyHeadEmail || "",
        }));
      } else {
        toast.error(res.message || "Invalid or expired invite");
      }
    } catch (err) {
      toast.error(err?.message || "Failed to load invite");
    } finally {
      setLoadingInvite(false);
    }
  };

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

  const handleSubmitFromInvite = async (e) => {
    e.preventDefault();
    if (!inviteData?.token || !formData.name) {
      toast.error("Society name is required");
      return;
    }
    if (!token || user?.email?.toLowerCase() !== inviteData.facultyHeadEmail?.toLowerCase()) {
      toast.error("Please log in with the faculty head email: " + inviteData.facultyHeadEmail);
      return;
    }
    setSubmitting(true);
    try {
      const res = await createSocietyFromInvite({
        token: inviteData.token,
        name: formData.name,
        description: formData.description,
        category: formData.category,
        logoUrl: formData.logoUrl,
        facultyName: formData.facultyName,
        presidentName: formData.presidentName,
        contactEmail: formData.email || user.email,
      });
      if (res.success) {
        toast.success("Society created. You are the faculty head.");
        navigate("/admin/college");
      } else {
        throw new Error(res.message || "Failed to create society");
      }
    } catch (err) {
      toast.error(err?.message || "Failed to create society");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (inviteData) {
      return handleSubmitFromInvite(e);
    }
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

  const canCreateFromInvite =
    inviteData && token && user?.email?.toLowerCase() === inviteData.facultyHeadEmail?.toLowerCase();

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-50">
      <Navbar />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
        <Card>
          <CardHeader>
            <CardTitle>
              {inviteData ? "Create your society (faculty head)" : "Society onboarding"}
            </CardTitle>
            <CardDescription>
              {inviteData
                ? "This link was sent to you as the faculty head. Log in with the same email to create the society."
                : "Fill in your society details and use the college's unique code to send a request to the admin."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingInvite && (
              <p className="mb-4 text-xs text-slate-500">Validating invite…</p>
            )}
            {inviteData && !loadingInvite && (
              <div className="mb-4 rounded-md border border-sky-800/60 bg-sky-950/30 p-3 text-xs text-slate-300">
                <p className="font-medium text-slate-100">
                  Faculty head: {inviteData.facultyHeadEmail}
                </p>
                {inviteData.collegeName && (
                  <p className="mt-1 text-sky-300">{inviteData.collegeName}</p>
                )}
                {!token ? (
                  <p className="mt-2 text-amber-300">
                    Please log in or sign up with the email above to create the society.
                  </p>
                ) : !canCreateFromInvite ? (
                  <p className="mt-2 text-amber-300">
                    This link is for {inviteData.facultyHeadEmail}. You are logged in as{" "}
                    {user?.email}.
                  </p>
                ) : null}
              </div>
            )}
            {loadingCollege && !inviteData ? (
              <p className="mb-4 text-xs text-slate-500">Validating college code…</p>
            ) : college && !inviteData ? (
              <div className="mb-4 rounded-md border border-slate-800 bg-slate-900/60 p-3 text-xs text-slate-300">
                <p className="font-medium text-slate-100">{college.name}</p>
                <p className="mt-1 font-mono text-[11px] text-sky-300">
                  College code: {college.uniqueCode}
                </p>
              </div>
            ) : formData.collegeCode && !inviteData ? (
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
              {!inviteData && (
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
              )}
              {!inviteData && (
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-300">College unique code</label>
                  <Input
                    value={formData.collegeCode}
                    onChange={handleChange("collegeCode")}
                    placeholder="e.g. ABC123"
                    className="font-mono"
                  />
                </div>
              )}
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={
                    submitting ||
                    (inviteData && !canCreateFromInvite) ||
                    (inviteData && !formData.name)
                  }
                >
                  {submitting
                    ? "Submitting..."
                    : inviteData
                      ? canCreateFromInvite
                        ? "Create society"
                        : "Log in with faculty email to continue"
                      : "Send request to admin"}
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

