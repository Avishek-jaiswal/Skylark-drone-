import { Deal, WorkOrder } from "@/types";

export function normalizeDeals(deals: Deal[]): Deal[] {
  return deals.map((deal) => ({
    ...deal,
    name: normalizeString(deal.name),
    customer: normalizeNullableString(deal.customer),
    contact: normalizeNullableString(deal.contact),
    sector: normalizeSector(deal.sector),
    stage: normalizeStage(deal.stage),
    owner: normalizeNullableString(deal.owner),
    status: normalizeNullableString(deal.status),
    value: normalizeCurrency(deal.value as unknown as string),
    currency: "USD",
    probability: normalizeProbability(deal.probability as unknown as string),
    estimatedCloseDate: normalizeDate(deal.estimatedCloseDate),
  }));
}

export function normalizeWorkOrders(workOrders: WorkOrder[]): WorkOrder[] {
  return workOrders.map((wo) => ({
    ...wo,
    name: normalizeString(wo.name),
    customer: normalizeNullableString(wo.customer),
    sector: normalizeSector(wo.sector),
    status: normalizeNullableString(wo.status),
    priority: normalizePriority(wo.priority),
    assignedTo: normalizeNullableString(wo.assignedTo),
    startDate: normalizeDate(wo.startDate),
    dueDate: normalizeDate(wo.dueDate),
    completedDate: normalizeDate(wo.completedDate),
    revenue: normalizeCurrency(wo.revenue as unknown as string),
  }));
}

function normalizeString(value: string | null): string {
  if (!value) return "Unknown";
  return value.trim().replace(/\s+/g, " ");
}

function normalizeNullableString(value: string | null): string {
  if (value === null || value === undefined) return "Unknown";
  const trimmed = value.trim().replace(/\s+/g, " ");
  if (trimmed === "" || trimmed.toLowerCase() === "none") return "Unknown";
  return trimmed;
}

function normalizeSector(value: string | null): string {
  const normalized = normalizeNullableString(value);
  if (normalized === "Unknown") return "Unknown";

  const mapping: Record<string, string> = {
    energy: "Energy",
    manufacturing: "Manufacturing",
    healthcare: "Healthcare",
    technology: "Technology",
    finance: "Finance",
    retail: "Retail",
    construction: "Construction",
    agriculture: "Agriculture",
    transportation: "Transportation",
    education: "Education",
    "real estate": "Real Estate",
    telecom: "Telecommunications",
    telecoms: "Telecommunications",
    telecommunications: "Telecommunications",
    defense: "Defense",
    aerospace: "Aerospace",
    pharma: "Pharmaceuticals",
    pharmaceuticals: "Pharmaceuticals",
    insurance: "Insurance",
    media: "Media",
    entertainment: "Entertainment",
    hospitality: "Hospitality",
    legal: "Legal",
    consulting: "Consulting",
  };

  return mapping[normalized.toLowerCase()] ?? normalized;
}

function normalizeStage(value: string | null): string {
  const normalized = normalizeNullableString(value);
  const mapping: Record<string, string> = {
    "lead": "Lead",
    "new lead": "Lead",
    "qualified": "Qualified",
    "qualified lead": "Qualified",
    "proposal": "Proposal",
    "proposal sent": "Proposal",
    "negotiation": "Negotiation",
    "in negotiation": "Negotiation",
    "closed": "Closed",
    "won": "Closed Won",
    "closed lost": "Closed Lost",
    "lost": "Closed Lost",
    "discovery": "Discovery",
    "evaluation": "Evaluation",
    "demo": "Demo",
    "proof of concept": "Proof of Concept",
    "contract": "Contract",
    "on hold": "On Hold",
  };

  return mapping[normalized.toLowerCase()] ?? normalized;
}

function normalizePriority(value: string | null): string {
  const normalized = normalizeNullableString(value);
  const mapping: Record<string, string> = {
    critical: "Critical",
    high: "High",
    medium: "Medium",
    low: "Low",
    urgent: "Critical",
    "very high": "High",
    normal: "Medium",
  };

  return mapping[normalized.toLowerCase()] ?? "Medium";
}

function normalizeCurrency(value: string | unknown): number {
  if (typeof value === "number") return isNaN(value) ? 0 : value;
  if (!value || typeof value !== "string") return 0;

  const cleaned = value.replace(/[^0-9.\-]/g, "");
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

function normalizeProbability(value: string | unknown): number {
  if (typeof value === "number") return Math.min(100, Math.max(0, value));
  if (!value || typeof value !== "string") return 0;

  const cleaned = value.replace(/[^0-9.]/g, "");
  const parsed = parseFloat(cleaned);
  if (isNaN(parsed)) return 0;
  return Math.min(100, Math.max(0, parsed));
}

export function normalizeDate(value: string | null): string | null {
  if (!value) return null;

  const trimmed = value.trim();
  if (trimmed === "" || trimmed === "-" || trimmed.toLowerCase() === "invalid") {
    return null;
  }

  try {
    const date = new Date(trimmed);
    if (isNaN(date.getTime())) return null;

    const year = date.getFullYear();
    if (year < 2000 || year > 2100) return null;

    return date.toISOString();
  } catch {
    return null;
  }
}

export function detectDataQualityIssues(
  deals: Deal[],
  workOrders: WorkOrder[]
): string[] {
  const issues: string[] = [];

  if (deals.length === 0) {
    issues.push("No deal records found in the Deals board.");
  }
  if (workOrders.length === 0) {
    issues.push("No work order records found in the Work Orders board.");
  }

  const missingSectorDeals = deals.filter((d) => d.sector === "Unknown");
  if (missingSectorDeals.length > 0) {
    issues.push(
      `${missingSectorDeals.length} deal record(s) with missing sector information.`
    );
  }

  const missingSectorWOs = workOrders.filter((w) => w.sector === "Unknown");
  if (missingSectorWOs.length > 0) {
    issues.push(
      `${missingSectorWOs.length} work order(s) with missing sector information.`
    );
  }

  const zeroValueDeals = deals.filter((d) => d.value === 0 && d.stage !== "Lead");
  if (zeroValueDeals.length > 0) {
    issues.push(
      `${zeroValueDeals.length} deal(s) have zero or missing value amounts.`
    );
  }

  const invalidDates = workOrders.filter(
    (w) => !w.dueDate && w.status !== "Completed"
  );
  if (invalidDates.length > 0) {
    issues.push(
      `${invalidDates.length} active work order(s) have missing due dates.`
    );
  }

  const missingCustomerDeals = deals.filter(
    (d) => d.customer === "Unknown"
  );
  if (missingCustomerDeals.length > 0) {
    issues.push(
      `${missingCustomerDeals.length} deal(s) with missing customer information.`
    );
  }

  return issues;
}
