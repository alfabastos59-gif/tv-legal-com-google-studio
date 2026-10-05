import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { Channel } from '../types/channel';
import { ChannelCard } from './ChannelCard';

interface CategoryRowProps {
  title: string;
  channels: Channel[];
  selectedChannelId: string | null;
  onSelectChannel: (channel: Channel) => void;
  favorites: string[];
  onToggleFavorite: (channelId: string) => void;
  onViewAll?: () => void;
}

export const CategoryRow: React.FC<CategoryRowProps> = ({
  title,
  channels,
  selectedChannelId,
  onSelectChannel,
  favorites,
  onToggleFavorite,
  onViewAll,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 450;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (!channels || channels.length === 0) return null;

  return (
    <div className="relative group/row my-8">
      {/* Row Header */}
      <div className="flex items-center justify-between px-1 mb-3">
        <div className="flex items-center gap-2.5">
          <span className="w-1.5 h-5 bg-red-600 rounded-full" />
          <h3 className="text-lg font-extrabold text-white tracking-wide">
            {title}
          </h3>
          <span className="text-xs font-bold text-zinc-500 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded-full">
            {channels.length}
          </span>
        </div>

        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-xs font-bold text-red-400 hover:text-red-300 transition-colors uppercase tracking-wider flex items-center gap-1"
          >
            Ver Todos
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Horizontal Carousel Container */}
      <div className="relative">
        {/* Left Arrow Button */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-black/80 backdrop-blur-md border border-zinc-700/80 text-white flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-all -translate-x-3 hover:scale-110 hover:bg-red-600 shadow-xl"
          title="Rolar para esquerda"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Channels Horizontal Scroll */}
        <div
          ref={scrollContainerRef}
          className="flex items-stretch gap-3 sm:gap-4 overflow-x-auto pb-3 pt-1 scroll-smooth scrollbar-none px-1"
        >
          {channels.map(channel => (
            <div key={channel.id} className="w-44 sm:w-64 shrink-0">
              <ChannelCard
                channel={channel}
                isSelected={channel.id === selectedChannelId}
                onSelect={onSelectChannel}
                isFavorite={favorites.includes(channel.id)}
                onToggleFavorite={onToggleFavorite}
              />
            </div>
          ))}
        </div>

        {/* Right Arrow Button */}
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-black/80 backdrop-blur-md border border-zinc-700/80 text-white flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-all translate-x-3 hover:scale-110 hover:bg-red-600 shadow-xl"
          title="Rolar para direita"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
