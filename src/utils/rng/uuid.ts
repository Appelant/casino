/**
 * UUID v4 avec fallback pour contextes non sécurisés.
 *
 * crypto.randomUUID() requiert un secure context (HTTPS ou localhost).
 * Sur HTTP réseau, on génère un UUID v4 manuellement via getRandomValues
 * (qui est dispo partout).
 */

export function uuid(): string {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
  } catch {
    // fall through
  }

  // Fallback : UUID v4 via getRandomValues
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);

  // Set version (4) et variant (10xx)
  bytes[6] = (bytes[6]! & 0x0f) | 0x40;
  bytes[8] = (bytes[8]! & 0x3f) | 0x80;

  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
