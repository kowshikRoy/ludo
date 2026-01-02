import { PlayerColor } from './ludoConstants';

/**
 * Simple hash function to generate a number from a string
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Generate a deterministic avatar background based on player name
 * Returns a gradient CSS string
 */
export function generateAvatarGradient(name: string, playerColor: PlayerColor): string {
  const hash = hashString(name);

  // Generate hue based on hash (0-360)
  const hue1 = hash % 360;
  const hue2 = (hash * 7) % 360;

  // Use high saturation and medium-high lightness for vibrant colors
  const color1 = `hsl(${hue1}, 70%, 60%)`;
  const color2 = `hsl(${hue2}, 70%, 50%)`;

  // Vary gradient direction based on hash
  const angle = (hash * 13) % 360;

  return `linear-gradient(${angle}deg, ${color1}, ${color2})`;
}

/**
 * Generate initials from player name (max 2 characters)
 */
export function generateInitials(name: string): string {
  if (!name || name.trim().length === 0) return '?';

  const words = name.trim().split(/\s+/);

  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }

  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}
