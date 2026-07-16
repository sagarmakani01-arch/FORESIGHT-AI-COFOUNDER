"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, TrendingUp, AlertTriangle, Lightbulb, Globe, Check, X, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCompanyData } from "@/lib/hooks";
import PageHeader from "@/components/shared/page-header";
import { Modal, FormField, inputClass, SubmitButton } from "@/components/shared/modal";

export default function CompetitorsPage() {
  const router = useRouter();
  const { data, loading } = useCompanyData();
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ name: "", industry: "", website: "", pricing: "", funding: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/competitors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed");
      setShowNew(false);
      setForm({ name: "", industry: "", website: "", pricing: "", funding: "" });
      router.refresh();
    } catch {
      alert("Failed to add competitor");
    } finally {
      setSubmitting(false);
    }
  };

  const competitors = data?.competitors ?? [];
  const filteredCompetitors = competitors.filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const selectedCompetitor = filteredCompetitors[selectedIdx] ?? filteredCompetitors[0];

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Competitor Intelligence" description="Track and analyze your competitive landscape" actions={[]} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-surface thin-border rounded-xl p-5 animate-pulse h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Competitor Intelligence" description="Track and analyze your competitive landscape" actions={[
        <button key="export" onClick={() => window.open('/api/export?entity=competitors&format=csv')} className="flex items-center gap-2 px-3 py-2 rounded-full thin-border bg-surface text-on-surface-variant hover:text-on-surface transition-colors font-medium text-sm"><Download className="w-4 h-4" />Export CSV</button>,
        <button key="add" onClick={() => setShowNew(true)} className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-white hover:bg-primary-dark transition-colors font-medium text-sm"><Plus className="w-4 h-4" />Add Competitor</button>,
      ]} />

      <div className="flex gap-6">
        <div className="flex-1 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
            <input type="text" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setSelectedIdx(0); }} placeholder="Search competitors..." className="w-full pl-12 pr-4 py-3 rounded-xl thin-border bg-surface text-on-surface placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/20" />
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
                  {filteredCompetitors.map((competitor, idx) => (
                    <motion.tr key={competitor.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setSelectedIdx(idx)} className={cn("border-b border-outline-variant cursor-pointer transition-colors", selectedCompetitor?.id === competitor.id ? "bg-primary-container/50" : "hover:bg-surface-container-low")}>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-on-surface font-bold">{competitor.name.charAt(0)}</div>
                          <div>
                            <p className="font-medium text-on-surface">{competitor.name}</p>
                            <p className="text-xs text-on-surface-variant flex items-center gap-1"><Globe className="w-3 h-3" />{competitor.industry}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-on-surface">{competitor.pricing ?? "—"}</td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {(competitor.weaknesses ?? []).slice(0, 2).map((w) => (<span key={w} className="px-2 py-0.5 rounded-full bg-error-container text-error text-xs">{w}</span>))}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {(competitor.features ?? []).slice(0, 2).map((f) => (<span key={f} className="px-2 py-0.5 rounded-full bg-primary-container text-primary text-xs">{f}</span>))}
                          {(competitor.features ?? []).length > 2 && <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant text-xs">+{(competitor.features ?? []).length - 2}</span>}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                  {filteredCompetitors.length === 0 && (
                    <tr><td colSpan={4} className="px-4 py-12 text-center text-on-surface-variant text-sm">No competitors found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="w-96 flex-shrink-0 space-y-4">
          {selectedCompetitor && (
            <AnimatePresence mode="wait">
              <motion.div key={selectedCompetitor.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-surface thin-border rounded-xl p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center text-on-surface font-bold text-lg">{selectedCompetitor.name.charAt(0)}</div>
                  <div>
                    <h3 className="font-semibold text-on-surface">{selectedCompetitor.name}</h3>
                    <p className="text-xs text-on-surface-variant">{selectedCompetitor.pricing ?? "Pricing not listed"}</p>
                  </div>
                </div>
                <div className="mb-4">
                  <h4 className="type-label-caps text-primary mb-2 flex items-center gap-1.5"><TrendingUp className="w-3 h-3" />Strengths</h4>
                  <div className="space-y-1">
                    {(selectedCompetitor.strengths ?? []).map((s) => (<div key={s} className="flex items-center gap-2 text-sm text-on-surface/80"><Check className="w-3 h-3 text-primary" />{s}</div>))}
                  </div>
                </div>
                <div>
                  <h4 className="type-label-caps text-error mb-2 flex items-center gap-1.5"><AlertTriangle className="w-3 h-3" />Weaknesses</h4>
                  <div className="space-y-1">
                    {(selectedCompetitor.weaknesses ?? []).map((w) => (<div key={w} className="flex items-center gap-2 text-sm text-on-surface/80"><X className="w-3 h-3 text-error" />{w}</div>))}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-on-surface mb-4 flex items-center gap-2"><Lightbulb className="w-5 h-5 text-primary" />Market Opportunities</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {competitors.length === 0 ? (
            <div className="col-span-full bg-surface thin-border rounded-xl p-8 text-center text-on-surface-variant text-sm">Add competitors to see market opportunities.</div>
          ) : (
            competitors.map((c, index) => (
              <motion.div key={c.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} className="bg-surface thin-border rounded-xl p-5 transition-all duration-200 hover:shadow-card">
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-primary-container text-primary">Weakness</span>
                <h4 className="font-medium text-on-surface mt-3 mb-2">{c.weaknesses[0] ?? "No data"}</h4>
                <p className="text-sm text-on-surface-variant">{c.name} — {c.industry}</p>
              </motion.div>
            ))
          )}
        </div>
      </div>

      <Modal open={showNew} onClose={() => setShowNew(false)} title="Add Competitor">
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Name" required>
            <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} placeholder="Competitor name" />
          </FormField>
          <FormField label="Industry" required>
            <input type="text" required value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} className={inputClass} placeholder="e.g. SaaS, FinTech" />
          </FormField>
          <FormField label="Website">
            <input type="url" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} className={inputClass} placeholder="https://..." />
          </FormField>
          <FormField label="Pricing">
            <input type="text" value={form.pricing} onChange={(e) => setForm({ ...form, pricing: e.target.value })} className={inputClass} placeholder="e.g. $99/mo" />
          </FormField>
          <FormField label="Funding">
            <input type="text" value={form.funding} onChange={(e) => setForm({ ...form, funding: e.target.value })} className={inputClass} placeholder="e.g. $10M Series A" />
          </FormField>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowNew(false)} className="rounded-lg px-4 py-2.5 text-sm font-medium text-on-surface-variant hover:bg-surface-container transition-colors">Cancel</button>
            <SubmitButton loading={submitting}>Add Competitor</SubmitButton>
          </div>
        </form>
      </Modal>
    </div>
  );
}
