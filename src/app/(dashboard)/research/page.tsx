"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, TrendingUp, BarChart3, Users, Lightbulb, ArrowUpRight, Clock, Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import PageHeader from "@/components/shared/page-header";
import { useCompanyData, formatDate } from "@/lib/hooks";

const categories = [
  { id: "all", label: "All Reports", icon: BarChart3 },
  { id: "industry", label: "Industry", icon: TrendingUp },
  { id: "market-size", label: "Market Size", icon: BarChart3 },
  { id: "trends", label: "Trends", icon: TrendingUp },
  { id: "consumer", label: "Consumer", icon: Users },
] as const;

export default function ResearchPage() {
  const { data, loading } = useCompanyData();
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const reports = data?.researchReports ?? [];

  const filteredReports = reports.filter((report) => {
    const matchesCategory = activeCategory === "all" || report.category === activeCategory;
    const matchesSearch = report.title.toLowerCase().includes(searchQuery.toLowerCase()) || report.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const selectedReport = reports.find((r) => r.id === selectedReportId) ?? filteredReports[0] ?? null;

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Market Research" description="AI-powered insights and market intelligence" />
        <div className="flex gap-6">
          <div className="w-80 flex-shrink-0 space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-surface thin-border rounded-xl animate-pulse" />
            ))}
          </div>
          <div className="flex-1 bg-surface thin-border rounded-xl p-6 animate-pulse min-h-[400px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Market Research" description="AI-powered insights and market intelligence" />

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
        <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search research reports..." className="w-full pl-12 pr-4 py-3 rounded-xl thin-border bg-surface text-on-surface placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200" />
      </div>

      <div className="flex gap-6">
        <div className="w-80 flex-shrink-0 space-y-4">
          <div className="bg-surface thin-border rounded-xl p-3">
            <div className="space-y-1">
              {categories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <button key={cat.id} onClick={() => setActiveCategory(cat.id)} className={cn("w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200", activeCategory === cat.id ? "bg-primary-container text-primary" : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low")}>
                    <Icon className="w-4 h-4" />{cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          {filteredReports.length === 0 ? (
            <div className="text-center py-8 text-on-surface-variant text-sm">
              No reports found
            </div>
          ) : (
            <div className="space-y-2">
              <AnimatePresence mode="popLayout">
                {filteredReports.map((report) => (
                  <motion.button key={report.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} onClick={() => setSelectedReportId(report.id)} className={cn("w-full text-left p-4 rounded-xl transition-all duration-200", selectedReport?.id === report.id ? "bg-surface thin-border border-l-2 border-primary" : "hover:bg-surface-container-low border-l-2 border-transparent")}>
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-on-surface text-sm line-clamp-1">{report.title}</h4>
                      <ArrowUpRight className="w-4 h-4 text-on-surface-variant flex-shrink-0" />
                    </div>
                    <p className="text-xs text-on-surface-variant line-clamp-2 mb-2">{report.content}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatDate(report.createdAt)}</span>
                      <span className="flex items-center gap-1"><Tag className="w-3 h-3" />{report.category}</span>
                    </div>
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        <div className="flex-1 bg-surface thin-border rounded-xl p-6 overflow-y-auto max-h-[calc(100vh-14rem)]">
          {selectedReport ? (
            <AnimatePresence mode="wait">
              <motion.div key={selectedReport.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2.5 py-1 rounded-full bg-primary-container text-primary text-xs font-medium">{selectedReport.category}</span>
                    <span className="text-xs text-on-surface-variant">{formatDate(selectedReport.createdAt)}</span>
                  </div>
                  <h2 className="text-2xl font-bold text-on-surface mb-3">{selectedReport.title}</h2>
                  <p className="text-on-surface-variant leading-relaxed whitespace-pre-wrap">{selectedReport.content}</p>
                </div>
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary-container flex items-center justify-center mb-4">
                <Lightbulb className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-on-surface mb-2">No research reports yet</h3>
              <p className="text-on-surface-variant max-w-md">
                Start a research query from the AI Co-Founder to generate your first market research report.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
