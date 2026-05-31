import { useState } from 'react';
import Icon from './components/Icon.jsx';
import Button from './components/Button.jsx';
import IconButton from './components/IconButton.jsx';
import TextInput from './components/TextInput.jsx';
import StageBackdrop from './components/StageBackdrop.jsx';
import AppBar from './components/AppBar.jsx';
import Sheet from './components/Sheet.jsx';
import Confirm from './components/Confirm.jsx';
import Field from './components/Field.jsx';
import Stepper from './components/Stepper.jsx';
import MuscleBadge from './components/MuscleBadge.jsx';
import Toast from './components/Toast.jsx';

const ICON_NAMES = [
  'plus', 'back', 'chevronUp', 'chevronDown', 'chevronRight', 'x', 'check',
  'trash', 'pencil', 'calendar', 'note', 'repeat', 'search', 'leaf',
  'dumbbell', 'list', 'alert', 'clock', 'wifi',
];

function App() {
  const [text, setText] = useState('');
  const [reps, setReps] = useState(8);
  const [weight, setWeight] = useState(60);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const flash = (msg, icon) => {
    setToast({ msg, icon });
    setTimeout(() => setToast(null), 1800);
  };

  return (
    <div className="stage">
      <StageBackdrop />
      <div className="app-root">
        <AppBar
          title="Grove primitives"
          subtitle="Phase 4 showcase"
          right={
            <div className="row" style={{ gap: 0 }}>
              <IconButton name="pencil" label="Edit" onClick={() => flash('Pencil tapped', 'pencil')} />
              <IconButton name="trash" label="Delete" onClick={() => setConfirmOpen(true)} />
            </div>
          }
        />
        <div className="scroll">
          <div className="page col gap16">

            <section className="col gap8">
              <div className="label">Buttons</div>
              <div className="row wrap gap8">
                <Button>Primary</Button>
                <Button variant="soft">Soft</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="danger">Danger</Button>
              </div>
              <Button size="lg" className="btn-block" onClick={() => flash('Big tap', 'check')}>
                <Icon name="plus" size={20} /> Block + large
              </Button>
              <Button disabled>Disabled</Button>
            </section>

            <section className="col gap8">
              <div className="label">Icons</div>
              <div className="row wrap gap10" style={{ color: 'var(--text)' }}>
                {ICON_NAMES.map((n) => (
                  <span key={n} title={n} style={{ display: 'inline-flex' }}>
                    <Icon name={n} />
                  </span>
                ))}
              </div>
            </section>

            <section className="col gap8">
              <div className="label">Icon buttons</div>
              <div className="row gap6">
                <IconButton name="chevronUp" label="Up" />
                <IconButton name="chevronDown" label="Down" />
                <IconButton name="chevronRight" label="Right" />
                <IconButton name="x" label="Close" />
                <IconButton name="check" label="Check" disabled />
              </div>
            </section>

            <section className="col gap8">
              <div className="label">Chips</div>
              <div className="row wrap gap8">
                <MuscleBadge muscle="chest" />
                <MuscleBadge muscle="legs" />
                <MuscleBadge muscle="back" outline />
                <span className="chip"><span className="dot" /> live</span>
                <span className="chip chip-outline">3 sessions</span>
              </div>
            </section>

            <section className="col gap8">
              <div className="label">Card</div>
              <div className="card card-pad">
                <div className="h-md">Card title</div>
                <div className="muted" style={{ fontSize: 14, marginTop: 4 }}>
                  Surfaces use <code>var(--surface)</code> with the 26px corner radius.
                </div>
              </div>
            </section>

            <section className="col gap10">
              <div className="label">Form field + TextInput</div>
              <Field label="Workout name" hint="What you call it — “Push day”, “Quick legs”.">
                <TextInput
                  value={text}
                  onChange={setText}
                  placeholder="Push day"
                />
              </Field>
              <Field label="Required" error={!text.trim() ? 'This field is required.' : null}>
                <TextInput value={text} onChange={setText} invalid={!text.trim()} placeholder="Type something…" />
              </Field>
            </section>

            <section className="col gap10">
              <div className="label">Steppers</div>
              <div className="row gap10" style={{ alignItems: 'flex-end' }}>
                <div className="num-field">
                  <span className="label" style={{ fontSize: 10.5 }}>Reps</span>
                  <Stepper value={reps} onChange={setReps} min={1} />
                </div>
                <div className="num-field">
                  <span className="label" style={{ fontSize: 10.5 }}>Weight (kg)</span>
                  <Stepper value={weight} onChange={setWeight} step={2.5} decimals allowEmpty placeholder="BW" />
                </div>
              </div>
            </section>

            <section className="col gap8">
              <div className="label">Sheet / Confirm / Toast</div>
              <div className="row wrap gap8">
                <Button variant="soft" onClick={() => setSheetOpen(true)}>Open sheet</Button>
                <Button variant="soft" onClick={() => setConfirmOpen(true)}>Open confirm</Button>
                <Button variant="soft" onClick={() => flash('Saved', 'check')}>Show toast</Button>
              </div>
            </section>
          </div>
        </div>
      </div>

      {sheetOpen && (
        <Sheet
          title="Sample sheet"
          subtitle="Bottom-up on mobile · centered on desktop"
          onClose={() => setSheetOpen(false)}
          footer={
            <>
              <Button variant="soft" className="btn-block" onClick={() => setSheetOpen(false)}>Cancel</Button>
              <Button variant="primary" className="btn-block" onClick={() => { setSheetOpen(false); flash('Sheet saved', 'check'); }}>Save</Button>
            </>
          }
        >
          <div className="col gap10">
            <p>Press <b>Esc</b> or click outside to close.</p>
            <p className="muted" style={{ fontSize: 14 }}>Resize the window to see the desktop / mobile difference.</p>
          </div>
        </Sheet>
      )}

      {confirmOpen && (
        <Confirm
          icon="trash"
          tone="danger"
          title="Delete this thing?"
          body="This is just a primitive demo — nothing real will be deleted."
          confirmLabel="Delete"
          onConfirm={() => { setConfirmOpen(false); flash('Deleted', 'trash'); }}
          onCancel={() => setConfirmOpen(false)}
        />
      )}

      <Toast message={toast?.msg} icon={toast?.icon} />
    </div>
  );
}

export default App;
