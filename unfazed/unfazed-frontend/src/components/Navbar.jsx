
import { Link, useNavigate } from "react-router-dom";
import { Leaf, LogOut } from "lucide-react";

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("unfazed-token");

  function logout() {
    localStorage.removeItem("unfazed-token");
    localStorage.removeItem("unfazed-therapist");
    navigate("/login");
  }

  return (
    <header className="navbar">
      <Link to="/" className="brand">
        <span className="brand-icon"><Leaf size={22} /></span>
        unfazed<span className="brand-dot">.</span>
      </Link>

      <nav className="nav-links">
        <Link to="/">Home</Link>
        {token && <Link to="/dashboard">Dashboard</Link>}
        {token ? (
          <button className="nav-button" onClick={logout}>
            <LogOut size={16} /> Log out
          </button>
        ) : (
          <>
            <Link to="/login">Log in</Link>
            <Link className="nav-cta" to="/register">
              Get started
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
