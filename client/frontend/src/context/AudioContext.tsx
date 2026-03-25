"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";

interface AudioContextType {
  isPlaying: boolean;
  volume: number;
  isLooping: boolean;
  isBlocked: boolean;
  currentTrack: string;
  setTrack: (track: 'rain' | 'forest') => void;
  togglePlay: () => void;
  setVolume: (volume: number) => void;
  toggleLoop: () => void;
  fadeIn: (duration: number) => void;
  unmute: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(0.5);
  const [isLooping, setIsLooping] = useState(true);
  const [isBlocked, setIsBlocked] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<'rain' | 'forest'>('rain');

  // Singleton Audio Instance
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // SSR Safety: Initialize on client
    if (typeof window !== "undefined") {
      const audio = new Audio(`/audio/${currentTrack}.mp3`);
      audio.loop = isLooping;
      audio.volume = volume;
      audioRef.current = audio;

      // Handle audio ending (if not looping)
      audio.onended = () => setIsPlaying(false);
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
    };
  }, []);

  // ── Media Session (Control Center Integration) ──────────────────
  useEffect(() => {
    if (typeof window !== "undefined" && "mediaSession" in navigator) {
      const trackMetadata: Record<string, { title: string; artist: string }> = {
        rain: { title: "Steady Rain", artist: "DRAGON-STUDIO" },
        forest: { title: "Peaceful Forest", artist: "AudioPapkin" },
      };

      const info = trackMetadata[currentTrack] || { title: "Focus Track", artist: "Knowledge Vault" };

      navigator.mediaSession.metadata = new MediaMetadata({
        title: info.title,
        artist: info.artist,
        album: "Knowledge Vault",
        artwork: [
          { src: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
        ],
      });

      const handlers = [
        ['play', togglePlay],
        ['pause', togglePlay],
        ['previoustrack', () => setTrack(currentTrack === 'rain' ? 'forest' : 'rain')],
        ['nexttrack', () => setTrack(currentTrack === 'rain' ? 'forest' : 'rain')],
        ['seekbackward', (details: any) => {
          if (audioRef.current) audioRef.current.currentTime -= (details.seekOffset || 10);
        }],
        ['seekforward', (details: any) => {
          if (audioRef.current) audioRef.current.currentTime += (details.seekOffset || 10);
        }],
      ];

      for (const [action, handler] of handlers) {
        try {
          navigator.mediaSession.setActionHandler(action as any, handler as any);
        } catch (error) {
          console.log(`Media session action "${action}" not supported.`);
        }
      }
    }
  }, [currentTrack, isPlaying]);

  useEffect(() => {
    if (typeof window !== "undefined" && "mediaSession" in navigator) {
      navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";
    }
  }, [isPlaying]);

  const togglePlay = async () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
        setIsBlocked(false);
      } catch (error) {
        console.error("Playback blocked by browser:", error);
        setIsBlocked(true);
      }
    }
  };

  const setVolume = (newVolume: number) => {
    const v = Math.min(1, Math.max(0, newVolume));
    setVolumeState(v);
    if (audioRef.current) {
      audioRef.current.volume = v;
    }
  };

  const toggleLoop = () => {
    const nextLoop = !isLooping;
    setIsLooping(nextLoop);
    if (audioRef.current) {
      audioRef.current.loop = nextLoop;
    }
  };

  const fadeIn = (duration: number) => {
    if (!audioRef.current) return;

    // Clear any existing fade
    if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);

    const targetVolume = volume || 0.5;
    const startVolume = 0;
    const stepTime = 50; // ms
    const totalSteps = duration / stepTime;
    const volumeStep = targetVolume / totalSteps;

    let currentVolume = startVolume;
    audioRef.current.volume = currentVolume;

    // Attempt play
    audioRef.current.play().then(() => {
      setIsPlaying(true);
      setIsBlocked(false);

      fadeIntervalRef.current = setInterval(() => {
        currentVolume += volumeStep;
        if (currentVolume >= targetVolume) {
          currentVolume = targetVolume;
          if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
        }
        if (audioRef.current) {
          audioRef.current.volume = currentVolume;
        }
      }, stepTime);
    }).catch(err => {
      console.error("Fade-in failed due to blocking:", err);
      setIsBlocked(true);
    });
  };

  const unmute = () => {
    if (audioRef.current) {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
        setIsBlocked(false);
      });
    }
  };

  const setTrack = (track: 'rain' | 'forest') => {
    if (!audioRef.current) return;

    const wasPlaying = isPlaying;
    if (wasPlaying) audioRef.current.pause();

    setCurrentTrack(track);
    audioRef.current.src = `/audio/${track}.mp3`;
    audioRef.current.load();

    if (wasPlaying) {
      audioRef.current.play().catch(e => {
        console.error("Playback failed after track change:", e);
        setIsBlocked(true);
      });
    }
  };

  return (
    <AudioContext.Provider
      value={{
        isPlaying,
        volume,
        isLooping,
        isBlocked,
        currentTrack,
        togglePlay,
        setVolume,
        toggleLoop,
        fadeIn,
        unmute,
        setTrack,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error("useAudio must be used within an AudioProvider");
  }
  return context;
};
