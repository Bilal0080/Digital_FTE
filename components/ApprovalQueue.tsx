
import React from 'react';
import { VaultFile } from '../types';
import { Check, X, Eye, FileText, ExternalLink } from 'lucide-react';

interface ApprovalQueueProps {
  files: VaultFile[];
  onAction: (fileId: string, action: 'approve' | 'reject') => void;
}

const ApprovalQueue: React.FC<ApprovalQueueProps> = ({ files, onAction }) => {
  const pendingFiles = files.filter(f => f.status === 'pending');

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Approval Queue</h2>
          <p className="text-slate-400">The Digital FTE requires your sign-off for sensitive actions.</p>
        </div>
        <div className="bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 px-4 py-2 rounded-full text-sm font-bold">
          {pendingFiles.length} Action Needed
        </div>
      </header>

      {pendingFiles.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-slate-800 rounded-3xl">
          <Check className="text-slate-700 mb-4" size={48} />
          <p className="text-slate-500 font-medium">No actions pending. Your FTE is running smoothly.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pendingFiles.map((file) => (
            <div key={file.id} className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden flex flex-col">
              <div className="p-5 border-b border-slate-700">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
                    <FileText size={14} />
                    Payment Authorization
                  </div>
                  <span className="text-[10px] text-slate-500">{new Date(file.lastModified).toLocaleTimeString()}</span>
                </div>
                <h4 className="font-bold text-lg mb-2">{file.name}</h4>
                <div className="bg-slate-900 rounded-xl p-4 font-mono text-xs text-slate-400 overflow-x-auto">
                  <pre>{file.content}</pre>
                </div>
              </div>
              
              <div className="p-4 bg-slate-800/50 flex gap-2">
                <button 
                  onClick={() => onAction(file.id, 'approve')}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <Check size={18} />
                  Approve & Execute
                </button>
                <button 
                  onClick={() => onAction(file.id, 'reject')}
                  className="px-4 bg-slate-700 hover:bg-red-600/20 hover:text-red-400 text-slate-300 rounded-xl font-bold transition-all"
                >
                  <X size={18} />
                </button>
                <button className="px-4 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl font-bold transition-all">
                  <Eye size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ApprovalQueue;
