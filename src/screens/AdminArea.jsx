import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import AppBar from '../components/AppBar.jsx';
import AdminUsers from './AdminUsers.jsx';
import AdminExerciseTypes from './AdminExerciseTypes.jsx';

const TABS = [
  { path: '/admin/users', label: 'Users' },
  { path: '/admin/exercise-types', label: 'Movements' },
];

function AdminArea() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <>
      <AppBar subtitle="Manage" title="Admin" onBack={() => navigate('/account')} />

      <div style={{ padding: '0 18px 12px' }}>
        <div className="seg" role="tablist" aria-label="Admin sections">
          {TABS.map((t) => {
            const on = pathname === t.path;
            return (
              <button
                key={t.path}
                role="tab"
                aria-selected={on}
                className={'seg-btn' + (on ? ' is-on' : '')}
                onClick={() => navigate(t.path)}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Paths are relative to the parent /admin/* route. The catch-all
          makes a bare /admin land on the users tab. */}
      <Routes>
        <Route path="users" element={<AdminUsers />} />
        <Route path="exercise-types" element={<AdminExerciseTypes />} />
        <Route path="*" element={<Navigate to="/admin/users" replace />} />
      </Routes>
    </>
  );
}

export default AdminArea;
