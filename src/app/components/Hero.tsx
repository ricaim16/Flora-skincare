import Image from "next/image";
import { Button } from "../components/ui/Button";
import Link from "next/link";

interface HeroProps {
  title?: string;
  subtitle?: string;
  imageSrc?: string;
  ctaText?: string;
  ctaLink?: string;
}

export default function Hero({
  title = "Ready to Start Your Journey?",
  subtitle = "Book your session today and experience professional skincare tailored just for you.",
  imageSrc = "/4.webp",
  ctaText = "Book Appointment",
  ctaLink = "/book",
}: HeroProps) {
  return (
    <section className="bg-white min-h-[750px] flex items-center">
  <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-2 items-center gap-10 px-6 py-20">
    {/* Left Text */}
    <div className="text-purple-900 max-w-xl space-y-6">
      <h1 className="text-4xl font-extrabold leading-tight md:text-5xl">
        {title}
      </h1>
      <p className="text-lg font-semibold">{subtitle}</p>



     <Link href={ctaLink}>
  <Button
    className="bg-purple-700 text-white hover:bg-purple-800 
               px-10 py-4 text-lg font-semibold 
               rounded-full transition-all duration-300 
               shadow-md hover:shadow-lg"
  >
    {ctaText}
  </Button>
</Link>



    </div>

    {/* Right Image */}
<div className="relative w-full h-[500px]">
      <Image
        src={imageSrc}
        alt="Skincare journey"
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        className="object-cover"
        priority
      />
    </div>
  </div>
</section>

  );
}
