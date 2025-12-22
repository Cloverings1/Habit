import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';

export const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
      }
      navigate('/app');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0B0B] flex items-center justify-center p-6 selection:bg-[#E85D4F]/30">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[400px]"
      >
        <div className="text-center mb-12">
          <h1 className="text-[24px] font-semibold text-[#F5F5F5] mb-3 tracking-tight">
            {isLogin ? 'Sign In' : 'Create Account'}
          </h1>
          <p className="text-[14px] text-[#A0A0A0]">
            {isLogin ? 'Enter your details to continue.' : 'Start tracking your habits today.'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-6">
          <div>
            <label className="text-metadata block mb-2 opacity-60">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-0 py-3 bg-transparent border-b border-[#181818] text-[#F5F5F5] text-[15px] focus:outline-none focus:border-[#E85D4F] transition-colors"
              placeholder="name@example.com"
              required
            />
          </div>

          <div>
            <label className="text-metadata block mb-2 opacity-60">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-0 py-3 bg-transparent border-b border-[#181818] text-[#F5F5F5] text-[15px] focus:outline-none focus:border-[#E85D4F] transition-colors"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[13px] text-[#E85D4F] font-medium"
            >
              {error}
            </motion.div>
          )}

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="btn-pill-primary w-full disabled:opacity-50"
            >
              {loading ? 'Processing' : (isLogin ? 'Continue' : 'Create Account')}
            </button>
          </div>
        </form>

        <div className="mt-10 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-[13px] text-[#6F6F6F] hover:text-[#A0A0A0] transition-colors"
          >
            {isLogin ? "New here? Create an account" : "Already have an account? Sign in"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
