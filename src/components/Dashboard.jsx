import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  CalendarDays, Gift, Sparkles, Clock, Users,
  ChevronRight, Plus, Heart, Star, TrendingUp, CheckCircle2
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { differenceInDays, format, isToday, addDays } from 'date-fns';

export function Dashboard({ onNavigate }) {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  async function loadData() {
    const [eventsRes, contactsRes] = await Promise.all([
      supabase.from('events').select('*').order('event_date', { ascending: true }),
      supabase.from('contacts').select('*'),
    ]);
    setEvents(eventsRes.data || []);
    setContacts(contactsRes.data || []);
    setLoading(false);
  }

  const { upcomingEvents, todayEvents, upcomingBirthdays, upcomingAnniversaries } = useMemo(() => {
    const now = new Date();
    const thirtyDaysLater = addDays(now, 30);

    const upcoming = events
      .filter(e => new Date(e.event_date) >= now && new Date(e.event_date) <= thirtyDaysLater)
      .slice(0, 5);

    const today = events.filter(e => isToday(new Date(e.event_date)));

    const birthdays = contacts
      .filter(c => c.birthday)
      .map(c => ({
        ...c,
        nextBirthday: getNextOccurrence(c.birthday),
      }))
      .filter(c => differenceInDays(c.nextBirthday, now) <= 30 && differenceInDays(c.nextBirthday, now) >= 0)
      .sort((a, b) => differenceInDays(a.nextBirthday, now) - differenceInDays(b.nextBirthday, now))
      .slice(0, 5);

    const anniversaries = contacts
      .filter(c => c.anniversary)
      .map(c => ({
        ...c,
        nextAnniversary: getNextOccurrence(c.anniversary),
      }))
      .filter(c => differenceInDays(c.nextAnniversary, now) <= 30 && differenceInDays(c.nextAnniversary, now) >= 0)
      .sort((a, b) => differenceInDays(a.nextAnniversary, now) - differenceInDays(b.nextAnniversary, now))
      .slice(0, 5);

    return { upcomingEvents: upcoming, todayEvents: today, upcomingBirthdays: birthdays, upcomingAnniversaries: anniversaries };
  }, [events, contacts]);

  function getNextOccurrence(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const thisYear = new Date(now.getFullYear(), date.getMonth(), date.getDate());
    if (thisYear >= now) return thisYear;
    return new Date(now.getFullYear() + 1, date.getMonth(), date.getDate());
  }

  const quickActions = [
    { icon: Plus, label: 'Create Event', color: 'from-primary-500 to-secondary-500', page: 'events' },
    { icon: Sparkles, label: 'Generate AI Wish', color: 'from-secondary-500 to-accent-500', page: 'wishes' },
    { icon: Users, label: 'Import Contacts', color: 'from-accent-500 to-primary-500', page: 'settings' },
    { icon: Sparkles, label: 'Memory Gallery', color: 'from-primary-400 to-secondary-400', page: 'gallery' },
  ];

  const stats = [
    { label: 'Total Events', value: events.length, icon: CalendarDays, color: 'text-primary-400' },
    { label: 'Upcoming', value: upcomingEvents.length, icon: Clock, color: 'text-secondary-400' },
    { label: 'Contacts', value: contacts.length, icon: Users, color: 'text-accent-400' },
    { label: 'Today', value: todayEvents.length, icon: Star, color: 'text-yellow-400' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-500/20 via-secondary-500/10 to-accent-500/20 p-8"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary-500/10 via-transparent to-transparent" />
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome to Eventora
          </h1>
          <p className="text-gray-400 max-w-lg">
            Never miss a moment that matters. Manage your events, create heartfelt wishes, and keep memories alive.
          </p>
        </div>
        <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-gradient-to-br from-primary-500/30 to-secondary-500/30 blur-3xl" />
        <div className="absolute -right-5 -bottom-5 w-32 h-32 rounded-full bg-gradient-to-br from-secondary-500/30 to-accent-500/30 blur-2xl" />
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="card p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
              <TrendingUp className="w-4 h-4 text-green-400" />
            </div>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            <p className="text-sm text-gray-400">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, i) => (
            <motion.button
              key={action.label}
              onClick={() => onNavigate(action.page)}
              className="card-hover p-5 text-left group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-3
                               shadow-lg group-hover:shadow-xl transition-shadow`}>
                <action.icon className="w-6 h-6 text-white" />
              </div>
              <p className="font-medium text-white group-hover:text-primary-300 transition-colors">
                {action.label}
              </p>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Main content grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Upcoming Events */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2"
        >
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-primary-400" />
                Upcoming Events
              </h2>
              <button
                onClick={() => onNavigate('events')}
                className="text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1"
              >
                View All <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {upcomingEvents.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                  <CalendarDays className="w-8 h-8 text-gray-500" />
                </div>
                <p className="text-gray-400">No upcoming events</p>
                <button
                  onClick={() => onNavigate('events')}
                  className="mt-4 text-sm text-primary-400 hover:text-primary-300"
                >
                  Create your first event
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingEvents.map((event, i) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group"
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0
                                     ${getEventColor(event.event_type)}`}>
                      {getEventIcon(event.event_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white truncate">{event.name}</p>
                      <p className="text-sm text-gray-400">
                        {event.receiver_name && `For ${event.receiver_name} • `}
                        {format(new Date(event.event_date), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="badge badge-primary">
                        {differenceInDays(new Date(event.event_date), new Date()) === 0
                          ? 'Today'
                          : `${differenceInDays(new Date(event.event_date), new Date())}d`}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Sidebar widgets */}
        <div className="space-y-6">
          {/* Today's Events */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="card p-6"
          >
            <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
              <Star className="w-5 h-5 text-yellow-400" />
              Today's Events
            </h3>
            {todayEvents.length === 0 ? (
              <div className="text-center py-6">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-500/50" />
                <p className="text-sm text-gray-400">No events today</p>
              </div>
            ) : (
              <div className="space-y-2">
                {todayEvents.map(event => (
                  <div key={event.id} className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                    <p className="font-medium text-white">{event.name}</p>
                    {event.receiver_name && (
                      <p className="text-sm text-gray-400">For {event.receiver_name}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Upcoming Birthdays */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="card p-6"
          >
            <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
              <Gift className="w-5 h-5 text-secondary-400" />
              Upcoming Birthdays
            </h3>
            {upcomingBirthdays.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">No upcoming birthdays</p>
            ) : (
              <div className="space-y-2">
                {upcomingBirthdays.map((contact) => (
                  <div key={contact.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-secondary-500 to-accent-500
                                    flex items-center justify-center text-white text-sm font-bold">
                      {contact.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{contact.name}</p>
                      <p className="text-xs text-gray-400">
                        {format(contact.nextBirthday, 'MMM d')}
                        {differenceInDays(contact.nextBirthday, new Date()) === 0 && ' • Today!'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Upcoming Anniversaries */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="card p-6"
          >
            <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
              <Heart className="w-5 h-5 text-pink-400" />
              Anniversaries
            </h3>
            {upcomingAnniversaries.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">No upcoming anniversaries</p>
            ) : (
              <div className="space-y-2">
                {upcomingAnniversaries.map((contact) => (
                  <div key={contact.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-red-500
                                    flex items-center justify-center text-white text-sm">
                      <Heart className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{contact.name}</p>
                      <p className="text-xs text-gray-400">
                        {format(contact.nextAnniversary, 'MMM d')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function getEventIcon(type) {
  const icons = {
    birthday: <Gift className="w-6 h-6 text-white" />,
    anniversary: <Heart className="w-6 h-6 text-white" />,
    graduation: <Star className="w-6 h-6 text-white" />,
    wedding: <Heart className="w-6 h-6 text-white" />,
    default: <CalendarDays className="w-6 h-6 text-white" />,
  };
  return icons[type] || icons.default;
}

function getEventColor(type) {
  const colors = {
    birthday: 'bg-gradient-to-br from-secondary-500 to-pink-500',
    anniversary: 'bg-gradient-to-br from-pink-500 to-red-500',
    graduation: 'bg-gradient-to-br from-primary-500 to-secondary-500',
    wedding: 'bg-gradient-to-br from-red-500 to-pink-500',
  };
  return colors[type] || 'bg-gradient-to-br from-primary-500 to-secondary-500';
}
