"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Mail, Calendar, FileText, CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCompanyData, formatDate } from "@/lib/hooks";
import PageHeader from "@/components/shared/page-header";
import { Modal, FormField, inputClass, selectClass, SubmitButton } from "@/components/shared/modal";

const pipelineStages: { id: string; label: string; color: string }[] = [
  { id: "PROSPECTING", label: "Prospecting", color: "bg-surface-container text-on-surface-variant" },
  { id: "CONTACTED", label: "Contacted", color: "bg-surface-container text-on-surface-variant" },
  { id: "MEETING_SCHEDULED", label: "Meeting", color: "bg-primary-container text-primary" },
  { id: "DUE_DILIGENCE", label: "Due Diligence", color: "bg-primary-container text-primary" },
  { id: "TERM_SHEET", label: "Term Sheet", color: "bg-primary text-white" },
  { id: "CLOSED", label: "Closed", color: "bg-primary text-white" },
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
  const router = useRouter();
  const { data, loading } = useCompanyData();
  const investors = data?.investors ?? [];
  const [selectedIdx, setSelectedIdx] = useState(0);
  const selectedInvestor = investors[selectedIdx] ?? investors[0];
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", firm: "", stage: "IDEA", status: "PROSPECTING", email: "", phone: "", notes: "" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetch("/api/investors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setModalOpen(false);
      setForm({ name: "", firm: "", stage: "IDEA", status: "PROSPECTING", email: "", phone: "", notes: "" });
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Investors" description="Manage your fundraising pipeline" actions={[]} />
        <div className="bg-surface thin-border rounded-xl p-6 animate-pulse h-32" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="bg-surface thin-border rounded-xl h-96 animate-pulse" />
          <div className="bg-surface thin-border rounded-xl h-96 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Investors" description="Manage your fundraising pipeline" actions={[
        <button key="add" onClick={() => setModalOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-white hover:bg-primary-dark transition-colors font-medium text-sm"><Plus className="w-4 h-4" />Add Investor</button>,
      ]} />

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
        <div className="lg:col-span-1 space-y-2">
          {investors.length === 0 ? (
            <div className="bg-surface thin-border rounded-xl p-8 text-center text-on-surface-variant text-sm">No investors yet. Add your first investor to start tracking your pipeline.</div>
          ) : (
            investors.map((inv, idx) => (
              <motion.button key={inv.id} whileHover={{ x: 2 }} onClick={() => setSelectedIdx(idx)} className={cn("w-full text-left p-4 rounded-xl transition-all", selectedInvestor?.id === inv.id ? "bg-primary-container thin-border" : "bg-surface thin-border hover:bg-surface-container-low")}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-on-surface font-bold">{(inv.name ?? "?").split(" ").map((n) => n[0]).join("")}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-on-surface">{inv.name}</p>
                    <p className="text-xs text-on-surface-variant">{inv.firm}</p>
                  </div>
                  <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase", pipelineStages.find((s) => s.id === inv.status)?.color || "bg-surface-container text-on-surface-variant")}>
                    {(inv.status ?? "UNKNOWN").replace(/_/g, " ").toLowerCase()}
                  </span>
                </div>
              </motion.button>
            ))
          )}
        </div>

        <div className="lg:col-span-2 space-y-4">
          {selectedInvestor ? (
            <AnimatePresence mode="wait">
              <motion.div key={selectedInvestor.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-surface thin-border rounded-xl p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-xl bg-primary-container flex items-center justify-center text-primary font-bold text-xl">{(selectedInvestor.name ?? "?").split(" ").map((n) => n[0]).join("")}</div>
                  <div>
                    <h3 className="text-lg font-semibold text-on-surface">{selectedInvestor.name}</h3>
                    <p className="text-sm text-on-surface-variant">{selectedInvestor.firm}</p>
                  </div>
                </div>
                <div className="flex gap-4 text-sm text-on-surface-variant mb-4">
                  {selectedInvestor.email && <span className="flex items-center gap-1"><Mail className="w-4 h-4" />{selectedInvestor.email}</span>}
                  {selectedInvestor.lastContact && <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />Last: {formatDate(selectedInvestor.lastContact)}</span>}
                </div>
                {selectedInvestor.notes && <p className="text-sm text-on-surface/80 leading-relaxed">{selectedInvestor.notes}</p>}
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="bg-surface thin-border rounded-xl p-6 text-center text-on-surface-variant text-sm">Select an investor to view details.</div>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Investor">
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Name" required>
            <input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Investor name" required />
          </FormField>
          <FormField label="Firm" required>
            <input className={inputClass} value={form.firm} onChange={(e) => setForm({ ...form, firm: e.target.value })} placeholder="Firm name" required />
          </FormField>
          <FormField label="Stage" required>
            <select className={selectClass} value={form.stage} onChange={(e) => setForm({ ...form, stage: e.target.value })}>
              {["IDEA", "PRE_SEED", "SEED", "SERIES_A", "SERIES_B", "SERIES_C", "GROWTH", "EXIT"].map((s) => (
                <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Status">
            <select className={selectClass} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              {["PROSPECTING", "CONTACTED", "MEETING_SCHEDULED", "DUE_DILIGENCE", "TERM_SHEET", "CLOSED", "PASSED"].map((s) => (
                <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Email">
            <input className={inputClass} type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" />
          </FormField>
          <FormField label="Phone">
            <input className={inputClass} type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+1 (555) 000-0000" />
          </FormField>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="rounded-lg px-4 py-2.5 text-sm font-medium text-on-surface-variant hover:bg-surface-container transition-colors">
              Cancel
            </button>
            <SubmitButton loading={submitting}>Add Investor</SubmitButton>
          </div>
        </form>
      </Modal>
    </div>
  );
}
