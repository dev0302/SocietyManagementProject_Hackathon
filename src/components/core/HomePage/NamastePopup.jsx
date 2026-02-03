import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const NAMASTE_KEY = "cozen_namaste_seen";

function NamastePopup() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const seen = sessionStorage.getItem(NAMASTE_KEY);
    if (!seen) {
      const t = setTimeout(() => setVisible(true), 600);
      return () => clearTimeout(t);
    }
  }, []);

  const close = () => {
    setVisible(false);
    sessionStorage.setItem(NAMASTE_KEY, "true");
  };

  return (
    <AnimatePresence>
      {visible && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100] bg-slate-950/70 backdrop-blur-sm"
            onClick={close}
            aria-hidden="true"
          />
          <motion.div
            role="dialog"
            aria-label="Welcome"
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 24,
              mass: 0.8,
            }}
            className="fixed left-1/2 top-1/2 z-[101] w-[min(92vw,380px)] -translate-x-1/2 -translate-y-1/2"
          >
            <div className="relative overflow-hidden rounded-2xl border border-slate-700/60 bg-gradient-to-b from-slate-900 to-slate-950 shadow-2xl shadow-sky-500/10 ring-2 ring-sky-500/20">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(14,165,233,0.12),transparent_60%)]" />
              <div className="relative px-8 py-10 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-400/20 to-orange-500/20 text-3xl"
                >
                  🙏
                </motion.div>
                <motion.h2
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="text-3xl font-bold tracking-tight text-slate-50"
                >
                  Namaste
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  className="mt-2 text-slate-400"
                >
                  Welcome to Cozen Societies. We're glad you're here.
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 }}
                  className="mt-6 flex justify-center gap-3"
                >
                  <button
                    onClick={close}
                    className="rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 px-6 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-sky-500/25 transition hover:shadow-sky-500/40"
                  >
                    Continue
                  </button>
                  <button
                    onClick={close}
                    className="rounded-xl border border-slate-600/60 bg-slate-800/50 px-6 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800"
                  >
                    Close
                  </button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default NamastePopup;
