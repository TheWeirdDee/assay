/**
 * Cleanverse request-body encryption: AES/CBC/PKCS5Padding, fixed 16-zero-byte IV, key = the
 * Base64-decoded api-key. PKCS5Padding-for-AES is the Java name for what Node calls PKCS7 padding
 * on a 16-byte block — same padding, `createCipheriv`/`createDecipheriv` do this by default.
 */
import { createCipheriv, createDecipheriv } from "node:crypto";

const ZERO_IV = Buffer.alloc(16, 0);

function algorithmForKeyLength(keyBytes: number): string {
  if (keyBytes === 16) return "aes-128-cbc";
  if (keyBytes === 24) return "aes-192-cbc";
  if (keyBytes === 32) return "aes-256-cbc";
  throw new Error(`Unexpected Cleanverse api-key length after Base64 decode: ${keyBytes} bytes`);
}

export function encryptCleanverseBody(plaintext: object, apiKeyBase64: string): { data: string } {
  const key = Buffer.from(apiKeyBase64, "base64");
  const cipher = createCipheriv(algorithmForKeyLength(key.length), key, ZERO_IV);
  const json = Buffer.from(JSON.stringify(plaintext), "utf8");
  const encrypted = Buffer.concat([cipher.update(json), cipher.final()]);
  return { data: encrypted.toString("base64") };
}

export function decryptCleanverseBody<T = unknown>(dataBase64: string, apiKeyBase64: string): T {
  const key = Buffer.from(apiKeyBase64, "base64");
  const decipher = createDecipheriv(algorithmForKeyLength(key.length), key, ZERO_IV);
  const encrypted = Buffer.from(dataBase64, "base64");
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return JSON.parse(decrypted.toString("utf8"));
}
