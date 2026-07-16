"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  FileText,
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
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchResult {
  id: string;
  type: string;
  title: string;
  preview: string;
  url: string;
}

const pageItems = [
  { id: "page-dashboard", title: "Dashboard", subtitle: "Main dashboard view", icon: <Home className="w-4 h-4" />, href: "/dashboard", shortcut: "⌘D" },
  { id: "page-cofounder", title: "AI Co-Founder", subtitle: "Chat with your AI", icon: <MessageSquare className="w-4 h-4" />, href: "/cofounder", shortcut: "⌘C" },
  { id: "page-files", title: "Files & Folders", subtitle: "Work with your co-founder", icon: <FolderOpen className="w-4 h-4" />, href: "/files" },
  { id: "page-projects", title: "Projects", subtitle: "Manage projects", icon: <Target className="w-4 h-4" />, href: "/projects", shortcut: "⌘P" },
  { id: "page-tasks", title: "Tasks", subtitle: "Track tasks", icon: <CheckSquare className="w-4 h-4" />, href: "/tasks" },
  { id: "page-research", title: "Research", subtitle: "Market intelligence", icon: <BarChart3 className="w-4 h-4" />, href: "/research" },
  { id: "page-competitors", title: "Competitors", subtitle: "Competitor analysis", icon: <Swords className="w-4 h-4" />, href: "/competitors" },
  { id: "page-roadmaps", title: "Roadmaps", subtitle: "Product planning", icon: <Map className="w-4 h-4" />, href: "/roadmaps" },
  { id: "page-finance", title: "Finance", subtitle: "Financial overview", icon: <DollarSign className="w-4 h-4" />, href: "/finance" },
  { id: "page-investors", title: "Investors", subtitle: "Investor pipeline", icon: <TrendingUp className="w-4 h-4" />, href: "/investors" },
  { id: "page-calendar", title: "Calendar", subtitle: "Meetings & events", icon: <Calendar className="w-4 h-4" />, href: "/meetings" },
  { id: "page-settings", title: "Settings", subtitle: "App preferences", icon: <Settings className="w-4 h-4" />, href: "/settings", shortcut: "⌘," },
];

const typeIconMap: Record<string, React.ReactNode> = {
  Project: <Target className="w-4 h-4" />,
  Task: <CheckSquare className="w-4 h-4" />,
  Document: <FileText className="w-4 h-4" />,
  Knowledge: <MessageSquare className="w-4 h-4" />,
  File: <FolderOpen className="w-4 h-4" />,
  Competitor: <Swords className="w-4 h-4" />,
  Investor: <TrendingUp className="w-4 h-4" />,
};

const typeGroupLabels: Record<string, string> = {
  Project: "Projects",
  Task: "Tasks",
  Document: "Documents",
  Knowledge: "Knowledge",
  File: "Files",
  Competitor: "Competitors",
  Investor: "Investors",
};

interface SearchCommandProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchCommand({ isOpen, onClose }: SearchCommandProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [apiResults, setApiResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const filteredPages = pageItems.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(query.toLowerCase())
  );

  const groupedResults = apiResults.reduce<Record<string, SearchResult[]>>((acc, r) => {
    if (!acc[r.type]) acc[r.type] = [];
    acc[r.type].push(r);
    return acc;
  }, {});

  const allVisibleItems = [
    ...filteredPages.map((p) => ({ ...p, category: "Pages" as const })),
    ...Object.entries(groupedResults).flatMap(([type, items]) =>
      items.map((r) => ({
        id: `api-${r.id}`,
        title: r.title,
        subtitle: r.preview,
        icon: typeIconMap[r.type] || <FileText className="w-4 h-4" />,
        href: r.url,
        category: (typeGroupLabels[r.type] || type) as string,
      }))
    ),
  ];

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setQuery("");
      setApiResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query.trim()) {
      setApiResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
        const data = await res.json();
        setApiResults(data.results || []);
      } catch {
        setApiResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  useEffect(() => {
    const handleCloseModals = () => {
      if (isOpen) onClose();
    };
    window.addEventListener("close-modals", handleCloseModals);
    return () => window.removeEventListener("close-modals", handleCloseModals);
  }, [isOpen, onClose]);

  const navigateTo = (href: string) => {
    onClose();
    router.push(href);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, allVisibleItems.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (allVisibleItems[selectedIndex]) {
        navigateTo(allVisibleItems[selectedIndex].href);
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
                {isLoading && <Loader2 className="w-4 h-4 text-on-surface-variant animate-spin" />}
                <kbd className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded bg-surface-container text-xs text-on-surface-variant">
                  ESC
                </kbd>
              </div>

              <div className="max-h-[400px] overflow-y-auto p-2">
                {allVisibleItems.length === 0 && !isLoading ? (
                  <div className="py-8 text-center text-on-surface-variant">
                    {query ? `No results found for "${query}"` : "Type to search..."}
                  </div>
                ) : (
                  <>
                    {filteredPages.length > 0 && (
                      <div className="mb-2">
                        <div className="px-3 py-1.5 type-label-caps text-on-surface-variant">
                          Pages
                        </div>
                        {filteredPages.map((item) => {
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
                    )}

                    {Object.entries(groupedResults).map(([type, items]) => (
                      <div key={type} className="mb-2">
                        <div className="px-3 py-1.5 type-label-caps text-on-surface-variant">
                          {typeGroupLabels[type] || type}
                        </div>
                        {items.map((result) => {
                          const currentIndex = itemIndex++;
                          const isSelected = currentIndex === selectedIndex;
                          return (
                            <button
                              key={result.id}
                              onClick={() => navigateTo(result.url)}
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
                                {typeIconMap[result.type] || <FileText className="w-4 h-4" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{result.title}</p>
                                <p className="text-xs text-on-surface-variant truncate">{result.preview}</p>
                              </div>
                              {isSelected && <ArrowRight className="w-4 h-4 text-primary" />}
                            </button>
                          );
                        })}
                      </div>
                    ))}
                  </>
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
