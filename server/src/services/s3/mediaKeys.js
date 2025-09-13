const ALLOWED_PREFIXES = [
  'album-images/',
  'profile-images/',
  'task-proof/',
];

export function assertAllowedKey(key, userId) {
  // basic prefix check
  if (!ALLOWED_PREFIXES.some(p => key.startsWith(p))) {
    throw new Error('Key prefix not allowed');
  }

  // optional: enforce the key immediately contains the user id after the prefix
  // e.g. "task-proof/<userId>/..."
//   const parts = key.split('/');
//   if (parts.length < 3 || parts[1] !== userId) {
//     throw new Error('Key must include your userId after the prefix');
//   }
}
