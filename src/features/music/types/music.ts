export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  album?: string;
  artwork?: string;
  path?: string;
  duration?: number;
}

export type MusicProviderId =
  | "system";

export interface MusicProviderInfo {
  id: MusicProviderId;
  name: string;
  available: boolean;
}

export interface MusicPlaybackState {
  track: MusicTrack | null;
  isPlaying: boolean;
  position: number;
  duration: number;
}