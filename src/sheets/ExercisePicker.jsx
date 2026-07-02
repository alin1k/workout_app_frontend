import { useEffect, useRef, useState } from 'react';
import Icon from '../components/Icon.jsx';
import Button from '../components/Button.jsx';
import Sheet from '../components/Sheet.jsx';
import MuscleBadge from '../components/MuscleBadge.jsx';
import NewTypeForm from './NewTypeForm.jsx';

const SEARCH_DEBOUNCE_MS = 300;

function ExercisePicker({
  types,
  muscleGroups,
  typesStatus,
  typesError,
  typesHasNext,
  typesLoadingMore,
  fetchTypes,
  loadMoreTypes,
  searchTypes,
  onPick,
  onCreateType,
  onClose,
}) {
  const [q, setQ] = useState('');
  const [group, setGroup] = useState(null);
  const [creating, setCreating] = useState(false);

  // Server-side search results, owned by the picker. The cached catalog
  // pages (`types`) keep serving the default no-filter view.
  const [results, setResults] = useState([]);
  const [searchStatus, setSearchStatus] = useState('idle');
  const [searchError, setSearchError] = useState(null);
  const [searchHasNext, setSearchHasNext] = useState(false);
  const [searchLoadingMore, setSearchLoadingMore] = useState(false);
  const [retryTick, setRetryTick] = useState(0);

  const query = q.trim();
  const searching = !!query || !!group;

  // Monotonic request id — responses that arrive after a newer request
  // started are dropped instead of clobbering fresher results.
  const reqRef = useRef(0);

  useEffect(() => {
    if (!searching) {
      reqRef.current++;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setResults([]);
      setSearchStatus('idle');
      setSearchError(null);
      setSearchLoadingMore(false);
      return;
    }
    const id = ++reqRef.current;
    setSearchStatus('loading');
    setSearchError(null);
    setSearchLoadingMore(false);
    // Debounce typing; a chip tap with an empty query fires immediately.
    const timer = setTimeout(async () => {
      const { data, error } = await searchTypes({
        q: query,
        muscleGroup: group,
        offset: 0,
      });
      if (id !== reqRef.current) return;
      if (error) {
        setSearchError(error);
        setSearchStatus('error');
        return;
      }
      setResults(data?.data || []);
      setSearchHasNext(!!data?.pagination?.has_next);
      setSearchStatus('ready');
    }, query ? SEARCH_DEBOUNCE_MS : 0);
    return () => clearTimeout(timer);
  }, [query, group, searching, searchTypes, retryTick]);

  const loadMoreSearch = async () => {
    const id = ++reqRef.current;
    setSearchLoadingMore(true);
    const { data, error } = await searchTypes({
      q: query,
      muscleGroup: group,
      offset: results.length,
    });
    if (id !== reqRef.current) return;
    setSearchLoadingMore(false);
    if (error) return; // keep the list; the button stays available to retry
    setResults((rs) => [...rs, ...(data?.data || [])]);
    setSearchHasNext(!!data?.pagination?.has_next);
  };

  const shown = searching ? results : types;
  const isLoading = searching
    ? searchStatus === 'loading'
    : typesStatus === 'loading' && types.length === 0;
  const isError = searching ? searchStatus === 'error' : typesStatus === 'error';
  const errorObj = searching ? searchError : typesError;
  const onRetry = searching ? () => setRetryTick((n) => n + 1) : fetchTypes;
  const hasNext = searching ? searchHasNext : typesHasNext;
  const loadingMore = searching ? searchLoadingMore : typesLoadingMore;
  const onLoadMore = searching ? loadMoreSearch : loadMoreTypes;

  const exactExists = shown.some(
    (t) => t.name.toLowerCase() === query.toLowerCase()
  );
  const existsName = (n) =>
    types.find((t) => t.name.trim().toLowerCase() === n.trim().toLowerCase());

  // Only a broken default catalog makes the input useless; a failed search
  // must stay editable so the user can change the query.
  const inputDisabled = !searching && isError;

  return (
    <Sheet
      title={creating ? 'New movement' : 'Add exercise'}
      subtitle={creating ? 'Add to the catalog' : 'Pick from the catalog'}
      onClose={onClose}
    >
      {creating ? (
        <NewTypeForm
          presetName={q.trim()}
          existsName={existsName}
          onCancel={() => setCreating(false)}
          onCreate={async (data, existing) => {
            if (existing) {
              onPick(existing);
              return;
            }
            return await onCreateType(data);
          }}
        />
      ) : (
        <div className="col gap14">
          <div
            className="row gap8"
            style={{
              background: 'var(--surface)',
              border: '1.5px solid var(--border)',
              borderRadius: 'calc(var(--radius)*0.7 + 2px)',
              padding: '0 12px',
              opacity: inputDisabled ? 0.55 : 1,
            }}
          >
            <span style={{ color: 'var(--text-muted)' }}>
              <Icon name="search" size={18} />
            </span>
            <input
              className="input"
              style={{
                border: 'none',
                padding: '12px 0',
                background: 'transparent',
                boxShadow: 'none',
              }}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={group ? `Search in ${group}…` : 'Search movements…'}
              disabled={inputDisabled}
            />
          </div>

          {muscleGroups.length > 0 && (
            <div
              className="row gap8"
              style={{ overflowX: 'auto', flexWrap: 'nowrap', paddingBottom: 2 }}
              role="group"
              aria-label="Filter by muscle group"
            >
              {muscleGroups.map((g) => {
                const selected = group === g;
                return (
                  <button
                    key={g}
                    className={'chip' + (selected ? '' : ' chip-outline')}
                    style={{
                      cursor: 'pointer',
                      flex: '0 0 auto',
                      fontFamily: 'inherit',
                      border: selected ? '1px solid transparent' : undefined,
                    }}
                    aria-pressed={selected}
                    onClick={() => setGroup((cur) => (cur === g ? null : g))}
                  >
                    {g}
                  </button>
                );
              })}
            </div>
          )}

          {isLoading ? (
            <div
              className="col gap8"
              aria-busy="true"
              aria-label={searching ? 'Searching' : 'Loading catalog'}
            >
              {[0, 1, 2].map((i) => (
                <div key={i} className="pick skeleton" style={{ minHeight: 54 }} />
              ))}
            </div>
          ) : isError ? (
            <div className="empty fade-in" style={{ padding: '14px 8px', gap: 12 }}>
              <div>
                <div className="h-md" style={{ marginBottom: 4 }}>
                  {searching ? 'Search failed' : 'Couldn’t load catalog'}
                </div>
                <div className="muted" style={{ fontSize: 13.5, lineHeight: 1.5, maxWidth: 260 }}>
                  {errorObj?.message || 'Try again in a moment.'}
                </div>
              </div>
              <Button variant="soft" onClick={onRetry}>
                <Icon name="repeat" size={16} /> Retry
              </Button>
            </div>
          ) : !searching && types.length === 0 ? (
            <div className="empty" style={{ padding: '20px 10px' }}>
              <div className="muted" style={{ fontSize: 14.5 }}>
                Your catalog is empty.<br />Add the first movement below.
              </div>
            </div>
          ) : (
            <div className="col gap8">
              {shown.map((t) => (
                <button key={t.id} className="pick" onClick={() => onPick(t)}>
                  <span style={{ color: 'var(--accent)', flex: '0 0 auto' }}>
                    <Icon name="dumbbell" size={18} />
                  </span>
                  <span className="col" style={{ flex: 1, minWidth: 0, gap: 1 }}>
                    <span style={{ fontWeight: 700, fontSize: 15 }}>{t.name}</span>
                    {t.description && (
                      <span
                        className="muted"
                        style={{
                          fontSize: 12.5,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {t.description}
                      </span>
                    )}
                  </span>
                  {t.muscle_group && <MuscleBadge muscle={t.muscle_group} outline />}
                  <span style={{ color: 'var(--text-muted)' }}>
                    <Icon name="plus" size={18} />
                  </span>
                </button>
              ))}
              {searching && shown.length === 0 && (
                <div
                  className="muted fade-in"
                  style={{ fontSize: 14, padding: '8px 2px', textAlign: 'center' }}
                >
                  {query
                    ? `No movement matches “${query}”${group ? ` in ${group}` : ''}.`
                    : `No movements for “${group}” yet.`}
                </div>
              )}
              {hasNext && (
                <Button
                  variant="soft"
                  onClick={onLoadMore}
                  disabled={loadingMore}
                  style={{ marginTop: 2 }}
                >
                  {loadingMore ? 'Loading…' : 'Load more'}
                </Button>
              )}
            </div>
          )}

          {!isError && (
            <button
              className="pick"
              style={{
                borderStyle: 'dashed',
                justifyContent: 'center',
                color: 'var(--primary-deep)',
                fontWeight: 700,
              }}
              onClick={() => setCreating(true)}
            >
              <Icon name="plus" size={18} />{' '}
              {query && !exactExists ? `Add “${query}” as new movement` : 'Add new movement'}
            </button>
          )}
        </div>
      )}
    </Sheet>
  );
}

export default ExercisePicker;
