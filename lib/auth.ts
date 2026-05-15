'use server';
import { cookies } from "next/headers";

const TOKEN_COOKIE = "rex_session_token";
const TOKEN_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export async function createSession(token: string) {
  const cookieStore = await cookies();

  cookieStore.set(TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: TOKEN_MAX_AGE,
    path: "/",
  });
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(TOKEN_COOKIE);
}

export async function getSessionToken() {
  const cookieStore = await cookies();
  return cookieStore.get(TOKEN_COOKIE)?.value;
}
