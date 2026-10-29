
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Leaf } from "lucide-react";
import api from "../api/axiosInstance";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
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
    setLoading(true);

    try {
      const { data } = await api.post("/auth/login", {
        email: form.email.trim().toLowerCase(),
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
      console.error("Login failed:", {
        message: err.message,
        status: err.response?.status,
        response: err.response?.data,
        baseURL: err.config?.baseURL,
      });

      if (err.response) {
        const status = err.response.status;
        const serverMessage = err.response.data?.message;

        if (status === 401) {
          setError("Invalid email or password. Please try again.");
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
          setError(serverMessage || `Login failed (HTTP ${status}).`);
        }
      } else if (err.request) {
        setError(
          "The server did not respond. Check your API URL, backend status, and CORS settings."
        );
      } else {
        setError(err.message || "Could not start login.");
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

        <p className="eyebrow">Welcome back</p>
        <h1>Log in to Unfazed</h1>
        <p className="muted">
          Your workspace is waiting for you.
        </p>

        <label htmlFor="login-email">Email address</label>
        <input
          id="login-email"
          type="email"
          name="email"
          value={form.email}
          onChange={update}
          placeholder="you@example.com"
          autoComplete="email"
          required
        />

        <label htmlFor="login-password">Password</label>
        <input
          id="login-password"
          type="password"
          name="password"
          value={form.password}
          onChange={update}
          placeholder="Your password"
          autoComplete="current-password"
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
          {loading ? "Logging in..." : "Log in"}
        </button>

        <p className="auth-footer">
          New to Unfazed?{" "}
          <Link to="/register">Create an account</Link>
        </p>
      </form>
    </main>
  );
}
