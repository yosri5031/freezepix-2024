import LZString from 'lz-string';

const STORAGE_KEY = 'freezepixState';
const CHUNK_SIZE = 512 * 1024; // 512KB chunks
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour cache duration
const MEMORY_CACHE = new Map();

// Add memory caching layer
const withCache = (key, getter, setter) => {
  const cached = MEMORY_CACHE.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.value;
  }
  const value = getter();
  if (value) {
    MEMORY_CACHE.set(key, { value, timestamp: Date.now() });
    setter?.(value);
  }
  return value;
};

// Debounce state saves
const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Progressive state loading
export const loadStateProgressively = async (onChunkLoaded) => {
  try {
    const chunks = localStorage.getItem(`${STORAGE_KEY}_chunks`);
    if (!chunks) {
      const state = loadStateFromStorage();
      onChunkLoaded?.(state, 100);
      return state;
    }

    let compressedState = '';
    const totalChunks = parseInt(chunks);
    
    for (let i = 0; i < totalChunks; i++) {
      const chunk = localStorage.getItem(`${STORAGE_KEY}_${i}`);
      if (chunk) {
        compressedState += chunk;
        // Report progress
        onChunkLoaded?.(null, Math.round(((i + 1) / totalChunks) * 100));
      }
    }

    if (!compressedState) return null;

    const decompressedState = LZString.decompressFromUTF16(compressedState);
    const finalState = JSON.parse(decompressedState);
    onChunkLoaded?.(finalState, 100);
    return finalState;
  } catch (error) {
    console.error('Error loading state progressively:', error);
    clearStateStorage();
    return null;
  }
};

// Selective state updates
export const updateStateSelectively = (state, updates, paths = []) => {
  const newState = { ...state };
  
  paths.forEach(path => {
    const keys = path.split('.');
    let current = newState;
    let updateCurrent = updates;
    
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]] = { ...current[keys[i]] };
      updateCurrent = updateCurrent[keys[i]];
    }
    
    const lastKey = keys[keys.length - 1];
    if (updateCurrent && updateCurrent[lastKey] !== undefined) {
      current[lastKey] = updateCurrent[lastKey];
    }
  });
  
  return newState;
};

// Optimized state compression
const compressState = (state) => {
  // Remove unnecessary data before compression
  const minimalState = {
    ...state,
    selectedPhotos: state.selectedPhotos?.map(photo => ({
      id: photo.id,
      thumbnail: photo.thumbnail,
      metadata: photo.metadata,
      // Only keep essential fields
    })),
    // Remove any temporary UI state
    isProcessingOrder: undefined,
    uploadProgress: undefined,
    error: undefined,
  };

  return LZString.compressToUTF16(JSON.stringify(minimalState));
};

// Debounced save function
export const saveStateToStorageDebounced = debounce((state) => {
  try {
    const compressedState = compressState(state);
    
    if (compressedState.length > CHUNK_SIZE) {
      const chunks = Math.ceil(compressedState.length / CHUNK_SIZE);
      
      for (let i = 0; i < chunks; i++) {
        const chunk = compressedState.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
        localStorage.setItem(`${STORAGE_KEY}_${i}`, chunk);
      }
      localStorage.setItem(`${STORAGE_KEY}_chunks`, chunks.toString());
    } else {
      clearStateChunks();
      localStorage.setItem(STORAGE_KEY, compressedState);
    }
    
    // Update memory cache
    MEMORY_CACHE.set(STORAGE_KEY, { value: state, timestamp: Date.now() });
    
    return true;
  } catch (error) {
    console.error('Error saving state:', error);
    if (error.name === 'QuotaExceededError') {
      clearStateStorage();
      MEMORY_CACHE.clear();
    }
    return false;
  }
}, 1000); // 1 second debounce

// State garbage collection
export const performStateCleanup = () => {
  try {
    // Clear expired cache entries
    for (const [key, value] of MEMORY_CACHE.entries()) {
      if (Date.now() - value.timestamp > CACHE_DURATION) {
        MEMORY_CACHE.delete(key);
      }
    }
    
    // Clear old chunks
    const chunks = localStorage.getItem(`${STORAGE_KEY}_chunks`);
    if (chunks) {
      const state = loadStateFromStorage();
      if (state) {
        // Re-save state in optimized format
        clearStateChunks();
        saveStateToStorageDebounced(state);
      }
    }
  } catch (error) {
    console.error('Error during state cleanup:', error);
  }
};