/* The client's logo, drawn as SVG so it stays sharp and costs no download. */
export function Logo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 230 70" role="img" aria-label="BearingMind Health Services">
      <path d="M6 46H32L45 33" fill="none" stroke="#7C5E34" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <text x="60" y="34" fontFamily="var(--serif)" fontSize="26" fontWeight="500" fill="#1B2A25">
        BearingMind
      </text>
      <text x="61" y="55" fontFamily="var(--sans)" fontSize="11.5" letterSpacing="2.2" fill="#4C5854">
        HEALTH SERVICES
      </text>
    </svg>
  );
}
