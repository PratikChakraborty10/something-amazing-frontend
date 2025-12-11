"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/navbar";

// Routes that SHOULD show the default Navbar with pt-16
// These are authenticated app routes that need the main navigation
const ROUTES_WITH_NAVBAR = [
  "/campaigns",
  "/contacts",
  "/global-contacts",
  "/settings",
  "/verification",
  "/domains",
];

export function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Check if the current path starts with any of the routes that need navbar
  const shouldShowNavbar = ROUTES_WITH_NAVBAR.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );

  return (
    <>
      {shouldShowNavbar && <Navbar />}
      <main className={`h-full w-full ${shouldShowNavbar ? "pt-16" : ""}`}>
        {children}
      </main>
    </>
  );
}
