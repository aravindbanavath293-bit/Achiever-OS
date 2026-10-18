import { useState } from 'react';
import { Link } from 'react-router-dom';

import { Mail, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { authService } from '../services/authService';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    try {
      const result = await authService.forgotPassword(email);
      if (result.success) {
        setStatus('success');
        setMessage(result.message);
      } else {
        setStatus('error');
        setMessage(result.message);
      }
    } catch {
      setStatus('error');
      setMessage('An unexpected error occurred.');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <img src="/logo.png" alt="AchieverOS" className="w-16 h-16 object-contain" />
          <span className="font-bold text-[24px] leading-[32px] text-primary">AchieverOS</span>
          <p className="text-on-surface-variant text-center mt-2">Reset your password</p>
        </div>

        {/* Card */}
        <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-sm border border-outline-variant">
          
          {status === 'success' ? (
            <div className="text-center space-y-6 animate-in fade-in zoom-in duration-300">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 size={32} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-on-surface mb-2">Check your email</h3>
                <p className="text-on-surface-variant leading-relaxed">
                  {message}
                </p>
              </div>
              <Link to="/login" className="block w-full py-3 bg-primary text-on-primary rounded-xl font-bold hover:bg-surface-tint transition-all shadow-sm">
                Return to log in
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <p className="text-on-surface-variant text-sm leading-relaxed mb-6">
                Enter the email address associated with your account and we'll send you a link to reset your password.
              </p>

              {status === 'error' && (
                <div className="p-4 bg-error-container text-on-error-container rounded-lg flex items-start gap-3 text-sm">
                  <AlertCircle size={20} className="shrink-0 mt-0.5" />
                  <p>{message}</p>
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-on-surface">Email address</label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full pl-10 pr-4 py-3 bg-surface-container rounded-xl border-none outline-none focus:ring-2 focus:ring-primary text-on-surface transition-all placeholder:text-outline"
                    required
                  />
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
                </div>
              </div>

              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full py-3 bg-primary text-on-primary rounded-xl font-bold hover:bg-surface-tint transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
              >
                {status === 'loading' ? 'Sending reset link...' : 'Send reset link'}
              </button>

              <div className="text-center">
                <Link to="/login" className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1">
                  <ArrowRight size={16} className="rotate-180" />
                  Back to log in
                </Link>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
