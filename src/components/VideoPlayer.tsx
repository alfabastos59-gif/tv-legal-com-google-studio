import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RefreshCw,
  Radio,
  Tv,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Settings,
  Expand,
  Shrink,
  PictureInPicture2,
  Heart,
  Share2,
  Check,
  Cast
} from 'lucide-react';
import { Channel } from '../types/channel';
import { CastModal } from './CastModal';

interface VideoPlayerProps {
  channel: Channel | null;
  onNextChannel?: () => void;
  onPrevChannel?: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: (channelId: string) => void;
  onSelectCategory?: (category: string) => void;
  onClose?: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  channel,
  onNextChannel,
  onPrevChannel,
  isFavorite = false,
  onToggleFavorite,
  onSelectCategory,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isTheatreMode, setIsTheatreMode] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showControls, setShowControls] = useState<boolean>(true);
  const [qualityLevels, setQualityLevels] = useState<{ id: number; name: string }[]>([]);
  const [currentLevel, setCurrentLevel] = useState<number>(-1);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [copiedShare, setCopiedShare] = useState<boolean>(false);
  const [isCastModalOpen, setIsCastModalOpen] = useState<boolean>(false);

  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleOpenCast = () => {
    // Proactively attempt native trigger first if supported
    const video = videoRef.current as any;
    if (video && typeof video.webkitShowPlaybackTargetPicker === 'function') {
      try {
        video.webkitShowPlaybackTargetPicker();
      } catch (err) {
        console.warn('AirPlay prompt error:', err);
      }
    } else if (video && video.remote && typeof video.remote.prompt === 'function') {
      try {
        video.remote.prompt().catch((err: any) => console.log('Remote playback prompt:', err));
      } catch (err) {
        console.warn('Remote prompt error:', err);
      }
    }
    setIsCastModalOpen(true);
  };

  // Load stream whenever channel changes
  useEffect(() => {
    if (!channel || !channel.url) return;

    const video = videoRef.current;
    if (!video) return;

    setIsLoading(true);
    setErrorMsg(null);
    setQualityLevels([]);
    setCurrentLevel(-1);

    // Destroy existing hls instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const streamUrl = channel.url.trim();

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
        maxBufferLength: 30,
        maxMaxBufferLength: 60,
      });

      hlsRef.current = hls;
      hls.loadSource(streamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
        setIsLoading(false);
        const levels = data.levels.map((level, idx) => ({
          id: idx,
          name: level.height ? `${level.height}p` : `Qualidade ${idx + 1}`,
        }));
        setQualityLevels(levels);

        video.play().catch(() => {
          // Autoplay policy might require user click or mute
          video.muted = true;
          setIsMuted(true);
          video.play().catch(e => console.warn('Autoplay prevented:', e));
        });
      });

      hls.on(Hls.Events.LEVEL_SWITCHED, (_, data) => {
        setCurrentLevel(data.level);
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.warn('HLS Network Error, attempting recovery...');
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.warn('HLS Media Error, attempting recovery...');
              hls.recoverMediaError();
              break;
            default:
              console.error('Fatal HLS Error:', data);
              setErrorMsg('O sinal desta transmissão está temporariamente indisponível.');
              setIsLoading(false);
              hls.destroy();
              break;
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native Safari support
      video.src = streamUrl;
      video.addEventListener('loadedmetadata', () => {
        setIsLoading(false);
        video.play().catch(() => {
          video.muted = true;
          setIsMuted(true);
          video.play().catch(e => console.warn('Safari autoplay prevented:', e));
        });
      });

      video.addEventListener('error', () => {
        setErrorMsg('Erro ao reproduzir o sinal do canal.');
        setIsLoading(false);
      });
    } else {
      setErrorMsg('Seu navegador não suporta reprodução de fluxos HLS (.m3u8).');
      setIsLoading(false);
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [channel?.id, channel?.url]);

  // Handle Controls Auto-hide
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying && !showSettings) {
        setShowControls(false);
      }
    }, 3500);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when user is typing in input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          togglePlay();
          break;
        case 'KeyF':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'KeyT':
          e.preventDefault();
          setIsTheatreMode(prev => !prev);
          break;
        case 'KeyM':
          e.preventDefault();
          toggleMute();
          break;
        case 'ArrowUp':
          e.preventDefault();
          changeVolume(Math.min(1, volume + 0.1));
          break;
        case 'ArrowDown':
          e.preventDefault();
          changeVolume(Math.max(0, volume - 0.1));
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (onPrevChannel) onPrevChannel();
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (onNextChannel) onNextChannel();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, volume, isMuted, onNextChannel, onPrevChannel]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const changeVolume = (newVol: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = newVol;
    setVolume(newVol);
    if (newVol > 0 && isMuted) {
      video.muted = false;
      setIsMuted(false);
    }
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(err => console.error(err));
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      }).catch(err => console.error(err));
    }
  };

  const togglePiP = async () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (document.pictureInPictureEnabled) {
        await video.requestPictureInPicture();
      }
    } catch (e) {
      console.warn('PiP error:', e);
    }
  };

  const retryStream = () => {
    if (!channel) return;
    setIsLoading(true);
    setErrorMsg(null);
    if (hlsRef.current) {
      hlsRef.current.loadSource(channel.url);
      hlsRef.current.startLoad();
    } else if (videoRef.current) {
      videoRef.current.src = channel.url;
      videoRef.current.play().catch(e => console.warn(e));
    }
  };

  const handleShare = () => {
    if (!channel) return;
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  const setQuality = (lvl: number) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = lvl;
      setCurrentLevel(lvl);
      setShowSettings(false);
    }
  };

  if (!channel) {
    return (
      <div className="w-full aspect-video bg-zinc-950 rounded-2xl flex flex-col items-center justify-center border border-zinc-800 text-zinc-400 p-8 shadow-2xl">
        <Tv className="w-16 h-16 text-zinc-600 mb-4 animate-pulse" />
        <h3 className="text-xl font-semibold text-zinc-200">Nenhum canal selecionado</h3>
        <p className="text-sm text-zinc-500 mt-2 text-center max-w-md">
          Selecione um dos 220 canais disponíveis abaixo na grade para iniciar a transmissão ao vivo.
        </p>
      </div>
    );
  }

  return (
    <div
      className={`relative transition-all duration-500 ease-in-out ${
        isTheatreMode ? 'w-full max-w-7xl mx-auto' : 'w-full max-w-5xl mx-auto'
      }`}
    >
      {/* Cinematic Ambilight Ambient Glow */}
      <div className="absolute -inset-4 bg-gradient-to-r from-red-600/20 via-amber-500/10 to-red-900/25 rounded-3xl blur-2xl -z-10 opacity-70 pointer-events-none" />

      {/* Video Container */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => isPlaying && setShowControls(false)}
        className="group relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.9)] border border-zinc-800/80 select-none"
      >
        {/* HTML5 Video Element */}
        <video
          ref={videoRef}
          className="w-full h-full object-contain cursor-pointer"
          onClick={togglePlay}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          playsInline
        />

        {/* Loading Spinner */}
        {isLoading && !errorMsg && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center z-20 pointer-events-none">
            <div className="w-14 h-14 border-4 border-red-600/30 border-t-red-600 rounded-full animate-spin" />
            <p className="text-xs uppercase tracking-widest text-zinc-300 font-semibold mt-4 animate-pulse">
              Conectando Sinal HD...
            </p>
          </div>
        )}

        {/* Error Fallback */}
        {errorMsg && (
          <div className="absolute inset-0 bg-zinc-950/90 backdrop-blur-md flex flex-col items-center justify-center z-30 p-6 text-center">
            <div className="w-14 h-14 rounded-full bg-red-950/80 border border-red-700/60 flex items-center justify-center text-red-500 mb-3 shadow-lg">
              <Radio className="w-7 h-7 animate-pulse" />
            </div>
            <h4 className="text-lg font-bold text-white mb-1">Sinal Indisponível</h4>
            <p className="text-sm text-zinc-400 max-w-md mb-6">{errorMsg}</p>
            <div className="flex items-center gap-3">
              <button
                onClick={retryStream}
                className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl shadow-lg shadow-red-600/30 transition-all hover:scale-105 active:scale-95"
              >
                <RefreshCw className="w-4 h-4" />
                Tentar Novamente
              </button>
              {onNextChannel && (
                <button
                  onClick={onNextChannel}
                  className="flex items-center gap-2 px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm font-medium rounded-xl transition-all hover:scale-105"
                >
                  Próximo Canal
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Big Center Play/Pause Indicator on Click */}
        {!isPlaying && !isLoading && !errorMsg && (
          <div
            onClick={togglePlay}
            className="absolute inset-0 flex items-center justify-center z-10 bg-black/30 cursor-pointer transition-opacity"
          >
            <div className="w-20 h-20 rounded-full bg-red-600/90 hover:bg-red-600 text-white flex items-center justify-center shadow-2xl glow-red transform hover:scale-110 active:scale-95 transition-all">
              <Play className="w-9 h-9 fill-current ml-1" />
            </div>
          </div>
        )}

        {/* Bottom Control Bar */}
        <div
          className={`absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/95 via-black/70 to-transparent flex flex-col gap-2 z-20 transition-opacity duration-300 ${
            showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <div className="flex items-center justify-between gap-4">
            {/* Left Controls */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Play / Pause */}
              <button
                onClick={togglePlay}
                className="p-2 text-white hover:text-red-500 transition-colors"
                title={isPlaying ? 'Pausar (Espaço)' : 'Reproduzir (Espaço)'}
              >
                {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
              </button>

              {/* Prev / Next Channel */}
              {onPrevChannel && (
                <button
                  onClick={onPrevChannel}
                  className="p-1.5 text-zinc-400 hover:text-white transition-colors"
                  title="Canal Anterior (Seta Esquerda)"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}
              {onNextChannel && (
                <button
                  onClick={onNextChannel}
                  className="p-1.5 text-zinc-400 hover:text-white transition-colors"
                  title="Próximo Canal (Seta Direita)"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}

              {/* Volume & Mute */}
              <div className="flex items-center gap-2 group/vol">
                <button
                  onClick={toggleMute}
                  className="p-2 text-zinc-300 hover:text-white transition-colors"
                  title={isMuted ? 'Desmutar (M)' : 'Mutar (M)'}
                >
                  {isMuted || volume === 0 ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={e => changeVolume(parseFloat(e.target.value))}
                  className="w-16 sm:w-24 accent-red-600 h-1.5 bg-zinc-700 rounded-lg cursor-pointer"
                  title="Volume"
                />
              </div>

              {/* Live Status indicator */}
              <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-emerald-400 pl-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                TRANSMISSÃO ESTÁVEL
              </div>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Quality Settings */}
              {qualityLevels.length > 0 && (
                <div className="relative">
                  <button
                    onClick={() => setShowSettings(prev => !prev)}
                    className="p-2 text-zinc-400 hover:text-white transition-colors flex items-center gap-1 text-xs font-semibold"
                    title="Configurações de Qualidade"
                  >
                    <Settings className="w-5 h-5" />
                    <span className="hidden md:inline">
                      {currentLevel === -1 ? 'AUTO' : qualityLevels[currentLevel]?.name || 'HD'}
                    </span>
                  </button>

                  {/* Quality Dropdown Menu */}
                  {showSettings && (
                    <div className="absolute right-0 bottom-12 w-40 bg-zinc-900/95 backdrop-blur-xl border border-zinc-700/80 rounded-xl p-2 shadow-2xl z-30">
                      <p className="text-[10px] uppercase font-bold text-zinc-400 px-2 py-1">Qualidade do Vídeo</p>
                      <button
                        onClick={() => setQuality(-1)}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          currentLevel === -1
                            ? 'bg-red-600 text-white font-semibold'
                            : 'text-zinc-300 hover:bg-zinc-800'
                        }`}
                      >
                        Automática (Auto)
                      </button>
                      {qualityLevels.map(lvl => (
                        <button
                          key={lvl.id}
                          onClick={() => setQuality(lvl.id)}
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            currentLevel === lvl.id
                              ? 'bg-red-600 text-white font-semibold'
                              : 'text-zinc-300 hover:bg-zinc-800'
                          }`}
                        >
                          {lvl.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Espelhar / Cast button */}
              <button
                onClick={handleOpenCast}
                className="p-2 text-zinc-300 hover:text-amber-400 transition-colors"
                title="Espelhar na TV (Chromecast / AirPlay)"
              >
                <Cast className="w-5 h-5" />
              </button>

              {/* Picture in Picture */}
              <button
                onClick={togglePiP}
                className="p-2 text-zinc-400 hover:text-white transition-colors hidden sm:block"
                title="Picture-in-Picture (Minimizar na tela)"
              >
                <PictureInPicture2 className="w-5 h-5" />
              </button>

              {/* Theatre Mode */}
              <button
                onClick={() => setIsTheatreMode(prev => !prev)}
                className="p-2 text-zinc-400 hover:text-white transition-colors hidden sm:block"
                title={isTheatreMode ? 'Modo Normal (T)' : 'Modo Teatro (T)'}
              >
                {isTheatreMode ? <Shrink className="w-5 h-5" /> : <Expand className="w-5 h-5" />}
              </button>

              {/* Fullscreen */}
              <button
                onClick={toggleFullscreen}
                className="p-2 text-zinc-300 hover:text-white transition-colors"
                title={isFullscreen ? 'Sair da Tela Cheia (F)' : 'Tela Cheia (F)'}
              >
                {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Channel Information Details Under Player */}
      <div className="mt-4 px-2 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {channel.thumbnail ? (
            <img
              src={channel.thumbnail}
              alt={channel.name}
              className="w-14 h-14 rounded-2xl object-cover border border-zinc-800 shadow-md bg-zinc-900 p-1 flex-shrink-0"
              onError={e => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-red-500 font-bold text-lg flex-shrink-0 shadow-md">
              {channel.name.slice(0, 2).toUpperCase()}
            </div>
          )}

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-white tracking-tight">{channel.name}</h3>
              {onSelectCategory ? (
                <button
                  onClick={() => onSelectCategory(channel.category)}
                  className="px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase bg-zinc-800 hover:bg-red-600 hover:text-white hover:border-red-500 text-zinc-300 rounded border border-zinc-700 transition-all active:scale-95 cursor-pointer flex items-center gap-0.5 shadow-xs"
                  title={`Ir para categoria ${channel.category}`}
                >
                  <span>{channel.category}</span>
                  <span className="text-[9px]">↗</span>
                </button>
              ) : (
                <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase bg-zinc-800 text-zinc-300 rounded border border-zinc-700">
                  {channel.category}
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400 mt-1 flex items-center gap-2">
              <span className="text-emerald-400 flex items-center gap-1 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Sinal Ativo
              </span>
              <span>•</span>
              <span>Resolução Adaptativa HLS</span>
              <span>•</span>
              <span className="text-zinc-500">Pressione F para tela cheia</span>
            </p>
          </div>
        </div>

        {/* Quick helper controls under player */}
        <div className="flex items-center gap-2">
          {onToggleFavorite && (
            <button
              onClick={() => onToggleFavorite(channel.id)}
              className={`p-2 rounded-xl border transition-all ${
                isFavorite
                  ? 'bg-red-600/90 border-red-500 text-white'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
              title={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current text-white' : ''}`} />
            </button>
          )}

          <button
            onClick={handleShare}
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
            title="Compartilhar Canal"
          >
            {copiedShare ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
          </button>

          <button
            onClick={handleOpenCast}
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-amber-400 hover:bg-zinc-800 transition-all"
            title="Espelhar Canal na TV"
          >
            <Cast className="w-4 h-4" />
          </button>

          {onPrevChannel && (
            <button
              onClick={onPrevChannel}
              className="px-3 py-1.5 text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-xl border border-zinc-800 flex items-center gap-1.5 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              Anterior
            </button>
          )}
          {onNextChannel && (
            <button
              onClick={onNextChannel}
              className="px-3 py-1.5 text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-xl border border-zinc-800 flex items-center gap-1.5 transition-all"
            >
              Próximo
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Cast & Mirroring Modal */}
      <CastModal
        isOpen={isCastModalOpen}
        onClose={() => setIsCastModalOpen(false)}
        channel={channel}
        videoElement={videoRef.current}
      />
    </div>
  );
};
