import { fmtRelative } from '../lib/format.js';
import Button from './Button.jsx';
import Icon from './Icon.jsx';

const fmtNum = (v) => v.toLocaleString();

// Read-only replay of every set logged for one exercise type in a single past
// workout.
function SessionCard({ session, label }) {
  const { sets } = session;
  const totalReps = sets.reduce((sum, s) => sum + s.reps, 0);
  const volume = sets.reduce((sum, s) => sum + (s.weight != null ? s.reps * s.weight : 0), 0);
  const heaviest = sets.reduce((max, s) => (s.weight != null && s.weight > max ? s.weight : max), 0);

  return (
    <div className="chart-card sess-card">
      <div className="row between" style={{ marginBottom: 10 }}>
        <div style={{ minWidth: 0 }}>
          <div className="chart-head-label">{label}</div>
          <div className="sess-name">{session.workout_name}</div>
        </div>
        <span className="sess-when">{fmtRelative(session.date)}</span>
      </div>

      <div className="set-log set-log-static">
        <div className="set-log-row set-log-head">
          <span>Set</span>
          <span>Reps</span>
          <span>Weight</span>
        </div>
        {sets.map((s, i) => (
          <div key={i} className="set-log-row">
            <span className="set-no">{i + 1}</span>
            <span>
              <span className="set-val tnum">{s.reps}</span>
            </span>
            <span>
              {s.weight != null ? (
                <>
                  <span className="set-val tnum">{fmtNum(s.weight)}</span>{' '}
                  <span className="set-unit">kg</span>
                </>
              ) : (
                <span className="set-unit">Bodyweight</span>
              )}
            </span>
          </div>
        ))}
      </div>

      <div className="sess-foot">
        <div className="sess-stat">
          <span className="sess-stat-val tnum">{sets.length}</span>
          <span className="sess-stat-label">{sets.length === 1 ? 'set' : 'sets'}</span>
        </div>
        <div className="sess-stat">
          <span className="sess-stat-val tnum">{fmtNum(totalReps)}</span>
          <span className="sess-stat-label">total reps</span>
        </div>
        {volume > 0 && (
          <div className="sess-stat">
            <span className="sess-stat-val tnum">{fmtNum(Math.round(volume))}</span>
            <span className="sess-stat-label">kg volume</span>
          </div>
        )}
        {heaviest > 0 && (
          <div className="sess-stat">
            <span className="sess-stat-val tnum">{fmtNum(heaviest)}</span>
            <span className="sess-stat-label">kg top set</span>
          </div>
        )}
      </div>
    </div>
  );
}

// Past sessions of one exercise type, newest first, paged with "Load more".
// Rendered under the chart in the exercise info sheet. `hasHistory` tells the
// two empty cases apart: with sets on the chart but no session to show, the
// only workout with this exercise is the current one.
function SessionHistory({ status, sessions, hasNext, loadingMore, onLoadMore, onRetry, hasHistory }) {
  if (status === 'loading') {
    return <div className="chart-card skeleton" style={{ minHeight: 160 }} aria-busy="true" />;
  }
  if (status === 'error') {
    return (
      <div className="chart-card" style={{ textAlign: 'center' }}>
        <div className="muted" style={{ fontSize: 14, marginBottom: 10 }}>
          Couldn’t load past sessions.
        </div>
        <Button onClick={onRetry}>
          <Icon name="repeat" size={16} /> Retry
        </Button>
      </div>
    );
  }
  if (status !== 'ready') return null;

  if (sessions.length === 0) {
    if (!hasHistory) return null;
    return (
      <div className="chart-card sess-card">
        <div className="chart-head-label">Last session</div>
        <div className="muted" style={{ fontSize: 14, marginTop: 6 }}>
          First time logging this exercise — nothing to compare against yet.
        </div>
      </div>
    );
  }

  return (
    <>
      {sessions.map((session, i) => (
        <SessionCard
          key={session.workout_id}
          session={session}
          label={i === 0 ? 'Last session' : 'Earlier session'}
        />
      ))}
      {hasNext && (
        <Button
          variant="soft"
          onClick={onLoadMore}
          disabled={loadingMore}
          style={{ width: '100%' }}
        >
          {loadingMore ? 'Loading…' : 'Load more sessions'}
        </Button>
      )}
    </>
  );
}

export default SessionHistory;
