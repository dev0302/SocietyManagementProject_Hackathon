import React, { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { registerAdmin, registerFaculty, registerStudent } from "@/services/operations/authAPI";
import { sendOTP } from "@/services/operations/otpAPI";
import { setUser, setToken, setLoading } from "@/redux/slices/authSlice";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import { SpinnerCustom } from "@/components/ui/spinner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail } from "lucide-react";

function SignupForm({ role: initialRole = "student" }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.auth);
  const [step, setStep] = useState(1); // 1: form, 2: OTP sent
  const [accountType, setAccountType] = useState(
    ["admin", "faculty", "student"].includes((initialRole || "").toLowerCase())
      ? initialRole.toLowerCase()
      : "student"
  );
  const [studentType, setStudentType] = useState("MEMBER"); // CORE | HEAD | MEMBER (UI only)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    otp: "",
  });
  const [sendingOTP, setSendingOTP] = useState(false);

  const title = useMemo(() => {
    if (accountType === "admin") return "Admin";
    if (accountType === "faculty") return "Faculty";
    return "Student";
  }, [accountType]);

  const handleSendOTP = async () => {
    if (!formData.email) {
      toast.error("Please enter your email first");
      return;
    }

    if (!formData.firstName || !formData.lastName || !formData.password || !formData.confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setSendingOTP(true);

    try {
      const response = await sendOTP(
        formData.email,
        accountType,
        accountType === "student" ? studentType : undefined,
      );
      if (response.success) {
        toast.success("OTP sent to your email. Please check your inbox.");
        setStep(2);
      }
    } catch (err) {
      const errorMessage = err?.message || "Failed to send OTP. Please try again.";
      toast.error(errorMessage);
    } finally {
      setSendingOTP(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.otp) {
      toast.error("Please enter the OTP");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    dispatch(setLoading(true));

    try {
      let response;
      if (accountType === "admin") {
        response = await registerAdmin(formData);
      } else if (accountType === "faculty") {
        response = await registerFaculty(formData);
      } else {
        response = await registerStudent({
          ...formData,
          role: studentType, // CORE | HEAD | MEMBER (backend defaults to STUDENT if invalid/missing)
        });
      }

      if (response.success) {
        dispatch(setUser(response.user));
        dispatch(setToken(response.token));
        toast.success(`Welcome, ${response.user.firstName}! Account created successfully.`);
        navigate("/dashboard");
      }
    } catch (err) {
      const errorMessage = err?.response?.data?.message || err?.message || "Registration failed. Please check your details.";
      toast.error(errorMessage);
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-xl">Sign Up - {title}</CardTitle>
        <CardDescription>
          {accountType === "admin" && "Email must be pre-approved in platform config"}
          {accountType === "faculty" && "Email must be in faculty whitelist"}
          {accountType === "student" && "Create your student account"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Account type selector */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-300">Sign up as</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { key: "admin", label: "Admin" },
                { key: "faculty", label: "Faculty" },
                { key: "student", label: "Student" },
              ].map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  disabled={step > 1}
                  onClick={() => {
                    setAccountType(opt.key);
                    // keep student subtype defaulted
                    if (opt.key !== "student") setStudentType("MEMBER");
                  }}
                  className={`rounded-lg border px-3 py-2 text-sm transition-all ${
                    accountType === opt.key
                      ? "border-sky-400/60 bg-sky-500/10 text-slate-50"
                      : "border-slate-800/80 bg-slate-900/40 text-slate-300 hover:text-slate-50"
                  } ${step > 1 ? "opacity-60 cursor-not-allowed" : ""}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Student subtype selector */}
          {accountType === "student" && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-300">Student type</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: "CORE", label: "Core" },
                  { key: "HEAD", label: "Head" },
                  { key: "MEMBER", label: "Member" },
                ].map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    disabled={step > 1}
                    onClick={() => setStudentType(opt.key)}
                    className={`rounded-lg border px-3 py-2 text-sm transition-all ${
                      studentType === opt.key
                        ? "border-cyan-400/60 bg-cyan-500/10 text-slate-50"
                        : "border-slate-800/80 bg-slate-900/40 text-slate-300 hover:text-slate-50"
                    } ${step > 1 ? "opacity-60 cursor-not-allowed" : ""}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-300">First Name</label>
              <Input
                type="text"
                placeholder="John"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
                disabled={step > 1}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-300">Last Name</label>
              <Input
                type="text"
                placeholder="Doe"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
                disabled={step > 1}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-300">Email</label>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="you@college.edu"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                disabled={step > 1}
                className="flex-1"
              />
              {step === 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSendOTP}
                  disabled={sendingOTP}
                >
                  {sendingOTP ? <SpinnerCustom /> : <Mail className="h-4 w-4" />}
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-300">Password</label>
            <Input
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              disabled={step > 1}
              minLength={6}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-300">Confirm Password</label>
            <Input
              type="password"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              required
              disabled={step > 1}
            />
          </div>

          {step >= 2 && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-300">Enter OTP</label>
              <Input
                type="text"
                placeholder="123456"
                value={formData.otp}
                onChange={(e) => setFormData({ ...formData, otp: e.target.value.replace(/\D/g, "").slice(0, 6) })}
                required
                maxLength={6}
                className="text-center text-2xl tracking-widest font-mono"
              />
              <p className="text-xs text-slate-500">
                Check your email for the 6-digit OTP. It expires in 10 minutes.
              </p>
            </div>
          )}

          {step >= 2 ? (
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <SpinnerCustom /> : "Complete Registration"}
            </Button>
          ) : (
            <Button
              type="button"
              className="w-full"
              onClick={handleSendOTP}
              disabled={sendingOTP}
            >
              {sendingOTP ? <SpinnerCustom /> : "Send OTP"}
            </Button>
          )}
        </form>
      </CardContent>
    </Card>
  );
}

export default SignupForm;
