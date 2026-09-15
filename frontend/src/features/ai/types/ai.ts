export type AiOperation =
  | 'improve_writing'
  | 'structure_notes'
  | 'summarize_reports'
  | 'summarize_blockers'
  | 'explain_system'
  | 'chat';

export interface AiTaskItem {
  title: string;
  description?: string;
  project?: string | null;
  projectName?: string;
  hoursSpent?: number;
}

export interface AiNextWeekTaskItem {
  title: string;
  description?: string;
  project?: string | null;
  projectName?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string | null;
}

export interface AiBlockerItem {
  title: string;
  description: string;
  project?: string | null;
  projectName?: string;
  impact?: string;
  assistanceNeeded?: string;
}

export interface AiAchievementItem {
  title: string;
  description?: string;
  project?: string | null;
  projectName?: string;
}

export interface AiHoursItem {
  project?: string | null;
  projectName?: string;
  category: string;
  hours: number;
  notes?: string;
}

export interface AiStructuredReport {
  summary?: string;
  completedTasks?: AiTaskItem[];
  nextWeekTasks?: AiNextWeekTaskItem[];
  blockers?: AiBlockerItem[];
  achievements?: AiAchievementItem[];
  hoursBreakdown?: AiHoursItem[];
}

export interface AiChatPayload {
  operation: AiOperation;
  message: string;
  conversationId?: string;
  context?: {
    page?: string;
    projectId?: string;
    reportId?: string;
    weekStart?: string;
    weekEnd?: string;
  };
}

export interface AiChatResponseData {
  reply: string;
  operation: AiOperation;
  structuredReport?: AiStructuredReport | null;
  conversationId?: string | null;
}

export interface AiMessage {
  role: 'user' | 'assistant';
  content: string;
  operation?: string;
  structuredReport?: AiStructuredReport | null;
  createdAt?: string;
}

export interface AiConversationSummary {
  id: string;
  title: string;
  messageCount: number;
  lastActivityAt: string;
  createdAt: string;
}

export interface AiConversationDetail {
  id: string;
  title: string;
  messages: AiMessage[];
  lastActivityAt: string;
  createdAt: string;
}