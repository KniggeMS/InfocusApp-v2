'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Trash2,
  Check,
  Clock,
  PlayCircle,
  Film,
  Tv,
  Layers,
  ListVideo,
  Heart,
  Bookmark,
  Star,
  ListPlus,
  FolderPlus,
  ChevronRight
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { WatchlistEntry } from '@/lib/api/watchlist';
import { cn } from '@/lib/utils/cn';

const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

export interface WatchlistCardProps {
  entry: WatchlistEntry;
  onEdit: (entry: WatchlistEntry) => void; // Used for status change in this context
  onRemove: (entry: WatchlistEntry) => void;
  className?: string;
}

export function WatchlistCard({ entry, onEdit, onRemove, className }: WatchlistCardProps) {
  const t = useTranslations('MediaCard'); // Assuming we'll add translations later
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHoveringRating, setIsHoveringRating] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const item = entry.mediaItem;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
        setIsHoveringRating(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const statusColors = {
    'not_watched': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    'watching': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'completed': 'bg-green-500/20 text-green-400 border-green-500/30',
  };

  const statusLabels = {
    'not_watched': 'Planned',
    'watching': 'Watching',
    'completed': 'Seen',
  };

  const posterUrl = item.posterPath ? `${IMAGE_BASE_URL}${item.posterPath}` : null;

  const handleStatusChange = (newStatus: 'not_watched' | 'watching' | 'completed') => {
    onEdit({ ...entry, status: newStatus });
    setIsMenuOpen(false);
  };

  return (
    <div
      className={cn(
        "group relative flex flex-col bg-slate-800 rounded-xl border border-slate-700 shadow-lg hover:border-slate-500 transition-all duration-300 hover:shadow-cyan-500/10 cursor-pointer",
        className
      )}
    >
      {/* Image Container - Rounded Top, Overflow Hidden for Zoom Effect */}
      <div
        className="h-96 w-full relative overflow-hidden bg-slate-900 rounded-t-xl"
      >
        {posterUrl ? (
          <img
            src={posterUrl}
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center bg-slate-800"
          >
            <Film className="text-white/20" size={64} />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent"></div>

        <div className="absolute bottom-4 left-4 right-4 z-10">
          <h3 className="text-xl font-bold text-white leading-tight drop-shadow-md line-clamp-2" title={item.title}>
            {item.title}
          </h3>
          <div className="flex flex-wrap items-center gap-2 text-slate-200 text-xs mt-2 font-medium">
            {item.mediaType === 'movie' ? <Film size={14} className="text-cyan-400" /> : <Tv size={14} className="text-purple-400" />}
            <span>{item.releaseDate ? new Date(item.releaseDate).getFullYear() : 'N/A'}</span>
            <span>•</span>
            <span className="truncate max-w-[150px]">{item.genres?.slice(0, 2).join(', ') || 'Unknown'}</span>
          </div>
        </div>
      </div>

      {/* OVERLAY ELEMENTS (Menu & Badges) */}

      {/* Menu Button */}
      <div className="absolute top-2 right-2 z-30" ref={menuRef}>
        <button
          onClick={(e) => { e.stopPropagation(); setIsMenuOpen(!isMenuOpen); }}
          className={`p-2 rounded-full backdrop-blur-md transition-colors shadow-sm ${isMenuOpen ? 'bg-cyan-600 text-white' : 'bg-slate-900/60 text-slate-300 hover:bg-slate-900 hover:text-white'}`}
        >
          <ListPlus size={20} />
        </button>

        {isMenuOpen && (
          <div className="absolute right-0 mt-2 w-56 bg-slate-800 rounded-lg shadow-2xl border border-slate-700 animate-in fade-in zoom-in-95 duration-200 origin-top-right z-40">
            <div className="bg-slate-900 px-4 py-2.5 border-b border-slate-700 rounded-t-lg">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <ListVideo size={14} className="text-cyan-400" /> Actions
              </span>
            </div>

            <div className="py-1">
              <button
                onClick={(e) => { e.stopPropagation(); handleStatusChange('not_watched'); }}
                className="w-full text-left px-4 py-3 hover:bg-slate-700/50 flex items-center gap-3 transition-colors group/item"
              >
                <Bookmark
                  size={18}
                  className={`transition-colors ${entry.status === 'not_watched' ? 'fill-cyan-500 text-cyan-500' : 'text-slate-400 group-hover/item:text-slate-200'}`}
                />
                <span className={`text-sm font-medium ${entry.status === 'not_watched' ? 'text-white' : 'text-slate-300'}`}>Watchlist</span>
              </button>

              <div
                className="w-full text-left px-4 py-3 hover:bg-slate-700/50 flex flex-col justify-center gap-1 transition-colors group/item relative"
                onMouseEnter={() => setIsHoveringRating(true)}
                onMouseLeave={() => setIsHoveringRating(false)}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-3">
                  <Star
                    size={18}
                    className={`transition-colors ${entry.rating && entry.rating > 0 ? 'fill-yellow-500 text-yellow-500' : 'text-slate-400 group-hover/item:text-slate-200'}`}
                  />
                  <span className={`text-sm font-medium ${entry.rating && entry.rating > 0 ? 'text-white' : 'text-slate-300'}`}>
                    {isHoveringRating ? `Rate:` : 'Your Rating'}
                  </span>
                </div>

                {isHoveringRating && (
                  <div className="flex gap-1 pl-8 animate-in fade-in slide-in-from-left-2 duration-200 pt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit({ ...entry, rating: star });
                        }}
                        className="text-slate-400 hover:text-yellow-400 hover:scale-110 transition-transform"
                      >
                        <Star
                          size={16}
                          className={(entry.rating || 0) >= star ? 'fill-yellow-500 text-yellow-500' : ''}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* User Rating Badge */}
      {entry.rating && entry.rating > 0 && (
        <div className="absolute top-2 left-2 z-30 bg-yellow-500/90 text-slate-900 px-2 py-1 rounded-md text-xs font-bold shadow-sm flex items-center gap-1">
          <Star size={12} className="fill-slate-900" />
          {entry.rating}
        </div>
      )}

      {/* Content Body */}
      <div className="p-4 flex-grow flex flex-col rounded-b-xl">

        <div className="mb-3 flex flex-wrap gap-2 text-xs text-slate-400">
          {item.mediaType === 'tv' && (
            <div className="flex items-center gap-1.5 bg-slate-900/50 px-2 py-1 rounded border border-slate-700/50">
              <Layers size={12} className="text-purple-400" />
              <span>TV Series</span>
            </div>
          )}
        </div>

        <p className="text-slate-400 text-sm line-clamp-3 mb-4 flex-grow">
          {item.description || 'No description available.'}
        </p>

        <div className={`self-start mb-4 px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColors[entry.status]}`}>
          {statusLabels[entry.status]}
        </div>

        <div className="flex items-center justify-between border-t border-slate-700 pt-3 mt-auto">
          <div className="flex gap-1">
            <button
              onClick={(e) => { e.stopPropagation(); handleStatusChange('not_watched'); }}
              className={`p-2 rounded-lg hover:bg-slate-700 transition-colors ${entry.status === 'not_watched' ? 'text-yellow-400' : 'text-slate-500'}`}
              title="Planned"
            >
              <Clock size={18} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleStatusChange('watching'); }}
              className={`p-2 rounded-lg hover:bg-slate-700 transition-colors ${entry.status === 'watching' ? 'text-blue-400' : 'text-slate-500'}`}
              title="Watching"
            >
              <PlayCircle size={18} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleStatusChange('completed'); }}
              className={`p-2 rounded-lg hover:bg-slate-700 transition-colors ${entry.status === 'completed' ? 'text-green-400' : 'text-slate-500'}`}
              title="Seen"
            >
              <Check size={18} />
            </button>
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); onRemove(entry); }}
            className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
            title="Remove"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
