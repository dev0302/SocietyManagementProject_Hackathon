import React from "react";
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="border-t border-slate-800/50 bg-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 md:flex-row">
        <div className="text-sm text-slate-400">
          © {new Date().getFullYear()} Cozen Society Platform. All rights reserved.
        </div>
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500">
          <Link to="/about" className="transition-colors hover:text-sky-400">About</Link>
          <span className="transition-colors hover:text-slate-300">Audit-first</span>
          <span className="transition-colors hover:text-slate-300">Role-based access</span>
          <span className="transition-colors hover:text-slate-300">One-student-one-society</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

