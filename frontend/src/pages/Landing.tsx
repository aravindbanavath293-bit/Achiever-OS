import { Link } from 'react-router-dom';
import { 
  ArrowRight, Sparkles, LayoutDashboard, Calendar, Shield, Bot, Flame, 
  CheckCircle2, Zap, BarChart3, Clock, Layers, Target, Check, CalendarDays,
  CheckSquare, ArrowUpRight
} from 'lucide-react';
import logoImg from '../assets/logo.png';
import { BentoGrid, BentoCard } from '../components/bento/Bento';

export default function Landing() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col relative overflow-hidden">
      {/* Decorative Luxury Ambient Mesh Orbs */}
      <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-violet-300/20 to-indigo-300/15 blur-[110px] pointer-events-none" />
      <div className="absolute top-[20%] right-[-10%] w-[450px] h-[450px] rounded-full bg-gradient-to-bl from-amber-200/20 to-indigo-300/15 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[10%] left-[-5%] w-[400px] h-[400px] rounded-full bg-gradient-to-tr from-violet-200/20 to-blue-200/10 blur-[90px] pointer-events-none" />

      {/* Top Navbar */}
      <header className="glass-header sticky top-0 z-40 border-b border-slate-200/80 dark:border-slate-800 transition-all">
        <nav className="flex justify-between items-center px-6 py-4 md:px-12 max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full overflow-hidden shadow-md shadow-indigo-500/20 border border-amber-300/70 dark:border-amber-500/40 bg-white dark:bg-slate-800 shrink-0">
              <img 
                src={logoImg} 
                alt="AchieverOS" 
                className="w-full h-full object-cover rounded-full" 
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-slate-900 dark:text-white">
              AchieverOS
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 text-xs md:text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
            >
              Log In
            </Link>
            <Link
              to="/signup"
              className="px-4 md:px-5 py-2.5 text-xs md:text-sm font-bold gradient-primary hover:gradient-primary-hover text-white rounded-xl transition-all shadow-sm shadow-indigo-500/30 hover:shadow-md hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer flex items-center gap-1.5"
            >
              <span>Get Started Free</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-16 md:py-24 max-w-6xl mx-auto w-full z-10">
        {/* Glow Badge — Lavender / Soft Lilac & Deep Plum */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-violet-50/95 dark:bg-violet-950/60 border border-violet-200/90 dark:border-violet-800/80 text-violet-700 dark:text-violet-300 text-xs md:text-sm font-bold mb-6 shadow-xs animate-fade-in backdrop-blur-xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
          </span>
          Next-Gen Bento Grid Productivity Operating System
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.1] mb-6 max-w-4xl">
          Plan Better. Work Consistently.{' '}
          <span className="block mt-1 bg-gradient-to-r from-[#4A2574] via-[#A85B49] to-[#C29526] bg-clip-text text-transparent">
            Achieve More.
          </span>
        </h1>

        {/* Hero Subtitle */}
        <p className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mb-10 leading-relaxed font-normal">
          The all-in-one productivity suite combining modular Bento Box dashboards, chronological time blocking, weekly timetables, goal tracking, and autonomous multi-agent AI orchestration.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto">
          <Link
            to="/dashboard"
            className="w-full sm:w-auto px-8 py-3.5 gradient-primary hover:gradient-primary-hover text-white rounded-2xl text-sm font-bold transition-all shadow-md shadow-indigo-500/35 hover:shadow-lg hover:shadow-indigo-500/45 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2.5 cursor-pointer group"
          >
            <Sparkles size={18} className="text-amber-300" />
            <span>Launch Bento Workspace</span>
            <ArrowRight size={17} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto px-7 py-3.5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold transition-all shadow-xs hover:shadow-sm flex items-center justify-center cursor-pointer"
          >
            Sign In with Demo Account
          </Link>
        </div>

        {/* Bento Box UI Feature Showcase Grid */}
        <div className="mt-20 w-full text-left">
          <div className="text-center mb-10">
            <span className="bento-eyebrow text-indigo-600 dark:text-indigo-400">Modular Architecture</span>
            <h2 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
              Engineered with Bento Box Precision
            </h2>
            <p className="text-xs md:text-sm text-slate-500 max-w-lg mx-auto mt-2">
              Every card serves a distinct purpose in your daily workflow. Asymmetric, responsive, and distraction-free.
            </p>
          </div>

          <BentoGrid>
            {/* Card 1: Bento Dashboard Preview (span 7) */}
            <BentoCard span="seven" variant="feature" className="p-6 md:p-7 justify-between gap-6 group">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950/50 border border-violet-200/80 dark:border-violet-800/80 flex items-center justify-center text-violet-700 group-hover:scale-110 transition-transform shadow-2xs">
                    <LayoutDashboard size={20} />
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 border border-violet-200/70 dark:border-violet-800">
                    Bento Dashboard
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Centralized Command Center</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-5">
                  Consolidates high-priority daily focus tasks, chronological time blocks, active streaks, and milestone deadlines into one harmonious Apple-inspired grid.
                </p>

                {/* Simulated interactive mini bento elements */}
                <div className="space-y-2 bg-white/80 dark:bg-slate-900/80 p-3 rounded-2xl border border-slate-200/70 dark:border-slate-800 shadow-2xs backdrop-blur-xs">
                  <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 p-2 rounded-xl bg-violet-50/60 dark:bg-violet-950/30">
                    <span className="w-4 h-4 rounded bg-blue-600 text-white flex items-center justify-center">
                      <Check size={11} strokeWidth={3} />
                    </span>
                    <span className="truncate flex-1">Complete System Architecture Refactor</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 font-bold border border-rose-200">Urgent</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                    <span className="w-4 h-4 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700" />
                    <span className="truncate flex-1">Prepare Q1 Roadmap Presentation</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-200">Work</span>
                  </div>
                </div>
              </div>

              <Link 
                to="/dashboard"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-700 hover:underline pt-2"
              >
                <span>Explore Interactive Dashboard</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </BentoCard>

            {/* Card 2: Multi-Agent AI Assistant (span 5) */}
            <BentoCard span="five" variant="accent" className="p-6 md:p-7 justify-between gap-6 group">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white shadow-2xs group-hover:scale-110 transition-transform">
                    <Bot size={20} />
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-white/20 text-white border border-white/30">
                    Autonomous Agents
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Multi-Agent AI Team</h3>
                <p className="text-xs text-indigo-100 leading-relaxed mb-5">
                  Five specialized AI co-pilots collaborate to optimize your schedule, decompose complex projects into subtasks, and provide real-time productivity coaching.
                </p>

                {/* Simulated AI prompt chips */}
                <div className="space-y-2 bg-white/10 p-3 rounded-2xl border border-white/20 backdrop-blur-xs">
                  <div className="text-[11px] font-bold text-indigo-100 flex items-center gap-1.5">
                    <Sparkles size={13} className="text-amber-300" />
                    <span>Active Co-Pilots:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 text-[10px] font-bold">
                    <span className="px-2 py-0.5 rounded-lg bg-white/20 text-white">📅 Schedule Optimizer</span>
                    <span className="px-2 py-0.5 rounded-lg bg-white/20 text-white">🎯 Goal Strategist</span>
                    <span className="px-2 py-0.5 rounded-lg bg-white/20 text-white">⚡ Habit Coach</span>
                  </div>
                </div>
              </div>

              <Link 
                to="/ai-assistant"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-white hover:underline pt-2"
              >
                <span>Meet the AI Agent Fleet</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </BentoCard>

            {/* Card 3: Habit Streak & Velocity (span 4) */}
            <BentoCard span="third" className="p-6 justify-between gap-5 group">
              <div>
                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Flame size={20} className="animate-pulse" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Consistency Streaks</h3>
                <p className="text-xs text-slate-500 mb-4">
                  Visual habit momentum with automatic streak tracking and 28-day execution velocity heatmaps.
                </p>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <span className="text-2xl font-black text-amber-500">7</span>
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Day Streak Active! Keep momentum alive.</span>
                </div>
              </div>
              <Link to="/analytics" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                <span>View Analytics</span>
                <ArrowRight size={13} />
              </Link>
            </BentoCard>

            {/* Card 4: Chronological Time Blocking (span 4) */}
            <BentoCard span="third" className="p-6 justify-between gap-5 group">
              <div>
                <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Clock size={20} />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Chronological Blocking</h3>
                <p className="text-xs text-slate-500 mb-4">
                  Structure your day with hourly focus sprints, conflict detection, and quick drag-to-reschedule.
                </p>
                <div className="space-y-1.5 text-xs font-medium text-slate-600 dark:text-slate-400">
                  <div className="p-2 rounded-lg bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900 flex justify-between">
                    <span className="font-bold text-indigo-700 dark:text-indigo-300">09:00 - 11:00</span>
                    <span>Deep Work Block</span>
                  </div>
                </div>
              </div>
              <Link to="/daily-planner" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                <span>Plan Your Day</span>
                <ArrowRight size={13} />
              </Link>
            </BentoCard>

            {/* Card 5: Goals & Milestones (span 4) */}
            <BentoCard span="third" className="p-6 justify-between gap-5 group">
              <div>
                <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950/40 text-violet-700 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Target size={20} />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Strategic Milestones</h3>
                <p className="text-xs text-slate-500 mb-4">
                  Turn visionary goals into actionable roadmaps with measurable percentage completions.
                </p>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-slate-800 dark:text-slate-200">Frontend Redesign</span>
                    <span className="text-indigo-600">75%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-gradient-to-r from-[#582C8B] via-[#B86B58] to-[#D4AF37] h-full w-3/4 rounded-full" />
                  </div>
                </div>
              </div>
              <Link to="/goals" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                <span>Track Goals</span>
                <ArrowRight size={13} />
              </Link>
            </BentoCard>
          </BentoGrid>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-slate-500 text-xs border-t border-slate-200 dark:border-slate-800 mt-auto bg-white/70 dark:bg-slate-900/70 backdrop-blur-xs">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full overflow-hidden shadow-2xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shrink-0">
              <img src={logoImg} alt="AchieverOS" className="w-full h-full object-cover rounded-full" />
            </div>
            <span className="font-bold text-slate-800 dark:text-slate-200">AchieverOS</span>
            <span className="text-slate-400">· Bento Grid Productivity OS</span>
          </div>
          <p>© 2026 AchieverOS. Plan Better. Work Consistently. Achieve More.</p>
          <div className="flex gap-4">
            <Link to="/login" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Sign In</Link>
            <Link to="/dashboard" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Dashboard</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
