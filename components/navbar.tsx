"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Mail,
  Users,
  Settings,
  LogOut,
  User,
  ChevronDown,
} from "lucide-react";
import { ModeToggle } from "./mode-toggle";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/lib/auth-store";
import { getProfile } from "@/lib/api";

// Navigation links
const navLinks = [
  { href: "/campaigns", label: "Campaigns", icon: Mail },
  { href: "/global-contacts", label: "Contacts", icon: Users },
  { href: "/settings", label: "Settings", icon: Settings },
];

function Navbar() {
  const pathname = usePathname();
  
  // Local state to track if we're mounted on client (for SSR safety)
  const [isMounted, setIsMounted] = useState(false);

  // Get auth state from store - these will update reactively
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const signOut = useAuthStore((state) => state.signOut);
  const setProfile = useAuthStore((state) => state.setProfile);

  // Track client-side mounting
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch profile if authenticated but no user data (fallback)
  useEffect(() => {
    async function fetchProfileData() {
      if (isMounted && accessToken && !user) {
        try {
          const profile = await getProfile(accessToken);
          setProfile(profile);
        } catch (error) {
          console.error("[Navbar] Failed to fetch profile:", error);
        }
      }
    }
    fetchProfileData();
  }, [isMounted, accessToken, user, setProfile]);

  // Don't show navbar on auth pages or landing page (landing has its own nav)
  if (pathname.startsWith("/login") || pathname.startsWith("/signup") || pathname === "/") {
    return null;
  }

  // Use accessToken to determine authentication status
  const isAuthenticated = !!accessToken;

  return (
    <header className="w-full px-4 py-3 backdrop-blur-sm bg-background/80 border-b z-50 fixed top-0">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-8">
          <Link href="/campaigns" className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-primary flex items-center justify-center">
              <Mail className="size-4 text-primary-foreground" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold">Email Config</span>
              <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-gradient-to-r from-primary/20 to-primary/10 text-primary border border-primary/30 rounded">
                BETA
              </span>
            </div>
          </Link>

          {/* Nav Links - show if mounted and authenticated */}
          {isMounted && isAuthenticated && (
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive =
                  pathname === link.href ||
                  pathname.startsWith(link.href + "/");
                return (
                  <Button
                    key={link.href}
                    variant={isActive ? "secondary" : "ghost"}
                    size="sm"
                    asChild
                  >
                    <Link href={link.href}>
                      <link.icon className="size-4" />
                      {link.label}
                    </Link>
                  </Button>
                );
              })}
            </nav>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <ModeToggle />

          {/* Loading skeleton before mount */}
          {!isMounted && (
            <div className="size-8 rounded-full bg-muted animate-pulse" />
          )}

          {/* Authenticated user dropdown */}
          {isMounted && isAuthenticated && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <div className="size-7 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="size-4 text-primary" />
                  </div>
                  <span className="hidden md:inline">
                    {user?.firstName || user?.email?.split("@")[0] || "User"}
                  </span>
                  <ChevronDown className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">
                      {user?.firstName && user?.lastName
                        ? `${user.firstName} ${user.lastName}`
                        : user?.email?.split("@")[0] || "User"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {user?.email || ""}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/settings/profile">
                    <User className="size-4 mr-2" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <Settings className="size-4 mr-2" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut}>
                  <LogOut className="size-4 mr-2" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Unauthenticated - show login/signup */}
          {isMounted && !isAuthenticated && (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Log in</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/signup">Sign up</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;