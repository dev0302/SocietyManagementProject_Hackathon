import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { toast } from "sonner";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { setUser, setLoading } from "@/redux/slices/authSlice";
import { getMyProfile, updateProfile, updateAvatar } from "@/services/operations/profileAPI";

function Profile() {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    gender: "",
    dob: "",
    about: "",
    phoneNumber: "",
    yearOfStudy: "",
    instagram: "",
    linkedin: "",
    github: "",
  });
  const [avatarPreview, setAvatarPreview] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [savingAvatar, setSavingAvatar] = useState(false);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  useEffect(() => {
    let isMounted = true;
    const loadProfile = async () => {
      dispatch(setLoading(true));
      try {
        const response = await getMyProfile();
        if (!response.success) {
          throw new Error(response.message || "Failed to load profile");
        }
        if (!isMounted) return;

        const data = response.data;
        const profile = data.profile || {};

        setFormData({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          gender: profile.gender || "",
          dob: profile.dob ? profile.dob.substring(0, 10) : "",
          about: profile.about || "",
          phoneNumber: profile.phoneNumber || "",
          yearOfStudy: profile.yearOfStudy || "",
          instagram: profile.socials?.instagram || "",
          linkedin: profile.socials?.linkedin || "",
          github: profile.socials?.github || "",
        });
        setAvatarPreview(profile.avatarUrl || data.avatarUrl || "");
        dispatch(setUser(data));
      } catch (error) {
        toast.error(error.message || "Failed to load profile");
      } finally {
        dispatch(setLoading(false));
      }
    };

    loadProfile();
    return () => {
      isMounted = false;
    };
  }, [dispatch]);

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSocialChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(setLoading(true));
    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        gender: formData.gender || undefined,
        dob: formData.dob || undefined,
        about: formData.about || undefined,
        phoneNumber: formData.phoneNumber || undefined,
        yearOfStudy: formData.yearOfStudy || undefined,
        socials: {
          instagram: formData.instagram || undefined,
          linkedin: formData.linkedin || undefined,
          github: formData.github || undefined,
        },
      };

      const response = await updateProfile(payload);
      if (!response.success) {
        throw new Error(response.message || "Failed to update profile");
      }

      dispatch(setUser(response.data));
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    const url = URL.createObjectURL(file);
    setAvatarPreview(url);
  };

  const handleAvatarSave = async () => {
    if (!avatarFile) {
      toast.error("Please select an image first");
      return;
    }
    setSavingAvatar(true);
    try {
      const response = await updateAvatar(avatarFile);
      if (!response.success) {
        throw new Error(response.message || "Failed to update avatar");
      }
      dispatch(setUser(response.data));
      setAvatarPreview(response.data.avatarUrl || response.data.profile?.avatarUrl || "");
      toast.success("Display picture updated");
    } catch (error) {
      toast.error(error.message || "Failed to update display picture");
    } finally {
      setSavingAvatar(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-50">
      <Navbar />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        <Card className="border-slate-800 bg-slate-900/60">
          <CardHeader>
            <CardTitle>My Profile</CardTitle>
            <CardDescription>Manage your personal details and display picture</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
              <div>
                <Avatar className="h-20 w-20">
                  {avatarPreview ? (
                    <AvatarImage src={avatarPreview} alt="Avatar" />
                  ) : (
                    <AvatarFallback className="text-lg">
                      {user.firstName?.[0]}
                      {user.lastName?.[0]}
                    </AvatarFallback>
                  )}
                </Avatar>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-slate-100">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-slate-400">{user.email}</p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="text-xs text-slate-300 file:mr-3 file:rounded-md file:border-0 file:bg-slate-800 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-slate-100 hover:file:bg-slate-700"
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleAvatarSave}
                    disabled={savingAvatar}
                  >
                    {savingAvatar ? "Saving..." : "Save picture"}
                  </Button>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-6 md:grid-cols-2">
              <div className="space-y-3">
                <label className="block text-xs font-medium text-slate-300">First name</label>
                <Input
                  value={formData.firstName}
                  onChange={handleChange("firstName")}
                  placeholder="First name"
                  required
                />
              </div>
              <div className="space-y-3">
                <label className="block text-xs font-medium text-slate-300">Last name</label>
                <Input
                  value={formData.lastName}
                  onChange={handleChange("lastName")}
                  placeholder="Last name"
                  required
                />
              </div>
              <div className="space-y-3">
                <label className="block text-xs font-medium text-slate-300">Gender</label>
                <select
                  value={formData.gender}
                  onChange={handleChange("gender")}
                  className="w-full rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-sky-500"
                >
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>
              <div className="space-y-3">
                <label className="block text-xs font-medium text-slate-300">Date of birth</label>
                <Input
                  type="date"
                  value={formData.dob}
                  onChange={handleChange("dob")}
                />
              </div>
              <div className="space-y-3">
                <label className="block text-xs font-medium text-slate-300">Phone number</label>
                <Input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={handleChange("phoneNumber")}
                  placeholder="+91 98765 43210"
                />
              </div>
              <div className="space-y-3">
                <label className="block text-xs font-medium text-slate-300">Year of study</label>
                <Input
                  value={formData.yearOfStudy}
                  onChange={handleChange("yearOfStudy")}
                  placeholder="e.g. 2nd year"
                />
              </div>
              <div className="md:col-span-2 space-y-3">
                <label className="block text-xs font-medium text-slate-300">About you</label>
                <textarea
                  value={formData.about}
                  onChange={handleChange("about")}
                  rows={3}
                  className="w-full rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-sky-500"
                  placeholder="Tell societies a bit about yourself, interests, and experience."
                />
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-medium text-slate-300">Instagram</label>
                <Input
                  value={formData.instagram}
                  onChange={handleSocialChange("instagram")}
                  placeholder="https://instagram.com/your-handle"
                />
              </div>
              <div className="space-y-3">
                <label className="block text-xs font-medium text-slate-300">LinkedIn</label>
                <Input
                  value={formData.linkedin}
                  onChange={handleSocialChange("linkedin")}
                  placeholder="https://linkedin.com/in/your-profile"
                />
              </div>
              <div className="space-y-3">
                <label className="block text-xs font-medium text-slate-300">GitHub</label>
                <Input
                  value={formData.github}
                  onChange={handleSocialChange("github")}
                  placeholder="https://github.com/your-username"
                />
              </div>

              <div className="md:col-span-2 flex justify-end">
                <Button type="submit" disabled={loading}>
                  {loading ? "Saving..." : "Save changes"}
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

export default Profile;

