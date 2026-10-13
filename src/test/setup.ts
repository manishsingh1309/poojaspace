import '@testing-library/jest-dom';

// Polyfill wakeLock if not present in jsdom
if (!('wakeLock' in navigator)) {
  Object.defineProperty(navigator, 'wakeLock', {
    value: {
      request: async () => ({
        release: async () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
      }),
    },
    configurable: true,
  });
}
