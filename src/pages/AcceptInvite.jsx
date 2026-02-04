import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Button from "@/components/ui/button";
import { toast } from "sonner";
import { acceptInvite } from "@/services/operations/societyAPI";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";

function AcceptInvite() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  const { user, token: authToken } = useSelector((state) => state.auth);
  const [accepting, setAccepting] = useState(false);
  const [accepted, setAccepted] = useState(false);

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
              <Button variant="outline" onClick={() => navigate("/dashboard")}>
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  if (!authToken || !user) {
    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(`/accept-invite?token=${token}`)}`}
        replace
      />
    );
  }

  const handleAccept = async () => {
    try {
      setAccepting(true);
      const data = await acceptInvite({ token });
      if (data?.success) {
        setAccepted(true);
        toast.success("Invite accepted. You are now added as Head.");
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

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-50">
      <Navbar />
      <main className="mx-auto flex max-w-md flex-1 items-center justify-center px-4 py-8">
        <Card className="w-full bg-slate-900/60 border-slate-800">
          <CardHeader>
            <CardTitle>Department invite</CardTitle>
            <CardDescription>
              You have been invited to join as <strong>Head</strong> of a
              department. Accept to continue.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {accepted ? (
              <p className="text-sm text-slate-300">
                Success! Redirecting to dashboard…
              </p>
            ) : (
              <Button
                className="w-full"
                onClick={handleAccept}
                disabled={accepting}
              >
                {accepting ? "Accepting…" : "Accept invite"}
              </Button>
            )}
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => navigate("/dashboard")}
            >
              Cancel
            </Button>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}

export default AcceptInvite;
