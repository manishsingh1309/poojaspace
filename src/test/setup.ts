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

// Polyfill URL.createObjectURL and URL.revokeObjectURL in jsdom
if (typeof URL.createObjectURL === 'undefined') {
  URL.createObjectURL = (_blob: Blob) => `blob:mock-blob-${Math.random().toString(36).substring(2, 9)}`;
}
if (typeof URL.revokeObjectURL === 'undefined') {
  URL.revokeObjectURL = () => {};
}
