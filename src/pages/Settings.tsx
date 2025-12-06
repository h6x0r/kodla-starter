
import React, { useState, useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../components/Layout';
import { useToast } from '../components/Toast';
import { IconCheck, IconCode } from '../components/Icons';
import { authService } from '../features/auth/api/authService';

const SettingsPage = () => {
  const { user, updateUser } = useContext(AuthContext);
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);

  // Initialize state from User object (Coming from Backend)
  const [editorSettings, setEditorSettings] = useState({
    fontSize: 14,
    minimap: false,
    vimMode: false,
    lineNumbers: true,
    theme: 'vs-dark' as 'vs-dark' | 'light'
  });

  const [notifications, setNotifications] = useState({
    emailDigest: true,
    newCourses: true,
    marketing: false,
    securityAlerts: true
  });

  useEffect(() => {
    if (user?.preferences) {
        const p = user.preferences;
        setEditorSettings({
            fontSize: p.editorFontSize,
            minimap: p.editorMinimap,
            vimMode: p.editorVimMode,
            lineNumbers: p.editorLineNumbers,
            theme: p.editorTheme
        });
        setNotifications(p.notifications);
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setIsLoading(true);
    
    try {
        const updatedPrefs = {
            editorFontSize: editorSettings.fontSize,
            editorMinimap: editorSettings.minimap,
            editorVimMode: editorSettings.vimMode,
            editorLineNumbers: editorSettings.lineNumbers,
            editorTheme: editorSettings.theme,
            notifications: notifications
        };

        const updatedUser = await authService.updatePreferences(updatedPrefs);
        updateUser(updatedUser); // Update global context immediately
        
        showToast('Settings saved successfully', 'success');
    } catch (e) {
        showToast('Failed to save settings', 'error');
    } finally {
        setIsLoading(false);
    }
  };

  const Toggle = ({ label, checked, onChange, description }: any) => (
    <div className="flex items-center justify-between py-4 border-b border-gray-100 dark:border-dark-border last:border-0">
        <div>
            <div className="text-sm font-bold text-gray-900 dark:text-white">{label}</div>
            {description && <div className="text-xs text-gray-500 mt-0.5">{description}</div>}
        </div>
        <button 
            onClick={() => onChange(!checked)}
            className={`w-11 h-6 flex items-center rounded-full transition-colors duration-300 ${checked ? 'bg-brand-600' : 'bg-gray-200 dark:bg-gray-700'}`}
        >
            <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${checked ? 'translate-x-6' : 'translate-x-1'}`}></div>
        </button>
    </div>
  );

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
         <div className="w-16 h-16 bg-gray-100 dark:bg-dark-surface rounded-2xl flex items-center justify-center mb-6">
            <IconCode className="w-8 h-8 text-gray-400" />
         </div>
         <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Login to manage Settings</h2>
         <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-6">Update your profile, change passwords, and manage notification preferences.</p>
         <Link to="/login" className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl transition-colors">
            Sign In
         </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
       <div>
        <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Manage your profile, editor preferences, and security.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Sidebar Nav */}
        <div className="w-full md:w-64 flex-shrink-0 space-y-1">
          {[
            { id: 'profile', label: 'Public Profile', icon: '👤' },
            { id: 'preferences', label: 'Editor & Appearance', icon: '⚙️' },
            { id: 'notifications', label: 'Notifications', icon: '🔔' },
            { id: 'security', label: 'Password & Security', icon: '🔒' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-3 transition-all ${
                activeTab === tab.id 
                  ? 'bg-white dark:bg-dark-surface text-brand-600 shadow-sm border border-gray-100 dark:border-dark-border ring-1 ring-brand-500/10' 
                  : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-dark-border/50 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 w-full bg-white dark:bg-dark-surface p-6 md:p-8 rounded-3xl border border-gray-100 dark:border-dark-border shadow-sm">
           
           {/* --- PROFILE TAB --- */}
           {activeTab === 'profile' && (
             <div className="space-y-8 animate-fade-in">
               <h2 className="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-dark-border pb-4">Public Profile</h2>
               
               <div className="flex items-center gap-6">
                 <img src={user.avatarUrl} className="w-24 h-24 rounded-full ring-4 ring-gray-50 dark:ring-dark-bg object-cover" alt="avatar" />
                 <div>
                   <button className="px-4 py-2 bg-white dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-lg text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-dark-border transition-colors shadow-sm">
                     Upload New
                   </button>
                   <div className="text-xs text-gray-500 mt-2">JPG, GIF or PNG. Max size 800K.</div>
                 </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                   <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Full Name</label>
                   <input type="text" defaultValue={user.name} className="w-full bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-500 outline-none dark:text-white" />
                 </div>
                 <div>
                   <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Username</label>
                   <input type="text" defaultValue="alex_dev" className="w-full bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-500 outline-none dark:text-white" />
                 </div>
                 <div className="col-span-1 md:col-span-2">
                   <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Bio</label>
                   <textarea rows={4} className="w-full bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-500 outline-none dark:text-white" placeholder="Tell us about yourself..."></textarea>
                   <div className="text-right text-xs text-gray-400 mt-1">0/200</div>
                 </div>
               </div>
             </div>
           )}

           {/* --- PREFERENCES TAB (Editor) --- */}
           {activeTab === 'preferences' && (
             <div className="space-y-8 animate-fade-in">
               <h2 className="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-dark-border pb-4">Editor Configuration</h2>
               
               {/* Font Size Slider */}
               <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-bold text-gray-900 dark:text-white">Font Size</label>
                    <span className="text-sm font-mono text-brand-600 dark:text-brand-400">{editorSettings.fontSize}px</span>
                  </div>
                  <input 
                    type="range" 
                    min="12" 
                    max="20" 
                    step="1"
                    value={editorSettings.fontSize}
                    onChange={(e) => setEditorSettings({...editorSettings, fontSize: parseInt(e.target.value)})}
                    className="w-full h-2 bg-gray-200 dark:bg-dark-bg rounded-lg appearance-none cursor-pointer accent-brand-600"
                  />
                  <div className="mt-4 p-4 bg-[#1e1e1e] rounded-xl border border-gray-800 font-mono text-gray-300 overflow-hidden" style={{ fontSize: `${editorSettings.fontSize}px` }}>
                    <span className="text-purple-400">func</span> <span className="text-blue-400">main</span>() {'{'} <br/>
                    &nbsp;&nbsp;<span className="text-green-400">fmt</span>.<span className="text-yellow-300">Println</span>(<span className="text-orange-400">"Hello World"</span>) <br/>
                    {'}'}
                  </div>
               </div>

               <div className="space-y-1">
                 <Toggle 
                    label="Minimap" 
                    description="Show a miniature map of the code on the right side."
                    checked={editorSettings.minimap} 
                    onChange={(v: boolean) => setEditorSettings({...editorSettings, minimap: v})} 
                 />
                 <Toggle 
                    label="Vim Keybindings" 
                    description="Enable Vim emulation for the code editor (Advanced)."
                    checked={editorSettings.vimMode} 
                    onChange={(v: boolean) => setEditorSettings({...editorSettings, vimMode: v})} 
                 />
                 <Toggle 
                    label="Line Numbers" 
                    description="Show line numbers in the gutter."
                    checked={editorSettings.lineNumbers} 
                    onChange={(v: boolean) => setEditorSettings({...editorSettings, lineNumbers: v})} 
                 />
               </div>
             </div>
           )}

           {/* --- NOTIFICATIONS TAB --- */}
           {activeTab === 'notifications' && (
              <div className="space-y-8 animate-fade-in">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-dark-border pb-4">Email Preferences</h2>
                <div className="space-y-1">
                    <Toggle 
                        label="Weekly Digest" 
                        description="A summary of your progress and new challenges every Monday."
                        checked={notifications.emailDigest} 
                        onChange={(v: boolean) => setNotifications({...notifications, emailDigest: v})} 
                    />
                    <Toggle 
                        label="New Courses & Features" 
                        description="Be the first to know when we launch a new track."
                        checked={notifications.newCourses} 
                        onChange={(v: boolean) => setNotifications({...notifications, newCourses: v})} 
                    />
                    <Toggle 
                        label="Marketing & Offers" 
                        description="Promotions and discounts for Premium plans."
                        checked={notifications.marketing} 
                        onChange={(v: boolean) => setNotifications({...notifications, marketing: v})} 
                    />
                     <Toggle 
                        label="Security Alerts" 
                        description="Important alerts regarding your account security."
                        checked={notifications.securityAlerts} 
                        onChange={(v: boolean) => setNotifications({...notifications, securityAlerts: v})} 
                    />
                </div>
              </div>
           )}

           {/* --- SECURITY TAB --- */}
           {activeTab === 'security' && (
             <div className="space-y-8 animate-fade-in">
               <h2 className="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-dark-border pb-4">Security</h2>
               
               <div className="space-y-4">
                 <div>
                   <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Current Password</label>
                   <input type="password" className="w-full bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl px-4 py-3 text-sm outline-none dark:text-white focus:ring-2 focus:ring-brand-500" placeholder="••••••••" />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">New Password</label>
                        <input type="password" className="w-full bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl px-4 py-3 text-sm outline-none dark:text-white focus:ring-2 focus:ring-brand-500" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Confirm Password</label>
                        <input type="password" className="w-full bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl px-4 py-3 text-sm outline-none dark:text-white focus:ring-2 focus:ring-brand-500" />
                    </div>
                 </div>
                 <button className="px-4 py-2 bg-gray-100 dark:bg-dark-bg text-gray-600 dark:text-gray-300 text-xs font-bold rounded-lg border border-gray-200 dark:border-dark-border hover:bg-gray-200 dark:hover:bg-dark-border transition-colors">
                     Update Password
                 </button>
               </div>

               <div className="pt-6 border-t border-gray-100 dark:border-dark-border">
                   <div className="flex items-center justify-between">
                       <div>
                           <div className="text-sm font-bold text-gray-900 dark:text-white">Two-Factor Authentication (2FA)</div>
                           <div className="text-xs text-gray-500 mt-1">Add an extra layer of security to your account.</div>
                       </div>
                       <button 
                         className="px-4 py-2 rounded-lg text-xs font-bold transition-colors bg-green-600 text-white hover:bg-green-700"
                       >
                           Enable 2FA
                       </button>
                   </div>
               </div>
             </div>
           )}
           
           {/* Footer Actions */}
           <div className="pt-8 mt-8 border-t border-gray-100 dark:border-dark-border flex justify-end gap-3">
             <button 
                onClick={() => window.location.reload()}
                className="px-6 py-2.5 bg-white dark:bg-dark-bg border border-gray-200 dark:border-dark-border text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-dark-border transition-colors"
             >
                Cancel
             </button>
             <button 
                onClick={handleSave}
                disabled={isLoading}
                className="px-8 py-2.5 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 shadow-lg shadow-brand-500/20 transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
             >
                {isLoading ? <span className="animate-spin">⟳</span> : <IconCheck className="w-4 h-4" />}
                Save Changes
             </button>
           </div>

        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
