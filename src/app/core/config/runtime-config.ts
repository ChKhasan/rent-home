export interface NexthomeRuntimeConfig {
  yandexMapsApiKey?: string;
}

declare global {
  interface Window {
    __NEXTHOME_RUNTIME_CONFIG__?: NexthomeRuntimeConfig;
  }
}

export function getRuntimeConfig(): NexthomeRuntimeConfig {
  if (typeof window === 'undefined') {
    return {};
  }

  return window.__NEXTHOME_RUNTIME_CONFIG__ ?? {};
}
