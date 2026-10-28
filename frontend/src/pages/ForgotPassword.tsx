import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import logoImg from '../assets/logo.png';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setSubmitted(true);
      toast.success('Password reset link sent!');
    }, 700);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Radiant Background Mesh Orbs */}
      <div className="absolute top-[-10%] left-[15%] w-[450px] h-[450px] rounded-full bg-gradient-to-br from-indigo-400/20 to-violet-400/15 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[15%] w-[450px] h-[450px] rounded-full bg-gradient-to-tr from-pink-400/15 to-purple-400/10 blur-[90px] pointer-events-none" />

      <div className="w-full max-w-[440px] mx-auto z-10 animate-fade-in">
        {/* Brand */}
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
          <p className="text-xs text-slate-500 font-medium mt-1">Reset your account credentials</p>
        </div>

        <div className="bg-white/95 backdrop-blur-md p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200">
          {submitted ? (
            <div className="text-center space-y-4 py-2">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-2xs border border-emerald-200">
                <CheckCircle2 size={28} />
              </div>
              <h3 className="text-lg font-extrabold text-slate-900">Check your inbox</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                We've sent recovery instructions to <span className="font-bold text-indigo-600">{email}</span>. Click the link in the email to set a new password.
              </p>
              <div className="pt-4">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 hover:underline"
                >
                  <ArrowLeft size={14} /> Back to Sign In
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-lg font-extrabold text-slate-900">Forgot Password?</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Enter your registered email and we'll send you recovery instructions.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
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

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 gradient-primary hover:gradient-primary-hover text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-indigo-500/25 hover:shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
                >
                  {isLoading ? 'Sending Link...' : 'Send Recovery Link'}
                </button>
              </form>

              <div className="mt-6 pt-4 border-t border-slate-100 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:underline"
                >
                  <ArrowLeft size={14} /> Back to Sign In
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
