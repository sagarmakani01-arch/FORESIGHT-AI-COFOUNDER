"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, MessageSquare, Clock, MoreVertical, Sparkles, Trash2 } from "lucide-react";
import { cn, generateId } from "@/lib/utils";
import MessageBubble from "@/components/chat/message-bubble";
import ReasoningDisplay from "@/components/chat/reasoning-display";
import ChatInput from "@/components/chat/chat-input";
import { useCompanyData } from "@/lib/hooks";

interface Conversation {
  id: string;
  title: string | null;
  preview: string;
  timestamp: string;
  messages: Message[];
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  reasoningSteps?: ReasoningStep[];
}

interface ReasoningStep {
  label: string;
  status: "pending" | "active" | "completed" | "error";
  detail?: string;
}

interface ApiConversation {
  id: string;
  title: string | null;
  updatedAt: string;
  messages: { content: string; createdAt: string }[];
}

interface ApiMessage {
  id: string;
  role: "USER" | "ASSISTANT" | "SYSTEM";
  content: string;
  reasoningSteps?: ReasoningStep[];
  createdAt: string;
}

function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export default function CoFounderPage() {
  const { data } = useCompanyData();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [reasoningSteps, setReasoningSteps] = useState<ReasoningStep[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConversation = conversations.find((c) => c.id === activeConversationId);
  const messages = activeConversation?.messages || [];

  const userName = data?.user?.name?.split(" ")[0] ?? "there";
  const companyName = data?.company?.name ?? "your company";

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, reasoningSteps]);

  useEffect(() => {
    async function loadConversations() {
      try {
        const res = await fetch("/api/conversations");
        const json = await res.json();
        if (json.success) {
          const mapped: Conversation[] = json.data.map((c: ApiConversation) => ({
            id: c.id,
            title: c.title || "New Conversation",
            preview: c.messages[0]?.content?.slice(0, 80) || "Start a new conversation...",
            timestamp: formatTimestamp(c.updatedAt),
            messages: [],
          }));
          setConversations(mapped);
        }
      } catch (err) {
        console.error("Failed to load conversations:", err);
      } finally {
        setIsLoadingConversations(false);
      }
    }
    loadConversations();
  }, []);

  const loadMessages = useCallback(async (convId: string) => {
    setIsLoadingMessages(true);
    try {
      const res = await fetch(`/api/conversations/${convId}`);
      const json = await res.json();
      if (json.success) {
        const msgs: Message[] = json.data.messages.map((m: ApiMessage) => ({
          id: m.id,
          role: m.role === "USER" ? "user" : "assistant",
          content: m.content,
          timestamp: m.createdAt,
          reasoningSteps: m.reasoningSteps as ReasoningStep[] | undefined,
        }));
        setConversations((prev) =>
          prev.map((c) => (c.id === convId ? { ...c, messages: msgs } : c))
        );
      }
    } catch (err) {
      console.error("Failed to load messages:", err);
    } finally {
      setIsLoadingMessages(false);
    }
  }, []);

  const handleSelectConversation = (convId: string) => {
    setActiveConversationId(convId);
    const conv = conversations.find((c) => c.id === convId);
    if (conv && conv.messages.length === 0) {
      loadMessages(convId);
    }
  };

  const simulateReasoning = async (): Promise<ReasoningStep[]> => {
    const steps: ReasoningStep[] = [
      { label: "Researching context...", status: "pending" },
      { label: "Analyzing data...", status: "pending" },
      { label: "Synthesizing strategy...", status: "pending" },
      { label: "Generating response...", status: "pending" },
    ];

    setReasoningSteps([...steps]);

    for (let i = 0; i < steps.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 600));
      steps[i].status = "completed";
      if (i + 1 < steps.length) steps[i + 1].status = "active";
      setReasoningSteps([...steps]);
    }

    await new Promise((resolve) => setTimeout(resolve, 300));
    return steps.map((s) => ({ ...s, status: "completed" as const }));
  };

  const handleSend = async (content: string) => {
    if (isGenerating) return;

    let conv = activeConversation;
    let convId = activeConversationId;

    if (!conv || !convId) {
      try {
        const res = await fetch("/api/conversations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: content.length > 30 ? content.slice(0, 30) + "..." : content,
          }),
        });
        const json = await res.json();
        if (!json.success) throw new Error("Failed to create conversation");

        const newConv: Conversation = {
          id: json.data.id,
          title: json.data.title,
          preview: content,
          timestamp: "Just now",
          messages: [],
        };
        setConversations((prev) => [newConv, ...prev]);
        setActiveConversationId(newConv.id);
        conv = newConv;
        convId = newConv.id;
      } catch (err) {
        console.error("Failed to create conversation:", err);
        return;
      }
    }

    const userMessage: Message = {
      id: generateId(),
      role: "user",
      content,
      timestamp: new Date().toISOString(),
    };

    const updatedConversation = {
      ...conv,
      messages: [...conv.messages, userMessage],
    };

    setConversations((prev) =>
      prev.map((c) => (c.id === convId ? updatedConversation : c))
    );
    setIsGenerating(true);

    const reasoningPromise = simulateReasoning();

    try {
      const apiMessages = updatedConversation.messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });

      if (!response.ok) {
        throw new Error(`Chat failed: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response stream");

      const decoder = new TextDecoder();
      const aiMessageId = generateId();
      const aiTimestamp = new Date().toISOString();
      let fullContent = "";

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
                fullContent += data.content;
                setConversations((prev) => {
                  const currentMsg = prev
                    .find((c) => c.id === convId)
                    ?.messages.find((m) => m.id === aiMessageId);
                  const newContent = (currentMsg?.content || "") + data.content;
                  return prev.map((c) =>
                    c.id === convId
                      ? {
                          ...c,
                          messages: [
                            ...c.messages.filter((m) => m.id !== aiMessageId),
                            { id: aiMessageId, role: "assistant", content: newContent, timestamp: aiTimestamp },
                          ],
                        }
                      : c
                  );
                });
              }
            } catch {
              // skip malformed
            }
          } else if (line.trim() && !line.startsWith("data:")) {
            fullContent += line;
            setConversations((prev) => {
              const currentMsg = prev
                .find((c) => c.id === convId)
                ?.messages.find((m) => m.id === aiMessageId);
              const newContent = (currentMsg?.content || "") + line;
              return prev.map((c) =>
                c.id === convId
                  ? {
                      ...c,
                      messages: [
                        ...c.messages.filter((m) => m.id !== aiMessageId),
                        { id: aiMessageId, role: "assistant", content: newContent, timestamp: aiTimestamp },
                      ],
                    }
                  : c
              );
            });
          }
        }
      }

      const finalSteps = await reasoningPromise;

      setConversations((prev) =>
        prev.map((c) =>
          c.id === convId
            ? {
                ...c,
                messages: c.messages.map((m) =>
                  m.id === aiMessageId ? { ...m, reasoningSteps: finalSteps } : m
                ),
              }
            : c
        )
      );

      // Persist user message
      fetch(`/api/conversations/${convId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "USER", content }),
      }).catch((err) => console.error("Failed to save user message:", err));

      // Persist assistant message
      fetch(`/api/conversations/${convId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "ASSISTANT",
          content: fullContent,
          reasoningSteps: finalSteps,
        }),
      }).catch((err) => console.error("Failed to save assistant message:", err));

      // Update preview in sidebar
      setConversations((prev) =>
        prev.map((c) =>
          c.id === convId
            ? { ...c, preview: fullContent.slice(0, 80) || c.preview, timestamp: "Just now" }
            : c
        )
      );
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: Message = {
        id: generateId(),
        role: "assistant",
        content: "I'm having trouble connecting to my AI engine. Please check your provider settings under Settings > Connect Providers and try again.",
        timestamp: new Date().toISOString(),
      };

      setConversations((prev) =>
        prev.map((c) =>
          c.id === convId
            ? { ...c, messages: [...c.messages, errorMessage] }
            : c
        )
      );
    } finally {
      setIsGenerating(false);
      setReasoningSteps([]);
    }
  };

  const handleNewConversation = () => {
    setActiveConversationId(null);
  };

  const handleDeleteConversation = async (convId: string) => {
    try {
      await fetch(`/api/conversations/${convId}`, { method: "DELETE" });
      setConversations((prev) => prev.filter((c) => c.id !== convId));
      if (activeConversationId === convId) {
        setActiveConversationId(null);
      }
    } catch (err) {
      console.error("Failed to delete conversation:", err);
    }
  };

  const suggestions = [
    `Analyze the market opportunity for ${companyName}`,
    "Create a pitch deck outline",
    "Review my financial model",
    "Suggest a go-to-market strategy",
  ];

  return (
    <div className="flex h-[calc(100vh-4rem)] gap-4">
      {/* Conversation History Panel */}
      <div className="w-64 flex-shrink-0 flex flex-col bg-surface thin-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-outline-variant">
          <button
            onClick={handleNewConversation}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-primary text-white hover:bg-primary-dark transition-all duration-200 font-medium text-sm"
          >
            <Plus className="w-4 h-4" />
            New Conversation
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {isLoadingConversations ? (
            <p className="text-xs text-on-surface-variant text-center py-4">Loading...</p>
          ) : conversations.length === 0 ? (
            <p className="text-xs text-on-surface-variant text-center py-4">No conversations yet</p>
          ) : (
            conversations.map((conv) => (
              <motion.button
                key={conv.id}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => handleSelectConversation(conv.id)}
                className={cn(
                  "w-full text-left p-3 rounded-lg transition-all duration-200 relative group",
                  conv.id === activeConversationId
                    ? "bg-primary-container border-l-2 border-primary"
                    : "hover:bg-surface-container-low border-l-2 border-transparent"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center",
                    conv.id === activeConversationId ? "bg-primary/15" : "bg-surface-container"
                  )}>
                    <MessageSquare className={cn("w-4 h-4", conv.id === activeConversationId ? "text-primary" : "text-on-surface-variant")} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-sm font-medium truncate", conv.id === activeConversationId ? "text-on-surface" : "text-on-surface/80")}>
                      {conv.title}
                    </p>
                    <p className="text-xs text-on-surface-variant truncate mt-0.5">{conv.preview}</p>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />{conv.timestamp}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteConversation(conv.id);
                    }}
                    className="flex-shrink-0 p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.button>
            ))
          )}
        </div>
      </div>

      {/* Chat Panel */}
      <div className="flex-1 flex flex-col bg-surface thin-border rounded-xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-outline-variant">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-on-surface">GENESIS AI</h2>
              <p className="text-xs text-on-surface-variant">Your AI Co-Founder</p>
            </div>
          </div>
          <button className="p-2 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 && !isLoadingMessages ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary-container flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-on-surface mb-2">Welcome to GENESIS{userName !== "there" ? `, ${userName}` : ""}</h3>
              <p className="text-on-surface-variant max-w-md">
                Your AI Co-Founder is ready to help you build, strategize, and scale
                your business. Ask anything about your market, strategy, or operations.
              </p>
              <div className="mt-6 grid grid-cols-2 gap-2 max-w-md">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => handleSend(suggestion)}
                    className="rounded-xl border border-outline-variant bg-surface px-3 py-2 text-xs text-on-surface-variant hover:bg-surface-container-low transition-colors text-left"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : isLoadingMessages ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-on-surface-variant text-sm">Loading messages...</div>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
              <AnimatePresence>
                {isGenerating && reasoningSteps.length > 0 && (
                  <ReasoningDisplay steps={reasoningSteps} />
                )}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        <div className="p-4 border-t border-outline-variant">
          <ChatInput onSend={handleSend} isLoading={isGenerating} />
        </div>
      </div>
    </div>
  );
}
