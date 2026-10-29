
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  Eye,
  Globe2,
  Leaf,
  Save,
  Sparkles,
  UserRound,
} from "lucide-react";
import api from "../api/axiosInstance";
import "./ProfileEditor.css";

const initialProfile = {
  name: "",
  email: "",
  bio: "",
  specializations: "",
  languages: "",
  slug: "",
  plan: "free",
};

const splitList = (value) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

export default function ProfileEditor() {
  const [form, setForm] = useState(initialProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      try {
        const token = localStorage.getItem("unfazed-token");

        if (!token) {
          setError("Please log in to edit your profile.");
          return;
        }

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
          specializations: Array.isArray(therapist.specializations)
            ? therapist.specializations.join(", ")
            : "",
          languages: Array.isArray(therapist.languages)
            ? therapist.languages.join(", ")
            : "",
          slug: therapist.slug || "",
          plan: therapist.plan || "free",
        });
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.message ||
              "We couldn't load your profile. Please try again."
          );
        }
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

    if (form.bio.length > 2000) {
      setError("Your introduction must be 2000 characters or fewer.");
      return;
    }

    setSaving(true);

    try {
      const token = localStorage.getItem("unfazed-token");

      const { data } = await api.put(
        "/therapists/me",
        {
          name: form.name.trim(),
          bio: form.bio.trim(),
          specializations: splitList(form.specializations),
          languages: splitList(form.languages),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const therapist = data.therapist;

      setForm((current) => ({
        ...current,
        name: therapist.name ?? current.name,
        email: therapist.email ?? current.email,
        bio: therapist.bio ?? "",
        specializations: Array.isArray(therapist.specializations)
          ? therapist.specializations.join(", ")
          : "",
        languages: Array.isArray(therapist.languages)
          ? therapist.languages.join(", ")
          : "",
        slug: therapist.slug ?? current.slug,
        plan: therapist.plan ?? current.plan,
      }));

      const stored = JSON.parse(
        localStorage.getItem("unfazed-therapist") || "{}"
      );

      localStorage.setItem(
        "unfazed-therapist",
        JSON.stringify({ ...stored, ...therapist })
      );

      setSuccess("Your changes have been saved successfully.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "We couldn't save your profile. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  const specializations = splitList(form.specializations);
  const languages = splitList(form.languages);
  const profileUrl = form.slug
    ? `${window.location.origin}/${form.slug}`
    : "";

  if (loading) {
    return (
      <main className="pe-page">
        <div className="pe-loading">
          <Leaf size={28} />
          <p>Preparing your calm space...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="pe-page">
      <div className="pe-shell">
        <header className="pe-topbar">
          <Link to="/dashboard" className="pe-back">
            <ArrowLeft size={17} />
            <span>Back to workspace</span>
          </Link>

          <div className="pe-status">
            <span className="pe-status-dot" />
            Profile editor
          </div>
        </header>

        <section className="pe-intro">
          <div className="pe-intro-copy">
            <div className="pe-kicker">
              <Sparkles size={15} />
              YOUR SPACE, YOUR STORY
            </div>

            <h1>
              Let your practice
              <br />
              <span>feel like you.</span>
            </h1>

            <p>
              Create a thoughtful introduction to your work.
              Share what you do, who you support, and the
              languages you speak.
            </p>
          </div>

          <div className="pe-intro-art" aria-hidden="true">
            <div className="pe-art-circle pe-art-circle-one" />
            <div className="pe-art-circle pe-art-circle-two" />
            <Leaf className="pe-art-leaf" size={82} strokeWidth={1} />
            <span className="pe-art-sparkle">✳</span>
            <span className="pe-art-caption">A space to grow</span>
          </div>
        </section>

        {error && (
          <div className="pe-alert pe-alert-error" role="alert">
            {error}
          </div>
        )}

        {success && (
          <div className="pe-alert pe-alert-success" role="status">
            <Check size={18} />
            {success}
          </div>
        )}

        <div className="pe-layout">
          <section className="pe-editor">
            <div className="pe-section-heading">
              <div className="pe-section-icon">
                <UserRound size={20} />
              </div>

              <div>
                <span className="pe-step">01 — THE BASICS</span>
                <h2>Introduce yourself</h2>
                <p>Start with the details people need to know.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="pe-field">
                <label htmlFor="name">Your name</label>
                <input
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="How should people know you?"
                  maxLength={100}
                  required
                />
              </div>

              <div className="pe-field">
                <label htmlFor="email">Account email</label>
                <input
                  id="email"
                  type="email"
                  value={form.email}
                  readOnly
                  className="pe-readonly"
                />
                <span className="pe-help">
                  Your account email is private and cannot be edited here.
                </span>
              </div>

              <div className="pe-field">
                <div className="pe-label-row">
                  <label htmlFor="bio">Your introduction</label>
                  <span>{form.bio.length}/2000</span>
                </div>

                <textarea
                  id="bio"
                  name="bio"
                  value={form.bio}
                  onChange={handleChange}
                  placeholder="Tell your story. Describe your approach, your professional interests, and what visitors can expect from working with you..."
                  rows={6}
                  maxLength={2000}
                />

                <span className="pe-help">
                  Write in your own voice. A warm, clear introduction
                  helps visitors understand your approach.
                </span>
              </div>

              <div className="pe-divider" />

              <div className="pe-section-heading pe-second-heading">
                <div className="pe-section-icon">
                  <Globe2 size={20} />
                </div>

                <div>
                  <span className="pe-step">02 — YOUR PRACTICE</span>
                  <h2>What you bring</h2>
                  <p>Help visitors discover your areas of focus.</p>
                </div>
              </div>

              <div className="pe-field">
                <label htmlFor="specializations">
                  Areas of specialization
                </label>

                <input
                  id="specializations"
                  name="specializations"
                  value={form.specializations}
                  onChange={handleChange}
                  placeholder="Stress management, Relationships, Anxiety"
                />

                <span className="pe-help">
                  Separate each item with a comma.
                </span>

                {specializations.length > 0 && (
                  <div className="pe-tags">
                    {specializations.map((item, index) => (
                      <span className="pe-tag" key={`${item}-${index}`}>
                        {item}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="pe-field">
                <label htmlFor="languages">Languages you speak</label>

                <input
                  id="languages"
                  name="languages"
                  value={form.languages}
                  onChange={handleChange}
                  placeholder="English, Hindi"
                />

                <span className="pe-help">
                  List the languages you can comfortably use professionally.
                </span>

                {languages.length > 0 && (
                  <div className="pe-tags pe-language-tags">
                    {languages.map((item, index) => (
                      <span className="pe-tag" key={`${item}-${index}`}>
                        {item}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="pe-save-area">
                <div className="pe-save-note">
                  <Check size={16} />
                  Your edits are saved when you press the button.
                </div>

                <button
                  className="pe-save-button"
                  type="submit"
                  disabled={saving}
                >
                  {saving ? (
                    "Saving your profile..."
                  ) : (
                    <>
                      <Save size={17} />
                      Save my profile
                    </>
                  )}
                </button>
              </div>
            </form>
          </section>

          <aside className="pe-preview-column">
            <div className="pe-preview-title">
              <div>
                <span className="pe-step">LIVE PREVIEW</span>
                <h2>Your public introduction</h2>
              </div>
              <Eye size={19} />
            </div>

            <article className="pe-preview-card">
              <div className="pe-preview-cover">
                <div className="pe-preview-cover-circle" />
                <Leaf size={42} strokeWidth={1.1} />
                <span>UNFAZED</span>
              </div>

              <div className="pe-preview-body">
                <div className="pe-avatar">
                  <UserRound size={29} strokeWidth={1.3} />
                </div>

                <span className="pe-preview-label">
                  YOUR PRACTICE, YOUR WAY
                </span>

                <h3>{form.name.trim() || "Your name goes here"}</h3>

                <p className="pe-preview-bio">
                  {form.bio.trim() ||
                    "Your introduction will appear here. Share a little about your professional approach and the people you support."}
                </p>

                {specializations.length > 0 && (
                  <div className="pe-preview-group">
                    <span className="pe-preview-group-title">
                      AREAS OF FOCUS
                    </span>

                    <div className="pe-tags">
                      {specializations.map((item, index) => (
                        <span
                          className="pe-tag"
                          key={`${item}-${index}`}
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {languages.length > 0 && (
                  <div className="pe-preview-group">
                    <span className="pe-preview-group-title">
                      LANGUAGES
                    </span>

                    <div className="pe-tags">
                      {languages.map((item, index) => (
                        <span
                          className="pe-tag"
                          key={`${item}-${index}`}
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pe-preview-footer">
                  <Leaf size={16} />
                  <span>A more thoughtful space to connect.</span>
                </div>
              </div>
            </article>

            <div className="pe-url-card">
              <div className="pe-url-icon">
                <Globe2 size={19} />
              </div>

              <div className="pe-url-copy">
                <span>Your public link</span>
                <p>
                  {form.slug
                    ? `/${form.slug}`
                    : "Your profile link will appear here"}
                </p>
              </div>

              {form.slug && (
                <Link
                  to={`/${form.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="pe-open-link"
                  aria-label="Open public profile in a new tab"
                >
                  <ArrowUpRight size={18} />
                </Link>
              )}
            </div>

            <p className="pe-privacy-note">
              <Leaf size={15} />
              Only your public profile details are shown to visitors.
              Your account email is not included in the preview.
            </p>
          </aside>
        </div>

        <footer className="pe-footer">
          <span>UNFAZED</span>
          <span>Make room for the work that matters.</span>
        </footer>
      </div>
    </main>
  );
}
