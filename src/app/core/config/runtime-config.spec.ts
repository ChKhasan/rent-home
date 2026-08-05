import { getRuntimeConfig, NexthomeRuntimeConfig } from './runtime-config';

describe('getRuntimeConfig', () => {
  const originalConfig = window.__NEXTHOME_RUNTIME_CONFIG__;

  afterEach(() => {
    window.__NEXTHOME_RUNTIME_CONFIG__ = originalConfig;
  });

  it('returns an empty config when runtime values are not injected', () => {
    delete window.__NEXTHOME_RUNTIME_CONFIG__;

    expect(getRuntimeConfig()).toEqual({});
  });

  it('returns the injected browser config', () => {
    const config: NexthomeRuntimeConfig = { yandexMapsApiKey: 'test-key' };
    window.__NEXTHOME_RUNTIME_CONFIG__ = config;

    expect(getRuntimeConfig()).toBe(config);
  });
});
