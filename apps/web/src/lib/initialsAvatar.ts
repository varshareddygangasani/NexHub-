// Deterministic, dependency-free initials avatar generator.
// Returns a data URI containing an inline SVG so it works offline and is
// safe to drop into any <img src="..." /> tag without code changes.

const PALETTE: Array<{ bg: string; fg: string }> = [
  { bg: '#0A84FF', fg: '#FFFFFF' }, // apple-blue
  { bg: '#5E5CE6', fg: '#FFFFFF' }, // apple-indigo
  { bg: '#BF5AF2', fg: '#FFFFFF' }, // apple-purple
  { bg: '#FF375F', fg: '#FFFFFF' }, // apple-pink
  { bg: '#FF9F0A', fg: '#1C1C1E' }, // apple-orange
  { bg: '#30D158', fg: '#0B3B14' }, // apple-green
  { bg: '#FFD60A', fg: '#1C1C1E' }, // apple-yellow
  { bg: '#64D2FF', fg: '#0A2540' }, // apple-cyan
  { bg: '#40C8E0', fg: '#06283A' }, // apple-teal
  { bg: '#FF453A', fg: '#FFFFFF' }, // apple-red
];

function hashString(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i += 1) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function getAvatarColors(name: string): { bg: string; fg: string } {
  return PALETTE[hashString(name) % PALETTE.length];
}

// Produces a 128x128 inline-SVG data URI. Encoded with encodeURIComponent
// (not base64) so it stays tiny and inspectable in DevTools.
export function getInitialsAvatar(name: string): string {
  const initials = getInitials(name);
  const { bg, fg } = getAvatarColors(name);

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">` +
    `<defs>` +
    `<linearGradient id="g" x1="0" y1="0" x2="1" y2="1">` +
    `<stop offset="0%" stop-color="${bg}" stop-opacity="1"/>` +
    `<stop offset="100%" stop-color="${bg}" stop-opacity="0.78"/>` +
    `</linearGradient>` +
    `</defs>` +
    `<rect width="128" height="128" fill="url(#g)"/>` +
    `<text x="50%" y="50%" dy="0.36em" text-anchor="middle" ` +
    `font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, sans-serif" ` +
    `font-size="56" font-weight="600" fill="${fg}" letter-spacing="-1">${initials}</text>` +
    `</svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
