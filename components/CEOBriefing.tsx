
import React, { useState, useEffect } from 'react';
import { CEOReport, Transaction } from '../types';
import { generateCEOBriefing } from '../services/geminiService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, AreaChart, Area } from 'recharts';
import { Loader2, Zap, Target, AlertCircle, Sparkles, RefreshCw } from 'lucide-react';
import { MOCK_TRANSACTIONS } from '../constants';

const CEOBriefing: React.FC = () => {
  const [report, setReport] = useState<CEOReport | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = async () => {
    setLoading(true);
    const result = await generateCEOBriefing(MOCK_TRANSACTIONS, [{ id: 1, title: 'Invoice Client A', status: 'done' }]);
    if (result) setReport(result);
    setLoading(false);
  };

  useEffect(() => {
    fetchReport();
  }, []);

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-4 animate-pulse">
        <Loader2 className="animate-spin text-indigo-500" size={48} />
        <p className="text-slate-400 font-medium italic">Gemini is auditing your business metrics...</p>
      </div>
    );
  }

  const chartData = MOCK_TRANSACTIONS.map(t => ({ name: t.date.split('-')[2], amount: Math.abs(t.amount) }));

  return (
    <div className="space-y-6 overflow-y-auto pb-10">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">
            Monday Morning CEO Briefing
          </h2>
          <p className="text-slate-400">Autonomous business audit powered by Gemini 3 Flash Reasoning.</p>
        </div>
        <button 
          onClick={fetchReport}
          className="p-3 bg-slate-800 rounded-full hover:bg-slate-700 transition-colors"
        >
          <RefreshCw size={20} className="text-indigo-400" />
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-800 border border-slate-700 rounded-3xl p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-xl flex items-center gap-3">
              <Zap className="text-amber-400" />
              Revenue Performance
            </h3>
            <div className="flex gap-4">
              <div className="text-right">
                <div className="text-xs text-slate-500 font-bold uppercase tracking-widest">This Week</div>
                <div className="text-2xl font-bold text-emerald-400">${report?.revenue.toLocaleString()}</div>
              </div>
              <div className="w-px bg-slate-700 h-10"></div>
              <div className="text-right">
                <div className="text-xs text-slate-500 font-bold uppercase tracking-widest">MTD Target</div>
                <div className="text-2xl font-bold text-slate-200">${report?.mtdRevenue.toLocaleString()}</div>
              </div>
            </div>
          </div>
          
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', fontSize: '12px' }} 
                  itemStyle={{ color: '#818cf8' }}
                />
                <Area type="monotone" dataKey="amount" stroke="#6366f1" fillOpacity={1} fill="url(#colorAmt)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <AlertCircle className="text-red-400" size={18} />
              Bottlenecks
            </h3>
            <div className="space-y-3">
              {report?.bottlenecks.map((b, i) => (
                <div key={i} className="p-3 bg-red-900/10 border border-red-900/20 rounded-xl text-sm text-red-200">
                  {b}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Sparkles className="text-indigo-400" size={18} />
              AI Suggestions
            </h3>
            <div className="space-y-3">
              {report?.suggestions.map((s, i) => (
                <div key={i} className="p-3 bg-indigo-900/10 border border-indigo-900/20 rounded-xl text-sm text-indigo-200">
                  {s}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6">
        <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
          <Target className="text-emerald-400" size={18} />
          KPI Deep-Dive (This Period)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: 'Client Response Time', value: '1.2h', target: '< 24h', color: 'emerald' },
            { label: 'Invoice Collection Rate', value: '94%', target: '90%', color: 'emerald' },
            { label: 'SaaS Burn Rate', value: '$480', target: '< $500', color: 'amber' },
          ].map((kpi, i) => (
            <div key={i} className="flex justify-between items-center p-4 bg-slate-900/50 rounded-2xl border border-slate-700/50">
              <div>
                <div className="text-xs text-slate-500 font-bold mb-1 uppercase tracking-tighter">{kpi.label}</div>
                <div className="text-xl font-bold">{kpi.value}</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase">Target</div>
                <div className="text-xs font-mono font-bold text-slate-300">{kpi.target}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CEOBriefing;
