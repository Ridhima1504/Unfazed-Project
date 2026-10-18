
import { Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Register from "./pagess/Register";
import Login from "./pagess/Login";
import Dashboard from "./pagess/Dashboard";
import PublicProfile from "./pagess/PublicProfile";

function Home() {
  return (
    <main className="home-page">
      <section className="home-hero">
        <p className="eyebrow">A PRACTICE THAT FEELS LIKE YOU</p>
        <h1>Make room for the work that <em>matters.</em></h1>
        <p>
          A thoughtful workspace for therapists to organise their
          practice, care for clients and find a calmer rhythm.
        </p>
        <div className="hero-actions">
          <a className="primary-button inline-button" href="/register">
            Build your workspace
          </a>
          <a className="outline-button" href="/login">I have an account</a>
        </div>
        <div className="home-note">
          <span>01</span> Your practice. Your rhythm. One calm space.
        </div>
      </section>
    </main>
  );
}

function Protected({ children }) {
  return localStorage.getItem("unfazed-token")
    ? children
    : <Navigate to="/login" replace />;
}

function ProfileEditor() {
  return (
    <main className="profile-page">
      <h1>Profile setup</h1>
      <p>
        Your public profile editor is the next feature to build.
        Your current public profile can already be viewed using its slug.
      </p>
      <p>Example URL: /your-name</p>
    </main>
  );
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
          element={<Protected><Dashboard /></Protected>}
        />
        <Route
          path="/profile"
          element={<Protected><ProfileEditor /></Protected>}
        />
        <Route path="/:slug" element={<PublicProfile />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
