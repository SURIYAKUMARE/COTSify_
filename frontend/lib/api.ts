import axios from "axios";

const BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export const api = axios.create({ baseURL: BASE });

// ── Types ─────────────────────────────────────────────────────────────────────
export interface Component {
  name: string;
  category: "hardware" | "software";
  description: string;
  quantity: number;
  search_query: string;
}

export interface AnalyzeResponse {
  project_title: string;
  summary: string;
  hardware: Component[];
  software: Component[];
}

export interface StoreResult {
  place_id: string;
  name: string;
  address: string;
  rating?: number;
  total_ratings?: number;
  distance_km?: number;
  open_now?: boolean;
  maps_url: string;
  lat: number;
  lng: number;
}

export interface OnlineProduct {
  platform: string;
  name: string;
  price?: number;
  currency: string;
  rating?: number;
  reviews_count?: number;
  url: string;
  image_url?: string;
  availability: string;
}

export interface PriceComparison {
  component_name: string;
  products: OnlineProduct[];
  lowest_price?: OnlineProduct;
  best_rated?: OnlineProduct;
}

// ── API calls ─────────────────────────────────────────────────────────────────
export async function analyzeProject(title: string): Promise<AnalyzeResponse> {
  const { data } = await api.post("/api/analyze/", { project_title: title });
  return data;
}

export async function getNearbyStores(
  componentName: string,
  lat: number,
  lng: number
): Promise<StoreResult[]> {
  const { data } = await api.post("/api/stores/nearby", {
    component_name: componentName,
    latitude: lat,
    longitude: lng,
    radius_meters: 15000,
  });
  return data.stores;
}

export async function comparePrices(
  componentName: string,
  searchQuery: string
): Promise<PriceComparison> {
  const { data } = await api.post("/api/compare/", {
    component_name: componentName,
    search_query: searchQuery,
  });
  return data;
}

export async function compareBulk(
  components: Component[]
): Promise<PriceComparison[]> {
  const { data } = await api.post(
    "/api/compare/bulk",
    components.map((c) => ({
      component_name: c.name,
      search_query: c.search_query,
    }))
  );
  return data;
}

export async function saveProject(
  userId: string,
  projectTitle: string,
  analysis: AnalyzeResponse,
  bookmarked: string[] = []
) {
  const { data } = await api.post("/api/projects/save", {
    user_id: userId,
    project_title: projectTitle,
    analysis,
    bookmarked_components: bookmarked,
  });
  return data;
}

export async function getUserProjects(userId: string) {
  const { data } = await api.get(`/api/projects/${userId}`);
  return data.projects;
}

export async function deleteProject(projectId: string, userId: string) {
  await api.delete(`/api/projects/${projectId}?user_id=${userId}`);
}
