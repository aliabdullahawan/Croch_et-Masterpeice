/**
 * data/products.ts
 * ─────────────────────────────────────────────────────
 * MOCK DATA — used while Supabase is not connected.
 *
 * TO REPLACE WITH REAL DATA:
 *  1. Connect Supabase (see lib/supabase.ts for setup)
 *  2. In each component/page that uses this mock, import { supabase } from "@/lib/supabase"
 *     and query:
 *       const { data: products } = await supabase
 *         .from("products")
 *         .select("*, category:categories(*), reviews(*)")
 *         .eq("is_available", true)
 *         .order("created_at", { ascending: false });
 *  3. Delete this mock file or keep for dev fallback.
 */

import type { Product } from "@/lib/types";

export const MOCK_CATEGORIES = [
  { id: 1, name: "All",        slug: "all",        sort_order: 0, description: null, image_url: null },
  { id: 2, name: "Bags",       slug: "bags",       sort_order: 1, description: null, image_url: null },
  { id: 3, name: "Amigurumi",  slug: "amigurumi",  sort_order: 2, description: null, image_url: null },
  { id: 4, name: "Home Décor", slug: "home-decor", sort_order: 3, description: null, image_url: null },
  { id: 5, name: "Accessories",slug: "accessories",sort_order: 4, description: null, image_url: null },
  { id: 6, name: "Custom",     slug: "custom",     sort_order: 5, description: null, image_url: null },
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id:           "prod-001",
    category_id:  2,
    name:         "Forest Mesh Tote Bag",
    slug:         "forest-mesh-tote-bag",
    description:  "Handcrafted open-mesh tote in earthy forest tones. Perfect for the beach, market, or everyday adventures. Made with premium cotton yarn.",
    price:        3500,
    is_custom:    false,
    is_available: true,
    is_featured:  true,
    images: [
      "https://i.pinimg.com/736x/e7/cf/cb/e7cfcbd7a8af10b8839c8d9a3d8eb4ce.jpg",
    ],
    tags: ["tote", "bag", "cotton", "earthy"],
    created_at: new Date().toISOString(),
    category: { id: 2, name: "Bags", slug: "bags", sort_order: 1, description: null, image_url: null },
  },
  {
    id:           "prod-002",
    category_id:  3,
    name:         "Teddy Bear Amigurumi",
    slug:         "teddy-bear-amigurumi",
    description:  "Adorable hand-crocheted teddy bear, stuffed with hypoallergenic filling. A perfect gift for babies and children.",
    price:        2200,
    is_custom:    false,
    is_available: true,
    is_featured:  true,
    images: [
      "https://i.pinimg.com/736x/f4/b0/00/f4b000a6880f7e8d0c677812d789e001.jpg",
    ],
    tags: ["amigurumi", "teddy", "gift", "kids"],
    created_at: new Date().toISOString(),
    category: { id: 3, name: "Amigurumi", slug: "amigurumi", sort_order: 2, description: null, image_url: null },
  },
  {
    id:           "prod-003",
    category_id:  4,
    name:         "Boho Wall Hanging",
    slug:         "boho-wall-hanging",
    description:  "Statement wall art in macramé-inspired crochet. Adds warmth and texture to any wall.",
    price:        4200,
    is_custom:    false,
    is_available: true,
    is_featured:  true,
    images: [
      "https://i.pinimg.com/1200x/ae/cf/d7/aecfd72b2439914647ec06d19cb182b5.jpg",
    ],
    tags: ["wall art", "boho", "home decor"],
    created_at: new Date().toISOString(),
    category: { id: 4, name: "Home Décor", slug: "home-decor", sort_order: 3, description: null, image_url: null },
  },
  {
    id:           "prod-004",
    category_id:  5,
    name:         "Cream Bucket Hat",
    slug:         "cream-bucket-hat",
    description:  "Lightweight crocheted bucket hat — keeps you stylish in the sun. One size fits most.",
    price:        1800,
    is_custom:    false,
    is_available: true,
    is_featured:  false,
    images: [
      "https://i.pinimg.com/736x/5d/f7/69/5df7696c4f24b7961c8c72748a355ff8.jpg",
    ],
    tags: ["hat", "accessories", "summer"],
    created_at: new Date().toISOString(),
    category: { id: 5, name: "Accessories", slug: "accessories", sort_order: 4, description: null, image_url: null },
  },
  {
    id:           "prod-005",
    category_id:  2,
    name:         "Mini Crossbody Bag",
    slug:         "mini-crossbody-bag",
    description:  "Dainty crocheted mini bag with an adjustable strap. Great for evenings out.",
    price:        2800,
    is_custom:    false,
    is_available: true,
    is_featured:  false,
    images: [
      "https://i.pinimg.com/736x/9c/f2/8b/9cf28b4df4e06e0ca34fbe87f25734b6.jpg",
    ],
    tags: ["crossbody", "bag", "mini", "evening"],
    created_at: new Date().toISOString(),
    category: { id: 2, name: "Bags", slug: "bags", sort_order: 1, description: null, image_url: null },
  },
  {
    id:           "prod-006",
    category_id:  4,
    name:         "Crochet Plant Hanger",
    slug:         "crochet-plant-hanger",
    description:  "Elevate your plant game with this handcrafted hanging planter. Fits pots up to 18 cm diameter.",
    price:        1400,
    is_custom:    false,
    is_available: true,
    is_featured:  false,
    images: [
      "https://i.pinimg.com/736x/e7/cf/cb/e7cfcbd7a8af10b8839c8d9a3d8eb4ce.jpg",
    ],
    tags: ["plant hanger", "home decor", "macrame"],
    created_at: new Date().toISOString(),
    category: { id: 4, name: "Home Décor", slug: "home-decor", sort_order: 3, description: null, image_url: null },
  },
  {
    id:           "prod-007",
    category_id:  6,
    name:         "Custom Order",
    slug:         "custom-order",
    description:  "Have something special in mind? Tell us your vision and we'll bring it to life in crochet.",
    price:        null,
    is_custom:    true,
    is_available: true,
    is_featured:  true,
    images: [
      "https://i.pinimg.com/1200x/ae/cf/d7/aecfd72b2439914647ec06d19cb182b5.jpg",
    ],
    tags: ["custom", "bespoke", "personalized"],
    created_at: new Date().toISOString(),
    category: { id: 6, name: "Custom", slug: "custom", sort_order: 5, description: null, image_url: null },
  },
];

