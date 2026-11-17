/* Razorpay, called directly over its REST API (no extra package).
   Switches on automatically once RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are set. */
import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

import { serverEnv } from "./serverEnv";

const KEY_ID = serverEnv.razorpayKeyId;
const KEY_SECRET = serverEnv.razorpayKeySecret;
const WEBHOOK_SECRET = serverEnv.razorpayWebhookSecret;
const API = "https://api.razorpay.com/v1";

export const razorpayEnabled = Boolean(KEY_ID && KEY_SECRET);
export const razorpayKeyId = KEY_ID;

const auth = () => "Basic " + Buffer.from(`${KEY_ID}:${KEY_SECRET}`).toString("base64");

async function rp<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(API + path, {
    ...init,
    headers: { Authorization: auth(), "Content-Type": "application/json", ...(init.headers || {}) },
    cache: "no-store",
    signal: AbortSignal.timeout(20_000),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Razorpay ${path} ${res.status}: ${JSON.stringify(data?.error || data)}`);
  return data as T;
}

export type RpOrder = { id: string; amount: number; currency: string; receipt: string; status: string };
export type RpPayment = { id: string; order_id: string; amount: number; currency: string; status: string; method: string; email?: string; contact?: string; notes?: Record<string, string> };

export const createOrder = (amountRupees: number, receipt: string, notes: Record<string, string>) =>
  rp<RpOrder>("/orders", { method: "POST", body: JSON.stringify({ amount: Math.round(amountRupees * 100), currency: "INR", receipt, notes }) });

export const fetchPayment = (id: string) => rp<RpPayment>(`/payments/${encodeURIComponent(id)}`);

export const capturePayment = (id: string, amountPaise: number) =>
  rp<RpPayment>(`/payments/${encodeURIComponent(id)}/capture`, { method: "POST", body: JSON.stringify({ amount: amountPaise, currency: "INR" }) });

function safeEqual(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

/** Proves the browser's "payment succeeded" message really came from Razorpay. */
export function verifyPaymentSignature(orderId: string, paymentId: string, signature: string) {
  if (!KEY_SECRET) return false;
  const expected = createHmac("sha256", KEY_SECRET).update(`${orderId}|${paymentId}`).digest("hex");
  return safeEqual(expected, signature || "");
}

export function verifyWebhookSignature(rawBody: string, signature: string) {
  if (!WEBHOOK_SECRET) return false;
  const expected = createHmac("sha256", WEBHOOK_SECRET).update(rawBody).digest("hex");
  return safeEqual(expected, signature || "");
}

/** Fetches the payment from Razorpay, captures it if needed, and checks it matches the order. */
export async function settlePayment(paymentId: string, orderId: string) {
  let p = await fetchPayment(paymentId);
  if (p.order_id !== orderId) throw new Error("Payment does not belong to this order");
  if (p.status === "authorized") p = await capturePayment(p.id, p.amount);
  if (p.status !== "captured") throw new Error(`Payment status is ${p.status}`);
  return p;
}
