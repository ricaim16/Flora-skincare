import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export type SessionRole = "customer" | "admin";

export type SessionPayload = {
  id: number;
  email: string;
  name: string;
  role: SessionRole;
};

export const SESSION_COOKIE_NAME = "flora_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
const JWT_SECRET = process.env.JWT_SECRET || "flora-dev-secret";

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function hashOtp(code: string) {
  return bcrypt.hash(code, 10);
}

export async function compareOtp(code: string, hash: string) {
  return bcrypt.compare(code, hash);
}

export function signSessionToken(payload: SessionPayload) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: SESSION_MAX_AGE_SECONDS,
  });
}

export function verifySessionToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as SessionPayload;
  } catch {
    return null;
  }
}

export async function getCurrentSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  return verifySessionToken(token);
}

export function getSessionFromAuthHeader(headerValue: string | null) {
  if (!headerValue?.startsWith("Bearer ")) {
    return null;
  }

  return verifySessionToken(headerValue.replace("Bearer ", "").trim());
}

export function applySessionCookie(
  response: ResponseCookieWriter,
  payload: SessionPayload
) {
  response.cookies.set(SESSION_COOKIE_NAME, signSessionToken(payload), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export function clearSessionCookie(response: ResponseCookieWriter) {
  response.cookies.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export function assertStrongEnoughPassword(password: string) {
  return password.trim().length >= 6;
}

type ResponseCookieWriter = {
  cookies: {
    set: (
      name: string,
      value: string,
      options?: {
        httpOnly?: boolean;
        sameSite?: "lax" | "strict" | "none";
        secure?: boolean;
        path?: string;
        maxAge?: number;
      }
    ) => void;
  };
};
