import { NextResponse } from "next/server";

export async function POST() {
  const secure = process.env.NODE_ENV === "production";
  const response = NextResponse.json({ ok: true });

  response.cookies.set({
    name: "token",
    value: "",
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: 0
  });

  return response;
}
