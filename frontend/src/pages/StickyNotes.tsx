import { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  StickyNote as NoteIcon, Plus, Search, Pin, Trash2, Edit3, X, Clock, Sparkles
} from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import { StickyNote } from '../types';
import { formatDate } from '../utils/dateUtils';
import toast from 'react-hot-toast';
import { BentoGrid, BentoCard, MetricCard } from '../components/bento/Bento';

const NOTE_STYLES: Record<StickyNote['color'], { 
  bg: string; 
  dotBg: string;
  border: string; 
  headerBg: string; 
  text: string; 
  tape: string;
  shadow: string;
}> = {
  yellow: {
    bg: '#FCF8EC',
    dotBg: '#D4AF37',
    border: '#EAD69B',
    headerBg: '#F7EDD0',
    text: '#5C4412',
    tape: 'rgba(212, 175, 55, 0.50)',
    shadow: '0 4px 12px -2px rgba(23, 25, 31, 0.06), 0 2px 4px -1px rgba(23, 25, 31, 0.04)',
  },
  blue: {
    bg: '#EFF4FF',
    dotBg: '#2563EB',
    border: '#BFD3FE',
    headerBg: '#DBE6FE',
    text: '#1E3A8A',
    tape: 'rgba(37, 99, 235, 0.45)',
    shadow: '0 4px 12px -2px rgba(23, 25, 31, 0.06), 0 2px 4px -1px rgba(23, 25, 31, 0.04)',
  },
  pink: {
    bg: '#FBF3F1',
    dotBg: '#B86B58',
    border: '#E8C6BD',
    headerBg: '#F5E3DE',
    text: '#6E3224',
    tape: 'rgba(184, 107, 88, 0.50)',
    shadow: '0 4px 12px -2px rgba(23, 25, 31, 0.06), 0 2px 4px -1px rgba(23, 25, 31, 0.04)',
  },
  orange: {
    bg: '#FDF5EE',
    dotBg: '#C27648',
    border: '#EED2B8',
    headerBg: '#F9E7D4',
    text: '#743D1B',
    tape: 'rgba(194, 118, 72, 0.48)',
    shadow: '0 4px 12px -2px rgba(23, 25, 31, 0.06), 0 2px 4px -1px rgba(23, 25, 31, 0.04)',
  },
  green: {
    bg: '#F8F9FC',
    dotBg: '#647084',
    border: '#DCE1EC',
    headerBg: '#EEF1F7',
    text: '#232730',
    tape: 'rgba(100, 112, 132, 0.38)',
    shadow: '0 4px 12px -2px rgba(23, 25, 31, 0.06), 0 2px 4px -1px rgba(23, 25, 31, 0.04)',
  },
  purple: {
    bg: '#F4F0FA',
    dotBg: '#5E359E',
    border: '#D6C7EE',
    headerBg: '#EAE2F6',
    text: '#3B1D5E',
    tape: 'rgba(94, 53, 158, 0.48)',
    shadow: '0 4px 12px -2px rgba(23, 25, 31, 0.06), 0 2px 4px -1px rgba(23, 25, 31, 0.04)',
  },
};

const NOTE_COLORS: StickyNote['color'][] = ['yellow', 'blue', 'pink', 'orange', 'green', 'purple'];

