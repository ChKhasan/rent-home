import {
  extractCommuteDestination,
  extractCommuteDestinations,
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

  it('returns every valid unique geocode option for an explicit user choice', () => {
    const result = {
      results: [
        { label: 'TATU, Amir Temur', latitude: 41.34, longitude: 69.28 },
        { label: 'TATU, Yunusobod', latitude: 41.37, longitude: 69.29 },
        { label: 'Takroriy natija', latitude: 41.34, longitude: 69.28 },
        { label: 'Noto‘g‘ri natija', latitude: Number.NaN, longitude: 69.2 },
      ],
    };

    expect(extractCommuteDestinations(result, 'TATU')).toEqual([
      { label: 'TATU, Amir Temur', coordinates: [41.34, 69.28] },
      { label: 'TATU, Yunusobod', coordinates: [41.37, 69.29] },
    ]);
  });

  it('normalizes and deduplicates nearby route ids', () => {
    expect(normalizeNearbyRouteIds({ routes: [101, '101', ' 202 ', ''] })).toEqual(['101', '202']);
  });
});
