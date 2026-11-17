"use client";

/* Last line of defence (the "500" page). It replaces the whole document when even the
   root layout fails, so it uses no fonts, components, CSS files or data: only inline
   styles that always load. Technical details are never shown to visitors. */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en-IN">
      <head>
        <title>Something went wrong | BearingMind</title>
        <meta name="robots" content="noindex" />
      </head>
      <body style={{ margin: 0, minHeight: "100vh", display: "grid", placeItems: "center", background: "#FBFCFB", color: "#34433E", fontFamily: "Georgia, 'Times New Roman', serif", padding: 24, textAlign: "center" }}>
        <main>
          <p style={{ color: "#7C5E34", letterSpacing: "0.2em", margin: 0 }}>500</p>
          <h1 style={{ color: "#0E1A16", fontWeight: 400, fontSize: "clamp(1.9rem,5vw,2.8rem)", margin: "10px 0 14px" }}>We are having a short technical pause.</h1>
          <p style={{ fontFamily: "system-ui, sans-serif", maxWidth: 520, margin: "0 auto 28px", lineHeight: 1.6 }}>
            Please try again in a moment. To book or ask a question now, call or WhatsApp +91 94822 23786, or email contact@bearingmind.com.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", fontFamily: "system-ui, sans-serif" }}>
            <button type="button" onClick={reset} style={{ background: "#1F4D3A", color: "#fff", border: 0, borderRadius: 999, padding: "12px 22px", fontSize: 15, cursor: "pointer" }}>
              Try again
            </button>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/" style={{ border: "1px solid #1F4D3A", color: "#163A2B", borderRadius: 999, padding: "11px 22px", fontSize: 15, textDecoration: "none" }}>
              Return to home
            </a>
          </div>
          {error.digest && <p style={{ fontFamily: "system-ui, sans-serif", fontSize: 13, color: "#5A6762", marginTop: 24 }}>Reference: {error.digest}</p>}
        </main>
      </body>
    </html>
  );
}
