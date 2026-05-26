'use server';

import { cookies } from "next/headers";
import { TOKEN_COOKIE, TOKEN_MAX_AGE } from "@/lib/cookie-constants";
import type { LoginResponseType, loginType } from "@/types/auth.type";

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

export async function loginAction(data: loginType): Promise<LoginResponseType> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_API_URL;

  if (!baseUrl) {
    return {
      success: false,
      message: "Base API URL is not configured",
      data: null,
      timestamp: null,
    };
  }

  const response = await fetch(`${baseUrl}/client/onboarding/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const responseBody = (await response.json()) as LoginResponseType;

  if (responseBody.success && responseBody.data?.token) {
    await createSession(responseBody.data.token);

    return {
      ...responseBody,
      data: {
        email: responseBody.data.email,
        countryCode: responseBody.data.countryCode,
        message: responseBody.data.message,
      },
    };
  }

  return responseBody;
}
