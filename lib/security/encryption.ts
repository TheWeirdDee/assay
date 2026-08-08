/**
 * AES-256-GCM at-rest encryption for merchant secrets (Cleanverse API keys, wallet private keys)
 * before they're written to Postgres. APP_ENCRYPTION_KEY must be a 32-byte key, base64-encoded.
 * Losing this key makes every stored credential unrecoverable -- back it up outside the repo/DB.
 */
import "server-only";
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

const IV_LENGTH = 12;
const TAG_LENGTH = 16;

function keyFromEnv(): Buffer {
  const raw = process.env.APP_ENCRYPTION_KEY;
  if (!raw) throw new Error("Missing required env var APP_ENCRYPTION_KEY");
  const key = Buffer.from(raw, "base64");
  if (key.length !== 32) {
    throw new Error(`APP_ENCRYPTION_KEY must decode to 32 bytes, got ${key.length}`);
  }
  return key;
}

/** Returns base64(iv || authTag || ciphertext). */
export function encryptSecret(plaintext: string): string {
  const key = keyFromEnv();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, ciphertext]).toString("base64");
}

export function decryptSecret(encoded: string): string {
  const key = keyFromEnv();
  const buf = Buffer.from(encoded, "base64");
  const iv = buf.subarray(0, IV_LENGTH);
  const tag = buf.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
  const ciphertext = buf.subarray(IV_LENGTH + TAG_LENGTH);
  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");
}
