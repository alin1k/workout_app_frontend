function StageBackdrop() {
  return (
    <svg className="stage-bg" viewBox="0 0 1200 900" preserveAspectRatio="xMidYMid slice">
      <defs>
        <radialGradient id="bg-a" cx="18%" cy="12%" r="60%">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.30" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="bg-b" cx="86%" cy="88%" r="55%">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.26" />
          <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="1200" height="900" fill="var(--bg-deep)" />
      <rect width="1200" height="900" fill="url(#bg-a)" />
      <rect width="1200" height="900" fill="url(#bg-b)" />
      <g fill="none" stroke="var(--primary)" strokeOpacity="0.06" strokeWidth="2">
        <path d="M-50 620 C 250 540 420 700 700 600 S 1100 470 1280 560" />
        <path d="M-50 680 C 250 600 420 760 700 660 S 1100 530 1280 620" />
        <path d="M-50 740 C 250 660 420 820 700 720 S 1100 590 1280 680" />
        <path d="M-50 200 C 250 130 460 250 720 170 S 1080 60 1280 150" />
        <path d="M-50 260 C 250 190 460 310 720 230 S 1080 120 1280 210" />
      </g>
    </svg>
  );
}

export default StageBackdrop;
