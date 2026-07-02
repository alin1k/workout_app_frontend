import Icon from './Icon.jsx';
import Button from './Button.jsx';
import ProgressChart from './ProgressChart.jsx';

const unitLabel = (unit) => (unit === 'kg' ? 'kg' : 'reps');
const fmtNum = (v) => v.toLocaleString();
const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });

// Chart card + personal-best callout for one exercise type. Shared by the
// dashboard and the exercise info sheet.
function ExerciseProgress({ status, progress, onRetry }) {
  if (status === 'loading') {
    return <div className="chart-card skeleton" style={{ minHeight: 220 }} aria-busy="true" />;
  }
  if (status === 'error') {
    return (
      <div className="chart-card" style={{ textAlign: 'center' }}>
        <div className="muted" style={{ fontSize: 14, marginBottom: 10 }}>
          Couldn’t load this exercise.
        </div>
        <Button onClick={onRetry}>
          <Icon name="repeat" size={16} /> Retry
        </Button>
      </div>
    );
  }
  if (status !== 'ready' || !progress) return null;

  const { series, unit, pr } = progress;
  if (series.length === 0) {
    return (
      <div className="chart-card" style={{ textAlign: 'center' }}>
        <div className="muted" style={{ fontSize: 14, padding: '8px 0' }}>
          No sets logged for this exercise yet.
        </div>
      </div>
    );
  }

  const latest = series[series.length - 1].value;
  const heaviest = Math.max(...series.map((s) => s.value));
  const suffix = unit === 'kg' ? 'kg' : ' reps';

  let delta = null;
  if (series.length >= 2) {
    const diff = latest - series[series.length - 2].value;
    if (diff === 0) {
      delta = { cls: 'flat', icon: null, text: 'No change' };
    } else {
      const up = diff > 0;
      delta = {
        cls: up ? 'up' : 'down',
        icon: <Icon name={up ? 'chevronUp' : 'chevronDown'} size={14} />,
        text: `${up ? '+' : '-'}${fmtNum(Math.abs(diff))}${suffix}`,
      };
    }
  }

  return (
    <>
      <div className="chart-card chart-card-hero">
        <div className="chart-head">
          <div>
            <div className="chart-head-label">Heaviest set</div>
            <div className="chart-head-val">
              {fmtNum(heaviest)}
              <span className="chart-head-unit">{unitLabel(unit)}</span>
            </div>
          </div>
          {delta && (
            <div className={`chart-delta ${delta.cls}`}>
              {delta.icon}
              {delta.text}
              <span className="chart-delta-tag">vs last</span>
            </div>
          )}
        </div>
        <ProgressChart series={series} pr={pr} />
      </div>

      {pr && (
        <div className="pr-callout pr-callout-wide">
          <div className="pr-medal">
            <Icon name="award" size={22} />
          </div>
          <div className="pr-body">
            <div className="pr-label">Personal best</div>
            <div className="pr-value">
              {fmtNum(pr.value)}
              <span className="pr-unit">{unitLabel(unit)}</span>
            </div>
          </div>
          <div className="pr-date">
            <div className="pr-date-label">Set on</div>
            <div className="pr-date-val">{fmtDate(pr.date)}</div>
          </div>
        </div>
      )}
    </>
  );
}

export default ExerciseProgress;
