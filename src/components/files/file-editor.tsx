"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useFilesStore } from "@/lib/files-store";
import {
  Save,
  Brain,
  ChevronRight,
  FileText,
  Clock,
  CheckCircle2,
  Circle,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function FileEditor() {
  const { nodes, selectedId, updateContent, toggleShareWithAI, getPath } = useFilesStore();
  const [localContent, setLocalContent] = useState("");
  const [showAI, setShowAI] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiMessages, setAiMessages] = useState<{ role: "user" | "ai"; content: string }[]>([]);

  const node = selectedId ? nodes[selectedId] : null;
  const isFile = node?.type === "file";
  const path = selectedId ? getPath(selectedId) : [];
  const isSaved = isFile && node ? localContent === (node.content || "") : true;
  const prevNodeRef = useRef(node);

  useEffect(() => {
    const prevNode = prevNodeRef.current;
    if (node?.type === "file" && node !== prevNode) {
      setLocalContent(node.content || "");
    }
    prevNodeRef.current = node;
  }, [node]);

  const handleSave = useCallback(async () => {
    if (selectedId && isFile) {
      await updateContent(selectedId, localContent);
    }
  }, [selectedId, isFile, localContent, updateContent]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSave]);

  const handleAskAI = async (overridePrompt?: string) => {
    const prompt = overridePrompt || aiPrompt.trim();
    if (!prompt || !node) return;

    const userMsg = prompt;
    setAiMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setAiPrompt("");

    const docContext = node.sharedWithAI && localContent
      ? `\n\n## Document Content ("${node.name}")\n\n${localContent.substring(0, 3000)}`
      : "";

    const systemMsg = `You are GENESIS AI, an expert document assistant. Help the user with their document "${node.name}". Be concise and actionable. Use markdown formatting.${docContext}`;

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            { role: "system", content: systemMsg },
            { role: "user", content: userMsg },
          ],
        }),
      });

      if (!response.ok) throw new Error(`AI request failed: ${response.status}`);

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response stream");

      const decoder = new TextDecoder();
      let accumulated = "";

      setAiMessages((prev) => [...prev, { role: "ai", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.content) {
                accumulated += data.content;
                setAiMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = { role: "ai", content: accumulated };
                  return updated;
                });
              }
            } catch { /* skip */ }
          } else if (line.trim() && !line.startsWith("data:")) {
            accumulated += line;
            setAiMessages((prev) => {
              const updated = [...prev];
              updated[updated.length - 1] = { role: "ai", content: accumulated };
              return updated;
            });
          }
        }
      }

      if (!accumulated) {
        setAiMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: "ai",
            content: "I couldn't generate a response. Please check your AI provider settings and try again.",
          };
          return updated;
        });
      }
    } catch {
      setAiMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "ai",
          content: "Failed to reach the AI engine. Please check your AI provider settings.",
        };
        return updated;
      });
    }
  };

  if (!selectedId || !node) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-on-surface-variant">
        <FileText className="mb-4 h-12 w-12 opacity-30" />
        <p className="text-lg font-medium">Select a file to edit</p>
        <p className="text-sm mt-1">Or create a new file from the sidebar</p>
      </div>
    );
  }

  if (!isFile) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-on-surface-variant">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-container">
          <span className="text-2xl">📁</span>
        </div>
        <p className="text-lg font-medium">{node.name}</p>
        <p className="text-sm mt-1">This is a folder. Select a file to edit.</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-outline-variant px-4 py-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex items-center gap-1 text-xs text-on-surface-variant">
            {path.map((p, i) => (
              <span key={p.id} className="flex items-center gap-1">
                {i > 0 && <ChevronRight className="h-3 w-3" />}
                <span className="truncate max-w-[120px]">{p.name}</span>
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {node.updatedAt && (
            <span className="flex items-center gap-1 text-xs text-on-surface-variant">
              <Clock className="h-3 w-3" />
              {new Date(node.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
          <button
            onClick={() => toggleShareWithAI(selectedId)}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
              node.sharedWithAI
                ? "bg-primary-container text-primary"
                : "bg-surface-container text-on-surface-variant hover:bg-surface-container-low"
            )}
          >
            <Brain className="h-3.5 w-3.5" />
            {node.sharedWithAI ? "Shared with AI" : "Share with AI"}
          </button>
          <button
            onClick={() => setShowAI(!showAI)}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
              showAI
                ? "bg-primary text-white"
                : "bg-surface-container text-on-surface-variant hover:bg-surface-container-low"
            )}
          >
            <Brain className="h-3.5 w-3.5" />
            AI Assistant
          </button>
          <button
            onClick={handleSave}
            disabled={isSaved}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
              isSaved
                ? "bg-surface-container text-on-surface-variant"
                : "bg-primary text-white hover:bg-primary-hover"
            )}
          >
            {isSaved ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
            {isSaved ? "Saved" : "Save"}
          </button>
        </div>
      </div>

      {/* Content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Editor */}
        <div className="flex-1 overflow-auto">
          <textarea
            value={localContent}
            onChange={(e) => setLocalContent(e.target.value)}
            className="h-full w-full resize-none bg-transparent p-6 font-mono text-sm text-on-surface leading-relaxed outline-none placeholder:text-on-surface-variant/50"
            placeholder="Start writing..."
            spellCheck={false}
          />
        </div>

        {/* AI Sidebar */}
        {showAI && (
          <div className="w-80 border-l border-outline-variant flex flex-col bg-surface-container-low/30">
            <div className="border-b border-outline-variant px-4 py-3">
              <h3 className="text-sm font-semibold text-on-surface flex items-center gap-2">
                <Brain className="h-4 w-4 text-primary" />
                AI Co-Founder
              </h3>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Ask about &quot;{node.name}&quot;
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {aiMessages.length === 0 && (
                <div className="text-center py-8">
                  <Circle className="h-8 w-8 mx-auto text-on-surface-variant/30 mb-2" />
                  <p className="text-xs text-on-surface-variant">
                    Ask me anything about this document
                  </p>
                  <div className="mt-3 space-y-1.5">
                    {["Summarize this", "Suggest improvements", "Add more data"].map((q) => (
                      <button
                        key={q}
                        onClick={() => {
                          setAiPrompt(q);
                          setTimeout(() => handleAskAI(q), 50);
                        }}
                        className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2 text-xs text-on-surface-variant hover:bg-surface-container-low transition-colors"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {aiMessages.map((msg, i) => (
                <div
                  key={i}
                  className={cn(
                    "rounded-xl px-3 py-2.5 text-sm",
                    msg.role === "user"
                      ? "bg-primary text-white ml-8"
                      : "bg-surface thin-border mr-4"
                  )}
                >
                  <div className="whitespace-pre-wrap text-xs leading-relaxed">{msg.content}</div>
                </div>
              ))}
            </div>

            <div className="border-t border-outline-variant p-3">
              <div className="flex items-center gap-2">
                <input
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleAskAI();
                    }
                  }}
                  placeholder="Ask about this file..."
                  className="flex-1 rounded-lg border border-outline-variant bg-surface px-3 py-2 text-sm outline-none focus:border-primary"
                />
                <button
                  onClick={() => handleAskAI()}
                  disabled={!aiPrompt.trim()}
                  className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover disabled:opacity-50"
                >
                  Ask
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
