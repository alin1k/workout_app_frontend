import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useApp } from '../context/AppContext.jsx';
import Icon from '../components/Icon.jsx';
import Button from '../components/Button.jsx';
import Sheet from '../components/Sheet.jsx';
import Confirm from '../components/Confirm.jsx';
import UserAvatar from '../components/UserAvatar.jsx';

const OPTION_COUNT = 5;

// Avatars are generated from a code, so "a new picture" is just a new random
// string. Made up here, client-side; the server only stores the one picked.
function randomCode() {
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

function randomCodes() {
  return Array.from({ length: OPTION_COUNT }, randomCode);
}

function EditProfileSheet({ onClose }) {
  const { user, updateProfile } = useAuth();
  const { flash } = useApp();
  const [codes, setCodes] = useState(randomCodes);
  const [pending, setPending] = useState(null); // the code awaiting confirmation
  const [saving, setSaving] = useState(false);

  const confirmPick = async () => {
    setSaving(true);
    const { error } = await updateProfile({ avatar_code: pending });
    setSaving(false);
    if (error) {
      // A 401 has already logged us out and unmounted the app shell.
      if (error.status !== 401) flash(error.message || 'Could not update your picture', 'alert');
      setPending(null);
      return;
    }
    flash('Profile picture updated', 'check');
    onClose();
  };

  const cancelPick = () => {
    if (!saving) setPending(null);
  };

  return (
    <>
      {/* While the confirm dialog is up it owns Escape — otherwise one key
          press would dismiss the dialog and the sheet underneath it. */}
      <Sheet title="Edit profile" subtitle={user?.username} onClose={pending ? cancelPick : onClose}>
        <div className="col gap14">
          <div className="avatar-current">
            <UserAvatar code={user?.avatar_code} size={64} />
            <div>
              <div className="label">Profile picture</div>
              <div className="muted" style={{ fontSize: 14, lineHeight: 1.45, marginTop: 2 }}>
                Tap one of the pictures below to make it yours.
              </div>
            </div>
          </div>

          <div className="avatar-options">
            {codes.map((code, i) => (
              <button
                key={code}
                className="avatar-option"
                onClick={() => setPending(code)}
                aria-label={`Picture option ${i + 1}`}
              >
                <UserAvatar code={code} size={56} />
              </button>
            ))}
          </div>

          <Button variant="soft" className="btn-block" onClick={() => setCodes(randomCodes())}>
            <Icon name="repeat" size={16} /> Show {OPTION_COUNT} more
          </Button>
        </div>
      </Sheet>

      {pending && (
        <Confirm
          tone="primary"
          media={<UserAvatar code={pending} size={72} />}
          title="Use this picture?"
          body="It replaces your current profile picture."
          confirmLabel={saving ? 'Saving…' : 'Use picture'}
          confirmDisabled={saving}
          onConfirm={confirmPick}
          onCancel={cancelPick}
        />
      )}
    </>
  );
}

export default EditProfileSheet;
