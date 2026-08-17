"use client";
import { useAuth } from "@/lib/AuthContext";
import { Crown, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function MembershipBanner() {
  const { user } = useAuth();

  // If no user is logged in, show a generic CTA or hide entirely. Let's show a generic "Join Club" banner.
  if (!user) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 animate-fade-up">
        <div className="rounded-3xl p-6 sm:p-8 border-2 border-amber-500/20 bg-neutral-900/60 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 blur-[80px] pointer-events-none rounded-full" />
          
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 rounded-full bg-neutral-950 border border-amber-500/30 flex items-center justify-center">
              <Crown className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-lg font-serif font-bold text-white flex items-center gap-2">
                Join the Velvet Dining Club
              </h3>
              <p className="text-xs text-neutral-400">Earn perks, complimentary pairings, and priority reservations.</p>
            </div>
          </div>
          
          <Link href="/login" className="btn-outline text-xs py-3 px-6 whitespace-nowrap relative z-10">
            Sign In to View Perks
          </Link>
        </div>
      </section>
    );
  }

  // Determine perks based on user tier (mock data for now if tier doesn't exist)
  const tier = (user as any).tier || "Silver";
  
  let perks = "Complimentary Welcome Champagne";
  if (tier === "Gold") perks = "Priority Seating & Complimentary Dessert";
  if (tier === "Platinum") perks = "Chef's Table Access & Grand Cru Pairing";

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 animate-fade-up">
      <div className="rounded-3xl p-6 sm:p-8 border-2 border-amber-500/40 bg-gradient-to-r from-neutral-900 to-neutral-950 backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_0_40px_rgba(245,158,11,0.1)] relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 blur-[80px] pointer-events-none rounded-full" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 blur-[80px] pointer-events-none rounded-full" />

        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 rounded-full bg-amber-500/20 border border-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Sparkles className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-serif font-bold text-white flex items-center gap-2">
              Welcome back, {user.name}!
              <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-black bg-amber-400 px-2.5 py-0.5 rounded-full">
                {tier} Member
              </span>
            </h3>
            <p className="text-xs sm:text-sm text-neutral-300 mt-1">
              Your {tier} Perk Unlocked: <strong className="text-amber-400">{perks}</strong>
            </p>
          </div>
        </div>

        <Link href="/profile" className="btn-primary text-xs py-3 px-6 whitespace-nowrap flex items-center gap-2 relative z-10 shadow-lg shadow-amber-500/20">
          View All Rewards <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}
