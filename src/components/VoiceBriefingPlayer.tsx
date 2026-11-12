import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Play, Pause, RotateCcw, FastForward, Radio, Sparkles } from 'lucide-react';

interface VoiceBriefingPlayerProps {
  title?: string;
  briefingText: string;
  pair?: string;
}

export const VoiceBriefingPlayer: React.FC<VoiceBriefingPlayerProps> = ({
  title = 'Institutional Daily FX Audio Briefing',
  briefingText,
  pair = 'EUR/USD',
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1.0);
  const [hasSpeechSupport, setHasSpeechSupport] = useState<boolean>(true);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && !('speechSynthesis' in window)) {
      setHasSpeechSupport(false);
    }

    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const cleanTextForSpeech = (raw: string) => {
    return raw
      .replace(/[#*`_\[\]()]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const startPlayback = () => {
    if (!hasSpeechSupport || !briefingText) return;

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
      startTimer();
      return;
    }

    window.speechSynthesis.cancel();
    const clean = cleanTextForSpeech(briefingText);
    const utterance = new SpeechSynthesisUtterance(clean);

    utterance.rate = speed;
    utterance.pitch = 1.0;

    // Pick natural English voice if available
    const voices = window.speechSynthesis.getVoices();
    const selectedVoice =
      voices.find((v) => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel'))) ||
      voices.find((v) => v.lang.startsWith('en')) ||
      voices[0];

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
      if (timerRef.current) clearInterval(timerRef.current);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
      if (timerRef.current) clearInterval(timerRef.current);
    };

    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
    setIsPaused(false);
    setElapsedSeconds(0);
    startTimer();
  };

  const pausePlayback = () => {
    if (!hasSpeechSupport) return;
    window.speechSynthesis.pause();
    setIsPlaying(false);
    setIsPaused(true);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const stopPlayback = () => {
    if (!hasSpeechSupport) return;
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setElapsedSeconds(0);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
  };

  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(newSpeed);
    if (isPlaying) {
      stopPlayback();
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-3.5 rounded-xl bg-gradient-to-r from-blue-900/30 to-indigo-900/20 border border-blue-500/30 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      {/* Title & Status */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0">
          <Radio className={`w-5 h-5 ${isPlaying ? 'animate-pulse text-blue-300' : ''}`} />
        </div>

        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-900 dark:text-white">{title}</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-blue-500/20 text-blue-400 uppercase">
              {pair}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5 font-mono">
            <span>{isPlaying ? 'Playing Audio' : isPaused ? 'Paused' : 'Ready to listen'}</span>
            <span>·</span>
            <span>{formatTime(elapsedSeconds)}</span>
          </div>
        </div>
      </div>

      {/* Audio Waveform Bars (animated when playing) */}
      <div className="hidden md:flex items-center gap-1 h-6 px-2">
        {[40, 75, 55, 90, 60, 30, 85, 45, 95, 70, 50, 80].map((h, i) => (
          <div
            key={i}
            className={`w-1 rounded-full transition-all duration-300 ${
              isPlaying
                ? 'bg-blue-400 animate-pulse'
                : 'bg-slate-300 dark:bg-slate-700'
            }`}
            style={{
              height: isPlaying ? `${Math.max(20, (h * (Math.sin(elapsedSeconds + i) + 1.2)) / 2)}%` : '25%',
              animationDelay: `${i * 100}ms`,
            }}
          />
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        {/* Speed Selector */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-900/80 p-0.5 rounded-lg border border-slate-200 dark:border-slate-800 text-[11px] font-mono">
          {[1.0, 1.25, 1.5].map((s) => (
            <button
              key={s}
              onClick={() => handleSpeedChange(s)}
              className={`px-1.5 py-0.5 rounded ${
                speed === s
                  ? 'bg-blue-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>

        {/* Play / Pause Button */}
        {isPlaying ? (
          <button
            onClick={pausePlayback}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-500 rounded-lg shadow-xs transition-colors"
          >
            <Pause className="w-3.5 h-3.5" />
            <span>Pause</span>
          </button>
        ) : (
          <button
            onClick={startPlayback}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-xs transition-colors"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isPaused ? 'Resume' : 'Listen Now'}</span>
          </button>
        )}

        {(isPlaying || isPaused) && (
          <button
            onClick={stopPlayback}
            title="Stop Audio"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
