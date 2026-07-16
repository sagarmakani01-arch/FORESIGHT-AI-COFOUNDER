"use client";

import { AppShell } from "@/components/layout/app-shell";
import { useKeyboardShortcuts } from "@/lib/use-keyboard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useKeyboardShortcuts();
  return <AppShell>{children}</AppShell>;
}
