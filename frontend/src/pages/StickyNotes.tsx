import { useState, useMemo } from 'react';
import { 
  StickyNote as NoteIcon, Plus, Search, Pin, Trash2, Edit3, X, Clock, Check 
} from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import { StickyNote } from '../types';
import { formatDate } from '../utils/dateUtils';
import toast from 'react-hot-toast';

const NOTE_STYLES: Record<StickyNote['color'], { 
  bg: string; 
  border: string; 
  headerBg: string; 
  text: string; 
  tape: string;
}> = {
  yellow: {
    bg: 'bg-[#FEF9C3]',
    border: 'border-[#FDE047]',
    headerBg: 'bg-[#FEF08A]',
    text: 'text-[#713F12]',
    tape: 'bg-[#FEF08A]/70',
  },
  blue: {
    bg: 'bg-[#E0F2FE]',
    border: 'border-[#BAE6FD]',
    headerBg: 'bg-[#BAE6FD]',
    text: 'text-[#075985]',
    tape: 'bg-[#BAE6FD]/70',
  },
  pink: {
    bg: 'bg-[#FCE7F3]',
    border: 'border-[#FBCFE8]',
    headerBg: 'bg-[#FBCFE8]',
    text: 'text-[#9D174D]',
    tape: 'bg-[#FBCFE8]/70',
  },
  orange: {
    bg: 'bg-[#FFEDD5]',
    border: 'border-[#FED7AA]',
    headerBg: 'bg-[#FED7AA]',
    text: 'text-[#9A3412]',
    tape: 'bg-[#FED7AA]/70',
  },
  green: {
    bg: 'bg-[#DCFCE7]',
    border: 'border-[#BBF7D0]',
    headerBg: 'bg-[#BBF7D0]',
    text: 'text-[#166534]',
    tape: 'bg-[#BBF7D0]/70',
  },
};

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
    toast.success(note.is_pinned ? 'Unpinned note' : 'Pinned note to top');
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteNote(id);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-border shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-primary flex items-center gap-2">
            <NoteIcon size={20} className="text-gold" />
            Sticky Notes Workspace
          </h1>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Quick thoughts, meeting reminders, code snippets, and creative sparks
          </p>
        </div>

        <button
          onClick={() => openCreateModal()}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-xs font-medium transition-colors cursor-pointer shadow-xs shrink-0"
        >
          <Plus size={14} />
          + Add New Note
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-border shadow-xs text-xs">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes content or title..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-border bg-background focus:outline-none focus:border-primary"
          />
        </div>

        {/* Color Palette Filters */}
        <div className="flex items-center gap-2">
          <span className="text-secondary-text font-medium text-[11px]">Filter:</span>
          <button
            onClick={() => setColorFilter('all')}
            className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
              colorFilter === 'all' ? 'bg-primary text-white' : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
            }`}
          >
            All ({notes.length})
          </button>
          {(['yellow', 'blue', 'pink', 'orange', 'green'] as StickyNote['color'][]).map(c => {
            const count = notes.filter(n => n.color === c).length;
            const style = NOTE_STYLES[c];
            return (
              <button
                key={c}
                onClick={() => setColorFilter(colorFilter === c ? 'all' : c)}
                className={`w-5 h-5 rounded-full border transition-transform cursor-pointer flex items-center justify-center ${
                  colorFilter === c ? 'scale-125 ring-2 ring-primary ring-offset-1' : ''
                } ${style.bg} ${style.border}`}
                title={`Filter ${c} (${count})`}
              />
            );
          })}
        </div>
      </div>

      {/* Sticky Notes Canvas */}
      <div className="bg-white/95 rounded-2xl border border-border p-6 shadow-xs min-h-[550px]">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          
          {/* Add Note Quick Tile */}
          <div
            onClick={() => openCreateModal()}
            className="group min-h-[200px] rounded-xl border-2 border-dashed border-gray-200 hover:border-primary bg-background/50 hover:bg-white flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all duration-200"
          >
            <div className="w-10 h-10 rounded-full bg-surface-container group-hover:bg-primary group-hover:text-white flex items-center justify-center text-primary transition-colors mb-2">
              <Plus size={20} />
            </div>
            <span className="text-xs font-bold text-primary">New Sticky Note</span>
            <span className="text-[10px] text-on-surface-variant mt-1">Capture ideas immediately</span>
          </div>

          {/* Render Notes */}
          {filteredNotes.map(note => {
            const style = NOTE_STYLES[note.color] || NOTE_STYLES.yellow;
            return (
              <div
                key={note.id}
                onClick={() => openEditModal(note)}
                className={`group relative rounded-xl border ${style.border} ${style.bg} p-4 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between min-h-[200px]`}
              >
                {/* Visual Tape Effect */}
                <div
                  className={`absolute -top-2 left-1/2 -translate-x-1/2 w-14 h-4 ${style.tape} rounded-xs shadow-2xs rotate-[-1deg] pointer-events-none`}
                />

                {/* Top Controls */}
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className={`text-xs font-bold ${style.text} line-clamp-1`}>
                      {note.title}
                    </h3>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => togglePin(note, e)}
                        className={`p-1 rounded cursor-pointer transition-colors ${
                          note.is_pinned ? 'text-primary fill-primary' : 'text-gray-400 hover:text-primary'
                        }`}
                        title={note.is_pinned ? 'Unpin' : 'Pin to top'}
                      >
                        <Pin size={13} className={note.is_pinned ? 'fill-current' : ''} />
                      </button>
                      <button
                        onClick={(e) => handleDelete(note.id, e)}
                        className="p-1 text-gray-400 hover:text-red-500 rounded cursor-pointer transition-colors"
                        title="Delete note"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Note Body */}
                  <p className={`text-xs ${style.text} whitespace-pre-wrap leading-relaxed line-clamp-6`}>
                    {note.content}
                  </p>
                </div>

                {/* Footer with Timestamp */}
                <div className="pt-3 border-t border-black/5 flex items-center justify-between text-[10px] text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock size={10} />
                    {formatDate(note.updated_at)}
                  </span>
                  <Edit3 size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            );
          })}
        </div>

        {filteredNotes.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xs text-on-surface-variant">No notes found matching your search.</p>
          </div>
        )}
      </div>

      {/* Note Editor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl border border-border shadow-lg w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-background">
              <h3 className="text-sm font-bold text-primary">
                {editingNote ? 'Edit Sticky Note' : 'Create Sticky Note'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">Title</label>
                <input
                  type="text"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  placeholder="e.g. System Design Architecture Notes"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">Content *</label>
                <textarea
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Type your notes, ideas, checklist, or instructions..."
                  rows={5}
                  required
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border focus:outline-none focus:border-primary resize-none"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1.5">Note Color</label>
                  <div className="flex items-center gap-2">
                    {(['yellow', 'blue', 'pink', 'orange', 'green'] as StickyNote['color'][]).map(c => {
                      const s = NOTE_STYLES[c];
                      return (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setNoteColor(c)}
                          className={`w-6 h-6 rounded-full border transition-transform cursor-pointer ${
                            noteColor === c ? 'scale-115 ring-2 ring-primary ring-offset-1' : ''
                          } ${s.bg} ${s.border}`}
                        />
                      );
                    })}
                  </div>
                </div>

                <label className="flex items-center gap-2 text-xs font-semibold text-on-surface cursor-pointer pt-3">
                  <input
                    type="checkbox"
                    checked={isPinned}
                    onChange={(e) => setIsPinned(e.target.checked)}
                    className="rounded text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                  />
                  <span>Pin to top</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs font-medium text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-medium bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors cursor-pointer shadow-xs"
                >
                  {editingNote ? 'Save Changes' : 'Create Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
