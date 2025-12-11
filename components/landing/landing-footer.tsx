"use client";

import Link from "next/link";
import { Mail, Github, Twitter, Linkedin } from "lucide-react";

const footerLinks = {
  Product: [
    { label: "Features", href: "/#features", isExternal: false },
    { label: "Pricing", href: "/#pricing", isExternal: false },
    { label: "Integrations", href: "/#integrations", isExternal: false },
    { label: "Changelog", href: "/blog", isExternal: false },
  ],
  Company: [
    { label: "About", href: "/about", isExternal: false },
    { label: "Blog", href: "/blog", isExternal: false },
    { label: "Careers", href: "/careers", isExternal: false },
    { label: "Contact", href: "/contact", isExternal: false },
  ],
  Resources: [
    { label: "Documentation", href: "/documentation", isExternal: false },
    { label: "API Reference", href: "/api-reference", isExternal: false },
    { label: "Help Center", href: "/help-center", isExternal: false },
    { label: "Status", href: "/status", isExternal: false },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/privacy-policy", isExternal: false },
    { label: "Terms of Service", href: "/terms", isExternal: false },
    { label: "Cookie Policy", href: "/cookie-policy", isExternal: false },
    { label: "GDPR", href: "/gdpr", isExternal: false },
  ],
};

const socialLinks = [
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Github, href: "#", label: "GitHub" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
];

export function LandingFooter() {
  return (
    <footer className="bg-muted/30 border-t">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-12">
          {/* Logo & description */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="size-9 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                <Mail className="size-5 text-primary-foreground" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight">Email Config</span>
                <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-gradient-to-r from-primary/20 to-primary/10 text-primary border border-primary/30 rounded">
                  BETA
                </span>
              </div>
            </Link>
            <p className="text-sm text-muted-foreground mb-6 max-w-xs">
              Professional email marketing made simple. Build, send, and track
              campaigns that convert.
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="size-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="size-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-semibold mb-4">{title}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    {link.href.startsWith("#") ? (
                      <a
                        href={link.href}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Email Config. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground">
            Made with ❤️ for marketers everywhere
          </p>
        </div>
      </div>
    </footer>
  );
}