export default function StickyNotes() {
  const { notes, addNote, updateNote, deleteNote } = useAppData();
  const [searchQuery, setSearchQuery] = useState('');
  const [colorFilter, setColorFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<StickyNote | null>(null);

  // Form state
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteColor, setNoteColor] = useState<StickyNote['color']>('yellow');
  const [isPinned, setIsPinned] = useState(false);

  // Filter & sort notes (pinned first, then by updated_at)
  const filteredNotes = useMemo(() => {
    return notes
      .filter(n => {
        if (colorFilter !== 'all' && n.color !== colorFilter) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          return n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q);
        }
        return true;
      })
      .sort((a, b) => {
        if (a.is_pinned && !b.is_pinned) return -1;
        if (!a.is_pinned && b.is_pinned) return 1;
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      });
  }, [notes, searchQuery, colorFilter]);

  const openCreateModal = (color: StickyNote['color'] = 'yellow') => {
    setEditingNote(null);
    setNoteTitle('');
    setNoteContent('');
    setNoteColor(color);
    setIsPinned(false);
    setIsModalOpen(true);
  };

  const openEditModal = (note: StickyNote) => {
    setEditingNote(note);
    setNoteTitle(note.title);
    setNoteContent(note.content);
    setNoteColor(note.color);
    setIsPinned(note.is_pinned);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim() && !noteContent.trim()) {
      toast.error('Note cannot be completely empty');
      return;
    }

    if (editingNote) {
      updateNote(editingNote.id, {
        title: noteTitle.trim() || 'Untitled Note',
        content: noteContent.trim(),
        color: noteColor,
        is_pinned: isPinned,
      });
      toast.success('Note updated');
    } else {
      addNote({
        title: noteTitle.trim() || 'Untitled Note',
        content: noteContent.trim(),
        color: noteColor,
        is_pinned: isPinned,
      });
      toast.success('Sticky note created');
    }
    setIsModalOpen(false);
  };

  const togglePin = (note: StickyNote, e: React.MouseEvent) => {
    e.stopPropagation();
    updateNote(note.id, { is_pinned: !note.is_pinned });
    toast.success(note.is_pinned ? 'Unpinned note' : 'Pinned note to top 📌');
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteNote(id);
    toast.success('Note deleted');
  };

  const pinnedCount = notes.filter(n => n.is_pinned).length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Bento Header Feature Card */}
      <BentoCard span="full" variant="feature" className="p-5 md:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-2.5 tracking-tight">
              <NoteIcon size={22} className="text-amber-500" />
              Sticky Notes Workspace
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Quick thoughts, meeting reminders, code snippets, and creative scratchpad
            </p>
          </div>

          <button
            type="button"
            onClick={() => openCreateModal()}
            className="flex items-center gap-1.5 px-4 py-2.5 gradient-primary hover:gradient-primary-hover text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm shadow-indigo-500/25 hover:shadow-md shrink-0"
          >
            <Plus size={16} />
            <span>+ Add New Note</span>
          </button>
        </div>
      </BentoCard>

      {/* Bento Metric KPI Tiles */}
      <BentoGrid>
        <MetricCard label="Total Notes" value={notes.length} icon={NoteIcon} tone="amber" hint="Ideas and scratchpad entries" />
        <MetricCard label="Pinned to Top" value={pinnedCount} valueClassName="text-indigo-600" icon={Pin} tone="indigo" hint="High visibility notes" />
        <MetricCard label="Color Tones" value={NOTE_COLORS.length} icon={Sparkles} tone="violet" hint="Categorized by color" />
        <MetricCard label="Canvas Status" value="Active" valueClassName="text-emerald-600" icon={NoteIcon} tone="emerald" hint="Auto-saved to local workspace" />
      </BentoGrid>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 md:p-3.5 rounded-2xl border border-slate-200/90 shadow-xs text-xs">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes content or title..."
            className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all placeholder:text-slate-400"
          />
        </div>

        {/* Color Palette Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-slate-500 font-bold text-xs">Filter:</span>
          <button
            onClick={() => setColorFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              colorFilter === 'all' 
                ? 'gradient-primary text-white shadow-2xs' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All ({notes.length})
          </button>
          {NOTE_COLORS.map(c => {
            const count = notes.filter(n => n.color === c).length;
            const style = NOTE_STYLES[c];
            return (
              <button
                key={c}
                onClick={() => setColorFilter(colorFilter === c ? 'all' : c)}
                className={`w-6 h-6 rounded-full border transition-transform cursor-pointer flex items-center justify-center ${
                  colorFilter === c ? 'scale-125 ring-2 ring-indigo-600 ring-offset-2' : 'hover:scale-110'
                }`}
                style={{ backgroundColor: style.dotBg, borderColor: style.border }}
                title={`Filter ${c} (${count})`}
              />
            );
          })}
        </div>
      </div>

      {/* Sticky Notes Canvas */}
      <div className="bg-white/90 rounded-3xl border border-slate-200/90 p-6 md:p-8 shadow-sm min-h-[500px]">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          
          {/* Add Note Quick Tile */}
          <div
            onClick={() => openCreateModal()}
            className="group min-h-[220px] rounded-2xl border-2 border-dashed border-indigo-200 hover:border-indigo-500 bg-indigo-50/20 hover:bg-indigo-50/50 flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
          >
            <div className="w-12 h-12 rounded-2xl bg-white shadow-xs group-hover:gradient-primary group-hover:text-white flex items-center justify-center text-indigo-600 transition-all mb-3 border border-indigo-100">
              <Plus size={24} className="group-hover:rotate-90 transition-transform duration-200" />
            </div>
            <span className="text-xs font-black text-slate-800 group-hover:text-indigo-600 transition-colors">New Sticky Note</span>
            <span className="text-[11px] text-slate-400 mt-1">Capture ideas instantly</span>
          </div>

          {/* Render Notes */}
          {filteredNotes.map(note => {
            const style = NOTE_STYLES[note.color] || NOTE_STYLES.yellow;
            return (
              <div
                key={note.id}
                onClick={() => openEditModal(note)}
                className="group relative rounded-2xl p-5 hover:-translate-y-1 transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[210px] border"
                style={{ 
                  backgroundColor: style.bg,
                  borderColor: style.border,
                  boxShadow: style.shadow,
                }}
              >
                {/* Visual Tape Strip */}
                <div
                  className="absolute -top-2 left-1/2 -translate-x-1/2 w-14 h-4 rounded-xs shadow-2xs rotate-[-1deg] pointer-events-none"
                  style={{ backgroundColor: style.tape }}
                />

                {/* Top Controls */}
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-xs font-bold truncate flex-1" style={{ color: style.text }}>
                      {note.title}
                    </h3>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={(e) => togglePin(note, e)}
                        className={`p-1 rounded-md cursor-pointer transition-colors ${
                          note.is_pinned ? 'text-indigo-600 fill-indigo-600' : 'text-slate-400 hover:text-indigo-600'
                        }`}
                        title={note.is_pinned ? 'Unpin' : 'Pin to top'}
                      >
                        <Pin size={14} className={note.is_pinned ? 'fill-current text-indigo-600' : ''} />
                      </button>
                      <button
                        onClick={(e) => handleDelete(note.id, e)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded-md cursor-pointer transition-colors"
                        title="Delete note"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Note Body (Standard English font) */}
                  <p 
                    className="text-xs md:text-sm font-medium leading-relaxed whitespace-pre-wrap line-clamp-5 mt-1.5"
                    style={{ color: style.text }}
                  >
                    {note.content}
                  </p>
                </div>

                {/* Footer with Timestamp */}
                <div 
                  className="pt-3 border-t flex items-center justify-between text-[11px] font-bold"
                  style={{ borderColor: 'rgba(0, 0, 0, 0.1)', color: style.text }}
                >
                  <span className="flex items-center gap-1.5 opacity-90">
                    <Clock size={11} />
                    {formatDate(note.updated_at)}
                  </span>
                  <Edit3 size={13} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            );
          })}
        </div>

        {filteredNotes.length === 0 && (
          <div className="text-center py-16">
            <p className="text-xs font-semibold text-slate-400">No notes found matching your search.</p>
          </div>
        )}
      </div>

      {/* Note Editor Modal */}
      {isModalOpen && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden animate-scale-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60">
              <h3 className="text-sm font-bold text-slate-900">
                {editingNote ? 'Edit Sticky Note' : 'Create Sticky Note'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                <X size={17} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Title</label>
                <input
                  type="text"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  placeholder="e.g. System Design Ideas"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Content *</label>
                <textarea
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Write your note here..."
                  rows={5}
                  required
                  className="w-full px-3.5 py-2.5 text-xs md:text-sm font-medium rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 resize-none transition-all leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">Color Palette</label>
                  <div className="flex items-center gap-2.5">
                    {NOTE_COLORS.map(c => {
                      const s = NOTE_STYLES[c];
                      return (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setNoteColor(c)}
                          className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer shadow-2xs ${
                            noteColor === c ? 'scale-125 ring-2 ring-indigo-600 ring-offset-2' : 'hover:scale-110'
                          }`}
                          style={{ backgroundColor: s.dotBg, borderColor: s.border }}
                          title={c}
                        />
                      );
                    })}
                  </div>
                </div>

                <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer pt-3">
                  <input
                    type="checkbox"
                    checked={isPinned}
                    onChange={(e) => setIsPinned(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                  />
                  <span>Pin to top</span>
                </label>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold gradient-primary hover:gradient-primary-hover text-white rounded-xl shadow-xs cursor-pointer"
                >
                  {editingNote ? 'Save Changes' : 'Create Note'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
