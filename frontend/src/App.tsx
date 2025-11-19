import React, { useState, useEffect } from "react";
import axios from "axios";

type Note = {
  id: number;
  title: string;
  body: string;
};

export default function App() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [saved, setSaved] = useState<Note | null>(null);
  const [allNotes, setAllNotes] = useState<Note[]>([]);

  // Load existing notes on mount
  useEffect(() => {
    axios.get<Note[]>("/api/notes").then((res) => setAllNotes(res.data));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const resp = await axios.post<Note>("/api/notes", { title, body });
      setSaved(resp.data);
      setAllNotes((prev) => [...prev, resp.data]);
      setTitle("");
      setBody("");
    } catch (err) {
      console.error(err);
      alert("Failed to save note – check console.");
    }
  };

  return (
    <div
      style={{
        maxWidth: "600px",
        margin: "2rem auto",
        fontFamily: "sans-serif",
      }}
    >
      <h1>📝 Simple Note</h1>

      <form onSubmit={handleSubmit} style={{ marginBottom: "2rem" }}>
        <div>
          <input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            style={{ width: "100%", padding: "0.5rem", fontSize: "1.1rem" }}
          />
        </div>
        <div style={{ marginTop: "0.5rem" }}>
          <textarea
            placeholder="Body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={4}
            style={{ width: "100%", padding: "0.5rem" }}
          />
        </div>
        <button
          type="submit"
          style={{ marginTop: "0.5rem", padding: "0.5rem 1rem" }}
        >
          Save note
        </button>
      </form>

      {saved && (
        <div
          style={{
            background: "#f0f8ff",
            padding: "1rem",
            marginBottom: "2rem",
          }}
        >
          <strong>Saved:</strong> #{saved.id} – {saved.title}
        </div>
      )}

      <h2>All notes</h2>
      {allNotes.length === 0 ? (
        <p>No notes yet.</p>
      ) : (
        <ul>
          {allNotes.map((n) => (
            <li key={n.id}>
              <strong>{n.title}</strong>: {n.body}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
