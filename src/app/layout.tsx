import "./globals.css";  // ← this line loads Tailwind on every page

import type { ReactNode } from "react";

export const metadata = {
  title: "Flora Skincare",
  description: "Flora skincare booking platform",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}