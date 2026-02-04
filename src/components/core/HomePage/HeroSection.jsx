import React from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Users2,
  ClipboardList,
  ArrowRight,
  Sparkles,
  LineChart,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Button from "@/components/ui/button";
import { ROLES } from "@/config/roles";

function HeroSection() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  return (
    <section className="relative overflow-hidden border-b border-slate-800/60 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.18),transparent_55%),radial-gradient(circle_at_bottom,rgba(15,23,42,0.95),rgba(2,6,23,1))]">
      <div className="pointer-events-none absolute inset-0 opacity-40 mix-blend-screen">
        <div className="absolute -left-20 top-10 h-64 w-64 rounded-full bg-sky-500/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto flex max-w-7xl flex-col gap-12 px-4 py-16 md:flex-row md:items-center md:py-24 lg:py-28 w-11/12 mx-auto">
        {/* Left: copy */}
        <div className="flex-1 space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="inline-flex items-center gap-2 rounded-full border border-slate-700/70 bg-slate-950/70 px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-sky-300 shadow-[0_0_0_1px_rgba(15,23,42,0.9)] backdrop-blur"
          >
            <Sparkles className="h-3 w-3 text-sky-300" />
            <span>New • Operating system for college societies</span>
          </motion.div>

          <div className="space-y-4">
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.05 }}
              className="text-4xl font-semibold leading-tight tracking-tight text-slate-50 md:text-5xl lg:text-[3.3rem]"
            >
              Bring{" "}
              <span className="bg-gradient-to-r from-sky-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                order and trust
              </span>{" "}
              to every student society decision.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.15 }}
              className="max-w-xl text-sm leading-relaxed text-slate-300 md:text-[15px]"
            >
              Cozen gives admins, faculty, and society cores a single place to run
              recruitment, memberships, and certificates&mdash;with strict roles,
              invitations, and a full audit trail instead of scattered forms and chats.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.22 }}
            className="flex flex-wrap items-center gap-4"
          >
            <Button
              size="lg"
              onClick={() =>
                user?.role === ROLES.FACULTY
                  ? navigate("/admin/college")
                  : navigate("/signup?role=student")
              }
              className="group bg-gradient-to-r from-sky-500 via-cyan-500 to-emerald-400 text-slate-950 shadow-lg shadow-sky-500/30 hover:shadow-sky-500/50"
            >
              Get started in sandbox
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1.5" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate("/login")}
              className="border-slate-600/70 bg-slate-950/40 text-slate-100 hover:border-sky-500/60 hover:text-sky-300"
            >
              Sign in to existing account
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="grid max-w-xl grid-cols-2 gap-4 pt-6 text-xs text-slate-300 md:text-[11px]"
          >
            <div className="flex items-start gap-2 rounded-xl border border-slate-800/70 bg-slate-950/70 p-3 backdrop-blur-sm">
              <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10">
                <Users2 className="h-4 w-4 text-emerald-400" />
              </div>
              <div>
                <p className="font-medium text-slate-100">One‑student‑one‑society</p>
                <p className="mt-0.5 text-[11px] text-slate-400">
                  Enforced membership rules remove conflicts and double‑selections.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2 rounded-xl border border-slate-800/70 bg-slate-950/70 p-3 backdrop-blur-sm">
              <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-lg bg-sky-500/10">
                <ClipboardList className="h-4 w-4 text-sky-400" />
              </div>
              <div>
                <p className="font-medium text-slate-100">Auditable from day one</p>
                <p className="mt-0.5 text-[11px] text-slate-400">
                  Every critical action gets logged with who, when, and what changed.
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right: product card */}
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55, delay: 0.18 }}
          className="flex flex-1 justify-center md:justify-end"
        >
          <div className="relative w-full max-w-md">
            <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-br from-sky-500/30 via-cyan-400/20 to-emerald-400/20 opacity-50 blur-2xl" />
            <div className="relative overflow-hidden rounded-3xl border border-slate-700/70 bg-slate-950/90 p-5 shadow-[0_25px_80px_rgba(8,47,73,0.9)] backdrop-blur-xl">
              <div className="mb-4 flex items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Live governance view
                  </p>
                  <p className="text-sm font-semibold text-slate-50">
                    College Societies &amp; Recruitment
                  </p>
                </div>
                <div className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] font-medium text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]" />
                  Healthy
                </div>
              </div>

              <div className="space-y-3 rounded-2xl border border-slate-800/80 bg-slate-950/80 p-3">
                <div className="flex items-center justify-between text-[11px] text-slate-300">
                  <span className="inline-flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-sky-400" />
                    Role‑based access live
                  </span>
                  <span className="rounded-full bg-slate-900/90 px-2 py-0.5 text-[10px] text-slate-400">
                    Admin · Faculty · Core · Student
                  </span>
                </div>

                <div className="grid grid-cols-[1.4fr,1.1fr] gap-3 text-[11px]">
                  <div className="space-y-1 rounded-xl border border-slate-800/80 bg-slate-950/90 p-2">
                    <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-slate-500">
                      Today&apos;s activity
                    </p>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between rounded-lg bg-slate-900/80 px-2 py-1.5">
                        <span className="text-slate-200">Recruitment decisions</span>
                        <span className="text-emerald-300">72</span>
                      </div>
                      <div className="flex items-center justify-between rounded-lg bg-slate-900/60 px-2 py-1.5">
                        <span className="text-slate-200">New memberships</span>
                        <span className="text-sky-300">41</span>
                      </div>
                      <div className="flex items-center justify-between rounded-lg bg-slate-900/60 px-2 py-1.5">
                        <span className="text-slate-200">Certificates issued</span>
                        <span className="text-cyan-300">19</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 rounded-xl border border-slate-800/80 bg-slate-950/90 p-2">
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span className="inline-flex items-center gap-1">
                        <LineChart className="h-3.5 w-3.5 text-sky-400" />
                        Compliance
                      </span>
                      <span className="rounded-full bg-slate-900/80 px-1.5 py-0.5 text-[9px] text-emerald-300">
                        100% audit trail
                      </span>
                    </div>
                    <div className="mt-1 h-16 rounded-lg bg-[linear-gradient(to_top,rgba(15,23,42,0.9),rgba(15,23,42,0.4)),radial-gradient(circle_at_10%_90%,rgba(56,189,248,0.4),transparent_50%),radial-gradient(circle_at_80%_20%,rgba(45,212,191,0.5),transparent_55%)]" />
                    <ul className="space-y-1 text-[10px] text-slate-400">
                      <li>• Invite‑only internal roles</li>
                      <li>• Faculty‑approved final selections</li>
                      <li>• Exportable logs for audits</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-slate-800/70 pt-3 text-[10px] text-slate-400">
                <span>Built for colleges in India, adaptable everywhere.</span>
                <span className="rounded-full bg-slate-900/90 px-2 py-0.5 text-[9px] text-slate-300">
                  No AI decisions&mdash;humans always approve.
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default HeroSection;
