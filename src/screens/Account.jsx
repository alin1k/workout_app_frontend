import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Icon from '../components/Icon.jsx';
import UserAvatar from '../components/UserAvatar.jsx';

function Header() {
  return (
    <header className="appbar">
      <div className="grow row gap10">
        <span className="appbar-mark">
          <Icon name="user" size={21} />
        </span>
        <div>
          <div className="display-lg" style={{ fontSize: 21, lineHeight: 1 }}>Account</div>
          <div className="muted" style={{ fontSize: 12.5, fontWeight: 600, whiteSpace: 'nowrap' }}>
            Profile and settings
          </div>
        </div>
      </div>
    </header>
  );
}

function Account() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <>
      <Header />
      <div className="scroll">
        <div className="page">
          <div className="col gap14 fade-in">
            <div className="card acct-profile">
              <UserAvatar username={user?.username} size={52} />
              <div className="grow">
                <div className="acct-name">{user?.username}</div>
                {user?.is_admin && <span className="chip">admin</span>}
              </div>
            </div>

            <div className="card acct-list">
              {user?.is_admin && (
                <button className="acct-row" onClick={() => navigate('/admin')}>
                  <Icon name="layers" size={19} />
                  <span className="grow">Admin</span>
                  <Icon name="chevronRight" size={18} className="acct-row-go" />
                </button>
              )}
              <button className="acct-row" onClick={() => navigate('/reset-password')}>
                <Icon name="key" size={19} />
                <span className="grow">Reset password</span>
                <Icon name="chevronRight" size={18} className="acct-row-go" />
              </button>
            </div>

            <div className="card acct-list">
              <button className="acct-row acct-row-danger" onClick={logout}>
                <Icon name="logout" size={19} />
                <span className="grow">Log out</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Account;
