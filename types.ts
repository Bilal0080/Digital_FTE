
export enum AppView {
  DASHBOARD = 'dashboard',
  VAULT = 'vault',
  APPROVALS = 'approvals',
  CEO_BRIEFING = 'ceo-briefing',
  WATCHERS = 'watchers',
  SETTINGS = 'settings'
}

export interface FileVersion {
  id: string;
  content: string;
  timestamp: string;
  author: 'CEO' | 'AI Employee';
  changeSummary?: string;
}

export interface VaultFile {
  id: string;
  name: string;
  path: string;
  content: string;
  type: 'markdown' | 'json' | 'pdf' | 'csv';
  lastModified: string;
  status?: 'pending' | 'approved' | 'rejected' | 'done';
  versions?: FileVersion[];
}

export interface Transaction {
  date: string;
  description: string;
  amount: number;
  category: string;
}

export interface WatcherStatus {
  id: string;
  name: string;
  status: 'active' | 'idle' | 'error';
  lastRun: string;
  type: 'gmail' | 'whatsapp' | 'finance' | 'filesystem';
}

export interface CEOReport {
  revenue: number;
  mtdRevenue: number;
  completedTasks: number;
  bottlenecks: string[];
  suggestions: string[];
}
