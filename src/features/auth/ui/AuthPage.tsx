
import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../../components/Layout';
import { authService } from '../api/authService';
import { ApiError } from '../../../services/api';
import { useToast } from '../../../components/Toast';

const AuthPage = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const { showToast } = useToast();
  
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (mode === 'forgot') {
         await authService.resetPassword(formData.email);
         showToast('Password reset link sent to your email.', 'success');
         setMode('login');
         return;
      }

      if (mode === 'login') {
         const resp = await authService.login({ email: formData.email, password: formData.password });
         await login(resp.user);
         showToast(`Welcome back, ${resp.user.name.split(' ')[0]}!`, 'success');
      } else {
         const resp = await authService.register({ name: formData.name, email: formData.email, password: formData.password });
         await login(resp.user);
         showToast('Account created successfully!', 'success');
      }
      navigate('/dashboard');
    } catch (err: any) {
        if (err instanceof ApiError) {
            showToast(err.message, 'error');
        } else {
            showToast('Connection failed. Please check your internet.', 'error');
        }
    } finally {
      setIsLoading(false);
    }
  };

  const getTitle = () => {
      if (mode === 'login') return 'Welcome back';
      if (mode === 'register') return 'Create an account';
      return 'Reset Password';
  };

  const getDescription = () => {
      if (mode === 'login') return 'Enter your credentials to access your workspace.';
      if (mode === 'register') return 'Join thousands of engineers mastering their craft.';
      return 'Enter your email to receive a reset link.';
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
            {getTitle()}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {getDescription()}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-dark-surface p-8 rounded-3xl border border-gray-100 dark:border-dark-border shadow-2xl shadow-brand-900/5">
          
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {mode === 'register' && (
              <div className="animate-fade-in-up">
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

            {mode !== 'forgot' && (
              <div className="animate-fade-in-up">
                <div className="flex justify-between mb-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase">Password</label>
                  {mode === 'login' && (
                    <button 
                        type="button" 
                        onClick={() => setMode('forgot')}
                        className="text-xs font-bold text-brand-600 hover:text-brand-500 transition-colors"
                    >
                        Forgot?
                    </button>
                  )}
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
            )}

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-lg shadow-brand-500/20 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                <>
                   {mode === 'login' && 'Sign In'}
                   {mode === 'register' && 'Create Account'}
                   {mode === 'forgot' && 'Send Reset Link'}
                </>
              )}
            </button>
          </form>

          {/* Divider & Social Logic (Hidden on Forgot) */}
          {mode !== 'forgot' && (
            <>
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
            </>
          )}
        </div>

        {/* Toggle Mode */}
        <p className="text-center mt-8 text-sm text-gray-500 dark:text-gray-400">
          {mode === 'login' && (
              <>
                Don't have an account yet?{' '}
                <button onClick={() => setMode('register')} className="font-bold text-brand-600 hover:text-brand-500 transition-colors">Sign up</button>
              </>
          )}
          {mode === 'register' && (
              <>
                Already have an account?{' '}
                <button onClick={() => setMode('login')} className="font-bold text-brand-600 hover:text-brand-500 transition-colors">Log in</button>
              </>
          )}
          {mode === 'forgot' && (
              <button onClick={() => setMode('login')} className="font-bold text-gray-600 dark:text-gray-400 hover:text-brand-600 dark:hover:text-white transition-colors flex items-center gap-2 mx-auto">
                 ← Back to Sign In
              </button>
          )}
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
