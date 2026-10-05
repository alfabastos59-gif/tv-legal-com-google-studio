import React, { useState } from 'react';
import {
  Cast,
  Airplay,
  ExternalLink,
  X,
  Info
} from 'lucide-react';
import { Channel } from '../types/channel';

interface CastModalProps {
  isOpen: boolean;
  onClose: () => void;
  channel: Channel | null;
  videoElement: HTMLVideoElement | null;
}

export const CastModal: React.FC<CastModalProps> = ({
  isOpen,
  onClose,
  channel,
  videoElement,
}) => {
  const [castMessage, setCastMessage] = useState<string | null>(null);

  if (!isOpen || !channel) return null;

  // Trigger Native Chromecast / Remote Playback API
  const handleNativeCast = async () => {
    setCastMessage(null);
    const video = videoElement as any;

    if (video && video.remote && typeof video.remote.prompt === 'function') {
      try {
        await video.remote.prompt();
        setCastMessage('Buscando dispositivos Chromecast / Smart TV próximos...');
        return;
      } catch (err: any) {
        console.log('Remote playback prompt result:', err);
      }
    }

    if (video && typeof video.webkitShowPlaybackTargetPicker === 'function') {
      try {
        video.webkitShowPlaybackTargetPicker();
        setCastMessage('Abrindo seletor AirPlay...');
        return;
      } catch (err) {
        console.warn('AirPlay prompt error:', err);
      }
    }

    // If browser doesn't expose programmatic prompt (security restriction in some browsers)
    setCastMessage('Use a opção de Espelhar Tela (Smart View / AirPlay) nas configurações do seu celular abaixo.');
  };

  // Trigger Apple AirPlay
  const handleAirPlay = () => {
    const video = videoElement as any;
    if (video && typeof video.webkitShowPlaybackTargetPicker === 'function') {
      try {
        video.webkitShowPlaybackTargetPicker();
        setCastMessage('Conectando ao AirPlay...');
      } catch (e) {
        setCastMessage('Abra a Central de Controle do iPhone e selecione "Espelhar Tela".');
      }
    } else {
      setCastMessage('No iPhone, deslize a Central de Controle e toque em "Espelhar Tela".');
    }
  };

  // Open in VLC or External Caster
  const handleOpenVLC = () => {
    if (!channel.url) return;
    // VLC protocol scheme
    const vlcUrl = `vlc://${channel.url}`;
    window.location.href = vlcUrl;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-900/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-red-600/20 text-red-500 border border-red-500/30 flex items-center justify-center glow-red">
              <Cast className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Espelhar na Smart TV
                <span className="text-[10px] bg-red-600 text-white font-extrabold px-1.5 py-0.5 rounded uppercase">
                  Mobile
                </span>
              </h3>
              <p className="text-xs text-zinc-400 truncate max-w-[240px] sm:max-w-xs">
                {channel.name} • {channel.category}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
          
          {/* Status Message */}
          {castMessage && (
            <div className="p-3 rounded-2xl bg-amber-950/60 border border-amber-800/80 text-amber-300 text-xs flex items-center gap-2.5 animate-fade-in">
              <Info className="w-4 h-4 shrink-0 text-amber-400" />
              <span>{castMessage}</span>
            </div>
          )}

          {/* Quick Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Direct Cast Button */}
            <button
              onClick={handleNativeCast}
              className="flex items-center gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white text-left font-semibold shadow-lg shadow-red-900/30 border border-red-500/30 transition-all transform active:scale-98"
            >
              <div className="p-2 rounded-xl bg-black/30 shrink-0">
                <Cast className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-bold leading-tight">Transmitir / Cast</p>
                <p className="text-[11px] text-zinc-200 opacity-90">Chromecast & Android TV</p>
              </div>
            </button>

            {/* Apple AirPlay Button */}
            <button
              onClick={handleAirPlay}
              className="flex items-center gap-3 p-3.5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white text-left font-semibold border border-zinc-700/80 transition-all transform active:scale-98"
            >
              <div className="p-2 rounded-xl bg-zinc-800 shrink-0 text-zinc-200">
                <Airplay className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold leading-tight">Apple AirPlay</p>
                <p className="text-[11px] text-zinc-400">iPhone para Smart TV</p>
              </div>
            </button>
          </div>

          {/* Secondary Action: External Player */}
          <div className="pt-1">
            {/* Open in VLC / Player */}
            <button
              onClick={handleOpenVLC}
              className="w-full flex items-center justify-center gap-2.5 p-3 rounded-2xl bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 text-xs font-medium border border-zinc-800 transition-colors"
            >
              <ExternalLink className="w-4 h-4 text-orange-400 shrink-0" />
              <div className="text-left">
                <span className="font-bold text-white block">Abrir no VLC / App Externo</span>
                <span className="text-[10px] text-zinc-400">Player de vídeo externo do celular</span>
              </div>
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-zinc-900/50 border-t border-zinc-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-zinc-800 hover:bg-zinc-700 text-white transition-colors"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
