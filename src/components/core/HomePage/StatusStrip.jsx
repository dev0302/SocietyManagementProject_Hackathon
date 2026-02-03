import React, { useEffect, useState } from "react";
import axios from "axios";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { SpinnerCustom } from "@/components/ui/spinner";

function StatusStrip() {
  const [status, setStatus] = useState("idle"); // idle | loading | ok | error
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function checkHealth() {
      try {
        setStatus("loading");
        const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
        const res = await axios.get(`${baseUrl}/api/health`, { timeout: 5000 });
        if (res.data?.success) {
          setStatus("ok");
          setMessage(res.data.message || "Backend is running");
        } else {
          setStatus("error");
          setMessage("Backend responded but health check failed.");
        }
      } catch (error) {
        setStatus("error");
        if (error.code === "ECONNABORTED") {
          setMessage("Backend request timed out");
        } else if (error.response) {
          setMessage(`Backend error: ${error.response.status}`);
        } else {
          setMessage("Cannot reach backend. Check if server is running.");
        }
      }
    }

    checkHealth();
    // Check health every 30 seconds
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="border-b border-slate-800/50 bg-slate-900/80">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2 text-[11px]">
        <Alert className="flex-1 border-none bg-transparent px-0 py-0">
          <AlertTitle className="flex items-center gap-2 text-[11px]">
            <span
              className={`inline-flex h-2.5 w-2.5 rounded-full ${
                status === "ok"
                  ? "bg-emerald-400/80 shadow-[0_0_8px_rgba(52,211,153,0.5)]"
                  : status === "error"
                  ? "bg-amber-400/80 shadow-[0_0_8px_rgba(251,191,36,0.5)]"
                  : "bg-slate-400/80"
              }`}
            />
            Platform status
          </AlertTitle>
          <AlertDescription>
            {status === "loading" && (
              <span className="inline-flex items-center gap-2">
                <SpinnerCustom />
                <span className="text-slate-400">Checking backend health...</span>
              </span>
            )}
            {status === "ok" && (
              <span className="text-slate-300">{message}</span>
            )}
            {status === "error" && (
              <span className="text-amber-300">{message || "Unable to reach backend. Check server status."}</span>
            )}
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}

export default StatusStrip;
