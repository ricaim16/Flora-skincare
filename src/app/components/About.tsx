"use client";
import Image from "next/image";

export default function About() {
  return (
    <section
      id="about"
      className="py-16 md:py-24 bg-white scroll-mt-24"
    >
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-16 items-stretch">
          {/* Image */}
          <div className="relative order-2 lg:order-1 flex items-center justify-center">
            <div className="relative w-full aspect-[4/5] max-h-[500px] overflow-hidden rounded-3xl shadow-2xl border border-gray-100">
              <Image
                src="/4.webp"
                alt="Professional esthetician providing personalized skincare treatment"
                fill
                className="object-cover rounded-3xl"
                priority
              />
            </div>
            <div className="absolute -bottom-8 -right-8 md:-bottom-10 md:-right-10 h-32 w-32 md:h-48 md:w-48 rounded-full bg-purple-100/30 blur-3xl" />
          </div>

          {/* Content */}
          <div className="order-1 lg:order-2 space-y-6 px-4 sm:px-0 flex flex-col justify-center">
            <h2 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
              About Flora Skincare
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              At Flora Skincare, we believe healthy skin is the foundation of confidence.
              Our treatments are safe, effective, and personalized to your unique skin type and needs.
              Using premium products and gentle techniques, we help you achieve that natural, radiant glow you deserve.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              Whether you're dealing with acne, dryness, or just want to maintain healthy skin,
              we're here to guide you every step of the way.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}