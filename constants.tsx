
import React from 'react';
import { 
  LayoutDashboard, 
  FolderLock, 
  UserCheck, 
  BarChart3, 
  Eye, 
  Settings,
  Mail,
  MessageSquare,
  DollarSign,
  FileText
} from 'lucide-react';
import { AppView, WatcherStatus, VaultFile } from './types';

export const NAVIGATION_ITEMS = [
  { view: AppView.DASHBOARD, label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { view: AppView.VAULT, label: 'Vault Explorer', icon: <FolderLock size={20} /> },
  { view: AppView.APPROVALS, label: 'Approval Queue', icon: <UserCheck size={20} /> },
  { view: AppView.CEO_BRIEFING, label: 'CEO Briefing', icon: <BarChart3 size={20} /> },
  { view: AppView.WATCHERS, label: 'Watchers', icon: <Eye size={20} /> },
  { view: AppView.SETTINGS, label: 'Settings', icon: <Settings size={20} /> },
];

export const INITIAL_WATCHERS: WatcherStatus[] = [
  { id: '1', name: 'Gmail Sentinel', status: 'active', lastRun: '2 mins ago', type: 'gmail' },
  { id: '2', name: 'WhatsApp Monitor', status: 'active', lastRun: '30s ago', type: 'whatsapp' },
  { id: '3', name: 'Bank Sync', status: 'idle', lastRun: '1 hour ago', type: 'finance' },
  { id: '4', name: 'Filesystem Watcher', status: 'active', lastRun: 'Just now', type: 'filesystem' },
];

export const MOCK_VAULT: VaultFile[] = [
  { 
    id: 'f1', 
    name: 'Dashboard.md', 
    path: '/', 
    content: '# Dashboard\nWelcome to your Digital FTE.', 
    type: 'markdown', 
    lastModified: '2026-01-07T08:00:00Z',
    versions: [
      { id: 'v1', content: '# Dashboard\nInitial creation.', timestamp: '2026-01-06T10:00:00Z', author: 'AI Employee', changeSummary: 'System initialization' }
    ]
  },
  { 
    id: 'f2', 
    name: 'Company_Handbook.md', 
    path: '/', 
    content: '# Rules of Engagement\n1. Always require approval for payments over $100.', 
    type: 'markdown', 
    lastModified: '2026-01-07T08:00:00Z',
    versions: [
      { id: 'v2', content: '# Handbook\nv1.0', timestamp: '2026-01-05T09:00:00Z', author: 'CEO', changeSummary: 'Draft version' }
    ]
  },
  { 
    id: 'p1', 
    name: 'PAYMENT_Invoice_123.md', 
    path: '/Pending_Approval', 
    content: '---\ntype: approval_request\namount: 500.00\nrecipient: AWS Cloud\n---\nPayment for December hosting.', 
    type: 'markdown', 
    status: 'pending',
    lastModified: '2026-01-07T10:30:00Z' 
  }
];

export const MOCK_TRANSACTIONS = [
  { date: '2026-01-01', description: 'Stripe Payout', amount: 2500, category: 'Revenue' },
  { date: '2026-01-02', description: 'Adobe Subscription', amount: -52, category: 'Software' },
  { date: '2026-01-03', description: 'Upwork Payment', amount: -400, category: 'Service' },
  { date: '2026-01-04', description: 'Stripe Payout', amount: 1200, category: 'Revenue' },
  { date: '2026-01-05', description: 'DigitalOcean', amount: -20, category: 'Hosting' },
];
