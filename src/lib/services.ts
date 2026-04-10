export type PublicService = {
  id: number;
  name: string;
  slug: string;
  durationMinutes: number;
  priceInCents: number;
};

export const fallbackServices: PublicService[] = [
  {
    id: 1,
    name: "Chemical Peel",
    slug: "chemical-peel",
    durationMinutes: 60,
    priceInCents: 120000,
  },
  {
    id: 2,
    name: "DPN Removal",
    slug: "dpn-removal",
    durationMinutes: 75,
    priceInCents: 150000,
  },
  {
    id: 3,
    name: "Facial",
    slug: "facial",
    durationMinutes: 90,
    priceInCents: 180000,
  },
  {
    id: 4,
    name: "Microneedling",
    slug: "microneedling",
    durationMinutes: 90,
    priceInCents: 200000,
  },
];
