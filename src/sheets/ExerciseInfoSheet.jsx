/* eslint-disable react-hooks/set-state-in-effect */
import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../lib/api.js';
import Sheet from '../components/Sheet.jsx';
import ExerciseProgress from '../components/ExerciseProgress.jsx';
import SessionHistory from '../components/SessionHistory.jsx';

const SESSIONS_PAGE_SIZE = 3;

// Progress overview (chart + personal best + past sessions) for a single
// exercise type, opened from the info button on an exercise card. The chart and
// the session history come from separate endpoints: the chart needs the whole
// history at once, the sessions are paged.
// `currentWorkoutId` is the workout being logged: its own sets are what you can
// already see on the card, so the history skips it and starts at the one before.
function ExerciseInfoSheet({ type, currentWorkoutId, onClose }) {
  const [status, setStatus] = useState('loading'); // loading | error | ready
  const [progress, setProgress] = useState(null);

  const [sessStatus, setSessStatus] = useState('loading'); // loading | error | ready
  const [sessions, setSessions] = useState([]);
  const [sessHasNext, setSessHasNext] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  // Guards against a stale page landing after a retry / exercise change.
  const sessReqRef = useRef(0);

  const fetchProgress = useCallback(async () => {
    setStatus('loading');
    const { data, error } = await api.get(`/dashboard/progress/${type.id}`);
    if (error) {
      setProgress(null);
      setStatus('error');
      return;
    }
    setProgress(data);
    setStatus('ready');
  }, [type.id]);

  const sessionsUrl = useCallback(
    (offset) => {
      const params = new URLSearchParams({ limit: SESSIONS_PAGE_SIZE, offset });
      if (currentWorkoutId != null) params.set('exclude_workout_id', currentWorkoutId);
      return `/dashboard/progress/${type.id}/sessions?${params}`;
    },
    [type.id, currentWorkoutId]
  );

  const fetchSessions = useCallback(async () => {
    const id = ++sessReqRef.current;
    setSessStatus('loading');
    setLoadingMore(false);
    const { data, error } = await api.get(sessionsUrl(0));
    if (id !== sessReqRef.current) return;
    if (error) {
      setSessions([]);
      setSessHasNext(false);
      setSessStatus('error');
      return;
    }
    setSessions(data?.data || []);
    setSessHasNext(!!data?.pagination?.has_next);
    setSessStatus('ready');
  }, [sessionsUrl]);

  const loadMoreSessions = async () => {
    const id = ++sessReqRef.current;
    setLoadingMore(true);
    const { data, error } = await api.get(sessionsUrl(sessions.length));
    if (id !== sessReqRef.current) return;
    setLoadingMore(false);
    if (error) return;
    setSessions((xs) => [...xs, ...(data?.data || [])]);
    setSessHasNext(!!data?.pagination?.has_next);
  };

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  return (
    <Sheet title={type.name} subtitle={type.muscle_group || 'Exercise'} onClose={onClose}>
      <div className="col gap12">
        <ExerciseProgress status={status} progress={progress} onRetry={fetchProgress} />
        {status === 'ready' && (
          <SessionHistory
            status={sessStatus}
            sessions={sessions}
            hasNext={sessHasNext}
            loadingMore={loadingMore}
            onLoadMore={loadMoreSessions}
            onRetry={fetchSessions}
            hasHistory={(progress?.series?.length ?? 0) > 0}
          />
        )}
      </div>
    </Sheet>
  );
}

export default ExerciseInfoSheet;
