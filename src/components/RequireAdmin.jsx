import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

// Cosmetic gate — it hides UI, it does not protect data. The real boundary
// is `admin_required` on the backend; every admin endpoint answers 403 to a
// non-admin token regardless of what the client renders.
//
// Sits INSIDE RequireAuth, so status is already 'authed' and user is
// non-null by the time this renders. The loading branch is belt-and-braces.
function RequireAdmin({ children }) {
  const { user, status } = useAuth();
  if (status === 'loading') return null;
  if (!user?.is_admin) return <Navigate to="/" replace />;
  return children;
}

export default RequireAdmin;
