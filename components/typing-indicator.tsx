"use client";

export function TypingIndicator() {
  return (
    <div className="flex w-full justify-start py-3 px-4">
      <div className="max-w-[90%] sm:max-w-[80%] w-64">
        <div className="rounded-3xl rounded-bl-xl bg-muted/60 px-5 py-4 overflow-hidden relative">
          <div className="flex flex-col gap-2.5">
            <div className="h-3 w-full rounded-full bg-foreground/[0.06] relative overflow-hidden">
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-foreground/[0.08] to-transparent" />
            </div>
            <div className="h-3 w-4/5 rounded-full bg-foreground/[0.06] relative overflow-hidden">
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-foreground/[0.08] to-transparent" style={{ animationDelay: "0.2s" }} />
            </div>
            <div className="h-3 w-3/5 rounded-full bg-foreground/[0.06] relative overflow-hidden">
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-foreground/[0.08] to-transparent" style={{ animationDelay: "0.4s" }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
