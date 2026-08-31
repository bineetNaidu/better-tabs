import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { Card } from './card';
import { Tab } from './types';
import { rankTabs } from './utils';
import { runtimeApi, sendRuntimeMessage } from './tab-controls-api';

export function TabControls() {
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const [undoVisible, setUndoVisible] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const listener = (message: { type: string; tabs?: Tab[] }) => {
      if (message.type === 'better-tabs:launcher' && message.tabs) {
        setTabs(message.tabs);
        setQuery('');
        setSelected(0);
        setOpen(true);
        setUndoVisible(false);
        requestAnimationFrame(() => inputRef.current?.focus());
      }
      if (message.type === 'better-tabs:tabs-updated' && message.tabs) setTabs(message.tabs);
    };
    runtimeApi?.onMessage?.addListener(listener);
    return () => runtimeApi?.onMessage?.removeListener(listener);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setOpen(false);
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [open]);

  const filtered = useMemo(() => rankTabs(tabs, query), [tabs, query]);
  const active = filtered[selected];

  useEffect(
    () => setSelected((current) => Math.min(current, Math.max(filtered.length - 1, 0))),
    [filtered.length],
  );

  useEffect(() => {
    if (!undoVisible) return;
    const timer = window.setTimeout(() => setUndoVisible(false), 5000);
    return () => window.clearTimeout(timer);
  }, [undoVisible]);

  if (!open) return null;

  const activate = (id: number) => {
    void sendRuntimeMessage({ type: 'better-tabs:activate', tabId: id });
    setOpen(false);
  };

  return (
    <section
      id='better-tabs-tab-controls'
      data-mode='tab-controls'
      data-open='true'
      role='dialog'
      aria-modal='true'
      aria-label='TabControls'
      onClick={() => setOpen(false)}
      onWheel={(event) => event.preventDefault()}
      onTouchMove={(event) => event.preventDefault()}
    >
      <div
        className='better-tabs-panel better-tabs-tab-controls-panel'
        onClick={(event) => event.stopPropagation()}
        onWheel={(event) => event.stopPropagation()}
        onTouchMove={(event) => event.stopPropagation()}
      >
        <input
          ref={inputRef}
          className='better-tabs-search'
          autoFocus
          value={query}
          placeholder='Search open tabs…'
          aria-label='Search open tabs'
          onInput={(event) => {
            setQuery((event.currentTarget as HTMLInputElement).value);
            setSelected(0);
          }}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              event.preventDefault();
              setOpen(false);
              return;
            }
            if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
              event.preventDefault();
              if (filtered.length)
                setSelected(
                  (selected + (event.key === 'ArrowDown' ? 1 : -1) + filtered.length) %
                    filtered.length,
                );
            }
            if (event.key === 'Enter' && active) activate(active.id);
            if (event.key === 'Delete' && active) {
              void sendRuntimeMessage({ type: 'better-tabs:close-tab', tabId: active.id });
              setTabs((current) => current.filter((tab) => tab.id !== active.id));
              setUndoVisible(true);
            }
          }}
        />
        <div className='better-tabs-results' role='listbox' aria-label='Open tabs'>
          {filtered.map((tab) => (
            <Card
              key={tab.id}
              tab={tab}
              selected={tab.id === active?.id}
              onClick={() => activate(tab.id)}
            />
          ))}
          {!filtered.length && <div className='better-tabs-empty'>No matching tabs</div>}
        </div>
        {undoVisible && (
          <div className='better-tabs-undo' role='status'>
            Tab closed{' '}
            <button
              type='button'
              onClick={() => {
                void sendRuntimeMessage({ type: 'better-tabs:undo' });
                setUndoVisible(false);
              }}
            >
              Undo
            </button>
          </div>
        )}
        <div className='better-tabs-hint'>
          ↑ ↓ navigate &nbsp; · &nbsp; Enter open &nbsp; · &nbsp; Delete close &nbsp; · &nbsp; Esc
          cancel
        </div>
      </div>
    </section>
  );
}
