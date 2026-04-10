import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Button } from "../components/ui/Button";

interface HeroProps {
  title?: string;
  subtitle?: string;
  imageSrc?: string;
  ctaText?: string;
  ctaLink?: string;
}

export default function Hero({
  title = "Where clinical care meets soft, radiant beauty.",
  subtitle = "Flora Skincare Clinic offers tailored facials, glow-focused treatments, and a calm luxury experience designed around your skin goals.",
  imageSrc = "/3.jpg",
  ctaText = "Book Appointment",
  ctaLink = "/book",
}: HeroProps) {
  return (
    <section className="page-shell relative px-4 pb-12 pt-10 sm:px-6 sm:pb-20 sm:pt-14">
      <div className="ambient-orb left-[4%] top-28 h-20 w-20 bg-gradient-to-br from-fuchsia-200 to-purple-300" />
      <div className="ambient-orb right-[9%] top-36 h-16 w-16 bg-gradient-to-br from-purple-300 to-violet-400" />
      <div className="ambient-orb bottom-16 left-[48%] h-10 w-10 bg-gradient-to-br from-pink-200 to-fuchsia-300" />

      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.04fr_0.96fr]">
        <div className="max-w-2xl">
          <h1 className="section-heading fade-up mt-6 text-5xl text-purple-950 sm:text-6xl lg:text-7xl">
            {title}
          </h1>

          <p className="section-copy fade-up-delay mt-6 max-w-xl text-lg sm:text-xl">
            {subtitle}
          </p>

          <div className="fade-up-delay-2 mt-8 flex flex-col gap-4 sm:flex-row">
            <Button href={ctaLink} size="lg">
              {ctaText}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[28rem] lg:ml-auto">
          <div className="absolute inset-0 translate-x-4 translate-y-4 rounded-[2.2rem] bg-gradient-to-br from-fuchsia-200/75 via-purple-200/65 to-violet-300/65 blur-xl" />
          <div className="relative overflow-hidden rounded-[2rem] shadow-[0_30px_60px_rgba(88,42,134,0.2)]">
            <div className="relative aspect-[4/4.1] overflow-hidden rounded-[2rem]">
              <Image
                src={imageSrc}
                alt="Professional skincare treatment at Flora Skincare Clinic"
                fill
                sizes="(max-width: 1024px) 100vw, 46vw"
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,190,221,0.3),rgba(150,91,224,0.24)_52%,rgba(255,255,255,0.05))]" />
              <div className="absolute inset-y-0 right-0 w-18 bg-gradient-to-l from-purple-200/60 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#7b3cc2]/16 to-transparent" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
