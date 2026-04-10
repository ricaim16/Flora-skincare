"use client";

import Image from "next/image";
import { HeartHandshake, Leaf, ShieldCheck } from "lucide-react";

export default function About() {
  const values = [
    {
      icon: Leaf,
      title: "Tailored skin plans",
      copy: "Every treatment is adjusted around your skin condition, comfort level, and glow goals.",
    },
    {
      icon: ShieldCheck,
      title: "Clean clinical standards",
      copy: "A polished studio experience with gentle techniques, premium products, and thoughtful care.",
    },
    {
      icon: HeartHandshake,
      title: "Warm, feminine atmosphere",
      copy: "We blend skincare expertise with a soft, calming environment that feels elevated and welcoming.",
    },
  ];

  return (
    <section id="about" className="scroll-mt-28 px-4 py-16 sm:px-6 md:py-24">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        <div className="grid items-center gap-14 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="relative order-2 flex items-center justify-center lg:order-1">
            <div className="absolute -left-6 top-8 h-24 w-24 rounded-full bg-purple-200/80 blur-3xl" />
            <div className="glass-panel relative w-full max-w-[32rem] overflow-hidden rounded-[2rem] p-3">
              <div className="relative aspect-[4/4.8] overflow-hidden rounded-[1.5rem]">
                <Image
                  src="/Consultation.jpg"
                  alt="Skincare consultation at Flora Skincare"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-[linear-gradient(160deg,rgba(255,204,229,0.16),rgba(126,73,205,0.16)_55%,rgba(255,255,255,0.04))]" />
              </div>
            </div>

            <div className="absolute -bottom-5 right-2 glass-panel rounded-[1.5rem] px-5 py-4 md:right-0">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-purple-500">
                Flora promise
              </p>
              <p className="mt-2 text-base font-semibold text-purple-950">
                Skin health first, beauty always.
              </p>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <div className="section-kicker">About the clinic</div>
            <h2 className="section-heading mt-6 text-4xl text-purple-950 sm:text-5xl">
              Thoughtful treatments that feel luxurious and personal.
            </h2>
            <p className="section-copy mt-6 text-lg">
              At Flora Skincare, we believe healthy skin creates confidence. Our clinic is built around calm care, precise treatment choices, and a beautiful environment that helps every visit feel special.
            </p>
            <p className="section-copy mt-4 text-lg">
              Whether you want help with acne, texture, dryness, or overall maintenance, we create a skincare experience that is gentle, polished, and tailored to you.
            </p>

            <div className="mt-8 grid gap-4">
              {values.map(({ icon: Icon, title, copy }) => (
                <div
                  key={title}
                  className="glass-panel rounded-[1.6rem] p-5"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-100 to-purple-200 text-purple-900">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-purple-950">
                        {title}
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-purple-700">
                        {copy}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
