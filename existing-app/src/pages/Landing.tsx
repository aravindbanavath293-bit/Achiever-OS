import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, BarChart3, LayoutDashboard } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navigation */}
      <nav className="flex justify-between items-center px-6 py-4 md:px-12 md:py-6 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="AchieverOS" className="w-8 h-8 rounded-lg object-contain" />
          <span className="font-bold text-xl text-primary">AchieverOS</span>
        </div>
        <div className="flex gap-4">
          <Link to="/login" className="px-4 py-2 font-medium text-primary hover:bg-surface-container-high rounded-lg transition-colors">
            Log In
          </Link>
          <Link to="/signup" className="px-4 py-2 font-medium bg-primary text-on-primary rounded-lg hover:bg-surface-tint transition-colors shadow-sm">
            Sign Up
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-12 md:py-24 max-w-4xl mx-auto w-full mt-8 md:mt-0">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-fixed text-on-primary-fixed text-sm font-medium mb-8">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          Now available in public beta
        </div>
        
        <h1 className="text-4xl md:text-6xl font-extrabold text-on-surface tracking-tight leading-tight mb-6">
          Plan Better. Work Consistently. <br className="hidden md:block" />
          <span className="text-primary">Achieve More.</span>
        </h1>
        
        <p className="text-lg md:text-xl text-on-surface-variant max-w-2xl mb-10 leading-relaxed">
          The all-in-one productivity suite designed to help you organize your tasks, 
          track your goals, and build consistent habits without the overwhelm.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link to="/signup" className="px-8 py-4 bg-primary text-on-primary rounded-xl font-bold text-lg hover:bg-surface-tint transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 group">
            Get Started Free
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link to="/login" className="px-8 py-4 bg-surface-container text-on-surface rounded-xl font-bold text-lg hover:bg-surface-container-high transition-all flex items-center justify-center">
            View Demo
          </Link>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 text-left w-full">
          <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-primary-fixed flex items-center justify-center mb-4 text-on-primary-fixed">
              <LayoutDashboard size={24} />
            </div>
            <h3 className="text-xl font-bold text-on-surface mb-2">Bento Dashboard</h3>
            <p className="text-on-surface-variant leading-relaxed">
              Everything you need at a glance. See your tasks, schedule, and goals in one beautiful, organized view.
            </p>
          </div>
          
          <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center mb-4 text-green-800">
              <CheckCircle2 size={24} />
            </div>
            <h3 className="text-xl font-bold text-on-surface mb-2">Smart Task Management</h3>
            <p className="text-on-surface-variant leading-relaxed">
              Prioritize effectively. Group by daily, weekly, or long-term goals to ensure you're always working on what matters.
            </p>
          </div>
          
          <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center mb-4 text-amber-800">
              <BarChart3 size={24} />
            </div>
            <h3 className="text-xl font-bold text-on-surface mb-2">Progress Analytics</h3>
            <p className="text-on-surface-variant leading-relaxed">
              Build momentum with streak tracking, activity heatmaps, and visual progress indicators for all your goals.
            </p>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="py-8 text-center text-on-surface-variant text-sm border-t border-outline-variant mt-12 bg-surface-container-low">
        <p>© 2024 AchieverOS. Designed for focus and productivity.</p>
      </footer>
    </div>
  );
}
