import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Mic, MicOff, Play, Pause, Square, Trash2, Send, Save,
  Bold, Italic, Underline, Smile, X, ChevronRight, Wand2, Copy,
  Volume2, Download, Share2, Eye, Check, RefreshCw
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const tones = [
  { id: 'professional', label: 'Professional', emoji: '💼' },
  { id: 'funny', label: 'Funny', emoji: '😄' },
  { id: 'emotional', label: 'Emotional', emoji: '❤️' },
  { id: 'romantic', label: 'Romantic', emoji: '💕' },
  { id: 'inspirational', label: 'Inspirational', emoji: '✨' },
  { id: 'formal', label: 'Formal', emoji: '🎩' },
  { id: 'religious', label: 'Religious', emoji: '🙏' },
];

const languages = [
  { id: 'english', label: 'English' },
  { id: 'hindi', label: 'Hindi' },
  { id: 'telugu', label: 'Telugu' },
  { id: 'tamil', label: 'Tamil' },
];

const animations = [
  { id: 'confetti', label: 'Confetti', preview: '🎉' },
  { id: 'balloons', label: 'Balloons', preview: '🎈' },
  { id: 'fireworks', label: 'Fireworks', preview: '🎆' },
  { id: 'hearts', label: 'Floating Hearts', preview: '💕' },
  { id: 'sparkles', label: 'Sparkles', preview: '✨' },
  { id: 'gifts', label: 'Gift Rain', preview: '🎁' },
];

const themes = [
  { id: 'birthday', label: 'Birthday', color: 'from-secondary-500 to-pink-500' },
  { id: 'anniversary', label: 'Anniversary', color: 'from-red-500 to-pink-500' },
  { id: 'romantic', label: 'Romantic', color: 'from-pink-400 to-red-400' },
  { id: 'festival', label: 'Festival', color: 'from-yellow-500 to-orange-500' },
  { id: 'professional', label: 'Professional', color: 'from-primary-500 to-accent-500' },
];

const emojis = ['😊', '❤️', '🎂', '🎉', '🎁', '🎈', '✨', '🌟', '💫', '🥳', '💐', '🌸', '🦋', '🌈', '💖', '💝', '🎵', '🎶', '🎊', '👏'];

