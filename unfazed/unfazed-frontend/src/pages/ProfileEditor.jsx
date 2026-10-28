
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Eye, Leaf, Save } from "lucide-react";
import api from "../api/axiosInstance";

const emptyProfile = {
  name: "",
  email: "",
  bio: "",
  specializations: "",
  languages: "",
  slug: "",
  plan: "free",
};

function toCommaSeparated(value) {
  if (!Array.isArray(value)) return "";
  return value.join(", ");
}

function toArray(value) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function ProfileEditor() {
  const [form, setForm] = useState(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      try {
        setError("");

        const token = localStorage.getItem("unfazed-token");

        const { data } = await api.get("/therapists/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!active) return;

        const therapist = data.therapist;

        setForm({
          name: therapist.name || "",
          email: therapist.email || "",
          bio: therapist.bio || "",
          specializations: toCommaSeparated(
            therapist.specializations
          ),
          languages: toCommaSeparated(therapist.languages),
          slug: therapist.slug || "",
          plan: therapist.plan || "free",
        });
      } catch (err) {
        if (!active) return;

        setError(
          err.response?.data?.message ||
            "Could not load your profile. Please try again."
        );
      } finally {
        if (active) setLoading(false);
      }
    }

    loadProfile();

    return () => {
      active = false;
    };
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!form.name.trim()) {
      setError("Please enter your name.");
      return;
    }

    setSaving(true);

    try {
      const token = localStorage.getItem("unfazed-token");

      const profileData = {
        name: form.name.trim(),
        bio: form.bio.trim(),
        specializations: toArray(form.specializations),
        languages: toArray(form.languages),
      };

      const { data } = await api.put(
        "/therapists/me",
        profileData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const therapist = data.therapist;

      setForm((current) => ({
        ...current,
        name: therapist.name || current.name,
        email: therapist.email || current.email,
        bio: therapist.bio || "",
        specializations: toCommaSeparated(
          therapist.specializations
        ),
        languages: toCommaSeparated(therapist.languages),
        slug: therapist.slug || current.slug,
        plan: therapist.plan || current.plan,
      }));

      // Keep the locally stored therapist details in sync.
      const storedTherapist = JSON.parse(
        localStorage.getItem("unfazed-therapist") || "{}"
      );

      localStorage.setItem(
        "unfazed-therapist",
        JSON.stringify({
          ...storedTherapist,
          ...therapist,
        })
      );

      setSuccess("Your profile has been saved successfully.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not save your profile. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="profile-page">
        <section className="profile-card">
          <p>Loading your profile...</p>
        </section>
      </main>
    );
  }

  return (
    <main className="profile-page">
      <section className="profile-card">
        <Link to="/dashboard" className="profile-back-link">
          <ArrowLeft size={17} />
          Back to dashboard
        </Link>

        <div className="profile-heading">
          <div className="profile-icon">
            <Leaf size={25} />
          </div>

          <p className="eyebrow">YOUR UNFAZED SPACE</p>
          <h1>Set up your profile</h1>
          <p className="profile-description">
            Introduce yourself and help people understand
            your professional approach.
          </p>
        </div>

        {error && (
          <div className="profile-alert profile-alert-error" role="alert">
            {error}
          </div>
        )}

        {success && (
          <div
            className="profile-alert profile-alert-success"
            role="status"
          >
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="profile-field">
            <label htmlFor="name">Full name *</label>
            <input
              id="name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              placeholder="Your full name"
              maxLength={100}
              required
            />
          </div>

          <div className="profile-field">
            <label htmlFor="email">Account email</label>
            <input
              id="email"
              type="email"
              value={form.email}
              readOnly
              className="profile-readonly"
            />
            <small>Your account email cannot be changed here.</small>
          </div>

          <div className="profile-field">
            <label htmlFor="bio">Professional introduction</label>
            <textarea
              id="bio"
              name="bio"
              value={form.bio}
              onChange={handleChange}
              placeholder="Tell visitors about your approach, experience, and the support you offer."
              rows={6}
              maxLength={2000}
            />
            <small>{form.bio.length}/2000 characters</small>
          </div>

          <div className="profile-field">
            <label htmlFor="specializations">
              Specializations
            </label>
            <input
              id="specializations"
              name="specializations"
              type="text"
              value={form.specializations}
              onChange={handleChange}
              placeholder="Stress management, Relationships, Anxiety"
            />
            <small>
              Separate each specialization with a comma.
            </small>
          </div>

          <div className="profile-field">
            <label htmlFor="languages">Languages spoken</label>
            <input
              id="languages"
              name="languages"
              type="text"
              value={form.languages}
              onChange={handleChange}
              placeholder="English, Hindi"
            />
            <small>Separate each language with a comma.</small>
          </div>

          <div className="profile-slug">
            <span>YOUR PUBLIC PROFILE</span>

            {form.slug ? (
              <>
                <p>
                  {window.location.origin}/{form.slug}
                </p>

                <Link
                  to={`/${form.slug}`}
                  className="profile-preview-link"
                  target="_blank"
                  rel="noreferrer"
                >
                  <Eye size={16} />
                  Preview public profile
                </Link>
              </>
            ) : (
              <p>Your public profile link will appear here.</p>
            )}
          </div>

          <div className="profile-form-actions">
            <button
              type="submit"
              className="primary-button"
              disabled={saving}
            >
              <Save size={17} />
              {saving ? "Saving profile..." : "Save profile"}
            </button>

            <Link to="/dashboard" className="outline-button">
              Cancel
            </Link>
          </div>
        </form>
      </section>
    </main>
  );
}
