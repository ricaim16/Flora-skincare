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
    name: "Facial Glow",
    slug: "facial-glow",
    durationMinutes: 60,
    priceInCents: 120000,
  },
  {
    id: 2,
    name: "Deep Cleansing",
    slug: "deep-cleansing",
    durationMinutes: 75,
    priceInCents: 150000,
  },
  {
    id: 3,
    name: "Acne Treatment",
    slug: "acne-treatment",
    durationMinutes: 90,
    priceInCents: 180000,
  },
  {
    id: 4,
    name: "Glow Therapy",
    slug: "glow-therapy",
    durationMinutes: 90,
    priceInCents: 200000,
  },
];
