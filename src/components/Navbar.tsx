import React from 'react';
import {
  Tv,
  Search,
  X,
  Heart,
  Shield
} from 'lucide-react';

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  favoritesCount: number;
  totalChannels: number;
  onOpenAdmin: () => void;
  showFavoritesOnly: boolean;
  onToggleShowFavorites: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  searchQuery,
  onSearchChange,
  favoritesCount,
  totalChannels,
  onOpenAdmin,
  showFavoritesOnly,
  onToggleShowFavorites,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-zinc-800/80">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4">
        
        {/* Top bar on Mobile / Left side on Desktop */}
        <div className="flex items-center justify-between w-full sm:w-auto">
          {/* Brand Logo */}
          <div
            className="flex items-center gap-2.5 cursor-pointer select-none"
            onClick={() => onSearchChange('')}
          >
            <div className="relative flex items-center justify-center w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-red-600 to-red-800 text-white shadow-lg glow-red shrink-0">
              <Tv className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-zinc-950">
                <span className="h-1 w-1 rounded-full bg-white animate-pulse" />
              </span>
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base sm:text-xl font-extrabold tracking-wider text-white font-cinematic">
                  TV LEGAL
                </span>
                <span className="px-1.5 py-0.2 text-[11px] sm:text-xs font-black bg-red-600 text-white rounded-md tracking-tighter shadow-xs">
                  5
                </span>
              </div>
              <p className="text-[9px] sm:text-[10px] text-zinc-400 uppercase tracking-widest font-semibold flex items-center gap-1">
                <span>CineStream</span>
                <span>•</span>
                <span className="text-emerald-400 font-bold">{totalChannels} CANAIS</span>
              </p>
            </div>
          </div>

          {/* Action buttons on Mobile Header (Right side of Logo) */}
          <div className="flex items-center gap-1.5 sm:hidden">
            <button
              onClick={onToggleShowFavorites}
              className={`p-2 rounded-xl text-xs font-semibold border transition-all ${
                showFavoritesOnly
                  ? 'bg-red-600/20 border-red-500 text-red-400 shadow-md'
                  : 'bg-zinc-900/90 border-zinc-800 text-zinc-300'
              }`}
              title="Favoritos"
            >
              <Heart className={`w-4 h-4 ${showFavoritesOnly ? 'fill-current text-red-500' : ''}`} />
            </button>

            <button
              onClick={onOpenAdmin}
              className="p-2 rounded-xl text-xs font-bold bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-md border border-red-500/30"
              title="Painel ADM"
            >
              <Shield className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search Bar (Full width on mobile, max-w-md on desktop) */}
        <div className="flex-1 w-full sm:max-w-md sm:mx-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => onSearchChange(e.target.value)}
              placeholder="Buscar canal, filme ou categoria..."
              className="w-full bg-zinc-900/90 text-sm text-zinc-100 placeholder-zinc-500 rounded-xl pl-9 pr-8 py-2 border border-zinc-800 focus:outline-hidden focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Action Buttons on Desktop */}
        <div className="hidden sm:flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={onToggleShowFavorites}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
              showFavoritesOnly
                ? 'bg-red-600/20 border-red-500 text-red-400 shadow-md'
                : 'bg-zinc-900/80 border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800'
            }`}
            title="Ver meus canais favoritos"
          >
            <Heart className={`w-4 h-4 ${showFavoritesOnly ? 'fill-current text-red-500' : ''}`} />
            <span>Favoritos</span>
            {favoritesCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-red-600 text-white">
                {favoritesCount}
              </span>
            )}
          </button>

          <button
            onClick={onOpenAdmin}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white shadow-md shadow-red-600/20 border border-red-500/30 transition-all transform hover:scale-105 active:scale-95"
            title="Painel de Administração - Gerenciar Canais"
          >
            <Shield className="w-4 h-4" />
            <span>Painel ADM</span>
          </button>
        </div>

      </div>
    </header>
  );
};
