"use client";
import Link from "next/link";

export default function OfflinePage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-28 text-center">
      <div className="rounded-3xl border border-neutral-800 bg-neutral-900/60 p-12">
        <div className="text-6xl mb-6">📡</div>
        <h1 className="text-4xl font-serif text-white">You&apos;re Offline</h1>
        <p className="mt-4 text-neutral-400 leading-7">
          It looks like you&apos;ve lost your internet connection. Reconnect to browse our menu, book a table, and explore the L&apos;Étoile Dorée experience.
        </p>
        <div className="mt-8 flex gap-4 justify-center flex-wrap">
          <button
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Try Again
          </button>
          <Link href="/" className="btn-outline">
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
