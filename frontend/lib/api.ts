import { cookies } from "next/headers";

const INTERNAL_BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000";

export type CarRecord = {
  _id: string;
  sourceUrl: string;
  title: string;
  brand: string;
  model: string;
  year: number | null;
  mileage: number | null;
  price: number | null;
  priceRub: number | null;
  priceTotal: number | null;
  priceTotalRub: number | null;
  extraCosts: number | null;
  extraCostsRub: number | null;
  region: string;
  color: string;
  transmission: string;
  fuel: string;
  engineVolume: string;
  bodyType: string;
  drive: string;
  steering: string;
  doors: string;
  seats: string;
  inspection: string;
  repairHistory: string;
  oneOwner: string;
  nonSmoking: string;
  seller: string;
  dealerPhone: string;
  sellerAddress: string;
  vinTail: string;
  warranty: string;
  service: string;
  imageUrls: string[];
  features: string[];
  description: string;
  rawSpecs?: Record<string, unknown> & {
    normalized?: {
      mileage?: number | null;
    };
  };
};

export type CarsApiResponse = {
  items: CarRecord[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
};

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
  return fetchFromBackend<CarsApiResponse>(`/api/cars?${queryString}`, "Не удалось загрузить список автомобилей");
}

export async function fetchCarById(id: string) {
  return fetchFromBackend<CarRecord>(`/api/cars/${id}`, "Не удалось загрузить автомобиль");
}
