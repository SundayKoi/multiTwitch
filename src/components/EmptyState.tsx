const EXAMPLES = ['shroud', 'pokimane', 'xqc', 'sodapoppin'];

export default function EmptyState({
  onPick,
  focusInput,
  recent,
}: {
  onPick: (name: string) => void;
  focusInput: () => void;
  recent: string[];
}) {
  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="max-w-lg w-full rounded-2xl border border-white/10 bg-neutral-900/60 p-8 text-center">
        <div
          className="mx-auto mb-4 h-14 w-14 rounded-2xl flex items-center justify-center text-2xl"
          style={{ background: 'rgba(0,229,160,0.15)', border: '1px solid rgba(0,229,160,0.3)' }}
        >
          ◉
        </div>
        <h1 className="text-xl font-semibold tracking-tight mb-1">Watch many streams at once.</h1>
        <p className="text-sm text-neutral-400 mb-5">
          Add a Twitch username to get started. No login, no tracking.
        </p>
        <button
          onClick={focusInput}
          className="mb-4 px-4 py-2 rounded-md text-sm font-medium text-black"
          style={{ background: 'var(--color-accent)' }}
        >
          Add a stream
        </button>
        <div className="mt-2">
          <div className="text-xs uppercase tracking-wider text-neutral-500 mb-2">Try one</div>
          <div className="flex flex-wrap gap-2 justify-center">
            {EXAMPLES.map(name => (
              <button
                key={name}
                onClick={() => onPick(name)}
                className="px-3 py-1.5 rounded-full text-sm bg-white/5 hover:bg-white/10 border border-white/10"
              >
                {name}
              </button>
            ))}
          </div>
        </div>
        {recent.length > 0 && (
          <div className="mt-6">
            <div className="text-xs uppercase tracking-wider text-neutral-500 mb-2">Recent</div>
            <div className="flex flex-wrap gap-2 justify-center">
              {recent.map(name => (
                <button
                  key={name}
                  onClick={() => onPick(name)}
                  className="px-3 py-1.5 rounded-full text-sm bg-white/5 hover:bg-white/10 border border-white/10"
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
