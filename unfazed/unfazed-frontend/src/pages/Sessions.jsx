
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  Plus,
  Search,
  Trash2,
  UserRound,
  Video,
} from "lucide-react";
import "./Sessions.css";

const STORAGE_KEY = "unfazed-demo-sessions";

const emptyForm = {
  clientName: "",
  date: "",
  time: "",
  duration: "50",
  type: "In-person",
  status: "Scheduled",
  notes: "",
};

function readSessions() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function formatDate(dateString) {
  if (!dateString) return "Date not set";

  const date = new Date(`${dateString}T12:00:00`);

  if (Number.isNaN(date.getTime())) return dateString;

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(timeString) {
  if (!timeString) return "Time not set";

  const [hours, minutes] = timeString.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);

  return date.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function Sessions() {
  const [sessions, setSessions] = useState(readSessions);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    } catch {
      setMessage("Unable to save sessions in this browser.");
    }
  }, [sessions]);

  const filteredSessions = useMemo(() => {
    const query = search.trim().toLowerCase();

    return sessions
      .filter((session) => {
        const matchesSearch = [
          session.clientName,
          session.type,
          session.status,
          session.notes,
        ].some((value) =>
          String(value || "").toLowerCase().includes(query)
        );

        const matchesStatus =
          statusFilter === "All" || session.status === statusFilter;

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        const first = `${a.date || ""}T${a.time || "00:00"}`;
        const second = `${b.date || ""}T${b.time || "00:00"}`;
        return first.localeCompare(second);
      });
  }, [sessions, search, statusFilter]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setMessage("");
  }

  function handleSubmit(event) {
    event.preventDefault();
    setMessage("");

    if (!form.clientName.trim() || !form.date || !form.time) {
      setMessage("Please enter the client name, date and time.");
      return;
    }

    const newSession = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      clientName: form.clientName.trim(),
      date: form.date,
      time: form.time,
      duration: form.duration,
      type: form.type,
      status: form.status,
      notes: form.notes.trim(),
      createdAt: new Date().toISOString(),
    };

    setSessions((current) => [newSession, ...current]);
    setForm(emptyForm);
    setShowForm(false);
    setMessage("Demo session added successfully.");
  }

  function handleStatusChange(id, status) {
    setSessions((current) =>
      current.map((session) =>
        session.id === id ? { ...session, status } : session
      )
    );

    setMessage("Session status updated.");
  }

  function handleDelete(id) {
    const confirmed = window.confirm(
      "Delete this demo session from this browser?"
    );

    if (!confirmed) return;

    setSessions((current) =>
      current.filter((session) => session.id !== id)
    );

    setMessage("Demo session deleted.");
  }

  const today = new Date();
  const todayString = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");

  const todayCount = sessions.filter(
    (session) =>
      session.date === todayString && session.status !== "Cancelled"
  ).length;

  const upcomingCount = sessions.filter(
    (session) =>
      session.date >= todayString &&
      session.status === "Scheduled"
  ).length;

  return (
    <main className="sessions-page">
      <div className="sessions-container">
        <Link to="/dashboard" className="sessions-back-link">
          <ArrowLeft size={17} />
          Back to dashboard
        </Link>

        <section className="sessions-hero">
          <div>
            <p className="eyebrow">YOUR PRACTICE</p>
            <h1>
              Sessions & <em>schedule.</em>
            </h1>
            <p className="sessions-intro">
              Organise appointments and keep your practice moving
              at a comfortable pace.
            </p>
          </div>

          <div className="sessions-hero-icon">
            <CalendarDays size={38} strokeWidth={1.4} />
          </div>
        </section>

        <section className="sessions-summary">
          <article className="sessions-stat">
            <span className="sessions-stat-icon">
              <CalendarDays size={20} />
            </span>
            <div>
              <strong>{todayCount}</strong>
              <span>Sessions today</span>
            </div>
          </article>

          <article className="sessions-stat">
            <span className="sessions-stat-icon">
              <Clock3 size={20} />
            </span>
            <div>
              <strong>{upcomingCount}</strong>
              <span>Scheduled upcoming</span>
            </div>
          </article>

          <article className="sessions-stat">
            <span className="sessions-stat-icon">
              <UserRound size={20} />
            </span>
            <div>
              <strong>{sessions.length}</strong>
              <span>Total demo sessions</span>
            </div>
          </article>
        </section>

        <section className="sessions-toolbar">
          <div>
            <p className="eyebrow">YOUR CALENDAR</p>
            <h2>Manage sessions</h2>
          </div>

          <button
            type="button"
            className="sessions-primary-button"
            onClick={() => {
              setShowForm((current) => !current);
              setMessage("");
            }}
          >
            <Plus size={18} />
            {showForm ? "Close form" : "Add session"}
          </button>
        </section>

        {message && (
          <p className="sessions-message" role="status">
            {message}
          </p>
        )}

        {showForm && (
          <section className="sessions-form-card">
            <h2>Schedule a session</h2>
            <p className="sessions-form-warning">
              Demo mode only. Do not enter real patient information
              or confidential clinical notes.
            </p>

            <form onSubmit={handleSubmit}>
              <div className="sessions-form-grid">
                <div className="sessions-field sessions-field-full">
                  <label htmlFor="session-client">Client name *</label>
                  <input
                    id="session-client"
                    name="clientName"
                    value={form.clientName}
                    onChange={handleChange}
                    placeholder="Enter demo client name"
                    maxLength={100}
                    required
                  />
                </div>

                <div className="sessions-field">
                  <label htmlFor="session-date">Date *</label>
                  <input
                    id="session-date"
                    name="date"
                    type="date"
                    value={form.date}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="sessions-field">
                  <label htmlFor="session-time">Start time *</label>
                  <input
                    id="session-time"
                    name="time"
                    type="time"
                    value={form.time}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="sessions-field">
                  <label htmlFor="session-duration">Duration</label>
                  <select
                    id="session-duration"
                    name="duration"
                    value={form.duration}
                    onChange={handleChange}
                  >
                    <option value="30">30 minutes</option>
                    <option value="45">45 minutes</option>
                    <option value="50">50 minutes</option>
                    <option value="60">60 minutes</option>
                    <option value="90">90 minutes</option>
                  </select>
                </div>

                <div className="sessions-field">
                  <label htmlFor="session-type">Session type</label>
                  <select
                    id="session-type"
                    name="type"
                    value={form.type}
                    onChange={handleChange}
                  >
                    <option value="In-person">In-person</option>
                    <option value="Online">Online</option>
                    <option value="Phone">Phone</option>
                  </select>
                </div>

                <div className="sessions-field">
                  <label htmlFor="session-status">Status</label>
                  <select
                    id="session-status"
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                  >
                    <option value="Scheduled">Scheduled</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="sessions-field sessions-field-full">
                  <label htmlFor="session-notes">General reminder (optional)</label>
                  <textarea
                    id="session-notes"
                    name="notes"
                    value={form.notes}
                    onChange={handleChange}
                    placeholder="Demo reminder only — no clinical details"
                    maxLength={300}
                    rows={3}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="sessions-primary-button"
              >
                Save demo session
              </button>
            </form>
          </section>
        )}

        <section className="sessions-list-section">
          <div className="sessions-list-heading">
            <div>
              <p className="eyebrow">APPOINTMENTS</p>
              <h2>Your sessions</h2>
            </div>

            <label className="sessions-search">
              <Search size={18} />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search sessions..."
                aria-label="Search sessions"
              />
            </label>
          </div>

          <div className="sessions-filter">
            {["All", "Scheduled", "Completed", "Cancelled"].map((status) => (
              <button
                type="button"
                key={status}
                className={
                  statusFilter === status
                    ? "sessions-filter-button active"
                    : "sessions-filter-button"
                }
                onClick={() => setStatusFilter(status)}
              >
                {status}
              </button>
            ))}
          </div>

          {filteredSessions.length === 0 ? (
            <div className="sessions-empty">
              <div className="sessions-empty-icon">
                <CalendarDays size={28} />
              </div>

              <h3>
                {search || statusFilter !== "All"
                  ? "No matching sessions"
                  : "Your schedule starts here"}
              </h3>

              <p>
                {search || statusFilter !== "All"
                  ? "Try changing your search or status filter."
                  : "Add a demo session to see your appointments here."}
              </p>

              {!search && statusFilter === "All" && (
                <button
                  type="button"
                  className="sessions-primary-button"
                  onClick={() => setShowForm(true)}
                >
                  <Plus size={17} />
                  Add your first session
                </button>
              )}
            </div>
          ) : (
            <div className="sessions-list">
              {filteredSessions.map((session) => (
                <article className="session-card" key={session.id}>
                  <div className="session-date-tile">
                    <CalendarDays size={20} />
                    <span>{formatDate(session.date)}</span>
                    <strong>{formatTime(session.time)}</strong>
                  </div>

                  <div className="session-details">
                    <h3>{session.clientName}</h3>

                    <p className="session-meta">
                      {session.type === "Online" && <Video size={15} />}
                      {session.type} · {session.duration} minutes
                    </p>

                    {session.notes && (
                      <p className="session-reminder">{session.notes}</p>
                    )}
                  </div>

                  <div className="session-actions">
                    <label className="session-status-label">
                      <span className="sr-only">Session status</span>
                      <select
                        aria-label={`Status for ${session.clientName}`}
                        value={session.status}
                        onChange={(event) =>
                          handleStatusChange(session.id, event.target.value)
                        }
                        className={`session-status-select status-${session.status.toLowerCase()}`}
                      >
                        <option value="Scheduled">Scheduled</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </label>

                    <button
                      type="button"
                      className="session-delete-button"
                      aria-label={`Delete session for ${session.clientName}`}
                      title="Delete demo session"
                      onClick={() => handleDelete(session.id)}
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <p className="sessions-demo-warning">
          Demo mode: sessions are stored only in this browser. They are not
          synced to MongoDB or securely backed up to your account.
        </p>
      </div>
    </main>
  );
}
