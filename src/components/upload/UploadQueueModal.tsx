import React from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import {
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  XCircle,
  RefreshCw,
  Trash2,
  LogIn,
  ExternalLink,
  Share2,
  Play,
  Eye,
  Sparkles,
} from 'lucide-react';
import { useUpload } from '../../context/UploadContext';
import { useAuth } from '../../context/AuthContext';
import { UploadItem, UploadStatus } from '../../types/upload';
import { DriveFile } from '../../types/drive';
import { ActiveView } from '../../types/navigation';

interface UploadQueueModalProps {
  onSelectFile?: (file: DriveFile) => void;
  onNavigateView?: (view: ActiveView) => void;
}

export const UploadQueueModal: React.FC<UploadQueueModalProps> = ({
  onSelectFile,
  onNavigateView,
}) => {
  const {
    queue,
    totalProgress,
    isUploading,
    cancelUpload,
    retryUpload,
    clearCompleted,
    isQueueModalOpen,
    setQueueModalOpen,
    pendingShares,
    importPendingShares,
    discardPendingShare,
  } = useUpload();
  const { isAuthenticated, signIn } = useAuth();

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  const getStatusBadge = (status: UploadStatus, error?: string) => {
    switch (status) {
      case 'completed':
        return (
          <Badge variant="sage" size="sm" icon={<CheckCircle2 className="w-3 h-3" />}>
            Saved safely
          </Badge>
        );
      case 'uploading':
      case 'initializing_session':
        return (
          <Badge variant="gold" size="sm" icon={<UploadCloud className="w-3 h-3 animate-pulse" />}>
            Streaming chunks
          </Badge>
        );
      case 'verifying':
        return (
          <Badge variant="gold" size="sm" icon={<RefreshCw className="w-3 h-3 animate-spin" />}>
            Verifying in Drive
          </Badge>
        );
      case 'retrying':
        return (
          <Badge variant="amber" size="sm" icon={<RefreshCw className="w-3 h-3 animate-spin" />}>
            Retrying...
          </Badge>
        );
      case 'waiting_for_auth':
        return (
          <Badge variant="amber" size="sm" icon={<LogIn className="w-3 h-3" />}>
            Waiting for sign-in
          </Badge>
        );
      case 'needs_reconnect':
        return (
          <Badge variant="amber" size="sm" icon={<AlertCircle className="w-3 h-3" />}>
            Reconnect needed
          </Badge>
        );
      case 'failed':
        return (
          <Badge
            variant="plum"
            size="sm"
            icon={<AlertCircle className="w-3 h-3 text-red-400" />}
          >
            {error?.includes('storage is full') ? 'Drive full' : 'Upload failed'}
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge variant="neutral" size="sm">
            Cancelled
          </Badge>
        );
      default:
        return (
          <Badge variant="neutral" size="sm">
            In queue
          </Badge>
        );
    }
  };

  const completedCount = queue.filter((i) => i.status === 'completed').length;
  const failedCount = queue.filter((i) => i.status === 'failed').length;
  const activeCount = queue.filter(
    (i) => i.status === 'uploading' || i.status === 'initializing_session' || i.status === 'verifying'
  ).length;

  return (
    <Modal
      isOpen={isQueueModalOpen}
      onClose={() => setQueueModalOpen(false)}
      title="Upload &amp; Streaming Queue"
      maxWidth="lg"
    >
      <div className="space-y-4">
        {/* Overall Progress Header */}
        {queue.length > 0 && (
          <div className="bg-zinc-900/90 p-4 rounded-2xl border border-zinc-800">
            <div className="flex items-center justify-between text-xs font-semibold text-white mb-2">
              <span>
                {isUploading ? 'Streaming files direct to Google Drive...' : 'Queue Overview'}
              </span>
              <span className="text-amber-400 font-bold">{totalProgress}%</span>
            </div>

            {/* Overall Progress Bar */}
            <div className="w-full bg-zinc-800 h-2.5 rounded-full overflow-hidden border border-zinc-700/60">
              <div
                className="bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 h-full rounded-full transition-all duration-300 shadow-gold-glow-sm"
                style={{ width: `${totalProgress}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-zinc-400 mt-2.5">
              <span>
                {completedCount} of {queue.length} completed
                {failedCount > 0 ? ` (${failedCount} failed)` : ''}
              </span>
              {completedCount > 0 && (
                <button
                  onClick={clearCompleted}
                  className="text-amber-400 hover:text-amber-300 font-semibold transition-colors"
                >
                  Clear completed
                </button>
              )}
            </div>
          </div>
        )}

        {/* Celebration & Quick View Action Banner */}
        {completedCount > 0 && activeCount === 0 && (
          <div className="bg-amber-400/10 border border-amber-400/30 p-3.5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fade-in">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />
              <span className="text-xs font-bold text-white">
                Files saved safely! You can view or stream them now.
              </span>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {onNavigateView && (
                <>
                  <button
                    onClick={() => {
                      onNavigateView('photos');
                      setQueueModalOpen(false);
                    }}
                    className="flex-1 sm:flex-initial px-3 py-1.5 rounded-xl gold-button text-xs font-bold shadow-sm"
                  >
                    View Photos
                  </button>
                  <button
                    onClick={() => {
                      onNavigateView('videos');
                      setQueueModalOpen(false);
                    }}
                    className="flex-1 sm:flex-initial px-3 py-1.5 rounded-xl bg-zinc-800 text-zinc-200 border border-zinc-700 hover:text-white text-xs font-bold"
                  >
                    Watch Videos
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Pending shares from Android Share Sheet */}
        {pendingShares.length > 0 && (
          <div className="bg-[#16161D] p-4 rounded-2xl border border-amber-500/30">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Share2 className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-bold text-white">
                  Shared from Gallery ({pendingShares.length})
                </h4>
              </div>
              {isAuthenticated && (
                <button
                  onClick={importPendingShares}
                  className="text-xs font-bold text-black gold-button px-3 py-1 rounded-full shadow-sm"
                >
                  Upload all to Drive
                </button>
              )}
            </div>

            <p className="text-[11px] text-zinc-400 mb-3">
              These files are staged on your phone.
              {!isAuthenticated && ' Connect your Google Drive to upload them safely.'}
            </p>

            <div className="space-y-2 max-h-36 overflow-y-auto">
              {pendingShares.map((share) => (
                <div
                  key={share.id}
                  className="flex items-center justify-between bg-zinc-900 p-2.5 rounded-xl border border-zinc-800 text-xs"
                >
                  <div className="truncate mr-2">
                    <span className="font-semibold text-white block truncate">
                      {share.name}
                    </span>
                    <span className="text-[10px] text-zinc-400">
                      {formatBytes(share.size)} • Staged on phone
                    </span>
                  </div>
                  <button
                    onClick={() => discardPendingShare(share.id)}
                    className="p-1 text-zinc-500 hover:text-red-400"
                    title="Discard"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Not authenticated notice if queue has items */}
        {!isAuthenticated && queue.length > 0 && (
          <div className="bg-amber-400/10 border border-amber-400/25 p-3.5 rounded-2xl flex items-center justify-between gap-3 text-xs">
            <div>
              <p className="font-bold text-amber-300">Sign in to start uploads</p>
              <p className="text-zinc-400 text-[11px] mt-0.5">
                Files remain safely on your phone until you connect Google Drive.
              </p>
            </div>
            <Button size="sm" variant="primary" onClick={signIn}>
              Connect Drive
            </Button>
          </div>
        )}

        {/* Empty state if nothing in queue */}
        {queue.length === 0 && pendingShares.length === 0 && (
          <div className="text-center py-8">
            <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/20 text-amber-400 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-white">All uploads complete!</p>
            <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto">
              No files are currently uploading. You can add more using Quick Add or Gallery Share.
            </p>
          </div>
        )}

        {/* List of files in queue */}
        {queue.length > 0 && (
          <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1">
            {queue.map((item: UploadItem) => (
              <div
                key={item.id}
                className="bg-[#16161D] p-3.5 rounded-2xl border border-zinc-800 text-xs space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <span className="font-semibold text-white block truncate">
                      {item.name}
                    </span>
                    <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-0.5">
                      <span>{formatBytes(item.size)}</span>
                      {item.targetFolderName && (
                        <span>• Target: {item.targetFolderName}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Instant Play / View button for completed files */}
                    {item.status === 'completed' && onSelectFile && (
                      <button
                        onClick={() => {
                          if (item.completedFile) {
                            onSelectFile(item.completedFile);
                            setQueueModalOpen(false);
                          } else if (onNavigateView) {
                            onNavigateView(item.type.startsWith('video/') ? 'videos' : 'photos');
                            setQueueModalOpen(false);
                          }
                        }}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-400 text-black font-bold text-[11px] shadow-sm hover:scale-105 active:scale-95 transition-all"
                        title={item.type.startsWith('video/') ? 'Play Video' : 'View Photo'}
                      >
                        {item.type.startsWith('video/') ? (
                          <>
                            <Play className="w-3 h-3 fill-black" />
                            <span>Play</span>
                          </>
                        ) : (
                          <>
                            <Eye className="w-3 h-3" />
                            <span>View</span>
                          </>
                        )}
                      </button>
                    )}

                    {getStatusBadge(item.status, item.error)}

                    {item.status === 'failed' && (
                      <button
                        onClick={() => retryUpload(item.id)}
                        className="p-1.5 text-amber-400 hover:text-amber-300 rounded-lg hover:bg-zinc-800 min-touch-target flex items-center justify-center"
                        title="Retry upload"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    )}

                    {(item.status === 'queued' ||
                      item.status === 'uploading' ||
                      item.status === 'waiting_for_auth' ||
                      item.status === 'failed') && (
                      <button
                        onClick={() => cancelUpload(item.id)}
                        className="p-1.5 text-zinc-500 hover:text-red-400 rounded-lg hover:bg-zinc-800 min-touch-target flex items-center justify-center"
                        title="Cancel"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Per-item progress bar */}
                {(item.status === 'uploading' ||
                  item.status === 'verifying' ||
                  item.status === 'initializing_session') && (
                  <div className="space-y-1">
                    <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-amber-400 h-full rounded-full transition-all duration-200"
                        style={{ width: `${item.progressPercentage}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-zinc-400">
                      <span>{formatBytes(item.bytesUploaded)} uploaded</span>
                      <span className="text-amber-400 font-semibold">{item.progressPercentage}%</span>
                    </div>
                  </div>
                )}

                {/* Error message */}
                {item.error && (
                  <div className="text-[11px] text-red-400 bg-red-500/10 p-2 rounded-xl border border-red-500/20 flex items-center justify-between">
                    <span>{item.error}</span>
                    {item.error.includes('storage is full') && (
                      <a
                        href="https://one.google.com/storage"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold underline flex items-center gap-1 shrink-0 ml-2 text-amber-400"
                      >
                        Check storage <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="pt-2 flex justify-end">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setQueueModalOpen(false)}
          >
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
