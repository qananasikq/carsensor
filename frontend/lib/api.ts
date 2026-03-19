import { cookies } from "next/headers";

const INTERNAL_BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000";

type ApiResult<T> = T | null | undefined;

function createAuthHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`
  };
}

function getToken() {
  return cookies().get("token")?.value || "";
}

function buildQueryString(searchParams: Record<string, string | undefined>) {
  const params = new URLSearchParams();

  Object.entries(searchParams).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });

  return params.toString();
}

async function fetchFromBackend<T>(path: string, errorMessage: string): Promise<ApiResult<T>> {
  const response = await fetch(`${INTERNAL_BACKEND_URL}${path}`, {
    headers: createAuthHeaders(getToken()),
    cache: "no-store"
  });

  if (response.status === 401) {
    return null;
  }

  if (response.status === 404) {
    return undefined;
  }

  if (!response.ok) {
    throw new Error(errorMessage);
  }

  return response.json();
}

export async function fetchCars(searchParams: Record<string, string | undefined>) {
  const queryString = buildQueryString(searchParams);
  return fetchFromBackend(`/api/cars?${queryString}`, "Не удалось загрузить список автомобилей");
}

export async function fetchCarById(id: string) {
  return fetchFromBackend(`/api/cars/${id}`, "Не удалось загрузить автомобиль");
}
