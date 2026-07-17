"use client";

import { useState, FormEvent } from "react";
import { motion } from "framer-motion";
import { Search, BookOpen, Plus } from "lucide-react";
import PageHeader from "@/components/shared/page-header";
import { useCompanyData } from "@/lib/hooks";
import { Modal, FormField, inputClass, SubmitButton } from "@/components/shared/modal";

const TYPE_SUGGESTIONS = ["insight", "note", "reference", "competitor intel", "market trend", "customer feedback"];

export default function KnowledgePage() {
  const { data, loading } = useCompanyData();
  const [searchQuery, setSearchQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formType, setFormType] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formMetadata, setFormMetadata] = useState("");

  const entries = data?.knowledgeEntries ?? [];

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!formType.trim() || !formContent.trim()) return;
    setSubmitting(true);
    try {
      const body: Record<string, unknown> = { type: formType.trim(), content: formContent.trim() };
      if (formMetadata.trim()) {
        try { body.metadata = JSON.parse(formMetadata); } catch { body.metadata = formMetadata; }
      }
      const res = await fetch("/api/knowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to create entry");
      setModalOpen(false);
      setFormType("");
      setFormContent("");
      setFormMetadata("");
      window.location.reload();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  const filtered = entries.filter((e) => {
    return (
      e.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.type.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Knowledge Base" description="Centralized intelligence and insights" actions={[
          <button key="new" onClick={() => setModalOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-white hover:bg-primary-dark transition-colors font-medium text-sm"><Plus className="w-4 h-4" />Add Entry</button>,
        ]} />
        <div className="flex gap-6">
          <div className="flex-1 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-surface thin-border rounded-xl animate-pulse" />
            ))}
          </div>
          <div className="w-72 flex-shrink-0 h-48 bg-surface thin-border rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Knowledge Base" description="Centralized intelligence and insights" actions={[
        <button key="new" onClick={() => setModalOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-white hover:bg-primary-dark transition-colors font-medium text-sm"><Plus className="w-4 h-4" />Add Entry</button>,
      ]} />

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
        <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search knowledge base..." className="w-full pl-12 pr-4 py-3 rounded-xl thin-border bg-surface text-on-surface placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/20" />
      </div>

      <div className="flex gap-6">
        <div className="flex-1 space-y-3">
          {filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-24 text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-primary-container flex items-center justify-center mb-4">
                <BookOpen className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-on-surface mb-2">No knowledge entries yet</h3>
              <p className="text-on-surface-variant max-w-md">
                Build your knowledge base by adding entries about your market, competitors, and industry insights.
              </p>
            </motion.div>
          ) : (
            filtered.map((entry) => (
              <motion.div key={entry.id} whileHover={{ x: 2 }} className="bg-surface thin-border rounded-xl p-4 transition-all hover:shadow-card">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded-full bg-primary-container text-primary text-[10px] font-semibold uppercase">{entry.type}</span>
                </div>
                <p className="text-sm text-on-surface-variant line-clamp-3 mt-2">{entry.content}</p>
                {entry.metadata && typeof entry.metadata === "object" && Object.keys(entry.metadata as Record<string, unknown>).length > 0 ? (
                  <div className="flex gap-1 flex-wrap mt-3">
                    {Object.entries(entry.metadata as Record<string, unknown>).slice(0, 5).map(([key, val]) => (
                      <span key={key} className="px-2 py-0.5 rounded-full bg-surface-container text-[10px] text-on-surface-variant">{key}: {String(typeof val === "string" ? val : JSON.stringify(val))}</span>
                    ))}
                  </div>
                ) : null}
              </motion.div>
            ))
          )}
        </div>

        <div className="w-72 flex-shrink-0">
          <div className="bg-surface thin-border rounded-xl p-5">
            <h3 className="type-label-caps text-on-surface mb-3 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" />Knowledge Summary
            </h3>
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-surface-container-low">
                <p className="text-sm text-on-surface-variant">Total Entries</p>
                <p className="text-lg font-bold text-on-surface">{entries.length}</p>
              </div>
              {data?.company && (
                <div className="p-3 rounded-lg bg-surface-container-low">
                  <p className="text-sm text-on-surface-variant">Company</p>
                  <p className="text-sm font-medium text-on-surface">{data.company.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">{data.company.industry} · {data.company.stage}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Knowledge Entry">
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Type" required>
            <input
              type="text"
              value={formType}
              onChange={(e) => setFormType(e.target.value)}
              placeholder="e.g. insight, note, reference"
              list="type-suggestions"
              className={inputClass}
              required
            />
            <datalist id="type-suggestions">
              {TYPE_SUGGESTIONS.map((t) => <option key={t} value={t} />)}
            </datalist>
          </FormField>
          <FormField label="Content" required>
            <textarea
              value={formContent}
              onChange={(e) => setFormContent(e.target.value)}
              placeholder="Enter the knowledge entry content..."
              rows={6}
              className={inputClass + " resize-y"}
              required
            />
          </FormField>
          <FormField label="Metadata (optional)">
            <input
              type="text"
              value={formMetadata}
              onChange={(e) => setFormMetadata(e.target.value)}
              placeholder='Optional JSON, e.g. {"source": "research"}'
              className={inputClass}
            />
          </FormField>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="rounded-lg px-4 py-2.5 text-sm font-medium text-on-surface-variant hover:bg-surface-container transition-colors">
              Cancel
            </button>
            <SubmitButton loading={submitting}>Create Entry</SubmitButton>
          </div>
        </form>
      </Modal>
    </div>
  );
}
