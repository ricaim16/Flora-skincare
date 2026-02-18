"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import Link from "next/link";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { label: "About", href: "/#about" },
    { label: "Services", href: "/#services" },
    { label: "Contact", href: "/#contact" },
    { label: "Book", href: "/book" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-purple-300 shadow-md">
      <div className="mx-auto max-w-7xl flex h-16 items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-purple-700 text-white font-bold text-2xl">
            F
          </div>
          <span className="text-2xl font-semibold text-purple-900">Flora Skincare</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8 text-purple-900 font-semibold">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="relative px-3 py-2 text-base sm:text-lg md:text-xl font-semibold text-purple-900
                         after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-1
                         after:bg-purple-800 after:transition-all after:duration-500
                         hover:after:w-full"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-purple-900"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <Menu size={32} />
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <nav className="md:hidden bg-purple-300 border-t border-purple-400 py-4 px-6 space-y-2 text-purple-900 font-medium">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
             className="relative px-3 py-2 text-base sm:text-lg md:text-xl font-semibold text-purple-900
             after:absolute after:bottom-0 after:left-0 after:w-0 after:h-1
             after:bg-purple-800 after:transition-all after:duration-500
             hover:after:w-full"
             
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
