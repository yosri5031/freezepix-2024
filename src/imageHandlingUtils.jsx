// Enhanced image handling utility functions

/**
 * Safely converts an image to base64, handling various input types
 * @param {File|Blob|string} file - The image to convert (File, Blob, or existing base64 string)
 * @returns {Promise<string>} - A promise that resolves to the base64 string
 */
export const convertImageToBase64 = async (file) => {
    // If already a base64 string, return it
    if (typeof file === 'string' && file.startsWith('data:image/')) {
      return file;
    }
  
    // If not a valid File/Blob, throw error
    if (!(file instanceof Blob || file instanceof File)) {
      throw new Error('Invalid file format');
    }
  
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result;
        // Validate base64 format
        if (typeof base64String === 'string' && base64String.startsWith('data:image/')) {
          resolve(base64String);
        } else {
          reject(new Error('Invalid base64 format'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };
  
  /**
   * Converts a base64 string back to a File object
   * @param {string} base64String - The base64 image string
   * @param {string} fileName - The original file name
   * @returns {File} - A File object reconstructed from the base64 string
   */
  export const base64ToFile = (base64String, fileName) => {
    try {
      // Validate base64 string
      if (!base64String || typeof base64String !== 'string') {
        throw new Error('Invalid base64 string');
      }
  
      if (!base64String.startsWith('data:image/')) {
        throw new Error('Invalid image format');
      }
  
      const arr = base64String.split(',');
      const mime = arr[0].match(/:(.*?);/)[1];
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      
      return new File([u8arr], fileName, { type: mime });
    } catch (error) {
      console.error('Error converting base64 to file:', error);
      throw error;
    }
  };
  
  /**
   * Saves the selected photos to localStorage, properly handling image data
   * @param {Array} photos - The photo objects to save
   */
  export const savePhotosToStorage = async (photos) => {
    try {
      // Ensure all photos have base64 data
      const photosWithBase64 = await Promise.all(
        photos.map(async (photo) => {
          // If photo already has base64 data, use it
          if (photo.base64) {
            return {
              id: photo.id,
              base64: photo.base64,
              fileName: photo.fileName || photo.file?.name || `image-${photo.id}.jpg`,
              fileType: photo.fileType || photo.file?.type || 'image/jpeg',
              productType: photo.productType || 'photo_print',
              size: photo.size || '4x6',
              quantity: photo.quantity || 1
            };
          }
          
          // Otherwise, convert file to base64
          if (photo.file) {
            const base64 = await convertImageToBase64(photo.file);
            return {
              id: photo.id,
              base64,
              fileName: photo.file.name,
              fileType: photo.file.type,
              productType: photo.productType || 'photo_print',
              size: photo.size || '4x6',
              quantity: photo.quantity || 1
            };
          }
          
          return null; // Skip invalid photos
        })
      );
      
      // Filter out null values and save to localStorage
      const validPhotos = photosWithBase64.filter(Boolean);
      localStorage.setItem('uploadedPhotos', JSON.stringify(validPhotos));
      
      return true;
    } catch (error) {
      console.error('Error saving photos to storage:', error);
      return false;
    }
  };
  
  /**
   * Loads photos from localStorage and reconstructs File objects
   * @returns {Array} - The restored photo objects
   */
  export const loadPhotosFromStorage = () => {
    try {
      const savedPhotos = localStorage.getItem('uploadedPhotos');
      if (!savedPhotos) {
        return [];
      }
      
      const parsedPhotos = JSON.parse(savedPhotos);
      
      // Reconstruct full photo objects with File objects and previews
      const restoredPhotos = parsedPhotos.map(photo => {
        // Skip invalid entries
        if (!photo.base64 || !photo.base64.startsWith('data:image/')) {
          return null;
        }
        
        // Create a File object from base64
        let fileObj = null;
        try {
          fileObj = base64ToFile(photo.base64, photo.fileName);
        } catch (e) {
          console.warn('Could not convert base64 to file:', e);
          // Continue without file object
        }
        
        return {
          ...photo,
          file: fileObj,
          preview: photo.base64 // Use base64 as preview
        };
      }).filter(Boolean); // Remove any null entries
      
      return restoredPhotos;
    } catch (error) {
      console.error('Error loading photos from storage:', error);
      localStorage.removeItem('uploadedPhotos'); // Clear invalid data
      return [];
    }
  };
  
  /**
   * Clears photo storage when no longer needed (e.g., after successful order)
   */
  export const clearPhotoStorage = () => {
    localStorage.removeItem('uploadedPhotos');
  };