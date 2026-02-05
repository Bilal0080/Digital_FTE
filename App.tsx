
import React, { useState, useEffect } from 'react';
import { AppView, VaultFile, WatcherStatus, FileVersion } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import VaultExplorer from './components/VaultExplorer';
import ApprovalQueue from './components/ApprovalQueue';
import CEOBriefing from './components/CEOBriefing';
import { INITIAL_WATCHERS, MOCK_VAULT } from './constants';
import { Bell, Search, User, LogOut } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [vault, setVault] = useState<VaultFile[]>(MOCK_VAULT);
  const [watchers, setWatchers] = useState<WatcherStatus[]>(INITIAL_WATCHERS);

  const handleApprovalAction = (fileId: string, action: 'approve' | 'reject') => {
    setVault(prev => prev.map(file => {
      if (file.id === fileId) {
        return { 
          ...file, 
          status: action === 'approve' ? 'done' : 'rejected',
          path: action === 'approve' ? '/Done' : '/Rejected',
          lastModified: new Date().toISOString()
        };
      }
      return file;
    }));
  };

  const handleAddFile = (newFile: VaultFile) => {
    setVault(prev => [...prev, { ...newFile, versions: [] }]);
  };

  const handleUpdateFile = (fileId: string, newContent: string, author: 'CEO' | 'AI Employee', summary: string) => {
    setVault(prev => prev.map(file => {
      if (file.id === fileId) {
        const newVersion: FileVersion = {
          id: Math.random().toString(36).substr(2, 9),
          content: file.content,
          timestamp: file.lastModified,
          author: file.content.includes('AI') ? 'AI Employee' : 'CEO', // simplified detection
          changeSummary: "System backup before update"
        };
        
        return {
          ...file,
          content: newContent,
          lastModified: new Date().toISOString(),
          versions: [newVersion, ...(file.versions || [])]
        };
      }
      return file;
    }));
  };

  const handleRevertFile = (fileId: string, versionId: string) => {
    setVault(prev => prev.map(file => {
      if (file.id === fileId && file.versions) {
        const versionToRestore = file.versions.find(v => v.id === versionId);
        if (versionToRestore) {
          // Add current state as a new version before reverting
          const currentAsVersion: FileVersion = {
            id: Math.random().toString(36).substr(2, 9),
            content: file.content,
            timestamp: file.lastModified,
            author: 'CEO',
            changeSummary: "Reverting to previous version"
          };

          return {
            ...file,
            content: versionToRestore.content,
            lastModified: new Date().toISOString(),
            versions: [currentAsVersion, ...file.versions.filter(v => v.id !== versionId)]
          };
        }
      }
      return file;
    }));
  };

  const renderView = () => {
    switch (currentView) {
      case AppView.DASHBOARD:
        return <Dashboard watchers={watchers} />;
      case AppView.VAULT:
        return <VaultExplorer 
          files={vault} 
          onAddFile={handleAddFile} 
          onUpdateFile={handleUpdateFile}
          onRevertFile={handleRevertFile}
        />;
      case AppView.APPROVALS:
        return <ApprovalQueue files={vault} onAction={handleApprovalAction} />;
      case AppView.CEO_BRIEFING:
        return <CEOBriefing />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <h2 className="text-2xl font-bold text-slate-500">Module Under Construction</h2>
            <p className="text-slate-600">This feature is part of the Silver Tier rollout.</p>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100 overflow-hidden">
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />
      
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-8 bg-slate-900/50 backdrop-blur-md z-10">
          <div className="flex items-center gap-4 flex-1">
            <div className="hidden md:flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700 w-full max-md">
              <Search size={16} className="text-slate-500" />
              <input 
                type="text" 
                placeholder="Search everything..." 
                className="bg-transparent border-none focus:outline-none text-sm w-full text-slate-300"
              />
              <span className="text-[10px] bg-slate-700 px-1.5 py-0.5 rounded text-slate-400 font-mono">⌘K</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button className="relative text-slate-400 hover:text-slate-100 transition-colors">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-[10px] text-white flex items-center justify-center rounded-full font-bold">4</span>
            </button>
            
            <div className="h-8 w-px bg-slate-800"></div>
            
            <div className="flex items-center gap-3 pl-2">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-bold leading-none">James Wilson</div>
                <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest mt-1">Founder / CEO</div>
              </div>
              <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center border-2 border-slate-800 shadow-xl overflow-hidden">
                <img src="https://picsum.photos/seed/user/200" alt="Profile" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </header>

        <section className="flex-1 p-8 overflow-y-auto custom-scrollbar">
          {renderView()}
        </section>
      </main>
    </div>
  );
};

export default App;
