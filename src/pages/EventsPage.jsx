import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Calendar, Clock, Gift, Heart, Star, Users, MapPin,
  Edit2, Trash2, X, Check, ChevronLeft, PartyPopper, GraduationCap,
  Briefcase, Home, Baby, HeartHandshake, Sparkles, Sun, Moon
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { format, differenceInDays, addDays } from 'date-fns';

const eventTypes = [
  { id: 'birthday', label: 'Birthday', icon: Gift, color: 'from-secondary-500 to-pink-500' },
  { id: 'anniversary', label: 'Wedding Anniversary', icon: Heart, color: 'from-pink-500 to-red-500' },
  { id: 'engagement', label: 'Engagement', icon: HeartHandshake, color: 'from-red-500 to-pink-500' },
  { id: 'friendship', label: 'Friendship Day', icon: Users, color: 'from-primary-500 to-secondary-500' },
  { id: 'mothers_day', label: "Mother's Day", icon: Sparkles, color: 'from-pink-400 to-secondary-400' },
  { id: 'fathers_day', label: "Father's Day", icon: Sun, color: 'from-blue-400 to-primary-400' },
  { id: 'valentines', label: "Valentine's Day", icon: Heart, color: 'from-red-400 to-pink-400' },
  { id: 'graduation', label: 'Graduation', icon: GraduationCap, color: 'from-primary-500 to-accent-500' },
  { id: 'promotion', label: 'Promotion', icon: Briefcase, color: 'from-accent-500 to-primary-500' },
  { id: 'baby_shower', label: 'Baby Shower', icon: Baby, color: 'from-secondary-300 to-primary-300' },
  { id: 'retirement', label: 'Retirement', icon: Moon, color: 'from-primary-400 to-accent-400' },
  { id: 'house_warming', label: 'House Warming', icon: Home, color: 'from-green-500 to-accent-500' },
  { id: 'festival', label: 'Festival', icon: Sparkles, color: 'from-yellow-500 to-orange-500' },
  { id: 'thank_you', label: 'Thank You', icon: Heart, color: 'from-secondary-400 to-accent-400' },
  { id: 'custom', label: 'Custom Event', icon: Star, color: 'from-primary-500 to-secondary-500' },
];

const recurringOptions = [
  { id: 'daily', label: 'Daily' },
  { id: 'weekly', label: 'Weekly' },
  { id: 'monthly', label: 'Monthly' },
  { id: 'yearly', label: 'Yearly' },
];

