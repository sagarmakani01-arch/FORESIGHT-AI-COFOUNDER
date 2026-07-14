"use client";

import { useState } from "react";
import { FilesStoreProvider, useFilesStore } from "@/lib/files-store";
import FileTree from "@/components/files/file-tree";
import FileEditor from "@/components/files/file-editor";
import {
  Plus,
  FolderPlus,
  FilePlus,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";

function FilesContent() {
  const { createNode, setSelectedId, selectedId } = useFilesStore();
  const [showNewMenu, setShowNewMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarWidth] = useState(260);

  const handleCreate = (type: "file" | "folder") => {
    const name = type === "file" ? "New Document.md" : "New Folder";
    const node = createNode(type, name, null);
    setSelectedId(node.id);
    setShowNewMenu(false);
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
