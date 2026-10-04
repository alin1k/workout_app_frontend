import Avatar from 'boring-avatars';

// The Grove palette from tokens.css plus two warm tones for variety. Hex,
// not the oklch() tokens: boring-avatars parses the colours to pick a
// contrasting face colour.
const COLORS = ['#255335', '#3f704d', '#83aa8a', '#cbe7ce', '#e3cfa5', '#cc8463'];

// Deterministic: the same username always renders the same avatar.
function UserAvatar({ username, size = 40 }) {
  return (
    <Avatar
      className="avatar"
      name={username ?? ''}
      variant="beam"
      size={size}
      colors={COLORS}
      aria-hidden="true"
    />
  );
}

export default UserAvatar;
