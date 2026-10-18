
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Leaf } from "lucide-react";
import api from "../api/axiosInstance";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });
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
      const { data } = await api.post("/auth/register", form);

      localStorage.setItem("unfazed-token", data.token);
      localStorage.setItem(
        "unfazed-therapist",
        JSON.stringify(data.therapist)
      );

      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <form className="auth-card" onSubmit={submit}>
        <div className="auth-icon"><Leaf size={26} /></div>
        <p className="eyebrow">A calmer way to work</p>
        <h1>Create your account</h1>
        <p className="muted">Start building your therapist workspace.</p>

        <label>Full name</label>
        <input
          name="name"
          value={form.name}
          onChange={update}
          placeholder="Your full name"
          required
        />

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
          placeholder="At least 8 characters"
          minLength={8}
          required
        />

        {error && <p className="error-message">{error}</p>}

        <button className="primary-button" disabled={loading}>
          {loading ? "Creating account..." : "Create account"}
        </button>

        <p className="auth-footer">
          Already registered? <Link to="/login">Log in</Link>
        </p>
      </form>
    </main>
  );
}
