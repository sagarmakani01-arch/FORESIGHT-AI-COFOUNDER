"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Copy, Bot, User } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderContent = (content: string) => {
    const lines = content.split("\n");
    const elements: React.ReactNode[] = [];

    lines.forEach((line, index) => {
      if (line.startsWith("### ")) {
        elements.push(
          <h3 key={index} className="text-base font-bold text-on-surface mt-4 mb-2">
            {line.slice(4)}
          </h3>
        );
      } else if (line.startsWith("## ")) {
        elements.push(
          <h2 key={index} className="text-lg font-bold text-on-surface mt-4 mb-2">
            {line.slice(3)}
          </h2>
        );
      } else if (line.startsWith("# ")) {
        elements.push(
          <h1 key={index} className="text-xl font-bold text-on-surface mt-4 mb-2">
            {line.slice(2)}
          </h1>
        );
      } else if (line.startsWith("- ") || line.startsWith("* ")) {
        elements.push(
          <li key={index} className="ml-4 text-on-surface/90 list-disc">
            {line.slice(2)}
          </li>
        );
      } else if (line.match(/^\d+\.\s/)) {
        elements.push(
          <li key={index} className="ml-4 text-on-surface/90 list-decimal">
            {line.replace(/^\d+\.\s/, "")}
          </li>
        );
      } else if (line.startsWith("> ")) {
        elements.push(
          <blockquote key={index} className="pl-4 border-l-2 border-primary text-on-surface/80 italic my-2">
            {line.slice(2)}
          </blockquote>
        );
      } else if (line.trim() === "") {
        elements.push(<div key={index} className="h-2" />);
      } else {
        const formatted = line.replace(
          /\*\*(.*?)\*\*/g,
          '<strong class="text-on-surface font-semibold">$1</strong>'
        );
        elements.push(
          <p
            key={index}
            className="text-on-surface/90 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: formatted }}
          />
        );
      }
    });

    return elements;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn("flex gap-3 group", isUser ? "flex-row-reverse" : "flex-row")}
    >
      <div
        className={cn(
          "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
          isUser
            ? "bg-primary text-white"
            : "bg-primary-container text-primary"
        )}
      >
        {isUser ? (
          <User className="w-4 h-4" />
        ) : (
          <Bot className="w-4 h-4" />
        )}
      </div>

      <div className={cn("flex flex-col max-w-[70%]", isUser ? "items-end" : "items-start")}>
        <div
          className={cn(
            "px-4 py-3 rounded-2xl",
            isUser
              ? "bg-primary text-white rounded-br-md"
              : "bg-surface thin-border text-on-surface rounded-bl-md"
          )}
        >
          <div className="space-y-1">{renderContent(message.content)}</div>
        </div>

        <div className={cn("flex items-center gap-2 mt-1", isUser ? "flex-row-reverse" : "flex-row")}>
          <span className="text-xs text-on-surface-variant">{formatDate(message.timestamp)}</span>
          <button
            onClick={handleCopy}
            className={cn(
              "opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-surface-container",
              "text-on-surface-variant hover:text-on-surface"
            )}
          >
            {copied ? <Check className="w-3 h-3 text-primary" /> : <Copy className="w-3 h-3" />}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
