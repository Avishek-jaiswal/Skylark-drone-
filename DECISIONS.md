# Decision Log

## SkyLark — Monday.com Business Intelligence AI Agent

### 1. GraphQL vs MCP for Monday.com Integration

**Decision:** Use direct GraphQL API calls instead of MCP.

**Rationale:**
- The Monday.com GraphQL API is well-documented and stable
- MCP adds an unnecessary abstraction layer for a single data source
- Direct GraphQL gives fine-grained control over query structure, pagination, and error handling
- Fewer dependencies = fewer failure points in production
- The Vercel AI SDK is already the primary integration layer; adding MCP would create competing abstraction patterns

**Trade-off:** If the application needed to connect to 5+ different data sources, MCP would provide better standardization. For two Monday boards, GraphQL is the right level of abstraction.

---

### 2. Data Normalization Strategy

**Decision:** Normalize in-memory at request time, never modify Monday.com data.

**Rationale:**
- Monday.com is the single source of truth — it should remain untouched
- Normalization is lightweight (string cleaning, casing, number parsing)
- No caching layer needed for MVP
- Data quality issues are surfaced to the user rather than silently corrected in the source

**Normalization rules applied:**
- Null/undefined → "Unknown" (with tracking for data quality reporting)
- Currency strings → parsed numbers (strip symbols, parse float, default to 0)
- Dates → ISO strings or null (invalid dates rejected)
- Casing → Title Case for sectors/stages via lookup maps
- Whitespace → trimmed, duplicate spaces collapsed

**Trade-off:** Repeated normalization per-request adds latency but avoids stale cache problems. Caching of normalized data could be added later via request memoization or a lightweight in-memory store.

---

### 3. Prompt Engineering Strategy

**Decision:** Separate system prompt, business analyst prompt, leadership prompt, and clarification prompt into modular templates with parameterized placeholders.

**Rationale:**
- Each prompt serves a distinct purpose and should be independently maintainable
- Parameterized templates prevent prompt injection and keep business logic out of prompts
- System prompt handles tone, personality, and rules (stable, rarely changes)
- Business analyst prompt handles data analysis (varies with query type)
- Leadership prompt handles executive summaries (specialized format)
- Clarification prompt handles ambiguous queries (structured output format)

**Trade-off:** More prompt files = more maintenance surface area. But the separation prevents a single massive prompt from becoming unmanageable.

---

### 4. Leadership Update Interpretation

**Decision:** Detect leadership requests via keyword matching (e.g., "update", "summary", "how are we doing") and render a structured executive summary with KPIs.

**Rationale:**
- Executives ask different questions than analysts — they want synthesis, not raw data
- Keyword detection is lightweight and avoids unnecessary AI calls for routing
- The leadership prompt template pre-computes key metrics server-side, keeping Gemini focused on insight generation rather than arithmetic
- Bulleted format with "Key Actions" section mimics boardroom-ready reporting

**Trade-off:** Simple keyword matching may miss nuanced leadership queries. A future improvement would use AI-based intent classification (calling Gemini with a lightweight classification prompt).

---

### 5. Clarification Strategy

**Decision:** If a query is under 8 characters or lacks specific business terms, route to a clarification prompt rather than attempting analysis.

**Rationale:**
- Vague queries like "How are we doing?" have no specific business context
- Asking the AI to analyze all data for a vague query wastes tokens and produces unfocused answers
- A structured clarification (2-4 specific follow-ups) guides the user toward actionable queries
- This mirrors the behavior of production analysts who always seek specificity

**Trade-off:** False positives are possible (short but specific queries like "Revenue?"). The threshold can be tuned and eventually replaced with AI-based intent routing.

---

### 6. Vercel AI SDK as the AI Integration Layer

**Decision:** Use the Vercel AI SDK (`ai` + `@ai-sdk/google`) instead of calling Gemini's REST API directly.

**Rationale:**
- The AI SDK provides `streamText()` with built-in streaming support
- Provider-agnostic — swapping Gemini for Anthropic or OpenAI requires changing one import
- Handles abort signals, token counting, and error recovery
- Aligned with Next.js 16's streaming patterns (React Server Components, edge-compatible)
- `toTextStreamResponse()` enables native streaming to the browser without custom SSE logic

**Trade-off:** Dependence on the AI SDK package. However, the abstraction pays off in maintainability and future-proofing.

---

### 7. UI Design Philosophy (Hallmark)

**Decision:** Follow Hallmark design principles: calm, spacious, premium, minimal, highly readable.

**Rationale:**
- The audience is founders and executives — the UI must feel professional and trustworthy
- Conversational interfaces should fade into the background; design should not compete with content
- Generous whitespace and muted colors reduce cognitive load during data-heavy conversations
- Subtle animations (fade, slide) provide feedback without distraction
- shadcn/ui provides accessible, customizable primitives that align with these principles

**Anti-patterns avoided:** Dashboard overload, excessive borders, flashy animations, multi-column layouts, competing colors.

---

### 8. No Database Decision

**Decision:** Use Monday.com as the single source of truth with no supplementary database.

**Rationale:**
- Eliminates data synchronization complexity
- Ensures insights always reflect live Monday data
- Reduces infrastructure cost (no DB hosting, no migration scripts)
- Aligns with the "ask me anything" conversational paradigm — every query fetches fresh data

**Trade-off:** No historical query caching. Repeated questions re-fetch data. Acceptable for MVP given Monday.com's API performance.

---

### Future Improvements

- **AI-based intent routing:** Replace keyword matching with a lightweight AI classification call
- **Data caching:** Implement in-memory memoization with 60-second TTL for board metadata
- **Time-series analysis:** Support "Q2", "last month", "year over year" with proper date filtering
- **Persistent conversations:** Store chat history in localStorage or a lightweight KV store
- **Multi-board awareness:** Let the AI dynamically discover and query any board in the workspace
- **Scheduled digests:** Generate and email weekly executive summaries
- **Chart generation:** Add data visualization for trend questions
