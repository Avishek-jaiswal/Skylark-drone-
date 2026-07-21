"use client";

import { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Message } from "./message";
import { TypingIndicator } from "./typing-indicator";
import { PromptSuggestions } from "./prompt-suggestions";
import { ErrorBanner } from "./error-banner";
import { ChatInput } from "./chat-input";
import { useChat } from "@/hooks/use-chat";
import { ChatMessage } from "@/types";

interface ChatProps {
  onMessagesChange?: (count: number) => void;
}

export function Chat({ onMessagesChange }: ChatProps) {
  const {
    messages,
    isLoading,
    streamingContent,
    error,
    sendMessage,
    stop,
    retry,
    clearError,
  } = useChat();

  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    onMessagesChange?.(messages.length);
  }, [messages.length, onMessagesChange]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  const hasMessages = messages.length > 0;

  return (
    <div className="flex h-full flex-col">
      <ErrorBanner error={error} onDismiss={clearError} onRetry={retry} />

      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {!hasMessages && !isLoading && (
          <PromptSuggestions onSelect={sendMessage} />
        )}

        {hasMessages && (
          <div className="mx-auto max-w-2xl py-2">
            <AnimatePresence mode="popLayout">
              {messages.map((msg: ChatMessage) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Message message={msg} />
                </motion.div>
              ))}
            </AnimatePresence>

            {isLoading && streamingContent && (
              <Message
                message={{
                  id: "streaming",
                  role: "assistant",
                  content: streamingContent,
                  timestamp: 0,
                }}
                isStreaming
              />
            )}

            {isLoading && !streamingContent && <TypingIndicator />}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <ChatInput
        onSend={sendMessage}
        onStop={stop}
        isLoading={isLoading}
      />
    </div>
  );
}