export const MOCK_REVIEWS = [
  { id: "r1", rating: 5, title: "Absolute gem!", body: "The quality is outstanding. My Forest Tote gets compliments everywhere I go.", profile: { full_name: "Zara K.",   avatar_url: null }, created_at: new Date().toISOString(), product_id: "prod-001", user_id: "u1", images: [], is_approved: true },
  { id: "r2", rating: 5, title: "So cute!",      body: "Ordered the teddy bear as a gift — it was even more beautiful in person. Packaged so neatly too.", profile: { full_name: "Sana M.",   avatar_url: null }, created_at: new Date().toISOString(), product_id: "prod-002", user_id: "u2", images: [], is_approved: true },
  { id: "r3", rating: 5, title: "Best purchase", body: "The wall hanging transformed my room. Amna puts so much love into her work.", profile: { full_name: "Hira A.",   avatar_url: null }, created_at: new Date().toISOString(), product_id: "prod-003", user_id: "u3", images: [], is_approved: true },
  { id: "r4", rating: 5, title: "Custom magic!", body: "Got a custom bag made with my favourite colours. Communication was smooth and delivery was fast!", profile: { full_name: "Ayesha R.", avatar_url: null }, created_at: new Date().toISOString(), product_id: "prod-007", user_id: "u4", images: [], is_approved: true },
];
