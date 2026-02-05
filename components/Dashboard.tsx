
import React from 'react';
import { DollarSign, MessageSquare, CheckCircle2, AlertTriangle, TrendingUp, Clock } from 'lucide-react';
import { WatcherStatus } from '../types';

interface DashboardProps {
  watchers: WatcherStatus[];
}

const Dashboard: React.FC<DashboardProps> = ({ watchers }) => {
  const stats = [
    { label: 'Bank Balance', value: '$12,450.80', icon: <DollarSign className="text-emerald-400" />, trend: '+12%' },
    { label: 'Pending Approvals', value: '4', icon: <AlertTriangle className="text-amber-400" />, trend: 'Urgent' },
    { label: 'Messages Triage', value: '18', icon: <MessageSquare className="text-blue-400" />, trend: 'Today' },
    { label: 'Tasks Done', value: '42', icon: <CheckCircle2 className="text-indigo-400" />, trend: 'This Week' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h2 className="text-3xl font-bold">Good morning, CEO</h2>
        <p className="text-slate-400 mt-1">Your personal FTE has completed 4 tasks while you were away.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-slate-800 border border-slate-700 p-5 rounded-2xl hover:border-slate-500 transition-colors cursor-default group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-slate-900 rounded-lg group-hover:scale-110 transition-transform">
                {stat.icon}
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                stat.trend === 'Urgent' ? 'bg-red-900/40 text-red-400' : 'bg-slate-900 text-slate-400'
              }`}>
                {stat.trend}
              </span>
            </div>
            <div className="text-slate-400 text-sm font-medium">{stat.label}</div>
            <div className="text-2xl font-bold mt-1">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-800 border border-slate-700 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <TrendingUp size={20} className="text-indigo-400" />
              Active Operations
            </h3>
            <button className="text-xs text-indigo-400 font-semibold hover:underline">View All</button>
          </div>
          <div className="space-y-4">
            {[
              { task: "Auditing Q1 SaaS Expenses", progress: 75, status: "Thinking" },
              { task: "Triage: WhatsApp Message from Client X", progress: 30, status: "Perceiving" },
              { task: "Generating Draft: Invoice #882", progress: 100, status: "Done" },
            ].map((op, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-200 font-medium">{op.task}</span>
                  <span className="text-indigo-400 text-xs font-bold uppercase">{op.status}</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-indigo-500 h-full transition-all duration-1000" style={{ width: `${op.progress}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
          <h3 className="font-bold text-lg flex items-center gap-2 mb-6">
            <Clock size={20} className="text-slate-400" />
            Watchers Health
          </h3>
          <div className="space-y-4">
            {watchers.map((w) => (
              <div key={w.id} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-xl border border-slate-700/50">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${w.status === 'active' ? 'bg-green-500' : 'bg-slate-600'}`}></div>
                  <span className="text-sm font-medium text-slate-300">{w.name}</span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">{w.lastRun}</span>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-xs font-bold transition-colors">
            Restart All Sentinels
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
