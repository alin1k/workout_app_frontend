export const MUSCLE_GROUPS = ['chest', 'back', 'legs', 'shoulders', 'arms', 'core'];

// Catalog (integer ids matching the backend shape; seed-only, replaced by
// `GET /api/exercise-types` once Task 6 lands).
const TYPE_BENCH  = { id: 1,  name: 'Bench Press',            muscle_group: 'chest',     description: 'Barbell flat bench. Retract scapula, controlled descent.' };
const TYPE_INCDB  = { id: 2,  name: 'Incline Dumbbell Press', muscle_group: 'chest',     description: '' };
const TYPE_SQUAT  = { id: 3,  name: 'Back Squat',             muscle_group: 'legs',      description: 'High-bar. Brace core, knees track over toes.' };
const TYPE_RDL    = { id: 4,  name: 'Romanian Deadlift',      muscle_group: 'legs',      description: 'Hinge at hips, slight knee bend, neutral spine.' };
const TYPE_PULL   = { id: 5,  name: 'Pull-up',                muscle_group: 'back',      description: 'Bodyweight. Full hang to chin over bar.' };
const TYPE_ROW    = { id: 6,  name: 'Barbell Row',            muscle_group: 'back',      description: '' };
const TYPE_OHP    = { id: 7,  name: 'Overhead Press',         muscle_group: 'shoulders', description: '' };
const TYPE_LAT    = { id: 8,  name: 'Lateral Raise',          muscle_group: 'shoulders', description: '' };
const TYPE_CURL   = { id: 9,  name: 'Bicep Curl',             muscle_group: 'arms',      description: '' };
const TYPE_TRI    = { id: 10, name: 'Tricep Pushdown',        muscle_group: 'arms',      description: '' };
const TYPE_PLANK  = { id: 11, name: 'Plank',                  muscle_group: 'core',      description: 'Bodyweight hold. Reps used as seconds.' };

export const SEED_TYPES = [
  TYPE_BENCH, TYPE_INCDB, TYPE_SQUAT, TYPE_RDL, TYPE_PULL, TYPE_ROW,
  TYPE_OHP, TYPE_LAT, TYPE_CURL, TYPE_TRI, TYPE_PLANK,
];

// Build seed timestamps relative to "now" so the "Today" / "X days ago" labels stay correct.
function daysAgoAt(days, hour, minute) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

const today_0815       = daysAgoAt(0, 8, 15);
const twoDaysAgo_1740  = daysAgoAt(2, 17, 40);
const fourDaysAgo_0705 = daysAgoAt(4, 7, 5);

// Already in `created_at` desc order (newest first), matching what the
// backend's GET /api/workouts returns. Do not client-sort.
export const SEED_WORKOUTS = [
  {
    id: 1,
    name: 'Push day',
    performed_at: today_0815,
    notes: 'Felt strong on bench. Shoulder a touch tight on the last OHP set.',
    created_at: today_0815,
    exercises: [
      {
        id: 1, workout_id: 1, exercise_type_id: TYPE_BENCH.id, exercise_type: TYPE_BENCH, order: 1,
        sets: [
          { id: 1, exercise_id: 1, set_number: 1, reps: 10, weight: 40 },
          { id: 2, exercise_id: 1, set_number: 2, reps: 8,  weight: 60 },
          { id: 3, exercise_id: 1, set_number: 3, reps: 6,  weight: 70 },
          { id: 4, exercise_id: 1, set_number: 4, reps: 6,  weight: 70 },
        ],
      },
      {
        id: 2, workout_id: 1, exercise_type_id: TYPE_INCDB.id, exercise_type: TYPE_INCDB, order: 2,
        sets: [
          { id: 5, exercise_id: 2, set_number: 1, reps: 12, weight: 22.5 },
          { id: 6, exercise_id: 2, set_number: 2, reps: 10, weight: 24 },
        ],
      },
      {
        id: 3, workout_id: 1, exercise_type_id: TYPE_OHP.id, exercise_type: TYPE_OHP, order: 3,
        sets: [
          { id: 7, exercise_id: 3, set_number: 1, reps: 8, weight: 35 },
          { id: 8, exercise_id: 3, set_number: 2, reps: 7, weight: 35 },
        ],
      },
    ],
  },
  {
    id: 2,
    name: 'Leg day',
    performed_at: twoDaysAgo_1740,
    notes: '',
    created_at: twoDaysAgo_1740,
    exercises: [
      {
        id: 4, workout_id: 2, exercise_type_id: TYPE_SQUAT.id, exercise_type: TYPE_SQUAT, order: 1,
        sets: [
          { id: 9,  exercise_id: 4, set_number: 1, reps: 8, weight: 80 },
          { id: 10, exercise_id: 4, set_number: 2, reps: 8, weight: 90 },
          { id: 11, exercise_id: 4, set_number: 3, reps: 6, weight: 100 },
        ],
      },
      {
        id: 5, workout_id: 2, exercise_type_id: TYPE_RDL.id, exercise_type: TYPE_RDL, order: 2,
        sets: [
          { id: 12, exercise_id: 5, set_number: 1, reps: 10, weight: 70 },
          { id: 13, exercise_id: 5, set_number: 2, reps: 10, weight: 70 },
        ],
      },
    ],
  },
  {
    id: 3,
    name: 'Pull + core',
    performed_at: fourDaysAgo_0705,
    notes: 'Bad sleep, kept it light.',
    created_at: fourDaysAgo_0705,
    exercises: [
      {
        id: 6, workout_id: 3, exercise_type_id: TYPE_PULL.id, exercise_type: TYPE_PULL, order: 1,
        sets: [
          { id: 14, exercise_id: 6, set_number: 1, reps: 8, weight: null },
          { id: 15, exercise_id: 6, set_number: 2, reps: 6, weight: null },
          { id: 16, exercise_id: 6, set_number: 3, reps: 5, weight: null },
        ],
      },
      {
        id: 7, workout_id: 3, exercise_type_id: TYPE_ROW.id, exercise_type: TYPE_ROW, order: 2,
        sets: [
          { id: 17, exercise_id: 7, set_number: 1, reps: 10, weight: 50 },
          { id: 18, exercise_id: 7, set_number: 2, reps: 10, weight: 50 },
        ],
      },
      {
        id: 8, workout_id: 3, exercise_type_id: TYPE_PLANK.id, exercise_type: TYPE_PLANK, order: 3,
        sets: [
          { id: 19, exercise_id: 8, set_number: 1, reps: 60, weight: null },
          { id: 20, exercise_id: 8, set_number: 2, reps: 45, weight: null },
        ],
      },
    ],
  },
];
