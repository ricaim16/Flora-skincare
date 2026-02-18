"use client";

import { useEffect, useState } from "react";
import { Button } from "../components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/Card";
import Link from "next/link";
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
  const router = useRouter();

  useEffect(() => {
    async function fetchServices() {
      try {
        const res = await fetch("/api/services");
        const data = await res.json();
        setServices(data.services || []);
      } catch (error) {
        console.error("Failed to fetch services");
      } finally {
        setLoading(false);
      }
    }

    fetchServices();
  }, []);

  if (loading) {
    return (
      <section id="services" className="py-20 md:py-28 bg-gray-50 scroll-mt-24 text-center">
        <p className="text-purple-900 text-xl">Loading services...</p>
      </section>
    );
  }

  if (!services.length) {
    return (
      <section id="services" className="py-20 md:py-28 bg-gray-50 scroll-mt-24 text-center">
        <p className="text-purple-900 text-xl">No services available at the moment.</p>
      </section>
    );
  }

  // Show 4 services by default if showAll is false
  const displayServices = showAll ? services : services.slice(0, 4);

  return (
    <section id="services" className="py-20 md:py-28 bg-gray-50 scroll-mt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-grey-900">
            Our Signature Treatments
          </h2>
          <p className="mt-4 text-xl text-grey-900 max-w-3xl mx-auto">
            Personalized care to bring out your skin’s natural radiance and health
          </p>
        </div>

        {/* Service Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {displayServices.map((service, index) => (
            <Card key={service.id} className="overflow-hidden transition-transform hover:-translate-y-2">
              <CardHeader className="pb-3">
                <div className="h-48 bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center text-6xl">
                  {["✨", "🌿", "🧴", "💆‍♀️"][index % 4]}
                </div>
              </CardHeader>
              
              
<CardContent className="flex flex-col items-center text-center">
  {/* 1. Name */}
  <h2 className="text-2xl md:text-2xl font-bold text-purple-900">
    {service.name}
  </h2>

  {/* 2. Slug */}
  <p className="text-sm text-gray-600 mt-1">
    {service.slug}
  </p>

  {/* 3. Duration & Price */}
  <CardDescription className="text-base mt-2">
    {service.durationMinutes} min • {service.priceInCents / 100} ETB
  </CardDescription>

  {/* 4. Centered Book Now Button */}
  <div className="flex justify-center mt-6">
    <Button
      className="px-6 py-3 bg-purple-700 hover:bg-purple-900 text-white rounded-lg transition-colors w-auto"
      onClick={() =>
        router.push(`/book?service=${service.slug}&serviceId=${service.id}`)
      }
    >
      Book Now
    </Button>
  </div>
</CardContent>



            </Card>
          ))}
        </div>

        {/* View All / Collapse Button */}
        {services.length > 4 && (
          <div className="mt-16 text-center">
            <Button
              size="lg"
              variant="primary"
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
