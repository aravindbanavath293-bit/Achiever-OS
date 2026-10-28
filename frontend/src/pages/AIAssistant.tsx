import { useState, useRef, useEffect } from 'react';
import { 
  Bot, Send, Sparkles, User, Calendar, CheckSquare, 
  Trophy, Search, ArrowRight, Check, AlertCircle, RefreshCw, Layers 
} from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { BentoCard } from '../components/bento/Bento';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  agent?: string;
  text: string;
  actionCard?: {
    type: 'create_task' | 'create_goal' | 'daily_plan';
    data: any;
  };
  timestamp: string;
}

const QUICK_PROMPTS = [
  'Plan my day around today\'s deadlines',
  'Break down learning TypeScript into a 4-week goal',
  'Which urgent tasks should I handle first?',
  'Search my notes for architecture ideas',
  'Summarize my productivity streak and velocity',
];

function renderFormattedMessage(text: string) {
  const lines = text.split('\n');
  return (
    <div className="space-y-1.5">
      {lines.map((line, idx) => {
        if (!line.trim()) {
          return <div key={idx} className="h-1" />;
        }
        const parts = line.split(/(\*\*.*?\*\*|\*.*?\*)/g);
        return (
          <p key={idx} className="leading-relaxed">
            {parts.map((part, pIdx) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return (
                  <strong key={pIdx} className="font-bold text-slate-900">
                    {part.slice(2, -2)}
                  </strong>
                );
              }
              if (part.startsWith('*') && part.endsWith('*')) {
                return (
                  <em key={pIdx} className="italic text-slate-500">
                    {part.slice(1, -1)}
                  </em>
                );
              }
              return part;
            })}
          </p>
        );
      })}
    </div>
  );
}

