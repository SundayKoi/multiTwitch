// Twitch usernames: 4–25 chars, alphanumeric + underscore.
const USERNAME_RE = /^[a-z0-9_]{4,25}$/;

export function normalizeUsername(raw: string): string {
  return raw.trim().toLowerCase().replace(/^@/, '');
}

export function isValidUsername(name: string): boolean {
  return USERNAME_RE.test(name);
}
