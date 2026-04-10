"use client";

import { useEffect, useState } from "react";
import {
  Clock3,
  Instagram,
  Mail,
  MapPin,
  Music2,
  PhoneCall,
  Send,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Textarea } from "../components/ui/Textarea";
import { Toast } from "./ui/Toast";
import { clinic } from "../../lib/clinic";

type ToastState = {
  message: string;
  type: "success" | "error";
};

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  useEffect(() => {
    if (!toast) return;

    const timeout = window.setTimeout(() => {
      setToast(null);
    }, 3500);

    return () => window.clearTimeout(timeout);
  }, [toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setToast(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phoneNumber: phone,
          message,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setToast({
          message: "Your message was sent successfully.",
          type: "success",
        });
        setName("");
        setEmail("");
        setPhone("");
        setMessage("");
      } else {
        setToast({
          message: data.error || "Something went wrong. Please try again.",
          type: "error",
        });
      }
    } catch {
      setToast({
        message: "Something went wrong. Please try again.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="scroll-mt-28 px-4 py-20 sm:px-6 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="section-kicker">Visit or message us</div>
          <h2 className="section-heading mt-6 text-4xl text-purple-950 sm:text-5xl">
            Get in Touch
          </h2>
          <p className="section-copy mt-5 text-lg">
            Ask questions, book your treatment, or find the clinic easily with our map and social channels.
          </p>
        </div>

        <div className="mt-12 grid items-start gap-5 lg:grid-cols-[0.98fr_1.02fr]">
          <div className="glass-panel rounded-[2rem] p-5 sm:p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.5rem] bg-purple-50/90 p-5">
                <PhoneCall className="h-5 w-5 text-purple-700" />
                <p className="mt-4 text-sm font-semibold uppercase tracking-[0.18em] text-purple-500">
                  Call us
                </p>
                <a href={clinic.primaryPhoneHref} className="mt-2 block text-lg font-semibold text-purple-950">
                  {clinic.primaryPhoneDisplay}
                </a>
              </div>

              <div className="rounded-[1.5rem] bg-purple-50/90 p-5">
                <Mail className="h-5 w-5 text-purple-700" />
                <p className="mt-4 text-sm font-semibold uppercase tracking-[0.18em] text-purple-500">
                  Email
                </p>
                <a href={clinic.emailHref} className="mt-2 block text-lg font-semibold text-purple-950">
                  {clinic.emailDisplay}
                </a>
              </div>
            </div>

            <div className="mt-4 rounded-[1.5rem] bg-purple-950 p-5 text-white">
              <div className="flex items-start gap-4">
                <MapPin className="mt-1 h-5 w-5 text-purple-200" />
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-purple-200">
                    Clinic location
                  </p>
                  <p className="mt-2 text-lg font-semibold">{clinic.addressShort}</p>
                  <p className="mt-1 text-sm text-purple-100/80">Addis Ababa</p>
                  <a
                    href={clinic.mapLink}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex text-sm font-semibold text-white/85 underline underline-offset-4"
                  >
                    Open Flora Skin Care Map
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-[1.5rem] bg-purple-50/90 p-5">
              <div className="flex items-start gap-4">
                <Clock3 className="mt-1 h-5 w-5 text-purple-700" />
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-purple-500">
                    Hours
                  </p>
                  <p className="mt-2 text-base font-semibold text-purple-950">
                    Monday to Saturday
                  </p>
                  <p className="text-sm text-purple-700">9:00 AM to 6:00 PM</p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={clinic.instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-white px-4 py-3 text-sm font-semibold text-purple-950 transition hover:-translate-y-0.5 hover:border-purple-300"
              >
                <Instagram className="h-4 w-4" />
                Instagram
              </a>
              <a
                href={clinic.tiktokUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-white px-4 py-3 text-sm font-semibold text-purple-950 transition hover:-translate-y-0.5 hover:border-purple-300"
              >
                <Music2 className="h-4 w-4" />
                TikTok
              </a>
            </div>

            <div className="map-frame mt-5 h-[220px] sm:h-[240px]">
              <iframe
                title="Flora Skincare Clinic map"
                src={clinic.mapEmbed}
                className="h-full w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          <div className="glass-panel rounded-[2rem] p-5 sm:p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-purple-500">
              Send a message
            </p>
            <h3 className="mt-2 text-2xl font-semibold text-purple-950">
              We&apos;ll help you choose the right treatment.
            </h3>
            <form className="mt-5 space-y-3.5" onSubmit={handleSubmit}>
              <Input
                label="Full Name"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <Input
                label="Email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                label="Phone Number"
                placeholder="+251 9xx xxx xxx"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <Textarea
                label="Message"
                placeholder="Tell us what kind of skincare support or treatment you want."
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />

              <Button type="submit" variant="primary" size="lg" disabled={loading}>
                {loading ? "Sending..." : "Send Message"}
                {!loading && <Send className="h-4 w-4" />}
              </Button>
            </form>
          </div>
        </div>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </section>
  );
}
