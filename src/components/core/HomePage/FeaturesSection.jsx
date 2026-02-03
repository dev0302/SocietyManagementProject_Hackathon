import React from "react";
import { motion } from "framer-motion";
import { Lock, Users, FileCheck, Shield, Zap, BarChart3 } from "lucide-react";

const features = [
  {
    icon: Lock,
    title: "Controlled Access",
    description:
      "Role-based permissions ensure only authorized users can perform specific actions.",
  },
  {
    icon: Users,
    title: "Invite-Only Joining",
    description:
      "Internal society roles (Core, Head, Member) require explicit invites from authorized members.",
  },
  {
    icon: FileCheck,
    title: "Audit Trail",
    description:
      "Every critical action is logged with actor, action, target, and timestamp for complete traceability.",
  },
  {
    icon: Shield,
    title: "One Student, One Society",
    description:
      "Enforced membership rules prevent conflicts when students are selected by multiple societies.",
  },
  {
    icon: Zap,
    title: "Human Decision-Making",
    description:
      "No AI authority—all selections and approvals are made by faculty and society members.",
  },
  {
    icon: BarChart3,
    title: "Centralized Management",
    description:
      "Single platform for societies, departments, recruitment, interviews, events, and certificates.",
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
    <section className="border-b border-slate-800/50 bg-slate-950 py-20">
      <div className="mx-auto max-w-7xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="mb-16 text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-slate-50 md:text-4xl">
            Built for{" "}
            <span className="bg-gradient-to-r from-sky-400 to-cyan-400 bg-clip-text text-transparent">
              real institutions
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-slate-400">
            Every feature is designed with governance, auditability, and role-based access control
            in mind.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-40px" }}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                variants={item}
                className="group rounded-xl border border-slate-800/50 bg-slate-900/30 p-6 transition-all hover:border-sky-500/30 hover:bg-slate-900/50"
                whileHover={{ y: -4 }}
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-sky-500/10 text-sky-400 transition-transform group-hover:scale-110">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-slate-200">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-slate-400">{feature.description}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

export default FeaturesSection;
