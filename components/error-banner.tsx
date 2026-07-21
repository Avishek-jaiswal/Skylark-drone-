"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, X, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorBannerProps {
  error: string | null;
  onDismiss: () => void;
  onRetry?: () => void;
}

export function ErrorBanner({ error, onDismiss, onRetry }: ErrorBannerProps) {
  return (
    <AnimatePresence>
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -6, height: 0 }}
          animate={{ opacity: 1, y: 0, height: "auto" }}
          exit={{ opacity: 0, y: -6, height: 0 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden shrink-0"
        >
          <div className="mx-4 mt-3 flex items-start gap-3 rounded-2xl border border-destructive/15 bg-destructive/[0.04] px-4 py-3.5">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive/60" />
            <p className="flex-1 text-sm text-destructive/75 leading-relaxed min-w-0">
              {error}
            </p>
            <div className="flex items-center gap-0.5 shrink-0">
              {onRetry && (
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={onRetry}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={onDismiss}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
