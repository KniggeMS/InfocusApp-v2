'use client';

import React, { useState, useEffect } from 'react';
import {
  X, Film, Clock, Check, PlayCircle, ImageOff, StickyNote, BrainCircuit, Loader2, Star, List, Sparkles, Tv
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useUpdateWatchlistEntry, useRemoveFromWatchlist } from '@/lib/hooks/use-watchlist';
import type { WatchlistEntry } from '@/lib/api/watchlist';
import { toast } from 'react-hot-toast';
import { listsApi, CustomList } from '@/lib/api/lists';

const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w780'; // Higher res for detail
const BACKDROP_BASE_URL = 'https://image.tmdb.org/t/p/w1280';
const LOGO_BASE_URL = 'https://image.tmdb.org/t/p/w300';

import { aiApi } from '@/lib/api/ai';

export interface WatchlistDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  entry: WatchlistEntry | null;
}

export function WatchlistDetailDrawer({ isOpen, onClose, entry }: WatchlistDetailDrawerProps) {
  const t = useTranslations('DetailView'); // Placeholder for translations
  const updateMutation = useUpdateWatchlistEntry();
  const removeMutation = useRemoveFromWatchlist();

  const [notes, setNotes] = useState('');
  const [playingTrailer, setPlayingTrailer] = useState(false);
  const [imgError, setImgError] = useState(false);

  // AI Analysis State
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Custom Lists State
  const [lists, setLists] = useState<CustomList[]>([]);
  const [showListSelector, setShowListSelector] = useState(false);

  const fetchLists = async () => {
    try {
      const data = await listsApi.getLists();
      setLists(data);
    } catch (error) {
      console.error('Failed to fetch lists:', error);
      toast.error('Failed to load lists');
    }
  };

  const handleAddToList = async (listId: string) => {
    if (!entry) return;
    try {
      await listsApi.addItem(listId, entry.mediaItem.id);
      toast.success('Added to list');
      setShowListSelector(false);
    } catch (error) {
      console.error('Failed to add to list:', error);
      toast.error('Failed to add to list');
    }
  };

  useEffect(() => {
    if (entry) {
      setNotes(entry.notes || '');
      setImgError(false);
      setAnalysis(null); // Reset analysis on entry change
    }
  }, [entry]);

  const handleAnalyze = async () => {
    if (!entry) return;
    setIsAnalyzing(true);
    try {
      const result = await aiApi.analyzeContent(
        entry.mediaItem.title,
        entry.mediaItem.description || '',
        notes
      );
      setAnalysis(result.analysis);
    } catch (error) {
      console.error('Analysis failed:', error);
      toast.error('Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Auto-save notes logic
  useEffect(() => {
    if (entry) {
      const timeoutId = setTimeout(() => {
        if (notes !== (entry.notes || '')) {
          handleUpdate({ notes });
        }
      }, 1000); // Save after 1 second of inactivity
      return () => clearTimeout(timeoutId);
    }
  }, [notes, entry]);

  if (!isOpen || !entry) return null;

  const item = entry.mediaItem;
  const backdropUrl = item.backdropPath ? `${BACKDROP_BASE_URL}${item.backdropPath}` : null;
  const posterUrl = !imgError && item.posterPath ? `${IMAGE_BASE_URL}${item.posterPath}` : null;

  // Mock percentage for now as it's not in WatchlistEntry yet, or use rating * 10
  const percentage = item.rating ? Math.round(item.rating * 10) : 0;
  const strokeDasharray = `${percentage}, 100`;

  const handleUpdate = async (data: any) => {
    try {
      await updateMutation.mutateAsync({
        id: entry.id,
        data,
      });
      // toast.success('Updated'); // Too noisy for auto-save
    } catch (error) {
      toast.error('Failed to update');
    }
  };

  const handleStatusChange = (status: 'not_watched' | 'watching' | 'completed') => {
    handleUpdate({ status });
  };

  const handleRatingChange = (rating: number) => {
    handleUpdate({ rating });
  };

  const handleDelete = async () => {
    if (confirm('Remove from watchlist?')) {
      await removeMutation.mutateAsync(entry.id);
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-0 md:p-4 bg-slate-900/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 w-full max-w-5xl md:rounded-2xl shadow-2xl flex flex-col h-full md:h-auto md:max-h-[95vh] overflow-hidden relative border border-slate-800">

        <div className="absolute top-4 right-4 z-50 flex gap-2">
          <button onClick={onClose} className="p-2 bg-black/40 hover:bg-black/60 text-white rounded-full backdrop-blur-sm transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="relative w-full h-[40vh] md:h-[500px] flex-shrink-0 bg-slate-950 overflow-hidden group">
          {/* Static Backdrop Image */}
          {backdropUrl ? (
            <img
              src={backdropUrl}
              alt="Backdrop"
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 z-0 pointer-events-none opacity-60`}
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-800 z-0"></div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent z-10 pointer-events-none"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/70 to-transparent z-10 pointer-events-none"></div>

          <div className="absolute bottom-0 left-0 w-full p-6 md:p-10 flex flex-col md:flex-row gap-8 md:items-end z-20">
            <div className="hidden md:block w-56 rounded-lg overflow-hidden shadow-2xl border-2 border-slate-700/50 flex-shrink-0 relative transform transition-transform group-hover:scale-[1.02] bg-slate-800 aspect-[2/3]">
              {posterUrl ? (
                <img
                  src={posterUrl}
                  alt={item.title}
                  className="w-full h-full object-cover"
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 text-slate-600 gap-2">
                  <ImageOff size={48} className="opacity-40 mb-2" />
                  <span className="text-xs font-medium uppercase tracking-wider opacity-60">No Poster</span>
                </div>
              )}
            </div>

            <div className="flex-grow min-w-0 pb-2">
              <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-2 leading-tight drop-shadow-lg text-balance">
                {item.title} <span className="text-slate-400 font-light text-2xl">({item.releaseDate ? new Date(item.releaseDate).getFullYear() : 'N/A'})</span>
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-slate-300 mb-6">
                {item.mediaType === 'movie' ? <Film size={16} /> : <Tv size={16} />}
                <span>{item.genres?.join(', ')}</span>
              </div>

              {/* Rating Section */}
              <div className="flex flex-wrap items-center gap-y-4 gap-x-6 mb-8">
                <div className="flex items-center gap-3">
                  <div className="relative w-14 h-14 flex items-center justify-center bg-slate-900/80 rounded-full border-2 border-slate-800 shadow-lg flex-shrink-0">
                    <svg viewBox="0 0 36 36" className="w-12 h-12 transform -rotate-90">
                      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#1e293b" strokeWidth="3" />
                      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={percentage > 70 ? '#22c55e' : percentage > 40 ? '#eab308' : '#ef4444'} strokeWidth="3" strokeDasharray={strokeDasharray} />
                    </svg>
                    <span className="absolute text-xs font-bold text-white">{percentage}<span className="text-[9px]">%</span></span>
                  </div>
                  <span className="font-bold text-white leading-tight text-sm drop-shadow-md whitespace-nowrap">TMDB Rating</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex bg-slate-800/80 rounded-full p-1 border border-slate-700 backdrop-blur-md">
                  <button
                    onClick={() => handleStatusChange('not_watched')}
                    className={`p-2.5 rounded-full transition-all ${entry.status === 'not_watched' ? 'bg-yellow-500 text-slate-900 shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
                    title="Planned"
                  >
                    <Clock size={18} />
                  </button>
                  <button
                    onClick={() => handleStatusChange('watching')}
                    className={`p-2.5 rounded-full transition-all ${entry.status === 'watching' ? 'bg-blue-500 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
                    title="Watching"
                  >
                    <PlayCircle size={18} />
                  </button>
                  <button
                    onClick={() => handleStatusChange('completed')}
                    className={`p-2.5 rounded-full transition-all ${entry.status === 'completed' ? 'bg-green-500 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
                    title="Seen"
                  >
                    <Check size={18} />
                  </button>
                </div>

                {/* User Rating */}
                <div className="flex items-center gap-1 bg-slate-800/80 rounded-full px-3 py-2 border border-slate-700">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleRatingChange(star)}
                      className="text-slate-400 hover:text-yellow-400 hover:scale-110 transition-transform"
                    >
                      <Star
                        size={16}
                        className={(entry.rating || 0) >= star ? 'fill-yellow-500 text-yellow-500' : ''}
                      />
                    </button>
                  ))}
                </div>

                {/* Add to List Button */}
                <div className="relative">
                  <button
                    onClick={() => {
                      if (!showListSelector) fetchLists();
                      setShowListSelector(!showListSelector);
                    }}
                    className={`p-3 rounded-full transition-all border ${showListSelector ? 'bg-cyan-500 text-white border-cyan-500' : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 border-slate-700'}`}
                    title="Add to List"
                  >
                    <List size={20} />
                  </button>

                  {/* List Selector Dropdown */}
                  {showListSelector && (
                    <div className="absolute bottom-full left-0 mb-2 w-56 bg-slate-900/95 backdrop-blur-xl rounded-xl border border-slate-700/50 shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-2 ring-1 ring-white/10">
                      <div className="p-3 border-b border-slate-700/50 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-950/30">
                        Select List
                      </div>
                      <div className="max-h-56 overflow-y-auto custom-scrollbar p-1.5 space-y-0.5">
                        {lists.length > 0 ? (
                          lists.map((list) => (
                            <button
                              key={list.id}
                              onClick={() => handleAddToList(list.id)}
                              className="w-full text-left px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-gradient-to-r hover:from-cyan-500/10 hover:to-blue-500/10 hover:text-cyan-400 rounded-lg transition-all truncate flex items-center gap-2 group"
                            >
                              <div className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-cyan-400 transition-colors" />
                              {list.name}
                            </button>
                          ))
                        ) : (
                          <div className="px-3 py-4 text-sm text-slate-500 italic text-center">
                            No lists found
                            <div className="text-[10px] mt-1 opacity-60">Create one in "All Lists"</div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleDelete}
                  className="p-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-full transition-all border border-red-500/20"
                  title="Remove"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-grow bg-slate-900 p-6 md:p-10 overflow-y-auto custom-scrollbar z-20">
          <div className="grid md:grid-cols-3 gap-10">
            <div className="md:col-span-2 space-y-8">

              <div>
                <h4 className="text-lg font-bold text-white mb-3">Plot</h4>
                <p className="text-slate-300 leading-relaxed text-lg">
                  {item.description || 'No description available.'}
                </p>
              </div>

              {/* Private Notes Section */}
              <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50">
                <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <StickyNote size={16} className="text-yellow-400" /> Private Notes
                </h4>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-slate-300 text-sm focus:border-cyan-500 focus:outline-none min-h-[100px] resize-y"
                  placeholder="Add your thoughts..."
                />
                <div className="flex justify-end mt-2">
                  <span className="text-[10px] text-slate-500">
                    {notes === (entry.notes || '') ? 'Saved' : 'Saving...'}
                  </span>
                </div>
              </div>

              {/* AI Deep Insights */}
              <div className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 p-6 rounded-xl border border-indigo-500/30">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-indigo-200 flex items-center gap-2">
                    <BrainCircuit size={16} className="text-indigo-400" /> Deep Insights
                  </h4>
                  <button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    className="text-xs bg-indigo-500/20 hover:bg-indigo-500/40 text-indigo-300 px-3 py-1.5 rounded-full transition-colors flex items-center gap-2"
                  >
                    {isAnalyzing ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                    {analysis ? 'Re-Analyze' : 'Analyze Vibe'}
                  </button>
                </div>

                {analysis ? (
                  <div className="animate-in fade-in slide-in-from-bottom-2">
                    <p className="text-indigo-100/80 text-sm leading-relaxed italic">
                      "{analysis}"
                    </p>
                  </div>
                ) : (
                  <p className="text-indigo-300/40 text-xs text-center py-2">
                    Get a vibe check based on the plot and your notes.
                  </p>
                )}
              </div>

              {item.creators && item.creators.length > 0 && (
                <div className="grid grid-cols-2 gap-4 border-t border-slate-800 pt-6">
                  {item.creators.map(creator => (
                    <div key={creator}>
                      <div className="font-bold text-white text-base">{creator}</div>
                      <div className="text-slate-500 text-xs uppercase tracking-wide">Creator</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-8">
              {item.streamingProviders && item.streamingProviders.length > 0 ? (
                <div className="bg-gradient-to-br from-slate-800 to-slate-800/50 p-5 rounded-xl border border-slate-700 shadow-xl">
                  <div className="flex items-center gap-4 mb-4">
                    <div>
                      <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-0.5">Available on</div>
                      <div className="text-white font-bold text-base">Watch Now</div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4 pt-4 border-t border-slate-700/50 flex-wrap">
                    {item.streamingProviders.map(p => (
                      <div key={p.id} className="bg-slate-700 px-2 py-1 rounded text-xs text-white">
                        {p.provider}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-5 rounded-xl border border-dashed border-slate-700 text-slate-500 text-sm text-center">
                  No streaming info available
                </div>
              )}

              <div className="space-y-4 text-sm bg-slate-800/30 p-5 rounded-xl border border-slate-800">
                <div className="flex justify-between border-b border-slate-800 pb-3">
                  <span className="text-slate-500 font-medium">Original Title</span>
                  <span className="text-slate-300 text-right font-semibold">{item.title}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-3">
                  <span className="text-slate-500 font-medium">Type</span>
                  <span className="text-slate-300 font-semibold capitalize">{item.mediaType}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
