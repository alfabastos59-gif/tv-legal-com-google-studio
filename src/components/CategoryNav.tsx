import React, { useRef, useState, useEffect } from 'react';
import {
  Film,
  Sparkles,
  History,
  Clapperboard,
  Tv,
  Newspaper,
  Trophy,
  Smile,
  Flame,
  Music,
  Clock,
  Layers,
  Globe,
  Ghost,
  Compass,
  PlaySquare,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface CategoryNavProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  categoryCounts: Record<string, number>;
  totalCount: number;
}

// Map category names to icons
const getCategoryIcon = (category: string) => {
  const cat = category.toUpperCase();
  if (cat === 'TODOS') return <Compass className="w-4 h-4" />;
  if (cat.includes('FILMES ONLINE')) return <Clapperboard className="w-4 h-4" />;
  if (cat.includes('FILMES')) return <Film className="w-4 h-4" />;
  if (cat.includes('SERIES VIP')) return <Sparkles className="w-4 h-4" />;
  if (cat.includes('SERIES ANTIGAS') || cat.includes('RETRO')) return <History className="w-4 h-4" />;
  if (cat.includes('TV ABERTA')) return <Tv className="w-4 h-4" />;
  if (cat.includes('JORNALISMO')) return <Newspaper className="w-4 h-4" />;
  if (cat.includes('ESPORTE')) return <Trophy className="w-4 h-4" />;
  if (cat.includes('INFANTIL')) return <Smile className="w-4 h-4" />;
  if (cat.includes('ANIMES')) return <Flame className="w-4 h-4" />;
  if (cat.includes('MUSICA')) return <Music className="w-4 h-4" />;
  if (cat.includes('RUN TIME')) return <Clock className="w-4 h-4" />;
  if (cat.includes('VARIEDADES')) return <Layers className="w-4 h-4" />;
  if (cat.includes('IMPORTADOS')) return <Globe className="w-4 h-4" />;
  if (cat.includes('HALLOI')) return <Ghost className="w-4 h-4" />;
  return <PlaySquare className="w-4 h-4" />;
};

export const CategoryNav: React.FC<CategoryNavProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  categoryCounts,
  totalCount,
}) => {
  const allCategories = ['TODOS', ...categories];
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [canScrollLeft, setCanScrollLeft] = useState<boolean>(false);
  const [canScrollRight, setCanScrollRight] = useState<boolean>(true);

  // Update scrollbar progress and arrow states when container scrolls
  const handleScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    if (maxScroll > 0) {
      const progress = Math.min(100, Math.max(0, (el.scrollLeft / maxScroll) * 100));
      setScrollProgress(progress);
      setCanScrollLeft(el.scrollLeft > 5);
      setCanScrollRight(el.scrollLeft < maxScroll - 5);
    } else {
      setScrollProgress(0);
      setCanScrollLeft(false);
      setCanScrollRight(false);
    }
  };

  useEffect(() => {
    handleScroll();
    const handleResize = () => handleScroll();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [allCategories.length]);

  // Scroll with arrows
  const scrollByAmount = (offset: number) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  // Dragging / scrubbing the custom scrollbar
  const handleScrollBarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setScrollProgress(val);
    const el = scrollContainerRef.current;
    if (el) {
      const maxScroll = el.scrollWidth - el.clientWidth;
      el.scrollLeft = (val / 100) * maxScroll;
    }
  };

  return (
    <div className="w-full flex flex-col gap-2.5">
      {/* Category Buttons Carousel Container */}
      <div className="relative group/nav flex items-center">
        {/* Left Arrow Button */}
        <button
          onClick={() => scrollByAmount(-280)}
          disabled={!canScrollLeft}
          className={`shrink-0 mr-1.5 p-2 rounded-xl bg-zinc-900 border border-zinc-700/80 text-white shadow-md transition-all ${
            canScrollLeft
              ? 'hover:bg-red-600 hover:border-red-500 cursor-pointer active:scale-95'
              : 'opacity-25 cursor-not-allowed'
          }`}
          title="Rolar categorias para esquerda"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Scrollable Category Buttons Row */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-x-auto scrollbar-none py-1 scroll-smooth"
        >
          <div className="flex items-center gap-2 min-w-max px-0.5">
            {allCategories.map(cat => {
              const isSelected = selectedCategory === cat;
              const count = cat === 'TODOS' ? totalCount : categoryCounts[cat] || 0;

              return (
                <button
                  key={cat}
                  onClick={() => onSelectCategory(cat)}
                  className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 border whitespace-nowrap cursor-pointer ${
                    isSelected
                      ? 'bg-red-600 text-white border-red-500 shadow-lg shadow-red-600/30 scale-102 glow-red ring-1 ring-red-400'
                      : 'bg-zinc-900/90 text-zinc-300 border-zinc-800 hover:text-white hover:bg-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <span className={isSelected ? 'text-white' : 'text-zinc-400'}>
                    {getCategoryIcon(cat)}
                  </span>
                  <span>{cat}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-extrabold ${
                      isSelected ? 'bg-red-900 text-white' : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Arrow Button */}
        <button
          onClick={() => scrollByAmount(280)}
          disabled={!canScrollRight}
          className={`shrink-0 ml-1.5 p-2 rounded-xl bg-zinc-900 border border-zinc-700/80 text-white shadow-md transition-all ${
            canScrollRight
              ? 'hover:bg-red-600 hover:border-red-500 cursor-pointer active:scale-95'
              : 'opacity-25 cursor-not-allowed'
          }`}
          title="Rolar categorias para direita"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* BARRINHA DE ROLAGEM DEDICADA (Matching the Reference Image) */}
      <div className="w-full px-1 pt-0.5">
        <div className="relative h-4 sm:h-5 w-full rounded-full bg-gradient-to-b from-zinc-700 via-zinc-800 to-zinc-900 p-0.5 border-2 border-zinc-600 shadow-[inset_0_2px_4px_rgba(0,0,0,0.9),0_1px_3px_rgba(255,255,255,0.15)] flex items-center">
          
          {/* Inner Groove Channel */}
          <div className="relative w-full h-full rounded-full bg-zinc-950 overflow-hidden flex items-center shadow-inner">
            {/* Filled Progress Segment with Warm Amber/Orange/Red Gradient */}
            <div
              className="h-full bg-gradient-to-r from-red-600 via-orange-500 to-amber-400 rounded-full transition-all duration-75 shadow-[0_0_8px_rgba(245,158,11,0.7)]"
              style={{ width: `${Math.max(4, scrollProgress)}%` }}
            />

            {/* Glowing Circular Sphere Knob / Thumb */}
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 pointer-events-none transition-all duration-75 z-10"
              style={{ left: `${Math.max(3, Math.min(97, scrollProgress))}%` }}
            >
              <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-gradient-to-b from-amber-300 via-amber-500 to-orange-600 border border-amber-200 shadow-[0_0_8px_rgba(245,158,11,0.9),0_2px_4px_rgba(0,0,0,0.8)] ring-1 ring-amber-400/60" />
            </div>
          </div>

          {/* Interactive Range Input Overlay for Dragging on Mobile & Desktop */}
          <input
            type="range"
            min={0}
            max={100}
            step={0.5}
            value={scrollProgress}
            onChange={handleScrollBarChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
            title="Arraste a barrinha de rolagem para navegar pelas categorias"
          />
        </div>
      </div>
    </div>
  );
};
