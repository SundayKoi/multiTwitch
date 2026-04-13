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
  'inline-flex items-center justify-center min-h-9 min-w-9 px-2 rounded-md bg-black/60 backdrop-blur text-neutral-200 hover:bg-black/80 hover:text-white border border-white/10 transition-colors';

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
    <div className="tile-controls absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
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
      <button className={btn} onClick={onToggleHideVideo} title={stream.hideVideo ? 'Show video' : 'Hide video (keep audio)'} aria-label="Hide video">
        {stream.hideVideo ? '👁' : '⦿'}
      </button>
      <button className={btn} onClick={onToggleMute} title={stream.muted ? 'Unmute' : 'Mute'} aria-label="Mute">
        {stream.muted ? '🔇' : '🔊'}
      </button>
      <button className={btn} onClick={onToggleMinimize} title={stream.minimized ? 'Restore' : 'Minimize'} aria-label="Minimize">
        {stream.minimized ? '▢' : '—'}
      </button>
      <button
        className={btn + ' hover:!bg-red-600/80 hover:!border-red-400/40 hover:!text-white'}
        onClick={onClose}
        title="Close"
        aria-label="Close"
      >
        ✕
      </button>
    </div>
  );
}
