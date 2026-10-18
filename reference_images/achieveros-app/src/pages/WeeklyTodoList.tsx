import { useState, useEffect } from 'react';
import { Plus, Check, ChevronDown, Trash2, X } from 'lucide-react';
import type { WeeklyTodoDay } from '../types';
import { seedWeeklyTodos } from '../utils/seedData';
import { generateId } from '../utils/dateUtils';
import { storage } from '../utils/storage';
import { useAuth } from '../context/AuthContext';

const STORAGE_KEY = 'weekly_todos';

const DAY_COLORS = {
  monday: { header: 'bg-mon-header', bg: 'bg-mon-bg', text: 'text-purple-900' },
  tuesday: { header: 'bg-tue-header', bg: 'bg-tue-bg', text: 'text-pink-900' },
  wednesday: { header: 'bg-wed-header', bg: 'bg-wed-bg', text: 'text-orange-900' },
  thursday: { header: 'bg-thu-header', bg: 'bg-thu-bg', text: 'text-blue-900' },
  friday: { header: 'bg-fri-header', bg: 'bg-fri-bg', text: 'text-green-900' },
  saturday: { header: 'bg-sat-header', bg: 'bg-sat-bg', text: 'text-yellow-900' },
  sunday: { header: 'bg-sun-header', bg: 'bg-sun-bg', text: 'text-red-900' },
  weekly: { header: 'bg-surface-dim', bg: 'bg-surface-container', text: 'text-on-surface' },
};

export default function WeeklyTodoList() {
  const { user } = useAuth();
  const [todos, setTodos] = useState<WeeklyTodoDay[]>([]);
  const [deleteMode, setDeleteMode] = useState<string | null>(null);

  useEffect(() => {
    const loaded = storage.get<WeeklyTodoDay[]>(STORAGE_KEY);
    if (loaded) {
      setTodos(loaded);
    } else {
      setTodos(seedWeeklyTodos);
      storage.set(STORAGE_KEY, seedWeeklyTodos);
    }
  }, [user?.id]);

  const saveTodos = (newTodos: WeeklyTodoDay[]) => {
    setTodos(newTodos);
    storage.set(STORAGE_KEY, newTodos);
  };

  const toggleItem = (dayIndex: number, itemIndex: number) => {
    const newTodos = [...todos];
    newTodos[dayIndex].items[itemIndex].completed = !newTodos[dayIndex].items[itemIndex].completed;
    saveTodos(newTodos);
  };

  const updateItemText = (dayIndex: number, itemIndex: number, text: string) => {
    const newTodos = [...todos];
    newTodos[dayIndex].items[itemIndex].text = text;
    saveTodos(newTodos);
  };

  const addItem = (dayIndex: number) => {
    const newTodos = [...todos];
    newTodos[dayIndex].items.push({ id: generateId(), text: '', completed: false });
    saveTodos(newTodos);
  };

  const deleteItem = (dayIndex: number, itemIndex: number) => {
    const newTodos = [...todos];
    newTodos[dayIndex].items.splice(itemIndex, 1);
    saveTodos(newTodos);
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto pb-24 md:pb-8 h-full">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
        <h1 className="text-display font-extrabold text-on-surface tracking-tight">WEEKLY TO DO LIST</h1>
        
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 px-4 py-2 bg-surface-container rounded-lg font-medium text-sm text-on-surface hover:bg-surface-container-high transition-colors">
            Week 34 <ChevronDown size={16} />
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-surface-container rounded-lg font-medium text-sm text-on-surface hover:bg-surface-container-high transition-colors">
            August <ChevronDown size={16} />
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {todos.map((dayData, dayIndex) => {
          const colors = DAY_COLORS[dayData.day];
          
          return (
            <div key={dayData.day} className={`flex rounded-2xl overflow-hidden shadow-sm border border-black/5 ${colors.bg}`}>
              
              {/* Vertical Header */}
              <div className={`w-12 shrink-0 flex items-center justify-center py-6 ${colors.header}`}>
                <span className="vertical-text text-lg font-bold tracking-widest text-black/70 uppercase">
                  {dayData.day}
                </span>
              </div>
              
              {/* Content area */}
              <div className="flex-1 p-5 pb-6">
                <div className="flex justify-between items-center mb-4 border-b-2 border-black/10 pb-2">
                  <h3 className={`font-handwriting text-2xl font-bold ${colors.text}`}>To Do List</h3>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => setDeleteMode(deleteMode === dayData.day ? null : dayData.day)}
                      className={`w-6 h-6 rounded-full hover:bg-black/10 flex items-center justify-center transition-colors ${
                        deleteMode === dayData.day ? 'text-red-500 bg-red-500/10' : 'text-black/50 hover:text-black/70'
                      }`}
                    >
                      <Trash2 size={14} strokeWidth={2.5} />
                    </button>
                    <button 
                      onClick={() => addItem(dayIndex)}
                      className="w-6 h-6 rounded-full hover:bg-black/10 flex items-center justify-center transition-colors text-black/50 hover:text-black/70"
                    >
                      <Plus size={16} strokeWidth={3} />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {dayData.items.map((item, itemIndex) => (
                    <div key={item.id} className="flex items-start gap-3 group">
                      {deleteMode === dayData.day ? (
                        <button
                          onClick={() => deleteItem(dayIndex, itemIndex)}
                          className="shrink-0 mt-0.5 w-5 h-5 rounded-full bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center transition-colors text-red-500 cursor-pointer"
                        >
                          <X size={12} strokeWidth={3} />
                        </button>
                      ) : (
                        <button 
                          onClick={() => toggleItem(dayIndex, itemIndex)}
                          className={`shrink-0 mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors cursor-pointer ${
                            item.completed 
                              ? 'bg-black/60 border-black/60 text-white' 
                              : 'border-black/30 hover:border-black/50 text-transparent'
                          }`}
                        >
                          <Check size={12} strokeWidth={3} className={item.completed ? 'opacity-100' : 'opacity-0'} />
                        </button>
                      )}
                      
                      <input
                        type="text"
                        value={item.text}
                        onChange={(e) => updateItemText(dayIndex, itemIndex, e.target.value)}
                        placeholder="Add a task..."
                        className={`w-full bg-transparent border-b border-black/10 focus:border-black/30 outline-none px-1 pb-1 font-medium transition-colors placeholder:text-black/30 ${
                          item.completed ? 'line-through opacity-50' : colors.text
                        }`}
                      />
                    </div>
                  ))}
                  {dayData.items.length === 0 && (
                    <button 
                      onClick={() => addItem(dayIndex)}
                      className="w-full py-2 text-sm font-medium text-black/40 hover:text-black/60 text-left px-1 border-b border-dashed border-black/20"
                    >
                      + Add item
                    </button>
                  )}
                </div>
              </div>
              
            </div>
          );
        })}
      </div>
    </div>
  );
}
