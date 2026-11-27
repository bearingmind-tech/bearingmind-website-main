/* Environment flags that are safe to read anywhere (no secrets here). */
/* Vercel sets VERCEL_ENV, Netlify sets CONTEXT; previews and branch deploys are not production. */
const deployContext = process.env.VERCEL_ENV || process.env.CONTEXT;
export const isProduction = deployContext ? deployContext === "production" : process.env.NODE_ENV === "production";
