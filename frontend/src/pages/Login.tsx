import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, AlertCircle, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logoImg from '../assets/logo.png';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('alex.morgan@example.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      toast.success('Welcome back to AchieverOS!');
      navigate('/dashboard');
    } catch {
      setError('Invalid credentials or authentication error.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setEmail('alex.morgan@example.com');
    setPassword('password123');
    setIsLoading(true);
    try {
      await login('alex.morgan@example.com', 'password123');
      toast.success('Signed in with Demo Account!');
      navigate('/dashboard');
    } catch {
      setError('Demo authentication error.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Radiant Background Mesh Orbs */}
      <div className="absolute top-[-10%] left-[15%] w-[450px] h-[450px] rounded-full bg-gradient-to-br from-indigo-400/20 to-violet-400/15 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[15%] w-[450px] h-[450px] rounded-full bg-gradient-to-tr from-pink-400/15 to-purple-400/10 blur-[90px] pointer-events-none" />

      <div className="w-full max-w-[440px] mx-auto z-10 animate-fade-in">
        {/* Brand Header */}
        <div className="flex flex-col items-center gap-2 mb-6 text-center">
          <Link to="/" className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-full overflow-hidden shadow-lg shadow-indigo-500/20 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shrink-0">
              <img 
                src={logoImg} 
                alt="AchieverOS" 
                className="w-full h-full object-cover rounded-full"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} 
              />
            </div>
            <span className="font-extrabold text-2xl tracking-tight bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 bg-clip-text text-transparent">
              AchieverOS
            </span>
          </Link>
          <p className="text-xs text-slate-500 font-medium mt-1">Plan Better. Work Consistently. Achieve More.</p>
        </div>

        {/* Card */}
        <div className="bg-white/95 backdrop-blur-md p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200">
          <div className="mb-6">
            <h2 className="text-lg font-extrabold text-slate-900">Sign In to Workspace</h2>
            <p className="text-xs text-slate-500 mt-0.5">Enter your credentials or click 1-Click Demo to proceed</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-start gap-2.5 text-xs animate-shake">
                <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-600" />
                <p className="font-semibold">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-slate-800"
                />
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-slate-800">Password</label>
                <Link to="/forgot-password" className="text-[11px] font-bold text-indigo-600 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-slate-800"
                />
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 gradient-primary hover:gradient-primary-hover text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-indigo-500/25 hover:shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
            >
              {isLoading ? 'Signing In...' : 'Sign In to Workspace'}
              <ArrowRight size={14} />
            </button>
          </form>

          {/* Quick Demo Button */}
          <div className="mt-4 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={isLoading}
              className="w-full py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
            >
              <Sparkles size={14} className="text-indigo-600" />
              <span>Instant 1-Click Demo Login</span>
            </button>
          </div>

          <p className="text-center text-xs text-slate-500 mt-6">
            Don't have an account yet?{' '}
            <Link to="/signup" className="text-indigo-600 font-bold hover:underline">
              Sign Up Free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
