
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  UserRoundPlus,
  Users,
  NotebookPen,
  Trash2,
  UserRound,
} from "lucide-react";
import "./Clients.css";

const STORAGE_KEY = "unfazed-demo-clients";

function readClients() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : [];

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function Clients() {
  const [clients, setClients] = useState(readClients);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
    } catch {
      setMessage("Unable to save data in this browser.");
    }
  }, [clients]);

  const filteredClients = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return clients;

    return clients.filter((client) =>
      [client.name, client.email, client.phone].some(
        (value) => String(value || "").toLowerCase().includes(query)
      )
    );
  }, [clients, search]);

  function handleChange(event) {
    const { name, value } = event.target;

    if (name === "phone") {
      // Allow digits only and limit the number to 10 digits.
      const digitsOnly = value.replace(/\D/g, "").slice(0, 10);

      setForm((current) => ({
        ...current,
        phone: digitsOnly,
      }));

      setMessage("");
      return;
    }

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setMessage("");
  }

  function handleSubmit(event) {
    event.preventDefault();
    setMessage("");

    const name = form.name.trim();
    const email = form.email.trim();
    const phone = form.phone.trim();

    if (!name) {
      setMessage("Please enter the client's name.");
      return;
    }

    if (!/^\d{10}$/.test(phone)) {
      setMessage("Please enter a valid 10-digit mobile number.");
      return;
    }

    const newClient = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name,
      email,
      phone,
      createdAt: new Date().toISOString(),
    };

    setClients((current) => [newClient, ...current]);
    setForm({ name: "", email: "", phone: "" });
    setShowForm(false);
    setMessage("Demo client added successfully.");
  }

  function handleDelete(id) {
    const confirmed = window.confirm(
      "Remove this demo client from this browser?"
    );

    if (!confirmed) return;

    setClients((current) =>
      current.filter((client) => client.id !== id)
    );

    setMessage("Demo client removed.");
  }

  return (
    <main className="clients-page">
      <div className="clients-container">
        <Link to="/dashboard" className="clients-back-link">
          <ArrowLeft size={17} />
          Back to dashboard
        </Link>

        <section className="clients-hero">
          <div>
            <p className="eyebrow">YOUR PRACTICE</p>
            <h1>
              Client <em>care.</em>
            </h1>
            <p className="clients-intro">
              Keep your practice organised with a simple client directory.
            </p>
          </div>

          <div className="clients-hero-icon">
            <Users size={38} strokeWidth={1.4} />
          </div>
        </section>

        <section className="clients-toolbar">
          <div className="clients-count">
            <span className="clients-count-icon">
              <Users size={20} />
            </span>

            <div>
              <strong>{clients.length}</strong>
              <span>
                {clients.length === 1 ? " demo client" : " demo clients"}
              </span>
            </div>
          </div>

          <button
            type="button"
            className="clients-add-button"
            onClick={() => {
              setShowForm((current) => !current);
              setMessage("");
            }}
          >
            <UserRoundPlus size={18} />
            {showForm ? "Cancel" : "Add client"}
          </button>
        </section>

        {message && (
          <p className="clients-message" role="status">
            {message}
          </p>
        )}

        {showForm && (
          <section className="clients-form-card">
            <h2>Add a client</h2>

            <p className="clients-form-note">
              Demo only: do not enter real client or patient information.
            </p>

            <form onSubmit={handleSubmit}>
              <label htmlFor="client-name">Client name *</label>
              <input
                id="client-name"
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Alex Morgan"
                maxLength={100}
                autoComplete="off"
                required
              />

              <label htmlFor="client-email">Email address *</label>
              <input
                id="client-email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="alex@example.com"
                maxLength={254}
                autoComplete="off"
                required
              />

              <label htmlFor="client-phone">Mobile number *</label>
              <input
                id="client-phone"
                name="phone"
                type="tel"
                inputMode="numeric"
                pattern="[0-9]{10}"
                title="Enter exactly 10 digits."
                value={form.phone}
                onChange={handleChange}
                placeholder="Enter 10-digit mobile number"
                maxLength={10}
                minLength={10}
                autoComplete="on"
                aria-describedby="client-phone-help"
                required
              />

              <small id="client-phone-help">
                Enter exactly 10 digits, without spaces or country code.
                {form.phone.length > 0 &&
                  ` ${form.phone.length}/10 digits entered.`}
              </small>

              <button type="submit" className="clients-add-button">
                Save demo client
              </button>
            </form>
          </section>
        )}

        <section className="clients-list-section">
          <div className="clients-list-heading">
            <div>
              <p className="eyebrow">DIRECTORY</p>
              <h2>Your clients</h2>
            </div>

            <label className="clients-search">
              <Search size={18} />
              <input
                type="search"
                aria-label="Search clients"
                placeholder="Search clients..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>
          </div>

          {filteredClients.length === 0 ? (
            <div className="clients-empty">
              <div className="clients-empty-icon">
                <UserRound size={28} />
              </div>

              <h3>
                {search
                  ? "No matching clients"
                  : "Your directory starts here"}
              </h3>

              <p>
                {search
                  ? "Try another search term."
                  : "Add a demo client to see how your directory works."}
              </p>

              {!search && (
                <button
                  type="button"
                  className="clients-add-button"
                  onClick={() => {
                    setShowForm(true);
                    setMessage("");
                  }}
                >
                  <UserRoundPlus size={17} />
                  Add your first demo client
                </button>
              )}
            </div>
          ) : (
            <div className="clients-list">
              {filteredClients.map((client) => (
                <article className="client-card" key={client.id}>
                  <div className="client-avatar">
                    <UserRound size={22} />
                  </div>

                  <div className="client-details">
                    <h3>{client.name}</h3>
                    <p>{client.email || "No email added"}</p>
                    {client.phone && <p>Mobile: {client.phone}</p>}
                  </div>

                  <button
                    type="button"
                    className="client-delete-button"
                    aria-label={`Remove ${client.name}`}
                    title="Remove demo client"
                    onClick={() => handleDelete(client.id)}
                  >
                    <Trash2 size={18} />
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>

        <p className="clients-demo-warning">
          Demo mode: records are stored only in this browser. They are not
          securely stored in your account or backed up to the server.
        </p>
      </div>
    </main>
  );
}