export function WishesPage({ onNavigate }) {
  const { user } = useAuth();
  const [wishes, setWishes] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [activeTab, setActiveTab] = useState('write');

  // Editor state
  const [message, setMessage] = useState('');
  const [selectedEvent, setSelectedEvent] = useState('');
  const [tone, setTone] = useState('professional');
  const [language, setLanguage] = useState('english');
  const [animation, setAnimation] = useState('confetti');
  const [theme, setTheme] = useState('birthday');
  const [isGenerating, setIsGenerating] = useState(false);

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [audioDuration, setAudioDuration] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioRef = useRef(null);

  // Rich text formatting
  const textareaRef = useRef(null);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  async function loadData() {
    const [wishesRes, eventsRes] = await Promise.all([
      supabase.from('wishes').select('*').order('created_at', { ascending: false }),
      supabase.from('events').select('*'),
    ]);
    setWishes(wishesRes.data || []);
    setEvents(eventsRes.data || []);
    setLoading(false);
  }

  async function generateAIWish() {
    if (!selectedEvent) return;

    setIsGenerating(true);
    const event = events.find(e => e.id === selectedEvent);
    const prompt = `Generate a ${tone} birthday wish in ${language} for ${event?.receiver_name || 'someone'}. Make it ${tone} and heartfelt.`;

    // Simulated AI generation (in production, this would call an AI API)
    await new Promise(resolve => setTimeout(resolve, 1500));

    const generatedWishes = {
      professional: {
        english: "Wishing you a wonderful birthday filled with joy and success. May this year bring you new opportunities and achievements. Happy Birthday!",
        hindi: "आपको जन्मदिन की ढेर सारी शुभकामनाएं! आपका यह दिन और आगे का साल बहुत खास हो।",
      },
      funny: {
        english: "Happy Birthday! Don't worry about your age, you're just vintage now! 🎂 Have an amazing day!",
        hindi: "जन्मदिन मुबारक! उम्र की चिंता मत करो, तुम तो अब विंटेज हो! 🎂",
      },
      emotional: {
        english: "On your special day, I want you to know how much you mean to me. Your presence makes the world a better place. Happy Birthday! ❤️",
        hindi: "तुम्हारे खास दिन पर, मैं तुम्हें बताना चाहता हूं कि तुम मेरे लिए कितने खास हो।",
      },
      romantic: {
        english: "Happy Birthday to the one who holds my heart. Your smile lights up my world. I love you more each day! 💕",
        hindi: "जन्मदिन मुबारक उन्हें जो मेरा दिल रखते हैं। तुम्हारी मुस्कान मेरी दुनिया को रोशन करती है।",
      },
      inspirational: {
        english: "Happy Birthday! May this new chapter of your life be filled with courage, dreams coming true, and endless possibilities! ✨",
        hindi: "जन्मदिन मुबारक! जीवन के इस नए अध्याय में हिम्मत और सपनों की सफलता हो!",
      },
    };

    const wish = generatedWishes[tone]?.[language] || generatedWishes.professional.english;
    setMessage(wish);
    setIsGenerating(false);
  }

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setRecordedAudio(audioUrl);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error accessing microphone:', err);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  const playAudio = useCallback(() => {
    if (recordedAudio && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  }, [recordedAudio, isPlaying]);

  const deleteRecording = useCallback(() => {
    setRecordedAudio(null);
    setAudioDuration(0);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  }, []);

  const insertEmoji = (emoji) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newMessage = message.substring(0, start) + emoji + message.substring(end);
      setMessage(newMessage);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + emoji.length;
        textarea.focus();
      }, 0);
    }
    setShowEmojiPicker(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message && !recordedAudio) return;

    const wishData = {
      user_id: user.id,
      event_id: selectedEvent || null,
      message,
      tone,
      language,
      is_ai_generated: activeTab === 'ai',
      animation,
      theme,
    };

    await supabase.from('wishes').insert(wishData);
    setShowEditor(false);
    setMessage('');
    setRecordedAudio(null);
    loadData();
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
          <h1 className="text-2xl font-bold text-white">Wishes Creator</h1>
          <p className="text-gray-400">Create heartfelt messages for your loved ones</p>
        </div>
        <motion.button
          onClick={() => setShowEditor(true)}
          className="btn-primary flex items-center gap-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Sparkles className="w-5 h-5" />
          <span>Create Wish</span>
        </motion.button>
      </div>

      {/* Wishes Grid */}
      {wishes.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16"
        >
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-secondary-500/20 to-accent-500/20
                          flex items-center justify-center">
            <Sparkles className="w-12 h-12 text-secondary-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No wishes yet</h3>
          <p className="text-gray-400 mb-6">Create your first heartfelt message</p>
          <button onClick={() => setShowEditor(true)} className="w-full sm:w-auto btn-primary">
            <Sparkles className="w-5 h-5 mr-2" />
            Create Wish
          </button>
        </motion.div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {wishes.map((wish, i) => (
            <motion.div
              key={wish.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="card-hover p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <span className={`badge ${wish.is_ai_generated ? 'badge-accent' : 'badge-primary'}`}>
                  {wish.is_ai_generated ? 'AI Generated' : 'Custom'}
                </span>
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  {animations.find(a => a.id === wish.animation)?.preview}
                </div>
              </div>
              <p className="text-gray-300 text-sm line-clamp-4 mb-4">{wish.message}</p>
              <div className="flex items-center justify-between pt-3 border-t border-white/10">
                <span className="text-xs text-gray-500">
                  {languages.find(l => l.id === wish.language)?.label || 'English'}
                </span>
                <div className="flex items-center gap-2">
                  <button className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                    <Copy className="w-4 h-4" />
                  </button>
                  <button className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Wish Modal */}
      <AnimatePresence>
        {showEditor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowEditor(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-4xl max-h-[90vh] overflow-auto glass-card p-6 scrollbar-thin"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Create Wish</h2>
                <button
                  onClick={() => setShowEditor(false)}
                  className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 p-1 rounded-xl bg-white/5 mb-6">
                {[
                  { id: 'write', label: 'Write', icon: Sparkles },
                  { id: 'ai', label: 'AI Generate', icon: Wand2 },
                  { id: 'voice', label: 'Voice', icon: Mic },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Event Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Select Event (Optional)
                </label>
                <select
                  value={selectedEvent}
                  onChange={(e) => setSelectedEvent(e.target.value)}
                  className="input-field"
                >
                  <option value="">No event selected</option>
                  {events.map(event => (
                    <option key={event.id} value={event.id}>
                      {event.name} - {event.receiver_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Write Tab */}
              {activeTab === 'write' && (
                <div className="space-y-4">
                  {/* Formatting Toolbar */}
                  <div className="flex items-center gap-1 p-2 rounded-xl bg-white/5">
                    <button
                      onClick={() => setIsBold(!isBold)}
                      className={`p-2 rounded-lg transition-colors ${isBold ? 'bg-primary-500 text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                      <Bold className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setIsItalic(!isItalic)}
                      className={`p-2 rounded-lg transition-colors ${isItalic ? 'bg-primary-500 text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                      <Italic className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setIsUnderline(!isUnderline)}
                      className={`p-2 rounded-lg transition-colors ${isUnderline ? 'bg-primary-500 text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                      <Underline className="w-4 h-4" />
                    </button>
                    <div className="w-px h-5 bg-white/10 mx-2" />
                    <div className="relative">
                      <button
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className="p-2 rounded-lg text-gray-400 hover:text-white transition-colors"
                      >
                        <Smile className="w-4 h-4" />
                      </button>
                      {showEmojiPicker && (
                        <div className="absolute top-full left-0 mt-2 p-3 rounded-xl glass-card grid grid-cols-10 gap-1 z-10 w-72">
                          {emojis.map(emoji => (
                            <button
                              key={emoji}
                              onClick={() => insertEmoji(emoji)}
                              className="p-1.5 rounded hover:bg-white/10 text-lg transition-colors"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <span className="ml-auto text-xs text-gray-500">
                      {message.length} characters
                    </span>
                  </div>

                  {/* Text Area */}
                  <textarea
                    ref={textareaRef}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="input-field min-h-[200px] resize-none"
                    placeholder="Write your heartfelt message here..."
                  />
                </div>
              )}

              {/* AI Tab */}
              {activeTab === 'ai' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Tone
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {tones.map((t) => (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => setTone(t.id)}
                            className={`p-3 rounded-xl text-left transition-all ${
                              tone === t.id
                                ? 'bg-gradient-to-r from-primary-500/20 to-secondary-500/20 border border-primary-500/50'
                                : 'bg-white/5 hover:bg-white/10 border border-transparent'
                            }`}
                          >
                            <span className="text-lg mr-2">{t.emoji}</span>
                            <span className={`text-sm ${tone === t.id ? 'text-white' : 'text-gray-400'}`}>
                              {t.label}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Language
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {languages.map((lang) => (
                          <button
                            key={lang.id}
                            type="button"
                            onClick={() => setLanguage(lang.id)}
                            className={`p-3 rounded-xl text-center transition-all ${
                              language === lang.id
                                ? 'bg-gradient-to-r from-primary-500/20 to-secondary-500/20 border border-primary-500/50'
                                : 'bg-white/5 hover:bg-white/10 border border-transparent'
                            }`}
                          >
                            <span className={`text-sm ${language === lang.id ? 'text-white' : 'text-gray-400'}`}>
                              {lang.label}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <motion.button
                    onClick={generateAIWish}
                    disabled={isGenerating}
                    className="w-full btn-primary flex items-center justify-center gap-2"
                    whileHover={{ scale: isGenerating ? 1 : 1.02 }}
                    whileTap={{ scale: isGenerating ? 1 : 0.98 }}
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-5 h-5" />
                        Generate Wish
                      </>
                    )}
                  </motion.button>

                  {message && (
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                      <p className="text-gray-300">{message}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Voice Tab */}
              {activeTab === 'voice' && (
                <div className="text-center py-8">
                  {!recordedAudio ? (
                    <div>
                      <motion.button
                        onClick={isRecording ? stopRecording : startRecording}
                        className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 transition-all ${
                          isRecording
                            ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                            : 'bg-gradient-to-br from-primary-500 to-secondary-500 hover:scale-105'
                        }`}
                        whileHover={{ scale: isRecording ? 1 : 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {isRecording ? (
                          <Square className="w-8 h-8 text-white" />
                        ) : (
                          <Mic className="w-8 h-8 text-white" />
                        )}
                      </motion.button>
                      <p className="text-white font-medium mb-1">
                        {isRecording ? 'Recording...' : 'Tap to Record'}
                      </p>
                      <p className="text-sm text-gray-400">
                        {isRecording ? 'Tap again to stop' : 'Record a voice message up to 60 seconds'}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-accent-500 to-primary-500
                                      flex items-center justify-center mx-auto mb-4">
                        <Volume2 className="w-8 h-8 text-white" />
                      </div>
                      <p className="text-white font-medium mb-1">Voice Message Ready</p>
                      <p className="text-sm text-gray-400 mb-4">Duration: {audioDuration}s</p>
                      <div className="flex items-center justify-center gap-3">
                        <motion.button
                          onClick={playAudio}
                          className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          {isPlaying ? (
                            <Pause className="w-5 h-5 text-white" />
                          ) : (
                            <Play className="w-5 h-5 text-white" />
                          )}
                        </motion.button>
                        <motion.button
                          onClick={deleteRecording}
                          className="p-3 rounded-full bg-red-500/10 hover:bg-red-500/20 transition-colors"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Trash2 className="w-5 h-5 text-red-400" />
                        </motion.button>
                      </div>
                      <audio
                        ref={audioRef}
                        src={recordedAudio}
                        onEnded={() => setIsPlaying(false)}
                        onLoadedMetadata={(e) => setAudioDuration(Math.round(e.currentTarget.duration))}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Animation & Theme Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-white/10">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Animation
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {animations.map((anim) => (
                      <button
                        key={anim.id}
                        type="button"
                        onClick={() => setAnimation(anim.id)}
                        className={`px-4 py-2 rounded-xl text-sm transition-all ${
                          animation === anim.id
                            ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white'
                            : 'bg-white/5 text-gray-400 hover:text-white'
                        }`}
                      >
                        {anim.preview} {anim.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Theme
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {themes.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setTheme(t.id)}
                        className={`px-4 py-2 rounded-xl text-sm transition-all ${
                          theme === t.id
                            ? `bg-gradient-to-r ${t.color} text-white`
                            : 'bg-white/5 text-gray-400 hover:text-white'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6 pt-6 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowPreview(true)}
                  className="btn-secondary flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  Preview
                </button>
                <div className="flex-1" />
                <button
                  type="button"
                  className="btn-secondary flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Draft
                </button>
                <motion.button
                  onClick={handleSubmit}
                  className="btn-primary flex items-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Send className="w-4 h-4" />
                  Create
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview Modal */}
      <AnimatePresence>
        {showPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowPreview(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-lg glass-card overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className={`h-48 bg-gradient-to-br ${themes.find(t => t.id === theme)?.color || 'from-primary-500 to-secondary-500'}
                              flex items-center justify-center relative overflow-hidden`}>
                {/* Decorative animations */}
                {[...Array(10)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute text-2xl"
                    initial={{ y: -20, opacity: 0 }}
                    animate={{
                      y: 200,
                      opacity: [0, 1, 0],
                      x: Math.random() * 100 - 50,
                    }}
                    transition={{
                      duration: 2,
                      delay: i * 0.2,
                      repeat: Infinity,
                    }}
                  >
                    {animations.find(a => a.id === animation)?.preview}
                  </motion.div>
                ))}
                <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  {animations.find(a => a.id === animation)?.preview}
                </div>
                <button
                  onClick={() => setShowPreview(false)}
                  className="absolute top-4 right-4 p-2 rounded-lg bg-black/20 hover:bg-black/30 text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-4">Your Message</h3>
                <p className="text-gray-300 mb-6">{message || 'No message yet'}</p>
                {recordedAudio && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 mb-4">
                    <Volume2 className="w-5 h-5 text-primary-400" />
                    <span className="text-sm text-gray-400">Voice message attached</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span className={animations.find(a => a.id === animation)?.preview}>
                    {animations.find(a => a.id === animation)?.label} animation
                  </span>
                  <span>•</span>
                  <span>{themes.find(t => t.id === theme)?.label} theme</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