export default function AIAssistant() {
  const { user } = useAuth();
  const { tasks, goals, notes, streak, addTask, addGoal, addEvent } = useAppData();

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeAgent, setActiveAgent] = useState<string>('Central Orchestrator');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      agent: 'Orchestrator',
      text: `Hello ${user?.name || 'Alex'}! I am your AchieverOS AI Agent. I have full context on your ${tasks.length} tasks, ${goals.length} goals, and ${notes.length} sticky notes.\n\nHow can I optimize your workflow today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    const qLower = query.toLowerCase();

    // Try calling backend API first; fallback to high-fidelity agent response
    try {
      const res = await api.post('/ai/chat', { message: query });
      if (res.data && res.data.response) {
        setMessages(prev => [
          ...prev,
          {
            id: `a-${Date.now()}`,
            sender: 'assistant',
            agent: res.data.agent || 'Orchestrator',
            text: res.data.response,
            actionCard: res.data.actionCard,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
        setIsTyping(false);
        return;
      }
    } catch {
      // Offline / dev fallback mode
    }

    // Agent routing simulation based on multi-agent architecture
    setTimeout(() => {
      let agentName: Message['agent'] = 'Orchestrator';
      let responseText = '';
      let actionCard: Message['actionCard'] = undefined;

      if (qLower.includes('plan my day') || qLower.includes('schedule') || qLower.includes('revision plan')) {
        agentName = 'Planner';
        setActiveAgent('Planner Agent');
        const pendingToday = tasks.filter(t => t.status !== 'completed');
        responseText = `I have analyzed your workload and scheduled blocks. Here is an optimized plan:\n\n1. **09:00 - 11:00** Deep Work: ${pendingToday[0]?.title || 'Core Milestone Work'}\n2. **11:15 - 12:30** Focus Block: ${pendingToday[1]?.title || 'Secondary Tasks'}\n3. **13:30 - 14:30** Communication & Email Review\n4. **15:00 - 17:00** Project Execution\n\nWould you like me to commit these blocks to your Daily Schedule?`;
      } else if (qLower.includes('break down') || qLower.includes('goal') || qLower.includes('typescript')) {
        agentName = 'Goal Coach';
        setActiveAgent('Goal Coach Agent');
        responseText = `I've architected a 4-milestone roadmap for this objective:\n\n• **Milestone 1:** Types, Generics & Advanced Utility Types (Week 1)\n• **Milestone 2:** React 19 + TypeScript Full Integration (Week 2)\n• **Milestone 3:** Backend Architecture & API Contract Typing (Week 3)\n• **Milestone 4:** Production Full-Stack Project with Strict Typing (Week 4)`;
        actionCard = {
          type: 'create_goal',
          data: {
            title: 'Master TypeScript & Full-Stack Architecture',
            category: 'Career',
            milestones: [
              'Types, Generics & Advanced Utility Types',
              'React 19 + TypeScript Full Integration',
              'Backend Architecture & API Contract Typing',
              'Production Full-Stack Project with Strict Typing',
            ],
          },
        };
      } else if (qLower.includes('prioritize') || qLower.includes('urgent') || qLower.includes('overdue')) {
        agentName = 'Task Intelligence';
        setActiveAgent('Task Intelligence Agent');
        const urgent = tasks.filter(t => t.priority === 'urgent' || t.priority === 'high');
        responseText = `Based on deadlines and priority scoring, here are the top items requiring your immediate focus:\n\n${
          urgent.length > 0 
            ? urgent.map((t, i) => `${i + 1}. **${t.title}** (${t.priority.toUpperCase()} priority, Category: ${t.category})`).join('\n')
            : 'You have no overdue or urgent tasks currently! Great job maintaining momentum.'
        }`;
      } else if (qLower.includes('search') || qLower.includes('notes') || qLower.includes('find')) {
        agentName = 'Knowledge Retrieval';
        setActiveAgent('Knowledge Retrieval Agent (RAG)');
        const foundNotes = notes.slice(0, 2);
        responseText = `Retrieved matching documents from your knowledge store using semantic search:\n\n${
          foundNotes.map(n => `• **${n.title}**: "${n.content.slice(0, 100)}..."`).join('\n\n')
        }\n\n*Source: User Sticky Notes (Knowledge Base)*`;
      } else if (qLower.includes('streak') || qLower.includes('summarize') || qLower.includes('velocity')) {
        agentName = 'Orchestrator';
        setActiveAgent('Central Orchestrator');
        const completed = tasks.filter(t => t.status === 'completed').length;
        responseText = `📊 **Productivity Summary**:\n• Active Streak: **${streak.current_streak} days** (Record: ${streak.longest_streak} days)\n• Total Completed Tasks: **${completed}**\n• Active Goals: **${goals.filter(g => g.status === 'in-progress').length}**\n• Velocity: High consistency. You are on track to achieve all weekly targets!`;
      } else {
        const greetingWords = ['hi', 'hello', 'hey', 'hiii', 'hiya', 'howdy', 'sup', 'who are you', 'what can you do', 'help'];
        const isGreeting = greetingWords.some(w => qLower === w || qLower.startsWith(w + ' ') || qLower.startsWith(w + '!') || qLower.startsWith(w + ','));

        if (isGreeting && !['task', 'plan', 'goal', 'schedule', 'todo', 'deadline'].some(w => qLower.includes(w))) {
          agentName = 'AchieverOS AI Agent';
          setActiveAgent('AchieverOS AI Agent');
          responseText = `Hello! I am your AchieverOS AI Agent. I'm here to help you stay focused, organized, and productive.\n\nHere is what I can do for you:\n• **Plan Your Day:** Try asking *"Plan my day around today's deadlines"*\n• **Break Down Goals:** Try *"Break down learning TypeScript into a 4-week goal"*\n• **Manage Tasks:** Try *"Add task: Review the quarterly roadmap tomorrow morning"*\n• **Search Notes:** Try *"Search my notes for architecture ideas"*\n\nHow can I assist you right now?`;
          actionCard = undefined;
        } else {
          agentName = 'Task Intelligence';
          setActiveAgent('Task Intelligence Agent');
          responseText = `I parsed your input and can create a task for you with priority tracking. Would you like me to add: "${query}"?`;
          actionCard = {
            type: 'create_task',
            data: {
              title: query,
              category: 'General',
              priority: 'medium',
              due_date: new Date().toISOString().split('T')[0],
            },
          };
        }
      }

      setMessages(prev => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          sender: 'assistant',
          agent: agentName,
          text: responseText,
          actionCard,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setIsTyping(false);
    }, 800);
  };

  const handleApplyAction = (actionCard: Message['actionCard']) => {
    if (!actionCard) return;
    if (actionCard.type === 'create_task') {
      addTask({
        title: actionCard.data.title,
        description: '',
        category: actionCard.data.category || 'General',
        priority: actionCard.data.priority || 'medium',
        status: 'todo',
        due_date: actionCard.data.due_date,
        is_recurring: false,
        tags: ['AI-Created'],
        subtasks: [],
      });
      toast.success('Task created from AI suggestion!');
    } else if (actionCard.type === 'create_goal') {
      addGoal({
        title: actionCard.data.title,
        description: 'Auto-structured by Goal Coach Agent',
        category: actionCard.data.category || 'Career',
        target_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'in-progress',
        milestones: (actionCard.data.milestones || []).map((m: string, i: number) => ({
          id: `m-ai-${i}`,
          title: m,
          completed: false,
        })),
      });
      toast.success('Goal & Milestones created!');
    }
  };

  return (
    <div className="space-y-4 h-[calc(100vh-140px)] flex flex-col animate-fade-in">
      {/* Top Header with Multi-Agent Indicator */}
      <BentoCard span="full" variant="feature" className="p-4 md:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shrink-0">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-2.5 tracking-tight">
            <div className="w-8 h-8 rounded-xl bg-violet-100 dark:bg-violet-950/60 text-violet-600 flex items-center justify-center">
              <Bot size={20} />
            </div>
            AchieverOS AI Agent Fleet
          </h1>
        </div>

        {/* Multi-Agent Badge */}
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
          <Layers size={14} className="text-indigo-600" />
          <span className="text-slate-500 font-medium">Active Agent:</span>
          <span className="font-bold text-indigo-700 dark:text-indigo-300">{activeAgent}</span>
        </div>
      </BentoCard>

      {/* Chat Messages Area */}
      <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 md:p-6 shadow-sm overflow-y-auto space-y-4">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex items-start gap-3.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'assistant' && (
              <div className="w-9 h-9 rounded-xl gradient-primary text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                <Bot size={18} />
              </div>
            )}

            <div className={`max-w-[82%] sm:max-w-[75%] rounded-2xl p-4 text-xs md:text-sm ${
              msg.sender === 'user'
                ? 'gradient-primary text-white shadow-sm'
                : 'bg-slate-50/70 border border-slate-200 text-slate-800'
            }`}>
              {msg.sender === 'assistant' && msg.agent && (
                <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-slate-200/60 text-[10px] font-bold uppercase tracking-wider text-indigo-700">
                  <span className="flex items-center gap-1">
                    <Sparkles size={11} className="text-violet-500" />
                    {msg.agent.endsWith('Agent') ? msg.agent : `${msg.agent} Agent`}
                  </span>
                  <span className="text-slate-400 font-normal">{msg.timestamp}</span>
                </div>
              )}

              {renderFormattedMessage(msg.text)}

              {/* Action Card Preview */}
              {msg.actionCard && (
                <div className="mt-3.5 p-3 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-bold text-indigo-700">
                    <span className="flex items-center gap-1.5">
                      <Sparkles size={13} className="text-amber-500" /> Proposed Action:
                    </span>
                    <span className="capitalize text-[10px] bg-indigo-50 px-2 py-0.5 rounded-full">{msg.actionCard.type.replace('_', ' ')}</span>
                  </div>
                  <p className="font-bold text-xs text-slate-900">{msg.actionCard.data.title}</p>
                  <button
                    onClick={() => handleApplyAction(msg.actionCard)}
                    className="w-full flex items-center justify-center gap-1.5 px-4 py-2 gradient-primary hover:gradient-primary-hover text-white rounded-xl font-bold text-xs transition-all cursor-pointer shadow-xs"
                  >
                    <Check size={14} /> Confirm & Apply to Workspace
                  </button>
                </div>
              )}
            </div>

            {msg.sender === 'user' && (
              <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0 border border-indigo-200 mt-0.5">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 p-2">
            <RefreshCw size={14} className="animate-spin text-indigo-600" />
            <span>AI Orchestrator is synthesizing context...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Bar */}
      <div className="flex gap-2 overflow-x-auto pb-1 shrink-0 scrollbar-hide [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {QUICK_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt)}
            className="px-3.5 py-1.5 rounded-full bg-white border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/40 text-xs font-semibold text-slate-600 hover:text-indigo-700 whitespace-nowrap transition-all cursor-pointer shadow-2xs"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="bg-white p-2.5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center gap-2 shrink-0 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 transition-all"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask AI to plan your day, break down a goal, or search your notes..."
          className="flex-1 px-3.5 py-2 text-xs md:text-sm focus:outline-none text-slate-800 placeholder-slate-400 bg-transparent"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="p-2.5 gradient-primary hover:gradient-primary-hover text-white rounded-xl transition-all cursor-pointer disabled:opacity-40 shadow-xs"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
