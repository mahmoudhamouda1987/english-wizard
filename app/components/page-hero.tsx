export function PageHero({ icon, title, sub }: { icon: string; title: string; sub: string }) {
  return (
    <section className="page-hero">
      <span className="ph-icon" aria-hidden="true">{icon}</span>
      <div>
        <h1>{title}</h1>
        <p>{sub}</p>
      </div>
    </section>
  );
}
