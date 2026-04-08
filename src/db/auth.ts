/**
 * Hashage de mot de passe.
 *
 * Utilise SubtleCrypto SHA-256 si dispo (HTTPS / localhost),
 * sinon fallback pur JS (FNV-1a 64 bits itéré) — suffisant pour
 * un casino de simulation 100% local.
 *
 * ⚠️ NE PAS utiliser pour de l'authentification réelle.
 */

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export function generateSalt(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return bytesToHex(bytes);
}

/**
 * Fallback : FNV-1a 64 bits itéré 4096 fois.
 * Déterministe et collisions très rares pour usage local.
 */
function fallbackHash(input: string): string {
  // FNV-1a 32 bits sur 4 streams pour avoir 128 bits
  const seeds = [0x811c9dc5, 0x01000193, 0xdeadbeef, 0xcafebabe];
  const hashes = seeds.slice();

  for (let iter = 0; iter < 4096; iter++) {
    const data = `${iter}:${input}`;
    for (let s = 0; s < 4; s++) {
      let h = hashes[s]!;
      for (let i = 0; i < data.length; i++) {
        h ^= data.charCodeAt(i);
        h = Math.imul(h, 0x01000193);
      }
      hashes[s] = h >>> 0;
    }
  }

  return hashes.map((h) => h.toString(16).padStart(8, '0')).join('');
}

async function trySubtleSha256(input: string): Promise<string | null> {
  try {
    const c: Crypto | undefined = typeof crypto !== 'undefined' ? crypto : undefined;
    const subtle = c?.subtle;
    if (!subtle || typeof subtle.digest !== 'function') return null;
    const data = new TextEncoder().encode(input);
    const digest = await subtle.digest('SHA-256', data);
    return `sha256:${bytesToHex(new Uint8Array(digest))}`;
  } catch {
    return null;
  }
}

export async function hashPassword(password: string, salt: string): Promise<string> {
  const input = `${salt}:${password}`;
  const subtleResult = await trySubtleSha256(input);
  if (subtleResult) return subtleResult;
  return `fnv:${fallbackHash(input)}`;
}

export async function verifyPassword(
  password: string,
  salt: string,
  expectedHash: string
): Promise<boolean> {
  // Re-hash avec le MÊME algorithme que celui qui a produit expectedHash
  const input = `${salt}:${password}`;

  if (expectedHash.startsWith('sha256:')) {
    const result = await trySubtleSha256(input);
    return result === expectedHash;
  }

  if (expectedHash.startsWith('fnv:')) {
    return `fnv:${fallbackHash(input)}` === expectedHash;
  }

  // Anciens hashes sans préfixe (compat)
  const hash = await hashPassword(password, salt);
  return hash === expectedHash || hash.split(':')[1] === expectedHash;
}
