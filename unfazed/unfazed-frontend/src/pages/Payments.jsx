
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CreditCard,
  Plus,
  Search,
  Trash2,
  X,
  IndianRupee,
  Wallet,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./Payments.css";

const STORAGE_KEY = "unfazed-demo-payments";

const emptyPayment = {
  client: "",
  description: "",
  amount: "",
  date: new Date().toISOString().slice(0, 10),
  status: "Pending",
  method: "UPI",
};

function readPayments() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);
}

function formatDate(date) {
  if (!date) return "—";

  return new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function Payments() {
  const navigate = useNavigate();

  const [payments, setPayments] = useState(readPayments);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyPayment);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payments));
    } catch {
      setError("Unable to save payments in this browser.");
    }
  }, [payments]);

  const filteredPayments = useMemo(() => {
    const term = search.trim().toLowerCase();

    return payments
      .filter((payment) =>
        [
          payment.client,
          payment.description,
          payment.status,
          payment.method,
        ].some((value) => (value || "").toLowerCase().includes(term))
      )
      .sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  }, [payments, search]);

  const totalReceived = payments
    .filter((payment) => payment.status === "Paid")
    .reduce((total, payment) => total + Number(payment.amount || 0), 0);

  const totalPending = payments
    .filter((payment) => payment.status === "Pending")
    .reduce((total, payment) => total + Number(payment.amount || 0), 0);

  function openForm() {
    setForm({
      ...emptyPayment,
      date: new Date().toISOString().slice(0, 10),
    });
    setError("");
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setForm(emptyPayment);
    setError("");
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    const amount = Number(form.amount);

    if (!form.client.trim() || !form.description.trim()) {
      setError("Please fill in the client label and description.");
      return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Please enter an amount greater than zero.");
      return;
    }

    const newPayment = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      ...form,
      client: form.client.trim(),
      description: form.description.trim(),
      amount,
      createdAt: new Date().toISOString(),
    };

    setPayments((previous) => [newPayment, ...previous]);
    closeForm();
  }

  function updateStatus(id, status) {
    setPayments((previous) =>
      previous.map((payment) =>
        payment.id === id ? { ...payment, status } : payment
      )
    );
  }

  function deletePayment(id) {
    if (window.confirm("Are you sure you want to delete this payment record?")) {
      setPayments((previous) =>
        previous.filter((payment) => payment.id !== id)
      );
    }
  }

  return (
    <main className="payments-page">
      <div className="payments-container">
        <button
          type="button"
          className="payments-back"
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft size={17} />
          Back to dashboard
        </button>

        <header className="payments-header">
          <div>
            <p className="payments-eyebrow">YOUR PRACTICE AT A GLANCE</p>
            <h1>Payments</h1>
            <p className="payments-subtitle">
              Keep track of demo payment records and their status.
            </p>
          </div>

          <button
            type="button"
            className="payments-primary"
            onClick={openForm}
          >
            <Plus size={18} />
            Add payment
          </button>
        </header>

        <div className="payments-notice">
          <CreditCard size={20} />
          <p>
            <strong>Demo only:</strong> Records are stored in this browser.
            This page does not process payments or connect to a payment
            provider. Use fictional information only.
          </p>
        </div>

        <section className="payments-stats">
          <article className="payments-stat-card">
            <span className="payments-stat-icon">
              <Wallet size={21} />
            </span>
            <div>
              <p>Total received</p>
              <h2>{formatCurrency(totalReceived)}</h2>
            </div>
          </article>

          <article className="payments-stat-card">
            <span className="payments-stat-icon pending-icon">
              <IndianRupee size={21} />
            </span>
            <div>
              <p>Total pending</p>
              <h2>{formatCurrency(totalPending)}</h2>
            </div>
          </article>

          <article className="payments-stat-card">
            <span className="payments-stat-icon">
              <CreditCard size={21} />
            </span>
            <div>
              <p>Total records</p>
              <h2>{payments.length}</h2>
            </div>
          </article>
        </section>

        <div className="payments-search">
          <Search size={19} />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search payments..."
            aria-label="Search payments"
          />
        </div>

        {showForm && (
          <section className="payments-form-card">
            <div className="payments-form-heading">
              <div>
                <p className="payments-eyebrow">NEW RECORD</p>
                <h2>Add a payment</h2>
              </div>
              <button
                type="button"
                className="payments-icon-button"
                onClick={closeForm}
                aria-label="Close form"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="payments-form-grid">
                <label>
                  Client label *
                  <input
                    name="client"
                    value={form.client}
                    onChange={handleChange}
                    placeholder="e.g. Demo Client A"
                    maxLength={100}
                    required
                  />
                </label>

                <label>
                  Description *
                  <input
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="e.g. Demo session fee"
                    maxLength={150}
                    required
                  />
                </label>

                <label>
                  Amount (INR) *
                  <input
                    type="number"
                    name="amount"
                    value={form.amount}
                    onChange={handleChange}
                    placeholder="e.g. 1500"
                    min="0.01"
                    step="0.01"
                    required
                  />
                </label>

                <label>
                  Payment date
                  <input
                    type="date"
                    name="date"
                    value={form.date}
                    onChange={handleChange}
                    required
                  />
                </label>

                <label>
                  Payment method
                  <select
                    name="method"
                    value={form.method}
                    onChange={handleChange}
                  >
                    <option>UPI</option>
                    <option>Cash</option>
                    <option>Bank transfer</option>
                    <option>Card</option>
                    <option>Other</option>
                  </select>
                </label>

                <label>
                  Status
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                  >
                    <option>Pending</option>
                    <option>Paid</option>
                  </select>
                </label>
              </div>

              {error && <p className="payments-error">{error}</p>}

              <div className="payments-form-actions">
                <button
                  type="button"
                  className="payments-secondary"
                  onClick={closeForm}
                >
                  Cancel
                </button>
                <button type="submit" className="payments-primary">
                  <Plus size={17} />
                  Save payment
                </button>
              </div>
            </form>
          </section>
        )}

        <section className="payments-records">
          <div className="payments-records-heading">
            <div>
              <h2>Payment records</h2>
              <p>{filteredPayments.length} records found</p>
            </div>
          </div>

          {filteredPayments.length === 0 ? (
            <div className="payments-empty">
              <div className="payments-empty-icon">
                <CreditCard size={29} />
              </div>
              <h3>{search ? "No matching payments" : "No payment records yet"}</h3>
              <p>
                {search
                  ? "Try another search term."
                  : "Add a fictional demo record to start tracking payment status."}
              </p>
              {!search && (
                <button
                  type="button"
                  className="payments-primary"
                  onClick={openForm}
                >
                  <Plus size={18} />
                  Add your first payment
                </button>
              )}
            </div>
          ) : (
            <div className="payments-table-wrapper">
              <table className="payments-table">
                <thead>
                  <tr>
                    <th>Client / Description</th>
                    <th>Date</th>
                    <th>Method</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.map((payment) => (
                    <tr key={payment.id}>
                      <td>
                        <strong>{payment.client}</strong>
                        <span className="payments-description">
                          {payment.description}
                        </span>
                      </td>
                      <td>{formatDate(payment.date)}</td>
                      <td>{payment.method}</td>
                      <td className="payments-amount">
                        {formatCurrency(payment.amount)}
                      </td>
                      <td>
                        <select
                          className={`payments-status ${
                            payment.status === "Paid" ? "is-paid" : "is-pending"
                          }`}
                          value={payment.status}
                          onChange={(event) =>
                            updateStatus(payment.id, event.target.value)
                          }
                          aria-label={`Status for ${payment.description}`}
                        >
                          <option>Pending</option>
                          <option>Paid</option>
                        </select>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="payments-icon-button payments-delete"
                          onClick={() => deletePayment(payment.id)}
                          aria-label={`Delete ${payment.description}`}
                          title="Delete record"
                        >
                          <Trash2 size={17} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
