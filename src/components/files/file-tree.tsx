"use client";

import { useState } from "react";
import { useFilesStore, FileNode } from "@/lib/files-store";
import {
  ChevronRight,
  ChevronDown,
  File,
  Folder,
  FolderOpen,
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  FileCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

function FileTreeItem({ node, depth }: { node: FileNode; depth: number }) {
  const {
    selectedId,
    setSelectedId,
    expandedFolders,
    toggleFolder,
    renameNode,
    deleteNode,
    getChildren,
    createNode,
  } = useFilesStore();

  const [showMenu, setShowMenu] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(node.name);

  const isSelected = selectedId === node.id;
  const isExpanded = expandedFolders.has(node.id);
  const children = node.type === "folder" ? getChildren(node.id) : [];
  const isFolder = node.type === "folder";

  const handleClick = () => {
    if (isFolder) {
      toggleFolder(node.id);
    }
    setSelectedId(node.id);
  };

  const handleRename = async () => {
    if (renameValue.trim() && renameValue !== node.name) {
      await renameNode(node.id, renameValue.trim());
    }
    setIsRenaming(false);
  };

  const handleCreateSubItem = async (type: "file" | "folder") => {
    const name = type === "file" ? "New Document.md" : "New Folder";
    const newNode = await createNode(type, name, node.id);
    setSelectedId(newNode.id);
    setShowMenu(false);
  };

  return (
    <div>
      <div
        className={cn(
          "group flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm cursor-pointer transition-colors",
          isSelected
            ? "bg-primary-container text-on-surface font-medium"
            : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
        )}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={handleClick}
      >
        {isFolder ? (
          <>
            {isExpanded ? (
              <ChevronDown className="h-3.5 w-3.5 shrink-0" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 shrink-0" />
            )}
            {isExpanded ? (
              <FolderOpen className="h-4 w-4 shrink-0 text-primary" />
            ) : (
              <Folder className="h-4 w-4 shrink-0 text-primary" />
            )}
          </>
        ) : (
          <>
            <span className="w-3.5" />
            {node.sharedWithAI ? (
              <FileCheck className="h-4 w-4 shrink-0 text-primary" />
            ) : (
              <File className="h-4 w-4 shrink-0" />
            )}
          </>
        )}

        {isRenaming ? (
          <input
            autoFocus
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleRename();
              if (e.key === "Escape") setIsRenaming(false);
            }}
            className="flex-1 bg-surface border border-primary rounded px-1 py-0.5 text-sm outline-none"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className="flex-1 truncate">{node.name}</span>
        )}

        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="opacity-0 group-hover:opacity-100 rounded p-0.5 transition-opacity hover:bg-surface-container"
          >
            <MoreHorizontal className="h-3.5 w-3.5" />
          </button>

          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(false);
                }}
              />
              <div className="absolute right-0 top-6 z-50 w-44 rounded-xl bg-surface thin-border shadow-modal p-1">
                {isFolder && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCreateSubItem("file");
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-on-surface-variant hover:bg-surface-container-low"
                    >
                      <Plus className="h-3.5 w-3.5" /> New File
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCreateSubItem("folder");
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-on-surface-variant hover:bg-surface-container-low"
                    >
                      <Plus className="h-3.5 w-3.5" /> New Folder
                    </button>
                    <div className="my-1 border-t border-outline-variant" />
                  </>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsRenaming(true);
                    setRenameValue(node.name);
                    setShowMenu(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-on-surface-variant hover:bg-surface-container-low"
                >
                  <Pencil className="h-3.5 w-3.5" /> Rename
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNode(node.id).then(() => setShowMenu(false));
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-destructive hover:bg-destructive/5"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {isFolder && isExpanded && (
        <div>
          {children
            .sort((a, b) => {
              if (a.type === b.type) return a.name.localeCompare(b.name);
              return a.type === "folder" ? -1 : 1;
            })
            .map((child) => (
              <FileTreeItem key={child.id} node={child} depth={depth + 1} />
            ))}
          {children.length === 0 && (
            <div
              className="text-xs text-on-surface-variant/50 italic py-1"
              style={{ paddingLeft: `${(depth + 1) * 16 + 24}px` }}
            >
              Empty
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function FileTree() {
  const { getChildren, loading } = useFilesStore();
  const rootNodes = getChildren(null);

  if (loading) {
    return (
      <div className="py-4 text-center text-xs text-on-surface-variant">
        Loading files...
      </div>
    );
  }

  return (
    <div className="py-1">
      {rootNodes.length === 0 && (
        <div className="py-4 text-center text-xs text-on-surface-variant/50">
          No files yet. Create one to get started.
        </div>
      )}
      {rootNodes
        .sort((a, b) => {
          if (a.type === b.type) return a.name.localeCompare(b.name);
          return a.type === "folder" ? -1 : 1;
        })
        .map((node) => (
          <FileTreeItem key={node.id} node={node} depth={0} />
        ))}
    </div>
  );
}
