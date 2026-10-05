import React, { useState } from 'react';
import { Play, Heart, Radio, Tv } from 'lucide-react';
import { Channel } from '../types/channel';

interface ChannelCardProps {
  channel: Channel;
  isSelected: boolean;
  onSelect: (channel: Channel) => void;
  isFavorite: boolean;
  onToggleFavorite: (channelId: string) => void;
}

export const ChannelCard: React.FC<ChannelCardProps> = ({
  channel,
  isSelected,
  onSelect,
  isFavorite,
  onToggleFavorite,
}) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div
      onClick={() => onSelect(channel)}
      className={`group relative flex flex-col bg-zinc-900/90 rounded-2xl overflow-hidden border cursor-pointer transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl ${
        isSelected
          ? 'border-red-500 ring-2 ring-red-500/40 glow-red shadow-red-900/40 bg-zinc-900'
          : 'border-zinc-800/80 hover:border-zinc-600 hover:shadow-black/60'
      }`}
    >
      {/* Thumbnail Aspect Ratio Container */}
      <div className="relative aspect-16/10 w-full bg-zinc-950 flex items-center justify-center overflow-hidden p-2">
        {/* Ambient subtle backglow */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent z-10" />

        {channel.thumbnail && !imageError ? (
          <img
            src={channel.thumbnail}
            alt={channel.name}
            onError={() => setImageError(true)}
            className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-zinc-500 p-4 text-center">
            <Tv className="w-10 h-10 mb-2 text-zinc-600 group-hover:text-red-500 transition-colors" />
            <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider line-clamp-1">
              {channel.name}
            </span>
          </div>
        )}

        {/* Favorite Heart Button */}
        <button
          onClick={e => {
            e.stopPropagation();
            onToggleFavorite(channel.id);
          }}
          className={`absolute top-2.5 right-2.5 z-20 p-2 rounded-xl backdrop-blur-md border transition-all ${
            isFavorite
              ? 'bg-red-600/90 border-red-500 text-white'
              : 'bg-black/60 border-zinc-700/60 text-zinc-400 hover:text-white hover:bg-black/90 opacity-80 sm:opacity-0 sm:group-hover:opacity-100'
          }`}
          title={isFavorite ? 'Remover dos favoritos' : 'Salvar nos favoritos'}
        >
          <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current text-white' : ''}`} />
        </button>

        {/* Live Indicator */}
        <div className="absolute top-2.5 left-2.5 z-20 flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md border border-zinc-700/60 text-[10px] font-bold text-zinc-300">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          <span>AO VIVO</span>
        </div>

        {/* Center Hover Play Icon */}
        <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
          <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg transform scale-75 group-hover:scale-100 transition-all glow-red">
            <Play className="w-5 h-5 fill-current ml-0.5" />
          </div>
        </div>

        {/* Playing Animated Equalizer Bar if Selected */}
        {isSelected && (
          <div className="absolute bottom-2.5 right-2.5 z-20 flex items-end gap-0.5 h-4 bg-black/80 px-2 py-1 rounded-md border border-red-500/50">
            <span className="w-1 bg-red-500 rounded-full animate-bounce [animation-delay:-0.3s] h-3" />
            <span className="w-1 bg-red-500 rounded-full animate-bounce [animation-delay:-0.15s] h-4" />
            <span className="w-1 bg-red-500 rounded-full animate-bounce h-2" />
          </div>
        )}
      </div>

      {/* Card Info Details */}
      <div className="p-3.5 flex flex-col justify-between flex-1 bg-zinc-900/90 border-t border-zinc-800/60">
        <div>
          <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest block mb-1">
            {channel.category}
          </span>
          <h4
            className={`text-sm font-bold line-clamp-1 transition-colors ${
              isSelected ? 'text-red-400' : 'text-zinc-100 group-hover:text-white'
            }`}
            title={channel.name}
          >
            {channel.name}
          </h4>
        </div>

        <div className="mt-2.5 pt-2 border-t border-zinc-800/60 flex items-center justify-between text-[11px] text-zinc-400">
          <span className="flex items-center gap-1 text-emerald-400 font-medium">
            <Radio className="w-3 h-3" />
            HD
          </span>
          <span className="text-zinc-500 group-hover:text-zinc-300 transition-colors">
            Assistir agora →
          </span>
        </div>
      </div>
    </div>
  );
};
