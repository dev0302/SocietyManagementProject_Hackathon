import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { ChevronDown, LayoutDashboard, LogOut, User as UserIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
        className="flex items-center gap-2 rounded-full border border-slate-700/70 bg-slate-900/70 p-1 text-slate-200 shadow-sm shadow-slate-900/60 transition-all duration-150 hover:border-sky-500/60 hover:bg-slate-900 hover:shadow-[0_0_0_1px_rgba(56,189,248,0.35)]"
        aria-label="Open profile menu"
      >
        <Avatar className="h-8 w-8 border border-slate-700/80 bg-slate-900">
          {user.avatarUrl ? (
            <AvatarImage src={user.avatarUrl} alt="Avatar" />
          ) : (
            <AvatarFallback className="text-xs">
              {user.firstName?.[0]}
              {user.lastName?.[0]}
            </AvatarFallback>
          )}
        </Avatar>
        <ChevronDown
          className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-150 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      <div
        className={`absolute right-0 mt-2 w-64 origin-top-right overflow-hidden rounded-2xl border border-slate-800/90 bg-slate-950/95 shadow-[0_18px_40px_rgba(15,23,42,0.9)] backdrop-blur-sm transition-all duration-150 ease-out ${
          open ? "pointer-events-auto translate-y-0 scale-100 opacity-100" : "pointer-events-none -translate-y-1 scale-95 opacity-0"
        }`}
      >
          <div className="border-b border-slate-800/80 bg-gradient-to-r from-slate-950 via-slate-950 to-slate-900 px-4 py-3.5">
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9 border border-slate-700/80 bg-slate-900">
                {user.avatarUrl ? (
                  <AvatarImage src={user.avatarUrl} alt="Avatar" />
                ) : (
                  <AvatarFallback className="text-xs">
                    {user.firstName?.[0]}
                    {user.lastName?.[0]}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-slate-50">
                  {user.firstName} {user.lastName}
                </div>
                <div className="truncate text-[11px] text-slate-400">
                  {user.email}
                </div>
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between text-[10px]">
              <span className="inline-flex items-center rounded-full bg-sky-500/10 px-2 py-0.5 font-medium text-sky-400">
                {user.role}
              </span>
              <span className="text-slate-500">
                Joined{" "}
                <span className="font-medium text-slate-300">
                  {new Date(user.createdAt || Date.now()).toLocaleDateString("en-IN", {
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </span>
            </div>
          </div>

          <div className="px-1 py-1.5">
            <button
              onClick={() => {
                setOpen(false);
                navigate("/dashboard");
              }}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-xs text-slate-100 transition-all duration-150 hover:bg-slate-900/90 hover:text-sky-300"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900/80 text-slate-300">
                <LayoutDashboard className="h-4 w-4" />
              </span>
              <span className="flex-1">
                <span className="block text-xs font-medium">Dashboard</span>
                <span className="block text-[10px] text-slate-500">
                  View your role-based tools
                </span>
              </span>
            </button>
            <button
              onClick={() => {
                setOpen(false);
                navigate("/profile");
              }}
              className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-xs text-slate-100 transition-all duration-150 hover:bg-slate-900/90 hover:text-sky-300"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900/80 text-slate-300">
                <UserIcon className="h-4 w-4" />
              </span>
              <span className="flex-1">
                <span className="block text-xs font-medium">My profile</span>
                <span className="block text-[10px] text-slate-500">
                  Update details & display picture
                </span>
              </span>
            </button>
          </div>

          <div className="border-t border-slate-800/80 bg-slate-950/90 px-3 py-2.5">
            <button
              onClick={() => {
                setOpen(false);
                onLogout?.();
              }}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-500/90 to-red-500/90 px-3 py-1.5 text-xs font-semibold text-slate-50 shadow-sm shadow-rose-900/60 transition-all duration-150 hover:from-rose-500 hover:to-red-500"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
    </div>
  );
}

export default ProfileDropDown;

