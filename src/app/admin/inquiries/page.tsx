"use client";

export default function AdminInquiries() {
  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-5 mb-8">
        <div>
          <span className="text-xs uppercase tracking-widest text-amber-400 font-bold bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
            System
          </span>
          <h1 className="mt-2 text-3xl font-serif text-white font-bold">Inquiries</h1>
          <p className="mt-1 text-neutral-400 text-xs sm:text-sm">
            Manage customer inquiries.
          </p>
        </div>
      </div>
      <div className="rounded-3xl border border-neutral-800 bg-neutral-900/60 p-12 text-center text-neutral-400 space-y-2">
        <p className="text-sm font-semibold">No inquiries yet.</p>
        <p className="text-xs text-neutral-500">Customer inquiries will appear here.</p>
      </div>
    </div>
  );
}
