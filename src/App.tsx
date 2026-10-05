import React, { useEffect, useState, useMemo, useRef } from 'react';
import {
  fetchAllChannels,
  getFavoriteIds,
  toggleFavorite,
  getRecentWatchedIds,
  addRecentWatched,
} from './services/supabaseClient';
import { Channel } from './types/channel';
import { Navbar } from './components/Navbar';
import { VideoPlayer } from './components/VideoPlayer';
import { CategoryNav } from './components/CategoryNav';
import { HeroBanner } from './components/HeroBanner';
import { ChannelCard } from './components/ChannelCard';
import { CategoryRow } from './components/CategoryRow';
import { AdminModal } from './components/AdminModal';
import { Footer } from './components/Footer';
import {
  LayoutGrid,
  Rows,
  Sparkles,
  Flame,
  Radio,
  Tv,
  Heart,
  History,
  RotateCcw,
  Film
} from 'lucide-react';

export default function App() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('TODOS');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recentWatched, setRecentWatched] = useState<string[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState<boolean>(false);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'rows' | 'grid'>('rows');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const playerSectionRef = useRef<HTMLDivElement>(null);
  const categoriesSectionRef = useRef<HTMLDivElement>(null);

  // Initial Data Load
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const loadedChannels = await fetchAllChannels();
        setChannels(loadedChannels);

        // Pick initial channel: prefer TV GLOBO or first active channel
        const defaultChannel =
          loadedChannels.find(c => c.name.toUpperCase().includes('GLOBO') && c.active) ||
          loadedChannels.find(c => c.active) ||
          loadedChannels[0] ||
          null;

        setSelectedChannel(defaultChannel);
      } catch (err) {
        console.error('Error loading channels:', err);
      } finally {
        setIsLoading(false);
      }

      setFavorites(getFavoriteIds());
      setRecentWatched(getRecentWatchedIds());
    }

    loadData();
  }, []);

  // Distinct Categories
  const categories = useMemo(() => {
    const cats = Array.from(new Set(channels.map(c => c.category?.trim().toUpperCase()).filter(Boolean)));
    // Custom sort: common ones first
    const priority = ['FILMES', 'FILMES ONLINE', 'SERIES VIP', 'TV ABERTA', 'ESPORTE', 'JORNALISMO', 'ANIMES', 'INFANTIL'];
    return cats.sort((a, b) => {
      const idxA = priority.indexOf(a);
      const idxB = priority.indexOf(b);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.localeCompare(b);
    });
  }, [channels]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    channels.forEach(ch => {
      const cat = ch.category?.trim().toUpperCase();
      if (cat) {
        counts[cat] = (counts[cat] || 0) + 1;
      }
    });
    return counts;
  }, [channels]);

  // Handle Channel Selection
  const handleSelectChannel = (channel: Channel) => {
    setSelectedChannel(channel);
    addRecentWatched(channel.id);
    setRecentWatched(getRecentWatchedIds());

    // Smooth scroll to player on mobile or if below view
    if (playerSectionRef.current) {
      playerSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  // Channel navigation
  const handleNextChannel = () => {
    if (!selectedChannel || channels.length === 0) return;
    const currentIndex = channels.findIndex(c => c.id === selectedChannel.id);
    const nextIndex = (currentIndex + 1) % channels.length;
    handleSelectChannel(channels[nextIndex]);
  };

  const handlePrevChannel = () => {
    if (!selectedChannel || channels.length === 0) return;
    const currentIndex = channels.findIndex(c => c.id === selectedChannel.id);
    const prevIndex = (currentIndex - 1 + channels.length) % channels.length;
    handleSelectChannel(channels[prevIndex]);
  };

  // Toggle Favorite
  const handleToggleFavorite = (channelId: string) => {
    const updated = toggleFavorite(channelId);
    setFavorites(updated);
  };

  // Handle Category click from player or badges
  const handleSelectCategory = (cat: string) => {
    const formattedCat = cat.trim().toUpperCase();
    setSelectedCategory(formattedCat);
    setShowFavoritesOnly(false);
    setSearchQuery('');
    setTimeout(() => {
      categoriesSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  // Filtered Channels for Grid / Search / Category
  const filteredChannels = useMemo(() => {
    return channels.filter(channel => {
      if (!channel.active && !isAdminOpen) return false;

      // Favorites only filter
      if (showFavoritesOnly && !favorites.includes(channel.id)) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = channel.name.toLowerCase().includes(query);
        const matchesCat = channel.category?.toLowerCase().includes(query);
        if (!matchesName && !matchesCat) return false;
      }

      // Selected category filter
      if (selectedCategory !== 'TODOS' && channel.category?.toUpperCase() !== selectedCategory) {
        return false;
      }

      return true;
    });
  }, [channels, searchQuery, selectedCategory, showFavoritesOnly, favorites, isAdminOpen]);

  // Recently watched channels list
  const recentWatchedChannels = useMemo(() => {
    return recentWatched
      .map(id => channels.find(c => c.id === id))
      .filter((c): c is Channel => Boolean(c));
  }, [recentWatched, channels]);

  // Channels grouped by category for Row View
  const channelsByCategory = useMemo(() => {
    const map: Record<string, Channel[]> = {};
    categories.forEach(cat => {
      map[cat] = channels.filter(c => c.category?.toUpperCase() === cat && c.active);
    });
    return map;
  }, [channels, categories]);

  // The 3 channels already watched (or defaults to fill 3 slots)
  const top3WatchedChannels = useMemo(() => {
    const watched = recentWatched
      .map(id => channels.find(c => c.id === id))
      .filter((c): c is Channel => Boolean(c));

    const combined = [...watched];
    for (const ch of channels) {
      if (combined.length >= 3) break;
      if (ch.active && !combined.some(c => c.id === ch.id)) {
        combined.push(ch);
      }
    }
    return combined.slice(0, 3);
  }, [recentWatched, channels]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-red-600 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onSelectCategory={cat => {
          setSelectedCategory(cat);
          setShowFavoritesOnly(false);
        }}
        favoritesCount={favorites.length}
        totalChannels={channels.length}
        onOpenAdmin={() => setIsAdminOpen(true)}
        showFavoritesOnly={showFavoritesOnly}
        onToggleShowFavorites={() => {
          setShowFavoritesOnly(prev => !prev);
          setSelectedCategory('TODOS');
        }}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 pt-3 sm:pt-6">
        
        {/* Loading Skeleton */}
        {isLoading && (
          <div className="space-y-6 animate-pulse py-8">
            <div className="w-full aspect-video max-w-5xl mx-auto bg-zinc-900 rounded-3xl" />
            <div className="h-10 bg-zinc-900 rounded-xl w-full" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="aspect-video bg-zinc-900 rounded-2xl" />
              ))}
            </div>
          </div>
        )}

        {!isLoading && (
          <>
            {/* Player Section with Ambient Cinematic Backlight */}
            <div ref={playerSectionRef} className="pt-2 pb-8">
              <VideoPlayer
                channel={selectedChannel}
                onNextChannel={handleNextChannel}
                onPrevChannel={handlePrevChannel}
                isFavorite={selectedChannel ? favorites.includes(selectedChannel.id) : false}
                onToggleFavorite={handleToggleFavorite}
                onSelectCategory={handleSelectCategory}
              />
            </div>

            {/* The 3 channels already watched window */}
            {!searchQuery && selectedCategory === 'TODOS' && !showFavoritesOnly && top3WatchedChannels.length > 0 && (
              <HeroBanner
                channels={top3WatchedChannels}
                currentPlayingId={selectedChannel?.id}
                onPlayChannel={handleSelectChannel}
                favorites={favorites}
                onToggleFavorite={handleToggleFavorite}
                onSelectCategory={handleSelectCategory}
              />
            )}

            {/* Category Navigation Bar */}
            <div ref={categoriesSectionRef} className="sticky top-18 z-30 py-3 bg-zinc-950/95 backdrop-blur-md border-y border-zinc-900/80 mb-6 scroll-mt-20">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
                <div className="flex-1 w-full min-w-0">
                  <CategoryNav
                    categories={categories}
                    selectedCategory={selectedCategory}
                    onSelectCategory={cat => {
                      setSelectedCategory(cat);
                      setShowFavoritesOnly(false);
                    }}
                    categoryCounts={categoryCounts}
                    totalCount={channels.length}
                  />
                </div>

                {/* View Mode Toggle: Rows (Netflix style) vs Grid */}
                <div className="hidden sm:flex items-center gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800 shrink-0 self-end lg:self-center">
                  <button
                    onClick={() => setViewMode('rows')}
                    className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                      viewMode === 'rows'
                        ? 'bg-red-600 text-white shadow-xs'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                    title="Visualização em Trilhos (Carrossel)"
                  >
                    <Rows className="w-4 h-4" />
                    <span className="hidden md:inline">Trilhos</span>
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                      viewMode === 'grid'
                        ? 'bg-red-600 text-white shadow-xs'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                    title="Visualização em Grade Completa"
                  >
                    <LayoutGrid className="w-4 h-4" />
                    <span className="hidden md:inline">Grade</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Search or Favorites Filter Active Banner */}
            {(searchQuery || showFavoritesOnly || selectedCategory !== 'TODOS') && (
              <div className="flex items-center justify-between mb-6 px-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    {showFavoritesOnly ? (
                      <>
                        <Heart className="w-5 h-5 text-red-500 fill-current" />
                        Meus Canais Favoritos
                      </>
                    ) : searchQuery ? (
                      <>Resultados para "{searchQuery}"</>
                    ) : (
                      <>Categoria: {selectedCategory}</>
                    )}
                  </h3>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300 font-semibold border border-zinc-700">
                    {filteredChannels.length} canais
                  </span>
                </div>

                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('TODOS');
                    setShowFavoritesOnly(false);
                  }}
                  className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 font-semibold"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Limpar Filtros
                </button>
              </div>
            )}

            {/* RECENTLY WATCHED ROW (Shown when browsing default mode) */}
            {!searchQuery && selectedCategory === 'TODOS' && !showFavoritesOnly && recentWatchedChannels.length > 0 && (
              <CategoryRow
                title="Assistidos Recentemente"
                channels={recentWatchedChannels}
                selectedChannelId={selectedChannel?.id || null}
                onSelectChannel={handleSelectChannel}
                favorites={favorites}
                onToggleFavorite={handleToggleFavorite}
              />
            )}

            {/* CHANNEL DISPLAY: ROWS VIEW OR GRID VIEW */}
            {viewMode === 'rows' && !searchQuery && selectedCategory === 'TODOS' && !showFavoritesOnly ? (
              <div className="space-y-4">
                {categories.map(cat => (
                  <CategoryRow
                    key={cat}
                    title={cat}
                    channels={channelsByCategory[cat] || []}
                    selectedChannelId={selectedChannel?.id || null}
                    onSelectChannel={handleSelectChannel}
                    favorites={favorites}
                    onToggleFavorite={handleToggleFavorite}
                    onViewAll={() => setSelectedCategory(cat)}
                  />
                ))}
              </div>
            ) : (
              /* GRID VIEW */
              <div>
                {filteredChannels.length === 0 ? (
                  <div className="py-20 text-center border border-zinc-800 rounded-3xl bg-zinc-900/30 p-8 my-6">
                    <Tv className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
                    <h4 className="text-lg font-bold text-white mb-1">
                      Nenhum canal encontrado
                    </h4>
                    <p className="text-sm text-zinc-400 max-w-md mx-auto mb-6">
                      Não encontramos canais que correspondam à sua pesquisa ou categoria selecionada.
                    </p>
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory('TODOS');
                        setShowFavoritesOnly(false);
                      }}
                      className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl transition-all shadow-md"
                    >
                      Ver Todos os 220 Canais
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 sm:gap-4 my-4 sm:my-6">
                    {filteredChannels.map(channel => (
                      <ChannelCard
                        key={channel.id}
                        channel={channel}
                        isSelected={selectedChannel?.id === channel.id}
                        onSelect={handleSelectChannel}
                        isFavorite={favorites.includes(channel.id)}
                        onToggleFavorite={handleToggleFavorite}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}

      </main>

      {/* Footer */}
      <Footer />

      {/* Admin Management Modal */}
      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        channels={channels}
        categories={categories}
        onChannelsUpdated={updatedList => {
          setChannels(updatedList);
          // If selected channel was modified, keep it synced
          if (selectedChannel) {
            const fresh = updatedList.find(c => c.id === selectedChannel.id);
            if (fresh) setSelectedChannel(fresh);
          }
        }}
      />
    </div>
  );
}
