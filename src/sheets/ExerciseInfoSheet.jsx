/* eslint-disable react-hooks/set-state-in-effect */
import { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import Sheet from '../components/Sheet.jsx';
import ExerciseProgress from '../components/ExerciseProgress.jsx';
import LastSession from '../components/LastSession.jsx';

// Progress overview (chart + personal best + last session) for a single
// exercise type, opened from the info button on an exercise card.
// `currentWorkoutId` is the workout being logged: its own sets are what you can
// already see on the card, so "last session" skips it and shows the one before.
function ExerciseInfoSheet({ type, currentWorkoutId, onClose }) {
  const [status, setStatus] = useState('loading'); // loading | error | ready
  const [progress, setProgress] = useState(null);

  const fetchProgress = useCallback(async () => {
    setStatus('loading');
    const query = currentWorkoutId != null ? `?exclude_workout_id=${currentWorkoutId}` : '';
    const { data, error } = await api.get(`/dashboard/progress/${type.id}${query}`);
    if (error) {
      setProgress(null);
      setStatus('error');
      return;
    }
    setProgress(data);
    setStatus('ready');
  }, [type.id, currentWorkoutId]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  return (
    <Sheet title={type.name} subtitle={type.muscle_group || 'Exercise'} onClose={onClose}>
      <div className="col gap12">
        <ExerciseProgress status={status} progress={progress} onRetry={fetchProgress} />
        {status === 'ready' && (
          <LastSession
            session={progress?.last_session}
            hasHistory={(progress?.series?.length ?? 0) > 0}
          />
        )}
      </div>
    </Sheet>
  );
}

export default ExerciseInfoSheet;
