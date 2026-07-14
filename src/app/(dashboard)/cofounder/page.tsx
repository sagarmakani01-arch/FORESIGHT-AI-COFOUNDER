"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, MessageSquare, Clock, MoreVertical, Sparkles } from "lucide-react";
import { cn, generateId } from "@/lib/utils";
import MessageBubble from "@/components/chat/message-bubble";
import ReasoningDisplay from "@/components/chat/reasoning-display";
import ChatInput from "@/components/chat/chat-input";

interface Conversation {
  id: string;
  title: string;
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

const sampleConversations: Conversation[] = [
  {
    id: "1",
    title: "Market Analysis for NexusPay",
    preview: "Based on my research, the fintech market is projected to reach...",
    timestamp: "2 hours ago",
    messages: [],
  },
  {
    id: "2",
    title: "Competitor Intelligence Report",
    preview: "After analyzing your top 6 competitors, I've identified...",
    timestamp: "Yesterday",
    messages: [],
  },
  {
    id: "3",
    title: "Financial Model - Year 1 Projections",
    preview: "Here's a breakdown of your projected revenue streams...",
    timestamp: "3 days ago",
    messages: [],
  },
  {
    id: "4",
    title: "Pitch Deck Strategy",
    preview: "For Series A, I recommend structuring your deck around...",
    timestamp: "1 week ago",
    messages: [],
  },
  {
    id: "5",
    title: "Product Roadmap Q3-Q4",
    preview: "Let's prioritize features based on market demand and...",
    timestamp: "2 weeks ago",
    messages: [],
  },
];

export default function CoFounderPage() {
  const [conversations, setConversations] = useState<Conversation[]>(sampleConversations);
  const [activeConversationId, setActiveConversationId] = useState<string>("1");
  const [isGenerating, setIsGenerating] = useState(false);
  const [reasoningSteps, setReasoningSteps] = useState<ReasoningStep[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConversation = conversations.find((c) => c.id === activeConversationId);
  const messages = activeConversation?.messages || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, reasoningSteps]);

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
    if (!activeConversation || isGenerating) return;

    const userMessage: Message = {
      id: generateId(),
      role: "user",
      content,
      timestamp: new Date().toISOString(),
    };

    const updatedConversation = {
      ...activeConversation,
      messages: [...activeConversation.messages, userMessage],
    };

    setConversations(conversations.map((c) => (c.id === activeConversationId ? updatedConversation : c)));
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
      let accumulated = "";

      const aiMessage: Message = {
        id: generateId(),
        role: "assistant",
        content: "",
        timestamp: new Date().toISOString(),
      };

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
                aiMessage.content = accumulated;

                setConversations((prev) =>
                  prev.map((c) =>
                    c.id === activeConversationId
                      ? {
                          ...c,
                          messages: [
                            ...c.messages.filter((m) => m.id !== aiMessage.id),
                            { ...aiMessage },
                          ],
                        }
                      : c
                  )
                );
              }
            } catch {
              // skip malformed
            }
          } else if (line.trim() && !line.startsWith("data:")) {
            accumulated += line;
            aiMessage.content = accumulated;

            setConversations((prev) =>
              prev.map((c) =>
                c.id === activeConversationId
                  ? {
                      ...c,
                      messages: [
                        ...c.messages.filter((m) => m.id !== aiMessage.id),
                        { ...aiMessage },
                      ],
                    }
                  : c
              )
            );
          }
        }
      }

      const finalSteps = await reasoningPromise;

      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConversationId
            ? {
                ...c,
                messages: c.messages.map((m) =>
                  m.id === aiMessage.id ? { ...m, reasoningSteps: finalSteps } : m
                ),
              }
            : c
        )
      );
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: Message = {
        id: generateId(),
        role: "assistant",
        content: "I'm having trouble connecting to my AI engine. Please make sure Ollama is running locally (`ollama serve`) and try again.",
        timestamp: new Date().toISOString(),
      };

      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConversationId
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
    const newConversation: Conversation = {
      id: generateId(),
      title: "New Conversation",
      preview: "Start a new conversation...",
      timestamp: "Just now",
      messages: [],
    };
    setConversations([newConversation, ...conversations]);
    setActiveConversationId(newConversation.id);
  };

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
          {conversations.map((conv) => (
            <motion.button
              key={conv.id}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => setActiveConversationId(conv.id)}
              className={cn(
                "w-full text-left p-3 rounded-lg transition-all duration-200 relative",
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
              </div>
            </motion.button>
          ))}
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
              <p className="text-xs text-on-surface-variant">Powered by Ollama &middot; Your AI Co-Founder</p>
            </div>
          </div>
          <button className="p-2 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary-container flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-on-surface mb-2">Welcome to GENESIS</h3>
              <p className="text-on-surface-variant max-w-md">
                Your AI Co-Founder is ready to help you build, strategize, and scale
                your business. Ask anything about your market, strategy, or operations.
              </p>
              <div className="mt-6 grid grid-cols-2 gap-2 max-w-md">
                {[
                  "Analyze my market opportunity",
                  "Create a pitch deck outline",
                  "Review my financial model",
                  "Suggest a go-to-market strategy",
                ].map((suggestion) => (
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
