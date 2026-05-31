function App() {
  return (
    <div className="stage">
      <div className="app-root">
        <header className="appbar">
          <div className="grow">
            <div className="display-lg">Grove</div>
            <div className="muted" style={{ fontSize: 12.5, fontWeight: 600 }}>Training log</div>
          </div>
        </header>
        <div className="scroll">
          <div className="page">
            <p className="muted">Phase 1 + 2 stub. Sage background, Hanken Grotesk + Mulish loaded, 26px corner radius baked in.</p>
            <button className="btn btn-primary btn-lg">Primary button</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
