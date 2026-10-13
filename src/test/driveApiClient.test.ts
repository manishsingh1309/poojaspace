import { describe, it, expect, vi, beforeEach } from 'vitest';
import { driveApiClient } from '../services/driveApiClient';

describe('DriveApiClient', () => {
  const fakeToken = 'mock-oauth-token-12345';

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('discoverOrCreateFolder returns existing folder when found', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        files: [{ id: 'existing_folder_id', name: 'Poojaspace' }],
      }),
    } as Response);

    const folderId = await driveApiClient.discoverOrCreateFolder(fakeToken, 'Poojaspace');
    expect(folderId).toBe('existing_folder_id');
  });

  it('discoverOrCreateFolder creates folder idempotently when not found', async () => {
    // 1. Search returns empty
    const fetchMock = vi
      .spyOn(global, 'fetch')
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ files: [] }),
      } as Response)
      // 2. Post create folder
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ id: 'newly_created_folder_id', name: 'Poojaspace' }),
      } as Response);

    const folderId = await driveApiClient.discoverOrCreateFolder(fakeToken, 'Poojaspace');
    expect(folderId).toBe('newly_created_folder_id');
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('discoverOrCreateTree creates root and all category subfolders', async () => {
    vi.spyOn(global, 'fetch').mockImplementation(async (url, init) => {
      const urlStr = String(url);
      if (urlStr.includes('/files?q=') && urlStr.includes('Albums')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({ files: [{ id: 'album_1', name: 'Family' }] }),
        } as Response;
      }

      if (init?.method === 'POST') {
        return {
          ok: true,
          status: 200,
          json: async () => ({ id: `folder_${Math.random()}` }),
        } as Response;
      }

      return {
        ok: true,
        status: 200,
        json: async () => ({ files: [{ id: 'found_id' }] }),
      } as Response;
    });

    const tree = await driveApiClient.discoverOrCreateTree(fakeToken);
    expect(tree.rootId).toBeDefined();
    expect(tree.photosId).toBeDefined();
    expect(tree.videosId).toBeDefined();
    expect(tree.documentsId).toBeDefined();
    expect(tree.audioOtherId).toBeDefined();
    expect(tree.albumsRootId).toBeDefined();
    expect(tree.recentlyDeletedId).toBeDefined();
  });

  it('softDeleteFile moves file to Recently Deleted and records originalParentId in appProperties', async () => {
    let capturedBody: string | undefined;
    let capturedUrl = '';

    vi.spyOn(global, 'fetch').mockImplementation(async (url, init) => {
      capturedUrl = String(url);
      capturedBody = init?.body as string;
      return {
        ok: true,
        status: 200,
        json: async () => ({
          id: 'file_123',
          parents: ['trash_folder_id'],
        }),
      } as Response;
    });

    await driveApiClient.softDeleteFile(
      fakeToken,
      'file_123',
      'photos_folder_id',
      'trash_folder_id'
    );

    expect(capturedUrl).toContain('addParents=trash_folder_id');
    expect(capturedUrl).toContain('removeParents=photos_folder_id');
    expect(capturedBody).toBeDefined();

    const parsed = JSON.parse(capturedBody!);
    expect(parsed.appProperties.originalParentId).toBe('photos_folder_id');
    expect(parsed.appProperties.deletedAt).toBeDefined();
  });

  it('restoreFile moves file back to originalParentId and clears soft-delete properties', async () => {
    let capturedUrl = '';
    vi.spyOn(global, 'fetch').mockImplementation(async (url) => {
      capturedUrl = String(url);
      return {
        ok: true,
        status: 200,
        json: async () => ({ id: 'file_123' }),
      } as Response;
    });

    await driveApiClient.restoreFile(
      fakeToken,
      'file_123',
      'photos_folder_id',
      'trash_folder_id'
    );

    expect(capturedUrl).toContain('addParents=photos_folder_id');
    expect(capturedUrl).toContain('removeParents=trash_folder_id');
  });

  it('toggleFavourite updates appProperties.favourite', async () => {
    let capturedBody = '';
    vi.spyOn(global, 'fetch').mockImplementation(async (_url, init) => {
      capturedBody = init?.body as string;
      return {
        ok: true,
        status: 200,
        json: async () => ({ id: 'file_123' }),
      } as Response;
    });

    await driveApiClient.toggleFavourite(fakeToken, 'file_123', true);
    const parsed = JSON.parse(capturedBody);
    expect(parsed.appProperties.favourite).toBe('true');
  });
});
