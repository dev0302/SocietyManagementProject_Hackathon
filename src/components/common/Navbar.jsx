import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import {
  GraduationCap,
  Menu,
  X,
  Search,
  Settings,
  ChevronDown,
} from "lucide-react";
import { NavbarLinks } from "@/data/navbar-links";
import { logout } from "@/redux/slices/authSlice";
import Button from "@/components/ui/button";
import ProfileDropDown from "@/components/core/HomePage/ProfileDropDown";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { searchUsers } from "@/services/operations/searchAPI";

function Navbar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { token, user } = useSelector((state) => state.auth);

  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [open, setOpen] = useState(false); // mobile drawer

  useEffect(() => {
    let active = true;

    const runSearch = async () => {
      const q = searchQuery.trim();
      if (!q) {
        if (active) setSearchResults([]);
        if (active) setHasSearched(false);
        return;
      }
      setSearchLoading(true);
       if (active) setHasSearched(false);
      try {
        const response = await searchUsers(q);
        if (!active) return;
        if (response.success) {
          setSearchResults(response.results || []);
        } else {
          setSearchResults([]);
        }
        setHasSearched(true);
      } catch {
        if (active) setSearchResults([]);
      } finally {
        if (active) setSearchLoading(false);
      }
    };

    const id = setTimeout(runSearch, 300);
    return () => {
      active = false;
      clearTimeout(id);
    };
  }, [searchQuery]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const handleLogout = () => {
    dispatch(logout());
    toast.success("Logged out successfully");
    navigate("/");
  };

  return (
    <div className="relative z-[1000] flex h-16 items-center justify-center border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-md sm:h-20">
      <div className="flex w-11/12 max-w-7xl items-center justify-between">
        {/* LOGO */}
        <NavLink
          to="/"
          className="flex shrink-0 items-center gap-3 transition-opacity hover:opacity-90"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-cyan-500 text-slate-950 shadow-lg shadow-sky-500/20 sm:h-10 sm:w-10">
            <GraduationCap className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-bold tracking-tight text-slate-50 sm:text-base">
              Cozen Societies
            </div>
            <div className="text-[10px] text-slate-400">
              Institution-wide platform
            </div>
          </div>
        </NavLink>

        {/* DESKTOP NAV */}
        <nav className="hidden items-center rounded-full border border-slate-800/70 bg-slate-900/40 px-2 py-1.5 shadow-2xl lg:flex">
          {/* Search */}
          <div
            className={`relative mr-2 flex items-center gap-2 rounded-full border px-4 py-2 text-xs transition-all duration-300 ${
              isSearchFocused
                ? "border-sky-500/60 bg-slate-900/80 shadow-[0_0_0_1px_rgba(56,189,248,0.4)]"
                : "border-slate-800/80 bg-slate-900/40"
            }`}
          >
            <Search
              className={`h-4 w-4 ${
                isSearchFocused ? "text-slate-50" : "text-slate-300"
              }`}
            />
            <input
              type="text"
              placeholder="Search people"
              value={searchQuery}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => {
                setIsSearchFocused(false);
                setSearchResults([]);
              }}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-28 bg-transparent text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:outline-none xl:w-44"
            />
            {isSearchFocused && searchQuery.trim() && (
              <div className="absolute left-0 top-full z-[1200] mt-2 w-80 rounded-2xl border border-slate-800/80 bg-slate-950/95 p-2 shadow-2xl shadow-sky-900/40 backdrop-blur transition-all duration-200 ease-out">
                <div className="flex items-center justify-between px-2 pb-1">
                  <span className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
                    People
                  </span>
                  <span className="text-[9px] text-slate-500">
                    Type to search by name or email
                  </span>
                </div>
                {searchLoading ? (
                  <div className="flex items-center gap-2 px-3 py-2 text-xs text-slate-400">
                    <span className="h-3 w-3 animate-spin rounded-full border border-slate-500 border-t-transparent" />
                    <span>Searching&hellip;</span>
                  </div>
                ) : hasSearched && searchResults.length === 0 ? (
                  <div className="px-3 py-2 text-xs text-slate-500">
                    No matching users.
                  </div>
                ) : searchResults.length > 0 ? (
                  <ul className="max-h-72 space-y-1 overflow-y-auto">
                    {searchResults.map((result) => (
                      <li
                        key={result.id || result._id || result.email}
                        className="group flex cursor-pointer items-center gap-3 rounded-xl px-2 py-2 text-xs text-slate-100 transition-all duration-150 ease-out hover:bg-slate-900/90 hover:shadow-[0_0_0_1px_rgba(56,189,248,0.4)] hover:-translate-y-[1px]"
                      >
                        <Avatar className="h-8 w-8 border border-slate-800/80 bg-slate-900">
                          {result.avatarUrl ? (
                            <AvatarImage src={result.avatarUrl} alt={result.firstName} />
                          ) : (
                            <AvatarFallback className="text-[10px]">
                              {result.firstName?.[0]}
                              {result.lastName?.[0]}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-xs font-medium group-hover:text-sky-300">
                            {result.firstName} {result.lastName}
                          </div>
                          <div className="truncate text-[10px] text-slate-400">
                            {result.email}
                          </div>
                        </div>
                        <span className="rounded-full bg-slate-800/90 px-2 py-0.5 text-[9px] uppercase tracking-wide text-slate-300 group-hover:bg-sky-500/20 group-hover:text-sky-300">
                          {result.role}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            )}
          </div>

          {/* Links */}
          <ul className="flex gap-x-2 pr-4">
            {NavbarLinks.map((link) => (
              <li key={link.title}>
                <NavLink
                  to={link.path}
                  className={({ isActive }) =>
                    `rounded-full px-3 py-2 text-sm font-medium transition-all ${
                      isActive
                        ? "bg-slate-800/80 text-slate-50"
                        : "text-slate-300 hover:text-slate-50"
                    }`
                  }
                >
                  {link.title}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-x-2 sm:gap-x-3">
          <div className="flex shrink-0 items-center gap-x-1.5 rounded-full border border-slate-800/70 bg-slate-900/40 p-1.5">
            {/* Settings shortcut when logged in */}
            {token && (
              <button
                onClick={() => navigate("/dashboard")}
                className="rounded-full p-2 text-slate-300 transition-all hover:bg-slate-800/70 hover:text-slate-50"
                aria-label="Dashboard"
                title="Dashboard"
              >
                <Settings className="h-5 w-5" />
              </button>
            )}

            {/* Auth buttons / Profile dropdown */}
            {!token ? (
              <div className="flex items-center gap-x-2 px-1">
                <NavLink to="/login">
                  <button className="rounded-full border border-slate-800/80 bg-slate-900/60 px-3 py-2 text-xs font-medium text-slate-200 transition-all hover:bg-slate-900">
                    Log in
                  </button>
                </NavLink>
                <NavLink to="/signup?role=student">
                  <button className="rounded-full bg-gradient-to-r from-sky-500 to-cyan-500 px-3 py-2 text-xs font-bold text-slate-950 transition-all hover:opacity-95">
                    Sign up
                  </button>
                </NavLink>
              </div>
            ) : (
              <div className="pl-1">
                <ProfileDropDown onLogout={handleLogout} />
              </div>
            )}
          </div>

          {/* MOBILE MENU TOGGLE */}
          <button
            className="lg:hidden rounded-lg p-2 text-slate-300 transition-colors hover:text-slate-50"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-7 w-7" />
          </button>
        </div>
      </div>

      {/* MOBILE DRAWER OVERLAY */}
      {open && (
        <div
          className="fixed inset-0 z-[2000] bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* MOBILE DRAWER */}
      <div
        className={`fixed top-0 right-0 z-[3000] h-full w-[280px] border-l border-white/10 bg-slate-950 p-6 shadow-[-10px_0_30px_rgba(0,0,0,0.5)] transition-transform duration-500 ease-in-out lg:hidden ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-cyan-500 text-slate-950">
              <GraduationCap className="h-5 w-5" />
            </div>
            <span className="text-sm font-bold text-slate-50">Cozen</span>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="text-2xl text-slate-300 hover:text-sky-400"
            aria-label="Close menu"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Mobile search */}
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/60 px-4 py-2">
          <Search className="h-4 w-4 text-slate-300" />
          <input
            type="text"
            placeholder="Search...(under construction)"
            className="w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-500 outline-none"
          />
        </div>

        <div className="flex flex-col">
          {NavbarLinks.map((link) => (
            <NavLink
              key={link.title}
              to={link.path}
              onClick={() => setOpen(false)}
              className="border-b border-white/5 py-3 text-base text-slate-300 hover:text-slate-50"
            >
              {link.title}
            </NavLink>
          ))}

          {token && (
            <NavLink
              to="/dashboard"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 border-b border-white/5 py-3 text-base text-slate-300 hover:text-slate-50"
            >
              <Settings className="h-4 w-4" /> Dashboard
            </NavLink>
          )}
        </div>

        {!token && (
          <div className="mt-auto flex flex-col gap-y-3 pt-8">
            <NavLink
              to="/login"
              onClick={() => setOpen(false)}
              className="rounded-lg border border-white/10 bg-slate-900/60 py-3 text-center text-sm text-slate-50"
            >
              Log in
            </NavLink>
            <NavLink
              to="/signup?role=student"
              onClick={() => setOpen(false)}
              className="rounded-lg bg-gradient-to-r from-sky-500 to-cyan-500 py-3 text-center text-sm font-bold text-slate-950"
            >
              Sign up
            </NavLink>
          </div>
        )}
      </div>
    </div>
  );
}

export default Navbar;
