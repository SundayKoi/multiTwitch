export {};

type TwitchPlayerApi = {
  setMuted(m: boolean): void;
  getMuted(): boolean;
  setVolume(v: number): void;
  play(): void;
  pause(): void;
};

type TwitchEmbedInstance = {
  getPlayer(): TwitchPlayerApi;
  addEventListener(event: string, cb: () => void): void;
  destroy?: () => void;
};

type TwitchEmbedOptions = {
  width: string | number;
  height: string | number;
  channel: string;
  parent?: string[];
  muted?: boolean;
  autoplay?: boolean;
  layout?: 'video' | 'video-with-chat';
  theme?: 'light' | 'dark';
};

declare global {
  interface Window {
    Twitch?: {
      Embed: {
        new (target: string | HTMLElement, options: TwitchEmbedOptions): TwitchEmbedInstance;
        VIDEO_READY: string;
        VIDEO_PLAY: string;
      };
    };
  }
}
