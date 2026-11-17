/* Environment flags that are safe to read anywhere (no secrets here). */
export const isProduction = process.env.VERCEL_ENV ? process.env.VERCEL_ENV === "production" : process.env.NODE_ENV === "production";
