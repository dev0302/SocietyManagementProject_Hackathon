import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "sonner";
import { GraduationCap, Menu, X } from "lucide-react";
import { logout } from "@/redux/slices/authSlice";
import Button from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

function Navbar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.auth);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    toast.success("Logged out successfully");
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <div
          className="flex cursor-pointer items-center gap-3"
          onClick={() => navigate("/")}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-cyan-500 text-slate-950 shadow-lg shadow-sky-500/20">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-slate-50">
              Cozen Societies
            </span>
            <span className="text-[10px] text-slate-400">
              Institution-wide platform
            </span>
          </div>
        </div>

        <nav className="hidden items-center gap-8 text-sm text-slate-300 md:flex">
          <button
            onClick={() => navigate("/")}
            className="transition-colors hover:text-sky-400"
          >
            Home
          </button>
          {token && user && (
            <>
              <button
                onClick={() => navigate("/dashboard")}
                className="transition-colors hover:text-sky-400"
              >
                Dashboard
              </button>
            </>
          )}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {token && user ? (
            <>
              <div className="flex items-center gap-3 rounded-lg border border-slate-800/50 bg-slate-900/50 px-3 py-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">
                    {user.firstName?.[0]}{user.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden text-xs lg:block">
                  <div className="font-medium text-slate-200">
                    {user.firstName} {user.lastName}
                  </div>
                  <div className="text-slate-400">{user.role}</div>
                </div>
              </div>
              <Button variant="subtle" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={() => navigate("/login")}>
                Login
              </Button>
              <Button size="sm" onClick={() => navigate("/signup?role=student")}>
                Get Started
              </Button>
            </>
          )}
        </div>

        <button
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6 text-slate-300" />
          ) : (
            <Menu className="h-6 w-6 text-slate-300" />
          )}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-slate-800/50 bg-slate-950/95 md:hidden">
          <div className="space-y-1 px-4 py-4">
            <button
              onClick={() => {
                navigate("/");
                setMobileMenuOpen(false);
              }}
              className="block w-full rounded-lg px-4 py-2 text-left text-sm text-slate-300 hover:bg-slate-900/50"
            >
              Home
            </button>
            {token && user && (
              <>
                <button
                  onClick={() => {
                    navigate("/dashboard");
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full rounded-lg px-4 py-2 text-left text-sm text-slate-300 hover:bg-slate-900/50"
                >
                  Dashboard
                </button>
                <div className="border-t border-slate-800/50 pt-4">
                  <div className="mb-3 flex items-center gap-3 px-4">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {user.firstName?.[0]}{user.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-sm font-medium text-slate-200">
                        {user.firstName} {user.lastName}
                      </div>
                      <div className="text-xs text-slate-400">{user.email}</div>
                    </div>
                  </div>
                  <Button
                    variant="subtle"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                  >
                    Logout
                  </Button>
                </div>
              </>
            )}
            {!token && (
              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    navigate("/login");
                    setMobileMenuOpen(false);
                  }}
                >
                  Login
                </Button>
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    navigate("/signup?role=student");
                    setMobileMenuOpen(false);
                  }}
                >
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
