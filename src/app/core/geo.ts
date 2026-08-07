export interface GeoJSONPoint {
  type: 'Point';
  coordinates: [number, number];
}

export interface AnnouncementLocation {
  location?: GeoJSONPoint | null;
  location_x?: string | number | null;
  location_y?: string | number | null;
}

export function resolveAnnouncementCoordinates(value: AnnouncementLocation | null | undefined): [number, number] | null {
  const coordinates = value?.location?.type === 'Point' ? value.location.coordinates : null;
  const latitude = Number(coordinates?.[1] ?? value?.location_x);
  const longitude = Number(coordinates?.[0] ?? value?.location_y);
  if (
    !Number.isFinite(latitude)
    || !Number.isFinite(longitude)
    || Math.abs(latitude) < 1
    || Math.abs(longitude) < 1
    || Math.abs(latitude) > 90
    || Math.abs(longitude) > 180
  ) {
    return null;
  }
  return [latitude, longitude];
}

export function toGeoJSONPoint(latitude: number | null | undefined, longitude: number | null | undefined): GeoJSONPoint | null {
  if (latitude === null || latitude === undefined || longitude === null || longitude === undefined) return null;
  const resolved = resolveAnnouncementCoordinates({ location_x: latitude, location_y: longitude });
  return resolved ? { type: 'Point', coordinates: [resolved[1], resolved[0]] } : null;
}
