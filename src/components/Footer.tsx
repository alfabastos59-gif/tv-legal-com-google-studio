import React from 'react';
import { Tv, Radio, Shield, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-zinc-950 border-t border-zinc-900 mt-10 sm:mt-20 py-8 sm:py-12 px-4 sm:px-6 lg:px-8 text-zinc-500">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-5 sm:gap-6">
        
        {/* Brand & info */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-red-600 text-white font-bold shadow-md">
            <Tv className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-white font-extrabold tracking-wider font-cinematic text-sm">
                TV LEGAL 5
              </span>
              <span className="text-[10px] bg-red-600/30 text-red-400 font-bold px-1.5 py-0.5 rounded">
                PRO
              </span>
            </div>
            <p className="text-xs text-zinc-500">
              Plataforma Cinematográfica de Transmissões Ao Vivo
            </p>
          </div>
        </div>

        {/* Shortcuts guide (shown on desktop/tablets) */}
        <div className="hidden sm:flex flex-wrap items-center justify-center gap-3 text-xs text-zinc-400">
          <span className="px-2 py-1 bg-zinc-900 border border-zinc-800 rounded font-mono text-[11px]">
            Espaço
          </span>
          <span className="text-zinc-600">Play/Pause</span>
          <span className="px-2 py-1 bg-zinc-900 border border-zinc-800 rounded font-mono text-[11px]">
            F
          </span>
          <span className="text-zinc-600">Tela Cheia</span>
          <span className="px-2 py-1 bg-zinc-900 border border-zinc-800 rounded font-mono text-[11px]">
            T
          </span>
          <span className="text-zinc-600">Modo Teatro</span>
          <span className="px-2 py-1 bg-zinc-900 border border-zinc-800 rounded font-mono text-[11px]">
            ← / →
          </span>
          <span className="text-zinc-600">Mudar Canal</span>
        </div>

        {/* Right info */}
        <div className="text-xs text-center md:text-right">
          <p>© {new Date().getFullYear()} TV Legal 5. Todos os direitos reservados.</p>
          <p className="text-zinc-600 text-[11px] mt-0.5">
            Transmissão contínua em formato HLS adaptive bitrate.
          </p>
        </div>

      </div>
    </footer>
  );
};
