function MuscleBadge({ muscle, outline }) {
  if (!muscle) return null;
  return <span className={'chip' + (outline ? ' chip-outline' : '')}>{muscle}</span>;
}

export default MuscleBadge;
