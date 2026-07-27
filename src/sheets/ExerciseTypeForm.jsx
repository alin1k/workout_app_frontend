import { useState } from 'react';
import { MUSCLE_GROUPS } from '../lib/constants.js';
import Icon from '../components/Icon.jsx';
import Sheet from '../components/Sheet.jsx';
import Button from '../components/Button.jsx';
import Field from '../components/Field.jsx';
import TextInput from '../components/TextInput.jsx';

const CUSTOM = '__custom__';

// One component serves create and edit, keyed on `initial` — same shape as
// WorkoutForm.
function ExerciseTypeForm({ initial, onSave, onClose }) {
  const editing = !!initial;

  const [name, setName] = useState(initial ? initial.name : '');
  const [desc, setDesc] = useState(initial?.description || '');

  const initialGroup = initial?.muscle_group || '';
  // An existing type may carry an arbitrary string the picker list doesn't
  // know about (the backend accepts any). Start in free-text mode so the
  // value survives an untouched save instead of being silently blanked.
  const [custom, setCustom] = useState(
    !!initialGroup && !MUSCLE_GROUPS.includes(initialGroup)
  );
  const [muscle, setMuscle] = useState(initialGroup);

  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState(null);

  const clientNameErr = name.trim() === '' ? 'Give this movement a name.' : null;
  // Server-side errors take precedence; the client guard only after Submit.
  const nameErrShown = fieldErrors.name || (touched ? clientNameErr : null);

  const submit = async () => {
    setTouched(true);
    if (clientNameErr) return;
    setSubmitting(true);
    setFieldErrors({});
    setFormError(null);

    const result = await onSave({
      name: name.trim(),
      muscle_group: muscle.trim(),
      description: desc.trim(),
    });

    if (result?.error) {
      const e = result.error;
      if (e.field) {
        setFieldErrors({ [e.field]: e.message });
      } else if (e.status === 409) {
        // ConflictError carries no `field` — attribute it to the name input.
        setFieldErrors({ name: 'A movement with this name already exists.' });
      } else {
        setFormError(e.message || 'Could not save the movement.');
      }
      setSubmitting(false);
    }
    // On success the parent closes the sheet; we unmount and don't setState.
  };

  return (
    <Sheet
      title={editing ? 'Edit movement' : 'New movement'}
      subtitle="Catalog"
      onClose={onClose}
      footer={
        <>
          <Button variant="soft" className="btn-block" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="primary" className="btn-block" onClick={submit} disabled={submitting}>
            {submitting ? 'Saving…' : editing ? 'Save' : 'Create'}
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
          label="Movement name"
          error={nameErrShown}
          hint={!nameErrShown ? 'Must be unique across the catalog.' : null}
        >
          <TextInput
            value={name}
            onChange={setName}
            invalid={!!nameErrShown}
            placeholder="Pendlay Row"
            disabled={submitting}
          />
        </Field>

        <Field label="Muscle group" hint="Optional. Pick one, or choose “Other…” for a custom label.">
          <select
            className="input"
            value={custom ? CUSTOM : muscle}
            onChange={(e) => {
              if (e.target.value === CUSTOM) {
                setCustom(true);
                return;
              }
              setCustom(false);
              setMuscle(e.target.value);
            }}
            disabled={submitting}
          >
            <option value="">— none —</option>
            {MUSCLE_GROUPS.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
            <option value={CUSTOM}>Other…</option>
          </select>
          {custom && (
            <TextInput
              value={muscle}
              onChange={setMuscle}
              placeholder="forearms"
              disabled={submitting}
              style={{ marginTop: 8 }}
            />
          )}
        </Field>

        <Field label="Description" hint="Optional — form cues, alternative names.">
          <textarea
            className="textarea"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Explosive row, bar resets on the floor each rep."
            disabled={submitting}
          />
        </Field>
      </div>
    </Sheet>
  );
}

export default ExerciseTypeForm;
