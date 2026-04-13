import type { Stream } from '../types';

type Props = {
  streams: Stream[];
  chatUsername: string | null;
  parent: string;
  onClose: () => void;
  onPick: (username: string) => void;
};

export default function ChatPanel({ streams, chatUsername, parent, onClose, onPick }: Props) {
  const current = chatUsername || streams[0]?.username || null;
  const src = current
    ? `https://www.twitch.tv/embed/${encodeURIComponent(current)}/chat?parent=${encodeURIComponent(parent)}&darkpopout`
    : null;

  return (
    <aside className="w-full lg:w-80 shrink-0 flex flex-col border-l border-white/10 bg-neutral-950">
      <div className="flex items-center gap-2 p-2 border-b border-white/10">
        <select
          value={current || ''}
          onChange={e => onPick(e.target.value)}
          className="flex-1 min-w-0 px-2 py-1.5 rounded-md bg-white/5 border border-white/10 text-sm"
          disabled={streams.length === 0}
        >
          {streams.length === 0 && <option value="">No streams</option>}
          {streams.map(s => (
            <option key={s.id} value={s.username}>{s.username}</option>
          ))}
        </select>
        <button
          className="px-2 py-1.5 rounded-md bg-white/5 border border-white/10 hover:bg-white/10 text-sm"
          onClick={onClose}
          title="Close chat"
        >
          ✕
        </button>
      </div>
      {src ? (
        <iframe
          title="Twitch chat"
          src={src}
          className="flex-1 w-full border-0"
        />
      ) : (
        <div className="flex-1 flex items-center justify-center text-sm text-neutral-500 p-4 text-center">
          Add a stream to see chat.
        </div>
      )}
    </aside>
  );
}
