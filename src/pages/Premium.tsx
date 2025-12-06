import React, { useContext } from 'react';
import { AuthContext } from '../components/Layout';
import { IconCheck, IconX, IconSparkles } from '../components/Icons';

const PremiumPage = () => {
  const { upgrade, user } = useContext(AuthContext);

  return (
    <div className="max-w-5xl mx-auto py-12 text-center">
      <div className="mb-12">
        <span className="text-brand-600 font-bold tracking-wider uppercase text-sm">Unlock Your Potential</span>
        <h1 className="text-5xl font-display font-bold mt-3 mb-6 text-gray-900 dark:text-white">Invest in your career</h1>
        <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">Get unlimited access to AI tutoring, system design masterclasses, and senior-level interview prep.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 px-4 max-w-4xl mx-auto">
        {/* Free Plan */}
        <div className="bg-white dark:bg-dark-surface p-8 rounded-3xl border border-gray-200 dark:border-dark-border flex flex-col">
          <div className="mb-8">
            <h3 className="text-2xl font-bold mb-2 dark:text-white">Starter</h3>
            <div className="text-5xl font-display font-bold mb-2 dark:text-white">$0</div>
            <div className="text-gray-500">Forever free</div>
          </div>
          
          <ul className="space-y-4 text-left mb-8 flex-1">
            <li className="flex items-center gap-3 text-gray-700 dark:text-gray-300"><div className="bg-green-100 dark:bg-green-900/30 p-1 rounded-full"><IconCheck className="text-green-600 w-3 h-3"/></div> Access to Core Java/Go Tracks</li>
            <li className="flex items-center gap-3 text-gray-700 dark:text-gray-300"><div className="bg-green-100 dark:bg-green-900/30 p-1 rounded-full"><IconCheck className="text-green-600 w-3 h-3"/></div> Limited Daily Executions</li>
            <li className="flex items-center gap-3 text-gray-400"><IconX className="w-5 h-5 opacity-50"/> No AI Tutor</li>
            <li className="flex items-center gap-3 text-gray-400"><IconX className="w-5 h-5 opacity-50"/> No System Design Course</li>
          </ul>
          <button className="w-full py-4 bg-gray-100 dark:bg-dark-border font-bold rounded-xl text-gray-600 dark:text-gray-400" disabled>Current Plan</button>
        </div>

        {/* Pro Plan */}
        <div className="bg-white dark:bg-dark-surface p-8 rounded-3xl border-2 border-brand-500 relative overflow-hidden shadow-2xl shadow-brand-500/10 flex flex-col transform hover:-translate-y-1 transition-transform">
          <div className="absolute top-0 right-0 bg-brand-500 text-white text-xs font-bold px-4 py-1.5 rounded-bl-2xl uppercase tracking-wider">Most Popular</div>
          <div className="mb-8">
            <h3 className="text-2xl font-bold mb-2 text-brand-600">Professional</h3>
            <div className="text-5xl font-display font-bold mb-2 dark:text-white">$19<span className="text-lg font-normal text-gray-500">/mo</span></div>
            <div className="text-gray-500">Billed monthly</div>
          </div>
          
          <ul className="space-y-4 text-left mb-8 flex-1">
            <li className="flex items-center gap-3 text-gray-900 dark:text-white font-medium"><div className="bg-brand-100 dark:bg-brand-900/30 p-1 rounded-full"><IconCheck className="text-brand-600 w-3 h-3"/></div> Everything in Starter</li>
            <li className="flex items-center gap-3 text-gray-900 dark:text-white font-medium"><div className="bg-brand-100 dark:bg-brand-900/30 p-1 rounded-full"><IconCheck className="text-brand-600 w-3 h-3"/></div> KODLA AI Assistant (Unlimited)</li>
            <li className="flex items-center gap-3 text-gray-900 dark:text-white font-medium"><div className="bg-brand-100 dark:bg-brand-900/30 p-1 rounded-full"><IconCheck className="text-brand-600 w-3 h-3"/></div> System Design & Arch Patterns</li>
            <li className="flex items-center gap-3 text-gray-900 dark:text-white font-medium"><div className="bg-brand-100 dark:bg-brand-900/30 p-1 rounded-full"><IconCheck className="text-brand-600 w-3 h-3"/></div> Verified Certificates</li>
          </ul>
          {user?.isPremium ? (
            <button className="w-full py-4 bg-green-500 text-white font-bold rounded-xl cursor-default shadow-lg shadow-green-500/20">Active Subscription</button>
          ) : (
            <button onClick={upgrade} className="w-full py-4 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl transition-all shadow-xl shadow-brand-500/30">
              Upgrade to Pro
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PremiumPage;