import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mediaStreamService } from '../services/mediaStreamService';
import { DriveFile } from '../types/drive';

describe('MediaStreamService', () => {
  const fakeToken = 'test-token-123';

  beforeEach(() => {
    mediaStreamService.clearAll();
    vi.restoreAllMocks();
  });

  it('caches a local blob and returns its object URL', () => {
    const fakeBlob = new Blob(['hello world'], { type: 'text/plain' });
    const url = mediaStreamService.cacheLocalBlob('local_file_1', fakeBlob);

    expect(url).toBeDefined();
    expect(mediaStreamService.getCachedUrl('local_file_1')).toBe(url);
  });

  it('returns local asset paths directly without fetching', async () => {
    const url = await mediaStreamService.getMediaBlobUrl('/assets/hero.jpg');
    expect(url).toBe('/assets/hero.jpg');
  });

  it('fetches authenticated media blob with Bearer token for Drive files', async () => {
    const fakeBlob = new Blob(['image bytes'], { type: 'image/jpeg' });
    let authHeader = '';

    vi.spyOn(global, 'fetch').mockImplementation(async (_url, init) => {
      const headers = new Headers(init?.headers);
      authHeader = headers.get('Authorization') || '';
      return {
        ok: true,
        status: 200,
        blob: async () => fakeBlob,
      } as Response;
    });

    const blobUrl = await mediaStreamService.getMediaBlobUrl('drive_file_99', fakeToken);

    expect(authHeader).toBe(`Bearer ${fakeToken}`);
    expect(blobUrl).toBeDefined();
    expect(mediaStreamService.getCachedUrl('drive_file_99')).toBe(blobUrl);
  });

  it('generates the Google Drive cloud stream preview URL', () => {
    const previewUrl = mediaStreamService.getEmbedPreviewUrl('file_abc_123');
    expect(previewUrl).toBe('https://drive.google.com/file/d/file_abc_123/preview');
  });

  it('downloads file via authenticated blob when token is provided', async () => {
    const fakeBlob = new Blob(['video bytes'], { type: 'video/mp4' });

    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 200,
      blob: async () => fakeBlob,
    } as Response);

    const clickSpy = vi.fn();
    const mockAnchor = {
      href: '',
      download: '',
      target: '',
      rel: '',
      click: clickSpy,
    };

    vi.spyOn(document, 'createElement').mockReturnValue(mockAnchor as unknown as HTMLElement);
    vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockAnchor as unknown as Node);
    vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockAnchor as unknown as Node);

    const testFile: DriveFile = {
      id: 'vid_123',
      name: 'Family Celebration.mp4',
      mimeType: 'video/mp4',
    };

    await mediaStreamService.downloadFile(testFile, fakeToken);

    expect(mockAnchor.download).toBe('Family Celebration.mp4');
    expect(clickSpy).toHaveBeenCalled();
  });
});
