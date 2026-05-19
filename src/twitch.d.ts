export {};

type TwitchPlayerInstance = {
  setMuted(muted: boolean): void;
  getMuted(): boolean;
  setVolume(v: number): void;
  play(): void;
  pause(): void;
  addEventListener(event: string, cb: () => void): void;
};

type TwitchPlayerOptions = {
  width: string | number;
  height: string | number;
  channel: string;
  parent?: string[];
  muted?: boolean;
  autoplay?: boolean;
};

declare global {
  interface Window {
    Twitch?: {
      Player: {
        new (
          target: string | HTMLElement,
          options: TwitchPlayerOptions
        ): TwitchPlayerInstance;
        READY: string;
        PLAY: string;
        PAUSE: string;
        ENDED: string;
        ONLINE: string;
        OFFLINE: string;
      };
    };
  }
}
