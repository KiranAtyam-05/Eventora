import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Image, Video, Mic, FileText, Plus, X, Trash2, Download, Share2,
  Grid, Clock, Folder, Eye, Search, Upload, Play, Pause
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';

const mediaTypes = [
  { id: 'all', label: 'All', icon: Grid },
  { id: 'image', label: 'Images', icon: Image },
  { id: 'video', label: 'Videos', icon: Video },
  { id: 'audio', label: 'Audio', icon: Mic },
  { id: 'document', label: 'Documents', icon: FileText },
];

export function GalleryPage({ onNavigate }) {
  const { user } = useAuth();
  const [media, setMedia] = useState([]);
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  async function loadData() {
    const [mediaRes, memoriesRes] = await Promise.all([
      supabase.from('media').select('*').order('created_at', { ascending: false }),
      supabase.from('memories').select('*').order('created_at', { ascending: false }),
    ]);
    setMedia(mediaRes.data || []);
    setMemories(memoriesRes.data || []);
    setLoading(false);
  }

  const filteredMedia = media.filter((item) => {
    const matchesType = filter === 'all' || item.type === filter;
    const matchesSearch = !searchQuery ||
      item.filename?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const handleFileSelect = (files) => {
    if (!files || files.length === 0) return;
    handleUpload(Array.from(files));
  };

  const handleUpload = async (files) => {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setUploadProgress(((i + 1) / files.length) * 100);

      // Determine media type
      let type = 'document';
      if (file.type.startsWith('image/')) type = 'image';
      else if (file.type.startsWith('video/')) type = 'video';
      else if (file.type.startsWith('audio/')) type = 'audio';

      // Create a local URL for preview (in production, you'd upload to Supabase Storage)
      const url = URL.createObjectURL(file);

      await supabase.from('media').insert({
        user_id: user.id,
        type,
        url,
        filename: file.name,
        size: file.size,
      });
    }

    setUploadProgress(0);
    setShowUploadModal(false);
    loadData();
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    handleUpload(Array.from(files));
  };

  const deleteMedia = async (id) => {
    await supabase.from('media').delete().eq('id', id);
    loadData();
    setSelectedMedia(null);
  };

  const groupedByDate = filteredMedia.reduce((acc, item) => {
    const date = format(new Date(item.created_at), 'MMMM d, yyyy');
    if (!acc[date]) acc[date] = [];
    acc[date].push(item);
    return acc;
  }, {});

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
          <h1 className="text-2xl font-bold text-white">Memory Gallery</h1>
          <p className="text-gray-400">Your precious memories in one place</p>
        </div>
        <motion.button
          onClick={() => setShowUploadModal(true)}
          className="btn-primary flex items-center gap-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Upload className="w-5 h-5" />
          <span>Upload Media</span>
        </motion.button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-12"
            placeholder="Search memories..."
          />
        </div>
        <div className="flex items-center gap-1 p-1 rounded-xl bg-white/5">
          {mediaTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setFilter(type.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === type.id
                  ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <type.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{type.label}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 p-1 rounded-xl bg-white/5">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'grid' ? 'bg-primary-500 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Grid className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('timeline')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'timeline' ? 'bg-primary-500 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Clock className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Media', value: media.length, icon: Grid, color: 'text-primary-400' },
          { label: 'Images', value: media.filter(m => m.type === 'image').length, icon: Image, color: 'text-secondary-400' },
          { label: 'Videos', value: media.filter(m => m.type === 'video').length, icon: Video, color: 'text-accent-400' },
          { label: 'Audio', value: media.filter(m => m.type === 'audio').length, icon: Mic, color: 'text-pink-400' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="card p-4"
          >
            <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            <p className="text-xs text-gray-400">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Gallery */}
      {filteredMedia.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16"
        >
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-accent-500/20 to-primary-500/20
                          flex items-center justify-center">
            <Folder className="w-12 h-12 text-accent-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No memories yet</h3>
          <p className="text-gray-400 mb-6">Upload your first memory to get started</p>
          <button onClick={() => setShowUploadModal(true)} className="w-full sm:w-auto btn-primary">
            <Upload className="w-5 h-5 mr-2" />
            Upload Media
          </button>
        </motion.div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredMedia.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="card-hover aspect-square cursor-pointer overflow-hidden relative group"
              onClick={() => setSelectedMedia(item)}
            >
              {item.type === 'image' ? (
                <img
                  src={item.url}
                  alt={item.filename || 'Memory'}
                  className="w-full h-auto object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary-500/20 to-secondary-500/20
                                flex items-center justify-center">
                  {item.type === 'video' && <Video className="w-10 h-10 text-gray-400" />}
                  {item.type === 'audio' && <Mic className="w-10 h-10 text-gray-400" />}
                  {item.type === 'document' && <FileText className="w-10 h-10 text-gray-400" />}
                </div>
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity
                              flex items-center justify-center gap-3">
                <button
                  onClick={(e) => { e.stopPropagation(); setSelectedMedia(item); }}
                  className="p-3 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                >
                  <Eye className="w-5 h-5 text-white" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteMedia(item.id); }}
                  className="p-3 rounded-full bg-red-500/20 hover:bg-red-500/30 transition-colors"
                >
                  <Trash2 className="w-5 h-5 text-red-400" />
                </button>
              </div>
              {item.type !== 'image' && (
                <div className="absolute bottom-2 left-2 right-2 px-2 py-1 rounded bg-black/50 backdrop-blur-sm">
                  <p className="text-xs text-white truncate">{item.filename}</p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedByDate).map(([date, items]) => (
            <div key={date}>
              <h3 className="text-sm font-medium text-gray-400 mb-4 sticky top-0 bg-gradient-hero py-2">
                {date}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="card-hover aspect-square cursor-pointer overflow-hidden"
                    onClick={() => setSelectedMedia(item)}
                  >
                    {item.type === 'image' ? (
                      <img
                        src={item.url}
                        alt={item.filename || 'Memory'}
                        className="w-full h-auto object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary-500/20 to-secondary-500/20
                                      flex items-center justify-center">
                        {item.type === 'video' && <Video className="w-8 h-8 text-gray-400" />}
                        {item.type === 'audio' && <Mic className="w-8 h-8 text-gray-400" />}
                        {item.type === 'document' && <FileText className="w-8 h-8 text-gray-400" />}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => !uploadProgress && setShowUploadModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md glass-card p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Upload Media</h2>
                {!uploadProgress && (
                  <button
                    onClick={() => setShowUploadModal(false)}
                    className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all
                           ${isDragging ? 'border-primary-500 bg-primary-500/10' : 'border-white/20 hover:border-white/30'}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {uploadProgress > 0 ? (
                  <div className="space-y-4">
                    <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-primary-500 to-secondary-500
                                    flex items-center justify-center">
                      <Upload className="w-8 h-8 text-white animate-bounce" />
                    </div>
                    <p className="text-white font-medium">Uploading...</p>
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${uploadProgress}%` }}
                        className="h-full bg-gradient-to-r from-primary-500 to-secondary-500"
                      />
                    </div>
                    <p className="text-sm text-gray-400">{Math.round(uploadProgress)}%</p>
                  </div>
                ) : (
                  <>
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/10
                                    flex items-center justify-center">
                      <Upload className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-white font-medium mb-1">Drop files here</p>
                    <p className="text-sm text-gray-400 mb-4">or click to browse</p>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full sm:w-auto btn-primary"
                    >
                      Select Files
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*,video/*,audio/*,.pdf"
                      onChange={(e) => handleFileSelect(e.target.files)}
                      className="hidden"
                    />
                    <div className="mt-4 flex justify-center gap-4 text-xs text-gray-500">
                      <span>Images</span>
                      <span>Videos</span>
                      <span>Audio</span>
                      <span>PDF</span>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview Modal */}
      <AnimatePresence>
        {selectedMedia && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedMedia(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-4xl max-h-[90vh] overflow-auto glass-card"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <div>
                  <h3 className="text-white font-medium">{selectedMedia.filename}</h3>
                  <p className="text-sm text-gray-400">
                    {format(new Date(selectedMedia.created_at), 'MMM d, yyyy • h:mm a')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                    <Download className="w-5 h-5" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                    <Share2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => deleteMedia(selectedMedia.id)}
                    className="p-2 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setSelectedMedia(null)}
                    className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-center min-h-[300px] bg-black/20">
                {selectedMedia.type === 'image' ? (
                  <img
                    src={selectedMedia.url}
                    alt={selectedMedia.filename || 'Memory'}
                    className="max-w-full max-h-[60vh] object-contain"
                  />
                ) : (
                  <div className="text-center p-8">
                    {selectedMedia.type === 'video' && <Video className="w-16 h-16 mx-auto mb-4 text-gray-400" />}
                    {selectedMedia.type === 'audio' && <Mic className="w-16 h-16 mx-auto mb-4 text-gray-400" />}
                    {selectedMedia.type === 'document' && <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />}
                    <p className="text-gray-300">{selectedMedia.filename}</p>
                    {selectedMedia.size && (
                      <p className="text-sm text-gray-500 mt-2">
                        Size: {(selectedMedia.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
