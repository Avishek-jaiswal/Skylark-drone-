import { Deal, WorkOrder, MondayBoard, MondayColumnValue } from "@/types";

const MONDAY_API_URL = "https://api.monday.com/v2";

function getApiKey(): string {
  const key = process.env.MONDAY_API_KEY;
  if (!key) {
    throw new Error(
      "MONDAY_API_KEY environment variable is not set. Please add it to your .env.local file."
    );
  }
  return key;
}

async function graphqlRequest<T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  const apiKey = getApiKey();

  const response = await fetch(MONDAY_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: apiKey,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(
      `Monday API error: ${response.status} ${response.statusText}`
    );
  }

  const json = await response.json();

  if (json.errors) {
    const messages = json.errors
      .map((e: { message: string }) => e.message)
      .join(", ");
    throw new Error(`Monday API errors: ${messages}`);
  }

  return json.data as T;
}

export async function getBoards(): Promise<MondayBoard[]> {
  const query = `
    query {
      boards(limit: 50) {
        id
        name
        columns {
          id
          title
          type
        }
      }
    }
  `;

  const data = await graphqlRequest<{ boards: MondayBoard[] }>(query);
  return data.boards;
}

interface BoardItem {
  id: string
  name: string
  column_values: MondayColumnValue[]
  board: {
    id: string
    name: string
  }
}

export async function getBoardItems(
  boardId: string,
  cursor?: string
): Promise<{ items: BoardItem[]; nextCursor: string | null }> {
  const query = `
    query($boardId: [ID!], $cursor: String) {
      boards(ids: $boardId) {
        items_page(limit: 100, cursor: $cursor) {
          cursor
          items {
            id
            name
            column_values {
              id
              text
              value
              type
              column {
                id
                title
              }
            }
            board {
              id
              name
            }
          }
        }
      }
    }
  `;

  const data = await graphqlRequest<{
    boards: {
      items_page: {
        cursor: string | null
        items: BoardItem[]
      }
    }[]
  }>(query, { boardId: parseInt(boardId), cursor });

  const itemsPage = data.boards[0]?.items_page;
  return {
    items: itemsPage?.items ?? [],
    nextCursor: itemsPage?.cursor ?? null,
  };
}

export async function getAllBoardItems(
  boardId: string
): Promise<BoardItem[]> {
  let allItems: BoardItem[] = [];
  let nextCursor: string | null = null;

  do {
    const { items, nextCursor: cursor } = await getBoardItems(boardId, nextCursor ?? undefined);
    allItems = allItems.concat(items);
    nextCursor = cursor;
  } while (nextCursor);

  return allItems;
}

export async function findBoardByName(
  name: string
): Promise<MondayBoard | null> {
  const boards = await getBoards();
  return (
    boards.find(
      (b) => b.name.toLowerCase() === name.toLowerCase()
    ) ?? null
  );
}

function findColumnValue(
  columnValues: MondayColumnValue[],
  columnTitle: string
): MondayColumnValue | undefined {
  const searchTitle = columnTitle.toLowerCase();
  return columnValues.find(
    (cv) =>
      cv.column?.title.toLowerCase() === searchTitle ||
      cv.id.toLowerCase() === searchTitle ||
      cv.column?.title.toLowerCase().includes(searchTitle)
  );
}

function extractColumnText(
  columnValues: MondayColumnValue[],
  columnTitle: string
): string | null {
  const cv = findColumnValue(columnValues, columnTitle);
  return cv?.text ?? null;
}

