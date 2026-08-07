export type MapCoordinate = [number, number];

export interface RouteProximity {
  distanceMeters: number;
  nearestPoint: MapCoordinate;
}

export type RouteStopDirection = 'forward' | 'backward';

export interface RouteStop {
  key: string;
  id: string;
  name: string;
  direction: RouteStopDirection;
  coordinate: MapCoordinate;
}

export interface RouteStopProximity {
  distanceMeters: number;
  stop: RouteStop;
}

const EARTH_RADIUS_METERS = 6_371_000;

const isCoordinate = (latitude: number, longitude: number) =>
  Number.isFinite(latitude)
  && Number.isFinite(longitude)
  && Math.abs(latitude) <= 90
  && Math.abs(longitude) <= 180;

export const parseRoutePath = (value: unknown): MapCoordinate[] => {
  if (typeof value !== 'string' || !value.trim()) return [];

  return value.trim().split(/\s+/).reduce<MapCoordinate[]>((coordinates, token) => {
    const [rawLatitude, rawLongitude] = token.split(',');
    const latitude = Number(rawLatitude);
    const longitude = Number(rawLongitude);
    if (isCoordinate(latitude, longitude)) coordinates.push([latitude, longitude]);
    return coordinates;
  }, []);
};

export const parseRouteStops = (value: unknown): RouteStop[] => {
  if (!value || typeof value !== 'object') return [];
  const stopGroups = value as Record<RouteStopDirection, unknown>;

  return (['forward', 'backward'] as const).flatMap((direction) => {
    const stops = stopGroups[direction];
    if (!Array.isArray(stops)) return [];

    return stops.reduce<RouteStop[]>((result, rawStop, index) => {
      if (!rawStop || typeof rawStop !== 'object') return result;
      const stop = rawStop as Record<string, unknown>;
      const latitudeValue = stop['x'];
      const longitudeValue = stop['y'];
      if (latitudeValue === null || latitudeValue === '' || longitudeValue === null || longitudeValue === '') {
        return result;
      }
      const latitude = Number(latitudeValue);
      const longitude = Number(longitudeValue);
      if (!isCoordinate(latitude, longitude)) return result;

      const id = String(stop['i'] ?? index);
      const name = String(stop['n'] ?? '').trim() || 'Bekat';
      result.push({
        key: `${direction}:${id}:${index}`,
        id,
        name,
        direction,
        coordinate: [latitude, longitude],
      });
      return result;
    }, []);
  });
};

export const findNearestRouteStop = (
  property: MapCoordinate,
  stops: readonly RouteStop[],
): RouteStopProximity | null => {
  let nearest: RouteStopProximity | null = null;

  stops.forEach((stop) => {
    const distanceMeters = coordinateDistanceMeters(property, stop.coordinate);
    if (!nearest || distanceMeters < nearest.distanceMeters) {
      nearest = { distanceMeters, stop };
    }
  });

  return nearest;
};

export const findNearestRoutePoint = (
  property: MapCoordinate,
  paths: readonly (readonly MapCoordinate[])[],
): RouteProximity | null => {
  const latitudeRadians = property[0] * Math.PI / 180;
  const longitudeScale = Math.max(Math.cos(latitudeRadians), 0.000001);
  const toLocalMeters = (coordinate: MapCoordinate): [number, number] => [
    (coordinate[1] - property[1]) * Math.PI / 180 * EARTH_RADIUS_METERS * longitudeScale,
    (coordinate[0] - property[0]) * Math.PI / 180 * EARTH_RADIUS_METERS,
  ];
  const toCoordinate = ([x, y]: [number, number]): MapCoordinate => [
    property[0] + y / EARTH_RADIUS_METERS * 180 / Math.PI,
    property[1] + x / (EARTH_RADIUS_METERS * longitudeScale) * 180 / Math.PI,
  ];

  let closestLocalPoint: [number, number] | null = null;
  let closestSquaredDistance = Number.POSITIVE_INFINITY;

  paths.forEach((path) => {
    if (!path.length) return;
    if (path.length === 1) {
      const point = toLocalMeters(path[0]);
      const squaredDistance = point[0] ** 2 + point[1] ** 2;
      if (squaredDistance < closestSquaredDistance) {
        closestSquaredDistance = squaredDistance;
        closestLocalPoint = point;
      }
      return;
    }

    for (let index = 0; index < path.length - 1; index += 1) {
      const start = toLocalMeters(path[index]);
      const end = toLocalMeters(path[index + 1]);
      const segmentX = end[0] - start[0];
      const segmentY = end[1] - start[1];
      const segmentLengthSquared = segmentX ** 2 + segmentY ** 2;
      const projection = segmentLengthSquared === 0
        ? 0
        : Math.max(0, Math.min(1, -(start[0] * segmentX + start[1] * segmentY) / segmentLengthSquared));
      const point: [number, number] = [
        start[0] + projection * segmentX,
        start[1] + projection * segmentY,
      ];
      const squaredDistance = point[0] ** 2 + point[1] ** 2;
      if (squaredDistance < closestSquaredDistance) {
        closestSquaredDistance = squaredDistance;
        closestLocalPoint = point;
      }
    }
  });

  if (!closestLocalPoint) return null;
  return {
    distanceMeters: Math.sqrt(closestSquaredDistance),
    nearestPoint: toCoordinate(closestLocalPoint),
  };
};

export const formatRouteDistance = (distanceMeters: number) => {
  if (distanceMeters < 20) return '20 m dan yaqin';
  if (distanceMeters < 1000) return `${Math.round(distanceMeters)} m`;
  return `${(distanceMeters / 1000).toFixed(1)} km`;
};

const coordinateDistanceMeters = (first: MapCoordinate, second: MapCoordinate) => {
  const latitudeDelta = (second[0] - first[0]) * Math.PI / 180;
  const longitudeDelta = (second[1] - first[1]) * Math.PI / 180;
  const firstLatitude = first[0] * Math.PI / 180;
  const secondLatitude = second[0] * Math.PI / 180;
  const haversine = Math.sin(latitudeDelta / 2) ** 2
    + Math.cos(firstLatitude) * Math.cos(secondLatitude) * Math.sin(longitudeDelta / 2) ** 2;
  return EARTH_RADIUS_METERS * 2 * Math.atan2(
    Math.sqrt(haversine),
    Math.sqrt(Math.max(0, 1 - haversine)),
  );
};
