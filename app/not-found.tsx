/**
 * app/not-found.tsx  — Custom 404 Page
 */

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { MorphingTextReveal } from "@/components/ui/morphing-text-reveal";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 text-center">
      <div>
        <p className="font-display text-[120px] md:text-[180px] text-brand-deep leading-none select-none">
          404
        </p>
        <div className="mb-3 -mt-4">
          <MorphingTextReveal
            texts={["Page Not Found", "Lost In Stitches", "Route Unravelled"]}
            className="font-display text-3xl text-brand-cream"
            interval={2600}
          />
        </div>
        <p className="font-body text-sm text-brand-creamDim/50 mb-8 max-w-sm mx-auto">
          Looks like this stitch unravelled. Let's get you back on track.
        </p>
        <Link href="/" className="btn-gold inline-flex items-center gap-2 text-sm">
          <ArrowLeft size={14} /> Back to Home
        </Link>
      </div>
    </div>
  );
}
