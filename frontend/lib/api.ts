import axios from "axios";

const BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "";

export const api = axios.create({
  baseURL: BASE,
  timeout: 8000,
});

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

// ── Built-in fallback data (works without backend) ────────────────────────────
const FALLBACK_DB: Record<string, AnalyzeResponse> = {
  default: {
    project_title: "",
    summary: "A technical project requiring various hardware and software components.",
    hardware: [
      { name: "Arduino Uno R3", category: "hardware", description: "Main microcontroller board", quantity: 1, search_query: "Arduino Uno R3 microcontroller" },
      { name: "Breadboard", category: "hardware", description: "Solderless prototyping board", quantity: 1, search_query: "830 point breadboard" },
      { name: "Jumper Wires Kit", category: "hardware", description: "Male-male, male-female, female-female wires", quantity: 1, search_query: "jumper wires kit 120pcs" },
      { name: "Resistor Kit", category: "hardware", description: "Assorted resistors 10Ω–1MΩ", quantity: 1, search_query: "resistor assortment kit" },
      { name: "LED Pack", category: "hardware", description: "Assorted 5mm LEDs", quantity: 1, search_query: "LED assorted pack 5mm" },
    ],
    software: [
      { name: "Arduino IDE", category: "software", description: "Development environment for Arduino", quantity: 1, search_query: "Arduino IDE free download" },
      { name: "VS Code", category: "software", description: "Code editor", quantity: 1, search_query: "VS Code download" },
    ],
  },
  irrigation: {
    project_title: "Smart Irrigation System using IoT",
    summary: "An IoT-based irrigation system that monitors soil moisture and automates watering using sensors and a microcontroller connected to the cloud.",
    hardware: [
      { name: "Arduino Uno R3", category: "hardware", description: "Main microcontroller", quantity: 1, search_query: "Arduino Uno R3 microcontroller board" },
      { name: "Soil Moisture Sensor", category: "hardware", description: "Detects soil water level", quantity: 2, search_query: "capacitive soil moisture sensor module" },
      { name: "ESP8266 NodeMCU", category: "hardware", description: "WiFi connectivity module", quantity: 1, search_query: "ESP8266 NodeMCU WiFi module" },
      { name: "Relay Module 5V", category: "hardware", description: "Controls water pump", quantity: 1, search_query: "5V relay module single channel" },
      { name: "Water Pump 12V", category: "hardware", description: "Pumps water to plants", quantity: 1, search_query: "12V mini submersible water pump" },
      { name: "DHT11 Sensor", category: "hardware", description: "Temperature and humidity sensor", quantity: 1, search_query: "DHT11 temperature humidity sensor module" },
      { name: "Jumper Wires", category: "hardware", description: "Circuit connections", quantity: 20, search_query: "jumper wires male female breadboard" },
      { name: "Breadboard", category: "hardware", description: "Prototyping board", quantity: 1, search_query: "830 point solderless breadboard" },
    ],
    software: [
      { name: "Arduino IDE", category: "software", description: "Programming environment", quantity: 1, search_query: "Arduino IDE download free" },
      { name: "Blynk IoT Platform", category: "software", description: "Cloud dashboard for IoT", quantity: 1, search_query: "Blynk IoT platform" },
      { name: "PubSubClient MQTT Library", category: "software", description: "MQTT messaging protocol", quantity: 1, search_query: "PubSubClient MQTT Arduino library" },
    ],
  },
  robot: {
    project_title: "Line Following Robot",
    summary: "A robot that follows a black line on a white surface using IR sensors and a motor driver controlled by a microcontroller.",
    hardware: [
      { name: "Arduino Uno R3", category: "hardware", description: "Main controller", quantity: 1, search_query: "Arduino Uno R3 board" },
      { name: "IR Sensor Module", category: "hardware", description: "Detects line on surface", quantity: 2, search_query: "IR infrared sensor module" },
      { name: "L298N Motor Driver", category: "hardware", description: "Controls DC motors", quantity: 1, search_query: "L298N dual H-bridge motor driver" },
      { name: "DC Gear Motor 6V", category: "hardware", description: "Drives wheels", quantity: 2, search_query: "DC gear motor 6V robot" },
      { name: "Robot Chassis Kit", category: "hardware", description: "2WD robot body", quantity: 1, search_query: "2WD robot car chassis kit" },
      { name: "Li-Po Battery 7.4V", category: "hardware", description: "Power supply", quantity: 1, search_query: "7.4V LiPo battery 1000mAh" },
    ],
    software: [
      { name: "Arduino IDE", category: "software", description: "Programming environment", quantity: 1, search_query: "Arduino IDE download" },
    ],
  },
  home: {
    project_title: "Home Automation with Raspberry Pi",
    summary: "A Raspberry Pi-based home automation system that controls lights, fans, and appliances via a web interface.",
    hardware: [
      { name: "Raspberry Pi 4 Model B", category: "hardware", description: "Main controller running Linux", quantity: 1, search_query: "Raspberry Pi 4 Model B 4GB" },
      { name: "4-Channel Relay Module", category: "hardware", description: "Controls appliances", quantity: 1, search_query: "4 channel relay module 5V" },
      { name: "DHT22 Sensor", category: "hardware", description: "Temperature and humidity", quantity: 1, search_query: "DHT22 temperature humidity sensor" },
      { name: "PIR Motion Sensor", category: "hardware", description: "Motion detection", quantity: 2, search_query: "PIR motion sensor HC-SR501" },
      { name: "MicroSD Card 32GB", category: "hardware", description: "OS storage", quantity: 1, search_query: "32GB microSD card class 10" },
    ],
    software: [
      { name: "Raspberry Pi OS", category: "software", description: "Operating system", quantity: 1, search_query: "Raspberry Pi OS download" },
      { name: "Home Assistant", category: "software", description: "Home automation platform", quantity: 1, search_query: "Home Assistant installation" },
      { name: "Node-RED", category: "software", description: "Flow-based programming tool", quantity: 1, search_query: "Node-RED IoT automation" },
    ],
  },
};

