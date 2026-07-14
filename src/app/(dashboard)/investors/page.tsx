"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, TrendingUp, Mail, Phone, Calendar, FileText, CheckCircle2, Circle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { investors } from "@/lib/data";
import PageHeader from "@/components/shared/page-header";
import type { InvestorStatus } from "@/types";

const pipelineStages: { id: InvestorStatus; label: string; color: string }[] = [
  { id: "prospecting", label: "Prospecting", color: "bg-surface-container text-on-surface-variant" },
  { id: "contacted", label: "Contacted", color: "bg-surface-container text-on-surface-variant" },
  { id: "meeting-scheduled", label: "Meeting", color: "bg-primary-container text-primary" },
  { id: "due-diligence", label: "Due Diligence", color: "bg-primary-container text-primary" },
  { id: "term-sheet", label: "Term Sheet", color: "bg-primary text-white" },
  { id: "closed", label: "Closed", color: "bg-primary text-white" },
];

const pitchSlides = [
  "Problem & Market Opportunity",
  "Solution & Product Demo",
  "Business Model & Unit Economics",
  "Traction & Key Metrics",
  "Go-to-Market Strategy",
  "Competitive Landscape",
  "Team & Hiring Plan",
  "Financial Projections",
  "The Ask & Use of Funds",
];

const diligenceChecklist = [
  { item: "Cap table", done: true },
  { item: "Financial statements (audited)", done: false },
  { item: "Customer testimonials (3+)", done: true },
  { item: "Technical architecture doc", done: true },
  { item: "IP assignment agreements", done: false },
  { item: "Regulatory licenses", done: true },
  { item: "Board meeting minutes", done: false },
  { item: "Employee stock option plan", done: true },
];

export default function InvestorsPage() {
  const [selectedInvestor, setSelectedInvestor] = useState(investors[0]);

  return (
    <div className="space-y-6">
      <PageHeader title="Investors" description="Manage your fundraising pipeline" actions={[
        <button key="add" className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-white hover:bg-primary-dark transition-colors font-medium text-sm"><Plus className="w-4 h-4" />Add Investor</button>,
      ]} />

      {/* Pipeline */}
      <div className="bg-surface thin-border rounded-xl p-6">
        <h3 className="type-label-caps text-on-surface mb-4">Pipeline</h3>
        <div className="grid grid-cols-6 gap-3">
          {pipelineStages.map((stage) => {
            const count = investors.filter((i) => i.status === stage.id).length;
            return (
              <div key={stage.id} className="text-center">
                <div className={cn("rounded-lg p-3 mb-2", stage.color)}>
                  <p className="text-2xl font-bold">{count}</p>
                </div>
                <p className="text-xs font-medium text-on-surface-variant">{stage.label}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Investors List */}
        <div className="lg:col-span-1 space-y-2">
          {investors.map((inv) => (
            <motion.button key={inv.id} whileHover={{ x: 2 }} onClick={() => setSelectedInvestor(inv)} className={cn("w-full text-left p-4 rounded-xl transition-all", selectedInvestor.id === inv.id ? "bg-primary-container thin-border" : "bg-surface thin-border hover:bg-surface-container-low")}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-on-surface font-bold">{inv.name.split(" ").map((n) => n[0]).join("")}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-on-surface">{inv.name}</p>
                  <p className="text-xs text-on-surface-variant">{inv.firm}</p>
                </div>
                <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase", pipelineStages.find((s) => s.id === inv.status)?.color || "bg-surface-container text-on-surface-variant")}>
                  {inv.status.replace("-", " ")}
                </span>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Investor Detail + Pitch Deck + Checklist */}
        <div className="lg:col-span-2 space-y-4">
          <AnimatePresence mode="wait">
            <motion.div key={selectedInvestor.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-surface thin-border rounded-xl p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-xl bg-primary-container flex items-center justify-center text-primary font-bold text-xl">{selectedInvestor.name.split(" ").map((n) => n[0]).join("")}</div>
                <div>
                  <h3 className="text-lg font-semibold text-on-surface">{selectedInvestor.name}</h3>
                  <p className="text-sm text-on-surface-variant">{selectedInvestor.firm}</p>
                </div>
              </div>
              <div className="flex gap-4 text-sm text-on-surface-variant mb-4">
                {selectedInvestor.email && <span className="flex items-center gap-1"><Mail className="w-4 h-4" />{selectedInvestor.email}</span>}
                <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />Last: {selectedInvestor.lastContact}</span>
              </div>
              <p className="text-sm text-on-surface/80 leading-relaxed">{selectedInvestor.notes}</p>
            </motion.div>
          </AnimatePresence>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Pitch Deck Generator */}
            <div className="bg-surface thin-border rounded-xl p-5">
              <h3 className="type-label-caps text-on-surface mb-3 flex items-center gap-2"><FileText className="w-4 h-4 text-primary" />Pitch Deck Structure</h3>
              <div className="space-y-2">
                {pitchSlides.map((slide, i) => (
                  <div key={i} className="flex items-center gap-3 py-1.5">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-container text-xs font-bold text-primary">{i + 1}</span>
                    <span className="text-sm text-on-surface">{slide}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Due Diligence Checklist */}
            <div className="bg-surface thin-border rounded-xl p-5">
              <h3 className="type-label-caps text-on-surface mb-3 flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" />Due Diligence Checklist</h3>
              <div className="space-y-2">
                {diligenceChecklist.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 py-1.5">
                    {item.done ? <CheckCircle2 className="w-4 h-4 text-primary shrink-0" /> : <Circle className="w-4 h-4 text-muted-foreground shrink-0" />}
                    <span className={cn("text-sm", item.done ? "text-on-surface-variant line-through" : "text-on-surface")}>{item.item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
