import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { toast } from "sonner";
import { acceptInvite } from "@/services/operations/societyAPI";
import { getInviteInfo, signupWithInvite } from "@/services/operations/authAPI";
import { setUser, setToken } from "@/redux/slices/authSlice";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";

function AcceptInvite() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const token = searchParams.get("token");
  const { user, token: authToken } = useSelector((state) => state.auth);

  const [inviteInfo, setInviteInfo] = useState(null);
  const [inviteLoading, setInviteLoading] = useState(!!token);
  const [inviteError, setInviteError] = useState(null);

  const [accepting, setAccepting] = useState(false);
  const [accepted, setAccepted] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [signingUp, setSigningUp] = useState(false);

  useEffect(() => {
    if (!token) return;
    const fetchInvite = async () => {
      try {
        setInviteLoading(true);
        setInviteError(null);
        const data = await getInviteInfo(token);
        if (data?.success && data?.data) {
          setInviteInfo(data.data);
          if (data.data.email) {
            setEmail(data.data.email);
          }
        } else {
          setInviteError("Invalid or expired invite.");
        }
      } catch (err) {
        const msg = err?.message || "Failed to load invite.";
        setInviteError(msg);
      } finally {
        setInviteLoading(false);
      }
    };
    fetchInvite();
  }, [token]);

  const handleAccept = async () => {
    if (!token) return;
    try {
      setAccepting(true);
      const data = await acceptInvite({ token });
      if (data?.success) {
        setAccepted(true);
        toast.success(
          inviteInfo?.role === "MEMBER"
            ? "Invite accepted. You are now added as a Member."
            : "Invite accepted. You are now added as Head."
        );
        setTimeout(() => navigate("/dashboard", { replace: true }), 1500);
      } else {
        throw new Error(data?.message || "Failed to accept invite.");
      }
    } catch (error) {
      toast.error(error?.message || "Failed to accept invite.");
    } finally {
      setAccepting(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    const trimmedFirst = firstName.trim();
    const trimmedLast = lastName.trim();
    if (!trimmedEmail || !password || !confirmPassword || !trimmedFirst || !trimmedLast) {
      toast.error("Please fill in all fields.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    try {
      setSigningUp(true);
      const data = await signupWithInvite({
        token,
        email: trimmedEmail,
        password,
        confirmPassword,
        firstName: trimmedFirst,
        lastName: trimmedLast,
      });
      if (data?.success && data?.user && data?.token) {
        dispatch(setUser(data.user));
        dispatch(setToken(data.token));
        toast.success(
          inviteInfo?.role === "MEMBER"
            ? "Account created. You are now a Member of the department."
            : "Account created. You are now Head of the department."
        );
        setTimeout(() => navigate("/dashboard", { replace: true }), 800);
      } else {
        throw new Error(data?.message || "Sign up failed.");
      }
    } catch (error) {
      toast.error(error?.message || "Sign up failed. Please try again.");
    } finally {
      setSigningUp(false);
    }
  };

  if (!token) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-950 text-slate-50">
        <Navbar />
        <main className="mx-auto flex max-w-md flex-1 items-center justify-center px-4 py-8">
          <Card className="w-full bg-slate-900/60 border-slate-800">
            <CardHeader>
              <CardTitle>Invalid invite</CardTitle>
              <CardDescription>This invite link is missing a token.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" onClick={() => navigate("/")}>
                Go to Home
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  if (inviteLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-950 text-slate-50">
        <Navbar />
        <main className="mx-auto flex max-w-md flex-1 items-center justify-center px-4 py-8">
          <p className="text-sm text-slate-400">Loading invite…</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (inviteError || !inviteInfo) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-950 text-slate-50">
        <Navbar />
        <main className="mx-auto flex max-w-md flex-1 items-center justify-center px-4 py-8">
          <Card className="w-full bg-slate-900/60 border-slate-800">
            <CardHeader>
              <CardTitle>Invalid or expired invite</CardTitle>
              <CardDescription>{inviteError || "This invite could not be loaded."}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" onClick={() => navigate("/")}>
                Go to Home
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  if (authToken && user) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-950 text-slate-50">
        <Navbar />
        <main className="mx-auto flex max-w-md flex-1 items-center justify-center px-4 py-8">
          <Card className="w-full bg-slate-900/60 border-slate-800">
            <CardHeader>
              <CardTitle>Department invite</CardTitle>
              <CardDescription>
                You have been invited to join as{" "}
                <strong>{inviteInfo.role === "MEMBER" ? "Member" : "Head"}</strong> of{" "}
                <strong>{inviteInfo.departmentName}</strong>. Accept to continue.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {accepted ? (
                <p className="text-sm text-slate-300">Success! Redirecting to dashboard…</p>
              ) : (
                <Button
                  className="w-full"
                  onClick={handleAccept}
                  disabled={accepting}
                >
                  {accepting ? "Accepting…" : "Accept invite"}
                </Button>
              )}
              <Button variant="ghost" className="w-full" onClick={() => navigate("/dashboard")}>
                Cancel
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-50">
      <Navbar />
      <main className="mx-auto flex max-w-md flex-1 items-center justify-center px-4 py-8">
        <Card className="w-full bg-slate-900/60 border-slate-800">
          <CardHeader>
            <CardTitle>
              Join as {inviteInfo.role === "MEMBER" ? "Member" : "Head"} of{" "}
              {inviteInfo.departmentName}
            </CardTitle>
            <CardDescription>
              Create your account to be enrolled as{" "}
              <strong>{inviteInfo.role === "MEMBER" ? "Member" : "Head"}</strong> of{" "}
              <strong>{inviteInfo.departmentName}</strong>. Position and department are fixed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignupSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-200">Email</label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  readOnly={!!inviteInfo.email}
                  className={inviteInfo.email ? "bg-slate-800/60" : ""}
                />
                {inviteInfo.email && (
                  <p className="text-[10px] text-slate-500">This invite was sent to this email.</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-200">First name</label>
                  <Input
                    type="text"
                    placeholder="First name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-200">Last name</label>
                  <Input
                    type="text"
                    placeholder="Last name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-200">Password</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-200">Confirm password</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <Button type="submit" className="w-full" disabled={signingUp}>
                {signingUp
                  ? "Creating account…"
                  : `Create account & join as ${inviteInfo.role === "MEMBER" ? "Member" : "Head"}`}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}

export default AcceptInvite;
