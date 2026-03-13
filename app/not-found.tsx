/**
 * app/not-found.tsx  — Custom 404 Page
 */

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 text-center">
      <div>
        <p className="font-display text-[120px] md:text-[180px] text-brand-deep leading-none select-none">
          404
        </p>
        <h1 className="font-display text-3xl text-brand-cream mb-3 -mt-4">Page Not Found</h1>
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
