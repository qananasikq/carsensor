import { NextResponse } from "next/server";

function getBackendUrl() {
  const configuredUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL;

  if (configuredUrl) {
    return configuredUrl.replace(/\/$/, "");
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("Missing BACKEND_URL or NEXT_PUBLIC_API_URL in production");
  }

  return "http://localhost:4000";
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const backendUrl = getBackendUrl();

    const response = await fetch(`${backendUrl}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store"
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return NextResponse.json(
        { message: data?.message || "Не удалось войти" },
        { status: response.status }
      );
    }

    const token = data?.token;
    if (!token || typeof token !== "string") {
      return NextResponse.json({ message: "Некорректный ответ авторизации" }, { status: 500 });
    }

    const secure = process.env.NODE_ENV === "production";
    const result = NextResponse.json({ ok: true });
    result.cookies.set({
      name: "token",
      value: token,
      httpOnly: true,
      secure,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 12
    });

    return result;
  } catch (error) {
    console.error("Auth login proxy failed:", error);
    return NextResponse.json({ message: "Сервер недоступен" }, { status: 502 });
  }
}
