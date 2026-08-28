export type PublicService = {
  id: number;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string | null;
  durationMinutes: number;
  priceInCents: number;
  isActive?: boolean;
  isMembersOnly?: boolean;
};

export const fallbackServices: PublicService[] = [
  {
    id: 1,
    name: "Chemical Peel",
    slug: "chemical-peel",
    description: "Brightening exfoliation treatment for smoother, clearer skin.",
    imageUrl: "/Chemical peel.jpg",
    durationMinutes: 60,
    priceInCents: 120000,
    isActive: true,
    isMembersOnly: false,
  },
  {
    id: 2,
    name: "DPN Removal",
    slug: "dpn-removal",
    description: "Targeted treatment for safe and careful DPN removal sessions.",
    imageUrl: "/DPN removal.jpg",
    durationMinutes: 75,
    priceInCents: 150000,
    isActive: true,
    isMembersOnly: false,
  },
  {
    id: 3,
    name: "Facial",
    slug: "facial",
    description: "Deep cleansing facial focused on hydration, glow, and recovery.",
    imageUrl: "/facial.jpg",
    durationMinutes: 90,
    priceInCents: 180000,
    isActive: true,
    isMembersOnly: false,
  },
  {
    id: 4,
    name: "Microneedling",
    slug: "microneedling",
    description: "Texture-refining microneedling to support smoother, healthier skin.",
    imageUrl: "/Microneedling.jpg",
    durationMinutes: 90,
    priceInCents: 200000,
    isActive: true,
    isMembersOnly: false,
  },
];
