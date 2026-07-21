# SkyLark — Monday.com Business Intelligence AI Agent

AI-powered Business Intelligence chatbot that connects to Monday.com and delivers conversational insights about revenue, pipeline, and operations.

## Overview

SkyLark enables founders and executives to ask natural language questions about their business. It dynamically retrieves data from Monday.com using the GraphQL API, normalizes it, analyzes it with Groq (Llama 3.3) via the Vercel AI SDK, and returns streaming conversational insights.

**Monday.com is the single source of truth.** No database required.

## Architecture

```
User → Chat Interface → API Route → Monday GraphQL API → Normalize Data → Prompt Builder → Vercel AI SDK → Groq → Streaming Response → User
```

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript (strict)
- **Styling:** TailwindCSS 4, shadcn/ui
- **Design:** Hallmark design principles (calm, spacious, premium)
- **Animations:** Framer Motion (subtle fade/slide only)
- **AI:** Vercel AI SDK (`ai` + `@ai-sdk/groq`)
- **Model:** Llama 3.3 70B (configurable via env)
- **Data Source:** Monday.com GraphQL API
- **Icons:** Lucide

## Folder Structure

```
.
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts          # API route with streaming
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/                        # shadcn/ui primitives
│   ├── chat.tsx                   # Main chat interface
│   ├── chat-input.tsx             # Message input with send/stop
│   ├── message.tsx                # Message bubble
│   ├── message-content.tsx        # Markdown/table/streaming renderer
│   ├── prompt-suggestions.tsx     # Empty state prompt cards
│   ├── typing-indicator.tsx       # Animated typing dots
│   ├── error-banner.tsx           # Inline error display
│   ├── header.tsx                 # Top bar
│   └── sidebar.tsx                # Slide-out navigation
├── hooks/
│   └── use-chat.ts                # Chat state management
├── lib/
│   ├── ai.ts                      # Vercel AI SDK wrapper
│   ├── business.ts                # Business intelligence logic
│   ├── monday.ts                  # Monday GraphQL API client
│   ├── normalize.ts               # Data normalization
│   ├── prompts.ts                 # Modular prompt templates
│   └── utils.ts                   # Shared utilities
└── types/
    └── index.ts                   # TypeScript type definitions
```

## Environment Variables

Copy `.env.local.example` to `.env.local` and fill in:

| Variable | Description | Required |
|---|---|---|
| `MONDAY_API_KEY` | Monday.com API v2 key | Yes |
| `GROQ_API_KEY` | Groq API key | Yes |
| `GROQ_MODEL_NAME` | Override default model | No |

## Running Locally

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your API keys

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploying to Vercel

1. Push to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard:
   - `MONDAY_API_KEY`
   - `GROQ_API_KEY`
4. Deploy

## Monday.com Setup

Create two boards in your Monday.com workspace:

### Deals Board
Suggested columns: Name, Customer, Contact, Sector, Stage, Owner, Status, Value, Probability, Estimated Close Date

### Work Orders Board
Suggested columns: Name, Customer, Sector, Status, Priority, Assigned To, Start Date, Due Date, Completed Date, Revenue

The application locates boards by name automatically — no board IDs to configure.

## Importing CSVs

1. Create the Deals and Work Orders boards in Monday.com
2. Import your CSV data using Monday's built-in CSV import
3. Ensure column names approximately match the expected names above
4. The normalization layer handles casing, spacing, and formatting inconsistencies

## Query Examples

- "How is our pipeline?"
- "Show revenue by sector"
- "Which projects are delayed?"
- "How are energy deals performing?"
- "Give me a leadership update"
- "Compare manufacturing with energy"
- "Anything worrying?"

## Known Limitations

- Reads from exactly two boards: Deals and Work Orders
- No persistent conversation history (in-memory only)
- No multi-tenancy (single Monday workspace)
- No scheduled reports or alerts
- Currency normalization assumes USD
- Board location is name-based (board names must match exactly or close to "Deals" and "Work Orders")

## Future Improvements

- Multi-board support beyond Deals and Work Orders
- Persistent chat history with session storage
- Date-range filtering and time-series analysis
- Scheduled executive summary emails
- Multi-currency support
- User authentication and multi-tenant workspaces
- Integration with other data sources
# Skylark-drone-
