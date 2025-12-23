import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin } from "lucide-react";
import Footer from "@/components/Footer";

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState("");

  function handleChange(e) {
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    console.log("contact form submitted", form);
    setStatus(
      "Thanks — we received your message. We'll respond within 24 hours."
    );
    setForm({ name: "", email: "", subject: "", message: "" });
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-orange-50 via-white to-orange-50">
      <main className="flex-1 w-full flex justify-center px-4 sm:px-6 lg:px-8 pt-6 pb-10">
        <div className="w-full max-w-6xl">
          {/* Page heading bubble */}
          <div className="mb-8 text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/80 border border-orange-100 px-4 py-1 text-xs font-medium text-orange-700 shadow-sm">
              <MapPin className="h-3 w-3" />
              <span>We’re here for you & your pet</span>
            </span>
            <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold leading-tight text-neutral-900">
              Contact{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">Careonimal</span>
            </h1>
            <p className="mt-2 text-sm sm:text-base text-neutral-600 max-w-xl mx-auto">
              Questions, feedback, or a little help with a booking — just send
              us a note. Our team loves pets and emails equally. 🐾
            </p>
          </div>

          {/* Main card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start rounded-3xl border border-orange-100 bg-white/90 shadow-[0_18px_45px_rgba(15,23,42,0.12)] p-5 sm:p-8">
            {/* LEFT: FORM */}
            <div className="border-b md:border-b-0 md:border-r border-orange-100 pb-6 md:pb-0 md:pr-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-neutral-600">
                      Name
                    </label>
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      placeholder="Your name"
                      className="w-full rounded-xl border border-orange-100 px-3 py-2.5 outline-none bg-white text-neutral-800 text-sm shadow-sm focus:ring-2 focus:ring-orange-200 focus:border-orange-300 transition"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-neutral-600">
                      Email
                    </label>
                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      placeholder="you@example.com"
                      className="w-full rounded-xl border border-orange-100 px-3 py-2.5 outline-none bg-white text-neutral-800 text-sm shadow-sm focus:ring-2 focus:ring-orange-200 focus:border-orange-300 transition"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-neutral-600">
                    Subject
                  </label>
                  <input
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    placeholder="Tell us what this is about"
                    className="w-full rounded-xl border border-orange-100 px-3 py-2.5 outline-none bg-white text-neutral-800 text-sm shadow-sm focus:ring-2 focus:ring-orange-200 focus:border-orange-300 transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-neutral-600">
                    Message
                  </label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    rows={6}
                    placeholder="How can we help you and your pet?"
                    className="w-full rounded-xl border border-orange-100 px-3 py-2.5 outline-none bg-white text-neutral-800 text-sm shadow-sm resize-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 transition"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <Button
                    type="submit"
                    className="rounded-full bg-orange-600 hover:bg-orange-700 px-6 py-2 text-sm"
                  >
                    Send Message
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-full px-6 py-2 text-sm border-orange-200 hover:bg-orange-50"
                    onClick={() =>
                      setForm({
                        name: "",
                        email: "",
                        subject: "",
                        message: "",
                      })
                    }
                  >
                    Clear
                  </Button>
                  {status && (
                    <p className="text-xs sm:text-sm text-emerald-700">
                      {status}
                    </p>
                  )}
                </div>
              </form>
            </div>

            {/* RIGHT: CONTACT INFO & LOCATION */}
            <div className="space-y-6 md:pl-4">
              <div className="rounded-2xl border border-orange-100 bg-orange-50/80 p-4 sm:p-5 shadow-sm">
                <h3 className="text-lg font-semibold text-neutral-900">
                  Customer Support
                </h3>
                <p className="text-sm text-neutral-700 mt-1">
                  Need help with bookings, payments, or providers? Reach out
                  anytime — we usually reply faster than your pet finishes a
                  treat.
                </p>

                <div className="mt-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="inline-flex items-center justify-center h-9 w-9 rounded-xl bg-white border border-orange-100 shadow-sm">
                      <Mail className="h-4 w-4 text-orange-600" />
                    </div>
                    <div>
                      <a
                        href="mailto:careonimal@gmail.com"
                        className="text-sm font-medium text-neutral-900"
                      >
                        careonimal@gmail.com
                      </a>
                      <p className="text-xs text-neutral-600">
                        We reply within 24 hours
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="inline-flex items-center justify-center h-9 w-9 rounded-xl bg-white border border-orange-100 shadow-sm">
                      <Phone className="h-4 w-4 text-orange-600" />
                    </div>
                    <div>
                      <a
                        href="tel:+916364151684"
                        className="text-sm font-medium text-neutral-900"
                      >
                        +91 63641 51684
                      </a>
                      <p className="text-xs text-neutral-600">
                        Mon — Sun, 8:00 am – 10:00 pm
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-orange-100 bg-white/90 p-4 shadow-sm flex items-start gap-3">
                <div className="mt-1 h-8 w-8 flex items-center justify-center rounded-full bg-orange-50 border border-orange-100">
                  <MapPin className="h-4 w-4 text-orange-600" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-neutral-900">
                    Head Office
                  </h4>
                  <p className="text-xs text-neutral-700 mt-1 leading-relaxed">
                    Basavangudi, Bengaluru, Karnataka, India
                  </p>
                  <p className="text-[11px] text-neutral-500 mt-1">
                    We&apos;re expanding soon to more pet-loving cities. 🐶🐱
                  </p>
                </div>
              </div>

              <div className="text-center pt-2">
                <span className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-4 py-1 border border-orange-100 text-[11px] sm:text-xs shadow-sm">
                  <span className="text-orange-600 font-semibold">
                    #𝑳𝒐𝒗𝒊𝒏𝒈𝑪𝒂𝒓𝒆𝑨𝒏𝒚𝒘𝒉𝒆𝒓𝒆
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
