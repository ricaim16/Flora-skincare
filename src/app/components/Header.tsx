"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/Button";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { label: "About", href: "/#about" },
    { label: "Services", href: "/#services" },
    { label: "Contact", href: "/#contact" },
  ];

  return (
    <header className="sticky top-0 z-50 px-4 pt-4 sm:px-6">
      <div className="mx-auto max-w-7xl rounded-[1.75rem] border border-white/60 bg-white/70 shadow-[0_20px_50px_rgba(44,17,75,0.12)] backdrop-blur-xl">
        <div className="flex h-20 items-center justify-between px-5 sm:px-7">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-700 via-fuchsia-600 to-purple-400 text-xl font-bold text-white shadow-[0_16px_24px_rgba(118,66,183,0.24)]">
              F
            </div>
            <div>
              <span className="block text-lg font-semibold tracking-tight text-purple-950">
                Flora Skincare
              </span>
              <span className="text-xs font-semibold uppercase tracking-[0.28em] text-purple-500">
                Clinic & Glow Studio
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full px-4 py-2 text-sm font-semibold text-purple-900 transition hover:bg-purple-50 hover:text-purple-700"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Button href="/book" size="sm">
              Book Now
            </Button>
          </div>

          <button
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-purple-200 bg-white text-purple-950 md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {mobileOpen && (
          <nav className="border-t border-purple-100 px-5 pb-5 pt-3 md:hidden">
            <div className="grid gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-2xl px-4 py-3 text-sm font-semibold text-purple-900 transition hover:bg-purple-50"
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <Button href="/book" size="sm">
                Book Now
              </Button>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