export function EventsPage({ onNavigate }) {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [filter, setFilter] = useState('all');
  const [view, setView] = useState('grid');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    event_type: 'birthday',
    event_date: '',
    delivery_date: '',
    delivery_time: '',
    timezone: 'UTC',
    is_recurring: false,
    recurring_pattern: 'yearly',
    receiver_name: '',
    receiver_phone: '',
    receiver_email: '',
    sender_name: '',
    sender_phone: '',
    notes: '',
  });

  useEffect(() => {
    if (user) {
      loadEvents();
    }
  }, [user]);

  async function loadEvents() {
    const { data } = await supabase.from('events').select('*').order('event_date', { ascending: true });
    setEvents(data || []);
    setLoading(false);
  }

  function resetForm() {
    setFormData({
      name: '',
      event_type: 'birthday',
      event_date: '',
      delivery_date: '',
      delivery_time: '',
      timezone: 'UTC',
      is_recurring: false,
      recurring_pattern: 'yearly',
      receiver_name: '',
      receiver_phone: '',
      receiver_email: '',
      sender_name: '',
      sender_phone: '',
      notes: '',
    });
    setEditingEvent(null);
  }

  function openCreateModal() {
    resetForm();
    setShowModal(true);
  }

  function openEditModal(event) {
    setEditingEvent(event);
    setFormData({
      name: event.name,
      event_type: event.event_type,
      event_date: event.event_date,
      delivery_date: event.delivery_date || '',
      delivery_time: event.delivery_time || '',
      timezone: event.timezone,
      is_recurring: event.is_recurring,
      recurring_pattern: event.recurring_pattern || 'yearly',
      receiver_name: event.receiver_name || '',
      receiver_phone: event.receiver_phone || '',
      receiver_email: event.receiver_email || '',
      sender_name: event.sender_name || '',
      sender_phone: event.sender_phone || '',
      notes: event.notes || '',
    });
    setShowModal(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const eventData = {
      ...formData,
      user_id: user.id,
      event_type: formData.event_type,
    };

    if (editingEvent) {
      await supabase.from('events').update(eventData).eq('id', editingEvent.id);
    } else {
      await supabase.from('events').insert(eventData);
    }

    setShowModal(false);
    resetForm();
    loadEvents();
  }

  async function deleteEvent(id) {
    await supabase.from('events').delete().eq('id', id);
    loadEvents();
  }

  const filteredEvents = events.filter(event => {
    const eventDate = new Date(event.event_date);
    const now = new Date();
    if (filter === 'upcoming') return eventDate >= now;
    if (filter === 'past') return eventDate < now;
    return true;
  });

  const eventTypeIcon = (type) => {
    const found = eventTypes.find(t => t.id === type);
    return found?.icon || Calendar;
  };

  const eventTypeColor = (type) => {
    const found = eventTypes.find(t => t.id === type);
    return found?.color || 'from-primary-500 to-secondary-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Events</h1>
          <p className="text-gray-400">Manage your important dates and occasions</p>
        </div>
        <motion.button
          onClick={openCreateModal}
          className="btn-primary flex items-center gap-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Plus className="w-5 h-5" />
          <span>Create Event</span>
        </motion.button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 p-1 rounded-xl bg-white/5">
          {['all', 'upcoming', 'past'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === f
                  ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Events Grid */}
      {filteredEvents.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16"
        >
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary-500/20 to-secondary-500/20
                          flex items-center justify-center">
            <Calendar className="w-12 h-12 text-primary-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No events yet</h3>
          <p className="text-gray-400 mb-6">Create your first event to get started</p>
          <button onClick={openCreateModal} className="w-full sm:w-auto btn-primary">
            <Plus className="w-5 h-5 mr-2" />
            Create Event
          </button>
        </motion.div>
      ) : (
       <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          {filteredEvents.map((event, i) => {
            const Icon = eventTypeIcon(event.event_type);
            const daysUntil = differenceInDays(new Date(event.event_date), new Date());
            const isPast = daysUntil < 0;

            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`card-hover p-5 ${isPast ? 'opacity-60' : ''}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${eventTypeColor(event.event_type)}
                                  flex items-center justify-center shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(event)}
                      className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteEvent(event.id)}
                      className="p-2 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-white mb-1 truncate">{event.name}</h3>
                <p className="text-sm text-gray-400 mb-3">
                  {eventTypes.find(t => t.id === event.event_type)?.label || event.event_type}
                </p>

                {event.receiver_name && (
                  <p className="text-sm text-gray-400 flex items-center gap-1 mb-3">
                    <Users className="w-4 h-4" />
                    {event.receiver_name}
                  </p>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-white/10">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Calendar className="w-4 h-4" />
                    {format(new Date(event.event_date), 'MMM d, yyyy')}
                  </div>
                  <span className={`badge ${isPast ? 'badge-warning' : daysUntil === 0 ? 'badge-success' : 'badge-primary'}`}>
                    {isPast ? 'Past' : daysUntil === 0 ? 'Today' : `${daysUntil}d`}
                  </span>
                </div>

                {event.is_recurring && (
                  <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    Repeats {event.recurring_pattern}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-[95vw] sm:w-[90vw] md:w-[80vw] lg:max-w-2xl max-h-[90vh] overflow-auto glass-card p-6 scrollbar-thin"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">
                  {editingEvent ? 'Edit Event' : 'Create New Event'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Event Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Event Type
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {eventTypes.slice(0, 10).map((type) => {
                      const Icon = type.icon;
                      const isSelected = formData.event_type === type.id;
                      return (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, event_type: type.id })}
                          className={`p-3 rounded-xl border transition-all ${
                            isSelected
                              ? `bg-gradient-to-br ${type.color} border-transparent`
                              : 'bg-white/5 border-white/10 hover:border-white/20'
                          }`}
                        >
                          <Icon className={`w-5 h-5 mx-auto mb-1 ${isSelected ? 'text-white' : 'text-gray-400'}`} />
                          <span className={`text-xs ${isSelected ? 'text-white' : 'text-gray-400'}`}>
                            {type.label.split(' ')[0]}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Event Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Event Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-field"
                    placeholder="e.g., Mom's Birthday"
                    required
                  />
                </div>

                {/* Date Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4s">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Event Date
                    </label>
                    <input
                      type="date"
                      value={formData.event_date}
                      onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Delivery Date (Optional)
                    </label>
                    <input
                      type="date"
                      value={formData.delivery_date}
                      onChange={(e) => setFormData({ ...formData, delivery_date: e.target.value })}
                      className="input-field"
                    />
                  </div>
                </div>

                {/* Delivery Time & Timezone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Delivery Time
                    </label>
                    <input
                      type="time"
                      value={formData.delivery_time}
                      onChange={(e) => setFormData({ ...formData, delivery_time: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Timezone
                    </label>
                    <select
                      value={formData.timezone}
                      onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                      className="input-field"
                    >
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">Eastern Time</option>
                      <option value="America/Chicago">Central Time</option>
                      <option value="America/Denver">Mountain Time</option>
                      <option value="America/Los_Angeles">Pacific Time</option>
                      <option value="Asia/Kolkata">India (IST)</option>
                      <option value="Europe/London">London (GMT)</option>
                    </select>
                  </div>
                </div>

                {/* Recurring */}
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_recurring}
                      onChange={(e) => setFormData({ ...formData, is_recurring: e.target.checked })}
                      className="w-5 h-5 rounded border-gray-600 bg-transparent text-primary-500
                                 focus:ring-primary-500 focus:ring-offset-0"
                    />
                    <span className="text-white font-medium">Recurring Event</span>
                  </label>
                  {formData.is_recurring && (
                    <div className="mt-4 flex gap-2">
                      {recurringOptions.map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, recurring_pattern: opt.id })}
                          className={`px-4 py-2 rounded-lg text-sm transition-all ${
                            formData.recurring_pattern === opt.id
                              ? 'bg-primary-500 text-white'
                              : 'bg-white/10 text-gray-400 hover:text-white'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Receiver Information */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-300 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Receiver Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={formData.receiver_name}
                      onChange={(e) => setFormData({ ...formData, receiver_name: e.target.value })}
                      className="input-field"
                      placeholder="Receiver Name"
                    />
                    <input
                      type="tel"
                      value={formData.receiver_phone}
                      onChange={(e) => setFormData({ ...formData, receiver_phone: e.target.value })}
                      className="input-field"
                      placeholder="Receiver Phone"
                    />
                  </div>
                  <input
                    type="email"
                    value={formData.receiver_email}
                    onChange={(e) => setFormData({ ...formData, receiver_email: e.target.value })}
                    className="input-field"
                    placeholder="Receiver Email"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="input-field min-h-[80px] resize-none"
                    placeholder="Add any notes or gift ideas..."
                  />
                </div>

                {/* Submit */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 btn-primary">
                    {editingEvent ? 'Save Changes' : 'Create Event'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
