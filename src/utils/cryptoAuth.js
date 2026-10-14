/**
 * Demo-grade password hashing using browser Web Crypto API (PBKDF2-SHA256).
 * Never stores plaintext passwords in LocalStorage.
 * NOTE: This is a client-side local demonstration verifier and not a replacement for server-side authentication.
 */

function bufferToHex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function hexToUint8Array(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

export async function createPasswordVerifier(password) {
  const encoder = new TextEncoder();
  const saltBytes = crypto.getRandomValues(new Uint8Array(16));
  const saltHex = bufferToHex(saltBytes);

  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveBits']
    );
    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: saltBytes,
        iterations: 10000,
        hash: 'SHA-256'
      },
      keyMaterial,
      256
    );
    return {
      salt: saltHex,
      verifier: bufferToHex(derivedBits)
    };
  }

  // Fallback deterministic non-plaintext hash if subtle crypto is unavailable in an insecure context
  let hash = 2166136261;
  const combined = `${saltHex}:${password}`;
  for (let i = 0; i < combined.length; i++) {
    hash ^= combined.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return {
    salt: saltHex,
    verifier: (hash >>> 0).toString(16).padStart(8, '0')
  };
}

export async function verifyPassword(password, saltHex, storedVerifier) {
  const encoder = new TextEncoder();
  const saltBytes = hexToUint8Array(saltHex);

  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveBits']
    );
    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: saltBytes,
        iterations: 10000,
        hash: 'SHA-256'
      },
      keyMaterial,
      256
    );
    const computedVerifier = bufferToHex(derivedBits);
    return computedVerifier === storedVerifier;
  }

  let hash = 2166136261;
  const combined = `${saltHex}:${password}`;
  for (let i = 0; i < combined.length; i++) {
    hash ^= combined.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, '0') === storedVerifier;
}
