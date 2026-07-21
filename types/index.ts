export interface MondayBoard {
  id: string
  name: string
  columns: MondayColumn[]
  items: MondayItem[]
}

export interface MondayColumn {
  id: string
  title: string
  type: string
}

export interface MondayItem {
  id: string
  name: string
  columnValues: MondayColumnValue[]
  board: {
    id: string
    name: string
  }
}

export interface MondayColumnValue {
  id: string
  text: string | null
  value: string | null
  type: string
  column: {
    id: string
    title: string
  }
}

export interface Deal {
  id: string
  name: string
  customer: string
  contact: string
  sector: string
  stage: string
  owner: string
  status: string
  value: number
  currency: string
  probability: number
  estimatedCloseDate: string | null
  createdAt: string
  updatedAt: string
}

export interface WorkOrder {
  id: string
  name: string
  customer: string
  sector: string
  status: string
  priority: string
  assignedTo: string
  startDate: string | null
  dueDate: string | null
  completedDate: string | null
  revenue: number
  createdAt: string
  updatedAt: string
}

export interface BusinessContext {
  deals: Deal[]
  workOrders: WorkOrder[]
  metadata: {
    dealBoardName: string
    workOrderBoardName: string
    totalDeals: number
    totalWorkOrders: number
    dataQualityIssues: string[]
  }
}

export interface ChatMessage {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  timestamp: number
}

export interface ChatRequest {
  messages: ChatMessage[]
  question: string
}

export type IntentType =
  | "revenue"
  | "pipeline"
  | "operations"
  | "leadership"
  | "customer"
  | "sector"
  | "cross_board"
  | "general"
  | "clarification_needed"

export interface QueryIntent {
  type: IntentType
  confidence: number
  entities: {
    sectors?: string[]
    customers?: string[]
    timeframes?: string[]
    stages?: string[]
  }
  needsClarification: boolean
  clarificationOptions?: string[]
}
