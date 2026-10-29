
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  FileText,
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Save,
  CalendarDays,
  UserRound,
  LockKeyhole,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./SessionNotes.css";

const STORAGE_KEY = "unfazed-demo-session-notes";

const emptyNote = {
  title: "",
  clientName: "",
  date: new Date().toISOString().slice(0, 10),
  type: "Session summary",
  content: "",
};

function readNotes() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function formatDate(date) {
  if (!date) return "No date";

  return new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function SessionNotes() {
  const navigate = useNavigate();

  const [notes, setNotes] = useState(readNotes);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyNote);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    } catch {
      setError("Unable to save notes in this browser.");
    }
  }, [notes]);

  const filteredNotes = useMemo(() => {
    const term = search.trim().toLowerCase();

    return notes
      .filter((note) =>
        [note.title, note.clientName, note.type, note.content]
          .some((value) => (value || "").toLowerCase().includes(term))
      )
      .sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));
  }, [notes, search]);

  function openNewNote() {
    setEditingId(null);
    setForm({ ...emptyNote, date: new Date().toISOString().slice(0, 10) });
    setError("");
    setShowForm(true);
  }

  function openEditNote(note) {
    setEditingId(note.id);
    setForm({
      title: note.title || "",
      clientName: note.clientName || "",
      date: note.date || "",
      type: note.type || "Session summary",
      content: note.content || "",
    });
    setError("");
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyNote);
    setError("");
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!form.title.trim() || !form.clientName.trim() || !form.content.trim()) {
      setError("Please enter a title, client name, and note content.");
      return;
    }

    const now = new Date().toISOString();

    if (editingId) {
      setNotes((previous) =>
        previous.map((note) =>
          note.id === editingId
            ? { ...note, ...form, updatedAt: now }
            : note
        )
      );
    } else {
      setNotes((previous) => [
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          ...form,
          createdAt: now,
          updatedAt: now,
        },
        ...previous,
      ]);
    }

    closeForm();
  }

  function deleteNote(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this note?"
    );

    if (confirmed) {
      setNotes((previous) => previous.filter((note) => note.id !== id));
    }
  }

  return (
    <main className="session-notes-page">
      <div className="session-notes-container">
        <button
          type="button"
          className="sn-back-button"
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft size={17} />
          Back to dashboard
        </button>

        <header className="sn-header">
          <div>
            <p className="sn-eyebrow">YOUR PRACTICE, WITH CARE</p>
            <h1>Session notes</h1>
            <p className="sn-subtitle">
              Keep your session summaries organised in one place.
            </p>
          </div>

          <button
            type="button"
            className="sn-primary-button"
            onClick={openNewNote}
          >
            <Plus size={18} />
            New note
          </button>
        </header>

        <div className="sn-privacy-notice">
          <LockKeyhole size={20} />
          <div>
            <strong>Demo storage only</strong>
            <p>
              These notes are saved in this browser, not in your secure
              account. Do not enter real client names, health information,
              or confidential therapy notes.
            </p>
          </div>
        </div>

        <section className="sn-summary">
          <div className="sn-summary-icon">
            <FileText size={23} />
          </div>
          <div>
            <span>Total notes</span>
            <strong>{notes.length}</strong>
          </div>
        </section>

        <div className="sn-search">
          <Search size={19} />
          <input
            type="search"
            placeholder="Search by title, client, or content..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            aria-label="Search session notes"
          />
        </div>

        {showForm && (
          <section className="sn-form-card">
            <div className="sn-form-heading">
              <div>
                <p className="sn-eyebrow">
                  {editingId ? "UPDATE YOUR RECORD" : "CREATE A RECORD"}
                </p>
                <h2>{editingId ? "Edit note" : "Create a session note"}</h2>
              </div>
              <button
                type="button"
                className="sn-icon-button"
                onClick={closeForm}
                aria-label="Close form"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="sn-form-grid">
                <label>
                  Note title *
                  <input
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="e.g. Session summary"
                    maxLength={120}
                    required
                  />
                </label>

                <label>
                  Client name or demo label *
                  <input
                    name="clientName"
                    value={form.clientName}
                    onChange={handleChange}
                    placeholder="e.g. Demo Client A"
                    maxLength={100}
                    required
                  />
                </label>

                <label>
                  Session date
                  <input
                    type="date"
                    name="date"
                    value={form.date}
                    onChange={handleChange}
                    required
                  />
                </label>

                <label>
                  Note type
                  <select
                    name="type"
                    value={form.type}
                    onChange={handleChange}
                  >
                    <option>Session summary</option>
                    <option>Progress note</option>
                    <option>Follow-up</option>
                    <option>General note</option>
                  </select>
                </label>
              </div>

              <label className="sn-content-label">
                Note content *
                <textarea
                  name="content"
                  value={form.content}
                  onChange={handleChange}
                  placeholder="Write a sample note here. Use fictional information only."
                  rows={6}
                  maxLength={10000}
                  required
                />
              </label>

              {error && <p className="sn-error">{error}</p>}

              <div className="sn-form-actions">
                <button
                  type="button"
                  className="sn-secondary-button"
                  onClick={closeForm}
                >
                  Cancel
                </button>
                <button type="submit" className="sn-primary-button">
                  <Save size={17} />
                  {editingId ? "Save changes" : "Save note"}
                </button>
              </div>
            </form>
          </section>
        )}

        <div className="sn-list-heading">
          <div>
            <h2>Your notes</h2>
            <p>
              {filteredNotes.length}{" "}
              {filteredNotes.length === 1 ? "note" : "notes"} found
            </p>
          </div>
        </div>

        {filteredNotes.length === 0 ? (
          <section className="sn-empty-state">
            <div className="sn-empty-icon">
              <FileText size={30} />
            </div>
            <h3>{search ? "No matching notes" : "A little space for reflection"}</h3>
            <p>
              {search
                ? "Try a different search term."
                : "Create your first demo note to keep your workspace organised."}
            </p>
            {!search && (
              <button
                type="button"
                className="sn-primary-button"
                onClick={openNewNote}
              >
                <Plus size={18} />
                Create your first note
              </button>
            )}
          </section>
        ) : (
          <div className="sn-notes-grid">
            {filteredNotes.map((note) => (
              <article className="sn-note-card" key={note.id}>
                <div className="sn-note-top">
                  <span className="sn-note-type">{note.type}</span>
                  <div className="sn-note-actions">
                    <button
                      type="button"
                      className="sn-icon-button"
                      onClick={() => openEditNote(note)}
                      aria-label={`Edit ${note.title}`}
                      title="Edit note"
                    >
                      <Pencil size={17} />
                    </button>
                    <button
                      type="button"
                      className="sn-icon-button sn-delete-button"
                      onClick={() => deleteNote(note.id)}
                      aria-label={`Delete ${note.title}`}
                      title="Delete note"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                </div>

                <h3>{note.title}</h3>

                <div className="sn-note-meta">
                  <span>
                    <UserRound size={15} />
                    {note.clientName}
                  </span>
                  <span>
                    <CalendarDays size={15} />
                    {formatDate(note.date)}
                  </span>
                </div>

                <p className="sn-note-content">{note.content}</p>

                <div className="sn-note-footer">
                  Updated{" "}
                  {note.updatedAt
                    ? new Date(note.updatedAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "recently"}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
