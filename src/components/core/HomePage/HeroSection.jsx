import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Users2, ClipboardList, ArrowRight } from "lucide-react";
import Button from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const statusItems = [
  { phase: "Phase 1", title: "Platform Setup", status: "Ready", statusClass: "bg-emerald-500/10 text-emerald-400" },
  { phase: "Phase 2", title: "Internal Teams", status: "Invite-only", statusClass: "bg-sky-500/10 text-sky-400" },
  { phase: "Phase 3", title: "Recruitment", status: "Human decisions", statusClass: "bg-amber-500/10 text-amber-400" },
];

function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden border-b border-slate-800/50 bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900/50">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(14,165,233,0.1),transparent_50%)]" />

      <div className="relative mx-auto flex max-w-7xl flex-col gap-12 px-4 py-20 md:flex-row md:items-center md:py-28">
        <div className="flex-1 space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 rounded-full border border-slate-800/50 bg-slate-900/50 px-4 py-1.5 text-xs font-medium text-slate-300 backdrop-blur-sm"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-sky-400" />
            <span>Institution-grade • Audit-first • Role-based</span>
          </motion.div>

          <div className="space-y-4">
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl font-bold tracking-tight text-slate-50 md:text-5xl lg:text-6xl"
            >
              One platform to govern{" "}
              <span className="bg-gradient-to-r from-sky-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
                all college societies
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="max-w-2xl text-lg leading-relaxed text-slate-400 md:text-xl"
            >
              Designed for real institutions, not demos. Controlled access, invite-only internal
              roles, and a single source of truth for memberships, recruitment, and certificates.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="flex flex-wrap items-center gap-4"
          >
            <Button
              size="lg"
              onClick={() => navigate("/signup?role=student")}
              className="group bg-gradient-to-r from-sky-500 to-cyan-500 text-slate-950 hover:opacity-90"
            >
              Get Started
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate("/login")}
              className="border-slate-600 hover:border-sky-500/50 hover:text-sky-400"
            >
              Sign In
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="grid grid-cols-1 gap-4 pt-8 md:grid-cols-2"
          >
            <div className="group flex items-start gap-3 rounded-xl border border-slate-800/50 bg-slate-900/30 p-4 backdrop-blur-sm transition hover:border-slate-700/50">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
                <Users2 className="h-4 w-4 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-200">One-student-one-society</h3>
                <p className="mt-1 text-xs text-slate-400">
                  Enforced membership rules prevent conflicts
                </p>
              </div>
            </div>
            <div className="group flex items-start gap-3 rounded-xl border border-slate-800/50 bg-slate-900/30 p-4 backdrop-blur-sm transition hover:border-slate-700/50">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-500/10">
                <ClipboardList className="h-4 w-4 text-sky-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-200">Full audit trail</h3>
                <p className="mt-1 text-xs text-slate-400">
                  Every critical action is logged and traceable
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="flex flex-1 justify-center md:justify-end"
        >
          <div className="w-full max-w-md space-y-4 rounded-2xl border border-slate-800/50 bg-slate-900/50 p-6 shadow-2xl shadow-sky-500/5 backdrop-blur-sm">
            <div className="flex items-center justify-between border-b border-slate-800/50 pb-3">
              <h3 className="text-sm font-semibold text-slate-200">Platform Status</h3>
              <div className="h-2 w-2 rounded-full bg-emerald-400/80 shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
            </div>

            <div className="space-y-3">
              {statusItems.map((item, i) => (
                <motion.div
                  key={item.phase}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 + i * 0.06 }}
                  className="flex items-center justify-between rounded-lg border border-slate-800/50 bg-slate-950/50 px-4 py-3 backdrop-blur-sm"
                >
                  <div>
                    <div className="text-xs font-medium text-slate-300">{item.phase}</div>
                    <div className="mt-0.5 text-[10px] text-slate-500">{item.title}</div>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${item.statusClass}`}
                  >
                    {item.status}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default HeroSection;
