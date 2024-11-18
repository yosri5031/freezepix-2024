import imageCompression from 'browser-image-compression';

export const compressImage = async (file, maxSizeMB = 0.5) => {
  const options = {
    maxSizeMB,
    maxWidthOrHeight: 1200,
    useWebWorker: true,
    fileType: 'image/jpeg'
  };

  try {
    const compressedFile = await imageCompression(file, options);
    return compressedFile;
  } catch (error) {
    console.warn('Image compression failed:', error);
    return file;
  }
};

export const convertToThumbnail = async (file) => {
  const options = {
    maxSizeMB: 0.1,
    maxWidthOrHeight: 100,
    useWebWorker: true,
    fileType: 'image/jpeg'
  };

  try {
    const thumbnail = await imageCompression(file, options);
    return thumbnail;
  } catch (error) {
    console.warn('Thumbnail creation failed:', error);
    return null;
  }
};

export const processImagesInBatches = async (photos, batchSize = 3) => {
  const batches = [];
  for (let i = 0; i < photos.length; i += batchSize) {
    batches.push(photos.slice(i, i + batchSize));
  }

  const processedBatches = [];
  for (const batch of batches) {
    const processedBatch = await Promise.all(
      batch.map(async (photo) => {
        const compressedFile = await compressImage(photo.file);
        const thumbnail = await convertToThumbnail(photo.file);
        const base64 = await convertFileToBase64(compressedFile);
        
        return {
          ...photo,
          file: base64,
          thumbnail: thumbnail ? await convertFileToBase64(thumbnail) : null
        };
      })
    );
    processedBatches.push(...processedBatch);
  }

  return processedBatches;
};

export const convertFileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};