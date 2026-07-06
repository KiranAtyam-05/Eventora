import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Bell, Palette, CreditCard, Shield, HelpCircle, LogOut,
  ChevronRight, Moon, Sun, Check, Mail, Phone, Camera, Save
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const sections = [
  { id: 'profile', label: 'Profile', icon: User, description: 'Personal information' },
  { id: 'notifications', label: 'Notifications', icon: Bell, description: 'Alert preferences' },
  { id: 'appearance', label: 'Appearance', icon: Palette, description: 'Theme and display' },
  { id: 'subscription', label: 'Subscription', icon: CreditCard, description: 'Plan and billing' },
  { id: 'privacy', label: 'Privacy & Security', icon: Shield, description: 'Account security' },
  { id: 'help', label: 'Help & Support', icon: HelpCircle, description: 'Get assistance' },
];

const notificationSettings = [
  { id: 'email', label: 'Email Notifications', description: 'Receive updates via email' },
  { id: 'push', label: 'Push Notifications', description: 'Browser push notifications' },
  { id: 'sms', label: 'SMS Alerts', description: 'Text message reminders' },
];

const reminderOptions = [
  { id: '30_days', label: '30 Days Before', description: 'Early planning reminder' },
  { id: '7_days', label: '7 Days Before', description: 'Week ahead reminder' },
  { id: '1_day', label: '1 Day Before', description: 'Final reminder' },
  { id: '1_hour', label: '1 Hour Before', description: 'Last minute alert' },
];

const themes = [
  { id: 'dark', label: 'Dark', icon: Moon, color: 'from-gray-800 to-gray-900' },
  { id: 'light', label: 'Light', icon: Sun, color: 'from-gray-100 to-white' },
];

