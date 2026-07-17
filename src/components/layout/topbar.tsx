"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Bell,
  ChevronDown,
  Command,
  CheckCheck,
  Info,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Sun,
  Moon,
  Menu,
} from "lucide-react";
import SearchCommand from "@/components/shared/search-command";
import { useTheme } from "@/components/providers";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  link: string | null;
  createdAt: string;
}

const TYPE_CONFIG: Record<
  string,
  { icon: React.ComponentType<{ className?: string }>; color: string; bg: string }
> = {
  INFO: { icon: Info, color: "text-blue-500", bg: "bg-blue-50" },
  SUCCESS: { icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50" },
  WARNING: { icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-50" },
  ERROR: { icon: XCircle, color: "text-red-500", bg: "bg-red-50" },
};

function timeAgo(dateStr: string): string {
  const seconds = Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / 1000
  );
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export function Topbar({ onMenuToggle }: { onMenuToggle?: () => void }) {
  const router = useRouter();
  const { data: session } = useSession();
  const { theme, toggleTheme } = useTheme();
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    async function fetchNotifications() {
      try {
        const res = await fetch("/api/notifications");
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setNotifications(json.data.slice(0, 20));
        }
      } catch {
        // silent
      }
    }
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30_000);
    return () => clearInterval(interval);
  }, []);

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

    const handleOpenSearch = () => setSearchOpen(true);
    const handleCloseModals = () => {
      setSearchOpen(false);
      setNotificationsOpen(false);
      setUserMenuOpen(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("open-search", handleOpenSearch);
    window.addEventListener("close-modals", handleCloseModals);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("open-search", handleOpenSearch);
      window.removeEventListener("close-modals", handleCloseModals);
    };
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, { method: "PATCH" });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch {
      // silent
    }
  };

  const handleNotificationClick = async (n: Notification) => {
    if (!n.read) {
      await markAsRead(n.id);
    }
    setNotificationsOpen(false);
    if (n.link) {
      router.push(n.link);
    }
  };

  const markAllAsRead = async () => {
    const unread = notifications.filter((n) => !n.read);
    await Promise.all(
      unread.map((n) => fetch(`/api/notifications/${n.id}`, { method: "PATCH" }))
    );
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-outline-variant bg-surface px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuToggle}
            className="rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface md:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold text-on-surface">Dashboard</h1>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 rounded-lg thin-border bg-surface px-4 py-2 text-sm text-on-surface-variant transition-all duration-200 hover:text-on-surface max-sm:px-3"
          >
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">Search anything...</span>
            <div className="ml-4 hidden items-center gap-1 rounded-md thin-border px-1.5 py-0.5 text-xs sm:flex">
              <Command className="h-3 w-3" />K
            </div>
          </button>

          <div className="relative">
            <button
              onClick={() => {
                setNotificationsOpen(!notificationsOpen);
                setUserMenuOpen(false);
              }}
              className="relative rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>

            <AnimatePresence>
              {notificationsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 top-12 w-96 rounded-xl bg-surface thin-border shadow-modal p-4"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-on-surface">
                      Notifications
                    </h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        <CheckCheck className="h-3 w-3" />
                        Mark all read
                      </button>
                    )}
                  </div>

                  {notifications.length === 0 ? (
                    <p className="text-sm text-on-surface-variant text-center py-6">
                      No notifications yet
                    </p>
                  ) : (
                    <div className="max-h-80 space-y-1 overflow-y-auto">
                      {notifications.map((n) => {
                        const config = TYPE_CONFIG[n.type] || TYPE_CONFIG.INFO;
                        const Icon = config.icon;
                        return (
                          <button
                            key={n.id}
                            onClick={() => handleNotificationClick(n)}
                            className={`w-full rounded-lg p-3 text-left transition-colors hover:bg-surface-container-low ${
                              !n.read ? "bg-surface-container-low" : ""
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${config.bg}`}
                              >
                                <Icon className={`h-3.5 w-3.5 ${config.color}`} />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <p
                                    className={`text-sm truncate ${
                                      !n.read
                                        ? "font-semibold text-on-surface"
                                        : "font-medium text-on-surface"
                                    }`}
                                  >
                                    {n.title}
                                  </p>
                                  {!n.read && (
                                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                                  )}
                                </div>
                                <p className="text-xs text-on-surface-variant line-clamp-2 mt-0.5">
                                  {n.message}
                                </p>
                                <p className="text-[11px] text-on-surface-variant mt-1 opacity-70">
                                  {timeAgo(n.createdAt)}
                                </p>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={toggleTheme}
            className="rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </button>

          <div className="relative">
            <button
              onClick={() => {
                setUserMenuOpen(!userMenuOpen);
                setNotificationsOpen(false);
              }}
              className="flex items-center gap-2 rounded-lg p-1.5 transition-colors hover:bg-surface-container"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                <span className="text-xs font-bold text-white">
                  {(session?.user?.name || "U")
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)}
                </span>
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
                    <p className="text-sm font-medium text-on-surface">
                      {session?.user?.name || "User"}
                    </p>
                    <p className="text-xs text-on-surface-variant">
                      {session?.user?.email || ""}
                    </p>
                  </div>
                  <div className="mt-1 space-y-0.5">
                    {[
                      { label: "Profile", action: () => router.push("/settings") },
                      {
                        label: "Settings",
                        action: () => router.push("/settings"),
                      },
                      {
                        label: "Billing",
                        action: () => router.push("/settings"),
                      },
                      {
                        label: "Sign out",
                        action: () => signOut({ callbackUrl: "/login" }),
                      },
                    ].map((item) => (
                      <button
                        key={item.label}
                        onClick={() => {
                          setUserMenuOpen(false);
                          item.action();
                        }}
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
