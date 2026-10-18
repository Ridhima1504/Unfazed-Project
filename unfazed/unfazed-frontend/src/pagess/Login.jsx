
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Leaf } from "lucide-react";
import api from "../api/axiosInstance";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function submit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data } = await api.post("/auth/login", form);

      localStorage.setItem("unfazed-token", data.token);
      localStorage.setItem(
        "unfazed-therapist",
        JSON.stringify(data.therapist)
      );

      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <form className="auth-card" onSubmit={submit}>
        <div className="auth-icon"><Leaf size={26} /></div>
        <p className="eyebrow">Welcome back</p>
        <h1>Log in to Unfazed</h1>
        <p className="muted">Your workspace is waiting for you.</p>

        <label>Email address</label>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={update}
          placeholder="you@example.com"
          required
        />

        <label>Password</label>
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={update}
          placeholder="Your password"
          required
        />

        {error && <p className="error-message">{error}</p>}

        <button className="primary-button" disabled={loading}>
          {loading ? "Logging in..." : "Log in"}
        </button>

        <p className="auth-footer">
          New to Unfazed? <Link to="/register">Create an account</Link>
        </p>
      </form>
    </main>
  );
}
