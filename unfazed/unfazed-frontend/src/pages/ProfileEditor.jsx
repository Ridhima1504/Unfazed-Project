
<p>
  {form.slug
    ? `/therapist/${form.slug}`
    : "Your profile link will appear here"}
</p>

{form.slug && (
  <Link
    to={`/therapist/${form.slug}`}
    target="_blank"
    rel="noreferrer"
    className="pe-open-link"
    aria-label="Open public profile in a new tab"
  >
    <ArrowUpRight size={18} />
  </Link>
)}
