"use client";

import { useRouter } from "next/navigation";
import { clearTokenCookie } from "@/lib/auth";

export default function LogoutButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => {
        clearTokenCookie();
        router.push("/login");
        router.refresh();
      }}
      className="btn-soft"
    >
      Выйти
    </button>
  );
}
