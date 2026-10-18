import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
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
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-[420px] mx-auto">
        {/* Brand */}
        <div className="flex flex-col items-center gap-2 mb-6 text-center">
          <Link to="/" className="flex items-center gap-2.5">
            <img src={logoImg} alt="AchieverOS" className="w-12 h-12 object-contain" />
            <span className="font-bold text-2xl text-primary tracking-tight">AchieverOS</span>
          </Link>
          <p className="text-xs text-secondary-text mt-1">Reset your account password</p>
        </div>

        <div className="bg-white p-7 rounded-2xl shadow-sm border border-border">
          {submitted ? (
            <div className="text-center space-y-4 py-2">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 size={24} />
              </div>
              <h3 className="text-base font-bold text-primary">Check your email</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                We've sent a password reset link to <span className="font-semibold text-primary">{email}</span>. Click the link in the email to set a new password.
              </p>
              <div className="pt-3">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-xs font-bold text-primary hover:underline"
                >
                  <ArrowLeft size={14} /> Back to Sign In
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-5">
                <h2 className="text-base font-bold text-primary">Forgot Password?</h2>
                <p className="text-xs text-on-surface-variant">
                  No worries, enter your email and we'll send you recovery instructions.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
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

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 bg-primary hover:bg-primary-dark text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? 'Sending Link...' : 'Send Reset Link'}
                </button>
              </form>

              <div className="mt-5 pt-4 border-t border-border text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
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
