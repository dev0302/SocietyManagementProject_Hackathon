import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getPlatformConfig, updatePlatformConfig } from "@/services/operations/adminAPI";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import { SpinnerCustom } from "@/components/ui/spinner";
import PrivateRoute from "@/components/core/auth/PrivateRoute";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { ROLES } from "@/config/roles";

function PlatformConfig() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [config, setConfig] = useState({ adminEmails: [], facultyWhitelist: [] });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    setLoading(true);
    try {
      const response = await getPlatformConfig();
      if (response.success) {
        setConfig(response.data || { adminEmails: [], facultyWhitelist: [] });
      }
    } catch (error) {
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to load platform configuration";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (config.adminEmails.length === 0 && config.facultyWhitelist.length === 0) {
      toast.warning("Please add at least one admin email or faculty email");
      return;
    }

    setSaving(true);
    try {
      const response = await updatePlatformConfig(config);
      if (response.success) {
        toast.success("Platform configuration updated successfully");
        setConfig(response.data);
      }
    } catch (error) {
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to update configuration";
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const addEmail = (type) => {
    const newEmail = prompt(`Enter ${type === "admin" ? "admin" : "faculty"} email:`);
    if (newEmail) {
      const email = newEmail.toLowerCase().trim();
      if (!email.includes("@")) {
        toast.error("Please enter a valid email address");
        return;
      }
      const key = type === "admin" ? "adminEmails" : "facultyWhitelist";
      if (config[key].includes(email)) {
        toast.warning("This email is already in the list");
        return;
      }
      setConfig({
        ...config,
        [key]: [...config[key], email],
      });
      toast.info(`${type === "admin" ? "Admin" : "Faculty"} email added`);
    }
  };

  const removeEmail = (type, index) => {
    const key = type === "admin" ? "adminEmails" : "facultyWhitelist";
    const email = config[key][index];
    setConfig({
      ...config,
      [key]: config[key].filter((_, i) => i !== index),
    });
    toast.info(`${type === "admin" ? "Admin" : "Faculty"} email removed`);
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
                <CardTitle>Platform Configuration</CardTitle>
                <CardDescription>
                  Manage admin emails and faculty whitelist. These emails can sign up for their respective roles.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <label className="text-sm font-medium text-slate-300">Admin Emails</label>
                      <Button size="xs" onClick={() => addEmail("admin")}>
                        Add Email
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {config.adminEmails?.map((email, index) => (
                        <div key={index} className="flex items-center justify-between rounded-md border border-slate-800 bg-slate-900/70 px-3 py-2">
                          <span className="text-xs text-slate-300">{email}</span>
                          <Button size="xs" variant="subtle" onClick={() => removeEmail("admin", index)}>
                            Remove
                          </Button>
                        </div>
                      ))}
                      {(!config.adminEmails || config.adminEmails.length === 0) && (
                        <p className="text-xs text-slate-500">No admin emails configured</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <label className="text-sm font-medium text-slate-300">Faculty Whitelist</label>
                      <Button size="xs" onClick={() => addEmail("faculty")}>
                        Add Email
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {config.facultyWhitelist?.map((email, index) => (
                        <div key={index} className="flex items-center justify-between rounded-md border border-slate-800 bg-slate-900/70 px-3 py-2">
                          <span className="text-xs text-slate-300">{email}</span>
                          <Button size="xs" variant="subtle" onClick={() => removeEmail("faculty", index)}>
                            Remove
                          </Button>
                        </div>
                      ))}
                      {(!config.facultyWhitelist || config.facultyWhitelist.length === 0) && (
                        <p className="text-xs text-slate-500">No faculty emails whitelisted</p>
                      )}
                    </div>
                  </div>
                </div>

                <Button onClick={handleSave} disabled={saving} className="w-full">
                  {saving ? <SpinnerCustom /> : "Save Configuration"}
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

export default PlatformConfig;
