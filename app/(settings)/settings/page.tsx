"use client";

import { redirect } from "next/navigation";

// Redirect /settings to /settings/domains
export default function SettingsPage() {
  redirect("/settings/domains");
}
