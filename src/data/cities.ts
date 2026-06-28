export interface City {
  id: string;
  name: string;
  country: string;
  latitude: number;
  longitude: number;
}

/**
 * The starter set of 10 cities. Adding a city is as simple as appending an
 * entry here with its coordinates — the rest of the app is data-driven.
 */
export const CITIES: City[] = [
  { id: "gothenburg", name: "Gothenburg", country: "Sweden", latitude: 57.71, longitude: 11.97 },
  { id: "stockholm", name: "Stockholm", country: "Sweden", latitude: 59.33, longitude: 18.07 },
  { id: "london", name: "London", country: "United Kingdom", latitude: 51.51, longitude: -0.13 },
  { id: "paris", name: "Paris", country: "France", latitude: 48.85, longitude: 2.35 },
  { id: "berlin", name: "Berlin", country: "Germany", latitude: 52.52, longitude: 13.4 },
  { id: "new-york", name: "New York", country: "United States", latitude: 40.71, longitude: -74.01 },
  { id: "tokyo", name: "Tokyo", country: "Japan", latitude: 35.68, longitude: 139.65 },
  { id: "sydney", name: "Sydney", country: "Australia", latitude: -33.87, longitude: 151.21 },
  { id: "cape-town", name: "Cape Town", country: "South Africa", latitude: -33.92, longitude: 18.42 },
  { id: "rio", name: "Rio de Janeiro", country: "Brazil", latitude: -22.91, longitude: -43.17 },
];