export function SettingsPage({ onNavigate }) {
  const { profile, signOut, updateProfile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [activeSection, setActiveSection] = useState('profile');
  const [saving, setSaving] = useState(false);

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    avatar_url: profile?.avatar_url || '',
  });

  // Notification preferences
  const [notifications, setNotifications] = useState({
    email: profile?.notification_settings?.email ?? true,
    push: profile?.notification_settings?.push ?? true,
    sms: profile?.notification_settings?.sms ?? false,
  });

  // Reminder preferences
  const [reminders, setReminders] = useState({
    '30_days': true,
    '7_days': true,
    '1_day': true,
    '1_hour': false,
  });

  const handleSaveProfile = async () => {
    setSaving(true);
    await updateProfile({
      full_name: profileForm.full_name,
      phone: profileForm.phone,
    });
    setSaving(false);
  };

  const handleNotificationChange = async (key, value) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
    await updateProfile({
      notification_settings: { ...notifications, [key]: value },
    });
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-primary-500 to-secondary-500
                                flex items-center justify-center text-4xl font-bold text-white">
                  {profile?.full_name?.charAt(0) || 'U'}
                </div>
                <button className="absolute bottom-0 right-0 p-2 rounded-full bg-primary-500 text-white
                                   hover:bg-primary-600 transition-colors shadow-lg">
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">{profile?.full_name}</h3>
                <p className="text-gray-400">{profile?.email || 'user@example.com'}</p>
                <span className="mt-2 inline-flex badge badge-primary">Free Plan</span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={profileForm.full_name}
                  onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={'user@example.com'}
                    disabled
                    className="input-field pl-12 opacity-50 cursor-not-allowed"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="input-field pl-12"
                    placeholder="Add phone number"
                  />
                </div>
              </div>

              <motion.button
                onClick={handleSaveProfile}
                disabled={saving}
                className="btn-primary flex items-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {saving ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save Changes
              </motion.button>
            </div>
          </motion.div>
        );

      case 'notifications':
        return (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Notification Channels</h3>
              <div className="space-y-2">
                {notificationSettings.map((setting) => (
                  <div
                    key={setting.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <div>
                      <p className="text-white font-medium">{setting.label}</p>
                      <p className="text-sm text-gray-400">{setting.description}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications[setting.id]}
                        onChange={(e) => handleNotificationChange(setting.id, e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full
                                      after:content-[''] after:absolute after:top-0.5 after:left-[2px]
                                      after:bg-white after:rounded-full after:h-5 after:w-5
                                      after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-primary-500
                                      peer-checked:to-secondary-500"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Reminder Schedule</h3>
              <div className="space-y-2">
                {reminderOptions.map((option) => (
                  <div
                    key={option.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <div>
                      <p className="text-white font-medium">{option.label}</p>
                      <p className="text-sm text-gray-400">{option.description}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={reminders[option.id]}
                        onChange={(e) => setReminders(prev => ({ ...prev, [option.id]: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full
                                      after:content-[''] after:absolute after:top-0.5 after:left-[2px]
                                      after:bg-white after:rounded-full after:h-5 after:w-5
                                      after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-primary-500
                                      peer-checked:to-secondary-500"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        );

      case 'appearance':
        return (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Theme</h3>
              <div className="grid grid-cols-2 gap-4">
                {themes.map((t) => {
                  const isActive = theme === t.id;
                  return (
                    <motion.button
                      key={t.id}
                      onClick={toggleTheme}
                      className={`p-6 rounded-xl border-2 transition-all ${
                        isActive
                          ? 'border-primary-500 bg-primary-500/10'
                          : 'border-white/10 bg-white/5 hover:border-white/20'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${t.color}
                                      flex items-center justify-center mx-auto mb-3 border-2
                                      ${isActive ? 'border-primary-500' : 'border-white/20'}`}>
                        <t.icon className={`w-8 h-8 ${isActive ? 'text-primary-400' : 'text-gray-400'}`} />
                      </div>
                      <p className={`font-medium ${isActive ? 'text-white' : 'text-gray-400'}`}>
                        {t.label}
                      </p>
                      {isActive && (
                        <div className="flex justify-center mt-2">
                          <Check className="w-5 h-5 text-primary-400" />
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Accent Color</h3>
              <div className="flex gap-3">
                {['primary', 'secondary', 'accent'].map((color) => (
                  <button
                    key={color}
                    className={`w-10 h-10 rounded-full bg-gradient-to-br
                              ${color === 'primary' ? 'from-primary-500 to-secondary-500' : ''}
                              ${color === 'secondary' ? 'from-secondary-500 to-pink-500' : ''}
                              ${color === 'accent' ? 'from-accent-500 to-primary-500' : ''}
                              ring-2 ring-offset-2 ring-offset-[#1a1a2e] ring-transparent
                              hover:ring-white/50 transition-all`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        );

      case 'subscription':
        return (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="p-6 rounded-2xl bg-gradient-to-br from-primary-500/20 via-secondary-500/10 to-accent-500/20
                           border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="badge badge-primary mb-2">Current Plan</span>
                  <h3 className="text-2xl font-bold text-white">Free Plan</h3>
                </div>
                <motion.button
                  className="w-full sm:w-auto btn-primary"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Upgrade to Pro
                </motion.button>
              </div>
              <div className="space-y-2 text-sm text-gray-400">
                <p><Check className="w-4 h-4 inline mr-2 text-green-400" /> Up to 10 events</p>
                <p><Check className="w-4 h-4 inline mr-2 text-green-400" /> Basic AI wishes</p>
                <p><Check className="w-4 h-4 inline mr-2 text-green-400" /> Email notifications</p>
                <p className="text-gray-500"><span className="mr-2">✕</span> Voice messages</p>
                <p className="text-gray-500"><span className="mr-2">✕</span> Priority delivery</p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-3">Pro Features</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Check className="w-4 h-4 inline mr-2 text-primary-400" /> Unlimited events</li>
                <li><Check className="w-4 h-4 inline mr-2 text-primary-400" /> Advanced AI wishes</li>
                <li><Check className="w-4 h-4 inline mr-2 text-primary-400" /> Voice cloning</li>
                <li><Check className="w-4 h-4 inline mr-2 text-primary-400" /> Priority support</li>
                <li><Check className="w-4 h-4 inline mr-2 text-primary-400" /> Custom themes</li>
              </ul>
            </div>
          </motion.div>
        );

      case 'privacy':
        return (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">Account Security</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Two-Factor Authentication</p>
                    <p className="text-sm text-gray-400">Add extra security to your account</p>
                  </div>
                  <button className="btn-secondary text-sm">Enable</button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Change Password</p>
                    <p className="text-sm text-gray-400">Update your password</p>
                  </div>
                  <button className="btn-secondary text-sm">Change</button>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">Data Management</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Export Data</p>
                    <p className="text-sm text-gray-400">Download all your data</p>
                  </div>
                  <button className="btn-secondary text-sm">Export</button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-400 font-medium">Delete Account</p>
                    <p className="text-sm text-gray-400">Permanently delete your account</p>
                  </div>
                  <button className="px-4 py-2 rounded-lg bg-red-500/10 text-red-400 text-sm
                                     hover:bg-red-500/20 transition-colors">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 'help':
        return (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">Frequently Asked Questions</h3>
              <div className="space-y-3">
                {['How do I create an event?', 'How does AI wish generation work?',
                  'Can I schedule recurring events?', 'How do I import contacts?'].map((q, i) => (
                  <button
                    key={i}
                    className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-white/5
                               text-left text-gray-300 hover:text-white transition-colors"
                  >
                    {q}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-br from-primary-500/20 to-secondary-500/20 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-2">Need more help?</h3>
              <p className="text-gray-400 mb-4">Our support team is here to assist you.</p>
              <button className="w-full sm:w-auto btn-primary">Contact Support</button>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="grid lg:grid-cols-4 gap-6">
      {/* Sidebar */}
      <div className="lg:col-span-1">
        <div className="card p-2 sticky top-24">
          {sections.map((section) => {
            const isActive = activeSection === section.id;
            return (
              <motion.button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-primary-500/20 to-secondary-500/20 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
                whileHover={{ x: 4 }}
              >
                <section.icon className="w-5 h-5" />
                <div className="flex-1 text-left">
                  <p className="font-medium">{section.label}</p>
                  <p className="text-xs text-gray-500 hidden sm:block">{section.description}</p>
                </div>
                {isActive && (
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                )}
              </motion.button>
            );
          })}
          <div className="border-t border-white/10 my-2" />
          <motion.button
            onClick={signOut}
            className="w-full flex items-center gap-3 p-3 rounded-xl text-red-400
                       hover:bg-red-500/10 transition-colors"
            whileHover={{ x: 4 }}
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sign Out</span>
          </motion.button>
        </div>
      </div>

      {/* Content */}
      <div className="lg:col-span-3">
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6"
        >
          <h2 className="text-2xl font-bold text-white mb-6">
            {sections.find(s => s.id === activeSection)?.label}
          </h2>
          {renderContent()}
        </motion.div>
      </div>
    </div>
  );
}
