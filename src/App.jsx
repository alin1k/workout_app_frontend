import { AppProvider, useApp } from './context/AppContext.jsx';
import StageBackdrop from './components/StageBackdrop.jsx';
import AppBar from './components/AppBar.jsx';
import Button from './components/Button.jsx';
import IconButton from './components/IconButton.jsx';
import Toast from './components/Toast.jsx';
import Confirm from './components/Confirm.jsx';
import MuscleBadge from './components/MuscleBadge.jsx';

function ContextSmokeTest() {
  const {
    workouts,
    types,
    typeById,
    toast,
    confirm,
    flash,
    createWorkout,
    addExercise,
    addSet,
    removeSet,
    moveExercise,
    askDeleteWorkout,
    askRemoveExercise,
    closeConfirm,
  } = useApp();

  return (
    <>
      <AppBar title="Context smoke test" subtitle="Phase 5" />
      <div className="scroll">
        <div className="page col gap12">

          <div className="row wrap gap8">
            <Button onClick={() => createWorkout({ name: 'Test ' + (workouts.length + 1), performedAt: new Date().toISOString(), notes: '' })}>
              Create workout
            </Button>
            <Button variant="soft" onClick={() => flash('Hello toast', 'leaf')}>Flash toast</Button>
          </div>

          <div className="muted" style={{ fontSize: 13 }}>
            {workouts.length} workout{workouts.length !== 1 ? 's' : ''} · {types.length} types in catalog
          </div>

          {workouts.map((w) => (
            <div key={w.id} className="card card-pad col gap10">
              <div className="row between">
                <div>
                  <div className="h-md" style={{ fontFamily: 'var(--font-display)' }}>{w.name}</div>
                  <div className="muted" style={{ fontSize: 12.5 }}>
                    {w.exercises.length} ex · {w.exercises.reduce((n, e) => n + e.sets.length, 0)} sets
                  </div>
                </div>
                <div className="row" style={{ gap: 0 }}>
                  <IconButton name="plus" label="Add exercise" onClick={() => addExercise(w.id, types[Math.floor(Math.random() * types.length)])} />
                  <IconButton name="trash" label="Delete workout" onClick={() => askDeleteWorkout(w)} />
                </div>
              </div>

              {w.exercises.map((ex, i) => {
                const type = typeById[ex.typeId];
                return (
                  <div key={ex.id} className="row gap8" style={{ alignItems: 'center' }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, width: 22 }}>{i + 1}.</span>
                    <span style={{ flex: 1 }}>{type ? type.name : '?'}</span>
                    {type?.muscle && <MuscleBadge muscle={type.muscle} outline />}
                    <span className="muted" style={{ fontSize: 12.5, minWidth: 60, textAlign: 'right' }}>{ex.sets.length} sets</span>
                    <IconButton name="chevronUp" label="Up" disabled={i === 0} onClick={() => moveExercise(w.id, ex.id, -1)} />
                    <IconButton name="chevronDown" label="Down" disabled={i === w.exercises.length - 1} onClick={() => moveExercise(w.id, ex.id, 1)} />
                    <IconButton name="plus" label="Add set" onClick={() => addSet(w.id, ex.id, { reps: 8, weight: 50 })} />
                    {ex.sets.length > 0 && (
                      <IconButton name="check" label="Remove last set" onClick={() => removeSet(w.id, ex.id, ex.sets[ex.sets.length - 1].id)} />
                    )}
                    <IconButton name="trash" label="Remove exercise" onClick={() => askRemoveExercise(w.id, ex)} />
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {confirm && <Confirm {...confirm} onCancel={closeConfirm} />}
      <Toast message={toast?.message} icon={toast?.icon} />
    </>
  );
}

function App() {
  return (
    <AppProvider>
      <div className="stage">
        <StageBackdrop />
        <div className="app-root">
          <ContextSmokeTest />
        </div>
      </div>
    </AppProvider>
  );
}

export default App;
