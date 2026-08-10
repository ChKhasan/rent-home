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

export function extractCommuteDestinations(
  result: GeocodeSearchResponse,
  fallbackLabel: string,
): CommuteDestination[] {
  const places = Array.isArray(result?.results) ? result.results : [];
  const seenCoordinates = new Set<string>();

  return places.reduce<CommuteDestination[]>((destinations, place) => {
    const latitude = Number(place?.latitude);
    const longitude = Number(place?.longitude);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return destinations;

    const coordinateKey = `${latitude}:${longitude}`;
    if (seenCoordinates.has(coordinateKey)) return destinations;
    seenCoordinates.add(coordinateKey);

    const label = typeof place?.label === 'string' && place.label.trim()
      ? place.label.trim()
      : fallbackLabel;
    destinations.push({ label, coordinates: [latitude, longitude] });
    return destinations;
  }, []);
}

export function extractCommuteDestination(result: GeocodeSearchResponse, fallbackLabel: string): CommuteDestination | null {
  return extractCommuteDestinations(result, fallbackLabel)[0] ?? null;
}

export function normalizeNearbyRouteIds(response: NearbyRoutesResponse | null | undefined): string[] {
  const routes = Array.isArray(response?.routes) ? response.routes : [];
  return [...new Set(routes.map((route) => String(route).trim()).filter(Boolean))];
}
