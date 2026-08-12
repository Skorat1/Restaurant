import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "404 - Page Not Found | L'Étoile Dorée",
};

export default function NotFound() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-6 py-24 text-center">
      <div className="max-w-md space-y-6">
        <div className="inline-block rounded-full bg-amber-400/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-amber-400 border border-amber-400/20">
          404 Error
        </div>
        <h1 className="text-4xl sm:text-5xl font-serif font-bold text-white tracking-tight">
          Page Not Found
        </h1>
        <p className="text-neutral-400 text-sm leading-relaxed">
          The culinary experience or page you are looking for does not exist or has been moved.
        </p>
        <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="btn-primary px-8 py-3 rounded-full text-xs font-bold uppercase tracking-wider transition hover:scale-105"
          >
            Return to Home
          </Link>
          <Link
            href="/menu"
            className="btn-outline px-8 py-3 rounded-full text-xs font-bold uppercase tracking-wider transition hover:scale-105"
          >
            Explore Menu
          </Link>
        </div>
      </div>
    </div>
  );
}
