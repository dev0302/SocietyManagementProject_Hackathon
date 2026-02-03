import React, { useState } from "react";
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

function SignupForm({ role = "student" }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.auth);
  const [step, setStep] = useState(1); // 1: form, 2: OTP sent
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    otp: "",
  });
  const [sendingOTP, setSendingOTP] = useState(false);

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
      const response = await sendOTP(formData.email);
      if (response.success) {
        toast.success("OTP sent to your email. Please check your inbox.");
        setStep(2);
      }
    } catch (err) {
      const errorMessage = err?.response?.data?.message || err?.message || "Failed to send OTP. Please try again.";
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
      if (role === "admin") {
        response = await registerAdmin(formData);
      } else if (role === "faculty") {
        response = await registerFaculty(formData);
      } else {
        response = await registerStudent(formData);
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
        <CardTitle className="text-xl">Sign Up - {role.charAt(0).toUpperCase() + role.slice(1)}</CardTitle>
        <CardDescription>
          {role === "admin" && "Email must be pre-approved in platform config"}
          {role === "faculty" && "Email must be in faculty whitelist"}
          {role === "student" && "Create your student account"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
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
