export type MapCoordinate = [number, number];

export interface RouteProximity {
  distanceMeters: number;
  nearestPoint: MapCoordinate;
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
