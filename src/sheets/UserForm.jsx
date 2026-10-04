import { useState } from 'react';
import {
  MAX_USERNAME_LENGTH,
  MIN_PASSWORD_LENGTH,
  MIN_USERNAME_LENGTH,
} from '../lib/constants.js';
import Icon from '../components/Icon.jsx';
import Sheet from '../components/Sheet.jsx';
import Button from '../components/Button.jsx';
import Field from '../components/Field.jsx';
import TextInput from '../components/TextInput.jsx';
import PasswordInput from '../components/PasswordInput.jsx';

// Create-only: the backend has no endpoint to edit or delete a user. The
// account is always a normal user — there is deliberately no admin toggle.
function UserForm({ onSave, onClose }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState(null);

  const name = username.trim();
  const clientErrors = {
    username:
      name === ''
        ? 'Choose a username.'
        : name.length < MIN_USERNAME_LENGTH
          ? `Use at least ${MIN_USERNAME_LENGTH} characters.`
          : null,
    password:
      password === ''
        ? 'Set a password.'
        : password.length < MIN_PASSWORD_LENGTH
          ? `Use at least ${MIN_PASSWORD_LENGTH} characters.`
          : null,
  };
  // Server-side errors take precedence; the client guards only after Submit.
  const usernameErr = fieldErrors.username || (touched ? clientErrors.username : null);
  const passwordErr = fieldErrors.password || (touched ? clientErrors.password : null);

  const submit = async () => {
    if (submitting) return;
    setTouched(true);
    if (clientErrors.username || clientErrors.password) return;
    setSubmitting(true);
    setFieldErrors({});
    setFormError(null);

    const result = await onSave({ username: name, password });

    if (result?.error) {
      const e = result.error;
      if (e.field) {
        setFieldErrors({ [e.field]: e.message });
      } else if (e.status === 409) {
        // ConflictError carries no `field` — attribute it to the username.
        setFieldErrors({ username: 'That username is already taken.' });
      } else {
        setFormError(e.message || 'Could not create the account.');
      }
      setSubmitting(false);
    }
    // On success the parent closes the sheet; we unmount and don't setState.
  };

  return (
    <Sheet
      title="New account"
      subtitle="Users"
      onClose={onClose}
      footer={
        <>
          <Button variant="soft" className="btn-block" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="primary" className="btn-block" onClick={submit} disabled={submitting}>
            {submitting ? 'Creating…' : 'Create'}
          </Button>
        </>
      }
    >
      <div className="col gap16">
        {formError && (
          <div
            className="err fade-in"
            style={{
              background: 'var(--danger-soft)',
              padding: '10px 12px',
              borderRadius: 'calc(var(--radius)*0.6)',
            }}
          >
            <Icon name="alert" size={16} /> {formError}
          </div>
        )}

        <Field
          label="Username"
          error={usernameErr}
          hint={!usernameErr ? 'Saved in lowercase. Must be unique.' : null}
        >
          <TextInput
            value={username}
            onChange={setUsername}
            invalid={!!usernameErr}
            placeholder="jane"
            maxLength={MAX_USERNAME_LENGTH}
            autoComplete="off"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            autoFocus
            disabled={submitting}
            onKeyDown={(e) => {
              if (e.key === 'Enter') submit();
            }}
          />
        </Field>

        <Field
          label="Password"
          error={passwordErr}
          hint={
            !passwordErr
              ? `At least ${MIN_PASSWORD_LENGTH} characters. Pass it on yourself — they can change it under Account → Reset password.`
              : null
          }
        >
          {/* new-password keeps the browser from filling in the admin's own. */}
          <PasswordInput
            value={password}
            onChange={setPassword}
            invalid={!!passwordErr}
            autoComplete="new-password"
            disabled={submitting}
            onEnter={submit}
          />
        </Field>
      </div>
    </Sheet>
  );
}

export default UserForm;
