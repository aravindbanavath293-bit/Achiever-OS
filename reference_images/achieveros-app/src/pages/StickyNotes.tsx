import { useState, useEffect } from 'react';
import { Plus, X, PencilLine, Trash2 } from 'lucide-react';
import type { StickyNote } from '../types';
import { noteService } from '../services/noteService';
import { formatDate } from '../utils/dateUtils';
import { NOTE_COLORS } from '../types';
import { useAuth } from '../context/AuthContext';

export default function StickyNotes() {
  const { user } = useAuth();
  const [notes, setNotes] = useState<StickyNote[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<StickyNote | undefined>(undefined);

  useEffect(() => {
    loadNotes();
  }, [user?.id]);

  const loadNotes = async () => {
    const data = await noteService.getAll();
    // Sort by most recently updated
    setNotes(data.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
  };

  const handleCreate = () => {
    setEditingNote(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (note: StickyNote) => {
    setEditingNote(note);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // prevent opening edit modal
    if (confirm('Are you sure you want to delete this note?')) {
      await noteService.delete(id);
      await loadNotes();
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-bg-sage p-6 md:p-8 pb-24 md:pb-8 flex flex-col items-center">
      
      {/* Board Container */}
      <div className="w-full max-w-7xl bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-white/40 p-8 md:p-12 min-h-[70vh]">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-10">
          <div>
            <h1 className="font-handwriting text-5xl font-bold text-gray-800 tracking-tight text-center md:text-left">
              Sticky Notes
            </h1>
            <p className="text-gray-500 font-medium mt-2 text-center md:text-left">
              Brainstorm, draft, and keep track of quick thoughts.
            </p>
          </div>
          <button 
            onClick={handleCreate}
            className="flex items-center gap-2 px-6 py-3 bg-gray-800 text-white rounded-xl font-bold hover:bg-black transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
          >
            <Plus size={20} strokeWidth={3} /> Add Note
          </button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 justify-items-center">
          
          {notes.map((note) => {
            // Apply slight random rotation for realistic feel, deterministic by id length so it doesn't change on render
            const rotationClass = `note-rotate-${(note.id.length % 3) + 1}`;
            const bgColor = NOTE_COLORS[note.color];
            
            return (
              <div 
                key={note.id}
                onClick={() => handleEdit(note)}
                className={`relative w-full max-w-[260px] aspect-square ${bgColor} p-6 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group ${rotationClass} flex flex-col`}
                style={{ 
                  borderRadius: '2px 2px 20px 2px',
                }}
              >
                {/* Tape */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-6 bg-white/40 shadow-sm rotate-2"></div>
                
                {/* Actions (visible on hover) */}
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleEdit(note); }}
                    className="w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center text-black/60 hover:text-black/90 transition-colors"
                  >
                    <PencilLine size={16} />
                  </button>
                  <button 
                    onClick={(e) => handleDelete(note.id, e)}
                    className="w-8 h-8 rounded-full bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center text-red-700 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <h3 className="font-bold text-gray-900 text-lg mb-3 pr-16 line-clamp-2">
                  {note.title}
                </h3>
                
                <div className="flex-1 overflow-hidden relative">
                  <p className="text-gray-800 text-[15px] leading-relaxed whitespace-pre-wrap font-medium">
                    {note.content}
                  </p>
                  {/* Fade out bottom text if it overflows */}
                  <div className={`absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[${bgColor}] to-transparent`} />
                </div>
                
                <p className="text-[11px] font-bold text-gray-900/40 uppercase tracking-widest mt-4">
                  {formatDate(note.updatedAt)}
                </p>
              </div>
            );
          })}

          {/* Add New Card */}
          <div 
            onClick={handleCreate}
            className="relative w-full max-w-[260px] aspect-square bg-white/50 border-2 border-dashed border-gray-300 hover:border-gray-400 p-6 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer flex flex-col items-center justify-center text-gray-500 hover:text-gray-700"
            style={{ borderRadius: '2px 2px 20px 2px' }}
          >
            <div className="w-16 h-16 rounded-full bg-white/80 shadow-sm flex items-center justify-center mb-4">
              <Plus size={32} strokeWidth={2.5} />
            </div>
            <p className="font-bold text-lg">New Note</p>
          </div>

        </div>
      </div>

      {isModalOpen && (
        <NoteModal 
          onClose={() => setIsModalOpen(false)}
          onSave={loadNotes}
          editNote={editingNote}
        />
      )}
    </div>
  );
}

function NoteModal({ onClose, onSave, editNote }: { onClose: () => void, onSave: () => void, editNote?: StickyNote }) {
  const [title, setTitle] = useState(editNote?.title || '');
  const [content, setContent] = useState(editNote?.content || '');
  const [color, setColor] = useState<StickyNote['color']>(editNote?.color || 'yellow');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const colors: StickyNote['color'][] = ['yellow', 'blue', 'pink', 'orange', 'green'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() && !content.trim()) return;

    setIsSubmitting(true);
    try {
      if (editNote) {
        await noteService.update(editNote.id, { title, content, color });
      } else {
        await noteService.create({ title, content, color });
      }
      onSave();
      onClose();
    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className={`w-full max-w-md shadow-2xl transition-colors duration-300 flex flex-col ${NOTE_COLORS[color]}`}
        style={{ borderRadius: '4px 4px 24px 4px' }}
      >
        <form onSubmit={handleSubmit} className="flex flex-col h-[500px] max-h-[85vh]">
          
          <div className="flex justify-between items-center p-4 border-b border-black/5">
            <div className="flex gap-2">
              {colors.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-6 h-6 rounded-full border-2 transition-transform ${NOTE_COLORS[c]} ${
                    color === c ? 'border-gray-800 scale-125 shadow-sm' : 'border-black/10 hover:scale-110'
                  }`}
                />
              ))}
            </div>
            <button type="button" onClick={onClose} className="p-2 rounded-full hover:bg-black/10 text-gray-700 transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 flex flex-col p-6 overflow-y-auto">
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Title..."
              className="w-full bg-transparent border-none outline-none font-bold text-gray-900 text-2xl mb-4 placeholder:text-gray-900/40"
              autoFocus
            />
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Write your note here..."
              className="w-full flex-1 bg-transparent border-none outline-none text-gray-800 text-[16px] leading-relaxed resize-none placeholder:text-gray-800/40 font-medium"
            />
          </div>

          <div className="p-4 border-t border-black/5 flex justify-end gap-3 bg-white/20">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-4 py-2 font-bold text-gray-700 hover:bg-black/10 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting || (!title.trim() && !content.trim())}
              className="px-6 py-2 font-bold bg-gray-900 text-white hover:bg-black rounded-lg shadow-sm transition-colors disabled:opacity-50"
            >
              Save Note
            </button>
          </div>
          
        </form>
      </div>
    </div>
  );
}
