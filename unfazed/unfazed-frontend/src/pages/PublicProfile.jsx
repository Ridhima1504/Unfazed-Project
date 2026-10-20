
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Leaf } from "lucide-react";
import api from "../api/axiosInstance";

export default function PublicProfile() {
  const { slug } = useParams();
  const [therapist, setTherapist] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get(`/therapists/public/${slug}`)
      .then(({ data }) => setTherapist(data.therapist))
      .catch(() => setError("This therapist profile could not be found."));
  }, [slug]);

  if (error) {
    return <main className="profile-page"><h1>{error}</h1></main>;
  }

  if (!therapist) {
    return <main className="profile-page"><p>Loading profile...</p></main>;
  }

  return (
    <main className="profile-page">
      <Link className="brand" to="/">
        <Leaf size={22} /> unfazed.
      </Link>

      <section className="public-hero">
        <p className="eyebrow">THERAPIST PROFILE</p>
        <div className="profile-avatar">
          {therapist.name.charAt(0).toUpperCase()}
        </div>
        <h1>{therapist.name}</h1>
        <p>{therapist.bio || "Welcome to my professional profile."}</p>
      </section>

      <section className="public-details">
        <h2>Areas of focus</h2>
        <div className="tag-list">
          {therapist.specializations.length ? (
            therapist.specializations.map((item) => (
              <span className="tag" key={item}>{item}</span>
            ))
          ) : (
            <p>Specializations will be added soon.</p>
          )}
        </div>

        <h2>Languages</h2>
        <div className="tag-list">
          {therapist.languages.map((item) => (
            <span className="tag" key={item}>{item}</span>
          ))}
        </div>
      </section>
    </main>
  );
}
