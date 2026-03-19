"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { setTokenCookie } from "@/lib/auth";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

export default function LoginForm() {
  const router = useRouter();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${BACKEND_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login, password })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Не удалось войти");
        return;
      }

      setTokenCookie(data.token);
      router.push("/cars");
      router.refresh();
    } catch (error) {
      setError("Сервер недоступен");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="panel w-full max-w-md p-6 md:p-7">
      <h1 className="text-2xl font-semibold tracking-tight">Вход</h1>
      <p className="mt-2 text-sm text-slate-600">Введите логин и пароль администратора.</p>

      <div className="mt-6 space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Логин</label>
          <input value={login} onChange={(e) => setLogin(e.target.value)} className="field w-full" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Пароль</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="field w-full" />
        </div>
      </div>

      {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

      <button disabled={loading} className="btn-primary mt-6 w-full py-3 disabled:opacity-60">
        {loading ? "Проверка данных..." : "Войти"}
      </button>
    </form>
  );
}
