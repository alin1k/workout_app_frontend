import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { AppProvider, useApp } from './context/AppContext.jsx';
import RequireAuth from './components/RequireAuth.jsx';
import RequireAdmin from './components/RequireAdmin.jsx';
import StageBackdrop from './components/StageBackdrop.jsx';
import TabBar from './components/TabBar.jsx';
import Toast from './components/Toast.jsx';
import Confirm from './components/Confirm.jsx';
import Login from './screens/Login.jsx';
import WorkoutsList from './screens/WorkoutsList.jsx';
import WorkoutDetail from './screens/WorkoutDetail.jsx';
import Account from './screens/Account.jsx';
import ResetPassword from './screens/ResetPassword.jsx';
import AdminArea from './screens/AdminArea.jsx';
import WorkoutForm from './sheets/WorkoutForm.jsx';
import ExercisePicker from './sheets/ExercisePicker.jsx';
import ExerciseInfoSheet from './sheets/ExerciseInfoSheet.jsx';

function GlobalOverlays() {
  const {
    workouts,
    types,
    muscleGroups,
    typesStatus,
    typesError,
    typesHasNext,
    typesLoadingMore,
    fetchTypes,
    loadMoreTypes,
    searchTypes,
    toast,
    confirm,
    sheet,
    closeConfirm,
    closeSheet,
    createWorkout,
    saveWorkout,
    addExercise,
    createType,
  } = useApp();
  const navigate = useNavigate();

  const editingWorkout =
    sheet?.kind === 'editWorkout' ? workouts.find((w) => w.id === sheet.workoutId) : null;

  return (
    <>
      {sheet?.kind === 'newWorkout' && (
        <WorkoutForm
          onSave={async (data) => {
            const result = await createWorkout(data);
            if (result.error) return result;
            navigate(`/workouts/${result.id}`);
            return result;
          }}
          onClose={closeSheet}
        />
      )}
      {sheet?.kind === 'editWorkout' && editingWorkout && (
        <WorkoutForm
          initial={editingWorkout}
          onSave={(data) => saveWorkout(editingWorkout.id, data)}
          onClose={closeSheet}
        />
      )}
      {sheet?.kind === 'addExercise' && (
        <ExercisePicker
          types={types}
          muscleGroups={muscleGroups}
          typesStatus={typesStatus}
          typesError={typesError}
          typesHasNext={typesHasNext}
          typesLoadingMore={typesLoadingMore}
          fetchTypes={fetchTypes}
          loadMoreTypes={loadMoreTypes}
          searchTypes={searchTypes}
          onPick={(type) => addExercise(sheet.workoutId, type)}
          onCreateType={(data) => createType(sheet.workoutId, data)}
          onClose={closeSheet}
        />
      )}

      {sheet?.kind === 'exerciseInfo' && sheet.type && (
        <ExerciseInfoSheet
          type={sheet.type}
          currentWorkoutId={sheet.workoutId}
          onClose={closeSheet}
        />
      )}

      {confirm && <Confirm {...confirm} onCancel={closeConfirm} />}
      <Toast message={toast?.message} icon={toast?.icon} />
    </>
  );
}

function ProtectedShell() {
  const { pathname } = useLocation();
  const showTabBar = pathname === '/' || pathname === '/account';

  return (
    <AppProvider>
      <Routes>
        <Route path="/" element={<WorkoutsList />} />
        <Route path="/workouts/:id" element={<WorkoutDetail />} />
        <Route path="/account" element={<Account />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        {/* Mirrors the RequireAuth + shell shape one level up. Must live
            inside ProtectedShell: the admin screens use useApp() for flash
            and openConfirm, and rely on GlobalOverlays to render them. */}
        <Route
          path="/admin/*"
          element={
            <RequireAdmin>
              <AdminArea />
            </RequireAdmin>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {showTabBar && <TabBar />}
      <GlobalOverlays />
    </AppProvider>
  );
}

function App() {
  return (
    <div className="stage">
      <StageBackdrop />
      <div className="app-root">
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/*"
              element={
                <RequireAuth>
                  <ProtectedShell />
                </RequireAuth>
              }
            />
          </Routes>
        </AuthProvider>
      </div>
    </div>
  );
}

export default App;
