/* eslint-disable react-hooks/set-state-in-effect */
import { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import Sheet from '../components/Sheet.jsx';
import ExerciseProgress from '../components/ExerciseProgress.jsx';

// Progress overview (chart + personal best) for a single exercise type,
// opened from the info button on an exercise card.
function ExerciseInfoSheet({ type, onClose }) {
  const [status, setStatus] = useState('loading'); // loading | error | ready
  const [progress, setProgress] = useState(null);

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

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  return (
    <Sheet title={type.name} subtitle={type.muscle_group || 'Exercise'} onClose={onClose}>
      <div className="col gap12">
        <ExerciseProgress status={status} progress={progress} onRetry={fetchProgress} />
      </div>
    </Sheet>
  );
}

export default ExerciseInfoSheet;
