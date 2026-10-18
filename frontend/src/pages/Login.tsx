import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';
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

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-[420px] mx-auto">
        {/* Brand Header */}
        <div className="flex flex-col items-center gap-2 mb-6 text-center">
          <Link to="/" className="flex items-center gap-2.5">
            <img src={logoImg} alt="AchieverOS" className="w-12 h-12 object-contain" />
            <span className="font-bold text-2xl text-primary tracking-tight">AchieverOS</span>
          </Link>
          <p className="text-xs text-secondary-text mt-1">Plan Better. Work Consistently. Achieve More.</p>
        </div>

        {/* Card */}
        <div className="bg-white p-7 rounded-2xl shadow-sm border border-border">
          <div className="mb-5">
            <h2 className="text-base font-bold text-primary">Sign In</h2>
            <p className="text-xs text-on-surface-variant">Enter your credentials or click Demo Login to proceed</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start gap-2.5 text-xs">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-border focus:outline-none focus:border-primary"
                />
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-on-surface">Password</label>
                <Link to="/forgot-password" className="text-[11px] text-primary hover:underline">
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
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-border focus:outline-none focus:border-primary"
                />
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-primary hover:bg-primary-dark text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? 'Signing In...' : 'Sign In to Workspace'}
              <ArrowRight size={14} />
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="mt-5 pt-4 border-t border-border">
            <button
              type="button"
              onClick={() => {
                setEmail('alex.morgan@example.com');
                setPassword('password123');
                login('alex.morgan@example.com', 'password123').then(() => {
                  toast.success('Signed in as Alex Morgan (Demo)');
                  navigate('/dashboard');
                });
              }}
              className="w-full py-2 bg-gold/15 hover:bg-gold/25 border border-gold/40 text-gold-dark rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Sparkles size={14} />
              Instant Demo Sign In (1-Click)
            </button>
          </div>

          <div className="mt-4 text-center">
            <p className="text-xs text-on-surface-variant">
              Don't have an account?{' '}
              <Link to="/signup" className="font-semibold text-primary hover:underline">
                Sign up free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
