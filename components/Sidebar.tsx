
import React from 'react';
import { NAVIGATION_ITEMS } from '../constants';
import { AppView } from '../types';
import { Terminal } from 'lucide-react';

interface SidebarProps {
  currentView: AppView;
  onViewChange: (view: AppView) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange }) => {
  return (
    <div className="w-64 h-full bg-slate-950 border-r border-slate-800 flex flex-col">
      <div className="p-6 flex items-center gap-3 border-b border-slate-800">
        <div className="bg-indigo-600 p-2 rounded-lg">
          <Terminal size={24} className="text-white" />
        </div>
        <div>
          <h1 className="font-bold text-lg text-slate-100">Digital FTE</h1>
          <p className="text-xs text-slate-500 font-medium">V1.0 ALPHA</p>
        </div>
      </div>
      
      <nav className="flex-1 py-4 px-3 space-y-1">
        {NAVIGATION_ITEMS.map((item) => (
          <button
            key={item.view}
            onClick={() => onViewChange(item.view)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${
              currentView === item.view 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' 
                : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-900 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-xs text-slate-300 font-semibold uppercase tracking-wider">Engine: Gemini 3 Flash</span>
          </div>
          <div className="text-[10px] text-slate-500 leading-tight">
            Local sync active. 14 pending events in queue.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
