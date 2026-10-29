
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Leaf } from "lucide-react";
import api from "../api/axiosInstance";
import "./PublicProfile.css";

export default function PublicProfile() {
  const { slug } = useParams();

  const [therapist, setTherapist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function fetchProfile() {
      setLoading(true);
      setError("");
      setTherapist(null);

      try {
        const response = await api.get(
          `/therapists/public/${encodeURIComponent(slug)}`
        );

        if (!active) return;

        const profile = response.data?.therapist;

        if (profile) {
          setTherapist(profile);
        } else {
          setError("This therapist profile could not be found.");
        }
      } catch (err) {
        if (!active) return;

        if (!err.response) {
          setError(
            "Unable to connect to the server. Please try again later."
          );
        } else if (err.response.status === 404) {
          setError("This therapist profile could not be found.");
        } else {
          setError(
            err.response.data?.message ||
              "Unable to load this therapist profile."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    if (slug) {
      fetchProfile();
    } else {
      setError("No therapist profile was specified.");
      setLoading(false);
    }

    return () => {
      active = false;
    };
  }, [slug]);

  const specializations = Array.isArray(therapist?.specializations)
    ? therapist.specializations
    : [];

  const languages = Array.isArray(therapist?.languages)
    ? therapist.languages
    : [];

  if (loading) {
    return (
      <main className="public-profile-page">
        <div className="profile-message">
          <Leaf size={32} />
          <p>Loading therapist profile...</p>
        </div>
      </main>
    );
  }

  if (error || !therapist) {
    return (
      <main className="public-profile-page">
        <div className="profile-message">
          <Leaf size={32} />
          <h1>Profile unavailable</h1>
          <p>
            {error || "This therapist profile could not be found."}
          </p>

          <Link to="/" className="profile-back-link">
            <ArrowLeft size={18} />
            Return to home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="public-profile-page">
      <div className="public-profile-container">
        <Link to="/" className="public-profile-brand">
          <Leaf size={25} />
          <span>unfazed.</span>
        </Link>

        <section className="public-profile-hero">
          <p className="profile-eyebrow">THERAPIST PROFILE</p>

          <div className="profile-avatar">
            {therapist.name?.charAt(0).toUpperCase() || "T"}
          </div>

          <h1>{therapist.name || "Therapist"}</h1>

          <p className="profile-bio">
            {therapist.bio ||
              "Welcome to my professional therapist profile."}
          </p>
        </section>

        <section className="public-profile-details">
          <div className="profile-detail-card">
            <h2>Areas of focus</h2>

            {specializations.length > 0 ? (
              <div className="profile-tags">
                {specializations.map((item, index) => (
                  <span
                    className="profile-tag"
                    key={`${item}-${index}`}
                  >
                    {item}
                  </span>
                ))}
              </div>
            ) : (
              <p>Specializations will be added soon.</p>
            )}
          </div>

          <div className="profile-detail-card">
            <h2>Languages</h2>

            {languages.length > 0 ? (
              <div className="profile-tags">
                {languages.map((item, index) => (
                  <span
                    className="profile-tag"
                    key={`${item}-${index}`}
                  >
                    {item}
                  </span>
                ))}
              </div>
            ) : (
              <p>Languages will be added soon.</p>
            )}
          </div>
        </section>

        <footer className="public-profile-footer">
          <Leaf size={18} />
          <span>
            UNFAZED — Make room for the work that matters.
          </span>
        </footer>
      </div>
    </main>
  );
}
