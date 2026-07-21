"use client";

import { useRef, useEffect, KeyboardEvent, useState } from "react";
import { ArrowUp, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (message: string) => void;
  onStop?: () => void;
  isLoading: boolean;
  disabled?: boolean;
}

export function ChatInput({ onSend, onStop, isLoading, disabled }: ChatInputProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!isLoading && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isLoading]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading || disabled) return;
    onSend(trimmed);
    setInput("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  };

  return (
    <div className="sticky bottom-0 z-10 bg-gradient-to-t from-background via-background to-transparent pb-5 pt-8">
      <div className="mx-auto max-w-2xl px-4">
        <div
          className={cn(
            "relative flex items-end gap-2 rounded-2xl border bg-card px-4 py-2.5 transition-all duration-200",
            "border-border/60 shadow-sm",
            "focus-within:border-primary/25 focus-within:shadow-md focus-within:ring-1 focus-within:ring-primary/10",
          )}
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Ask about revenue, pipeline, or operations..."
            rows={1}
            disabled={disabled}
            className={cn(
              "flex-1 resize-none border-0 bg-transparent py-1.5 text-[15px] leading-relaxed",
              "placeholder:text-muted-foreground/40",
              "focus-visible:outline-none focus-visible:ring-0",
              "disabled:cursor-not-allowed disabled:opacity-40",
              "min-h-[24px] max-h-[160px]",
            )}
          />

          <div className="flex items-center gap-1 shrink-0 self-end pb-0.5">
            {isLoading ? (
              <Button
                variant="outline"
                size="icon-sm"
                onClick={onStop}
                className="rounded-xl border-border/50"
                title="Stop generating"
              >
                <Square className="h-3 w-3 fill-current" />
              </Button>
            ) : (
              <Button
                variant={input.trim() ? "default" : "secondary"}
                size="icon-sm"
                onClick={handleSend}
                disabled={!input.trim() || disabled}
                className={cn(
                  "rounded-xl transition-all duration-200",
                  input.trim()
                    ? "bg-primary hover:bg-primary/90"
                    : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                )}
                title="Send message"
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <p className="mt-2.5 text-center text-[11px] text-muted-foreground/35 leading-relaxed">
          SkyLark may produce occasional inaccuracies. Verify critical business data independently.
        </p>
      </div>
    </div>
  );
}
