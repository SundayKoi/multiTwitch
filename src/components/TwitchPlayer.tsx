import { useMemo } from 'react';

type Props = {
  channel: string;
  parent: string;
  muted: boolean;
  hidden: boolean;
};

// A plain player.twitch.tv iframe — the same approach the app originally
// shipped with. The Twitch Embed/Player SDKs pause playback on tab switches
// and mouse hover; the bare iframe does not. Mute is reflected via the URL,
// so toggling mute reloads that one stream (acceptable, and original
// behaviour). The iframe itself persists across layout/focus changes because
// StreamStage keeps each tile mounted and only repositions it.
function embedSrc(channel: string, parent: string, muted: boolean) {
  const q = new URLSearchParams({
    channel,
    parent,
    muted: muted ? 'true' : 'false',
  });
  return `https://player.twitch.tv/?${q.toString()}`;
}

export default function TwitchPlayer({ channel, parent, muted, hidden }: Props) {
  const src = useMemo(() => embedSrc(channel, parent, muted), [channel, parent, muted]);

  return (
    <iframe
      title={`${channel} stream`}
      src={src}
      allow="autoplay; fullscreen; picture-in-picture"
      allowFullScreen
      className={
        'absolute inset-0 w-full h-full border-0 ' +
        (hidden ? 'opacity-0 pointer-events-none' : '')
      }
    />
  );
}
