"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled client error:", error);
  }, [error]);

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-6 py-24 text-center">
      <div className="max-w-md space-y-6">
        <div className="inline-block rounded-full bg-rose-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-rose-400 border border-rose-500/20">
          Unexpected Error
        </div>
        <h1 className="text-4xl sm:text-5xl font-serif font-bold text-white tracking-tight">
          Something went wrong
        </h1>
        <p className="text-neutral-400 text-sm leading-relaxed">
          We encountered an issue processing your request. Please try again or return to the main hall.
        </p>
        <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => reset()}
            className="btn-primary px-8 py-3 rounded-full text-xs font-bold uppercase tracking-wider transition hover:scale-105"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="btn-outline px-8 py-3 rounded-full text-xs font-bold uppercase tracking-wider transition hover:scale-105"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
