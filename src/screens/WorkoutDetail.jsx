/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { fmtRelative, fmtTime } from '../lib/format.js';
import Icon from '../components/Icon.jsx';
import Button from '../components/Button.jsx';
import IconButton from '../components/IconButton.jsx';
import AppBar from '../components/AppBar.jsx';
import ExerciseCard from './ExerciseCard.jsx';

function WorkoutDetail() {
  const { id: idParam } = useParams();
  const id = parseInt(idParam, 10);
  const navigate = useNavigate();
  const {
    currentWorkout,
    currentWorkoutStatus,
    currentWorkoutError,
    currentNotFound,
    fetchWorkout,
    clearCurrentWorkout,
    openSheet,
    addSet,
    removeSet,
    updateSet,
    moveExercise,
    askDeleteWorkout,
    askRemoveExercise,
  } = useApp();

  const [activeEx, setActiveEx] = useState(null);

  // Fetch on mount / id change, clear on unmount.
  useEffect(() => {
    fetchWorkout(id);
    return () => clearCurrentWorkout();
  }, [id, fetchWorkout, clearCurrentWorkout]);

  // Bounce home if the workout vanishes after we've loaded it (delete path).
  useEffect(() => {
    if (currentWorkoutStatus === 'ready' && !currentWorkout) {
      navigate('/', { replace: true });
    }
  }, [currentWorkoutStatus, currentWorkout, navigate]);

  // Keep the active exercise pinned to the most recently-added one.
  useEffect(() => {
    if (!currentWorkout) return;
    const ex = currentWorkout.exercises;
    if (ex.length === 0) {
      setActiveEx(null);
      return;
    }
    if (!ex.find((e) => e.id === activeEx)) {
      setActiveEx(ex[ex.length - 1].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentWorkout?.exercises.length, currentWorkout?.id]);

  const workout = currentWorkout;
  const isLoading =
    currentWorkoutStatus === 'loading' || currentWorkoutStatus === 'idle';
  const isError = currentWorkoutStatus === 'error' && !currentNotFound;

  return (
    <>
      <AppBar
        onBack={() => navigate('/')}
        subtitle={
          workout
            ? fmtRelative(workout.performed_at || workout.created_at) +
              (workout.performed_at ? ' · ' + fmtTime(workout.performed_at) : '')
            : null
        }
        title={workout?.name}
        right={
          workout ? (
            <div className="row" style={{ gap: 0 }}>
              <IconButton
                name="pencil"
                size={19}
                label="Edit workout"
                onClick={() => openSheet({ kind: 'editWorkout', workoutId: workout.id })}
              />
              <IconButton
                name="trash"
                size={19}
                label="Delete workout"
                onClick={() => askDeleteWorkout(workout)}
              />
            </div>
          ) : null
        }
      />
      <div className="scroll">
        <div className="page" style={{ paddingTop: 14 }}>
          {currentNotFound ? (
            <div className="empty fade-in" style={{ marginTop: 40 }}>
              <div
                style={{
                  width: 76,
                  height: 76,
                  borderRadius: 999,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'var(--accent-soft)',
                  color: 'var(--primary-deep)',
                }}
              >
                <Icon name="alert" size={32} stroke={1.7} />
              </div>
              <div>
                <div className="display-lg" style={{ marginBottom: 6 }}>Workout not found</div>
                <div className="muted" style={{ fontSize: 14.5, lineHeight: 1.55, maxWidth: 280 }}>
                  It may have been deleted. Head back to the list to start a new one.
                </div>
              </div>
              <Button size="lg" onClick={() => navigate('/')} style={{ marginTop: 4 }}>
                <Icon name="back" size={18} /> Back to workouts
              </Button>
            </div>
          ) : isError ? (
            <div className="empty fade-in" style={{ marginTop: 40 }}>
              <div
                style={{
                  width: 76,
                  height: 76,
                  borderRadius: 999,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'var(--accent-soft)',
                  color: 'var(--primary-deep)',
                }}
              >
                <Icon name="alert" size={32} stroke={1.7} />
              </div>
              <div>
                <div className="display-lg" style={{ marginBottom: 6 }}>Couldn’t load workout</div>
                <div className="muted" style={{ fontSize: 14.5, lineHeight: 1.55, maxWidth: 280 }}>
                  {currentWorkoutError?.message || 'Try again in a moment.'}
                </div>
              </div>
              <Button size="lg" onClick={() => fetchWorkout(id)} style={{ marginTop: 4 }}>
                <Icon name="repeat" size={18} /> Retry
              </Button>
            </div>
          ) : isLoading || !workout ? (
            <div aria-busy="true" aria-label="Loading workout">
              <div className="card skeleton" style={{ minHeight: 56, marginBottom: 16 }} />
              <div className="col gap12">
                <div className="card skeleton" style={{ minHeight: 128 }} />
                <div className="card skeleton" style={{ minHeight: 128 }} />
              </div>
            </div>
          ) : (
            <>
              {workout.notes ? (
                <div
                  className="card card-pad fade-in"
                  style={{ marginBottom: 16, display: 'flex', gap: 11, background: 'var(--surface)' }}
                >
                  <span style={{ color: 'var(--accent)', flex: '0 0 auto', marginTop: 1 }}>
                    <Icon name="note" size={18} />
                  </span>
                  <span style={{ fontSize: 14.5, lineHeight: 1.5 }}>{workout.notes}</span>
                </div>
              ) : null}

              {workout.exercises.length === 0 ? (
                <div className="empty fade-in" style={{ marginTop: 30 }}>
                  <div
                    style={{
                      width: 76,
                      height: 76,
                      borderRadius: 999,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'var(--accent-soft)',
                      color: 'var(--primary-deep)',
                    }}
                  >
                    <Icon name="dumbbell" size={32} stroke={1.7} />
                  </div>
                  <div>
                    <div className="display-lg" style={{ marginBottom: 6 }}>Empty session</div>
                    <div className="muted" style={{ fontSize: 15, lineHeight: 1.5, maxWidth: 260 }}>
                      Add your first movement from the catalog to start logging sets.
                    </div>
                  </div>
                </div>
              ) : (
                <div className="col gap12">
                  {workout.exercises.map((ex, i) => (
                    <ExerciseCard
                      key={ex.id}
                      exercise={ex}
                      type={ex.exercise_type}
                      index={i}
                      total={workout.exercises.length}
                      active={activeEx === ex.id}
                      onActivate={() => setActiveEx(ex.id)}
                      onAddSet={(s) => {
                        addSet(workout.id, ex.id, s);
                        setActiveEx(ex.id);
                      }}
                      onRemoveSet={(sid) => removeSet(workout.id, ex.id, sid)}
                      onUpdateSet={(sid, s) => updateSet(workout.id, ex.id, sid, s)}
                      onMove={(d) => moveExercise(workout.id, ex.id, d)}
                      onRemove={() => askRemoveExercise(workout.id, ex)}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
      {workout && (
        <div className="dock">
          <Button
            size="lg"
            className="btn-block"
            onClick={() => openSheet({ kind: 'addExercise', workoutId: workout.id })}
          >
            <Icon name="plus" size={20} /> Add exercise
          </Button>
        </div>
      )}
    </>
  );
}

export default WorkoutDetail;
