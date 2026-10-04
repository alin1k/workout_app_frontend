import { useEffect, useMemo, useRef, useState } from 'react';
import { fmtDay } from '../lib/format.js';

const WEEKS = 53;
const LEVELS = [0, 1, 2, 3, 4];
// Rows run Sunday → Saturday; only every other one is labelled, GitHub-style.
const WEEKDAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

// Local calendar day, so a late-evening workout lands on the day the user
// actually trained rather than on its UTC date.
function dayKey(d) {
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function plural(n, word) {
  return `${n} ${word}${n !== 1 ? 's' : ''}`;
}

function buildGrid(sessions) {
  const byDay = new Map();
  for (const s of sessions) {
    const key = dayKey(new Date(s.date));
    const day = byDay.get(key) ?? { workouts: 0, sets: 0 };
    day.workouts += 1;
    day.sets += s.sets;
    byDay.set(key, day);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  // Sunday of the current week, then back to the first column.
  const start = new Date(today);
  start.setDate(start.getDate() - start.getDay() - (WEEKS - 1) * 7);

  const days = [];
  for (let i = 0; i < WEEKS * 7; i += 1) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    if (date > today) break;
    days.push({ date, week: Math.floor(i / 7), weekday: i % 7, ...byDay.get(dayKey(date)) });
  }

  // Shade relative to the user's own busiest day, in four steps.
  const maxSets = Math.max(1, ...days.map((d) => d.sets ?? 0));
  let workouts = 0;
  for (const d of days) {
    d.level = d.workouts ? Math.max(1, Math.ceil((d.sets / maxSets) * 4)) : 0;
    workouts += d.workouts ?? 0;
  }

  // A month is labelled on the first column that starts in it. The leading
  // label is dropped when the next month begins too soon for both to fit.
  const months = [];
  for (let week = 0; week < WEEKS; week += 1) {
    const first = days[week * 7];
    if (!first) break;
    const prev = week > 0 ? days[(week - 1) * 7] : null;
    if (!prev || prev.date.getMonth() !== first.date.getMonth()) {
      months.push({ week, label: first.date.toLocaleDateString(undefined, { month: 'short' }) });
    }
  }
  if (months.length > 1 && months[1].week - months[0].week < 3) months.shift();

  return { days, months, workouts };
}

function describe(day) {
  const when = fmtDay(day.date);
  if (!day.workouts) return `No workouts on ${when}`;
  return `${plural(day.workouts, 'workout')} · ${plural(day.sets, 'set')} on ${when}`;
}

function ActivityGrid({ sessions }) {
  const { days, months, workouts } = useMemo(() => buildGrid(sessions), [sessions]);
  const [selected, setSelected] = useState(null);
  const scrollRef = useRef(null);

  // A year doesn't fit a phone: start scrolled to the most recent weeks.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollLeft = el.scrollWidth;
  }, []);

  const summary = `${plural(workouts, 'workout')} in the last year`;

  return (
    <div className="card act-card">
      <div className="act-head">
        <div className="label">Activity</div>
        <span className="act-legend" aria-hidden="true">
          Less
          {LEVELS.map((level) => (
            <span key={level} className={`act-cell act-l${level}`} />
          ))}
          More
        </span>
      </div>

      <div className="act-body">
        <div className="act-weekdays" aria-hidden="true">
          {WEEKDAY_LABELS.map((label, i) => (
            <span key={i} style={{ gridRow: i + 2 }}>{label}</span>
          ))}
        </div>
        <div className="act-scroll" ref={scrollRef}>
          <div className="act-grid" role="img" aria-label={`Activity grid: ${summary}`}>
            {months.map((m) => (
              <span key={m.week} className="act-month" style={{ gridColumn: m.week + 1 }}>
                {m.label}
              </span>
            ))}
            {days.map((d) => (
              <span
                key={d.week * 7 + d.weekday}
                className={
                  `act-cell act-l${d.level}` + (selected?.date === d.date ? ' is-on' : '')
                }
                style={{ gridColumn: d.week + 1, gridRow: d.weekday + 2 }}
                title={describe(d)}
                onClick={() => setSelected(selected?.date === d.date ? null : d)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Doubles as the tooltip on touch screens, where `title` never shows. */}
      <div className="act-foot">{selected ? describe(selected) : summary}</div>
    </div>
  );
}

export default ActivityGrid;
