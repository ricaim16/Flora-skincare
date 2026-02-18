// src/components/Footer.tsx
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-600 text-white font-semibold text-2xl">
                F
              </div>
              <span className="text-2xl font-semibold text-white">Flora Skincare</span>
            </div>
            <p className="mt-4 text-sm">
              Professional skincare treatments for natural, radiant skin.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href="/about" className="hover:text-purple-400 transition">About</Link></li>
              <li><Link href="/services" className="hover:text-purple-400 transition">Services</Link></li>
              <li><Link href="/book" className="hover:text-purple-400 transition">Book Appointment</Link></li>
              <li><Link href="/contact" className="hover:text-purple-400 transition">Contact</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Contact</h3>
            <ul className="space-y-2 text-sm">
              <li>Bole Road, Addis Ababa</li>
              <li><a href="tel:+251911234567">+251 911 234 567</a></li>
              <li><a href="mailto:info@floraskincare.et">info@floraskincare.et</a></li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Follow Us</h3>
            <div className="flex gap-6">
              <a href="#" className="hover:text-purple-400 transition">Instagram</a>
              <a href="#" className="hover:text-purple-400 transition">Facebook</a>
            </div>
            <p className="mt-6 text-sm">
              © {new Date().getFullYear()} Flora Skincare. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}