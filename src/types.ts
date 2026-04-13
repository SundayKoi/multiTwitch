export type Layout = 'grid' | 'focus' | 'theater';

export type Stream = {
  id: string;
  username: string;
  minimized: boolean;
  muted: boolean;
  hideVideo: boolean;
};

export type AppState = {
  streams: Stream[];
  focusedId: string | null;
  layout: Layout;
  chatVisible: boolean;
  chatUsername: string | null;
  focusSplit: number; // percent width of focus pane (60-85)
};
