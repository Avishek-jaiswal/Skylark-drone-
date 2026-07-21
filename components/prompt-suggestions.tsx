"use client";

import { motion } from "framer-motion";
import { TrendingUp, BarChart3, AlertTriangle, Zap, LineChart, Users } from "lucide-react";

interface PromptSuggestionsProps {
  onSelect: (prompt: string) => void;
}

const SUGGESTIONS = [
  {
    title: "Pipeline Health",
    prompt: "How is our pipeline?",
    description: "Deals by stage, win rate, and closing trends",
    icon: BarChart3,
  },
  {
    title: "Revenue Analysis",
    prompt: "Show revenue by sector",
    description: "Breakdown of revenue across sectors",
    icon: TrendingUp,
  },
  {
    title: "Operations Check",
    prompt: "Which projects are delayed?",
    description: "Delayed and at-risk work orders",
    icon: AlertTriangle,
  },
  {
    title: "Energy Sector",
    prompt: "How are energy deals performing?",
    description: "Energy sector pipeline and operations",
    icon: Zap,
  },
  {
    title: "Leadership Update",
    prompt: "Give me a leadership update",
    description: "Executive summary of key metrics",
    icon: LineChart,
  },
  {
    title: "Customer Insights",
    prompt: "Which customers have deals but no work orders?",
    description: "Cross-board customer analysis",
    icon: Users,
  },
];

export function PromptSuggestions({ onSelect }: PromptSuggestionsProps) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="text-center mb-12"
      >
        <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/10">
          <span className="text-xl font-bold text-primary tracking-tighter">S</span>
        </div>
        <h1 className="text-[22px] font-semibold tracking-tight text-foreground mb-2.5">
          SkyLark
        </h1>
        <p className="text-muted-foreground text-[15px] max-w-md leading-relaxed">
          Your Business Intelligence analyst. Ask questions about revenue, pipeline, and operations in natural language.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 w-full max-w-2xl"
      >
        {SUGGESTIONS.map((suggestion, index) => {
          const Icon = suggestion.icon;
          return (
            <motion.button
              key={suggestion.title}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.2 + index * 0.05, ease: [0.22, 1, 0.36, 1] }}
              onClick={() => onSelect(suggestion.prompt)}
              className="group flex flex-col items-start gap-2 rounded-2xl border border-border/40 bg-card px-4 py-4 text-left transition-all duration-200 hover:border-primary/20 hover:bg-accent/40 hover:shadow-sm active:scale-[0.985]"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/[0.07] transition-colors duration-200 group-hover:bg-primary/[0.12]">
                <Icon className="h-4 w-4 text-primary/60 transition-colors group-hover:text-primary/80" />
              </div>
              <span className="text-sm font-medium text-foreground">
                {suggestion.title}
              </span>
              <span className="text-[12px] text-muted-foreground/70 leading-relaxed">
                {suggestion.description}
              </span>
            </motion.button>
          );
        })}
      </motion.div>
    </div>
  );
}
