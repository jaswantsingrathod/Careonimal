import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin } from "lucide-react";
import Footer from "@/components/Footer";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState("");

  function handleChange(e) {
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    // temporary client-side action — replace with API call
    console.log("contact form submitted", form);
    setStatus("Thanks — we received your message. We'll respond within 24 hours.");
    setForm({ name: "", email: "", subject: "", message: "" });
  }

  return (
    <main className="min-h-screen w-full bg-white px-4 flex items-start justify-center">
      <div className="w-full max-w-6xl">
        <section className="bg-white rounded-2xl shadow-lg border border-orange-50 overflow-hidden p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">

            {/* LEFT: FORM */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-700 w-max mb-4">
                <MapPin className="h-3 w-3" />
                <span>Get in touch</span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight text-neutral-900 mb-3">Contact <span className="text-orange-600">Careonimal</span></h1>
              <p className="text-neutral-600 mb-6">Questions, feedback, or need help? Drop us a message and our team will get back to you.</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    placeholder="Your name"
                    className="rounded-lg border border-orange-100 px-3 py-2 outline-none bg-white text-neutral-800"
                  />
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    placeholder="Email address"
                    className="rounded-lg border border-orange-100 px-3 py-2 outline-none bg-white text-neutral-800"
                  />
                </div>

                <input
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  placeholder="Subject"
                  className="w-full rounded-lg border border-orange-100 px-3 py-2 outline-none bg-white text-neutral-800"
                />

                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  rows={6}
                  placeholder="How can we help?"
                  className="w-full rounded-lg border border-orange-100 px-3 py-2 outline-none bg-white text-neutral-800"
                />

                <div className="flex items-center gap-3">
                  <Button type="submit" className="rounded-full bg-orange-600 hover:bg-orange-700 px-6 py-2">Send Message</Button>
                  <Button variant="outline" className="rounded-full px-6 py-2" onClick={() => setForm({ name: "", email: "", subject: "", message: "" })}>Clear</Button>
                </div>

                {status && <p className="text-sm text-green-700 mt-2">{status}</p>}
              </form>
            </div>

            {/* RIGHT: CONTACT INFO & MAP */}
            <div className="space-y-4">
              <div className="rounded-2xl border border-orange-100 bg-orange-50 p-4 shadow-sm">
                <h3 className="text-lg font-semibold text-neutral-900">Customer Support</h3>
                <p className="text-sm text-neutral-700 mt-1">We're here 24/7 to help with bookings, refunds, and provider issues.</p>

                <div className="mt-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="inline-flex items-center justify-center h-9 w-9 rounded-lg bg-white border border-orange-100">
                      <Mail className="h-4 w-4 text-orange-600" />
                    </div>
                    <div>
                      <a href="mailto:caronimal@gmail.com" className="text-sm font-medium text-neutral-900">careonimal@gmail.com</a>
                      <p className="text-xs text-neutral-600">We reply within 24 hours</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="inline-flex items-center justify-center h-9 w-9 rounded-lg bg-white border border-orange-100">
                      <Phone className="h-4 w-4 text-orange-600" />
                    </div>
                    <div>
                      <a href="tel:+916364151684" className="text-sm font-medium text-neutral-900">+91 63641 51684</a>
                      <p className="text-xs text-neutral-600">Mon — Sun, 8am — 10pm</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-orange-100 bg-orange-50 p-4 shadow-sm">
                <h4 className="text-sm font-semibold text-neutral-900">Head Office</h4>
                <p className="text-xs text-neutral-700 mt-1">Basavangudi, Bengaluru, Karnataka, India</p>
              </div>

              <div className="text-center mt-2">
                <span className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1 border border-orange-100">
                  <span className="text-orange-600 font-semibold">#𝑳𝒐𝒗𝒊𝒏𝒈𝑪𝒂𝒓𝒆𝑨𝒏𝒚𝒘𝒉𝒆𝒓𝒆</span>
                </span>
              </div>

            </div>
          </div>
        </section>
        <Footer />
      </div>
    </main>
  );
}
