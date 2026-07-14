"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, TrendingUp, BarChart3, Users, Lightbulb, ArrowUpRight, Clock, Tag } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { cn } from "@/lib/utils";
import PageHeader from "@/components/shared/page-header";

interface ResearchReport {
  id: string;
  title: string;
  category: "industry" | "market-size" | "trends" | "consumer";
  date: string;
  summary: string;
  insights: string[];
}

const categories = [
  { id: "all", label: "All Reports", icon: BarChart3 },
  { id: "industry", label: "Industry", icon: TrendingUp },
  { id: "market-size", label: "Market Size", icon: BarChart3 },
  { id: "trends", label: "Trends", icon: TrendingUp },
  { id: "consumer", label: "Consumer", icon: Users },
] as const;

const sampleReports: ResearchReport[] = [
  { id: "1", title: "Fintech Lending Market 2026", category: "market-size", date: "2026-07-10", summary: "Comprehensive analysis of the AI-driven micro-lending market in South and Southeast Asia, projected to reach $45B by 2028.", insights: ["Market projected to reach $45B by 2028", "AI-native lenders outperforming traditional by 2.5x", "Mobile-first solutions growing fastest in India", "Alternative credit scoring reducing default rates by 35%"] },
  { id: "2", title: "Digital Payments Trends", category: "trends", date: "2026-07-08", summary: "Key trends in digital payments including UPI growth, BNPL expansion, and cross-border payment innovation.", insights: ["UPI processing 15B transactions/month in India", "BNPL adoption up 340% YoY in emerging markets", "Cross-border payments growing at 25% annually", "Super-app model dominating Southeast Asia"] },
  { id: "3", title: "Underbanked Consumer Behavior", category: "consumer", date: "2026-07-05", summary: "Study of financial behavior among underbanked populations in India, Indonesia, and Philippines.", insights: ["68% of target demographic owns a smartphone", "Mobile money adoption growing 45% annually", "Trust in fintech brands increasing steadily", "Word-of-mouth drives 60% of adoption in tier-2 cities"] },
  { id: "4", title: "Competitive Landscape - Micro-Lending", category: "industry", date: "2026-07-01", summary: "Detailed analysis of the competitive landscape in AI-powered micro-lending across target markets.", insights: ["Market fragmented with 50+ regional players", "No single leader in AI-native micro-lending space", "Consolidation expected in 2027", "Differentiation through data partnerships key"] },
  { id: "5", title: "VC Funding in Fintech - H1 2026", category: "industry", date: "2026-06-28", summary: "VC funding in fintech continues to grow, with a shift towards embedded finance and credit infrastructure.", insights: ["Total fintech funding: $18B in H1 2026", "Embedded finance representing 35% of deals", "Average Series A: $8.5M in South Asia", "AI-first companies commanding 40% premium valuations"] },
];

const marketData = [
  { name: "2022", value: 12, color: "#10B981" },
  { name: "2023", value: 18, color: "#10B981" },
  { name: "2024", value: 25, color: "#10B981" },
  { name: "2025", value: 32, color: "#10B981" },
  { name: "2026", value: 40, color: "#10B981" },
  { name: "2027", value: 52, color: "#059669" },
];

export default function ResearchPage() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [selectedReport, setSelectedReport] = useState<ResearchReport>(sampleReports[0]);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredReports = sampleReports.filter((report) => {
    const matchesCategory = activeCategory === "all" || report.category === activeCategory;
    const matchesSearch = report.title.toLowerCase().includes(searchQuery.toLowerCase()) || report.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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

          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {filteredReports.map((report) => (
                <motion.button key={report.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} onClick={() => setSelectedReport(report)} className={cn("w-full text-left p-4 rounded-xl transition-all duration-200", selectedReport.id === report.id ? "bg-surface thin-border border-l-2 border-primary" : "hover:bg-surface-container-low border-l-2 border-transparent")}>
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-on-surface text-sm line-clamp-1">{report.title}</h4>
                    <ArrowUpRight className="w-4 h-4 text-on-surface-variant flex-shrink-0" />
                  </div>
                  <p className="text-xs text-on-surface-variant line-clamp-2 mb-2">{report.summary}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(report.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                    <span className="flex items-center gap-1"><Tag className="w-3 h-3" />{report.category}</span>
                  </div>
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex-1 bg-surface thin-border rounded-xl p-6 overflow-y-auto max-h-[calc(100vh-14rem)]">
          <AnimatePresence mode="wait">
            <motion.div key={selectedReport.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-1 rounded-full bg-primary-container text-primary text-xs font-medium">{selectedReport.category}</span>
                  <span className="text-xs text-on-surface-variant">{new Date(selectedReport.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
                </div>
                <h2 className="text-2xl font-bold text-on-surface mb-3">{selectedReport.title}</h2>
                <p className="text-on-surface-variant leading-relaxed">{selectedReport.summary}</p>
              </div>

              <div className="mb-8">
                <h3 className="text-lg font-semibold text-on-surface mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />Micro-Lending Market Size ($B)
                </h3>
                <div className="bg-surface-container-low rounded-xl p-4">
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={marketData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} />
                      <YAxis stroke="#9CA3AF" fontSize={12} />
                      <Tooltip contentStyle={{ backgroundColor: "#FFFFFF", border: "0.5px solid rgba(0,0,0,0.08)", borderRadius: "12px", color: "#1A1A1A" }} />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                        {marketData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-on-surface mb-4 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-primary" />Key Insights
                </h3>
                <div className="bg-surface-container-low rounded-xl p-4 space-y-3">
                  {selectedReport.insights.map((insight, index) => (
                    <motion.div key={index} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-container flex items-center justify-center mt-0.5">
                        <span className="text-xs font-bold text-primary">{index + 1}</span>
                      </div>
                      <p className="text-on-surface/90 leading-relaxed">{insight}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
