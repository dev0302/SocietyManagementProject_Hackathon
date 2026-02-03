
import { motion } from "framer-motion";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import {
  Github,
  Twitter,
  Linkedin,
  Instagram,
  Youtube,
  Mail,
  ExternalLink,
  Heart,
  GraduationCap,
} from "lucide-react";

const socialHandles = [
  {
    name: "GitHub",
    href: "https://github.com",
    icon: Github,
    color: "hover:text-slate-100 hover:bg-slate-700/50",
  },
  {
    name: "Twitter / X",
    href: "https://twitter.com",
    icon: Twitter,
    color: "hover:text-sky-400 hover:bg-sky-500/10",
  },
  {
    name: "LinkedIn",
    href: "https://linkedin.com",
    icon: Linkedin,
    color: "hover:text-blue-400 hover:bg-blue-500/10",
  },
  {
    name: "Instagram",
    href: "https://instagram.com",
    icon: Instagram,
    color: "hover:text-pink-400 hover:bg-pink-500/10",
  },
  {
    name: "YouTube",
    href: "https://youtube.com",
    icon: Youtube,
    color: "hover:text-red-400 hover:bg-red-500/10",
  },
  {
    name: "Email",
    href: "mailto:contact@cozensocieties.com",
    icon: Mail,
    color: "hover:text-amber-400 hover:bg-amber-500/10",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

function About() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-50">
      <Navbar />
      <main className="min-h-[70vh] flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-slate-800/50 bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900/50">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(14,165,233,0.08),transparent_50%)]" />
          <div className="relative mx-auto max-w-4xl px-4 py-20 md:py-28">
            <div className="text-center">
              <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500/20 to-cyan-500/20">
                <GraduationCap className="h-10 w-10 text-sky-400" />
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-slate-50 md:text-5xl">
                About{" "}
                <span className="bg-gradient-to-r from-sky-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
                  Cozen Societies
                </span>
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-400">
                A single platform to govern all college societies—built for real institutions
                with audit-first design, role-based access, and human decision-making at the core.
              </p>
            </div>
          </div>
        </section>

        {/* Connect with us */}
        <section className="border-b border-slate-800/50 py-16 md:py-24">
          <div className="mx-auto max-w-4xl px-4">
            <h2 className="mb-10 text-center text-2xl font-bold text-slate-50 md:text-3xl">
              Connect with us
            </h2>
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            >
              {socialHandles.map((social) => {
                const Icon = social.icon;
                return (
                  <motion.a
                    key={social.name}
                    variants={item}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`group flex items-center gap-4 rounded-xl border border-slate-800/50 bg-slate-900/30 p-4 transition-all ${social.color} hover:border-slate-700/50`}
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-slate-800/80 text-slate-300">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="font-medium text-slate-200">{social.name}</span>
                      <span className="mt-0.5 block truncate text-xs text-slate-500">
                        {social.href.replace(/^https?:\/\//, "").replace(/^mailto:/, "").split("/")[0].split("?")[0]}
                      </span>
                    </div>
                    <ExternalLink className="h-4 w-4 shrink-0 text-slate-500 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </motion.a>
                );
              })}
            </motion.div>
          </div>
        </section>

        {/* Footer line */}
        <section className="py-12">
          <p className="text-center text-sm text-slate-500">
            Made with <Heart className="inline h-4 w-4 text-rose-400 fill-rose-400" /> for
            institutions that care about governance.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default About;
