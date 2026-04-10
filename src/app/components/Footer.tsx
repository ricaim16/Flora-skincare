import Link from "next/link";
import { Instagram, MapPin, Music2, PhoneCall } from "lucide-react";
import { clinic } from "../../lib/clinic";

export default function Footer() {
  return (
    <footer className="mt-16 px-4 pb-6 sm:px-6">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,#1f0d31,#34144f_45%,#4f257f)] px-6 py-10 text-purple-100 shadow-[0_28px_80px_rgba(32,9,54,0.32)] sm:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/14 text-xl font-bold text-white">
                F
              </div>
              <div>
                <span className="block text-xl font-semibold text-white">Flora Skincare</span>
                <span className="text-xs font-semibold uppercase tracking-[0.24em] text-purple-200">
                  Clinic & Glow Studio
                </span>
              </div>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-6 text-purple-100/78">
              Elegant skincare treatments, personalized glow plans, and an inviting clinic experience in Addis Ababa.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold text-white">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href="/#about" className="transition hover:text-white">About</Link></li>
              <li><Link href="/#services" className="transition hover:text-white">Services</Link></li>
              <li><Link href="/book" className="transition hover:text-white">Book Appointment</Link></li>
              <li><Link href="/#contact" className="transition hover:text-white">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold text-white">Contact</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-purple-200" />
                {clinic.addressShort}, Addis Ababa
              </li>
              <li className="flex items-center gap-2">
                <PhoneCall className="h-4 w-4 text-purple-200" />
                <a href={clinic.primaryPhoneHref} className="transition hover:text-white">{clinic.primaryPhoneDisplay}</a>
              </li>
              <li>
                <a href={clinic.emailHref} className="transition hover:text-white">
                  {clinic.emailDisplay}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold text-white">Visit Online</h3>
            <div className="flex flex-col gap-3 text-sm">
              <a
                href={clinic.instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 transition hover:text-white"
              >
                <Instagram className="h-4 w-4 text-purple-200" />
                Instagram
              </a>
              <a
                href={clinic.tiktokUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 transition hover:text-white"
              >
                <Music2 className="h-4 w-4 text-purple-200" />
                TikTok
              </a>
              <a
                href={clinic.mapLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 transition hover:text-white"
              >
                <MapPin className="h-4 w-4 text-purple-200" />
                Google Maps
              </a>
            </div>
            <p className="mt-6 text-sm text-purple-100/78">
              © {new Date().getFullYear()} Flora Skincare. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
