import { describe, it, expect } from 'vitest';
import { pathToView, viewToPath } from '../utils/router';

describe('Router URL and View conversions', () => {
  it('maps root and home paths to home view', () => {
    expect(pathToView('/')).toEqual({ view: 'home' });
    expect(pathToView('/home')).toEqual({ view: 'home' });
    expect(pathToView('')).toEqual({ view: 'home' });
  });

  it('maps photos and videos paths accurately', () => {
    expect(pathToView('/photos')).toEqual({ view: 'photos' });
    expect(pathToView('/videos')).toEqual({ view: 'videos' });
  });

  it('maps docs and documents aliases accurately', () => {
    expect(pathToView('/docs')).toEqual({ view: 'documents' });
    expect(pathToView('/documents')).toEqual({ view: 'documents' });
  });

  it('maps albums and album detail paths with parameter parsing', () => {
    expect(pathToView('/albums')).toEqual({ view: 'albums' });
    expect(pathToView('/albums/family_diwali')).toEqual({
      view: 'album_detail',
      albumId: 'family_diwali',
    });
    expect(pathToView('/albums/trip%20to%20paris')).toEqual({
      view: 'album_detail',
      albumId: 'trip to paris',
    });
  });

  it('maps vault alias to settings view', () => {
    expect(pathToView('/settings')).toEqual({ view: 'settings' });
    expect(pathToView('/vault')).toEqual({ view: 'settings' });
  });

  it('maps saved alias to favourites view', () => {
    expect(pathToView('/favourites')).toEqual({ view: 'favourites' });
    expect(pathToView('/saved')).toEqual({ view: 'favourites' });
  });

  it('maps viewToPath correctly', () => {
    expect(viewToPath('home')).toBe('/');
    expect(viewToPath('photos')).toBe('/photos');
    expect(viewToPath('videos')).toBe('/videos');
    expect(viewToPath('documents')).toBe('/docs');
    expect(viewToPath('albums')).toBe('/albums');
    expect(viewToPath('album_detail', 'vacation_2024')).toBe('/albums/vacation_2024');
    expect(viewToPath('settings')).toBe('/settings');
    expect(viewToPath('privacy')).toBe('/privacy');
  });
});
