import { ActiveView } from '../types/navigation';

export interface RouteState {
  view: ActiveView;
  albumId?: string;
}

/**
 * Maps an ActiveView state to a clean, canonical URL pathname.
 */
export const viewToPath = (view: ActiveView, albumId?: string): string => {
  switch (view) {
    case 'home':
      return '/';
    case 'photos':
      return '/photos';
    case 'videos':
      return '/videos';
    case 'documents':
      return '/docs';
    case 'albums':
      return '/albums';
    case 'album_detail':
      return albumId ? `/albums/${encodeURIComponent(albumId)}` : '/albums';
    case 'favourites':
      return '/favourites';
    case 'trash':
      return '/trash';
    case 'settings':
      return '/settings';
    case 'privacy':
      return '/privacy';
    default:
      return '/';
  }
};

/**
 * Parses any incoming URL pathname into the corresponding ActiveView and parameters.
 * Supports legacy aliases (e.g. /vault -> /settings, /saved -> /favourites, /documents -> /docs).
 */
export const pathToView = (pathname: string): RouteState => {
  if (!pathname) return { view: 'home' };

  // Strip trailing slashes except root
  const clean = pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;

  if (clean === '' || clean === '/' || clean === '/home') {
    return { view: 'home' };
  }
  if (clean === '/photos') {
    return { view: 'photos' };
  }
  if (clean === '/videos') {
    return { view: 'videos' };
  }
  if (clean === '/docs' || clean === '/documents') {
    return { view: 'documents' };
  }
  if (clean === '/albums') {
    return { view: 'albums' };
  }
  if (clean.startsWith('/albums/')) {
    const albumId = decodeURIComponent(clean.replace('/albums/', ''));
    return { view: 'album_detail', albumId };
  }
  if (clean === '/favourites' || clean === '/saved') {
    return { view: 'favourites' };
  }
  if (clean === '/trash' || clean === '/recently-deleted') {
    return { view: 'trash' };
  }
  if (clean === '/settings' || clean === '/vault') {
    return { view: 'settings' };
  }
  if (clean === '/privacy') {
    return { view: 'privacy' };
  }
  if (clean === '/share-target') {
    return { view: 'home' };
  }

  // Fallback for any unknown path
  return { view: 'home' };
};

/**
 * Updates document title based on the active view.
 */
export const updateDocumentTitle = (view: ActiveView, albumName?: string): void => {
  if (typeof document === 'undefined') return;

  const titles: Record<ActiveView, string> = {
    home: 'Poojaspace ✨ • Personal Memory Vault',
    photos: 'Photos • Poojaspace',
    videos: 'Videos • Poojaspace',
    documents: 'Documents • Poojaspace',
    albums: 'Albums • Poojaspace',
    album_detail: albumName ? `${albumName} • Albums • Poojaspace` : 'Album • Poojaspace',
    favourites: 'Saved Moments • Poojaspace',
    trash: 'Recently Deleted • Poojaspace',
    settings: 'Storage & Settings • Poojaspace',
    privacy: 'Privacy & Security • Poojaspace',
  };

  document.title = titles[view] || 'Poojaspace';
};

type RouteListener = (route: RouteState) => void;
const listeners: Set<RouteListener> = new Set();

/**
 * Subscribes to route changes (including popstate Back/Forward button presses).
 */
export const subscribeToRoute = (listener: RouteListener): (() => void) => {
  listeners.add(listener);

  // Initialize popstate listener if in browser environment
  if (typeof window !== 'undefined' && listeners.size === 1) {
    window.addEventListener('popstate', handlePopState);
  }

  return () => {
    listeners.delete(listener);
    if (typeof window !== 'undefined' && listeners.size === 0) {
      window.removeEventListener('popstate', handlePopState);
    }
  };
};

const handlePopState = (): void => {
  if (typeof window === 'undefined') return;
  const route = pathToView(window.location.pathname);
  listeners.forEach((fn) => fn(route));
};

/**
 * Programmatically navigate to a view and update the browser URL and history.
 */
export const navigateTo = (
  view: ActiveView,
  options?: {
    albumId?: string;
    replace?: boolean;
    albumName?: string;
  }
): void => {
  if (typeof window === 'undefined') return;

  const targetPath = viewToPath(view, options?.albumId);
  const currentPath = window.location.pathname;

  if (currentPath !== targetPath) {
    if (options?.replace) {
      window.history.replaceState(null, '', targetPath);
    } else {
      window.history.pushState(null, '', targetPath);
    }
  }

  updateDocumentTitle(view, options?.albumName);

  const route: RouteState = { view, albumId: options?.albumId };
  listeners.forEach((fn) => fn(route));
};
