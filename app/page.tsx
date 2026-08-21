export default function Home() {
  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: "72px 24px" }}>
      <section style={{ background: "white", borderRadius: 24, padding: 48, boxShadow: "0 12px 40px rgba(20,30,60,.08)" }}>
        <p style={{ fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 12 }}>English Wizard</p>
        <h1 style={{ fontSize: "clamp(40px, 7vw, 76px)", lineHeight: 1.02, margin: "0 0 20px" }}>
          Your English learning journey starts here.
        </h1>
        <p style={{ maxWidth: 720, fontSize: 20, lineHeight: 1.6, color: "#536078" }}>
          An adaptive learning platform that measures what you know, teaches what you need next, and keeps real learner progress across sessions.
        </p>
        <div style={{ display: "flex", gap: 12, marginTop: 32, flexWrap: "wrap" }}>
          <a href="/onboarding" style={{ background: "#172033", color: "white", padding: "14px 22px", borderRadius: 12, fontWeight: 700 }}>Start learning</a>
          <a href="/diagnostic" style={{ border: "1px solid #d9deea", padding: "14px 22px", borderRadius: 12, fontWeight: 700 }}>Take diagnostic</a>
        </div>
      </section>
    </main>
  );
}
