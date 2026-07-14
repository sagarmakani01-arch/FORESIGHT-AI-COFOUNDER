"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Bell, ChevronDown, Command } from "lucide-react";
import SearchCommand from "@/components/shared/search-command";

export function Topbar() {
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
        setNotificationsOpen(false);
        setUserMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const [notifications, setNotifications] = useState([
    { id: 1, text: "AI Co-Founder completed your pitch deck analysis", time: "2m ago" },
    { id: 2, text: "New market research report ready", time: "15m ago" },
    { id: 3, text: "Financial model updated with Q3 projections", time: "1h ago" },
  ]);

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-outline-variant bg-surface px-6">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold text-on-surface">Dashboard</h1>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 rounded-lg thin-border bg-surface px-4 py-2 text-sm text-on-surface-variant transition-all duration-200 hover:text-on-surface"
          >
            <Search className="h-4 w-4" />
            <span>Search anything...</span>
            <div className="ml-4 flex items-center gap-1 rounded-md thin-border px-1.5 py-0.5 text-xs">
              <Command className="h-3 w-3" />K
            </div>
          </button>

          <div className="relative">
            <button
              onClick={() => { setNotificationsOpen(!notificationsOpen); setUserMenuOpen(false); }}
              className="relative rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                3
              </span>
            </button>

            <AnimatePresence>
              {notificationsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 top-12 w-80 rounded-xl bg-surface thin-border shadow-modal p-4"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-on-surface">Notifications</h3>
                    <button
                      onClick={() => { setNotificationsOpen(false); setNotifications([]); }}
                      className="text-xs text-primary hover:underline"
                    >
                      Mark all read
                    </button>
                  </div>
                  <div className="space-y-2">
                    {notifications.map((n) => (
                      <div key={n.id} className="rounded-lg thin-border p-3 transition-colors hover:bg-surface-container-low">
                        <p className="text-sm text-on-surface">{n.text}</p>
                        <p className="mt-1 text-xs text-on-surface-variant">{n.time}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="relative">
            <button
              onClick={() => { setUserMenuOpen(!userMenuOpen); setNotificationsOpen(false); }}
              className="flex items-center gap-2 rounded-lg p-1.5 transition-colors hover:bg-surface-container"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                <span className="text-xs font-bold text-white">SM</span>
              </div>
              <ChevronDown className="h-4 w-4 text-on-surface-variant" />
            </button>

            <AnimatePresence>
              {userMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 top-12 w-56 rounded-xl bg-surface thin-border shadow-modal p-2"
                >
                  <div className="border-b border-outline-variant px-3 py-2">
                    <p className="text-sm font-medium text-on-surface">Sagar Makani</p>
                    <p className="text-xs text-on-surface-variant">sagar@nexuspay.io</p>
                  </div>
                  <div className="mt-1 space-y-0.5">
                    {[
                      { label: "Profile", action: () => router.push("/settings") },
                      { label: "Settings", action: () => router.push("/settings") },
                      { label: "Billing", action: () => router.push("/settings") },
                      { label: "Sign out", action: () => signOut({ callbackUrl: "/login" }) },
                    ].map((item) => (
                      <button
                        key={item.label}
                        onClick={() => { setUserMenuOpen(false); item.action(); }}
                        className="w-full rounded-lg px-3 py-2 text-left text-sm text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-on-surface"
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      <SearchCommand isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
