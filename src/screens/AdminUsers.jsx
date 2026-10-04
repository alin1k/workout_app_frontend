import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api.js';
import { fmtDay, fmtRelative } from '../lib/format.js';
import Icon from '../components/Icon.jsx';
import Button from '../components/Button.jsx';
import UserAvatar from '../components/UserAvatar.jsx';

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;

// Read-only directory. State is local rather than in AppContext: nothing
// outside /admin consumes it, and AppProvider wraps every authenticated
// route, so a fetch declared there would run (and 403) for non-admins.
function AdminUsers() {
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [users, setUsers] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [retryTick, setRetryTick] = useState(0);

  // Monotonic request id — a slow response for an older query never
  // clobbers a fresher one. Same guard ExercisePicker uses.
  const reqRef = useRef(0);
  const query = q.trim();

  useEffect(() => {
    const id = ++reqRef.current;
    // Debounce typing; the initial load fires immediately. The status flip
    // lives inside the callback, so the previous results stay on screen
    // while you're still typing instead of flashing a skeleton per keystroke.
    const timer = setTimeout(async () => {
      setStatus('loading');
      setError(null);
      const params = new URLSearchParams({ limit: PAGE_SIZE, offset: 0 });
      if (query) params.set('q', query);
      const { data, error: err } = await api.get(`/admin/users?${params}`);
      if (id !== reqRef.current) return;
      if (err) {
        setError(err);
        setStatus('error');
        return;
      }
      setUsers(data?.data || []);
      setHasNext(!!data?.pagination?.has_next);
      setTotal(data?.pagination?.total ?? 0);
      setStatus('ready');
    }, query ? SEARCH_DEBOUNCE_MS : 0);
    return () => clearTimeout(timer);
  }, [query, retryTick]);

  const loadMore = async () => {
    const id = ++reqRef.current;
    setLoadingMore(true);
    const params = new URLSearchParams({ limit: PAGE_SIZE, offset: users.length });
    if (query) params.set('q', query);
    const { data, error: err } = await api.get(`/admin/users?${params}`);
    if (id !== reqRef.current) return;
    setLoadingMore(false);
    if (err) return; // keep the list; the button stays available to retry
    setUsers((us) => [...us, ...(data?.data || [])]);
    setHasNext(!!data?.pagination?.has_next);
  };

  const isInitialLoading = status === 'loading' && users.length === 0;
  const isError = status === 'error';
  // A mid-session demotion leaves RequireAdmin looking at a stale user, so
  // the 403 only shows up here. Say something useful instead of "retry".
  const isForbidden = isError && error?.status === 403;

  return (
    <div className="scroll">
      <div className="page page-dash">
        <div className="row between" style={{ marginBottom: 14 }}>
          <div className="display-xl">Users</div>
          {status === 'ready' && (
            <span className="chip chip-outline">
              {total} account{total !== 1 ? 's' : ''}
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
            placeholder="Search by username…"
            aria-label="Search users"
          />
        </div>

        {isInitialLoading ? (
          <div className="col gap12" aria-busy="true" aria-label="Loading users">
            {[0, 1, 2].map((i) => (
              <div key={i} className="card skeleton" style={{ height: 74 }} />
            ))}
          </div>
        ) : isForbidden ? (
          <div className="empty fade-in" style={{ marginTop: 30 }}>
            <div className="h-md">You no longer have admin access</div>
            <div className="muted" style={{ fontSize: 14.5, lineHeight: 1.55, maxWidth: 280 }}>
              {error?.message || 'Your account is not an administrator.'}
            </div>
            <Button variant="soft" onClick={() => navigate('/')}>
              Back to workouts
            </Button>
          </div>
        ) : isError ? (
          <div className="empty fade-in" style={{ marginTop: 30 }}>
            <div className="h-md">Couldn’t load users</div>
            <div className="muted" style={{ fontSize: 14.5, lineHeight: 1.55, maxWidth: 280 }}>
              {error?.message || 'Try again in a moment.'}
            </div>
            <Button variant="soft" onClick={() => setRetryTick((n) => n + 1)}>
              <Icon name="repeat" size={16} /> Retry
            </Button>
          </div>
        ) : users.length === 0 ? (
          <div className="empty" style={{ padding: '24px 10px' }}>
            <div className="muted" style={{ fontSize: 14.5 }}>
              {query ? `No account matches “${query}”.` : 'No accounts yet.'}
            </div>
          </div>
        ) : (
          <>
            <div className="col gap12">
              {users.map((u) => (
                <div key={u.id} className="card card-pad row between fade-in">
                  <UserAvatar code={u.avatar_code} />
                  <div className="col gap6 grow">
                    <div className="row gap8">
                      <span className="wcard-title" style={{ fontSize: 16 }}>
                        {u.username}
                      </span>
                      {u.is_admin && <span className="chip">admin</span>}
                    </div>
                    <div className="wcard-meta">
                      <span>
                        <b>{u.workout_count}</b> workout{u.workout_count !== 1 ? 's' : ''}
                      </span>
                      <span className="wcard-dot" />
                      <span>
                        {u.last_activity ? fmtRelative(u.last_activity) : 'never active'}
                      </span>
                    </div>
                    <div className="muted" style={{ fontSize: 12 }}>
                      Joined {fmtDay(u.created_at)}
                    </div>
                  </div>
                  <span className="muted tnum" style={{ fontSize: 12, flex: '0 0 auto' }}>
                    #{u.id}
                  </span>
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
  );
}

export default AdminUsers;
