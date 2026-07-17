"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";

export type FileNodeType = "file" | "folder";

export interface FileNode {
  id: string;
  name: string;
  type: FileNodeType;
  content?: string;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
  children?: string[];
  sharedWithAI?: boolean;
  aiNotes?: string;
}

interface FilesStore {
  nodes: Record<string, FileNode>;
  selectedId: string | null;
  expandedFolders: Set<string>;
  loading: boolean;
  setSelectedId: (id: string | null) => void;
  toggleFolder: (id: string) => void;
  createNode: (
    type: FileNodeType,
    name: string,
    parentId: string | null,
    content?: string
  ) => Promise<FileNode>;
  renameNode: (id: string, name: string) => Promise<void>;
  deleteNode: (id: string) => Promise<void>;
  updateContent: (id: string, content: string) => Promise<void>;
  toggleShareWithAI: (id: string) => Promise<void>;
  updateAINotes: (id: string, notes: string) => Promise<void>;
  getChildren: (parentId: string | null) => FileNode[];
  getPath: (id: string) => FileNode[];
  refresh: () => Promise<void>;
}

const FilesStoreContext = createContext<FilesStore | null>(null);

function mapEntry(entry: Record<string, unknown>): FileNode {
  return {
    id: entry.id as string,
    name: entry.name as string,
    type: entry.type as FileNodeType,
    content: (entry.content as string) || "",
    parentId: (entry.parentId as string) || null,
    createdAt: entry.createdAt as string,
    updatedAt: entry.updatedAt as string,
    children: Array.isArray(entry.children)
      ? (entry.children as Record<string, unknown>[]).map(
          (c) => c.id as string
        )
      : [],
    sharedWithAI: (entry.sharedWithAI as boolean) || false,
    aiNotes: (entry.aiNotes as string) || "",
  };
}

function toNodeMap(
  entries: Record<string, unknown>[]
): Record<string, FileNode> {
  const map: Record<string, FileNode> = {};
  for (const entry of entries) {
    const node = mapEntry(entry);
    map[node.id] = node;
  }
  return map;
}

export function FilesStoreProvider({ children }: { children: ReactNode }) {
  const [nodes, setNodes] = useState<Record<string, FileNode>>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set()
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/files");
        const json = await res.json();
        if (json.success) {
          setNodes(toNodeMap(json.data));
        }
      } catch (err) {
        console.error("Failed to fetch files:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/files");
      const json = await res.json();
      if (json.success) setNodes(toNodeMap(json.data));
    } catch (err) {
      console.error("Failed to fetch files:", err);
    }
  }, []);

  const toggleFolder = useCallback((id: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const createNode = useCallback(
    async (
      type: FileNodeType,
      name: string,
      parentId: string | null,
      content?: string
    ): Promise<FileNode> => {
      const res = await fetch("/api/files", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, type, parentId, content }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);

      const entry = json.data as Record<string, unknown>;
      const node = mapEntry(entry);

      setNodes((prev) => {
        const next = { ...prev, [node.id]: node };
        if (parentId && next[parentId]) {
          next[parentId] = {
            ...next[parentId],
            children: [...(next[parentId].children || []), node.id],
            updatedAt: node.updatedAt,
          };
        }
        return next;
      });

      if (type === "folder") {
        setExpandedFolders((prev) => new Set([...prev, node.id]));
      }

      return node;
    },
    []
  );

  const renameNode = useCallback(async (id: string, name: string) => {
    const res = await fetch(`/api/files/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error);

    const entry = json.data as Record<string, unknown>;
    const updated = mapEntry(entry);

    setNodes((prev) => ({ ...prev, [id]: updated }));
  }, []);

  const deleteNode = useCallback(
    async (id: string) => {
      const res = await fetch(`/api/files/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);

      setNodes((prev) => {
        const node = prev[id];
        if (!node) return prev;
        const next = { ...prev };

        const removeRecursive = (nodeId: string) => {
          const n = next[nodeId];
          if (n?.children) {
            n.children.forEach(removeRecursive);
          }
          delete next[nodeId];
        };

        removeRecursive(id);

        if (node.parentId && next[node.parentId]) {
          next[node.parentId] = {
            ...next[node.parentId],
            children: (next[node.parentId].children || []).filter(
              (c) => c !== id
            ),
            updatedAt: new Date().toISOString(),
          };
        }

        return next;
      });

      setSelectedId((prev) => (prev === id ? null : prev));
    },
    []
  );

  const updateContent = useCallback(async (id: string, content: string) => {
    const res = await fetch(`/api/files/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error);

    const entry = json.data as Record<string, unknown>;
    const updated = mapEntry(entry);

    setNodes((prev) => ({ ...prev, [id]: updated }));
  }, []);

  const toggleShareWithAI = useCallback(async (id: string) => {
    const current = nodes[id];
    if (!current) return;

    const res = await fetch(`/api/files/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sharedWithAI: !current.sharedWithAI }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error);

    const entry = json.data as Record<string, unknown>;
    const updated = mapEntry(entry);

    setNodes((prev) => ({ ...prev, [id]: updated }));
  }, [nodes]);

  const updateAINotes = useCallback(async (id: string, notes: string) => {
    const res = await fetch(`/api/files/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ aiNotes: notes }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error);

    const entry = json.data as Record<string, unknown>;
    const updated = mapEntry(entry);

    setNodes((prev) => ({ ...prev, [id]: updated }));
  }, []);

  const getChildren = useCallback(
    (parentId: string | null): FileNode[] => {
      return Object.values(nodes).filter((n) => n.parentId === parentId);
    },
    [nodes]
  );

  const getPath = useCallback(
    (id: string): FileNode[] => {
      const path: FileNode[] = [];
      let current = nodes[id];
      while (current) {
        path.unshift(current);
        current = current.parentId
          ? nodes[current.parentId]
          : (undefined as unknown as FileNode);
      }
      return path;
    },
    [nodes]
  );

  return (
    <FilesStoreContext.Provider
      value={{
        nodes,
        selectedId,
        expandedFolders,
        loading,
        setSelectedId,
        toggleFolder,
        createNode,
        renameNode,
        deleteNode,
        updateContent,
        toggleShareWithAI,
        updateAINotes,
        getChildren,
        getPath,
        refresh,
      }}
    >
      {children}
    </FilesStoreContext.Provider>
  );
}

export function useFilesStore(): FilesStore {
  const ctx = useContext(FilesStoreContext);
  if (!ctx) throw new Error("useFilesStore must be used within FilesStoreProvider");
  return ctx;
}
