
import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../components/Layout';
import { authService } from '../services/authService';
import { ApiError } from '../services/api';

const AuthPage = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (mode === 'login') {
         const resp = await authService.login({ email: formData.email, password: formData.password });
         await login(resp.user);
      } else {
         const resp = await authService.register({ name: formData.name, email: formData.email, password: formData.password });
         await login(resp.user);
      }
      navigate('/dashboard');
    } catch (err: any) {
        if (err instanceof ApiError) {
            setError(err.message);
        } else {
            setError('Something went wrong. Please check your connection.');
        }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black flex flex-col items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-500/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-4 group">
            <div className="w-10 h-10 bg-black dark:bg-white rounded-xl flex items-center justify-center text-white dark:text-black font-display font-black text-xl shadow-xl group-hover:scale-110 transition-transform">
              K
            </div>
            <span className="text-2xl font-display font-bold text-gray-900 dark:text-white">KODLA</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {mode === 'login' ? 'Welcome back' : 'Create an account'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {mode === 'login' 
              ? 'Enter your credentials to access your workspace.' 
              : 'Join thousands of engineers mastering their craft.'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-dark-surface p-8 rounded-3xl border border-gray-100 dark:border-dark-border shadow-2xl shadow-brand-900/5">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 text-xs rounded-lg font-bold">
                {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Full Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="Alex Developer"
                  className="w-full bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-500 outline-none dark:text-white transition-all"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Email Address</label>
              <input 
                type="email" 
                required
                placeholder="alex@example.com"
                className="w-full bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-500 outline-none dark:text-white transition-all"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="block text-xs font-bold text-gray-500 uppercase">Password</label>
                {mode === 'login' && <a href="#" className="text-xs font-bold text-brand-600 hover:text-brand-500">Forgot?</a>}
              </div>
              <input 
                type="password" 
                required
                placeholder="••••••••"
                className="w-full bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-500 outline-none dark:text-white transition-all"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
              />
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-lg shadow-brand-500/20 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                <>
                   {mode === 'login' ? 'Sign In' : 'Create Account'}
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100 dark:border-dark-border"></div></div>
            <div className="relative flex justify-center text-xs uppercase font-bold text-gray-400">
              <span className="bg-white dark:bg-dark-surface px-4">Or continue with</span>
            </div>
          </div>

          <div>
             <button className="w-full flex items-center justify-center gap-2 py-2.5 border border-gray-200 dark:border-dark-border rounded-xl hover:bg-gray-50 dark:hover:bg-dark-bg transition-colors">
               <span className="text-lg">🐙</span> <span className="text-sm font-bold text-gray-600 dark:text-gray-300">GitHub</span>
             </button>
          </div>
        </div>

        {/* Toggle */}
        <p className="text-center mt-8 text-sm text-gray-500 dark:text-gray-400">
          {mode === 'login' ? "Don't have an account yet?" : "Already have an account?"}{' '}
          <button 
            onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login');
                setError('');
            }}
            className="font-bold text-brand-600 hover:text-brand-500 transition-colors"
          >
            {mode === 'login' ? 'Sign up' : 'Log in'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
