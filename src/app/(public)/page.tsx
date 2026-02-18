// src/app/page.tsx
import Header from "../components/Header";
import Hero from "../components/Hero";
import Services from "../components/Services";
import Footer from "../components/Footer";
import Link from "next/link";
import Image from "next/image";
import { Button } from "../components/ui/Button";
import Contact from "../components/Contact";
import About from "../components/About";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main>
        <Hero />

        <Services />

        {/* Purple banner before contact – smaller height
        <section className="relative py-12 md:py-16 bg-gradient-to-br from-purple-900 to-purple-700 text-white overflow-hidden">
          <div className="absolute inset-0">
            <Image
              src="/4.webp"
              alt="Skincare journey"
              fill
              className="object-cover opacity-30"
              priority
            />
          </div>
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Ready to Start Your Journey?
            </h2>
            <p className="mt-4 text-lg max-w-3xl mx-auto opacity-90">
              Book your session today and experience professional skincare tailored just for you.
            </p>
            <div className="mt-8">
              <Link href="/book">
                <Button size="lg" variant="primary" className="bg-white text-purple-700 hover:bg-gray-100">
                  Book Appointment
                </Button>
              </Link>
            </div>
          </div>
        </section> */}

        

        {/* Contact section */}
        <About />
        <Contact />
      </main>

      <Footer />
    </div>
  );
}
