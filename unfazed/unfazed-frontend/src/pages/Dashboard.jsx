
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  CalendarDays,
  Users,
  NotebookPen,
  CreditCard,
  ArrowUpRight,
  Leaf
} from "lucide-react";
import api from "../api/axiosInstance";

const features = [
  {
    title: "Client care",
    detail: "Organise client information in one workspace.",
    icon: Users,
    path: "/clients"
  },
  {
    title: "Sessions",
    detail: "Plan appointments and manage your schedule.",
    icon: CalendarDays,
    path: "/sessions"
  },
  {
    title: "Session notes",
    detail: "Keep clinical notes separate from shared notes.",
    icon: NotebookPen,
    path: "/notes"
  },
  {
    title: "Payments",
    detail: "Prepare your workspace for payment tracking.",
    icon: CreditCard,
    path: "/payments"
  }
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [therapist, setTherapist] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("unfazed-therapist") || "null"
      );
    } catch {
      return null;
    }
  });
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/therapists/me")
      .then(({ data }) => setTherapist(data.therapist))
      .catch((err) => {
        if (err.response?.status === 401) {
          localStorage.removeItem("unfazed-token");
          navigate("/login");
        } else {
          setError("Unable to refresh your profile.");
        }
      });
  }, [navigate]);

  return (
    <main className="dashboard-page">
      <section className="welcome-panel">
        <div>
          <p className="eyebrow">YOUR PERSONAL WORKSPACE</p>
          <h1>
            A little more space to <em>breathe.</em>
          </h1>
          <p>
            Welcome{therapist?.name ? `, ${therapist.name}` : ""}.
            Take care of your practice, one step at a time.
          </p>
          <Link className="light-button" to="/profile">
            View your profile <ArrowUpRight size={17} />
          </Link>
        </div>
        <div className="welcome-art"><Leaf size={92} strokeWidth={1} /></div>
      </section>

      {error && <p className="error-message">{error}</p>}

      <div className="section-heading">
        <div>
          <p className="eyebrow">YOUR WORKSPACE</p>
          <h2>Everything in its place</h2>
        </div>
        <span className="plan-pill">
          {therapist?.plan || "free"} plan
        </span>
      </div>

      <section className="feature-grid">
        {features.map(({ title, detail, icon: Icon, path }) => (
          <article className="feature-card" key={title}>
            <div className="feature-icon"><Icon size={22} /></div>
            <h3>{title}</h3>
            <p>{detail}</p>
            <button
              className="text-link"
              onClick={() => navigate(path)}
            >
              Explore <ArrowUpRight size={15} />
            </button>
          </article>
        ))}
      </section>

      <section className="profile-tip">
        <div>
          <p className="eyebrow">YOUR NEXT STEP</p>
          <h3>Give your practice a public home.</h3>
          <p>
            Create your therapist profile and share your personal
            Unfazed link.
          </p>
        </div>
        <Link to="/profile" className="primary-button inline-button">
          Set up profile
        </Link>
      </section>
    </main>
  );
}
