import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { ChevronDown, LayoutDashboard, LogOut } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

function ProfileDropDown({ onLogout }) {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  if (!user) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full bg-slate-900/60 p-1 pr-2 text-slate-200 transition hover:bg-slate-900"
        aria-label="Open profile menu"
      >
        <Avatar className="h-8 w-8">
          <AvatarFallback className="text-xs">
            {user.firstName?.[0]}
            {user.lastName?.[0]}
          </AvatarFallback>
        </Avatar>
        <ChevronDown className="h-4 w-4 text-slate-400" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-slate-800 bg-slate-950 shadow-xl">
          <div className="border-b border-slate-800 px-4 py-3">
            <div className="text-sm font-semibold text-slate-50">
              {user.firstName} {user.lastName}
            </div>
            <div className="text-xs text-slate-400">{user.email}</div>
            <div className="mt-2 inline-flex rounded-full bg-sky-500/10 px-2 py-0.5 text-[10px] font-medium text-sky-400">
              {user.role}
            </div>
          </div>

          <button
            onClick={() => {
              setOpen(false);
              navigate("/dashboard");
            }}
            className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-slate-200 hover:bg-slate-900/60"
          >
            <LayoutDashboard className="h-4 w-4 text-slate-400" />
            Dashboard
          </button>
          <button
            onClick={() => {
              setOpen(false);
              onLogout?.();
            }}
            className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-slate-200 hover:bg-slate-900/60"
          >
            <LogOut className="h-4 w-4 text-slate-400" />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

export default ProfileDropDown;

