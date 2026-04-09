/**
 * Hook de musique de fond du casino.
 * - Boucle en continu (loop = true)
 * - Respecte le toggle son de l'uiStore
 * - Gère le blocage autoplay : relance au premier clic si le navigateur a refusé
 */

import { useEffect, useRef } from 'react';
import { useUIStore } from '@/stores/ui/uiStore';

const MUSIC_SRC = '/casino-music.mp3';
const MUSIC_VOLUME = 0.25;

export function useCasinoMusic(): void {
  const soundEnabled = useUIStore((s) => s.soundEnabled);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const blockedRef = useRef(false); // true si l'autoplay a été bloqué par le navigateur

  // Initialiser l'élément audio une seule fois
  useEffect(() => {
    const audio = new Audio(MUSIC_SRC);
    audio.loop = true;      // boucle native — équivalent du "while" souhaité
    audio.volume = MUSIC_VOLUME;
    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.src = '';
      audioRef.current = null;
    };
  }, []);

  // Jouer / mettre en pause selon soundEnabled
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (soundEnabled) {
      audio.play().then(() => {
        blockedRef.current = false;
      }).catch(() => {
        // Autoplay bloqué par le navigateur (pas encore d'interaction utilisateur)
        blockedRef.current = true;
      });
    } else {
      audio.pause();
    }
  }, [soundEnabled]);

  // Si autoplay bloqué, relancer au premier clic / touche
  useEffect(() => {
    const handleInteraction = () => {
      const audio = audioRef.current;
      if (!audio || !blockedRef.current || !soundEnabled) return;
      audio.play().then(() => {
        blockedRef.current = false;
      }).catch(() => {});
    };

    window.addEventListener('click', handleInteraction, { once: false });
    window.addEventListener('keydown', handleInteraction, { once: false });

    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
    };
  }, [soundEnabled]);
}
