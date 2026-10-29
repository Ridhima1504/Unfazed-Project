
import { Navigate, Route, Routes, Link } from "react-router-dom";

import Navbar from "./components/Navbar";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import PublicProfile from "./pages/PublicProfile";
import ProfileEditor from "./pages/ProfileEditor";
import Clients from "./pages/Clients";
import Sessions from "./pages/Sessions";
import SessionNotes from "./pages/SessionNotes";
import Payments from "./pages/Payments";

function Home() {
  return (
    <main className="home-page">
      <section className="home-hero">
        <p className="eyebrow">A PRACTICE THAT FEELS LIKE YOU</p>

        <h1>
          Make room for the work that <em>matters.</em>
        </h1>

        <p>
          A thoughtful workspace for therapists to organise
          their practice, care for clients and find a calmer rhythm.
        </p>

        <div className="hero-actions">
          <Link className="primary-button inline-button" to="/register">
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

function Protected({ children }) {
  const token = localStorage.getItem("unfazed-token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function App() {
  return (
    <>
      <Navbar />

      <Routes>
        {/* Home page */}
        <Route path="/" element={<Home />} />

        {/* Authentication pages */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        {/* Dashboard */}
        <Route
          path="/dashboard"
          element={
            <Protected>
              <Dashboard />
            </Protected>
          }
        />

        {/* Therapist profile editor */}
        <Route
          path="/profile"
          element={
            <Protected>
              <ProfileEditor />
            </Protected>
          }
        />

        {/* Client care */}
        <Route
          path="/clients"
          element={
            <Protected>
              <Clients />
            </Protected>
          }
        />

        {/* Sessions */}
        <Route
          path="/sessions"
          element={
            <Protected>
              <Sessions />
            </Protected>
          }
        />

        {/* Session notes */}
        <Route
          path="/notes"
          element={
            <Protected>
              <SessionNotes />
            </Protected>
          }
        />

        {/* Payments */}
        <Route
          path="/payments"
          element={
            <Protected>
              <Payments />
            </Protected>
          }
        />

        {/* Public therapist profiles — keep after named routes */}
        <Route path="/:slug" element={<PublicProfile />} />

        {/* Unknown routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
