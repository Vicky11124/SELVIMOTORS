/**
 * Browser-side WebP image converter and optimizer.
 * Converts JPG, PNG, WEBP, HEIC/BMP to optimized, lightweight WebP files before upload.
 */

export interface OptimizedImageResult {
  file: File;
  originalSize: number;
  optimizedSize: number;
  reductionPercentage: number;
}

/**
 * Converts an image file to an optimized WebP File using HTML5 Canvas.
 * Automatically resizes images that exceed max dimensions while preserving aspect ratio.
 */
export async function convertToWebP(
  file: File,
  maxWidth = 1600,
  maxHeight = 1200,
  quality = 0.82
): Promise<OptimizedImageResult> {
  return new Promise((resolve, reject) => {
    // If browser doesn't support FileReader or Canvas
    if (typeof window === 'undefined' || !window.FileReader) {
      resolve({
        file,
        originalSize: file.size,
        optimizedSize: file.size,
        reductionPercentage: 0,
      });
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error(`Failed to load image: ${file.name}`));
      img.onload = () => {
        let { width, height } = img;

        // Downscale large camera photos while maintaining aspect ratio
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve({
            file,
            originalSize: file.size,
            optimizedSize: file.size,
            reductionPercentage: 0,
          });
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve({
                file,
                originalSize: file.size,
                optimizedSize: file.size,
                reductionPercentage: 0,
              });
              return;
            }

            const baseName = file.name.replace(/\.[^/.]+$/, '');
            const cleanName = `${baseName}.webp`;

            const webpFile = new File([blob], cleanName, {
              type: 'image/webp',
              lastModified: Date.now(),
            });

            const originalSize = file.size;
            const optimizedSize = webpFile.size;
            const reductionPercentage = Math.max(
              0,
              Math.round(((originalSize - optimizedSize) / originalSize) * 100)
            );

            resolve({
              file: webpFile,
              originalSize,
              optimizedSize,
              reductionPercentage,
            });
          },
          'image/webp',
          quality
        );
      };

      if (typeof e.target?.result === 'string') {
        img.src = e.target.result;
      } else {
        reject(new Error('Invalid image result format'));
      }
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Optimizes an array or FileList of images in parallel/batch.
 */
export async function optimizeImageList(
  files: FileList | File[],
  maxWidth = 1600,
  maxHeight = 1200,
  quality = 0.82,
  onProgress?: (done: number, total: number) => void
): Promise<OptimizedImageResult[]> {
  const list = Array.from(files);
  const results: OptimizedImageResult[] = [];

  for (let i = 0; i < list.length; i++) {
    try {
      const res = await convertToWebP(list[i], maxWidth, maxHeight, quality);
      results.push(res);
    } catch {
      // Fallback on failure
      results.push({
        file: list[i],
        originalSize: list[i].size,
        optimizedSize: list[i].size,
        reductionPercentage: 0,
      });
    }
    if (onProgress) {
      onProgress(i + 1, list.length);
    }
  }

  return results;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
