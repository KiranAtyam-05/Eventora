import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Home, CalendarDays, Gift, Sparkles, Settings, LogOut, Bell, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';


const navItems = [
   { id: 'home', label: 'Home', icon: Home },
  { id: 'dashboard', label: 'Dashboard', icon: CalendarDays },
  { id: 'events', label: 'Events', icon: Gift },
  { id: 'wishes', label: 'Wishes', icon: Sparkles },
  { id: 'gallery', label: 'Memories', icon: Gift },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function Layout({ children, currentPage, onNavigate }) {
  const { user, profile, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-hero flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: sidebarOpen ? 0 : '-100%' }}
        className={`fixed lg:static inset-y-0 left-0 z-50 w-[80%] sm:w-64 lg:w-64 glass-card border-r border-white/10
                    flex flex-col lg:translate-x-0 transition-transform duration-300`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <button onClick={() => onNavigate('dashboard')} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500
                            flex items-center justify-center shadow-lg shadow-primary-500/25">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">Eventora</span>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
  {navItems.map((item) => {
    const Icon = item.icon;
    const isActive = currentPage === item.id;

    return (
      <motion.button
        key={item.id}
        onClick={() => {
          onNavigate(item.id);
          setSidebarOpen(false);
        }}
        className={`w-full sidebar-link ${isActive ? 'active' : ''}`}
      >
        <Icon className="w-5 h-5" />
        <span>{item.label}</span>
      </motion.button>
    );
  })}
</nav>

        {/* User section */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500
                            flex items-center justify-center text-white font-bold">
              {profile?.full_name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {profile?.full_name || 'User'}
              </p>
              <p className="text-xs text-gray-400 truncate">Free Plan</p>
            </div>
          </div>
          <button
            onClick={signOut}
            className="w-full mt-3 flex items-center gap-3 px-4 py-2 rounded-xl text-gray-400
                       hover:text-red-400 hover:bg-red-500/10 transition-all duration-300"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm">Sign Out</span>
          </button>
        </div>
      </motion.aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-30 glass border-b border-white/10 px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl hover:bg-white/10 transition-colors"
              >
                <Menu className="w-6 h-6 text-white" />
              </button>
              <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold text-white capitalize">
                {
  currentPage === 'home'
    ? 'Home'
    : currentPage === 'dashboard'
    ? 'Dashboard'
    : currentPage === 'events'
    ? 'Events'
    : currentPage === 'wishes'
    ? 'Wishes'
    : currentPage === 'gallery'
    ? 'Memory Gallery'
    : 'Settings'
}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl hover:bg-white/10 transition-colors"
              >
                {theme === 'dark' ? (
                  <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                )}
              </button>

              {/* Notifications */}
              {/* Notifications */}
<div className="relative">
  <button
    onClick={() => setShowNotifications(!showNotifications)}
    className="relative p-2 rounded-xl hover:bg-white/10 transition-colors"
  >
    <Bell className="w-5 h-5 text-gray-400" />
    <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500"></span>
  </button>

  {showNotifications && (
    <div className="absolute right-0 mt-2 w-80 bg-gray-900 border border-gray-700 rounded-xl shadow-xl p-4 z-50">
      <h3 className="text-white font-semibold mb-3">
        Notifications
      </h3>

      <div className="space-y-2">
        <div className="p-3 rounded-lg bg-gray-800">
          <p className="text-white text-sm">
            🎉 Welcome to Eventora
          </p>
          <p className="text-gray-400 text-xs mt-1">
            Thank you for joining Eventora.
          </p>
        </div>

        <div className="p-3 rounded-lg bg-gray-800">
          <p className="text-white text-sm">
            📅 Upcoming Event Reminder
          </p>
          <p className="text-gray-400 text-xs mt-1">
            Check your scheduled events.
          </p>
        </div>
      </div>
    </div>
  )}
</div>

{/* Profile */}
<div className="relative">
  <button
    onClick={() => setShowProfileMenu(!showProfileMenu)}
    className="hidden sm:flex items-center gap-2 p-2 rounded-xl hover:bg-white/10 transition-colors"
  >
    <div
      className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500
                 flex items-center justify-center text-white text-sm font-bold"
    >
      {profile?.full_name?.charAt(0) || 'U'}
    </div>
  </button>

  {showProfileMenu && (
    <div className="absolute right-0 mt-2 w-[80%] sm:w-64 lg:w-64 bg-gray-900 border border-gray-700 rounded-xl shadow-xl py-2 z-50">
      <div className="px-4 py-3 border-b border-gray-700">
        <p className="text-white font-semibold">
          {profile?.full_name || 'User'}
        </p>
      </div>

      <button
        onClick={() => {
          onNavigate('settings');
          setShowProfileMenu(false);
        }}
        className="w-full text-left px-4 py-3 text-sm text-gray-300 hover:bg-gray-800"
      >
        ⚙ Settings
      </button>

      <button
        onClick={() => {
          signOut();
          setShowProfileMenu(false);
        }}
        className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-500/10"
      >
        🚪 Logout
      </button>
    </div>
  )}
</div>
            </div>
          </div>
        </header>

        {/* Page content */}
      <main className="flex-1 p-3 sm:p-4 md:p-6 overflow-auto scrollbar-thin">
  <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    {children}
  </div>
</main>
      </div>
    </div>
  );
}
