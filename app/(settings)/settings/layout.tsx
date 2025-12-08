"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings, Globe, Bell, User, CreditCard, Key, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  description?: string;
}

// Settings navigation items - easy to extend
const settingsNav: NavItem[] = [
  {
    title: "Profile",
    href: "/settings/profile",
    icon: User,
    description: "Your account settings",
  },
  {
    title: "Sending Domains",
    href: "/settings/domains",
    icon: Globe,
    description: "Verify domains to send emails",
  },
  {
    title: "API Keys",
    href: "/settings/api-keys",
    icon: Key,
    description: "Manage API access",
  },
  {
    title: "Billing",
    href: "/settings/billing",
    icon: CreditCard,
    description: "Subscription and invoices",
  },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-full bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <Settings className="size-6" />
            Settings
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your account and application settings
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full md:w-64 shrink-0">
            <nav className="space-y-1">
              {settingsNav.map((item) => {
                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    <item.icon className="size-5" />
                    <div>
                      <p className="font-medium">{item.title}</p>
                      {item.description && (
                        <p
                          className={cn(
                            "text-xs",
                            isActive
                              ? "text-primary-foreground/70"
                              : "text-muted-foreground"
                          )}
                        >
                          {item.description}
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </nav>

            {/* Help Card */}
            <div className="mt-8 p-4 bg-muted/50 rounded-xl border">
              <p className="text-sm font-medium mb-1">Need help?</p>
              <p className="text-xs text-muted-foreground mb-3">
                Check our documentation or contact support.
              </p>
              <Link
                href="#"
                className="text-xs text-primary hover:underline"
              >
                View Documentation →
              </Link>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
