import React, { useEffect, useState } from "react";
import axios from "axios";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { SpinnerCustom } from "@/components/ui/spinner";
import { CheckCircle, AlertTriangle, WifiOff, RefreshCw } from "lucide-react";

function StatusStrip() {
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [lastChecked, setLastChecked] = useState(null);

  const checkHealth = async () => {
    try {
      setStatus("loading");
      const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
      const res = await axios.get(`${baseUrl}/api/health`, { timeout: 5000 });
      
      if (res.data?.success) {
        setStatus("ok");
        setMessage(res.data.message || "All systems operational");
      } else {
        setStatus("error");
        setMessage("Service degraded");
      }
    } catch (error) {
      setStatus("error");
      if (error.code === "ECONNABORTED") {
        setMessage("Connection timeout");
      } else if (error.response) {
        setMessage(`Error ${error.response.status}`);
      } else {
        setMessage("Connection failed");
      }
    } finally {
      setLastChecked(new Date());
    }
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = () => {
    switch (status) {
      case "ok":
        return <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />;
      case "error":
        return <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />;
      case "loading":
        return <SpinnerCustom size="sm" />;
      default:
        return <WifiOff className="h-3.5 w-3.5 text-slate-400" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "ok":
        return "bg-emerald-400/10 text-emerald-300 border-emerald-400/20";
      case "error":
        return "bg-amber-400/10 text-amber-300 border-amber-400/20";
      case "loading":
        return "bg-blue-400/10 text-blue-300 border-blue-400/20";
      default:
        return "bg-slate-400/10 text-slate-300 border-slate-400/20";
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="relative">
      {/* Glow effect based on status */}
      <div className={`  absolute inset-0 opacity-20 blur-xl transition-all duration-300 ${
        status === "ok" 
          ? "bg-emerald-500/30" 
          : status === "error" 
          ? "bg-amber-500/30" 
          : "bg-blue-500/30"
      }`} />
      
      <div className="relative border-b border-slate-800/50 bg-gradient-to-r from-slate-900/95 to-slate-900/90 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl w-11/12 px-3 sm:px-4">
          <div className="flex flex-col gap-2 py-2 sm:flex-row sm:items-center sm:justify-between">
            {/* Status Badge */}
            <div className={`flex items-center gap-2 rounded-full border px-3 py-1.5 ${getStatusColor()}`}>
              <div className="flex items-center gap-2">
                {getStatusIcon()}
                <span className="text-xs font-medium">
                  {status === "ok" && "Operational"}
                  {status === "error" && "Degraded"}
                  {status === "loading" && "Checking"}
                  {status === "idle" && "Idle"}
                </span>
              </div>
              
              <div className={`h-1.5 w-1.5 rounded-full ${
                status === "ok" ? "bg-emerald-400 animate-pulse" :
                status === "error" ? "bg-amber-400 animate-pulse" :
                status === "loading" ? "bg-blue-400 animate-pulse" : "bg-slate-400"
              }`} />
            </div>

            {/* Status Message */}
            <div className="w-full px-1 sm:flex-1 sm:px-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-sm font-medium text-slate-200">
                    Platform Status
                  </div>
                  <div className={`text-xs ${
                    status === "ok" ? "text-emerald-300/80" :
                    status === "error" ? "text-amber-300/80" :
                    "text-slate-400"
                  }`}>
                    {status === "loading" ? (
                      <span className="flex items-center gap-2">
                        <SpinnerCustom size="xs" />
                        Checking health...
                      </span>
                    ) : message}
                  </div>
                </div>
                
                {/* Last Checked & Actions */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 sm:justify-end">
                  {lastChecked && (
                    <div className="text-xs text-slate-500">
                      Last checked: {formatTime(lastChecked)}
                    </div>
                  )}
                  
                  <button
                    onClick={checkHealth}
                    disabled={status === "loading"}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs transition-all ${
                      status === "loading" 
                        ? "bg-slate-800/50 text-slate-400 cursor-not-allowed" 
                        : "bg-slate-800/30 text-slate-300 hover:bg-slate-800/50 hover:text-slate-200 active:scale-95"
                    }`}
                  >
                    <RefreshCw className={`h-3 w-3 ${status === "loading" ? "animate-spin" : ""}`} />
                    Refresh
                  </button>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="mt-2 h-0.5 w-full overflow-hidden rounded-full bg-slate-800/50">
                <div className={`h-full transition-all duration-1000 ${
                  status === "ok" 
                    ? "bg-emerald-400/50 w-full" 
                    : status === "error" 
                    ? "bg-amber-400/50 w-full" 
                    : status === "loading" 
                    ? "bg-blue-400/50 w-1/2 animate-[pulse_2s_ease-in-out_infinite]" 
                    : "bg-slate-400/30 w-0"
                }`} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StatusStrip;