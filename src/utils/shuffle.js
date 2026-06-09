/**
 * Shared deterministic shuffle utilities.
 * Same userId+examId → same shuffled order every time (resume support).
 * Different userId → different order (anti-collusion).
 */

/**
 * Produce a numeric seed from a string using a fast non-cryptographic hash.
 * @param {string} str
 * @returns {number}
 */
export function hashSeed(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (Math.imul(31, hash) + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

/**
 * Shuffle an array deterministically given a numeric seed (LCG PRNG).
 * @template T
 * @param {T[]} array
 * @param {number} seed
 * @returns {T[]}
 */
export function seededShuffle(array, seed) {
  const arr = [...array];
  let s = seed;
  for (let i = arr.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    const j = Math.abs(s) % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
