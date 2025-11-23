import axios from "axios";

const API_URL = import.meta.env.PROD ? "/api" : "http://localhost:8000/api";

export interface Note {
  id: number;
  title: string;
  folder_id?: number;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface NoteCreate {
  title: string;
  content: string;
  folder_id: number | null;
  encrypted: boolean;
}

// Derive key from password
async function deriveKey(password: string) {
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
      salt: enc.encode("your-app-salt"), // Store this somewhere consistent
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

// Encrypt content
async function encryptNote(content: string, key: CryptoKey) {
  const enc = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    enc.encode(content),
  );

  // Return IV + encrypted data as base64
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), iv.length);

  return btoa(String.fromCharCode(...combined));
}

// Decrypt content
async function decryptNote(encrypted: string, key: CryptoKey) {
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

const createNote = async (note: NoteCreate) => {
  if (!note.encrypted) {
    return axios.post(`${API_URL}/notes`, note);
  } else {
    var key = await deriveKey("Test");
    var eNote = await encryptNote(note.content, key);

    console.log(eNote);

    var unENote = await decryptNote(eNote, key);

    console.log(unENote);
  }
};

export const notesApi = {
  list: () => axios.get(`${API_URL}/notes`),
  get: (id: number) => axios.get(`${API_URL}/notes/${id}`),
  create: (note: NoteCreate) => createNote(note),
  update: (id: number, note: Partial<Note>) =>
    axios.patch(`${API_URL}/notes/${id}`, note),
  delete: (id: number) => axios.delete(`${API_URL}/notes/${id}`),
};