const FALLBACK_PRICES: Record<string, OnlineProduct[]> = {
  "Arduino Uno R3": [
    { platform: "Amazon", name: "Arduino Uno R3 Original Board", price: 649, currency: "INR", rating: 4.5, reviews_count: 12400, url: "https://www.amazon.in/s?k=arduino+uno+r3", image_url: "https://placehold.co/200x200/1f2937/06b6d4?text=Arduino", availability: "in_stock" },
    { platform: "Flipkart", name: "Arduino Uno R3 Microcontroller", price: 599, currency: "INR", rating: 4.3, reviews_count: 8700, url: "https://www.flipkart.com/search?q=arduino+uno", image_url: "https://placehold.co/200x200/1f2937/06b6d4?text=Arduino", availability: "in_stock" },
    { platform: "Robu.in", name: "Arduino Uno R3 Compatible", price: 349, currency: "INR", rating: 4.1, reviews_count: 2300, url: "https://robu.in/?s=arduino+uno", image_url: "https://placehold.co/200x200/1f2937/06b6d4?text=Arduino", availability: "in_stock" },
  ],
  "Soil Moisture Sensor": [
    { platform: "Amazon", name: "Capacitive Soil Moisture Sensor v1.2", price: 149, currency: "INR", rating: 4.2, reviews_count: 3200, url: "https://www.amazon.in/s?k=soil+moisture+sensor", image_url: "https://placehold.co/200x200/1f2937/06b6d4?text=Sensor", availability: "in_stock" },
    { platform: "Flipkart", name: "Soil Moisture Sensor Module", price: 129, currency: "INR", rating: 4.0, reviews_count: 1800, url: "https://www.flipkart.com/search?q=soil+moisture+sensor", image_url: "https://placehold.co/200x200/1f2937/06b6d4?text=Sensor", availability: "in_stock" },
    { platform: "Robu.in", name: "Capacitive Soil Moisture Sensor", price: 99, currency: "INR", rating: 4.3, reviews_count: 560, url: "https://robu.in/?s=soil+moisture", image_url: "https://placehold.co/200x200/1f2937/06b6d4?text=Sensor", availability: "in_stock" },
  ],
};

function getFallbackAnalysis(title: string): AnalyzeResponse {
  const t = title.toLowerCase();
  let data = FALLBACK_DB.default;
  if (t.includes("irrigat") || t.includes("water") || t.includes("soil")) data = FALLBACK_DB.irrigation;
  else if (t.includes("robot") || t.includes("line follow")) data = FALLBACK_DB.robot;
  else if (t.includes("home") || t.includes("automat") || t.includes("raspberry")) data = FALLBACK_DB.home;
  return { ...data, project_title: title };
}

