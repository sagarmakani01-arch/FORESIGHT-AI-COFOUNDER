"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  FileText,
  Users,
  Settings,
  Home,
  MessageSquare,
  BarChart3,
  Target,
  Calendar,
  ArrowRight,
  Command,
  FolderOpen,
  CheckSquare,
  Map,
  Swords,
  TrendingUp,
  DollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CommandItem {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  href: string;
  category: "pages" | "documents" | "people" | "actions";
  shortcut?: string;
}

const sampleItems: CommandItem[] = [
  { id: "1", title: "Dashboard", subtitle: "Main dashboard view", icon: <Home className="w-4 h-4" />, href: "/dashboard", category: "pages", shortcut: "⌘D" },
  { id: "2", title: "AI Co-Founder", subtitle: "Chat with your AI", icon: <MessageSquare className="w-4 h-4" />, href: "/cofounder", category: "pages", shortcut: "⌘C" },
  { id: "3", title: "Files & Folders", subtitle: "Work with your co-founder", icon: <FolderOpen className="w-4 h-4" />, href: "/files", category: "pages" },
  { id: "4", title: "Projects", subtitle: "Manage projects", icon: <Target className="w-4 h-4" />, href: "/projects", category: "pages", shortcut: "⌘P" },
  { id: "5", title: "Tasks", subtitle: "Track tasks", icon: <CheckSquare className="w-4 h-4" />, href: "/tasks", category: "pages" },
  { id: "6", title: "Research", subtitle: "Market intelligence", icon: <BarChart3 className="w-4 h-4" />, href: "/research", category: "pages" },
  { id: "7", title: "Competitors", subtitle: "Competitor analysis", icon: <Swords className="w-4 h-4" />, href: "/competitors", category: "pages" },
  { id: "8", title: "Roadmaps", subtitle: "Product planning", icon: <Map className="w-4 h-4" />, href: "/roadmaps", category: "pages" },
  { id: "9", title: "Finance", subtitle: "Financial overview", icon: <DollarSign className="w-4 h-4" />, href: "/finance", category: "pages" },
  { id: "10", title: "Investors", subtitle: "Investor pipeline", icon: <TrendingUp className="w-4 h-4" />, href: "/investors", category: "pages" },
  { id: "11", title: "Calendar", subtitle: "Meetings & events", icon: <Calendar className="w-4 h-4" />, href: "/meetings", category: "pages" },
  { id: "12", title: "Settings", subtitle: "App preferences", icon: <Settings className="w-4 h-4" />, href: "/settings", category: "actions", shortcut: "⌘," },
  { id: "13", title: "Q3 2026 Growth Strategy", subtitle: "Strategy document", icon: <FileText className="w-4 h-4" />, href: "/files", category: "documents" },
  { id: "14", title: "Pitch Deck v2", subtitle: "Investor presentation", icon: <FileText className="w-4 h-4" />, href: "/files", category: "documents" },
  { id: "15", title: "Financial Model", subtitle: "Revenue projections", icon: <FileText className="w-4 h-4" />, href: "/files", category: "documents" },
  { id: "16", title: "Sagar Makani", subtitle: "Founder & CEO", icon: <Users className="w-4 h-4" />, href: "/settings", category: "people" },
  { id: "17", title: "Priya Mehta", subtitle: "CTO", icon: <Users className="w-4 h-4" />, href: "/settings", category: "people" },
];

const categories = [
  { id: "pages", label: "Pages" },
  { id: "documents", label: "Documents" },
  { id: "people", label: "People" },
  { id: "actions", label: "Actions" },
] as const;

interface SearchCommandProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchCommand({ isOpen, onClose }: SearchCommandProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredItems = sampleItems.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(query.toLowerCase())
  );

  const groupedItems = categories
    .map((cat) => ({
      ...cat,
      items: filteredItems.filter((item) => item.category === cat.id),
    }))
    .filter((group) => group.items.length > 0);

  const allItems = groupedItems.flatMap((g) => g.items);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setQuery("");
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const navigateTo = (href: string) => {
    onClose();
    router.push(href);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, allItems.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (allItems[selectedIndex]) {
        navigateTo(allItems[selectedIndex].href);
      }
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  let itemIndex = 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-xl z-50"
          >
            <div className="bg-surface thin-border rounded-2xl overflow-hidden shadow-modal">
              <div className="flex items-center gap-3 px-4 py-3 border-b border-outline-variant">
                <Search className="w-5 h-5 text-on-surface-variant" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search or jump to..."
                  className="flex-1 bg-transparent border-0 outline-none text-on-surface placeholder:text-muted-foreground"
                />
                <kbd className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded bg-surface-container text-xs text-on-surface-variant">
                  ESC
                </kbd>
              </div>

              <div className="max-h-[400px] overflow-y-auto p-2">
                {groupedItems.length === 0 ? (
                  <div className="py-8 text-center text-on-surface-variant">
                    No results found for &quot;{query}&quot;
                  </div>
                ) : (
                  groupedItems.map((group) => (
                    <div key={group.id} className="mb-2">
                      <div className="px-3 py-1.5 type-label-caps text-on-surface-variant">
                        {group.label}
                      </div>
                      {group.items.map((item) => {
                        const currentIndex = itemIndex++;
                        const isSelected = currentIndex === selectedIndex;
                        return (
                          <button
                            key={item.id}
                            onClick={() => navigateTo(item.href)}
                            onMouseEnter={() => setSelectedIndex(currentIndex)}
                            className={cn(
                              "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors",
                              isSelected
                                ? "bg-primary-container text-on-surface"
                                : "text-on-surface/80 hover:bg-surface-container-low"
                            )}
                          >
                            <div
                              className={cn(
                                "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center",
                                isSelected ? "bg-primary/15 text-primary" : "bg-surface-container text-on-surface-variant"
                              )}
                            >
                              {item.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{item.title}</p>
                              <p className="text-xs text-on-surface-variant truncate">{item.subtitle}</p>
                            </div>
                            {item.shortcut && (
                              <kbd className="hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded bg-surface-container text-[10px] text-on-surface-variant">
                                {item.shortcut}
                              </kbd>
                            )}
                            {isSelected && <ArrowRight className="w-4 h-4 text-primary" />}
                          </button>
                        );
                      })}
                    </div>
                  ))
                )}
              </div>

              <div className="flex items-center justify-between px-4 py-2 border-t border-outline-variant text-xs text-on-surface-variant">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 rounded bg-surface-container">↑↓</kbd> Navigate
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 rounded bg-surface-container">↵</kbd> Select
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Command className="w-3 h-3" />
                  <span>Powered by GENESIS</span>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
