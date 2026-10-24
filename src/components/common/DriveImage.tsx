import React, { useState, useEffect } from 'react';
import { DriveFile } from '../../types/drive';
import { useAuth } from '../../context/AuthContext';
import { mediaStreamService } from '../../services/mediaStreamService';
import { Image as ImageIcon } from 'lucide-react';

interface DriveImageProps {
  file: DriveFile;
  alt?: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  onClick?: () => void;
  highRes?: boolean;
}

export const DriveImage: React.FC<DriveImageProps> = ({
  file,
  alt,
  className = '',
  loading = 'lazy',
  onClick,
  highRes = false,
}) => {
  const { token } = useAuth();
  const [imageSrc, setImageSrc] = useState<string | null>(() => {
    // Check if already cached in memory
    const cached = mediaStreamService.getCachedUrl(file.id);
    if (cached) return cached;

    // Check if local demo asset
    if (file.thumbnailLink && file.thumbnailLink.startsWith('/assets/')) {
      return file.thumbnailLink;
    }

    // High-res requested or no thumbnail available
    if (highRes && !file.thumbnailLink) {
      return null;
    }

    // Try high-resolution version of Google thumbnail if available
    if (file.thumbnailLink) {
      if (highRes) {
        // Replace =s220 with =s1600 or =s0 for full-res
        return file.thumbnailLink.replace(/=s\d+/, '=s1600');
      }
      return file.thumbnailLink.replace(/=s\d+/, '=s400');
    }

    return null;
  });

  const [isLoading, setIsLoading] = useState(!imageSrc);
  const [hasError, setHasError] = useState(false);
  const [isFallingBack, setIsFallingBack] = useState(false);

  // If highRes requested or imageSrc is null, fetch authenticated blob
  useEffect(() => {
    let isMounted = true;

    // If local demo asset, don't fetch from Drive
    if (file.thumbnailLink && file.thumbnailLink.startsWith('/assets/')) {
      setImageSrc(file.thumbnailLink);
      setIsLoading(false);
      return;
    }

    // Check in-memory cache
    const cached = mediaStreamService.getCachedUrl(file.id);
    if (cached) {
      setImageSrc(cached);
      setIsLoading(false);
      return;
    }

    if (highRes && token) {
      setIsLoading(true);
      mediaStreamService
        .getMediaBlobUrl(file.id, token, file.thumbnailLink)
        .then((url) => {
          if (isMounted) {
            setImageSrc(url);
            setIsLoading(false);
          }
        })
        .catch(() => {
          if (isMounted) {
            setIsLoading(false);
          }
        });
    }

    return () => {
      isMounted = false;
    };
  }, [file.id, file.thumbnailLink, highRes, token]);

  const handleImageError = async () => {
    // If thumbnail failed (common with Google Drive 403s on unauthenticated lh3 CDN),
    // fetch authenticated blob with Bearer token!
    if (!isFallingBack && token) {
      setIsFallingBack(true);
      try {
        const blobUrl = await mediaStreamService.getMediaBlobUrl(file.id, token);
        setImageSrc(blobUrl);
        setHasError(false);
        return;
      } catch (err) {
        console.warn('Authenticated fallback also failed for image:', file.name, err);
      }
    }
    setHasError(true);
    setIsLoading(false);
  };

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  if (hasError || (!imageSrc && !isLoading)) {
    return (
      <div
        onClick={onClick}
        className={`w-full h-full flex flex-col items-center justify-center p-3 bg-zinc-900/80 text-zinc-600 ${className}`}
      >
        <ImageIcon className="w-8 h-8 mb-1 text-zinc-500" />
        <span className="text-[10px] text-zinc-400 text-center truncate max-w-full px-2">
          {file.name}
        </span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden" onClick={onClick}>
      {isLoading && (
        <div className="absolute inset-0 bg-zinc-900 animate-pulse flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-amber-400/20 border-t-amber-400 rounded-full animate-spin" />
        </div>
      )}

      {imageSrc && (
        <img
          src={imageSrc}
          alt={alt || file.name}
          loading={loading}
          onLoad={handleLoad}
          onError={handleImageError}
          className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        />
      )}
    </div>
  );
};
