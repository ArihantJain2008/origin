import { create } from "zustand";
import { persist } from "zustand/middleware";

import type {
  MusicProviderId,
  MusicTrack,
} from "../types/music";

interface MusicStore {
  provider: MusicProviderId;

  tracks: MusicTrack[];

  currentTrack: MusicTrack | null;

  isPlaying: boolean;

  position: number;

  duration: number;

  volume: number;

  setProvider: (
    provider: MusicProviderId
  ) => void;

  setTracks: (
    tracks: MusicTrack[]
  ) => void;

  setCurrentTrack: (
    track: MusicTrack | null
  ) => void;

  setPlayback: (
    isPlaying: boolean
  ) => void;

  setPosition: (
    position: number
  ) => void;

  setDuration: (
    duration: number
  ) => void;

  setVolume: (
    volume: number
  ) => void;
}

export const useMusicStore =
  create<MusicStore>()(
    persist(
      (set) => ({
        provider: "system",

        tracks: [],

        currentTrack: null,

        isPlaying: false,

        position: 0,

        duration: 0,

        volume: 0.8,

        setProvider: (provider) =>
          set({
            provider,
          }),

        setTracks: (tracks) =>
          set({
            tracks,
          }),

        setCurrentTrack: (
          currentTrack
        ) =>
          set({
            currentTrack,
          }),

        setPlayback: (
          isPlaying
        ) =>
          set({
            isPlaying,
          }),

        setPosition: (
          position
        ) =>
          set({
            position,
          }),

        setDuration: (
          duration
        ) =>
          set({
            duration,
          }),

        setVolume: (volume) =>
          set({
            volume: Math.max(
              0,
              Math.min(1, volume)
            ),
          }),
      }),

      {
        name: "origin-music-settings",
        partialize: (state) => ({
          provider:
            state.provider,
          volume:
            state.volume,
        }),
      }
    )
  );
