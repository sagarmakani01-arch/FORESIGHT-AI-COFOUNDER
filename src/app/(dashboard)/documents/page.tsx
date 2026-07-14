"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Folder, FileText, ChevronRight, Clock, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { documents } from "@/lib/data";
import PageHeader from "@/components/shared/page-header";
import type { DocumentFolder } from "@/types";

const folders: { id: DocumentFolder; label: string; count: number }[] = [
  { id: "strategy", label: "Strategy", count: 1 },
  { id: "finance", label: "Finance", count: 1 },
  { id: "legal", label: "Legal", count: 1 },
  { id: "product", label: "Product", count: 2 },
  { id: "marketing", label: "Marketing", count: 1 },
  { id: "operations", label: "Operations", count: 1 },
  { id: "hr", label: "HR", count: 1 },
];

export default function DocumentsPage() {
  const [selectedFolder, setSelectedFolder] = useState<DocumentFolder | "all">("all");
  const [selectedDoc, setSelectedDoc] = useState(documents[0]);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredDocs = documents.filter((d) => {
    const matchesFolder = selectedFolder === "all" || d.folder === selectedFolder;
    const matchesSearch = d.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFolder && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Documents" description="Organize and manage your business documents" actions={[
        <button key="new" className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-white hover:bg-primary-dark transition-colors font-medium text-sm"><Plus className="w-4 h-4" />New Document</button>,
      ]} />

      <div className="flex gap-6 h-[calc(100vh-14rem)]">
        {/* Folder Sidebar */}
        <div className="w-56 flex-shrink-0 space-y-2">
          <button onClick={() => setSelectedFolder("all")} className={cn("w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all", selectedFolder === "all" ? "bg-primary-container text-primary" : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface")}>
            <Folder className="w-4 h-4" />All Documents<span className="ml-auto text-xs">{documents.length}</span>
          </button>
          {folders.map((folder) => (
            <button key={folder.id} onClick={() => setSelectedFolder(folder.id)} className={cn("w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all", selectedFolder === folder.id ? "bg-primary-container text-primary" : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface")}>
              <Folder className="w-4 h-4" />{folder.label}<span className="ml-auto text-xs">{folder.count}</span>
            </button>
          ))}
        </div>

        {/* Document List */}
        <div className="w-72 flex-shrink-0 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search docs..." className="w-full pl-10 pr-3 py-2 rounded-lg thin-border bg-surface text-sm text-on-surface placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/20" />
          </div>

          <div className="space-y-1 overflow-y-auto max-h-[calc(100vh-20rem)]">
            {filteredDocs.map((doc) => (
              <motion.button key={doc.id} whileHover={{ x: 2 }} onClick={() => setSelectedDoc(doc)} className={cn("w-full text-left p-3 rounded-lg transition-all", selectedDoc.id === doc.id ? "bg-primary-container" : "hover:bg-surface-container-low")}>
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

        {/* Document Viewer */}
        <div className="flex-1 bg-surface thin-border rounded-xl p-6 overflow-y-auto">
          <motion.div key={selectedDoc.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-1 rounded-full bg-primary-container text-primary text-xs font-medium capitalize">{selectedDoc.folder}</span>
              <span className="text-xs text-on-surface-variant">Updated {new Date(selectedDoc.updatedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
            </div>
            <h2 className="text-2xl font-bold text-on-surface mb-4">{selectedDoc.title}</h2>
            <div className="prose prose-sm max-w-none text-on-surface/80 leading-relaxed whitespace-pre-wrap">
              {selectedDoc.content}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
