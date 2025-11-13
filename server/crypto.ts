/**
 * Encryption/Decryption utilities for securely storing API keys and secrets
 * Uses AES-256-GCM for authenticated encryption
 */

import crypto from "crypto";
import { ENV } from "./_core/env";

// Derive a consistent encryption key from the JWT_SECRET
// In production, consider using a dedicated encryption key
const getEncryptionKey = (): Buffer => {
  const secret = ENV.cookieSecret;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is not set");
  }
  // Use SHA-256 to derive a 32-byte key from the secret
  return crypto.createHash("sha256").update(secret).digest();
};

/**
 * Encrypts a string using AES-256-GCM
 * Returns a JSON object containing the encrypted data, IV, and auth tag
 * This is safe to store in the database
 */
export function encryptString(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(16); // 128-bit IV
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

  let encrypted = cipher.update(plaintext, "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag();

  // Return as JSON string for easy storage
  const encryptedData = {
    iv: iv.toString("hex"),
    data: encrypted,
    authTag: authTag.toString("hex"),
  };

  return JSON.stringify(encryptedData);
}

/**
 * Decrypts a string that was encrypted with encryptString()
 * Throws an error if the authentication tag is invalid (tampering detected)
 */
export function decryptString(encryptedJson: string): string {
  const key = getEncryptionKey();
  const encryptedData = JSON.parse(encryptedJson);

  const iv = Buffer.from(encryptedData.iv, "hex");
  const encrypted = encryptedData.data;
  const authTag = Buffer.from(encryptedData.authTag, "hex");

  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

/**
 * Encrypts an object (typically API credentials)
 */
export function encryptObject<T extends Record<string, string>>(obj: T): Record<keyof T, string> {
  const encrypted: Record<string, string> = {};
  for (const [key, value] of Object.entries(obj)) {
    encrypted[key] = encryptString(value);
  }
  return encrypted as Record<keyof T, string>;
}

/**
 * Decrypts an object of encrypted strings
 */
export function decryptObject<T extends Record<string, string>>(
  encryptedObj: Record<keyof T, string>
): T {
  const decrypted: Record<string, string> = {};
  for (const [key, value] of Object.entries(encryptedObj)) {
    if (value) {
      decrypted[key] = decryptString(value);
    }
  }
  return decrypted as T;
}