function getFallbackPrices(componentName: string, searchQuery: string): PriceComparison {
  const key = Object.keys(FALLBACK_PRICES).find(k => componentName.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(componentName.toLowerCase()));
  const products = key ? FALLBACK_PRICES[key] : [
    { platform: "Amazon", name: componentName, price: undefined, currency: "INR", rating: undefined, reviews_count: undefined, url: `https://www.amazon.in/s?k=${encodeURIComponent(searchQuery)}`, image_url: `https://placehold.co/200x200/1f2937/06b6d4?text=${encodeURIComponent(componentName.split(" ")[0])}`, availability: "unknown" },
    { platform: "Flipkart", name: componentName, price: undefined, currency: "INR", rating: undefined, reviews_count: undefined, url: `https://www.flipkart.com/search?q=${encodeURIComponent(searchQuery)}`, image_url: `https://placehold.co/200x200/1f2937/06b6d4?text=${encodeURIComponent(componentName.split(" ")[0])}`, availability: "unknown" },
    { platform: "Robu.in", name: componentName, price: undefined, currency: "INR", rating: undefined, reviews_count: undefined, url: `https://robu.in/?s=${encodeURIComponent(searchQuery)}`, image_url: `https://placehold.co/200x200/1f2937/06b6d4?text=${encodeURIComponent(componentName.split(" ")[0])}`, availability: "unknown" },
  ];
  const priced = products.filter(p => p.price != null);
  return {
    component_name: componentName,
    products,
    lowest_price: priced.length ? priced.reduce((a, b) => (a.price! < b.price! ? a : b)) : undefined,
    best_rated: products.filter(p => p.rating).reduce((a, b) => ((a.rating || 0) > (b.rating || 0) ? a : b), products[0]),
  };
}

async function tryBackend<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  if (!BASE || BASE.includes("localhost")) return fallback;
  try { return await fn(); } catch { return fallback; }
}

// ── API calls ─────────────────────────────────────────────────────────────────
export async function analyzeProject(title: string): Promise<AnalyzeResponse> {
  return tryBackend(
    async () => { const { data } = await api.post("/api/analyze/", { project_title: title }); return data; },
    getFallbackAnalysis(title)
  );
}

export async function getNearbyStores(componentName: string, lat: number, lng: number): Promise<StoreResult[]> {
  return tryBackend(
    async () => { const { data } = await api.post("/api/stores/nearby", { component_name: componentName, latitude: lat, longitude: lng, radius_meters: 15000 }); return data.stores; },
    [
      { place_id: "mock_1", name: "Electronics Hub", address: "123 Tech Street, Electronics Market", rating: 4.2, total_ratings: 340, distance_km: 1.2, open_now: true, maps_url: "https://maps.google.com", lat: lat + 0.01, lng: lng + 0.01 },
      { place_id: "mock_2", name: "Component World", address: "456 Circuit Avenue, Tech Zone", rating: 4.5, total_ratings: 210, distance_km: 2.8, open_now: true, maps_url: "https://maps.google.com", lat: lat + 0.02, lng: lng - 0.01 },
      { place_id: "mock_3", name: "Robomart Electronics", address: "789 Maker Lane, Innovation District", rating: 3.9, total_ratings: 95, distance_km: 4.1, open_now: false, maps_url: "https://maps.google.com", lat: lat - 0.03, lng: lng + 0.02 },
    ]
  );
}

export async function comparePrices(componentName: string, searchQuery: string): Promise<PriceComparison> {
  return tryBackend(
    async () => { const { data } = await api.post("/api/compare/", { component_name: componentName, search_query: searchQuery }); return data; },
    getFallbackPrices(componentName, searchQuery)
  );
}

export async function compareBulk(components: Component[]): Promise<PriceComparison[]> {
  return tryBackend(
    async () => { const { data } = await api.post("/api/compare/bulk", components.map(c => ({ component_name: c.name, search_query: c.search_query }))); return data; },
    components.map(c => getFallbackPrices(c.name, c.search_query))
  );
}

export async function saveProject(userId: string, projectTitle: string, analysis: AnalyzeResponse, bookmarked: string[] = []) {
  try { const { data } = await api.post("/api/projects/save", { user_id: userId, project_title: projectTitle, analysis, bookmarked_components: bookmarked }); return data; } catch { return null; }
}

export async function getUserProjects(userId: string) {
  try { const { data } = await api.get(`/api/projects/${userId}`); return data.projects; } catch { return []; }
}

export async function deleteProject(projectId: string, userId: string) {
  try { await api.delete(`/api/projects/${projectId}?user_id=${userId}`); } catch { /* ignore */ }
}
