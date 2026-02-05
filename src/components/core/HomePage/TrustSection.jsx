import React from "react";
import { motion } from "framer-motion";

const stats = [
  {
    label: "Societies managed",
    value: "25+",
    subtext: "Per institution on average",
  },
  {
    label: "Students onboarded",
    value: "5k+",
    subtext: "Across departments and years",
  },
  {
    label: "Decisions logged",
    value: "100%",
    subtext: "Every critical action is auditable",
  },
];

function TrustSection() {
  return (
    <section className="relative border-b border-slate-800/40 bg-gradient-to-b from-slate-900/40 via-slate-950 to-slate-950 py-16 md:py-20">
      <div className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-px max-w-5xl bg-gradient-to-r from-transparent via-sky-500/40 to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_0%,rgba(56,189,248,0.16),transparent_50%),radial-gradient(circle_at_90%_100%,rgba(14,116,144,0.2),transparent_55%)]" />

      <div className="relative mx-auto max-w-6xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center"
        >
          <div className="max-w-xl space-y-3">
            <p className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-slate-950/80 px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-sky-300/90 shadow-[0_0_0_1px_rgba(8,47,73,0.6)]">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.7)]" />
              Designed with real college governance in mind
            </p>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-50 md:text-3xl">
              Modern governance rails for{" "}
              <span className="bg-gradient-to-r from-sky-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                student-led institutions
              </span>
            </h2>
            <p className="text-sm leading-relaxed text-slate-400 md:text-[15px]">
              SocietySync replaces scattered spreadsheets, WhatsApp threads, and ad‑hoc Google
              Forms with a single coherent workflow for approvals, recruitment, and
              certificates&mdash;without taking control away from faculty and society
              cores.
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid w-full max-w-xl grid-cols-1 gap-4 sm:grid-cols-3"
          >
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="group rounded-2xl border border-slate-800/70 bg-slate-950/80 px-4 py-4 text-left shadow-[0_18px_45px_rgba(15,23,42,0.8)] backdrop-blur-sm transition-all duration-200 hover:-translate-y-1 hover:border-sky-500/50 hover:shadow-[0_22px_55px_rgba(8,47,73,0.95)]"
              >
                <div className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  {stat.label}
                </div>
                <div className="mt-2 text-2xl font-semibold text-sky-300">
                  {stat.value}
                </div>
                <div className="mt-1 text-[11px] text-slate-500">{stat.subtext}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

export default TrustSection;