export async function fetchDeals(): Promise<Deal[]> {
  const boardName = process.env.MONDAY_DEALS_BOARD || "Deal funnel Data";
  const board = await findBoardByName(boardName);
  if (!board) {
    console.warn(`Board "${boardName}" not found in Monday.com`);
    return [];
  }

  const rawItems = await getAllBoardItems(board.id);

  return rawItems.map((item) => ({
    id: item.id,
    name: item.name,
    customer: extractColumnText(item.column_values, "Client Code") ?? "Unknown",
    contact: "Unknown",
    sector: extractColumnText(item.column_values, "Sector/service") ?? "Unknown",
    stage: extractColumnText(item.column_values, "Deal Stage") ?? "Unknown",
    owner: extractColumnText(item.column_values, "Owner code") ?? "Unknown",
    status: extractColumnText(item.column_values, "Deal Status") ?? "Unknown",
    value: extractColumnNumber(item.column_values, "Masked Deal value"),
    currency: "INR",
    probability: extractColumnProbability(item.column_values, "Closure Probability"),
    estimatedCloseDate: extractColumnDate(item.column_values, "Tentative Close Date"),
    createdAt: extractColumnDate(item.column_values, "Created Date") ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));
}

export async function fetchWorkOrders(): Promise<WorkOrder[]> {
  const boardName = process.env.MONDAY_WORK_ORDERS_BOARD || "Work_Order_Tracker Data";
  const board = await findBoardByName(boardName);
  if (!board) {
    console.warn(`Board "${boardName}" not found in Monday.com`);
    return [];
  }

  const rawItems = await getAllBoardItems(board.id);

  return rawItems.map((item) => ({
    id: item.id,
    name: item.name,
    customer: extractColumnText(item.column_values, "Customer Name Code") ?? "Unknown",
    sector: extractColumnText(item.column_values, "Sector") ?? "Unknown",
    status: extractColumnText(item.column_values, "Execution Status") ?? "Unknown",
    priority: "Medium",
    assignedTo: extractColumnText(item.column_values, "BD/KAM Personnel code") ?? "Unassigned",
    startDate: extractColumnDate(item.column_values, "Probable Start Date"),
    dueDate: extractColumnDate(item.column_values, "Probable End Date"),
    completedDate: extractColumnDate(item.column_values, "Data Delivery Date"),
    revenue: extractColumnNumber(item.column_values, "Amount in Rupees (Excl of GST) (Masked)"),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));
}

function extractColumnNumber(
  columnValues: MondayColumnValue[],
  columnTitle: string
): number {
  const val = extractColumnText(columnValues, columnTitle);
  if (!val) return 0;
  const cleaned = val.replace(/[^0-9.\-]/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

function extractColumnDate(
  columnValues: MondayColumnValue[],
  columnTitle: string
): string | null {
  const val = extractColumnText(columnValues, columnTitle);
  if (!val) return null;
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d.toISOString();
}

function extractColumnProbability(
  columnValues: MondayColumnValue[],
  columnTitle: string
): number {
  const val = extractColumnText(columnValues, columnTitle);
  if (!val) return 0;
  const map: Record<string, number> = {
    "high": 75, "medium": 50, "low": 25,
    "very high": 90, "very low": 10,
  };
  const lowered = val.toLowerCase().trim();
  if (map[lowered] !== undefined) return map[lowered];
  const num = parseFloat(val.replace(/[^0-9.]/g, ""));
  return isNaN(num) ? 0 : Math.min(100, Math.max(0, num));
}

export async function fetchBusinessContext(): Promise<{
  deals: Deal[]
  workOrders: WorkOrder[]
  metadata: {
    dealBoardName: string
    workOrderBoardName: string
    totalDeals: number
    totalWorkOrders: number
    dataQualityIssues: string[]
  }
}> {
  const [deals, workOrders] = await Promise.all([
    fetchDeals(),
    fetchWorkOrders(),
  ]);

  const dealBoardName = process.env.MONDAY_DEALS_BOARD || "Deal funnel Data";
  const workOrderBoardName = process.env.MONDAY_WORK_ORDERS_BOARD || "Work_Order_Tracker Data";

  const dataQualityIssues: string[] = [];

  if (deals.length === 0) {
    dataQualityIssues.push(
      `No deals found. Please ensure the "${dealBoardName}" board exists and contains data.`
    );
  }
  if (workOrders.length === 0) {
    dataQualityIssues.push(
      `No work orders found. Please ensure the "${workOrderBoardName}" board exists and contains data.`
    );
  }

  return {
    deals,
    workOrders,
    metadata: {
      dealBoardName,
      workOrderBoardName,
      totalDeals: deals.length,
      totalWorkOrders: workOrders.length,
      dataQualityIssues,
    },
  };
}
