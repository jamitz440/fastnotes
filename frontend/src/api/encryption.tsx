import { FolderTreeResponse, FolderTreeNode } from "./folders";

export async function deriveKey(password: string, salt: string) {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"],
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: enc.encode(salt),
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt", "wrapKey", "unwrapKey"],
  );
}

export async function generateMasterKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, [
    "encrypt",
    "decrypt",
  ]);
}

export async function wrapMasterKey(
  masterKey: CryptoKey,
  kek: CryptoKey,
): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const wrapped = await crypto.subtle.wrapKey("raw", masterKey, kek, {
    name: "AES-GCM",
    iv,
  });
  const combined = new Uint8Array(iv.length + wrapped.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(wrapped), iv.length);

  return btoa(String.fromCharCode(...combined));
}

export async function unwrapMasterKey(
  wrappedKey: string,
  kek: CryptoKey,
): Promise<CryptoKey> {
  const combined = Uint8Array.from(atob(wrappedKey), (c) => c.charCodeAt(0));
  const iv = combined.slice(0, 12);
  const wrapped = combined.slice(12);

  return crypto.subtle.unwrapKey(
    "raw",
    wrapped,
    kek,
    { name: "AES-GCM", iv },
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

export async function encryptString(
  text: string,
  key: CryptoKey,
): Promise<string> {
  const enc = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    enc.encode(text),
  );

  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), iv.length);

  return btoa(String.fromCharCode(...combined));
}

export async function decryptString(encrypted: string, key: CryptoKey) {
  const combined = Uint8Array.from(atob(encrypted), (c) => c.charCodeAt(0));
  const iv = combined.slice(0, 12);
  const data = combined.slice(12);

  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    data,
  );

  return new TextDecoder().decode(decrypted);
}

export async function decryptFolderTree(
  tree: FolderTreeResponse,
  encryptionKey: CryptoKey,
): Promise<FolderTreeResponse> {
  const decryptFolder = async (
    folder: FolderTreeNode,
  ): Promise<FolderTreeNode> => {
    return {
      ...folder,
      notes: await Promise.all(
        folder.notes.map(async (note) => ({
          ...note,
          title: await decryptString(note.title, encryptionKey),
          content: await decryptString(note.content, encryptionKey),
          tags: await Promise.all(
            note.tags.map(async (tag) => ({
              ...tag,
              name: await decryptString(tag.name, encryptionKey),
            })),
          ),
        })),
      ),
      children: await Promise.all(
        folder.children.map((child) => decryptFolder(child)),
      ),
    };
  };

  return {
    folders: await Promise.all(
      tree.folders.map((folder) => decryptFolder(folder)),
    ),
    orphaned_notes: await Promise.all(
      tree.orphaned_notes.map(async (note) => ({
        ...note,
        title: await decryptString(note.title, encryptionKey),
        content: await decryptString(note.content, encryptionKey),
        tags: await Promise.all(
          note.tags.map(async (tag) => ({
            ...tag,
            name: await decryptString(tag.name, encryptionKey),
          })),
        ),
      })),
    ),
  };
}
