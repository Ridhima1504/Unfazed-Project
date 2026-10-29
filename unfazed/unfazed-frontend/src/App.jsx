
import { Navigate, Route, Routes } from "react-router-dom";

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
      <section>
        <h1>Make room for the work that matters.</h1>
        <p>
          A calmer workspace for therapists to manage their
          practice and support their clients.
        </p>
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
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        <Route
          path="/dashboard"
          element={
            <Protected>
              <Dashboard />
            </Protected>
          }
        />

        <Route
          path="/profile"
          element={
            <Protected>
              <ProfileEditor />
            </Protected>
          }
        />

        <Route
          path="/clients"
          element={
            <Protected>
              <Clients />
            </Protected>
          }
        />

        <Route
          path="/sessions"
          element={
            <Protected>
              <Sessions />
            </Protected>
          }
        />

        <Route
          path="/notes"
          element={
            <Protected>
              <SessionNotes />
            </Protected>
          }
        />

        <Route
          path="/payments"
          element={
            <Protected>
              <Payments />
            </Protected>
          }
        />

        <Route
          path="/therapist/:slug"
          element={<PublicProfile />}
        />

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>
    </>
  );
}
