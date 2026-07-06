import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Mail, Lock, User, Target, Clock, Zap, Loader2 } from 'lucide-react';
import { api, API_URL } from '../services/api';

interface LoginProps {
  onLoginSuccess: (user: any) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [targetRole, setTargetRole] = useState('AI Engineer');
  const [hours, setHours] = useState(15);
  const [speed, setSpeed] = useState('Moderate');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        await api.post('/api/auth/register', {
          email,
          password,
          full_name: fullName,
          target_role: targetRole,
          available_hours: hours,
          learning_speed: speed
        });
      }

      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      const response = await fetch(`${API_URL}/api/auth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({ detail: 'Incorrect credentials' }));
        throw new Error(err.detail || 'Incorrect credentials');
      }

      const tokenData = await response.json();
      api.setToken(tokenData.access_token);

      const user = await api.get('/api/auth/me');
      onLoginSuccess(user);
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify details.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoMode = async () => {
    if (loading) return;
    setError('');
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/me`, {
        headers: {
          'Authorization': '' 
        }
      });
      if (!response.ok) throw new Error('Demo auto-login failed');
      const user = await response.json();
      
      localStorage.setItem('token', 'demo-mode-token');
      onLoginSuccess(user);
    } catch (err: any) {
      setError('Unable to start Demo Mode. Is backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-dark px-4 py-12 relative overflow-hidden">
      {/* Background Orbs */}
      <motion.div 
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.4, 0.3],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-accent/10 rounded-full blur-[120px] pointer-events-none"
      />
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.3, 0.2],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-teal/10 rounded-full blur-[120px] pointer-events-none"
      />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md glass p-8 rounded-3xl relative z-10"
      >
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-accent to-brand-teal flex items-center justify-center shadow-lg shadow-brand-accent/20 mb-4"
          >
            <Sparkles className="w-6 h-6 text-white" />
          </motion.div>
          <h2 className="text-xl font-extrabold tracking-tight text-white m-0 font-display">
            {isRegister ? 'Create your Pilot profile' : 'Welcome back to CareerPilot'}
          </h2>
          <p className="text-xs text-brand-muted mt-2 m-0 font-sans leading-relaxed">
            {isRegister ? 'Set your career targets and let the agents guide you' : 'Log in to monitor your career progression index'}
          </p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-brand-rose/10 border border-brand-rose/20 text-brand-rose p-3.5 rounded-xl text-xs mb-6 text-center font-semibold"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <AnimatePresence mode="popLayout">
            {isRegister && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 overflow-hidden"
              >
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-muted mb-2">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
                    <input
                      type="text"
                      required={isRegister}
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full bg-brand-darker border border-brand-border focus:border-brand-accent focus:ring-1 focus:ring-brand-accent rounded-xl py-3 pl-12 pr-4 text-xs text-white placeholder-brand-muted/40 transition-all outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-muted mb-2">Target Role</label>
                    <div className="relative">
                      <Target className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
                      <select
                        value={targetRole}
                        onChange={(e) => setTargetRole(e.target.value)}
                        className="w-full bg-brand-darker border border-brand-border focus:border-brand-accent focus:ring-1 focus:ring-brand-accent rounded-xl py-3 pl-12 pr-4 text-xs text-white appearance-none transition-all outline-none"
                      >
                        <option value="AI Engineer">AI Engineer</option>
                        <option value="ML Engineer">ML Engineer</option>
                        <option value="Backend Engineer">Backend Engineer</option>
                        <option value="Data Scientist">Data Scientist</option>
                        <option value="DevOps Engineer">DevOps Engineer</option>
                        <option value="Fullstack Engineer">Fullstack Engineer</option>
                        <option value="Software Engineer">Software Engineer</option>
                        <option value="Data Analyst">Data Analyst</option>
                        <option value="Frontend Engineer">Frontend Engineer</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-muted mb-2">Available Hours</label>
                    <div className="relative">
                      <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
                      <input
                        type="number"
                        min="5"
                        max="80"
                        value={hours}
                        onChange={(e) => setHours(Number(e.target.value))}
                        className="w-full bg-brand-darker border border-brand-border focus:border-brand-accent focus:ring-1 focus:ring-brand-accent rounded-xl py-3 pl-12 pr-4 text-xs text-white transition-all outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-muted mb-2">Study Pacing</label>
                  <div className="relative">
                    <Zap className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
                    <select
                      value={speed}
                      onChange={(e) => setSpeed(e.target.value)}
                      className="w-full bg-brand-darker border border-brand-border focus:border-brand-accent focus:ring-1 focus:ring-brand-accent rounded-xl py-3 pl-12 pr-4 text-xs text-white appearance-none transition-all outline-none"
                    >
                      <option value="Fast">Fast Pace</option>
                      <option value="Moderate">Moderate Pace</option>
                      <option value="Slow">Steady Pace</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-muted mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-brand-darker border border-brand-border focus:border-brand-accent focus:ring-1 focus:ring-brand-accent rounded-xl py-3 pl-12 pr-4 text-xs text-white placeholder-brand-muted/40 transition-all outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-muted mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-brand-darker border border-brand-border focus:border-brand-accent focus:ring-1 focus:ring-brand-accent rounded-xl py-3 pl-12 pr-4 text-xs text-white placeholder-brand-muted/40 transition-all outline-none"
              />
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full bg-brand-accent hover:bg-brand-accent/90 disabled:opacity-50 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider transition-all duration-200 mt-6 shadow-md shadow-brand-accent/15 cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : isRegister ? (
              'Set Up Profile'
            ) : (
              'Enter Dashboard'
            )}
          </motion.button>
        </form>

        <div className="relative my-6 flex items-center justify-center">
          <div className="absolute inset-0 w-full border-t border-brand-border"></div>
          <span className="bg-[#0b101c] relative px-4 text-[10px] font-bold uppercase text-brand-muted tracking-wider">Or Explore Instantly</span>
        </div>

        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleDemoMode}
          disabled={loading}
          className="w-full bg-transparent hover:bg-brand-border/30 text-brand-teal font-bold py-3 rounded-xl text-xs uppercase tracking-wider transition-all duration-200 border border-brand-teal/20 hover:border-brand-teal flex items-center justify-center gap-2 cursor-pointer"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : '⚡ Load Judge Demo Mode'}
        </motion.button>

        <p className="text-center text-xs text-brand-muted mt-8 mb-0 font-semibold">
          {isRegister ? 'Already have an account?' : "Don't have a profile?"}{' '}
          <button
            onClick={() => setIsRegister(!isRegister)}
            className="text-brand-accent hover:underline font-bold bg-transparent border-none p-0 cursor-pointer"
          >
            {isRegister ? 'Log in' : 'Register here'}
          </button>
        </p>
      </motion.div>
    </div>
  );
};
export default Login;
