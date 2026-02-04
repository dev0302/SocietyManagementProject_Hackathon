import React from "react";
import { motion } from "framer-motion";
import {
  Lock,
  Users,
  FileCheck,
  Shield,
  Zap,
  BarChart3,
  ArrowRight,
} from "lucide-react";

const rails = [
  {
    title: "For college admins",
    badge: "Control & oversight",
    points: [
      "Single view of all societies and departments",
      "Invite‑only access for faculty and cores",
      "Downloadable logs for audits and reviews",
    ],
  },
  {
    title: "For faculty",
    badge: "Last‑mile approvals",
    points: [
      "See who was shortlisted by societies",
      "Review conflict cases in one dashboard",
      "Approve or reject with full context",
    ],
  },
  {
    title: "For student cores",
    badge: "Execution workflow",
    points: [
      "Run recruitment with custom rounds",
      "Assign internal roles and permissions",
      "Issue certificates when terms are over",
    ],
  },
];

const features = [
  {
    icon: Lock,
    title: "Controlled access",
    description:
      "Role-based permissions ensure only authorized users can perform specific actions.",
  },
  {
    icon: Users,
    title: "Invite‑only joining",
    description:
      "Internal society roles (Core, Head, Member) require explicit invites from authorized members.",
  },
  {
    icon: FileCheck,
    title: "Full audit trail",
    description:
      "Every critical action is logged with actor, action, target, and timestamp for complete traceability.",
  },
  {
    icon: Shield,
    title: "One student, one society",
    description:
      "Enforced membership rules prevent conflicts when students are selected by multiple societies.",
  },
  {
    icon: Zap,
    title: "Human decision‑making",
    description:
      "No AI authority—all selections and approvals are made by faculty and society members.",
  },
  {
    icon: BarChart3,
    title: "Centralized management",
    description:
      "Single platform for societies, recruitment, events, and certificates.",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.15 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

function FeaturesSection() {
  return (
    <section className="border-b border-slate-800/60 bg-slate-950/95 py-16 md:py-20  w-11/12 mx-auto">
      <div className="mx-auto max-w-7xl px-4">
        {/* How it works rail */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mb-10 flex flex-col gap-10 lg:flex-row lg:items-start"
        >
          <div className="max-w-md space-y-3">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-50 md:text-3xl">
              How Cozen fits into{" "}
              <span className="bg-gradient-to-r from-sky-400 to-cyan-400 bg-clip-text text-transparent">
                your campus
              </span>
            </h2>
            <p className="text-sm leading-relaxed text-slate-400">
              Think of Cozen as rails, not a replacement. It keeps every step of the
              societies lifecycle consistent&mdash;from recruitment to certificates&mdash;while
              letting each college preserve its own rules.
            </p>
          </div>

          <div className="grid flex-1 gap-4 md:grid-cols-3">
            {rails.map((rail, idx) => (
              <div
                key={rail.title}
                className="group flex flex-col justify-between rounded-2xl border border-slate-800/80 bg-slate-950/90 p-4 text-xs text-slate-300 shadow-[0_14px_40px_rgba(15,23,42,0.8)] transition-all duration-150 hover:-translate-y-1 hover:border-sky-500/60 hover:shadow-[0_18px_55px_rgba(8,47,73,0.95)]"
              >
                <div>
                  <div className="mb-2 flex items-center justify-between gap-1">
                    <span className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                      Step {idx + 1}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-900/90 px-2 py-0.5 text-[9px] font-medium text-sky-300">
                      <ArrowRight className="h-3 w-3" />
                      {rail.badge}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-slate-100">{rail.title}</p>
                  <ul className="mt-2 space-y-1.5 text-[11px] text-slate-400">
                    {rail.points.map((point) => (
                      <li key={point}>• {point}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Feature grid */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="mb-6 flex items-center justify-between gap-4"
        >
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
            Platform capabilities
          </h3>
          <p className="hidden text-[11px] text-slate-500 sm:block">
            Every capability is mapped to clear roles: Admin, Faculty, Core, and Student.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-40px" }}
          className="grid gap-5 md:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                variants={item}
                className="group relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-950/90 p-5 text-sm text-slate-300 transition-all duration-150 hover:-translate-y-1 hover:border-sky-500/50 hover:bg-slate-950"
                whileHover={{ y: -4 }}
              >
                <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.12),transparent_55%)]" />
                </div>
                <div className="relative">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-sky-500/10 text-sky-400 transition-transform group-hover:scale-110">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h4 className="mb-1.5 text-base font-semibold text-slate-50">
                    {feature.title}
                  </h4>
                  <p className="text-[13px] leading-relaxed text-slate-400">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

export default FeaturesSection;
