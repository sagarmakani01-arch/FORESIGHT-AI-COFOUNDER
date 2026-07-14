"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

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
  setSelectedId: (id: string | null) => void;
  toggleFolder: (id: string) => void;
  createNode: (type: FileNodeType, name: string, parentId: string | null) => FileNode;
  renameNode: (id: string, name: string) => void;
  deleteNode: (id: string) => void;
  updateContent: (id: string, content: string) => void;
  toggleShareWithAI: (id: string) => void;
  updateAINotes: (id: string, notes: string) => void;
  getChildren: (parentId: string | null) => FileNode[];
  getPath: (id: string) => FileNode[];
}

const FilesStoreContext = createContext<FilesStore | null>(null);

function uid(): string {
  return `f_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

const initialNodes: Record<string, FileNode> = {
  "root-strategy": {
    id: "root-strategy",
    name: "Strategy",
    type: "folder",
    parentId: null,
    createdAt: "2026-07-01T10:00:00Z",
    updatedAt: "2026-07-01T10:00:00Z",
    children: ["doc-growth", "doc-pitch"],
  },
  "root-product": {
    id: "root-product",
    name: "Product",
    type: "folder",
    parentId: null,
    createdAt: "2026-07-01T10:00:00Z",
    updatedAt: "2026-07-01T10:00:00Z",
    children: ["doc-prd", "folder-ux"],
  },
  "root-finance": {
    id: "root-finance",
    name: "Finance",
    type: "folder",
    parentId: null,
    createdAt: "2026-07-01T10:00:00Z",
    updatedAt: "2026-07-01T10:00:00Z",
    children: ["doc-financial-model"],
  },
  "folder-ux": {
    id: "folder-ux",
    name: "UX Research",
    type: "folder",
    parentId: "root-product",
    createdAt: "2026-07-05T10:00:00Z",
    updatedAt: "2026-07-05T10:00:00Z",
    children: [],
  },
  "doc-growth": {
    id: "doc-growth",
    name: "Growth Strategy Q3.md",
    type: "file",
    parentId: "root-strategy",
    content: `# Growth Strategy Q3 2026

## Executive Summary
NexusPay is targeting 50,000 active users by EOY 2026 through a multi-channel growth approach.

## Key Initiatives

### 1. Merchant Acquisition
- Target: 5,000 new merchants
- Strategy: Partner with POS system providers
- Budget: $120,000

### 2. User Referral Program
- Incentive: $5 credit for referrer and referee
- Projected impact: 15,000 new users
- Cost per acquisition: $10

### 3. Content Marketing
- Weekly fintech insights newsletter
- Monthly case studies with merchants
- Social media presence on LinkedIn & Twitter

## KPIs
| Metric | Current | Target |
|--------|---------|--------|
| MAU | 18,240 | 50,000 |
| Merchants | 2,412 | 7,500 |
| MRR | $88,700 | $200,000 |
| NPS | 72 | 80 |

## Budget Allocation
- Digital Marketing: $80,000
- Partnerships: $40,000
- Content: $20,000
`,
    createdAt: "2026-07-10T10:00:00Z",
    updatedAt: "2026-07-14T08:30:00Z",
    sharedWithAI: true,
    aiNotes: "AI has reviewed this document and suggests focusing more on merchant acquisition timelines.",
  },
  "doc-pitch": {
    id: "doc-pitch",
    name: "Investor Pitch Deck.md",
    type: "file",
    parentId: "root-strategy",
    content: `# NexusPay — Investor Pitch Deck

## Slide 1: The Problem
60% of SMBs in emerging markets lack access to digital payment infrastructure.

## Slide 2: Our Solution
NexusPay provides a mobile-first payment platform with AI-powered credit scoring.

## Slide 3: Market Size
- TAM: $240B (Digital payments in emerging markets)
- SAM: $48B (SMB payment infrastructure)
- SOM: $2.4B (India SMB segment)

## Slide 4: Traction
- 18,240 active users
- $88,700 MRR (32% MoM growth)
- 2,412 merchants
- 91.4% credit scoring accuracy

## Slide 5: Business Model
- Transaction fees: 1.5%
- Premium subscriptions: $29/mo
- Credit scoring API: $0.10/query

## Slide 6: Team
- Sagar Makani — CEO, Ex-PayPal
- Priya Mehta — CTO, Ex-Google
`,
    createdAt: "2026-07-12T10:00:00Z",
    updatedAt: "2026-07-14T09:15:00Z",
    sharedWithAI: true,
  },
  "doc-prd": {
    id: "doc-prd",
    name: "Product Requirements Doc.md",
    type: "file",
    parentId: "root-product",
    content: `# PRD: Biometric Authentication

## Overview
Implement biometric authentication (fingerprint + face recognition) for the NexusPay mobile app.

## User Story
As a NexusPay user, I want to authenticate using my fingerprint so I can access my account quickly and securely.

## Acceptance Criteria
1. Users can enroll biometric data during onboarding
2. Login supports fingerprint authentication
3. Transaction authorization via biometric
4. Fallback to PIN if biometric fails
5. Biometric data stored in device secure enclave only

## Technical Requirements
- iOS: Face ID + Touch ID via LocalAuthentication framework
- Android: BiometricPrompt API
- Backend: Biometric template hash verification

## Priority: P0 (Critical)
## Target Release: v2.1
## Timeline: 6 weeks
`,
    createdAt: "2026-07-08T10:00:00Z",
    updatedAt: "2026-07-13T14:00:00Z",
    sharedWithAI: false,
  },
  "doc-financial-model": {
    id: "doc-financial-model",
    name: "Financial Model.md",
    type: "file",
    parentId: "root-finance",
    content: `# Financial Model — NexusPay 2026-2027

## Revenue Projections

### Q3 2026
- Transaction Revenue: $132,000
- Subscription Revenue: $48,000
- API Revenue: $12,000
- **Total: $192,000**

### Q4 2026
- Transaction Revenue: $210,000
- Subscription Revenue: $78,000
- API Revenue: $22,000
- **Total: $310,000**

### Q1 2027
- Transaction Revenue: $340,000
- Subscription Revenue: $120,000
- API Revenue: $40,000
- **Total: $500,000**

## Expense Breakdown
| Category | Monthly | Annual |
|----------|---------|--------|
| Salaries | $95,000 | $1,140,000 |
| Infrastructure | $12,000 | $144,000 |
| Marketing | $25,000 | $300,000 |
| Operations | $10,000 | $120,000 |
| **Total** | **$142,000** | **$1,704,000** |

## Funding Requirements
- Current Runway: 14 months
- Series A Target: $5M
- Use of Funds: 60% Product, 25% Growth, 15% Ops
`,
    createdAt: "2026-07-06T10:00:00Z",
    updatedAt: "2026-07-14T07:00:00Z",
    sharedWithAI: true,
    aiNotes: "AI建议增加敏感性分析和场景规划部分。",
  },
};

export function FilesStoreProvider({ children }: { children: ReactNode }) {
  const [nodes, setNodes] = useState<Record<string, FileNode>>(initialNodes);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set(["root-strategy", "root-product", "root-finance"])
  );

  const toggleFolder = useCallback((id: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const createNode = useCallback(
    (type: FileNodeType, name: string, parentId: string | null): FileNode => {
      const id = uid();
      const now = new Date().toISOString();
      const newNode: FileNode = {
        id,
        name,
        type,
        parentId,
        createdAt: now,
        updatedAt: now,
        content: type === "file" ? "" : undefined,
        children: type === "folder" ? [] : undefined,
      };

      setNodes((prev) => {
        const next = { ...prev, [id]: newNode };
        if (parentId && next[parentId]) {
          next[parentId] = {
            ...next[parentId],
            children: [...(next[parentId].children || []), id],
            updatedAt: now,
          };
        }
        return next;
      });

      if (type === "folder") {
        setExpandedFolders((prev) => new Set([...prev, id]));
      }

      return newNode;
    },
    []
  );

  const renameNode = useCallback((id: string, name: string) => {
    setNodes((prev) => ({
      ...prev,
      [id]: { ...prev[id], name, updatedAt: new Date().toISOString() },
    }));
  }, []);

  const deleteNode = useCallback(
    (id: string) => {
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
            children: (next[node.parentId].children || []).filter((c) => c !== id),
            updatedAt: new Date().toISOString(),
          };
        }

        return next;
      });

      setSelectedId((prev) => (prev === id ? null : prev));
    },
    []
  );

  const updateContent = useCallback((id: string, content: string) => {
    setNodes((prev) => ({
      ...prev,
      [id]: { ...prev[id], content, updatedAt: new Date().toISOString() },
    }));
  }, []);

  const toggleShareWithAI = useCallback((id: string) => {
    setNodes((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        sharedWithAI: !prev[id].sharedWithAI,
        updatedAt: new Date().toISOString(),
      },
    }));
  }, []);

  const updateAINotes = useCallback((id: string, notes: string) => {
    setNodes((prev) => ({
      ...prev,
      [id]: { ...prev[id], aiNotes: notes, updatedAt: new Date().toISOString() },
    }));
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
        current = current.parentId ? nodes[current.parentId] : (undefined as unknown as FileNode);
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
