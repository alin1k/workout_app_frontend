import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../lib/api.js';
import { MIN_PASSWORD_LENGTH } from '../lib/constants.js';
import { useApp } from '../context/AppContext.jsx';
import AppBar from '../components/AppBar.jsx';
import Icon from '../components/Icon.jsx';
import Button from '../components/Button.jsx';
import Field from '../components/Field.jsx';
import PasswordInput from '../components/PasswordInput.jsx';

function ResetPassword() {
  const navigate = useNavigate();
  const { flash } = useApp();

  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  // { current?, next?, confirm? } for per-field messages, plus a generic
  // banner for anything that doesn't belong to a single field.
  const [fieldErrors, setFieldErrors] = useState({});
  const [banner, setBanner] = useState(null);

  const submit = async () => {
    if (submitting) return;

    const errors = {};
    if (current === '') {
      errors.current = 'Enter your current password.';
    }
    if (next === '') {
      errors.next = 'Enter a new password.';
    } else if (next.length < MIN_PASSWORD_LENGTH) {
      errors.next = `Must be at least ${MIN_PASSWORD_LENGTH} characters.`;
    }
    // The backend has no confirm field — this check exists purely client-side
    // to catch typos before they become the new password.
    if (confirm === '') {
      errors.confirm = 'Repeat the new password.';
    } else if (next !== '' && confirm !== next) {
      errors.confirm = 'Passwords don’t match.';
    }
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setBanner(null);
      return;
    }

    setFieldErrors({});
    setBanner(null);
    setSubmitting(true);
    const { error } = await authApi.resetPassword(current, next);
    if (error) {
      if (error.status === 401) {
        // The endpoint collapses missing/wrong current password into one 401.
        setFieldErrors({ current: 'Current password is incorrect.' });
      } else if (error.field === 'new_password' || error.field === 'password') {
        setFieldErrors({ next: error.message });
      } else {
        setBanner(error.message || 'Could not update the password.');
      }
      setSubmitting(false);
      return;
    }
    flash('Password updated', 'check');
    navigate(-1);
  };

  return (
    <>
      <AppBar onBack={() => navigate(-1)} title="Reset password" subtitle="Account" />
      <div className="scroll">
        <div className="page">
          <div className="col gap16 fade-in" style={{ paddingTop: 8 }}>
            <div className="muted" style={{ fontSize: 14.5, lineHeight: 1.55 }}>
              Confirm your current password, then choose a new one.
            </div>

            {banner && (
              <div
                className="err fade-in"
                style={{
                  background: 'var(--danger-soft)',
                  padding: '10px 12px',
                  borderRadius: 'calc(var(--radius)*0.6)',
                }}
              >
                <Icon name="alert" size={16} /> {banner}
              </div>
            )}

            <Field label="Current password" error={fieldErrors.current}>
              <PasswordInput
                value={current}
                onChange={setCurrent}
                autoComplete="current-password"
                autoFocus
                onEnter={submit}
              />
            </Field>

            <Field
              label="New password"
              hint={`At least ${MIN_PASSWORD_LENGTH} characters.`}
              error={fieldErrors.next}
            >
              <PasswordInput
                value={next}
                onChange={setNext}
                autoComplete="new-password"
                onEnter={submit}
              />
            </Field>

            <Field label="Confirm new password" error={fieldErrors.confirm}>
              <PasswordInput
                value={confirm}
                onChange={setConfirm}
                autoComplete="new-password"
                onEnter={submit}
              />
            </Field>

            <Button
              variant="primary"
              size="lg"
              className="btn-block"
              onClick={submit}
              disabled={submitting}
              style={{ marginTop: 4 }}
            >
              {submitting ? 'Updating…' : 'Update password'}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

export default ResetPassword;
