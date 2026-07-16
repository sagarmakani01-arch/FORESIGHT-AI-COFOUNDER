"use client";

import { useState, useRef } from "react";
import { FilesStoreProvider, useFilesStore } from "@/lib/files-store";
import FileTree from "@/components/files/file-tree";
import FileEditor from "@/components/files/file-editor";
import {
  Plus,
  FolderPlus,
  FilePlus,
  Search,
  Upload,
} from "lucide-react";

function FilesContent() {
  const { createNode, setSelectedId, selectedId } = useFilesStore();
  const [showNewMenu, setShowNewMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarWidth] = useState(260);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCreate = async (type: "file" | "folder") => {
    const name = type === "file" ? "New Document.md" : "New Folder";
    const node = await createNode(type, name, null);
    setSelectedId(node.id);
    setShowNewMenu(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const textExtensions = [
      ".txt", ".md", ".js", ".ts", ".tsx", ".jsx", ".py", ".json", ".csv",
      ".html", ".css", ".yaml", ".yml", ".sql", ".xml", ".env", ".gitignore",
      ".sh", ".bat", ".log", ".config", ".toml",
    ];
    const imageExtensions = [".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp"];
    const pdfExtensions = [".pdf"];

    for (const file of Array.from(files)) {
      const ext = "." + file.name.split(".").pop()?.toLowerCase();
      const sizeKB = Math.round(file.size / 1024);

      let content: string;

      if (textExtensions.includes(ext)) {
        content = await file.text();
      } else if (pdfExtensions.includes(ext)) {
        content = `[PDF uploaded - text extraction not available]`;
      } else if (imageExtensions.includes(ext)) {
        content = `[Image uploaded: ${file.name}]`;
      } else {
        content = `[File uploaded: ${file.name}, size: ${sizeKB}kb]`;
      }

      const node = await createNode("file", file.name, null, content);
      setSelectedId(node.id);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Sidebar */}
      <div
        className="flex flex-col border-r border-outline-variant bg-surface"
        style={{ width: sidebarWidth }}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between border-b border-outline-variant px-4 py-3">
          <h2 className="text-sm font-semibold text-on-surface">Files</h2>
          <div className="relative">
            <button
              onClick={() => setShowNewMenu(!showNewMenu)}
              className="flex items-center gap-1 rounded-lg bg-primary px-2.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-primary-hover"
            >
              <Plus className="h-3.5 w-3.5" />
              New
            </button>
            {showNewMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowNewMenu(false)}
                />
                <div className="absolute right-0 top-8 z-50 w-44 rounded-xl bg-surface thin-border shadow-modal p-1">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-on-surface-variant hover:bg-surface-container-low"
                  >
                    <Upload className="h-3.5 w-3.5" /> Upload File
                  </button>
                  <button
                    onClick={() => handleCreate("file")}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-on-surface-variant hover:bg-surface-container-low"
                  >
                    <FilePlus className="h-3.5 w-3.5" /> New File
                  </button>
                  <button
                    onClick={() => handleCreate("folder")}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-on-surface-variant hover:bg-surface-container-low"
                  >
                    <FolderPlus className="h-3.5 w-3.5" /> New Folder
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          multiple
          accept=".txt,.md,.js,.ts,.tsx,.jsx,.py,.json,.csv,.html,.css,.yaml,.yml,.sql,.xml,.pdf,.png,.jpg,.jpeg,.gif,.svg,.webp,.env,.sh,.log,.toml,.config"
          onChange={handleFileUpload}
        />

        {/* Search */}
        <div className="px-3 py-2">
          <div className="flex items-center gap-2 rounded-lg border border-outline-variant bg-surface-container-low px-2.5 py-1.5">
            <Search className="h-3.5 w-3.5 text-on-surface-variant" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search files..."
              className="flex-1 bg-transparent text-xs outline-none placeholder:text-on-surface-variant/50"
            />
          </div>
        </div>

        {/* File Tree */}
        <div className="flex-1 overflow-y-auto px-1">
          <FileTree />
        </div>

        {/* Sidebar Footer */}
        <div className="border-t border-outline-variant px-4 py-3">
          <div className="text-xs text-on-surface-variant">
            Work together with your AI co-founder on files and documents.
          </div>
        </div>
      </div>

      {/* Main Editor */}
      <div className="flex-1 overflow-hidden">
        <FileEditor />
      </div>
    </div>
  );
}

export default function FilesPage() {
  return (
    <FilesStoreProvider>
      <FilesContent />
    </FilesStoreProvider>
  );
}
