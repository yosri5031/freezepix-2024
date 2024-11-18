import LZString from 'lz-string';

const STORAGE_KEY = 'freezepixState';
const MAX_STORAGE_SIZE = 4 * 1024 * 1024; // 4MB threshold
const PHOTO_THUMBNAIL_SIZE = 100; // thumbnail dimensions

// Utility to estimate object size in bytes
const getObjectSize = (obj) => {
  return new Blob([JSON.stringify(obj)]).size;
};

// Optimize photo data for storage
const optimizePhotoForStorage = (photo) => {
  if (!photo) return null;
  
  return {
    id: photo.id,
    thumbnail: photo.thumbnail,
    price: photo.price,
    quantity: photo.quantity,
    size: photo.size,
    metadata: {
      name: photo?.file?.name,
      lastModified: photo?.file?.lastModified,
      type: photo?.file?.type
    }
  };
};

// Clean up old storage data
const cleanupOldStorage = () => {
  const keysToRemove = [];
  
  // Find old state chunks and expired data
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith(`${STORAGE_KEY}_old_`) || 
        key.startsWith(`${STORAGE_KEY}_chunk_`)) {
      keysToRemove.push(key);
    }
  }

  // Remove old data
  keysToRemove.forEach(key => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn(`Failed to remove key: ${key}`, error);
    }
  });
};

// Emergency cleanup - removes everything except essential data
const performEmergencyCleanup = () => {
  const essentialKeys = [STORAGE_KEY];
  
  Object.keys(localStorage).forEach(key => {
    if (!essentialKeys.includes(key)) {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.warn(`Emergency cleanup failed for key: ${key}`, error);
      }
    }
  });
};

// Main state saving function with optimization and cleanup
export const saveStateWithCleanup = async (state) => {
  try {
    // Optimize photos if present
    const optimizedState = {
      ...state,
      selectedPhotos: state.selectedPhotos 
        ? state.selectedPhotos.map(optimizePhotoForStorage)
        : undefined
    };

    // Check estimated size
    const stateSize = getObjectSize(optimizedState);
    
    // If approaching quota, clean up old data
    if (stateSize > MAX_STORAGE_SIZE) {
      cleanupOldStorage();
    }

    // Compress state
    const compressedState = LZString.compressToUTF16(
      JSON.stringify(optimizedState)
    );

    // Try to save compressed state
    try {
      localStorage.setItem(STORAGE_KEY, compressedState);
      return true;
    } catch (storageError) {
      // If quota exceeded, try emergency cleanup
      if (storageError.name === 'QuotaExceededError') {
        performEmergencyCleanup();
        
        // Try one more time after cleanup
        try {
          localStorage.setItem(STORAGE_KEY, compressedState);
          return true;
        } catch (retryError) {
          console.error('Failed to save state even after emergency cleanup:', retryError);
          
          // If still failing, try to save minimal essential data
          const minimalState = {
            timestamp: new Date().toISOString(),
            orderNumber: state.orderNumber,
            email: state.email,
            progress: state.progress
          };
          
          localStorage.setItem(
            STORAGE_KEY, 
            LZString.compressToUTF16(JSON.stringify(minimalState))
          );
          
          return false;
        }
      }
      throw storageError;
    }
  } catch (error) {
    console.error('State saving failed:', error);
    return false;
  }
};

// Load state with error handling
export const loadStateWithValidation = () => {
  try {
    const compressedState = localStorage.getItem(STORAGE_KEY);
    if (!compressedState) return null;

    const decompressedState = LZString.decompressFromUTF16(compressedState);
    if (!decompressedState) return null;

    const parsedState = JSON.parse(decompressedState);
    
    // Validate essential properties
    if (!parsedState || typeof parsedState !== 'object') {
      return null;
    }

    return parsedState;
  } catch (error) {
    console.error('Error loading state:', error);
    clearStateStorage();
    return null;
  }
};

// Clear all state storage
export const clearStateStorage = () => {
  try {
    cleanupOldStorage();
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing state storage:', error);
  }
};

// Backup current state with timestamp
export const backupCurrentState = async () => {
  try {
    const currentState = await loadStateWithValidation();
    if (currentState) {
      const backupKey = `${STORAGE_KEY}_old_${Date.now()}`;
      localStorage.setItem(
        backupKey,
        LZString.compressToUTF16(JSON.stringify(currentState))
      );
    }
  } catch (error) {
    console.warn('Failed to backup state:', error);
  }
};

// Check storage health and cleanup if needed
export const checkStorageHealth = async () => {
  try {
    // Calculate total storage usage
    let totalSize = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      totalSize += getObjectSize(localStorage.getItem(key));
    }

    // If over 80% of MAX_STORAGE_SIZE, trigger cleanup
    if (totalSize > (MAX_STORAGE_SIZE * 0.8)) {
      await backupCurrentState();
      cleanupOldStorage();
    }

    return true;
  } catch (error) {
    console.warn('Storage health check failed:', error);
    return false;
  }
};