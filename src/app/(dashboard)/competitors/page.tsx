"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, TrendingUp, TrendingDown, AlertTriangle, Lightbulb, Globe, Check, X } from "lucide-react";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend } from "recharts";
import { cn } from "@/lib/utils";
import { competitors } from "@/lib/data";
import PageHeader from "@/components/shared/page-header";

const radarData = [
  { subject: "AI Capability", paytm: 60, phonepe: 55, nexuspay: 91, fullMark: 100 },
  { subject: "UX/Design", paytm: 50, phonepe: 65, nexuspay: 82, fullMark: 100 },
  { subject: "Pricing", paytm: 70, phonepe: 75, nexuspay: 85, fullMark: 100 },
  { subject: "Support", paytm: 45, phonepe: 50, nexuspay: 78, fullMark: 100 },
  { subject: "Market Reach", paytm: 95, phonepe: 90, nexuspay: 40, fullMark: 100 },
];

const opportunities = [
  { title: "AI-First Credit Scoring", description: "Competitors use rule-based scoring. Our ML approach with alternative data can capture the underbanked segment.", impact: "high" },
  { title: "Simplified UX for Tier-2 Cities", description: "Complex interfaces exclude rural users. A vernacular-first, minimal UX can unlock massive growth.", impact: "high" },
  { title: "Embedded Finance APIs", description: "No player offers developer-friendly embedded finance. API-first approach could drive B2B2C adoption.", impact: "medium" },
  { title: "Cross-Border Payments", description: "Remittance corridor between India and Southeast Asia is underserved. Early mover advantage available.", impact: "medium" },
];

export default function CompetitorsPage() {
  const [selectedCompetitor, setSelectedCompetitor] = useState(competitors[0]);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCompetitors = competitors.filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-6">
      <PageHeader title="Competitor Intelligence" description="Track and analyze your competitive landscape" actions={[
        <button key="add" className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-white hover:bg-primary-dark transition-colors font-medium text-sm"><Plus className="w-4 h-4" />Add Competitor</button>,
      ]} />

      <div className="flex gap-6">
        <div className="flex-1 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search competitors..." className="w-full pl-12 pr-4 py-3 rounded-xl thin-border bg-surface text-on-surface placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/20" />
          </div>

          <div className="bg-surface thin-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-outline-variant">
                    <th className="text-left px-4 py-3 type-label-caps text-on-surface-variant">Competitor</th>
                    <th className="text-left px-4 py-3 type-label-caps text-on-surface-variant">Pricing</th>
                    <th className="text-left px-4 py-3 type-label-caps text-on-surface-variant">Weaknesses</th>
                    <th className="text-left px-4 py-3 type-label-caps text-on-surface-variant">Features</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCompetitors.map((competitor) => (
                    <motion.tr key={competitor.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setSelectedCompetitor(competitor)} className={cn("border-b border-outline-variant cursor-pointer transition-colors", selectedCompetitor.id === competitor.id ? "bg-primary-container/50" : "hover:bg-surface-container-low")}>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-on-surface font-bold">{competitor.name.charAt(0)}</div>
                          <div>
                            <p className="font-medium text-on-surface">{competitor.name}</p>
                            <p className="text-xs text-on-surface-variant flex items-center gap-1"><Globe className="w-3 h-3" />{competitor.industry}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-on-surface">{competitor.pricing}</td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {competitor.weaknesses.slice(0, 2).map((w) => (<span key={w} className="px-2 py-0.5 rounded-full bg-error-container text-error text-xs">{w}</span>))}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {competitor.features.slice(0, 2).map((f) => (<span key={f} className="px-2 py-0.5 rounded-full bg-primary-container text-primary text-xs">{f}</span>))}
                          {competitor.features.length > 2 && <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant text-xs">+{competitor.features.length - 2}</span>}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="w-96 flex-shrink-0 space-y-4">
          <div className="bg-surface thin-border rounded-xl p-5">
            <h3 className="type-label-caps text-on-surface mb-4">Feature Comparison</h3>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#E5E7EB" />
                <PolarAngleAxis dataKey="subject" stroke="#9CA3AF" fontSize={11} />
                <PolarRadiusAxis stroke="#E5E7EB" fontSize={10} />
                <Radar name="NexusPay" dataKey="nexuspay" stroke="#10B981" fill="#10B981" fillOpacity={0.2} />
                <Radar name="Paytm" dataKey="paytm" stroke="#9CA3AF" fill="#9CA3AF" fillOpacity={0.1} />
                <Radar name="PhonePe" dataKey="phonepe" stroke="#D1D5DB" fill="#D1D5DB" fillOpacity={0.1} />
                <Legend wrapperStyle={{ fontSize: "11px", color: "#6B7280" }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={selectedCompetitor.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-surface thin-border rounded-xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center text-on-surface font-bold text-lg">{selectedCompetitor.name.charAt(0)}</div>
                <div>
                  <h3 className="font-semibold text-on-surface">{selectedCompetitor.name}</h3>
                  <p className="text-xs text-on-surface-variant">{selectedCompetitor.pricing}</p>
                </div>
              </div>
              <div className="mb-4">
                <h4 className="type-label-caps text-primary mb-2 flex items-center gap-1.5"><TrendingUp className="w-3 h-3" />Strengths</h4>
                <div className="space-y-1">
                  {selectedCompetitor.strengths.map((s) => (<div key={s} className="flex items-center gap-2 text-sm text-on-surface/80"><Check className="w-3 h-3 text-primary" />{s}</div>))}
                </div>
              </div>
              <div>
                <h4 className="type-label-caps text-error mb-2 flex items-center gap-1.5"><AlertTriangle className="w-3 h-3" />Weaknesses</h4>
                <div className="space-y-1">
                  {selectedCompetitor.weaknesses.map((w) => (<div key={w} className="flex items-center gap-2 text-sm text-on-surface/80"><X className="w-3 h-3 text-error" />{w}</div>))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-on-surface mb-4 flex items-center gap-2"><Lightbulb className="w-5 h-5 text-primary" />Market Opportunities</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {opportunities.map((opp, index) => (
            <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} className="bg-surface thin-border rounded-xl p-5 transition-all duration-200 hover:shadow-card">
              <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", opp.impact === "high" ? "bg-primary-container text-primary" : "bg-surface-container text-on-surface-variant")}>{opp.impact} impact</span>
              <h4 className="font-medium text-on-surface mt-3 mb-2">{opp.title}</h4>
              <p className="text-sm text-on-surface-variant">{opp.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
