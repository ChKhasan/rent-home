export type MapCoordinate = [number, number];

export interface CommuteDestination {
  label: string;
  coordinates: MapCoordinate;
}

export interface GeocodeSearchResult {
  label?: string;
  latitude?: number;
  longitude?: number;
}

export interface GeocodeSearchResponse {
  results?: GeocodeSearchResult[];
  source?: string;
  attribution?: string;
}

export interface NearbyRouteDistance {
  ri: string | number;
  distance_m?: number;
}

export interface NearbyRoutesResponse {
  routes?: Array<string | number>;
  route_distances?: NearbyRouteDistance[];
}

export function extractCommuteDestination(result: GeocodeSearchResponse, fallbackLabel: string): CommuteDestination | null {
  const place = Array.isArray(result?.results) ? result.results[0] : null;
  const latitude = Number(place?.latitude);
  const longitude = Number(place?.longitude);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;

  const label = typeof place?.label === 'string' && place.label.trim()
    ? place.label.trim()
    : fallbackLabel;

  return {
    label,
    coordinates: [latitude, longitude],
  };
}

export function normalizeNearbyRouteIds(response: NearbyRoutesResponse | null | undefined): string[] {
  const routes = Array.isArray(response?.routes) ? response.routes : [];
  return [...new Set(routes.map((route) => String(route).trim()).filter(Boolean))];
}
