import { useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { api } from '../lib/api.js';
import Icon from '../components/Icon.jsx';
import Button from '../components/Button.jsx';
import IconButton from '../components/IconButton.jsx';
import MuscleBadge from '../components/MuscleBadge.jsx';
import ExerciseTypeForm from '../sheets/ExerciseTypeForm.jsx';

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;

function AdminExerciseTypes() {
  const { flash, openConfirm, closeConfirm, fetchTypes, fetchMuscleGroups } = useApp();

  const [q, setQ] = useState('');
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [retryTick, setRetryTick] = useState(0);
  // null = closed, 'new' = create, object = edit that type.
  const [editing, setEditing] = useState(null);

  const reqRef = useRef(0);
  const query = q.trim();

  useEffect(() => {
    const id = ++reqRef.current;
    // Status flip lives inside the debounce callback so the current list
    // stays on screen while you type instead of flashing a skeleton.
    const timer = setTimeout(async () => {
      setStatus('loading');
      setError(null);
      const params = new URLSearchParams({ limit: PAGE_SIZE, offset: 0 });
      if (query) params.set('q', query);
      const { data, error: err } = await api.get(`/exercise-types?${params}`);
      if (id !== reqRef.current) return;
      if (err) {
        setError(err);
        setStatus('error');
        return;
      }
      setItems(data?.data || []);
      setHasNext(!!data?.pagination?.has_next);
      setTotal(data?.pagination?.total ?? 0);
      setStatus('ready');
    }, query ? SEARCH_DEBOUNCE_MS : 0);
    return () => clearTimeout(timer);
  }, [query, retryTick]);

  const loadMore = async () => {
    const id = ++reqRef.current;
    setLoadingMore(true);
    const params = new URLSearchParams({ limit: PAGE_SIZE, offset: items.length });
    if (query) params.set('q', query);
    const { data, error: err } = await api.get(`/exercise-types?${params}`);
    if (id !== reqRef.current) return;
    setLoadingMore(false);
    if (err) return;
    setItems((xs) => [...xs, ...(data?.data || [])]);
    setHasNext(!!data?.pagination?.has_next);
  };

  // AppContext holds a paginated prefix of the catalog for ExercisePicker.
  // After a mutation here it's stale — invalidate rather than try to patch
  // it, since this screen's list is independently paged and searched.
  const invalidateCatalog = () => {
    fetchTypes();
    fetchMuscleGroups();
  };

  const onSave = async (data) => {
    const creating = editing === 'new';
    const { data: saved, error: err } = creating
      ? await api.post('/exercise-types', data)
      : await api.patch(`/exercise-types/${editing.id}`, data);

    if (err) return { error: err }; // the form renders it inline

    setItems((xs) =>
      creating
        ? [...xs, saved].sort((a, b) => a.name.localeCompare(b.name))
        : xs.map((x) => (x.id === saved.id ? saved : x))
    );
    if (creating) setTotal((n) => n + 1);
    setEditing(null);
    flash(creating ? 'Movement added' : 'Saved', 'check');
    invalidateCatalog();
    return { error: null };
  };

  const doDelete = async (t) => {
    const { error: err } = await api.del(`/exercise-types/${t.id}`);
    if (err) {
      // The backend answers 409 "exercise type is in use" when a logged
      // workout still references it — surface that, don't swallow it.
      flash(
        err.status === 409
          ? `“${t.name}” is used by logged workouts.`
          : err.message || 'Could not delete movement.',
        'alert'
      );
      return;
    }
    setItems((xs) => xs.filter((x) => x.id !== t.id));
    setTotal((n) => Math.max(0, n - 1));
    flash('Movement deleted', 'trash');
    invalidateCatalog();
  };

  const askDelete = (t) =>
    openConfirm({
      icon: 'trash',
      tone: 'danger',
      title: `Delete “${t.name}”?`,
      body:
        'It will be removed from the catalog. Movements already logged in a workout can’t be deleted.',
      confirmLabel: 'Delete',
      // Confirm doesn't close itself — AppContext's own delete handlers all
      // call setConfirm(null) explicitly. Same contract here.
      onConfirm: async () => {
        closeConfirm();
        await doDelete(t);
      },
    });

  const isInitialLoading = status === 'loading' && items.length === 0;
  const isError = status === 'error';

  return (
    <>
      <div className="scroll">
        <div className="page page-dash">
          <div className="row between" style={{ marginBottom: 14 }}>
            <div className="display-xl">Movements</div>
            {status === 'ready' && (
              <span className="chip chip-outline">
                {total} type{total !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          <div className="search-row" style={{ marginBottom: 14 }}>
            <span style={{ color: 'var(--text-muted)' }}>
              <Icon name="search" size={18} />
            </span>
            <input
              className="input"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search movements…"
              aria-label="Search movements"
            />
          </div>

          {isInitialLoading ? (
            <div className="col gap8" aria-busy="true" aria-label="Loading catalog">
              {[0, 1, 2].map((i) => (
                <div key={i} className="pick skeleton" style={{ minHeight: 54 }} />
              ))}
            </div>
          ) : isError ? (
            <div className="empty fade-in" style={{ marginTop: 30 }}>
              <div className="h-md">Couldn’t load the catalog</div>
              <div className="muted" style={{ fontSize: 14.5, lineHeight: 1.55, maxWidth: 280 }}>
                {error?.message || 'Try again in a moment.'}
              </div>
              <Button variant="soft" onClick={() => setRetryTick((n) => n + 1)}>
                <Icon name="repeat" size={16} /> Retry
              </Button>
            </div>
          ) : items.length === 0 ? (
            <div className="empty" style={{ padding: '24px 10px' }}>
              <div className="muted" style={{ fontSize: 14.5 }}>
                {query ? `No movement matches “${query}”.` : 'The catalog is empty.'}
              </div>
              {!query && (
                <Button onClick={() => setEditing('new')}>
                  <Icon name="plus" size={18} /> Add the first movement
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="col gap8">
                {items.map((t) => (
                  <div key={t.id} className="pick pick-static fade-in">
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
                    <IconButton
                      name="pencil"
                      size={18}
                      label={`Edit ${t.name}`}
                      onClick={() => setEditing(t)}
                    />
                    <IconButton
                      name="trash"
                      size={18}
                      label={`Delete ${t.name}`}
                      onClick={() => askDelete(t)}
                    />
                  </div>
                ))}
              </div>
              {hasNext && (
                <Button
                  variant="soft"
                  onClick={loadMore}
                  disabled={loadingMore}
                  style={{ marginTop: 14, width: '100%' }}
                >
                  {loadingMore ? 'Loading…' : 'Load more'}
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {status === 'ready' && items.length > 0 && (
        <button
          className="fab"
          onClick={() => setEditing('new')}
          aria-label="New movement"
          title="New movement"
        >
          <Icon name="plus" size={26} stroke={2.4} />
        </button>
      )}

      {/* Rendered locally rather than through GlobalOverlays — Sheet draws
          its own scrim and isn't portal-based, so routing admin sheets
          through AppContext would drag admin concerns into it for nothing. */}
      {editing && (
        <ExerciseTypeForm
          initial={editing === 'new' ? null : editing}
          onSave={onSave}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}

export default AdminExerciseTypes;
