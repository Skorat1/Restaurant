"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";
import InaugurationRibbon from "./InaugurationRibbon";
import CartDrawer from "./CartDrawer";
import ChatWidget from "./ChatWidget";

export default function PageWrapper({
  children,
  footer,
}: {
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) {
    return <main className="min-h-screen">{children}</main>;
  }

  return (
    <>
      <InaugurationRibbon />
      <Header />
      <div id="main-content" className={`${pathname === '/' ? '' : 'pt-20 sm:pt-28'} min-h-screen`}>
        {children}
      </div>
      <CartDrawer />
      <ChatWidget />
      {footer}
    </>
  );
}
