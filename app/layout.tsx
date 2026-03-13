import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import "./globals.css";
import { CartProvider }         from "@/context/CartContext";
import { WishlistProvider }     from "@/context/WishlistContext";
import { AuthProvider }         from "@/context/AuthContext";
import { ThemeProvider }        from "@/context/ThemeContext";
import { NotificationProvider } from "@/context/NotificationContext";
import UserSiteShell            from "@/components/UserSiteShell";

/* ── Google Fonts ──────────────────────────────────────────────────────
   Cormorant Garamond: elegant serif for headings — vintage artisan feel
   DM Sans: clean geometric sans for body text — readable and modern
──────────────────────────────────────────────────────────────────────── */
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

/* ── Page Metadata ──────────────────────────────────────────────────── */
export const metadata: Metadata = {
  title: {
    default:  "Croch_et Masterpiece | Handmade Crochet Art",
    template: "%s | Croch_et Masterpiece",
  },
  description:
    "Handcrafted crochet creations — bags, amigurumi, home décor, and custom orders made with love. Browse our collection and connect with us on WhatsApp.",
  keywords: ["crochet", "handmade", "custom crochet", "crochet bags", "amigurumi", "Pakistan"],
  openGraph: {
    title:       "Croch_et Masterpiece",
    description: "Handmade crochet art & custom orders",
    type:        "website",
    locale:      "en_PK",
    // ogImage: add a nice preview image to /public/og-image.jpg
  },
};

import Image from "next/image";

/* ── Context Providers ──────────────────────────────────────
    ThemeProvider   → Manages light/dark mode
    AuthProvider    → Manages user session from Supabase auth
    CartProvider    → Cart items stored in localStorage + Supabase
    WishlistProvider→ Wishlist synced to Supabase for logged-in users
──────────────────────────────────────────────────────────── */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${dmSans.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-brand-base text-brand-cream font-body antialiased relative min-h-screen">
        
        {/* Global Fixed Background Image */}
        <div className="fixed inset-0 z-[-1] pointer-events-none bg-brand-base dark:bg-brand-deep transition-colors duration-500">
          <Image 
            src="/images/hero-bg-1.jpg" 
            alt="Handcrafted Crochet Background" 
            fill 
            priority
            quality={60}
            className="object-cover opacity-[0.07] dark:opacity-[0.04] mix-blend-multiply dark:mix-blend-screen"
          />
        </div>

        {/* ── Context Providers ──────────────────────────────────────
            ThemeProvider   → Manages light/dark mode
            AuthProvider    → Manages user session from Supabase auth
            CartProvider    → Cart items stored in localStorage + Supabase
            WishlistProvider→ Wishlist synced to Supabase for logged-in users
        ──────────────────────────────────────────────────────────── */}
        <ThemeProvider>
          <AuthProvider>
            <CartProvider>
              <WishlistProvider>
                {/* NotificationProvider: global toast system for user + admin */}
                <NotificationProvider>
                  {/* UserSiteShell: shows Navbar/Footer/LoadingScreen only on non-admin routes */}
                  <UserSiteShell>
                    {children}
                  </UserSiteShell>
                </NotificationProvider>
              </WishlistProvider>
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>

      </body>
    </html>
  );
}
