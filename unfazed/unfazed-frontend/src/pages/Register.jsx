
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Leaf } from "lucide-react";
import api from "../api/axiosInstance";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function submit(event) {
    event.preventDefault();
    setError("");

    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();

    if (!name || !email || !form.password) {
      setError("Please complete all fields.");
      return;
    }

    if (form.password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      const { data } = await api.post("/auth/register", {
        name,
        email,
        password: form.password,
      });

      if (!data.token || !data.therapist) {
        throw new Error(
          "The server response is missing account information. Please check the backend."
        );
      }

      localStorage.setItem("unfazed-token", data.token);
      localStorage.setItem(
        "unfazed-therapist",
        JSON.stringify(data.therapist)
      );

      navigate("/dashboard", { replace: true });
    } catch (err) {
      console.error("Registration failed:", {
        message: err.message,
        status: err.response?.status,
        response: err.response?.data,
        baseURL: err.config?.baseURL,
      });

      if (err.response) {
        const status = err.response.status;
        const serverMessage = err.response.data?.message;

        if (status === 409) {
          setError(
            serverMessage ||
              "An account with this email may already exist. Try logging in."
          );
        } else if (status === 400) {
          setError(serverMessage || "Please check the information you entered.");
        } else if (status === 403) {
          setError(
            serverMessage ||
              "This website is not permitted to access the backend."
          );
        } else if (status >= 500) {
          setError(
            serverMessage ||
              "The server encountered a problem. Please try again later."
          );
        } else {
          setError(serverMessage || `Registration failed (HTTP ${status}).`);
        }
      } else if (err.request) {
        setError(
          "The server did not respond. Check your API URL, backend status, and CORS settings."
        );
      } else {
        setError(err.message || "Could not start registration.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <form className="auth-card" onSubmit={submit}>
        <div className="auth-icon">
          <Leaf size={26} />
        </div>

        <p className="eyebrow">A calmer way to work</p>
        <h1>Create your account</h1>
        <p className="muted">
          Start building your therapist workspace.
        </p>

        <label htmlFor="register-name">Full name</label>
        <input
          id="register-name"
          type="text"
          name="name"
          value={form.name}
          onChange={update}
          placeholder="Your full name"
          autoComplete="name"
          maxLength={100}
          required
        />

        <label htmlFor="register-email">Email address</label>
        <input
          id="register-email"
          type="email"
          name="email"
          value={form.email}
          onChange={update}
          placeholder="you@example.com"
          autoComplete="email"
          required
        />

        <label htmlFor="register-password">Password</label>
        <input
          id="register-password"
          type="password"
          name="password"
          value={form.password}
          onChange={update}
          placeholder="At least 8 characters"
          autoComplete="new-password"
          minLength={8}
          maxLength={128}
          required
        />

        {error && (
          <p className="error-message" role="alert">
            {error}
          </p>
        )}

        <button
          className="primary-button"
          type="submit"
          disabled={loading}
        >
          {loading ? "Creating account..." : "Create account"}
        </button>

        <p className="auth-footer">
          Already registered? <Link to="/login">Log in</Link>
        </p>
      </form>
    </main>
  );
}
