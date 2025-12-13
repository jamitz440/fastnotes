// src/api/encryption.test.ts
import { describe, it, expect } from "vitest";
import {
  deriveKey,
  wrapMasterKey,
  unwrapMasterKey,
  generateMasterKey,
} from "./encryption";

describe("Encryption", () => {
  it("should derive consistent keys from same password and salt", async () => {
    const password = "testPassword123";
    const salt = "test-salt";

    const key1 = await deriveKey(password, salt);
    const key2 = await deriveKey(password, salt);

    const testMessage = "test data";
    const testData = new TextEncoder().encode(testMessage);
    const iv = crypto.getRandomValues(new Uint8Array(12));

    const encrypted = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key1,
      testData,
    );

    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key2,
      encrypted,
    );

    const decryptedMessage = new TextDecoder().decode(decrypted);
    expect(decryptedMessage).toBe(testMessage);
  });

  it("should wrap and unwrap master key correctly", async () => {
    const masterKey = await generateMasterKey();
    const password = "testPassword123";
    const salt = "test-salt";
    const kek = await deriveKey(password, salt);

    const wrapped = await wrapMasterKey(masterKey, kek);
    const unwrapped = await unwrapMasterKey(wrapped, kek);

    const testMessage = "test message";
    const testData = new TextEncoder().encode(testMessage);
    const iv = crypto.getRandomValues(new Uint8Array(12));

    const encrypted = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      masterKey,
      testData,
    );

    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      unwrapped,
      encrypted,
    );

    const decryptedMessage = new TextDecoder().decode(decrypted);
    expect(decryptedMessage).toBe(testMessage);
  });
});
