// imageProcessingUtils.js
import imageCompression from 'browser-image-compression';

const COMPRESSION_OPTIONS = {
  initialQuality: 0.8,
  maxSizeMB: 0.5,
  maxWidthOrHeight: 1200,
  useWebWorker: true,
  fileType: 'image/jpeg',
  alwaysKeepResolution: false,
  initialCompression: 0.8
};

const THUMBNAIL_OPTIONS = {
  maxSizeMB: 0.1,
  maxWidthOrHeight: 100,
  useWebWorker: true,
  fileType: 'image/jpeg',
  initialQuality: 0.6
};

export const compressImage = async (file, onProgress) => {
  try {
    const options = {
      ...COMPRESSION_OPTIONS,
      onProgress: (progress) => {
        onProgress?.(progress);
      }
    };
    
    return await imageCompression(file, options);
  } catch (error) {
    console.warn('Image compression failed:', error);
    return file;
  }
};

export const convertToThumbnail = async (file) => {
  try {
    return await imageCompression(file, THUMBNAIL_OPTIONS);
  } catch (error) {
    console.warn('Thumbnail creation failed:', error);
    return null;
  }
};

export const convertFileToBase64 = async (file) => {
  if (!file) return null;
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => {
      console.error('Base64 conversion failed:', error);
      reject(error);
    };
    reader.readAsDataURL(file);
  });
};

export const processImagesInBatches = async (photos, onProgress) => {
  const BATCH_SIZE = 8; // Increased batch size
  const totalPhotos = photos.length;
  let processedCount = 0;

  const batches = [];
  for (let i = 0; i < photos.length; i += BATCH_SIZE) {
    batches.push(photos.slice(i, i + BATCH_SIZE));
  }

  const processedPhotos = [];
  
  for (const batch of batches) {
    const batchPromises = batch.map(async (photo) => {
      try {
        // Process compression and thumbnail generation in parallel
        const [compressedFile, thumbnail] = await Promise.all([
          compressImage(photo.file, (progress) => {
            const individualProgress = (processedCount + progress) / totalPhotos;
            onProgress?.(individualProgress * 100);
          }),
          convertToThumbnail(photo.file)
        ]);

        // Convert both files to base64 in parallel
        const [base64, thumbnailBase64] = await Promise.all([
          convertFileToBase64(compressedFile),
          convertFileToBase64(thumbnail)
        ]);

        return {
          ...photo,
          file: base64,
          thumbnail: thumbnailBase64,
          originalSize: photo.file.size,
          compressedSize: compressedFile.size
        };
      } catch (error) {
        console.error(`Failed to process image: ${photo.fileName}`, error);
        throw error;
      }
    });

    const processedBatch = await Promise.all(batchPromises);
    processedPhotos.push(...processedBatch);
    processedCount += batch.length;
  }

  return processedPhotos;
};