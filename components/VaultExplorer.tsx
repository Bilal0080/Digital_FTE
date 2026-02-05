
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { VaultFile, FileVersion } from '../types';
import { 
  File, Folder, Search, Edit3, Trash2, FileSearch, Sparkles, X, 
  Loader2, BrainCircuit, Calendar, Hash, Type as TypeIcon, Info, 
  ChevronRight, ArrowUp, ArrowDown, Home, FolderPlus, Upload, Plus,
  Copy, CheckCircle2, FileUp, AlertCircle, ListChecks, Zap, History,
  RotateCcw, User as UserIcon, Bot, FileText
} from 'lucide-react';
import { getAIReasoning } from '../services/geminiService';

interface VaultExplorerProps {
  files: VaultFile[];
  onAddFile?: (file: VaultFile) => void;
  onUpdateFile?: (fileId: string, content: string, author: 'CEO' | 'AI Employee', summary: string) => void;
  onRevertFile?: (fileId: string, versionId: string) => void;
}

type SortKey = 'name' | 'type' | 'lastModified';
type SortDirection = 'asc' | 'desc';

interface AIAnalysis {
  summary: string;
  actionItems: string[];
  priority: 'low' | 'medium' | 'high';
  timestamp: string;
}

const VaultExplorer: React.FC<VaultExplorerProps> = ({ files, onAddFile, onUpdateFile, onRevertFile }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPath, setCurrentPath] = useState('/');
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [selectedFileForPreview, setSelectedFileForPreview] = useState<VaultFile | null>(null);
  const [previewTab, setPreviewTab] = useState<'content' | 'history'>('content');
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection }>({
    key: 'name',
    direction: 'asc',
  });
  
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [newFolderName, setNewFolderName] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ current: number, total: number } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileAnalyses, setFileAnalyses] = useState<Record<string, AIAnalysis>>({});

  // Sync selected file state when vault updates
  useEffect(() => {
    if (selectedFileForPreview) {
      const updated = files.find(f => f.id === selectedFileForPreview.id);
      if (updated) setSelectedFileForPreview(updated);
    }
  }, [files]);

  const normalizePath = (p: string) => {
    if (!p || p === '/') return '/';
    return p.endsWith('/') ? p.slice(0, -1) : p;
  };

  const handleSort = (key: SortKey) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const breadcrumbs = useMemo(() => {
    const normalized = normalizePath(currentPath);
    if (normalized === '/') return [{ name: 'Root', path: '/' }];
    
    const parts = normalized.split('/').filter(Boolean);
    const crumbs = [{ name: 'Root', path: '/' }];
    let runningPath = '';
    
    parts.forEach(part => {
      runningPath += `/${part}`;
      crumbs.push({ name: part, path: runningPath });
    });
    
    return crumbs;
  }, [currentPath]);

  const getSearchSnippet = (content: string, term: string) => {
    if (!term) return null;
    const index = content.toLowerCase().indexOf(term.toLowerCase());
    if (index === -1) return null;

    const start = Math.max(0, index - 40);
    const end = Math.min(content.length, index + term.length + 40);
    let snippet = content.substring(start, end);
    
    if (start > 0) snippet = '...' + snippet;
    if (end < content.length) snippet = snippet + '...';

    return snippet;
  };

  const displayedItems = useMemo(() => {
    let results: any[] = [];
    const term = searchTerm.toLowerCase().trim();

    if (term) {
      results = files.filter(f => 
        f.name.toLowerCase().includes(term) || 
        f.path.toLowerCase().includes(term) || 
        f.content.toLowerCase().includes(term)
      ).map(f => ({
        ...f,
        isDir: false,
        snippet: getSearchSnippet(f.content, term)
      }));
    } else {
      const normalizedCurrent = normalizePath(currentPath);
      const immediateFiles = files.filter(f => normalizePath(f.path) === normalizedCurrent);
      
      const subfolders = Array.from(new Set(
        files
          .filter(f => {
            const normalizedFilePath = normalizePath(f.path);
            return normalizedFilePath.startsWith(normalizedCurrent) && normalizedFilePath !== normalizedCurrent;
          })
          .map(f => {
            const relative = normalizePath(f.path).slice(normalizedCurrent === '/' ? 1 : normalizedCurrent.length + 1);
            return relative.split('/')[0];
          })
          .filter(Boolean)
      )).map(folderName => ({
        id: `dir-${folderName}`,
        name: folderName,
        type: 'folder' as const,
        path: normalizedCurrent === '/' ? `/${folderName}` : `${normalizedCurrent}/${folderName}`,
        isDir: true
      }));

      results = [
        ...subfolders,
        ...immediateFiles.map(f => ({ ...f, isDir: false }))
      ];
    }

    return results.sort((a, b) => {
      if (a.isDir && !b.isDir) return -1;
      if (!a.isDir && b.isDir) return 1;

      const { key, direction } = sortConfig;
      let comparison = 0;

      if (key === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (key === 'type') {
        comparison = (a.type || '').localeCompare(b.type || '');
      } else if (key === 'lastModified') {
        const dateA = 'lastModified' in a ? new Date(a.lastModified).getTime() : 0;
        const dateB = 'lastModified' in b ? new Date(b.lastModified).getTime() : 0;
        comparison = dateA - dateB;
      }

      return direction === 'asc' ? comparison : -comparison;
    });
  }, [files, currentPath, searchTerm, sortConfig]);

  const handleDeepAudit = async (file: VaultFile) => {
    setAnalyzingId(file.id);
    try {
      const prompt = `
        Perform a Deep Audit on this file for a CEO.
        File: ${file.name}
        Content: ${file.content}
        
        Provide structured SUMMARY, ACTIONS, and PRIORITY.
      `;
      
      const result = await getAIReasoning(file.content, prompt);
      
      const summaryMatch = result.match(/SUMMARY: (.*)/);
      const actionsMatch = result.match(/ACTIONS: (.*)/);
      const priorityMatch = result.match(/PRIORITY: (.*)/);

      const analysis: AIAnalysis = {
        summary: summaryMatch?.[1] || "Analyzed content.",
        actionItems: actionsMatch?.[1].split('|').map(s => s.replace('- ', '').trim()) || ["Review details."],
        priority: (priorityMatch?.[1].toLowerCase().includes('high') ? 'high' : 
                   priorityMatch?.[1].toLowerCase().includes('medium') ? 'medium' : 'low') as any,
        timestamp: new Date().toISOString()
      };

      setFileAnalyses(prev => ({ ...prev, [file.id]: analysis }));
      setSelectedFileForPreview(file);
    } catch (error) {
      console.error("Analysis failed:", error);
    } finally {
      setAnalyzingId(null);
    }
  };

  const processFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const total = fileList.length;
    setUploadProgress({ current: 0, total });
    for (let i = 0; i < total; i++) {
      const file = fileList[i];
      const content = await file.text();
      await new Promise(resolve => setTimeout(resolve, 300));
      const newFile: VaultFile = {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        path: currentPath,
        content: content,
        type: file.name.endsWith('.json') ? 'json' : file.name.endsWith('.pdf') ? 'pdf' : file.name.endsWith('.csv') ? 'csv' : 'markdown',
        lastModified: new Date().toISOString()
      };
      onAddFile?.(newFile);
      setUploadProgress(prev => prev ? { ...prev, current: i + 1 } : null);
    }
    setTimeout(() => setUploadProgress(null), 1000);
  };

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = () => { setIsDragging(false); };
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false); processFiles(e.dataTransfer.files);
  };

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    const dummyFile: VaultFile = {
      id: Math.random().toString(36).substr(2, 9),
      name: '.keep',
      path: currentPath === '/' ? `/${newFolderName}` : `${currentPath}/${newFolderName}`,
      content: '',
      type: 'markdown',
      lastModified: new Date().toISOString()
    };
    onAddFile?.(dummyFile);
    setNewFolderName('');
    setIsFolderModalOpen(false);
  };

  const handleOpenEdit = () => {
    if (!selectedFileForPreview) return;
    setEditContent(selectedFileForPreview.content);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = () => {
    if (!selectedFileForPreview) return;
    onUpdateFile?.(selectedFileForPreview.id, editContent, 'CEO', 'Manual user edit');
    setIsEditModalOpen(false);
  };

  const handleRevert = (version: FileVersion) => {
    if (!selectedFileForPreview) return;
    if (confirm(`Are you sure you want to revert to the version from ${new Date(version.timestamp).toLocaleString()}? Current content will be saved as a new version.`)) {
      onRevertFile?.(selectedFileForPreview.id, version.id);
      setPreviewTab('content');
    }
  };

  const renderSortIcon = (key: SortKey) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? <ArrowUp size={12} className="ml-1 inline" /> : <ArrowDown size={12} className="ml-1 inline" />;
  };

  return (
    <div 
      className="h-full flex flex-col space-y-4 animate-in fade-in duration-500 relative"
      onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
    >
      {isDragging && (
        <div className="absolute inset-0 z-50 bg-indigo-600/10 backdrop-blur-sm border-2 border-dashed border-indigo-500 rounded-3xl flex flex-col items-center justify-center pointer-events-none">
          <Upload size={48} className="text-white animate-bounce" />
          <h2 className="text-2xl font-bold text-indigo-100">Drop to index in {currentPath}</h2>
        </div>
      )}

      {uploadProgress && (
        <div className="absolute top-4 right-4 z-[60] bg-slate-900 border border-slate-700 p-4 rounded-2xl shadow-2xl flex items-center gap-4">
          <div className="text-sm font-bold text-indigo-400">Indexing: {Math.round(uploadProgress.current / uploadProgress.total * 100)}%</div>
        </div>
      )}

      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold">Vault Explorer</h2>
          <p className="text-slate-400">Content-indexed search & AI-powered auditing.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              type="text" placeholder="Search content, names, or paths..." value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 w-full shadow-sm"
            />
          </div>
          <button onClick={() => fileInputRef.current?.click()} className="p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-300 hover:text-indigo-400" title="Upload Files"><Upload size={20} /></button>
          <button onClick={() => setIsFolderModalOpen(true)} className="p-2.5 bg-indigo-600 rounded-xl text-white hover:bg-indigo-500 shadow-lg" title="New Folder"><FolderPlus size={20} /></button>
          <input type="file" ref={fileInputRef} multiple className="hidden" onChange={(e) => processFiles(e.target.files)} accept=".md,.txt,.json,.csv" />
        </div>
      </header>

      {!searchTerm && (
        <div className="flex items-center justify-between bg-slate-900/40 p-1.5 pr-4 rounded-xl border border-slate-800">
          <nav className="flex items-center gap-1 text-sm overflow-x-auto whitespace-nowrap">
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={crumb.path}>
                {idx > 0 && <ChevronRight size={14} className="text-slate-700 flex-shrink-0" />}
                <button onClick={() => setCurrentPath(crumb.path)} className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-2 ${currentPath === crumb.path ? 'bg-indigo-600/10 text-indigo-400 font-bold border border-indigo-500/20' : 'text-slate-400 hover:text-slate-200'}`}>
                  {crumb.path === '/' ? <Home size={14} /> : null}
                  <span>{crumb.name}</span>
                </button>
              </React.Fragment>
            ))}
          </nav>
        </div>
      )}

      <div className="flex-1 flex gap-6 min-h-0">
        <div className={`flex-1 bg-slate-800 border border-slate-700 rounded-3xl overflow-hidden shadow-xl flex flex-col ${selectedFileForPreview ? 'hidden lg:flex' : 'flex'}`}>
          {displayedItems.length > 0 ? (
            <div className="overflow-y-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-900/50 text-slate-500 text-xs font-bold uppercase tracking-wider sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-4 cursor-pointer hover:text-indigo-400 transition-colors" onClick={() => handleSort('name')}>Name {renderSortIcon('name')}</th>
                    <th className="px-6 py-4 hidden sm:table-cell cursor-pointer hover:text-indigo-400 transition-colors" onClick={() => handleSort('type')}>Type {renderSortIcon('type')}</th>
                    <th className="px-6 py-4 hidden xl:table-cell">Details</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {displayedItems.map((item) => {
                    const isDir = item.isDir;
                    const analysis = !isDir ? fileAnalyses[item.id] : null;
                    return (
                      <tr 
                        key={item.id} 
                        onClick={() => isDir ? setCurrentPath(item.path) : setSelectedFileForPreview(item as VaultFile)}
                        className={`transition-colors group cursor-pointer ${selectedFileForPreview?.id === item.id ? 'bg-indigo-600/10 border-l-2 border-l-indigo-500' : 'hover:bg-slate-700/30'}`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${isDir ? 'bg-indigo-900/40 text-indigo-400' : selectedFileForPreview?.id === item.id ? 'bg-indigo-600 text-white' : 'bg-slate-900 group-hover:bg-slate-700'}`}>
                              {isDir ? <Folder size={16} /> : <File size={16} />}
                            </div>
                            <div className="flex flex-col min-w-0 max-w-md">
                              <span className={`font-medium truncate ${isDir ? 'text-indigo-300' : 'text-slate-200'}`}>{item.name}</span>
                              {searchTerm && item.snippet && <span className="text-[10px] text-slate-500 mt-1 italic font-mono truncate">{item.snippet}</span>}
                              {analysis && <span className={`text-[9px] w-fit mt-1 px-1.5 py-0.5 rounded font-black uppercase ${analysis.priority === 'high' ? 'bg-red-500/20 text-red-400' : analysis.priority === 'medium' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>{analysis.priority} PRIORITY</span>}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-400 hidden sm:table-cell capitalize">{isDir ? 'Folder' : item.type}</td>
                        <td className="px-6 py-4 hidden xl:table-cell text-xs text-slate-500 italic truncate max-w-[200px]">{!isDir && item.versions && item.versions.length > 0 ? `${item.versions.length} prior versions` : analysis ? analysis.summary : isDir ? item.path : 'No audit'}</td>
                        <td className="px-6 py-4 text-right flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                          {!isDir && <button onClick={() => handleDeepAudit(item as VaultFile)} className={`p-2 rounded-lg ${analysis ? 'bg-emerald-600/10 text-emerald-400' : 'bg-slate-900 text-indigo-400'}`}>{analyzingId === item.id ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}</button>}
                          {isDir ? <ChevronRight size={18} className="text-slate-600 m-2" /> : <Edit3 onClick={handleOpenEdit} size={16} className="text-slate-600 m-2 hover:text-indigo-400" />}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center h-full"><FileSearch size={48} className="text-slate-700 mb-4" /><h3 className="text-xl font-bold text-slate-300">No results found</h3><button onClick={() => setSearchTerm('')} className="mt-6 text-indigo-400 font-bold hover:underline">Clear search</button></div>
          )}
        </div>

        {selectedFileForPreview && (
          <div className="w-full lg:w-[500px] bg-slate-800 border border-slate-700 rounded-3xl shadow-2xl flex flex-col animate-in slide-in-from-right-4 overflow-hidden">
            <header className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-600 rounded-lg text-white"><File size={18} /></div>
                <div className="min-w-0"><h3 className="font-bold text-lg text-slate-100 truncate">{selectedFileForPreview.name}</h3><p className="text-xs text-slate-500 font-mono truncate">{selectedFileForPreview.path}</p></div>
              </div>
              <button onClick={() => { setSelectedFileForPreview(null); setPreviewTab('content'); }} className="p-2 hover:bg-slate-800 rounded-full text-slate-400"><X size={20} /></button>
            </header>

            <div className="flex bg-slate-900/30 p-1 mx-6 mt-4 rounded-xl border border-slate-700/50">
              <button 
                onClick={() => setPreviewTab('content')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${previewTab === 'content' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <FileText size={14} /> Content
              </button>
              <button 
                onClick={() => setPreviewTab('history')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${previewTab === 'history' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <History size={14} /> History {selectedFileForPreview.versions?.length ? `(${selectedFileForPreview.versions.length})` : ''}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-slate-900/20 space-y-6">
              {previewTab === 'content' ? (
                <>
                  {fileAnalyses[selectedFileForPreview.id] ? (
                    <div className="space-y-4">
                      <div className="bg-gradient-to-br from-indigo-900/40 to-slate-900 border border-indigo-500/30 rounded-2xl p-5 shadow-inner">
                        <div className="flex items-center justify-between mb-4">
                          <div className="text-indigo-300 text-[10px] font-black uppercase tracking-widest flex items-center gap-2"><Zap size={14} className="text-amber-400" /> AI Deep Audit</div>
                          <div className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${fileAnalyses[selectedFileForPreview.id].priority === 'high' ? 'bg-red-500 text-white' : fileAnalyses[selectedFileForPreview.id].priority === 'medium' ? 'bg-amber-500 text-black' : 'bg-emerald-500 text-white'}`}>{fileAnalyses[selectedFileForPreview.id].priority} Priority</div>
                        </div>
                        <p className="text-sm text-slate-100 font-medium">{fileAnalyses[selectedFileForPreview.id].summary}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 border-2 border-dashed border-slate-700 rounded-2xl flex flex-col items-center text-center"><BrainCircuit size={32} className="text-slate-700 mb-4" /><h4 className="text-sm font-bold text-slate-300">File Not Audited</h4><button onClick={() => handleDeepAudit(selectedFileForPreview)} className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold mt-4 flex items-center gap-2">Run Deep Audit</button></div>
                  )}
                  <div className="pt-4 border-t border-slate-700 space-y-4"><div className="text-xs text-slate-500 font-bold uppercase tracking-widest flex items-center gap-2"><Info size={14} /> Source Content</div><div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-700/50"><pre className="text-slate-400 text-xs leading-relaxed whitespace-pre-wrap font-mono max-h-96 overflow-y-auto">{selectedFileForPreview.content}</pre></div></div>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-2 flex items-center gap-2"><History size={14} /> Version Timeline</div>
                  {!selectedFileForPreview.versions || selectedFileForPreview.versions.length === 0 ? (
                    <div className="text-center py-10"><History size={24} className="text-slate-700 mx-auto mb-2" /><p className="text-slate-500 text-xs">No previous versions available for this file.</p></div>
                  ) : (
                    <div className="space-y-3 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-px before:bg-slate-800">
                      {selectedFileForPreview.versions.map((version) => (
                        <div key={version.id} className="relative pl-8 group">
                          <div className="absolute left-0 top-1.5 w-[22px] h-[22px] rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center z-10">
                            {version.author === 'CEO' ? <UserIcon size={12} className="text-emerald-400" /> : <Bot size={12} className="text-indigo-400" />}
                          </div>
                          <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-3 hover:border-slate-600 transition-colors">
                            <div className="flex justify-between items-start mb-1">
                              <span className="text-[10px] text-slate-400 font-mono">{new Date(version.timestamp).toLocaleString()}</span>
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-500 font-bold uppercase">{version.author}</span>
                            </div>
                            <p className="text-xs text-slate-300 font-medium mb-2">{version.changeSummary || 'No summary provided'}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] text-slate-600 font-mono italic truncate max-w-[150px]">{version.content.substring(0, 30)}...</span>
                              <button 
                                onClick={() => handleRevert(version)}
                                className="text-[10px] flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 font-bold py-1 px-2 rounded hover:bg-indigo-400/10 transition-colors"
                              >
                                <RotateCcw size={10} /> Revert to this
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <footer className="p-4 border-t border-slate-700 bg-slate-900/50 flex gap-2">
              <button onClick={handleOpenEdit} className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all text-sm"><Edit3 size={16} /> Edit Document</button>
              <button className="px-4 bg-slate-700 hover:bg-red-600/20 hover:text-red-400 text-slate-300 rounded-xl font-bold transition-all"><Trash2 size={16} /></button>
            </footer>
          </div>
        )}
      </div>

      {isFolderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-md shadow-2xl p-6">
            <div className="flex justify-between items-center mb-6"><div className="flex items-center gap-3"><FolderPlus size={20} className="text-indigo-400" /><h3 className="font-bold text-lg">New Folder</h3></div><button onClick={() => setIsFolderModalOpen(false)} className="p-1 text-slate-400"><X size={18} /></button></div>
            <input autoFocus value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} placeholder="Folder name..." className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-600" />
            <div className="flex gap-3 pt-4"><button onClick={() => setIsFolderModalOpen(false)} className="flex-1 px-4 py-2.5 bg-slate-800 text-slate-400 rounded-xl font-bold">Cancel</button><button onClick={handleCreateFolder} className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-bold">Create</button></div>
          </div>
        </div>
      )}

      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-4xl shadow-2xl p-6 flex flex-col h-[80vh]">
            <div className="flex justify-between items-center mb-6"><div className="flex items-center gap-3"><Edit3 size={20} className="text-indigo-400" /><h3 className="font-bold text-lg">Edit: {selectedFileForPreview?.name}</h3></div><button onClick={() => setIsEditModalOpen(false)} className="p-1 text-slate-400"><X size={18} /></button></div>
            <textarea 
              value={editContent} onChange={(e) => setEditContent(e.target.value)}
              className="flex-1 w-full bg-slate-950 border border-slate-800 rounded-2xl p-6 text-sm font-mono text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 resize-none custom-scrollbar"
            />
            <div className="flex gap-3 pt-4"><button onClick={() => setIsEditModalOpen(false)} className="flex-1 px-4 py-2.5 bg-slate-800 text-slate-400 rounded-xl font-bold">Discard</button><button onClick={handleSaveEdit} className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-bold shadow-lg">Save Version</button></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VaultExplorer;
