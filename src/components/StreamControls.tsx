import type { Stream } from '../types';

type Props = {
  stream: Stream;
  onToggleMute: () => void;
  onToggleMinimize: () => void;
  onToggleHideVideo: () => void;
  onClose: () => void;
  onFocus?: () => void;
  onPip?: () => void;
};

const btn =
  'shrink-0 inline-flex items-center justify-center h-7 w-7 rounded-md text-neutral-300 ' +
  'hover:text-white hover:bg-white/10 transition-colors text-sm leading-none';

// Rendered inline inside the tile's control bar — never overlapping the
// video. Twitch pauses embeds that are obscured by other page elements.
export default function StreamControls({
  stream,
  onToggleMute,
  onToggleMinimize,
  onToggleHideVideo,
  onClose,
  onFocus,
  onPip,
}: Props) {
  return (
    <div className="shrink-0 flex items-center gap-0.5">
      {onFocus && (
        <button className={btn} onClick={onFocus} title="Focus this stream" aria-label="Focus">
          ◎
        </button>
      )}
      {onPip && (
        <button className={btn} onClick={onPip} title="Picture-in-picture" aria-label="PiP">
          ⧉
        </button>
      )}
      <button
        className={btn}
        onClick={onToggleHideVideo}
        title={stream.hideVideo ? 'Show video' : 'Hide video (keep audio)'}
        aria-label="Hide video"
      >
        {stream.hideVideo ? '👁' : '⦿'}
      </button>
      <button
        className={btn}
        onClick={onToggleMute}
        title={stream.muted ? 'Unmute' : 'Mute'}
        aria-label="Mute"
      >
        {stream.muted ? '🔇' : '🔊'}
      </button>
      <button
        className={btn}
        onClick={onToggleMinimize}
        title={stream.minimized ? 'Restore' : 'Minimize'}
        aria-label="Minimize"
      >
        {stream.minimized ? '▢' : '—'}
      </button>
      <button
        className={btn + ' hover:!bg-red-600/80 hover:!text-white'}
        onClick={onClose}
        title="Close"
        aria-label="Close"
      >
        ✕
      </button>
    </div>
  );
}
