# Croch_et Masterpiece 🧶

A luxury dark-themed Next.js website for a handmade crochet business.

## ✨ Features

- **Dark artisan aesthetic** — deep forest green (#102C26) + warm cream (#F7E7CE) palette
- **Loading screen** with Luma Spin animation
- **Product catalogue** with category filtering and search
- **Wishlist** — save favourite items (localStorage, Supabase-ready)
- **Cart** — add items, adjust quantities, checkout via WhatsApp
- **Custom Order form** — pre-fills a WhatsApp message with order details
- **Auth pages** — login & signup with typewriter animation (Supabase-ready)
- **Contact page** with all social links
- **Supabase-ready** — full database architecture documented in `lib/supabase.ts`

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Open http://localhost:3000
```

## 🔌 Connecting Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Copy your credentials to `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJI...
   ```
3. Run the SQL schema from `lib/supabase.ts` in the Supabase SQL editor
4. Activate the client in `lib/supabase.ts` (follow the comments)
5. Replace mock data in pages with Supabase queries (each file has comments)

## 📁 Project Structure

```
crochet-masterpiece/
├── app/
│   ├── layout.tsx           # Root layout with fonts + providers
│   ├── page.tsx             # Home page
│   ├── globals.css          # Global styles + CSS variables
│   ├── not-found.tsx        # 404 page
│   ├── products/
│   │   ├── page.tsx         # Product catalogue
│   │   └── [id]/page.tsx    # Product detail
│   ├── custom-order/page.tsx
│   ├── wishlist/page.tsx
│   ├── cart/page.tsx
│   ├── auth/
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   └── contact/page.tsx
├── components/
│   ├── ui/
│   │   ├── luma-spin.tsx    # Animated loader component
│   │   └── loading-screen.tsx
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   └── ProductCard.tsx
├── context/
│   ├── AuthContext.tsx      # User session (Supabase-ready)
│   ├── CartContext.tsx      # Cart (localStorage + Supabase-ready)
│   └── WishlistContext.tsx  # Wishlist (localStorage + Supabase-ready)
├── lib/
│   ├── supabase.ts          # Supabase client + FULL DB SCHEMA
│   ├── types.ts             # TypeScript types
│   └── database.types.ts   # Generated DB types placeholder
├── data/
│   └── products.ts          # Mock data (replace with Supabase queries)
└── public/                  # Static assets (add product images here)
```

## 🎨 Brand Colors

| Token         | Hex       | Use              |
|---------------|-----------|------------------|
| `brand-base`  | `#07100d` | Page background  |
| `brand-deep`  | `#102C26` | Sections/cards   |
| `brand-cream` | `#F7E7CE` | Primary text     |
| `brand-gold`  | `#c4843c` | Accent/buttons   |
| `brand-rose`  | `#c97d7d` | Secondary accent |

## 📱 Social Links

- **WhatsApp**: 0315-9202186
- **Instagram**: @croch_etmasterpiece
- **Facebook**: Croch_et Masterpiece
- **TikTok**: @croch_et.masterpiece
- **Email**: amnamubeen516@gmail.com
