import {
  extractCommuteDestination,
  normalizeNearbyRouteIds,
} from './commute-search.utils';

describe('commute search utilities', () => {
  it('extracts coordinates and the resolved address from the geocode API', () => {
    const result = {
      results: [{
        label: 'Toshkent, Amir Temur shoh ko‘chasi, 108',
        latitude: 41.3412,
        longitude: 69.2867,
      }],
    };

    expect(extractCommuteDestination(result, 'TATU')).toEqual({
      label: 'Toshkent, Amir Temur shoh ko‘chasi, 108',
      coordinates: [41.3412, 69.2867],
    });
  });

  it('rejects an invalid geocode result', () => {
    const result = {
      results: [{ latitude: Number.NaN, longitude: 69.2 }],
    };

    expect(extractCommuteDestination(result, 'Noma’lum joy')).toBeNull();
  });

  it('normalizes and deduplicates nearby route ids', () => {
    expect(normalizeNearbyRouteIds({ routes: [101, '101', ' 202 ', ''] })).toEqual(['101', '202']);
  });
});
