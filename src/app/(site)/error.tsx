"use client";
import Link from "next/link";
import { useEffect } from "react";

/* Catches unexpected errors inside a page. Visitors see a calm message, never technical details.
   Only the error's short reference (digest) is shown, so a report can be matched to the server log. */
export default function SiteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Page error", error.digest || "");
  }, [error]);

  return (
    <section style={{ minHeight: "60vh", display: "grid", placeItems: "center", textAlign: "center", padding: "64px 24px" }} aria-labelledby="err-h">
      <div>
        <h1 id="err-h" style={{ fontSize: "clamp(2rem,4.5vw,3rem)" }}>Something went wrong on this page.</h1>
        <p className="lede" style={{ margin: "16px auto 28px" }}>
          Please try again. If it keeps happening, call or WhatsApp us and we will help you directly.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button className="btn" type="button" onClick={reset}>
            Try again
          </button>
          <Link className="btn ghost" href="/">
            Return to home
          </Link>
        </div>
        {error.digest && <p className="hint" style={{ marginTop: 24 }}>Reference: {error.digest}</p>}
      </div>
    </section>
  );
}
