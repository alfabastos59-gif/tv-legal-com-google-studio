import React from 'react';
import { Play, Heart, Radio, History, Tv } from 'lucide-react';
import { Channel } from '../types/channel';

interface HeroBannerProps {
  channels: Channel[]; // The 3 watched channels
  currentPlayingId?: string | null;
  onPlayChannel: (channel: Channel) => void;
  favorites: string[];
  onToggleFavorite: (channelId: string) => void;
  onSelectCategory?: (category: string) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  channels,
  currentPlayingId,
  onPlayChannel,
  favorites,
  onToggleFavorite,
  onSelectCategory,
}) => {
  if (!channels || channels.length === 0) return null;

  const displayChannels = channels.slice(0, 3);

  return (
    <div className="relative w-full rounded-3xl overflow-hidden mb-8 border border-zinc-800/80 shadow-2xl bg-zinc-950 p-5 sm:p-7">
      {/* Background Cinematic Gradients */}
      <div className="absolute inset-0 bg-gradient-to-r from-red-950/20 via-zinc-950 to-zinc-950/80 pointer-events-none -z-10" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/5 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-zinc-800/70 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-red-600/20 border border-red-500/40 text-red-500 flex items-center justify-center glow-red">
            <History className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-white tracking-wide uppercase font-cinematic">
                Canais Já Assistidos
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-red-600 text-white uppercase tracking-wider animate-pulse">
                3 Canais
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Acesse rapidamente os 3 canais assistidos recentemente na sua TV Legal 5
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Histórico Ativo</span>
        </div>
      </div>

      {/* 3 Channels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {displayChannels.map((channel) => {
          const isCurrent = channel.id === currentPlayingId;

          return (
            <div
              key={channel.id}
              onClick={() => onPlayChannel(channel)}
              className={`group relative rounded-3xl overflow-hidden border p-3.5 sm:p-4 transition-all duration-300 flex flex-col justify-between cursor-pointer ${
                isCurrent
                  ? 'bg-zinc-950 border-red-500/80 ring-2 ring-red-500/30 glow-red shadow-xl'
                  : 'bg-zinc-950/95 hover:bg-zinc-900 border-zinc-800/90 hover:border-zinc-700 shadow-lg transform hover:-translate-y-1'
              }`}
            >
              {/* Card Top: Live Badge Only (Matching Reference Image) */}
              <div className="flex items-center justify-start mb-2">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/90 border border-zinc-800 text-[10px] sm:text-[11px] font-bold text-white tracking-wider uppercase">
                  <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                  <span>AO VIVO</span>
                </div>
              </div>

              {/* Card Center: Prominent Channel Logo/Artwork */}
              <div className="w-full h-24 sm:h-28 flex items-center justify-center my-2 p-1">
                {channel.thumbnail ? (
                  <img
                    src={channel.thumbnail}
                    alt={channel.name}
                    className="max-h-full max-w-full object-contain filter drop-shadow-md group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-center">
                    <Tv className="w-8 h-8 text-zinc-600 group-hover:text-red-500 transition-colors mb-1" />
                    <span className="text-sm font-bold text-white uppercase tracking-wider">
                      {channel.name}
                    </span>
                  </div>
                )}
              </div>

              {/* Card Bottom: Full-Width Pill Action Button (Matching Reference Image) */}
              <div className="mt-2 pt-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onPlayChannel(channel);
                  }}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md active:scale-98 border ${
                    isCurrent
                      ? 'bg-red-600 text-white border-red-500 glow-red'
                      : 'bg-zinc-800/90 hover:bg-zinc-700 text-zinc-100 border-zinc-700/60 hover:text-white hover:border-zinc-500'
                  }`}
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{isCurrent ? 'Assistindo Agora' : 'Assistir Canal'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
