import { Deal, WorkOrder } from "@/types";

export interface BusinessSummary {
  deals: {
    total: number
    totalValue: number
    weightedValue: number
    averageDealSize: number
    byStage: Record<string, { count: number; value: number }>
    bySector: Record<string, { count: number; value: number }>
    byCustomer: Record<string, { count: number; value: number }>
    closingThisMonth: Deal[]
    largestDeal: Deal | null
    winRate: number
  }
  workOrders: {
    total: number
    completed: number
    inProgress: number
    delayed: number
    pending: number
    byStatus: Record<string, number>
    bySector: Record<string, number>
    byCustomer: Record<string, number>
    totalRevenue: number
    averageCompletionTimeDays: number | null
  }
  crossBoard: {
    customersWithDealsNoWorkOrders: string[]
    customersWithWorkOrdersNoDeals: string[]
    commonCustomers: string[]
  }
  dataQuality: {
    issues: string[]
  }
}

export function generateBusinessSummary(
  deals: Deal[],
  workOrders: WorkOrder[]
): BusinessSummary {
  const byStage: Record<string, { count: number; value: number }> = {};
  const bySector: Record<string, { count: number; value: number }> = {};
  const byCustomer: Record<string, { count: number; value: number }> = {};
  let totalDealValue = 0;
  let weightedValue = 0;
  let wonDeals = 0;
  let closedDeals = 0;
  let largestDeal: Deal | null = null;

  for (const deal of deals) {
    totalDealValue += deal.value;
    weightedValue += deal.value * (deal.probability / 100);

    if (!byStage[deal.stage]) byStage[deal.stage] = { count: 0, value: 0 };
    byStage[deal.stage].count++;
    byStage[deal.stage].value += deal.value;

    if (deal.sector) {
      if (!bySector[deal.sector]) bySector[deal.sector] = { count: 0, value: 0 };
      bySector[deal.sector].count++;
      bySector[deal.sector].value += deal.value;
    }

    if (deal.customer) {
      if (!byCustomer[deal.customer])
        byCustomer[deal.customer] = { count: 0, value: 0 };
      byCustomer[deal.customer].count++;
      byCustomer[deal.customer].value += deal.value;
    }

    if (deal.stage === "Closed Won" || deal.stage === "Won") {
      wonDeals++;
    }

    if (
      deal.stage === "Closed Won" ||
      deal.stage === "Won" ||
      deal.stage === "Closed Lost" ||
      deal.stage === "Lost" ||
      deal.stage === "Closed"
    ) {
      closedDeals++;
    }

    if (!largestDeal || deal.value > largestDeal.value) {
      largestDeal = deal;
    }
  }

  const now = new Date();
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const closingThisMonth = deals.filter((d) => {
    if (!d.estimatedCloseDate) return false;
    const closeDate = new Date(d.estimatedCloseDate);
    return (
      closeDate >= now &&
      closeDate <= endOfMonth &&
      d.stage !== "Closed Lost" &&
      d.stage !== "Lost"
    );
  });

  const winRate = closedDeals > 0 ? (wonDeals / closedDeals) * 100 : 0;

  const woByStatus: Record<string, number> = {};
  const woBySector: Record<string, number> = {};
  const woByCustomer: Record<string, number> = {};
  let completedWO = 0;
  let inProgressWO = 0;
  let delayedWO = 0;
  let pendingWO = 0;
  let totalWORevenue = 0;

  for (const wo of workOrders) {
    totalWORevenue += wo.revenue;

    const status = wo.status.toLowerCase();
    if (!woByStatus[wo.status]) woByStatus[wo.status] = 0;
    woByStatus[wo.status]++;

    if (wo.sector) {
      if (!woBySector[wo.sector]) woBySector[wo.sector] = 0;
      woBySector[wo.sector]++;
    }

    if (wo.customer) {
      if (!woByCustomer[wo.customer]) woByCustomer[wo.customer] = 0;
      woByCustomer[wo.customer]++;
    }

    if (status.includes("complete") || status.includes("done")) {
      completedWO++;
    } else if (status.includes("progress") || status.includes("active")) {
      inProgressWO++;
    } else if (
      status.includes("delay") ||
      status.includes("overdue") ||
      status.includes("late")
    ) {
      delayedWO++;
    } else {
      pendingWO++;
    }
  }

  const dealCustomerNames = new Set(
    deals.map((d) => d.customer).filter((c) => c !== "Unknown")
  );
  const woCustomerNames = new Set(
    workOrders.map((w) => w.customer).filter((c) => c !== "Unknown")
  );

  const customersWithDealsNoWorkOrders: string[] = [];
  const customersWithWorkOrdersNoDeals: string[] = [];
  const commonCustomers: string[] = [];

  for (const c of dealCustomerNames) {
    if (woCustomerNames.has(c)) {
      commonCustomers.push(c);
    } else {
      customersWithDealsNoWorkOrders.push(c);
    }
  }

  for (const c of woCustomerNames) {
    if (!dealCustomerNames.has(c)) {
      customersWithWorkOrdersNoDeals.push(c);
    }
  }

  let averageCompletionTimeDays: number | null = null;
  const completedWithDates = workOrders.filter(
    (wo) => wo.completedDate && wo.startDate && wo.status.toLowerCase().includes("complete")
  );
  if (completedWithDates.length > 0) {
    const totalDays = completedWithDates.reduce((sum, wo) => {
      const start = new Date(wo.startDate!);
      const end = new Date(wo.completedDate!);
      return sum + (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    }, 0);
    averageCompletionTimeDays = Math.round(totalDays / completedWithDates.length);
  }

  return {
    deals: {
      total: deals.length,
      totalValue: totalDealValue,
      weightedValue,
      averageDealSize: deals.length > 0 ? totalDealValue / deals.length : 0,
      byStage,
      bySector,
      byCustomer,
      closingThisMonth,
      largestDeal,
      winRate,
    },
    workOrders: {
      total: workOrders.length,
      completed: completedWO,
      inProgress: inProgressWO,
      delayed: delayedWO,
      pending: pendingWO,
      byStatus: woByStatus,
      bySector: woBySector,
      byCustomer: woByCustomer,
      totalRevenue: totalWORevenue,
      averageCompletionTimeDays,
    },
    crossBoard: {
      customersWithDealsNoWorkOrders,
      customersWithWorkOrdersNoDeals,
      commonCustomers,
    },
    dataQuality: {
      issues: [],
    },
  };
}

export function formatDealsForPrompt(deals: Deal[]): string {
  if (deals.length === 0) {
    return "No deals available.";
  }

  const headers = [
    "Name",
    "Customer",
    "Sector",
    "Stage",
    "Value",
    "Probability",
    "Est. Close",
    "Owner",
  ];
  const rows = deals.map((d) => [
    d.name,
    d.customer,
    d.sector,
    d.stage,
    `₹${d.value.toLocaleString()}`,
    `${d.probability}%`,
    d.estimatedCloseDate
      ? new Date(d.estimatedCloseDate).toLocaleDateString()
      : "N/A",
    d.owner,
  ]);

  return formatTable(headers, rows);
}

export function formatWorkOrdersForPrompt(workOrders: WorkOrder[]): string {
  if (workOrders.length === 0) {
    return "No work orders available.";
  }

  const headers = [
    "Name",
    "Customer",
    "Sector",
    "Status",
    "Priority",
    "Assigned To",
    "Due Date",
    "Revenue",
  ];
  const rows = workOrders.map((w) => [
    w.name,
    w.customer,
    w.sector,
    w.status,
    w.priority,
    w.assignedTo,
    w.dueDate ? new Date(w.dueDate).toLocaleDateString() : "N/A",
    `₹${w.revenue.toLocaleString()}`,
  ]);

  return formatTable(headers, rows);
}

function formatTable(headers: string[], rows: string[][]): string {
  const colWidths = headers.map((h, i) => {
    const maxRowLen = Math.max(...rows.map((r) => (r[i] || "").length));
    return Math.max(h.length, maxRowLen);
  });

  const headerLine = headers
    .map((h, i) => h.padEnd(colWidths[i]))
    .join(" | ");
  const separator = colWidths.map((w) => "-".repeat(w)).join("-|-");
  const dataLines = rows.map((row) =>
    row.map((cell, i) => cell.padEnd(colWidths[i])).join(" | ")
  );

  return [headerLine, separator, ...dataLines].join("\n");
}

export function formatCurrencyCompact(value: number): string {
  if (value >= 1_000_000_000) {
    return `₹${(value / 1_000_000_000).toFixed(2)}B`;
  }
  if (value >= 1_000_000) {
    return `₹${(value / 1_000_000).toFixed(2)}M`;
  }
  if (value >= 1_000) {
    return `₹${(value / 1_000).toFixed(1)}K`;
  }
  return `₹${value.toFixed(0)}`;
}

export function formatDealsCompact(deals: Deal[], summary: BusinessSummary["deals"]): string {
  if (deals.length === 0) return "No deals.";
  const top5 = [...deals].sort((a, b) => b.value - a.value).slice(0, 5)
    .map((d) => `  ${d.name} | ${d.customer} | ${d.stage} | ${formatCurrencyCompact(d.value)}`)
    .join("\n");
  const bySector = Object.entries(summary.bySector)
    .map(([s, d]) => `  ${s}: ${d.count} (${formatCurrencyCompact(d.value)})`)
    .join("\n");
  return `Deals: ${deals.length} total, ${formatCurrencyCompact(summary.totalValue)} pipeline
By sector:\n${bySector}
Top 5:\n${top5}`;
}

export function formatWorkOrdersCompact(wos: WorkOrder[], summary: BusinessSummary["workOrders"]): string {
  if (wos.length === 0) return "No work orders.";
  const delayed = wos.filter((w) => {
    const s = w.status.toLowerCase();
    return s.includes("delay") || s.includes("overdue") || s.includes("late");
  });
  return `Work Orders: ${wos.length} total, ${formatCurrencyCompact(summary.totalRevenue)} revenue
Completed: ${summary.completed} | In Progress: ${summary.inProgress} | Delayed: ${summary.delayed} | Pending: ${summary.pending}
${delayed.length > 0 ? `Delayed:\n${delayed.slice(0, 5).map((w) => `  ${w.name} | ${w.customer} | ${w.priority}`).join("\n")}` : ""}`;
}
