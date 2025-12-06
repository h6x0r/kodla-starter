
import React, { useContext, useEffect, useState } from 'react';
import { paymentService } from '../features/payments/api/paymentService';
import { AuthContext } from '../components/Layout';
import { IconCheck, IconX, IconSparkles } from '../components/Icons';

const PaymentsPage = () => {
  const { user } = useContext(AuthContext);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
        paymentService.getPaymentHistory().then(data => {
            setHistory(data);
            setLoading(false);
        });
    }
  }, [user]);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white">Billing & Payments</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Manage your subscription and view payment history.</p>
      </div>

      {/* Current Plan Card - Dynamic */}
      <div className={`rounded-3xl p-8 text-white shadow-xl relative overflow-hidden transition-all duration-500 ${
        user?.isPremium 
          ? 'bg-gradient-to-r from-amber-500 to-orange-600' 
          : 'bg-gradient-to-r from-gray-900 to-gray-800 dark:from-dark-surface dark:to-black'
      }`}>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          {user?.isPremium ? (
            /* Premium State */
            <div>
                <div className="flex items-center gap-2 text-white/90 font-bold uppercase tracking-wider mb-2 text-xs">
                    <IconSparkles className="w-4 h-4" /> Current Plan
                </div>
                <h2 className="text-3xl font-display font-bold mb-2">Professional</h2>
                <p className="text-white/90 max-w-md">
                    Your active subscription renews on <span className="font-bold bg-white/20 px-1 rounded">{user.plan?.expiresAt || 'Dec 31, 2024'}</span>. 
                    You have full access to all features.
                </p>
            </div>
          ) : (
            /* Free State */
            <div>
                <div className="text-brand-400 font-bold uppercase tracking-wider mb-2 text-xs">Current Plan</div>
                <h2 className="text-3xl font-display font-bold mb-2">Free Starter</h2>
                <p className="text-gray-400 max-w-md">You are currently on the free plan. Upgrade to unlock the full potential of KODLA.</p>
            </div>
          )}

          {user?.isPremium ? (
             <button className="px-8 py-3 bg-white/20 hover:bg-white/30 text-white font-bold rounded-xl backdrop-blur-md transition-all border border-white/30">
                Manage Subscription
             </button>
          ) : (
             <button className="px-8 py-3 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl shadow-lg transition-all">
                Upgrade Plan
             </button>
          )}
        </div>
        
        {/* Decorative Circle */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
      </div>

      {/* Payment Methods */}
      <div className="bg-white dark:bg-dark-surface p-8 rounded-3xl border border-gray-100 dark:border-dark-border shadow-sm">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Payment Methods</h3>
        <div className="flex items-center gap-4 p-4 border border-gray-200 dark:border-dark-border rounded-xl bg-gray-50 dark:bg-dark-bg/50">
           <div className="w-12 h-8 bg-gray-300 dark:bg-gray-700 rounded flex items-center justify-center text-xs font-mono text-gray-600 dark:text-gray-400">VISA</div>
           <div className="flex-1">
             <div className="font-bold text-sm text-gray-900 dark:text-white">Visa ending in 4242</div>
             <div className="text-xs text-gray-500">Expires 12/2024</div>
           </div>
           <button className="text-sm font-bold text-brand-600 hover:text-brand-500 dark:text-brand-400">Edit</button>
        </div>
        <button className="mt-4 flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
          <span className="text-xl">+</span> Add Payment Method
        </button>
      </div>

      {/* History Table */}
      <div className="bg-white dark:bg-dark-surface rounded-3xl border border-gray-100 dark:border-dark-border overflow-hidden shadow-sm">
        <div className="p-6 border-b border-gray-100 dark:border-dark-border">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Payment History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-dark-bg text-gray-500 uppercase font-bold text-xs">
              <tr>
                <th className="px-6 py-4">Invoice ID</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
              {loading ? (
                  <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">Loading history...</td></tr>
              ) : (
                history.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-dark-bg/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-gray-500">{item.id}</td>
                    <td className="px-6 py-4 text-gray-900 dark:text-white">{item.date}</td>
                    <td className="px-6 py-4 text-gray-500">{item.description}</td>
                    <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">${item.amount / 100}</td>
                    <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                        item.status === 'paid' 
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                        {item.status === 'paid' ? <IconCheck className="w-3 h-3"/> : <IconX className="w-3 h-3"/>}
                        {item.status}
                        </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                        <button className="text-gray-400 hover:text-brand-600 transition-colors font-bold text-xs">Download</button>
                    </td>
                    </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PaymentsPage;
