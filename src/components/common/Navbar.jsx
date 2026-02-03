import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { GraduationCap, Menu, X } from "lucide-react";
import { logout } from "@/redux/slices/authSlice";
import Button from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const navLinks = [
  { path: "/", label: "Home" },
  { path: "/about", label: "About" },
];

function NavLink({ path, label, onClick }) {
  const location = useLocation();
  const isActive = location.pathname === path;

  return (
    <motion.button
      onClick={() => onClick(path)}
      className="relative px-1 py-2 text-sm font-medium text-slate-300 transition-colors hover:text-sky-400"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {isActive && (
        <motion.span
          layoutId="navbar-active"
          className="absolute inset-0 -z-10 rounded-lg bg-slate-800/80"
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
          style={{ borderRadius: 8 }}
        />
      )}
      <span className={isActive ? "text-sky-400" : ""}>{label}</span>
    </motion.button>
  );
}

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

  const goTo = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="sticky top-0 z-50 border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-xl"
    >
      <>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <motion.div
          className="flex cursor-pointer items-center gap-3"
          onClick={() => navigate("/")}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-cyan-500 text-slate-950 shadow-lg shadow-sky-500/20">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-slate-50">
              Cozen Societies
            </span>
            <span className="text-[10px] text-slate-400">Institution-wide platform</span>
          </div>
        </motion.div>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              path={link.path}
              label={link.label}
              onClick={(path) => navigate(path)}
            />
          ))}
          {token && user && (
            <NavLink
              path="/dashboard"
              label="Dashboard"
              onClick={(path) => navigate(path)}
            />
          )}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {token && user ? (
            <>
              <motion.div
                className="flex items-center gap-3 rounded-xl border border-slate-800/50 bg-slate-900/50 px-3 py-2"
                whileHover={{ backgroundColor: "rgba(15, 23, 42, 0.8)" }}
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">
                    {user.firstName?.[0]}
                    {user.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden text-xs lg:block">
                  <div className="font-medium text-slate-200">
                    {user.firstName} {user.lastName}
                  </div>
                  <div className="text-slate-400">{user.role}</div>
                </div>
              </motion.div>
              <Button variant="subtle" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <motion.div className="flex gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/login")}
                className="border-slate-600 hover:border-sky-500/50 hover:text-sky-400"
              >
                Login
              </Button>
              <Button
                size="sm"
                onClick={() => navigate("/signup?role=student")}
                className="bg-gradient-to-r from-sky-500 to-cyan-500 text-slate-950 hover:opacity-90"
              >
                Get Started
              </Button>
            </motion.div>
          )}
        </div>

        <motion.button
          className="rounded-lg p-2 md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          whileTap={{ scale: 0.95 }}
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6 text-slate-300" />
          ) : (
            <Menu className="h-6 w-6 text-slate-300" />
          )}
        </motion.button>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden border-t border-slate-800/50 bg-slate-950/95 md:hidden"
          >
            <div className="space-y-1 px-4 py-4">
              {navLinks.map((link) => (
                <motion.button
                  key={link.path}
                  onClick={() => goTo(link.path)}
                  className="block w-full rounded-lg px-4 py-3 text-left text-sm text-slate-300 transition hover:bg-slate-800/80 hover:text-sky-400"
                  whileTap={{ scale: 0.99 }}
                >
                  {link.label}
                </motion.button>
              ))}
              {token && user && (
                <motion.button
                  onClick={() => goTo("/dashboard")}
                  className="block w-full rounded-lg px-4 py-3 text-left text-sm text-slate-300 transition hover:bg-slate-800/80 hover:text-sky-400"
                  whileTap={{ scale: 0.99 }}
                >
                  Dashboard
                </motion.button>
              )}
              {token && user && (
                <div className="border-t border-slate-800/50 pt-4">
                  <div className="mb-3 flex items-center gap-3 px-4">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {user.firstName?.[0]}
                        {user.lastName?.[0]}
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
              )}
              {!token && (
                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => goTo("/login")}
                  >
                    Login
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => goTo("/signup?role=student")}
                  >
                    Sign Up
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </>
    </motion.header>
  );
}

export default Navbar;
