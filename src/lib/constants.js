// UI-only enum for the muscle-group dropdown in NewTypeForm. The backend
// accepts any string for `muscle_group` — this list just shapes the picker.
export const MUSCLE_GROUPS = ['chest', 'back', 'legs', 'shoulders', 'arms', 'core'];

// Mirror the backend's User model rules (username validator, set_password)
// so most rejections never leave the client.
export const MIN_USERNAME_LENGTH = 3;
export const MAX_USERNAME_LENGTH = 64;
export const MIN_PASSWORD_LENGTH = 8;
