export default function OfflinePage() {
  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: 48 }}>
      <p className="eyebrow">English Wizard</p>
      <h1>You are offline</h1>
      <p className="muted">Your installed app is still available. Reconnect to resume AI-powered lessons and sync learner evidence.</p>
      <a className="button" href="/dashboard">Return to dashboard</a>
    </main>
  );
}
