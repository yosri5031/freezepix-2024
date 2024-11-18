import LZString from 'lz-string';

const STORAGE_KEY = 'freezepixState';
const CHUNK_SIZE = 512 * 1024; // 512KB chunks

export const saveStateToStorage = (state) => {
  try {
    // Remove full-size images from storage state, keep only thumbnails
    const storageState = {
      ...state,
      selectedPhotos: state.selectedPhotos?.map(photo => ({
        ...photo,
        file: photo.thumbnail || null, // Store only thumbnail in localStorage
        originalFile: null // Clear original file from storage
      }))
    };

    // Compress state
    const compressedState = LZString.compressToUTF16(JSON.stringify(storageState));
    
    // Split into chunks if necessary
    if (compressedState.length > CHUNK_SIZE) {
      const chunks = Math.ceil(compressedState.length / CHUNK_SIZE);
      
      for (let i = 0; i < chunks; i++) {
        const chunk = compressedState.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
        localStorage.setItem(`${STORAGE_KEY}_${i}`, chunk);
      }
      localStorage.setItem(`${STORAGE_KEY}_chunks`, chunks.toString());
    } else {
      // Clear any existing chunks
      clearStateChunks();
      localStorage.setItem(STORAGE_KEY, compressedState);
    }
    
    return true;
  } catch (error) {
    console.error('Error saving state:', error);
    // Attempt to clear storage if we hit quota
    if (error.name === 'QuotaExceededError') {
      clearStateStorage();
    }
    return false;
  }
};

export const loadStateFromStorage = () => {
  try {
    // Check if state is chunked
    const chunks = localStorage.getItem(`${STORAGE_KEY}_chunks`);
    
    let compressedState;
    if (chunks) {
      compressedState = '';
      for (let i = 0; i < parseInt(chunks); i++) {
        compressedState += localStorage.getItem(`${STORAGE_KEY}_${i}`) || '';
      }
    } else {
      compressedState = localStorage.getItem(STORAGE_KEY);
    }

    if (!compressedState) return null;

    const decompressedState = LZString.decompressFromUTF16(compressedState);
    return JSON.parse(decompressedState);
  } catch (error) {
    console.error('Error loading state:', error);
    clearStateStorage();
    return null;
  }
};

export const clearStateStorage = () => {
  clearStateChunks();
  localStorage.removeItem(STORAGE_KEY);
};

const clearStateChunks = () => {
  const chunks = localStorage.getItem(`${STORAGE_KEY}_chunks`);
  if (chunks) {
    for (let i = 0; i < parseInt(chunks); i++) {
      localStorage.removeItem(`${STORAGE_KEY}_${i}`);
    }
    localStorage.removeItem(`${STORAGE_KEY}_chunks`);
  }
};