import React from "react";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";

function Contact() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-50">
      <Navbar />
      <main className="flex-1">
        <section className="border-b border-slate-800/50 bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900/40">
          <div className="mx-auto max-w-3xl px-4 py-16 md:py-20">
            <h1 className="text-3xl font-bold tracking-tight text-slate-50 md:text-4xl">
              Contact us
            </h1>
            <p className="mt-3 max-w-xl text-sm text-slate-400 md:text-base">
              Have questions about SocietySync or want to onboard your institution?
              Reach out and we&apos;ll get back to you.
            </p>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="mx-auto flex max-w-3xl flex-col gap-10 px-4 md:flex-row">
            <div className="flex-1 space-y-4">
              <h2 className="text-lg font-semibold text-slate-50">
                Send us a message
              </h2>
              <p className="text-sm text-slate-400">
                This is a demo contact form. You can wire it up to your email service
                or ticketing system later.
              </p>
              <form className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">
                    Name
                  </label>
                  <Input placeholder="Your name" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">
                    Email
                  </label>
                  <Input type="email" placeholder="you@college.edu" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">
                    Message
                  </label>
                  <textarea
                    rows={4}
                    className="w-full rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-sky-500"
                    placeholder="Tell us how we can help..."
                  />
                </div>
                <Button type="button" className="mt-2">
                  Send message
                </Button>
              </form>
            </div>
            <div className="w-full max-w-xs space-y-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 text-sm text-slate-300">
              <h3 className="text-sm font-semibold text-slate-50">
                Direct contact
              </h3>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Email
                </p>
                <p className="text-sm">contact@societysync.com</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  For institutions
                </p>
                <p className="text-sm">
                  Share your college name, point of contact, and current society
                  management process. We&apos;ll follow up with a tailored demo.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default Contact;

