"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { useState } from "react";
import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  MobileNavHeader,
  MobileNavMenu,
  MobileNavToggle,
} from "@/components/ui/resizable-navbar";

const navLinks = [
  { name: "Features", link: "#features" },
  { name: "How it Works", link: "#how-it-works" },
  { name: "Pricing", link: "#pricing" },
];

export function LandingNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      className="fixed top-0 left-0 right-0 z-50 px-4 py-4"
    >
      <Navbar className="sticky top-0">
        {/* Desktop Nav */}
        <NavBody className="max-w-6xl mx-auto flex items-center justify-between bg-background/80 backdrop-blur-xl border rounded-2xl px-6 py-3 shadow-lg shadow-black/5 !w-full !min-w-0">
          {/* Logo */}
          <Link href="/" className="relative z-20 flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-md">
              <Mail className="size-5 text-primary-foreground" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight">Email Config</span>
              <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-gradient-to-r from-primary/20 to-primary/10 text-primary border border-primary/30 rounded">
                BETA
              </span>
            </div>
          </Link>

          {/* Nav Items */}
          <NavItems items={navLinks} className="!flex !items-center !justify-center" />

          {/* Right side */}
          <div className="relative z-20 flex items-center gap-3">
            <ModeToggle />
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Log in</Link>
              </Button>
              <Button size="sm" asChild className="rounded-full px-5">
                <Link href="/signup">Start Free Trial</Link>
              </Button>
            </div>
          </div>
        </NavBody>

        {/* Mobile Nav */}
        <MobileNav className="max-w-6xl mx-auto bg-background/80 backdrop-blur-xl border rounded-2xl px-6 py-3 shadow-lg shadow-black/5 !w-full">
          <MobileNavHeader>
            {/* Logo */}
            <Link href="/" className="relative z-20 flex items-center gap-2.5">
              <div className="size-9 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-md">
                <Mail className="size-5 text-primary-foreground" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight">Email Config</span>
                <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-gradient-to-r from-primary/20 to-primary/10 text-primary border border-primary/30 rounded">
                  BETA
                </span>
              </div>
            </Link>

            {/* Right side */}
            <div className="relative z-20 flex items-center gap-3">
              <ModeToggle />
              <MobileNavToggle
                isOpen={mobileMenuOpen}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              />
            </div>
          </MobileNavHeader>

          {/* Mobile Menu */}
          <MobileNavMenu
            isOpen={mobileMenuOpen}
            onClose={() => setMobileMenuOpen(false)}
            className="bg-background/95 backdrop-blur-xl border rounded-2xl shadow-lg"
          >
            <div className="flex flex-col gap-2 w-full">
              {navLinks.map((link) => (
                <Button
                  key={link.link}
                  variant="ghost"
                  size="sm"
                  asChild
                  className="justify-start"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <a href={link.link}>{link.name}</a>
                </Button>
              ))}
              <div className="h-px bg-border my-2" />
              <Button variant="ghost" size="sm" asChild className="justify-start">
                <Link href="/login">Log in</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/signup">Start Free Trial</Link>
              </Button>
            </div>
          </MobileNavMenu>
        </MobileNav>
      </Navbar>
    </motion.header>
  );
}
