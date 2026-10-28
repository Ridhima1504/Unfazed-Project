
import { Navigate, Route, Routes, Link } from "react-router-dom";

import Navbar from "./components/Navbar";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import PublicProfile from "./pages/PublicProfile";
import ProfileEditor from "./pages/ProfileEditor";

// Home page
function Home() {
  return (
    <main className="home-page">
      <section className="home-hero">
        <p className="eyebrow">
          A PRACTICE THAT FEELS LIKE YOU
        </p>

        <h1>
          Make room for the work that{" "}
          <em>matters.</em>
        </h1>

        <p>
          A thoughtful workspace for therapists to organise
          their practice, care for clients and find a calmer
          rhythm.
        </p>

        <div className="hero-actions">
          <Link
            className="primary-button inline-button"
            to="/register"
          >
            Build your workspace
          </Link>

          <Link className="outline-button" to="/login">
            I have an account
          </Link>
        </div>

        <div className="home-note">
          <span>01</span> Your practice. Your rhythm. One calm space.
        </div>
      </section>
    </main>
  );
}

// Protect pages that require login
function Protected({ children }) {
  const token = localStorage.getItem("unfazed-token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// Application routes
export default function App() {
  return (
    <>
      <Navbar />

      <Routes>
        {/* Home */}
        <Route
          path="/"
          element={<Home />}
        />

        {/* Authentication */}
        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        {/* Therapist dashboard */}
        <Route
          path="/dashboard"
          element={
            <Protected>
              <Dashboard />
            </Protected>
          }
        />

        {/* Profile editor */}
        <Route
          path="/profile"
          element={
            <Protected>
              <ProfileEditor />
            </Protected>
          }
        />

        {/* Public therapist profile */}
        <Route
          path="/:slug"
          element={<PublicProfile />}
        />

        {/* Unknown routes */}
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>
    </>
  );
}
