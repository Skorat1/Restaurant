"use client";

import { useEffect, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { analytics, logAnalyticsEvent } from "@/lib/firebase";

function Tracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");
      logAnalyticsEvent("page_view", {
        page_path: url,
        page_location: window.location.href,
        page_title: document.title || "VELORA Restaurant",
      });
    }
  }, [pathname, searchParams]);

  return null;
}

export default function FirebaseAnalyticsTracker() {
  return (
    <Suspense fallback={null}>
      <Tracker />
    </Suspense>
  );
}
