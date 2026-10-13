import { describe, it, expect, vi, beforeEach } from 'vitest';
import { uploadEngine } from '../services/uploadEngine';
import { googleAuthService } from '../services/googleAuthService';

describe('UploadEngine', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    uploadEngine.clearCompleted();
  });

  it('adds files to the queue with initial queued or waiting_for_auth status', () => {
    vi.spyOn(googleAuthService, 'getToken').mockReturnValue(null);

    const testFile = new File(['hello world'], 'test.txt', { type: 'text/plain' });
    uploadEngine.addFiles([testFile], 'target_folder_1', 'Documents');

    const queue = uploadEngine.getQueue();
    expect(queue.length).toBeGreaterThan(0);
    const item = queue[queue.length - 1];
    expect(item.name).toBe('test.txt');
    expect(item.size).toBe(11);
    expect(item.status).toBe('waiting_for_auth');
  });

  it('cancelUpload marks the item as cancelled', () => {
    const testFile = new File(['content'], 'cancel_me.jpg', { type: 'image/jpeg' });
    uploadEngine.addFiles([testFile], 'folder_1');

    const queue = uploadEngine.getQueue();
    const item = queue[queue.length - 1];
    uploadEngine.cancelUpload(item.id);

    const updated = uploadEngine.getQueue().find((i) => i.id === item.id);
    expect(updated?.status).toBe('cancelled');
  });

  it('retryUpload resets item status to queued and clears previous error', () => {
    const testFile = new File(['content'], 'retry_me.jpg', { type: 'image/jpeg' });
    uploadEngine.addFiles([testFile], 'folder_1');

    const queue = uploadEngine.getQueue();
    const item = queue[queue.length - 1];
    item.status = 'failed';
    item.error = 'Network disconnected';

    uploadEngine.retryUpload(item.id);

    const updated = uploadEngine.getQueue().find((i) => i.id === item.id);
    expect(updated?.status).toBe('waiting_for_auth'); // because token is null
    expect(updated?.error).toBeUndefined();
  });
});
