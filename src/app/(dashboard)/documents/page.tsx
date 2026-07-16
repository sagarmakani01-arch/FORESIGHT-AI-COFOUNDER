"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search, Folder, FileText, ChevronRight, Clock, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCompanyData } from "@/lib/hooks";
import PageHeader from "@/components/shared/page-header";
import { Modal, FormField, inputClass, selectClass, SubmitButton } from "@/components/shared/modal";
import { ListSkeleton } from "@/components/ui/skeleton";

const folderLabels: Record<string, string> = {
  STRATEGY: "Strategy",
  FINANCE: "Finance",
  LEGAL: "Legal",
  PRODUCT: "Product",
  MARKETING: "Marketing",
  OPERATIONS: "Operations",
  HR: "HR",
  OTHER: "Other",
  strategy: "Strategy",
  finance: "Finance",
  legal: "Legal",
  product: "Product",
  marketing: "Marketing",
  operations: "Operations",
  hr: "HR",
  other: "Other",
};

export default function DocumentsPage() {
  const router = useRouter();
  const { data, loading } = useCompanyData();
  const [selectedFolder, setSelectedFolder] = useState<string>("all");
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", folder: "OTHER" });

  const documents = data?.documents || [];

  const folderCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const doc of documents) {
      const f = (doc.folder ?? "").toLowerCase();
      counts[f] = (counts[f] || 0) + 1;
    }
    return counts;
  }, [documents]);

  const filteredDocs = useMemo(() => {
    return documents.filter((d) => {
      const f = (d.folder ?? "").toLowerCase();
      const matchesFolder = selectedFolder === "all" || f === selectedFolder.toLowerCase();
      const matchesSearch = (d.title ?? "").toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFolder && matchesSearch;
    });
  }, [documents, selectedFolder, searchQuery]);

  const selectedDoc = selectedDocId ? documents.find((d) => d.id === selectedDocId) : filteredDocs[0] || null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setModalOpen(false);
      setForm({ title: "", content: "", folder: "OTHER" });
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Documents" description="Organize and manage your business documents" />
        <ListSkeleton items={6} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Documents" description="Organize and manage your business documents" actions={[
        <button key="new" onClick={() => setModalOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-white hover:bg-primary-dark transition-colors font-medium text-sm"><Plus className="w-4 h-4" />New Document</button>,
      ]} />

      <div className="flex gap-6 h-[calc(100vh-14rem)]">
        <div className="w-56 flex-shrink-0 space-y-2">
          <button onClick={() => setSelectedFolder("all")} className={cn("w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all", selectedFolder === "all" ? "bg-primary-container text-primary" : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface")}>
            <Folder className="w-4 h-4" />All Documents<span className="ml-auto text-xs">{documents.length}</span>
          </button>
          {Object.entries(folderCounts).map(([folder, count]) => (
            <button key={folder} onClick={() => setSelectedFolder(folder)} className={cn("w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all", selectedFolder === folder ? "bg-primary-container text-primary" : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface")}>
              <Folder className="w-4 h-4" />{folderLabels[folder] || folder}<span className="ml-auto text-xs">{count}</span>
            </button>
          ))}
        </div>

        <div className="w-72 flex-shrink-0 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search docs..." className="w-full pl-10 pr-3 py-2 rounded-lg thin-border bg-surface text-sm text-on-surface placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/20" />
          </div>

          <div className="space-y-1 overflow-y-auto max-h-[calc(100vh-20rem)]">
            {filteredDocs.length === 0 && (
              <p className="text-sm text-on-surface-variant text-center py-8">No documents found</p>
            )}
            {filteredDocs.map((doc) => (
              <motion.button key={doc.id} whileHover={{ x: 2 }} onClick={() => setSelectedDocId(doc.id)} className={cn("w-full text-left p-3 rounded-lg transition-all", selectedDoc?.id === doc.id ? "bg-primary-container" : "hover:bg-surface-container-low")}>
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-on-surface truncate">{doc.title}</p>
                    <p className="text-xs text-on-surface-variant flex items-center gap-1 mt-0.5"><Clock className="w-3 h-3" />{new Date(doc.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        <div className="flex-1 bg-surface thin-border rounded-xl p-6 overflow-y-auto">
          {selectedDoc ? (
            <motion.div key={selectedDoc.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-1 rounded-full bg-primary-container text-primary text-xs font-medium capitalize">{folderLabels[selectedDoc.folder] || selectedDoc.folder}</span>
                <span className="text-xs text-on-surface-variant">Updated {new Date(selectedDoc.updatedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
              </div>
              <h2 className="text-2xl font-bold text-on-surface mb-4">{selectedDoc.title}</h2>
              <div className="prose prose-sm max-w-none text-on-surface/80 leading-relaxed whitespace-pre-wrap">
                {selectedDoc.content}
              </div>
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-on-surface-variant">
              <FileText className="mb-4 h-12 w-12 opacity-30" />
              <p className="text-lg font-medium">Select a document</p>
            </div>
          )}
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Document">
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Title" required>
            <input
              className={inputClass}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Document title"
              required
            />
          </FormField>
          <FormField label="Content" required>
            <textarea
              className={inputClass}
              rows={6}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="Document content"
              required
            />
          </FormField>
          <FormField label="Folder">
            <select
              className={selectClass}
              value={form.folder}
              onChange={(e) => setForm({ ...form, folder: e.target.value })}
            >
              {Object.keys(folderLabels)
                .filter((k) => k === k.toUpperCase())
                .map((f) => (
                  <option key={f} value={f}>{folderLabels[f]}</option>
                ))}
            </select>
          </FormField>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="rounded-lg px-4 py-2.5 text-sm font-medium text-on-surface-variant hover:bg-surface-container transition-colors">
              Cancel
            </button>
            <SubmitButton loading={submitting}>Create Document</SubmitButton>
          </div>
        </form>
      </Modal>
    </div>
  );
}
