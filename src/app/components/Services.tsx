"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader } from "../components/ui/Card";
import { useRouter } from "next/navigation";

interface Service {
  id: number;
  name: string;
  slug: string;
  durationMinutes: number;
  priceInCents: number;
}

export default function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const serviceImages = [
    { match: ["chemical", "peel"], src: "/Chemical peel.jpg" },
    { match: ["dpn"], src: "/DPN removal.jpg" },
    { match: ["facial"], src: "/facial.jpg" },
    { match: ["microneedling"], src: "/Microneedling.jpg" },
    { match: ["consultation"], src: "/Consultation.jpg" },
    { match: ["dermaplaning"], src: "/Dermaplaning.jpg" },
  ];
  const fallbackImages = [
    "/Chemical peel.jpg",
    "/DPN removal.jpg",
    "/facial.jpg",
    "/Microneedling.jpg",
    "/Consultation.jpg",
    "/Dermaplaning.jpg",
  ];

  const getServiceImage = (service: Service, index: number) => {
    const search = `${service.name} ${service.slug}`.toLowerCase();
    const match = serviceImages.find((item) =>
      item.match.some((term) => search.includes(term))
    );

    return match?.src ?? fallbackImages[index % fallbackImages.length];
  };

  useEffect(() => {
    async function fetchServices() {
      try {
        const res = await fetch("/api/services");
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to fetch services");
        }

        setServices(data.services || []);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to fetch services";
        console.error("Failed to fetch services:", message);
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    fetchServices();
  }, []);

  if (loading) {
    return (
      <section id="services" className="scroll-mt-28 px-4 py-20 text-center sm:px-6 md:py-24">
        <p className="text-xl font-semibold text-purple-900">Loading services...</p>
      </section>
    );
  }

  if (!services.length) {
    return (
      <section id="services" className="scroll-mt-28 px-4 py-20 text-center sm:px-6 md:py-24">
        <p className="text-xl font-semibold text-purple-900">
          {error || "No services available at the moment."}
        </p>
      </section>
    );
  }

  const displayServices = showAll ? services : services.slice(0, 4);

  return (
    <section id="services" className="scroll-mt-28 px-4 py-20 sm:px-6 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="section-kicker">Signature treatments</div>
          <h2 className="section-heading mt-6 text-4xl text-purple-950 sm:text-5xl">
            Our Signature Treatments
          </h2>
          <p className="section-copy mt-5 text-lg">
            Refined treatments designed to restore calm, hydration, clarity, and a luminous finish.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {displayServices.map((service, index) => {
            return (
              <Card
                key={service.id}
                className="group relative overflow-hidden bg-white/80"
              >
                <CardHeader className="pb-0">
                  <div className="relative overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-[#f8edff] via-[#f9f2ff] to-[#fff4fa] p-2.5">
                    <div className="relative h-40 overflow-hidden rounded-[1.2rem]">
                      <Image
                        src={getServiceImage(service, index)}
                        alt={service.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
                        className="object-cover transition duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,214,232,0.08),rgba(122,64,194,0.18))]" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-purple-500">
                    {service.slug.replace(/-/g, " ")}
                  </p>
                  <h3 className="mt-2 text-xl font-semibold text-purple-950">
                    {service.name}
                  </h3>
                  <CardDescription className="mt-2 text-sm leading-6">
                    {service.durationMinutes} min session with a soft luxury finish and personalized skin attention.
                  </CardDescription>

                  <div className="mt-4 flex items-center justify-between rounded-[1rem] bg-purple-50/90 px-4 py-2.5">
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-purple-500">
                      Price
                    </span>
                    <span className="text-base font-bold text-purple-950">
                      {(service.priceInCents / 100).toLocaleString()} ETB
                    </span>
                  </div>

                  <div className="mt-4">
                    <Button
                      className="w-full justify-center text-sm"
                      onClick={() =>
                        router.push(`/book?service=${service.slug}&serviceId=${service.id}`)
                      }
                    >
                      Book This Treatment
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {services.length > 4 && (
          <div className="mt-16 text-center">
            <Button
              size="lg"
              variant="secondary"
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? "Show Less" : "View All Services"}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
