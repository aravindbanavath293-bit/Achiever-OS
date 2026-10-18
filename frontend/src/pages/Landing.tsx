import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, BarChart3, LayoutDashboard, Calendar, Shield, Bot, Flame } from 'lucide-react';
import logoImg from '../assets/logo.png';

export default function Landing() {
  return (
    <div className="min-h-screen bg-background flex flex-col text-on-surface">
      {/* Top Navbar */}
      <nav className="flex justify-between items-center px-6 py-4 md:px-12 md:py-5 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <img src={logoImg} alt="AchieverOS" className="w-9 h-9 rounded-lg object-contain" />
          <span className="font-bold text-xl text-primary tracking-tight">AchieverOS</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="px-4 py-2 text-xs font-semibold text-primary hover:bg-surface-container rounded-lg transition-colors"
          >
            Log In
          </Link>
          <Link
            to="/signup"
            className="px-4 py-2 text-xs font-semibold bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors shadow-xs"
          >
            Get Started Free
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-12 md:py-20 max-w-4xl mx-auto w-full">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-6">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-gold"></span>
          </span>
          Next-Gen AI Productivity Operating System
        </div>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-primary tracking-tight leading-tight mb-4">
          Plan Better. Work Consistently. <br />
          <span className="text-gold">Achieve More.</span>
        </h1>

        <p className="text-sm md:text-base text-secondary-text max-w-2xl mb-8 leading-relaxed">
          The all-in-one productivity suite that combines intelligent task execution, chronological time blocking, weekly timetables, milestone tracking, and autonomous AI orchestration.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Link
            to="/dashboard"
            className="px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 group cursor-pointer"
          >
            Launch Interactive Workspace
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            to="/login"
            className="px-6 py-3 bg-white hover:bg-surface-container text-primary border border-border rounded-xl text-xs font-bold transition-colors flex items-center justify-center shadow-2xs"
          >
            Sign In with Demo Account
          </Link>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 text-left w-full">
          <div className="bg-white p-5 rounded-xl border border-border shadow-xs hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3 text-primary">
              <LayoutDashboard size={20} />
            </div>
            <h3 className="text-sm font-bold text-primary mb-1">Bento Productivity Dashboard</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Consolidated real-time view of daily focus tasks, schedule blocks, active streaks, and milestone deadlines.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-border shadow-xs hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-lg bg-gold/15 flex items-center justify-center mb-3 text-gold-dark">
              <Bot size={20} />
            </div>
            <h3 className="text-sm font-bold text-primary mb-1">Multi-Agent AI Assistant</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Orchestrated team of specialized agents for planning, task intelligence, goal coaching, and semantic RAG retrieval.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-border shadow-xs hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center mb-3 text-emerald-600">
              <BarChart3 size={20} />
            </div>
            <h3 className="text-sm font-bold text-primary mb-1">Streak & Consistency Heatmaps</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Build unshakeable daily habits with calculated velocity, completion analytics, and category-level distribution.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-secondary-text text-xs border-t border-border mt-auto bg-white">
        <p>© 2026 AchieverOS. Plan Better. Work Consistently. Achieve More.</p>
      </footer>
    </div>
  );
}
