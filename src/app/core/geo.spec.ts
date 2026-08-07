import { resolveAnnouncementCoordinates, toGeoJSONPoint } from './geo';

describe('announcement geo helpers', () => {
  it('converts GeoJSON longitude/latitude into map latitude/longitude', () => {
    expect(resolveAnnouncementCoordinates({
      location: { type: 'Point', coordinates: [69.28704, 41.3134] },
    })).toEqual([41.3134, 69.28704]);
  });

  it('keeps legacy coordinates compatible', () => {
    expect(resolveAnnouncementCoordinates({ location_x: '41.28', location_y: '69.2' }))
      .toEqual([41.28, 69.2]);
    expect(toGeoJSONPoint(41.28, 69.2))
      .toEqual({ type: 'Point', coordinates: [69.2, 41.28] });
  });

  it('rejects missing and non-finite coordinates', () => {
    expect(resolveAnnouncementCoordinates(undefined)).toBeNull();
    expect(resolveAnnouncementCoordinates({
      location: { type: 'Point', coordinates: [Number.NaN, 41.3] },
    })).toBeNull();
  });
});
