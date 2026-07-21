import { streamAIResponse } from "@/lib/ai";
import { fetchBusinessContext } from "@/lib/monday";
import { normalizeDeals, normalizeWorkOrders, detectDataQualityIssues } from "@/lib/normalize";
import {
  generateBusinessSummary,
  formatDealsCompact,
  formatWorkOrdersCompact,
  formatCurrencyCompact,
} from "@/lib/business";
import {
  SYSTEM_PROMPT,
  buildBusinessAnalystPrompt,
  buildLeadershipPrompt,
  buildClarificationPrompt,
} from "@/lib/prompts";
import { ChatMessage } from "@/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const LEADERSHIP_KEYWORDS = [
  "update",
  "summary",
  "overview",
  "how are we doing",
  "how is the business",
  "executive summary",
  "leadership",
  "board meeting",
  "state of the business",
];

const GREETING_KEYWORDS = [
  "hello", "hi", "hey", "who are you", "what can you do",
  "help", "what do you do", "how are you", "good morning",
  "good afternoon", "good evening", "thanks", "thank you",
];

function isGreeting(question: string): boolean {
  const q = question.toLowerCase().trim();
  return GREETING_KEYWORDS.some((kw) => q.includes(kw));
}

function isLeadershipRequest(question: string): boolean {
  const q = question.toLowerCase().trim();
  return LEADERSHIP_KEYWORDS.some((kw) => q.includes(kw));
}

function needsClarification(question: string): boolean {
  const q = question.toLowerCase().trim();

  if (isGreeting(q)) return false;

  if (q.length < 8) return true;

  const specificTerms = [
    "revenue",
    "sales",
    "pipeline",
    "deal",
    "deals",
    "sector",
    "customer",
    "work order",
    "operations",
    "delayed",
    "completed",
    "pending",
    "stage",
    "win rate",
    "closing",
    "energy",
    "manufacturing",
    "q1",
    "q2",
    "q3",
    "q4",
    "this month",
    "this quarter",
    "this year",
    "worried",
    "worrying",
    "concern",
    "compare",
    "performance",
    "largest",
    "average",
    "backlog",
  ];

  const hasSpecificTerm = specificTerms.some((term) => q.includes(term));
  if (hasSpecificTerm) return false;

  return true;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const question: string = body.question?.trim();
    const messages: ChatMessage[] = body.messages ?? [];

    if (!question) {
      return Response.json(
        { error: "Please provide a question." },
        { status: 400 }
      );
    }

    if (isGreeting(question)) {
      const result = await streamAIResponse({
        system: SYSTEM_PROMPT,
        prompt: question,
        temperature: 0.7,
      });
      return result.toTextStreamResponse();
    }

    const ctx = await fetchBusinessContext();

    const normalizedDeals = normalizeDeals(ctx.deals);
    const normalizedWorkOrders = normalizeWorkOrders(ctx.workOrders);

    const dataQualityIssues = detectDataQualityIssues(
      normalizedDeals,
      normalizedWorkOrders
    );
    const allQualityIssues = [
      ...ctx.metadata.dataQualityIssues,
      ...dataQualityIssues.filter(
        (i) => !ctx.metadata.dataQualityIssues.includes(i)
      ),
    ];

    const summary = generateBusinessSummary(
      normalizedDeals,
      normalizedWorkOrders
    );

    if (needsClarification(question)) {
      const clarificationPrompt = buildClarificationPrompt(
        question,
        "Revenue, Pipeline, Operations, Customers, Sectors, Leadership Update"
      );

      const result = await streamAIResponse({
        system: SYSTEM_PROMPT,
        prompt: clarificationPrompt,
        temperature: 0.5,
      });

      return result.toTextStreamResponse();
    }

    if (isLeadershipRequest(question)) {
      const leadershipPrompt = buildLeadershipPrompt({
        dataQualityNotes:
          allQualityIssues.length > 0
            ? `Data Quality Notes:\n${allQualityIssues.map((i) => `- ${i}`).join("\n")}`
            : "No significant data quality issues detected.",
        totalPipelineValue: formatCurrencyCompact(summary.deals.totalValue),
        weightedPipelineValue: formatCurrencyCompact(summary.deals.weightedValue),
        totalDeals: String(summary.deals.total),
        averageDealSize: formatCurrencyCompact(summary.deals.averageDealSize),
        totalWorkOrders: String(summary.workOrders.total),
        completedWorkOrders: String(summary.workOrders.completed),
        inProgressWorkOrders: String(summary.workOrders.inProgress),
        delayedWorkOrders: String(summary.workOrders.delayed),
      });

      const result = await streamAIResponse({
        system: SYSTEM_PROMPT,
        prompt: leadershipPrompt,
      });

      return result.toTextStreamResponse();
    }

    const businessPrompt = buildBusinessAnalystPrompt(
      formatDealsCompact(normalizedDeals, summary.deals),
      formatWorkOrdersCompact(normalizedWorkOrders, summary.workOrders),
      "",
      "",
      allQualityIssues.length > 0
        ? `⚠️ Issues:\n${allQualityIssues.map((i) => `  - ${i}`).join("\n")}`
        : "No data quality issues."
    );

    const conversationContext = messages
      .slice(-1)
      .map(
        (m) =>
          `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`
      )
      .join("\n\n");

    const fullPrompt = conversationContext
      ? `## Previous Conversation\n\n${conversationContext}\n\n## Current Question\n\n${question}\n\n${businessPrompt}`
      : `## Question\n\n${question}\n\n${businessPrompt}`;

    const result = await streamAIResponse({
      system: SYSTEM_PROMPT,
      prompt: fullPrompt,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Chat API error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred.";

    if (
      errorMessage.includes("MONDAY_API_KEY") ||
      errorMessage.includes("GROQ")
    ) {
      return Response.json(
        {
          error: "Configuration error. Please check the server environment variables.",
          details: errorMessage,
        },
        { status: 500 }
      );
    }

    return Response.json(
      {
        error: "I'm having trouble processing your request. Please try again.",
        details:
          process.env.NODE_ENV === "development" ? errorMessage : undefined,
      },
      { status: 500 }
    );
  }
}
