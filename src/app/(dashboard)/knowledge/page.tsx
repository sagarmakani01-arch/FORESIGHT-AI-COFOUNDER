"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, BookOpen, Lightbulb, Tag, TrendingUp, Plus, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import PageHeader from "@/components/shared/page-header";

const categories = [
  { id: "all", label: "All", icon: BookOpen, count: 24 },
  { id: "strategy", label: "Strategy", icon: TrendingUp, count: 6 },
  { id: "market", label: "Market Intel", icon: Tag, count: 8 },
  { id: "product", label: "Product", icon: BookOpen, count: 5 },
  { id: "operations", label: "Operations", icon: Tag, count: 5 },
];

const knowledgeEntries = [
  { id: "1", title: "Fintech Regulatory Landscape in India", category: "market", summary: "Overview of RBI regulations, PA/PG licensing, and compliance requirements for digital lending.", tags: ["regulatory", "india", "rbi"] },
  { id: "2", title: "Alternative Credit Scoring Methods", category: "product", summary: "Analysis of ML-based credit scoring using telecom data, mobile money, and utility payments.", tags: ["ai", "credit", "ml"] },
  { id: "3", title: "Emerging Markets Payment Behavior", category: "market", summary: "Consumer payment preferences across South and Southeast Asia, including mobile money adoption.", tags: ["payments", "behavior", "asia"] },
  { id: "4", title: "Competitive Moats in Fintech", category: "strategy", summary: "Key defensibility strategies: data network effects, regulatory licenses, and distribution partnerships.", tags: ["strategy", "moats", "fintech"] },
  { id: "5", title: "Unit Economics for Micro-Lending", category: "strategy", summary: "Key metrics: CAC, LTV, default rates, and payback period for emerging market lending.", tags: ["finance", "unit-economics", "lending"] },
  { id: "6", title: "API-First Architecture Best Practices", category: "product", summary: "Technical patterns for building scalable, developer-friendly financial APIs.", tags: ["api", "architecture", "devex"] },
];

const aiSuggestions = [
  "You haven't updated competitive analysis in 2 weeks — consider refreshing Paytm and PhonePe data.",
  "New regulatory changes in Indonesia could affect expansion plans — review the latest RBI guidelines.",
  "Your credit scoring model accuracy could improve with utility payment data — explore partnerships.",
];

export default function KnowledgePage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEntry, setSelectedEntry] = useState(knowledgeEntries[0]);

  const filtered = knowledgeEntries.filter((e) => {
    const matchCat = selectedCategory === "all" || e.category === selectedCategory;
    const matchSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase()) || e.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Knowledge Base" description="Centralized intelligence and insights" actions={[
        <button key="new" className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-white hover:bg-primary-dark transition-colors font-medium text-sm"><Plus className="w-4 h-4" />Add Entry</button>,
      ]} />

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
        <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search knowledge base..." className="w-full pl-12 pr-4 py-3 rounded-xl thin-border bg-surface text-on-surface placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/20" />
      </div>

      <div className="flex gap-2 flex-wrap">
        {categories.map((cat) => (
          <button key={cat.id} onClick={() => setSelectedCategory(cat.id)} className={cn("flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all", selectedCategory === cat.id ? "bg-primary text-white" : "thin-border bg-surface text-on-surface-variant hover:text-on-surface")}>
            <cat.icon className="w-3.5 h-3.5" />{cat.label}<span className="text-xs opacity-60">{cat.count}</span>
          </button>
        ))}
      </div>

      <div className="flex gap-6">
        <div className="flex-1 space-y-3">
          {filtered.map((entry) => (
            <motion.div key={entry.id} whileHover={{ x: 2 }} onClick={() => setSelectedEntry(entry)} className={cn("bg-surface thin-border rounded-xl p-4 cursor-pointer transition-all hover:shadow-card", selectedEntry.id === entry.id && "ring-2 ring-primary/20")}>
              <h4 className="font-medium text-on-surface mb-1">{entry.title}</h4>
              <p className="text-sm text-on-surface-variant line-clamp-2 mb-2">{entry.summary}</p>
              <div className="flex gap-1 flex-wrap">
                {entry.tags.map((tag) => (
                  <span key={tag} className="px-2 py-0.5 rounded-full bg-surface-container text-[10px] text-on-surface-variant">{tag}</span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* AI Suggestions */}
        <div className="w-72 flex-shrink-0">
          <div className="bg-surface thin-border rounded-xl p-5">
            <h3 className="type-label-caps text-on-surface mb-3 flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary" />AI Suggestions</h3>
            <div className="space-y-3">
              {aiSuggestions.map((s, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="p-3 rounded-lg bg-surface-container-low">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                    <p className="text-sm text-on-surface">{s}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
