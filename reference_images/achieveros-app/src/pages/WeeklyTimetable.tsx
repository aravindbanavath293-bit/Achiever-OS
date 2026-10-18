import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';
import type { WeeklyScheduleEntry, DayOfWeek } from '../types';
import { scheduleService } from '../services/scheduleService';
import { getWeekDates, getWeekMonday, formatDateShort } from '../utils/dateUtils';
import { useAuth } from '../context/AuthContext';

const DAYS: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const HOURS = Array.from({ length: 24 }, (_, i) => i); // 12 AM to 11 PM

const COLOR_MAP: Record<string, string> = {
  'timetable-orange': '#FFD8A8',
  'timetable-red': '#FFC9C9',
  'timetable-blue': '#A5D8FF',
  'timetable-yellow': '#FFF3BF',
  'timetable-green': '#B2F2BB',
  'timetable-pink': '#FCC2D7',
  'timetable-white': '#FFFFFF',
};

export default function WeeklyTimetable() {
  const { user } = useAuth();
  const [schedule, setSchedule] = useState<WeeklyScheduleEntry[]>([]);
  const [weekDates, setWeekDates] = useState<Date[]>(getWeekDates());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<WeeklyScheduleEntry | undefined>(undefined);
  
  // Modal Form State
  const [day, setDay] = useState<DayOfWeek>('monday');
  const [activity, setActivity] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [color, setColor] = useState('timetable-orange');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Derive the weekOf key from the current Monday
  const weekOf = getWeekMonday(weekDates[0]);

  const loadSchedule = useCallback(async () => {
    const data = await scheduleService.getByWeek(weekOf);
    setSchedule(data);
  }, [weekOf, user?.id]);

  useEffect(() => {
    loadSchedule();
  }, [loadSchedule]);

  const todayStr = new Date().toDateString();
  const weekStart = weekDates[0];
  const weekEnd = weekDates[6];

  const nextWeek = () => {
    const newMonday = new Date(weekDates[0]);
    newMonday.setDate(newMonday.getDate() + 7);
    setWeekDates(getWeekDates(newMonday));
  };

  const prevWeek = () => {
    const newMonday = new Date(weekDates[0]);
    newMonday.setDate(newMonday.getDate() - 7);
    setWeekDates(getWeekDates(newMonday));
  };

  const goToThisWeek = () => {
    setWeekDates(getWeekDates());
  };

  const openModal = (entry?: WeeklyScheduleEntry) => {
    if (entry) {
      setEditingEvent(entry);
      setDay(entry.day);
      setActivity(entry.activity);
      setStartTime(entry.startTime);
      setEndTime(entry.endTime);
      setColor(entry.color);
    } else {
      setEditingEvent(undefined);
      setDay('monday');
      setActivity('');
      setStartTime('09:00');
      setEndTime('10:00');
      setColor('timetable-orange');
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activity.trim()) return;
    
    setIsSubmitting(true);
    try {
      if (editingEvent) {
        await scheduleService.update(editingEvent.id, { day, activity, startTime, endTime, color });
      } else {
        await scheduleService.create({ day, activity, startTime, endTime, color, weekOf });
      }
      await loadSchedule();
      setIsModalOpen(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!editingEvent) return;
    if (confirm('Delete this event?')) {
      await scheduleService.delete(editingEvent.id);
      await loadSchedule();
      setIsModalOpen(false);
    }
  };

  // Helper to format hour labels (e.g., "7 AM")
  const formatHour = (hour: number) => {
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const h = hour % 12 || 12;
    return `${h} ${ampm}`;
  };

  // Helper to convert "HH:MM" to fractional hours (e.g., "02:30" => 2.5)
  const parseTimeToHours = (time: string): number => {
    const [h, m] = time.split(':').map(Number);
    return h + (m || 0) / 60;
  };

  // Helper to convert "HH:MM" (24h) to "h:MM AM/PM" (12h)
  const formatTime = (time: string): string => {
    const [h, m] = time.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    const minutes = (m || 0).toString().padStart(2, '0');
    return `${hour12}:${minutes} ${ampm}`;
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto pb-24 md:pb-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-display font-bold text-on-surface">Weekly Timetable</h1>
          <p className="text-body-md text-on-surface-variant flex items-center gap-2 mt-1">
            {formatDateShort(weekStart)} - {formatDateShort(weekEnd)}, {weekStart.getFullYear()}
          </p>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="flex bg-surface-container rounded-lg p-1 w-full md:w-auto overflow-x-auto">
            <button 
              onClick={prevWeek}
              className="p-1.5 rounded text-on-surface-variant hover:bg-surface-variant transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <button 
              onClick={goToThisWeek}
              className="px-4 py-1.5 text-sm font-medium bg-surface-container-lowest text-on-surface rounded shadow-sm shrink-0 cursor-pointer hover:bg-surface-container-high transition-colors"
            >
              THIS WEEK
            </button>
            <button 
              onClick={nextWeek}
              className="px-4 py-1.5 text-sm font-medium text-on-surface-variant hover:bg-surface-variant rounded transition-colors shrink-0"
            >
              NEXT WEEK
            </button>
            <button 
              onClick={nextWeek}
              className="p-1.5 rounded text-on-surface-variant hover:bg-surface-variant transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>
          <button 
            onClick={() => openModal()}
            className="shrink-0 w-10 h-10 bg-primary text-on-primary rounded-lg flex items-center justify-center shadow-sm hover:bg-surface-tint transition-colors cursor-pointer"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>

      {/* Grid Container */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-sm overflow-hidden flex flex-col">
        
        {/* Days Header */}
        <div className="grid grid-cols-8 border-b border-outline-variant/50 sticky top-0 bg-surface-container-lowest z-10">
          <div className="p-4 flex items-end justify-center border-r border-outline-variant/30">
            <span className="text-[10px] font-bold text-outline uppercase tracking-widest mb-1">Time</span>
          </div>
          {DAYS.map((d, i) => {
            const date = weekDates[i];
            const isToday = date.toDateString() === todayStr;
            return (
              <div 
                key={d} 
                className={`p-4 flex flex-col items-center justify-center border-r border-outline-variant/30 last:border-r-0 ${
                  i >= 5 ? 'bg-surface-container-low/30' : ''
                }`}
              >
                <span className="text-[10px] font-bold text-outline uppercase tracking-widest mb-1">{d.substring(0, 3)}</span>
                <span className={`text-[18px] font-bold w-8 h-8 flex items-center justify-center rounded-full ${
                  isToday ? 'bg-primary text-on-primary' : 'text-on-surface'
                }`}>
                  {date.getDate()}
                </span>
              </div>
            );
          })}
        </div>

        {/* Time Grid */}
        <div className="flex-1 overflow-y-auto relative">
          {/* Background hour rows */}
          {HOURS.map(hour => (
            <div key={hour} className="grid grid-cols-8 border-b border-outline-variant/30 min-h-[80px]">
              {/* Time Label */}
              <div className="p-2 flex justify-center items-start border-r border-outline-variant/30">
                <span className="text-[11px] font-medium text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full mt-2">
                  {formatHour(hour)}
                </span>
              </div>
              
              {/* Day Cells — clickable empty areas */}
              {DAYS.map((d, i) => {
                const hourPrefix = hour.toString().padStart(2, '0');
                // Check if this cell is covered by any event
                const isCovered = schedule.some(e => {
                  if (e.day !== d) return false;
                  const eStart = parseTimeToHours(e.startTime);
                  const eEnd = parseTimeToHours(e.endTime);
                  return hour >= eStart && hour < eEnd;
                });
                
                return (
                  <div 
                    key={`${d}-${hour}`} 
                    className={`p-1.5 border-r border-outline-variant/30 last:border-r-0 group cursor-pointer transition-colors ${
                      i >= 5 ? 'bg-surface-container-low/30' : ''
                    } hover:bg-surface-container-high/50`}
                    onClick={() => {
                      if (!isCovered) {
                        setDay(d);
                        setStartTime(`${hourPrefix}:00`);
                        setEndTime(`${(hour + 1).toString().padStart(2, '0')}:00`);
                        setEditingEvent(undefined);
                        setActivity('');
                        setColor('timetable-orange');
                        setIsModalOpen(true);
                      }
                    }}
                  >
                    {!isCovered && (
                      <div className="w-full h-full rounded border-2 border-dashed border-transparent group-hover:border-outline-variant/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                        <Plus size={16} className="text-outline" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}

          {/* Overlay: Absolutely positioned events for each day */}
          {DAYS.map((d, dayIndex) => {
            const dayEntries = schedule.filter(e => e.day === d);
            if (dayEntries.length === 0) return null;

            return dayEntries.map(entry => {
              const startH = parseTimeToHours(entry.startTime);
              const endH = parseTimeToHours(entry.endTime);
              const duration = endH - startH;
              if (duration <= 0) return null;

              const ROW_HEIGHT = 80; // min-h-[80px] per hour row
              const topPx = startH * ROW_HEIGHT;
              const heightPx = duration * ROW_HEIGHT;

              // Column positioning: col 0 is the time label, cols 1-7 are days
              // Each column is 1/8 of the grid width
              const leftPercent = ((dayIndex + 1) / 8) * 100;
              const widthPercent = (1 / 8) * 100;

              return (
                <div
                  key={entry.id}
                  onClick={() => openModal(entry)}
                  className="absolute rounded-lg p-2.5 flex flex-col shadow-sm border border-black/5 hover:brightness-95 transition-all text-on-surface cursor-pointer z-[5] overflow-hidden"
                  style={{
                    backgroundColor: COLOR_MAP[entry.color] || '#F1F3F5',
                    top: `${topPx}px`,
                    height: `${heightPx}px`,
                    left: `calc(${leftPercent}% + 6px)`,
                    width: `calc(${widthPercent}% - 12px)`,
                  }}
                >
                  <span className="text-[11px] font-bold leading-tight">{entry.activity}</span>
                  <span className="text-[10px] opacity-70 mt-auto truncate">{formatTime(entry.startTime)} - {formatTime(entry.endTime)}</span>
                </div>
              );
            });
          })}
        </div>
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface-container-lowest w-full max-w-sm rounded-2xl shadow-xl border border-outline-variant overflow-hidden">
            
            <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant">
              <h2 className="text-[18px] font-bold text-on-surface">
                {editingEvent ? 'Edit Event' : 'New Event'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 -mr-2 text-on-surface-variant hover:bg-surface-container-high rounded-full">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              
              <div className="space-y-1">
                <label className="text-xs font-medium text-on-surface-variant">Activity Name</label>
                <input
                  type="text"
                  value={activity}
                  onChange={e => setActivity(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-container rounded-lg border-none outline-none focus:ring-2 focus:ring-primary text-sm"
                  required
                  autoFocus
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-on-surface-variant">Day</label>
                <select
                  value={day}
                  onChange={e => setDay(e.target.value as DayOfWeek)}
                  className="w-full px-3 py-2 bg-surface-container rounded-lg border-none outline-none focus:ring-2 focus:ring-primary text-sm capitalize"
                >
                  {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-on-surface-variant">Start Time</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={e => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-container rounded-lg border-none outline-none focus:ring-2 focus:ring-primary text-sm"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-on-surface-variant">End Time</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={e => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-container rounded-lg border-none outline-none focus:ring-2 focus:ring-primary text-sm"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <label className="text-xs font-medium text-on-surface-variant">Color Label</label>
                <div className="flex gap-2">
                  {Object.keys(COLOR_MAP).map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      style={{ backgroundColor: COLOR_MAP[c] }}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${color === c ? 'border-primary scale-110 shadow-sm' : c === 'timetable-white' ? 'border-outline-variant' : 'border-transparent'}`}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between">
                {editingEvent ? (
                  <button type="button" onClick={handleDelete} className="text-sm font-medium text-error hover:underline">
                    Delete
                  </button>
                ) : <div></div>}
                <div className="flex gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={isSubmitting || !activity.trim()} className="px-4 py-2 text-sm font-medium bg-primary text-on-primary rounded-lg hover:bg-surface-tint disabled:opacity-50">
                    Save
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
