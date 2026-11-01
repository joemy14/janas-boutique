import crypto from "node:crypto";
import { promisify } from "node:util";
import type { NextApiRequest, NextApiResponse } from "next";
import type { SessionUser } from "@/types";

type User = SessionUser & { role: "admin" | "staff" | "customer" };

const scrypt = promisify(crypto.scrypt) as (
  password: string,
  salt: Buffer,
  keylen: number
) => Promise<Buffer>;

const SESSION_COOKIE = "jb_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

// ---------- passwords ----------

export async function hashPassword(password: string) {
  const salt = crypto.randomBytes(16);
  const hash = await scrypt(password, salt, 64);
  return `scrypt$${salt.toString("hex")}$${hash.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string) {
  const [scheme, saltHex, hashHex] = stored.split("$");
  if (scheme !== "scrypt" || !saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, "hex");
  const actual = await scrypt(password, Buffer.from(saltHex, "hex"), expected.length);
  return crypto.timingSafeEqual(actual, expected);
}

// ---------- reset tokens ----------

export function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function createResetToken() {
  const token = crypto.randomBytes(32).toString("hex");
  return { token, tokenHash: hashToken(token) };
}

// ---------- sessions (HMAC-signed cookie) ----------

function getSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET must be set to at least 32 characters");
  }
  return secret;
}

function sign(value: string) {
  return crypto.createHmac("sha256", getSecret()).update(value).digest("base64url");
}

function serializeCookie(value: string, maxAge: number) {
  const parts = [
    `${SESSION_COOKIE}=${value}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${maxAge}`,
  ];
  if (process.env.NODE_ENV === "production") parts.push("Secure");
  return parts.join("; ");
}

export function toSessionUser(user: User): SessionUser {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    isAdmin: user.isAdmin,
  };
}

export async function loginWithBackend(email: string, password: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "");
  if (!baseUrl) throw new Error("NEXT_PUBLIC_API_URL is not configured");

  const response = await fetch(`${baseUrl}/login.php`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return (await response.json()) as {
    success: boolean;
    message?: string;
    user?: SessionUser & { role: "admin" | "staff" | "customer" };
  };
}

export function setSessionCookie(res: NextApiResponse, user: User) {
  const payload = Buffer.from(
    JSON.stringify({ ...user, exp: Date.now() + SESSION_MAX_AGE * 1000 })
  ).toString("base64url");
  res.setHeader("Set-Cookie", serializeCookie(`${payload}.${sign(payload)}`, SESSION_MAX_AGE));
}

export function clearSessionCookie(res: NextApiResponse) {
  res.setHeader("Set-Cookie", serializeCookie("", 0));
}

function readSessionUser(req: NextApiRequest): User | null {
  const raw = req.cookies[SESSION_COOKIE];
  if (!raw) return null;
  const [payload, signature] = raw.split(".");
  if (!payload || !signature) return null;

  const expected = Buffer.from(sign(payload));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !crypto.timingSafeEqual(expected, given)) {
    return null;
  }

  try {
    const user = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (
      typeof user.id !== "number" ||
      typeof user.firstName !== "string" ||
      typeof user.lastName !== "string" ||
      typeof user.email !== "string" ||
      !["admin", "staff", "customer"].includes(user.role) ||
      typeof user.isAdmin !== "boolean" ||
      typeof user.exp !== "number" ||
      user.exp < Date.now()
    ) return null;
    const { exp: _exp, ...sessionUser } = user;
    return sessionUser as User;
  } catch {
    return null;
  }
}

export async function getSessionUser(req: NextApiRequest): Promise<User | null> {
  return readSessionUser(req);
}

/** Returns the signed-in user, or sends 401 and returns null. */
export async function requireUser(req: NextApiRequest, res: NextApiResponse) {
  const user = await getSessionUser(req);
  if (!user) {
    res.status(401).json({ success: false, message: "Please sign in." });
    return null;
  }
  return user;
}

/** Returns the signed-in admin, or sends 401/403 and returns null. */
export async function requireAdmin(req: NextApiRequest, res: NextApiResponse) {
  const user = await requireUser(req, res);
  if (!user) return null;
  if (!user.isAdmin) {
    res.status(403).json({ success: false, message: "Admin access required." });
    return null;
  }
  return user;
}
