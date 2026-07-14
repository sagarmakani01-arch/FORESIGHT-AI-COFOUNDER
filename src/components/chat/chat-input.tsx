"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Paperclip, Mic, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import QuickActions from "./quick-actions";

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
}

export default function ChatInput({ onSend, isLoading }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [message]);

  const handleSubmit = () => {
    if (message.trim() && !isLoading) {
      onSend(message.trim());
      setMessage("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleQuickAction = (prompt: string) => {
    setMessage(prompt);
    setTimeout(() => textareaRef.current?.focus(), 0);
  };

  return (
    <div className="space-y-3">
      <QuickActions onSelect={handleQuickAction} />

      <div className="bg-surface thin-border rounded-2xl p-2">
        <div className="flex items-end gap-2">
          <button className="flex-shrink-0 p-2 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors duration-200">
            <Paperclip className="w-5 h-5" />
          </button>

          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask your AI Co-Founder..."
            rows={1}
            className={cn(
              "flex-1 resize-none bg-transparent border-0 outline-none",
              "text-on-surface placeholder:text-muted-foreground",
              "py-2 px-1 text-sm leading-relaxed",
              "max-h-[120px]"
            )}
          />

          <button
            className={cn(
              "flex-shrink-0 p-2 rounded-xl transition-all duration-200",
              message.trim() && !isLoading
                ? "bg-primary text-white"
                : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
            )}
            onClick={handleSubmit}
            disabled={!message.trim() || isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>

          <button className="flex-shrink-0 p-2 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors duration-200">
            <Mic className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
