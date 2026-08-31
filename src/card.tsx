import { Tab } from './types';
import { host } from './utils';

export function Card({
  tab,
  selected,
  onClick,
}: {
  tab: Tab;
  selected: boolean;
  onClick?: () => void;
}) {
  return (
    <article
      className={`better-tabs-card better-tabs-result${selected ? ' better-tabs-card-selected' : ''}`}
      role='option'
      aria-selected={selected}
      aria-label={`${tab.title}, ${host(tab.url)}`}
      onClick={onClick}
    >
      <div className='better-tabs-meta'>
        {tab.favIconUrl ? (
          <img className='better-tabs-favicon' src={tab.favIconUrl} alt='' />
        ) : (
          <span className='better-tabs-favicon-fallback' aria-hidden='true'>
            {(tab.title || 'N').slice(0, 1).toUpperCase()}
          </span>
        )}
        <div className='better-tabs-text'>
          <strong>{tab.title || 'New tab'}</strong>
          <small>{host(tab.url)}</small>
        </div>
        <span className='better-tabs-state'>{tab.status === 'loading' ? 'Loading' : ''}</span>
      </div>
    </article>
  );
}
