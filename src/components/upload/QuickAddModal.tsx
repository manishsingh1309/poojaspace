import React, { useRef, useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import {
  UploadCloud,
  Image as ImageIcon,
  FileText,
  FolderPlus,
  Share2,
} from 'lucide-react';
import { useUpload } from '../../context/UploadContext';
import { useDrive } from '../../context/DriveContext';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultFolderId?: string;
  defaultFolderName?: string;
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  isOpen,
  onClose,
  defaultFolderId,
  defaultFolderName,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFolderId, setSelectedFolderId] = useState<string>(defaultFolderId || '');
  const [selectedFolderName, setSelectedFolderName] = useState<string>(defaultFolderName || 'Photos');
  const [pickerAccept, setPickerAccept] = useState<string>('*/*');
  const { addFiles } = useUpload();
  const { knownFolders } = useDrive();

  const handleOpenPicker = (acceptType: string, folderId?: string, folderName?: string) => {
    setPickerAccept(acceptType);
    if (folderId) setSelectedFolderId(folderId);
    if (folderName) setSelectedFolderName(folderName);

    setTimeout(() => {
      if (fileInputRef.current) {
        fileInputRef.current.accept = acceptType;
        fileInputRef.current.click();
      }
    }, 50);
  };

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      addFiles(filesArray, selectedFolderId || knownFolders?.photosId, selectedFolderName);
      e.target.value = '';
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add to Poojaspace Vault" maxWidth="md">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFilesSelected}
        multiple
        className="hidden"
        accept={pickerAccept}
      />

      <div className="space-y-4">
        <p className="text-xs text-zinc-400 leading-relaxed">
          Select files from your Oppo phone. They stream directly to your private Google Drive without intermediate servers.
        </p>

        {/* Destination folder picker */}
        {knownFolders && (
          <div className="bg-zinc-900/90 p-3.5 rounded-2xl border border-zinc-800">
            <label className="block text-xs font-bold text-white mb-1.5 flex items-center gap-2">
              <FolderPlus className="w-3.5 h-3.5 text-amber-400" />
              <span>Target Vault Folder / Album:</span>
            </label>
            <select
              value={selectedFolderId || knownFolders.photosId || ''}
              onChange={(e) => {
                setSelectedFolderId(e.target.value);
                const opt = e.target.options[e.target.selectedIndex];
                setSelectedFolderName(opt.text);
              }}
              className="w-full text-xs font-semibold bg-[#121216] border border-zinc-700 rounded-xl px-3 py-2.5 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-amber-400 min-touch-target"
            >
              <option value={knownFolders.photosId}>Photos</option>
              <option value={knownFolders.videosId}>Videos</option>
              <option value={knownFolders.documentsId}>Documents</option>
              <option value={knownFolders.audioOtherId}>Audio &amp; Other Files</option>
              {knownFolders.customAlbums.map((album) => (
                <option key={album.id} value={album.id}>
                  Album: {album.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Tactile Selection Action Tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <button
            onClick={() =>
              handleOpenPicker(
                'image/*,video/*',
                knownFolders?.photosId,
                'Photos'
              )
            }
            className="flex items-center gap-3.5 p-4 rounded-2xl bg-[#16161D] border border-zinc-800 hover:border-amber-400/60 hover:bg-zinc-900 transition-all min-touch-target text-left group active:scale-[0.98]"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/20 text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-sm font-bold text-white">
                Photos &amp; Cinema
              </span>
              <span className="text-[11px] text-zinc-400">
                Gallery, camera roll, high-res
              </span>
            </div>
          </button>

          <button
            onClick={() =>
              handleOpenPicker(
                'application/pdf,application/*,text/*,.pdf,.doc,.docx,.xls,.xlsx',
                knownFolders?.documentsId,
                'Documents'
              )
            }
            className="flex items-center gap-3.5 p-4 rounded-2xl bg-[#16161D] border border-zinc-800 hover:border-amber-400/60 hover:bg-zinc-900 transition-all min-touch-target text-left group active:scale-[0.98]"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-sm font-bold text-white">
                Documents &amp; PDFs
              </span>
              <span className="text-[11px] text-zinc-400">
                Certificates, receipts, bills
              </span>
            </div>
          </button>

          <button
            onClick={() => handleOpenPicker('*/*')}
            className="sm:col-span-2 flex items-center gap-3.5 p-4 rounded-2xl bg-[#16161D] border border-zinc-800 hover:border-amber-400/60 hover:bg-zinc-900 transition-all min-touch-target text-left group active:scale-[0.98]"
          >
            <div className="w-12 h-12 rounded-2xl bg-zinc-800 border border-zinc-700 text-zinc-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <UploadCloud className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <span className="block text-sm font-bold text-white">
                All Files &amp; Archives
              </span>
              <span className="text-[11px] text-zinc-400">
                Any media, audio, or document format
              </span>
            </div>
          </button>
        </div>

        {/* Android Share Sheet Guide */}
        <div className="bg-gradient-to-r from-amber-500/10 via-zinc-900 to-zinc-900 p-4 rounded-2xl border border-amber-500/20 flex items-start gap-3 text-xs">
          <Share2 className="w-4.5 h-4.5 text-amber-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="text-white">Direct Share from Oppo Gallery:</strong>
            <p className="text-zinc-400 mt-0.5">
              Select any photos in your Oppo Gallery app, tap <strong>Share</strong>, and pick <strong>Poojaspace</strong>! Files arrive directly in your upload queue.
            </p>
          </div>
        </div>

        <div className="pt-2">
          <Button variant="outline" className="w-full" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
};
