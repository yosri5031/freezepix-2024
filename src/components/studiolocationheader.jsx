import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MapPin, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import axios from 'axios';

// Studio Header Component with enhanced debugging and loading state handling
const StudioLocationHeader = ({ 
  selectedStudio, 
  onStudioSelect, 
  selectedCountry 
}) => {
  const [studios, setStudios] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [error, setError] = useState(null);
  const [fetchTimeout, setFetchTimeout] = useState(null);
  
  // Create all refs at the top level of the component
  const initialLoadCompleteRef = useRef(false);
  const lastLocationUpdateRef = useRef(Date.now());
  const visibilityTimeoutRef = useRef(null);
  const fetchAbortController = useRef(null);
  const debugTimerRef = useRef(null);
  
  // Constants
  const locationExpiryTime = 30 * 60 * 1000; // 30 minutes in milliseconds
  const API_URL = 'https://freezepix-database-server-c95d4dd2046d.herokuapp.com/api/studios';
  
  // Debug logging helper
  const logDebug = (message, data = null) => {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    console.log(`[${timestamp}] StudioLocationHeader: ${message}`, data || '');
  };

  // Calculate distance between coordinates - with null safety
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) {
      return null;
    }
    
    try {
      const R = 6371; // Radius of the earth in km
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c; // Distance in km
    } catch (err) {
      logDebug('Error calculating distance:', err);
      return null;
    }
  };

  // Get user's location with stable caching
  const getUserLocation = useCallback(() => {
    logDebug('Getting user location');
    // Try to load cached location first
    try {
      const cachedLocation = localStorage.getItem('userLocationCache');
      const cachedTimestamp = localStorage.getItem('userLocationTimestamp');
      
      if (cachedLocation && cachedTimestamp) {
        const timestamp = parseInt(cachedTimestamp, 10);
        const now = Date.now();
        
        // If cache is fresh (less than 30 minutes old)
        if (now - timestamp < locationExpiryTime) {
          try {
            const parsedLocation = JSON.parse(cachedLocation);
            logDebug('Using cached location', parsedLocation);
            setUserLocation(parsedLocation);
            lastLocationUpdateRef.current = timestamp;
            return; // Use cached location and don't request new one
          } catch (e) {
            logDebug('Error parsing cached location:', e);
          }
        }
      }
    } catch (err) {
      logDebug('Error getting cached location:', err);
    }
    
    // Get fresh location if no cache or cache expired
    if (navigator.geolocation) {
      logDebug('Requesting geolocation from browser');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          try {
            const location = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            };
            
            logDebug('Received new geolocation', location);
            // Update state
            setUserLocation(location);
            
            // Update cache
            localStorage.setItem('userLocationCache', JSON.stringify(location));
            localStorage.setItem('userLocationTimestamp', Date.now().toString());
            lastLocationUpdateRef.current = Date.now();
          } catch (err) {
            logDebug('Error processing geolocation data:', err);
          }
        },
        (error) => {
          logDebug('Error getting location:', error);
          
          // Still use cached location even if expired, if we have it
          try {
            const cachedLocation = localStorage.getItem('userLocationCache');
            if (cachedLocation) {
              logDebug('Using expired cached location as fallback');
              const parsedLocation = JSON.parse(cachedLocation);
              setUserLocation(parsedLocation);
            }
          } catch (e) {
            logDebug('Error parsing cached location as fallback:', e);
          }
        },
        { maximumAge: locationExpiryTime, timeout: 10000 }
      );
    }
  }, []); // No dependencies for this function

  // Fetch studios data with better debugging and timeout handling
  const fetchStudios = useCallback(async () => {
    // Don't fetch if already loading
    if (loading) {
      logDebug('Skipping fetchStudios - already loading');
      return;
    }
    
    // Cancel any previous fetch
    if (fetchAbortController.current) {
      logDebug('Aborting previous fetch request');
      fetchAbortController.current.abort();
    }
    
    // Clear any existing timeout
    if (fetchTimeout) {
      logDebug('Clearing existing fetch timeout');
      clearTimeout(fetchTimeout);
      setFetchTimeout(null);
    }
    
    // Create new abort controller
    fetchAbortController.current = new AbortController();
    
    // Set a timeout in case the request hangs
    const timeoutId = setTimeout(() => {
      logDebug('Fetch timeout reached (20s)');
      if (fetchAbortController.current) {
        fetchAbortController.current.abort();
        setError('Request timed out. Please try again.');
        setLoading(false);
      }
    }, 20000);
    
    setFetchTimeout(timeoutId);
    
    try {
      logDebug('Starting to fetch studios from API');
      setLoading(true);
      setError(null);
      
      // Start debug timer
      debugTimerRef.current = Date.now();
      
      // Log network request
      logDebug(`Fetching from ${API_URL}`);
      
      // Direct fetch with manual timeout for better debugging
      const fetchPromise = fetch(API_URL, {
        signal: fetchAbortController.current.signal,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      const response = await fetchPromise;
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const responseData = await response.json();
      
      // Log response time
      const timeTaken = Date.now() - debugTimerRef.current;
      logDebug(`API responded in ${timeTaken}ms`);
      logDebug('Response data type:', typeof responseData);
      logDebug('Response data structure:', Array.isArray(responseData) ? 'Array' : 'Object');
      
      let studiosData = [];
      
      // Safely handle response data
      if (responseData) {
        studiosData = Array.isArray(responseData) ? responseData : [responseData];
        
        logDebug(`Received ${studiosData.length} studios from API`);
        
        // Filter to active studios only
        const activeStudios = studiosData.filter(studio => studio && studio.isActive);
        logDebug(`${activeStudios.length} active studios after filtering`);

        // Add distance if user location is available
        if (userLocation && userLocation.latitude && userLocation.longitude) {
          logDebug('Adding distance calculations to studios');
          studiosData = activeStudios.map(studio => {
            if (!studio || !studio.coordinates) {
              return {
                ...studio,
                distance: null
              };
            }
            
            const distance = calculateDistance(
              userLocation.latitude,
              userLocation.longitude,
              studio.coordinates?.latitude || null,
              studio.coordinates?.longitude || null
            );
            
            return {
              ...studio,
              distance: distance
            };
          });

          // Sort by distance, handling null distance values
          studiosData.sort((a, b) => {
            if (a.distance === null && b.distance === null) return 0;
            if (a.distance === null) return 1;
            if (b.distance === null) return -1;
            return a.distance - b.distance;
          });
          
          logDebug('Studios sorted by distance');
        } else {
          logDebug('No user location available, skipping distance calculation');
          studiosData = activeStudios;
        }
      }
      
      // Update state
      logDebug(`Setting ${studiosData.length} studios to state`);
      setStudios(studiosData);
      
      // If we've been waiting for a while, make sure to clear loading state
      setLoading(false);
      
      // Clear timeout
      clearTimeout(timeoutId);
      setFetchTimeout(null);
      
      return studiosData;
    } catch (error) {
      if (error.name === 'AbortError') {
        logDebug('Studio fetch was aborted');
      } else {
        logDebug('Error fetching studios:', error);
        setError(`Failed to fetch studios: ${error.message}`);
      }
      setLoading(false);
      return [];
    } finally {
      clearTimeout(timeoutId);
      setFetchTimeout(null);
      fetchAbortController.current = null;
    }
  }, [loading, userLocation, fetchTimeout]); 

  // Safely select a studio from the list
  const autoSelectNearestStudio = useCallback(async () => {
    // Skip if we already completed initial load
    if (initialLoadCompleteRef.current) {
      logDebug('Skipping autoSelectNearestStudio - already completed initial load');
      return;
    }

    logDebug('Running autoSelectNearestStudio');
    
    try {
      // Check if we already have a studio in localStorage
      let storedStudio = null;
      try {
        const storedStudioJson = localStorage.getItem('selectedStudio');
        if (storedStudioJson) {
          storedStudio = JSON.parse(storedStudioJson);
          logDebug('Found stored studio in localStorage', storedStudio?.name || 'unnamed');
        }
      } catch (e) {
        logDebug('Error parsing stored studio:', e);
      }
      
      const isPreselectedFromUrl = localStorage.getItem('isPreselectedFromUrl') === 'true';
      
      // If already selected from URL, don't change it
      if (isPreselectedFromUrl && selectedStudio) {
        logDebug('Using preselected studio from URL', selectedStudio.name);
        initialLoadCompleteRef.current = true;
        return;
      }
      
      // If we already have a stored studio and it wasn't auto-selected, use it
      if (storedStudio && storedStudio._id && !selectedStudio) {
        logDebug('Using stored studio from localStorage', storedStudio.name);
        onStudioSelect(storedStudio);
        initialLoadCompleteRef.current = true;
        return;
      }
      
      // If no studio selected yet, fetch and select nearest
      if (!selectedStudio) {
        logDebug('No studio selected, fetching to find nearest');
        const studiosData = await fetchStudios();
        
        // Auto-select closest studio if we have studios
        if (studiosData && studiosData.length > 0) {
          const studioToSelect = studiosData[0];
          if (studioToSelect && studioToSelect._id) {
            logDebug('Auto-selecting nearest studio', studioToSelect.name);
            onStudioSelect(studioToSelect);
            // Store in localStorage
            localStorage.setItem('selectedStudio', JSON.stringify(studioToSelect));
            localStorage.setItem('isPreselectedFromUrl', 'false');
          } else {
            logDebug('Could not select nearest studio - invalid studio data');
          }
        } else {
          logDebug('No studios available to select');
        }
      }
    } catch (error) {
      logDebug('Error in auto-selecting studio:', error);
    } finally {
      initialLoadCompleteRef.current = true;
    }
  }, [selectedStudio, onStudioSelect, fetchStudios]);

  // Initial load - get location once
  useEffect(() => {
    logDebug('Component mounted - getting initial location');
    getUserLocation();
    
    // Cleanup function
    return () => {
      logDebug('Component unmounting - cleaning up');
      // Clear all timeouts
      if (fetchTimeout) {
        clearTimeout(fetchTimeout);
      }
      if (visibilityTimeoutRef.current) {
        clearTimeout(visibilityTimeoutRef.current);
      }
      
      // Cancel any pending fetch
      if (fetchAbortController.current) {
        fetchAbortController.current.abort();
      }
    };
  }, [getUserLocation, fetchTimeout]);

  // When user location is set, auto-select nearest studio
  useEffect(() => {
    if (userLocation && !initialLoadCompleteRef.current) {
      logDebug('User location set - selecting nearest studio');
      autoSelectNearestStudio();
    }
  }, [userLocation, autoSelectNearestStudio]);

  // Handle visibility change (user returns to app) - with debounce
  useEffect(() => {
    const handleVisibilityChange = () => {
      // Clear any pending timeout
      if (visibilityTimeoutRef.current) {
        clearTimeout(visibilityTimeoutRef.current);
      }
      
      if (document.visibilityState === 'visible') {
        logDebug('App returned to foreground');
        // Set a timeout to debounce the operation
        visibilityTimeoutRef.current = setTimeout(() => {
          const now = Date.now();
          // If location data is older than expiry time, refresh it
          if (now - lastLocationUpdateRef.current > locationExpiryTime) {
            logDebug('Refreshing location data due to visibility change');
            getUserLocation();
          }
        }, 1000); // 1 second debounce
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [getUserLocation]);
  
  // Fetch studios when dropdown is opened
  useEffect(() => {
    if (isDropdownOpen) {
      logDebug('Dropdown opened - fetching studios');
      fetchStudios();
    }
  }, [isDropdownOpen, fetchStudios]);
  
  // Toggle dropdown
  const toggleDropdown = () => {
    logDebug(`Toggling dropdown: ${!isDropdownOpen}`);
    setIsDropdownOpen(!isDropdownOpen);
  };
  
  // Handle studio selection
  const handleStudioSelect = (studio) => {
    if (studio && studio._id) {
      logDebug('Studio selected by user', studio.name);
      onStudioSelect(studio);
      try {
        localStorage.setItem('selectedStudio', JSON.stringify(studio));
        localStorage.setItem('isPreselectedFromUrl', 'false');
      } catch (err) {
        logDebug('Error saving studio to localStorage:', err);
      }
      setIsDropdownOpen(false);
    } else {
      logDebug('Invalid studio selection attempt', studio);
    }
  };

  // Force refresh studios
  const refreshStudios = (e) => {
    if (e) e.stopPropagation(); // Prevent dropdown from closing
    logDebug('Manual refresh triggered by user');
    
    // Force loading state immediately for better UX
    setLoading(true);
    
    // Reset any errors
    setError(null);
    
    // Create a slight delay for UX reasons
    setTimeout(() => {
      fetchStudios();
    }, 100);
  };

  // Add a safety mechanism to ensure loading state doesn't get stuck
  useEffect(() => {
    if (loading) {
      // Set a safety timeout to clear loading state
      const safetyTimeout = setTimeout(() => {
        logDebug('Safety timeout clearing loading state');
        setLoading(false);
        if (studios.length === 0 && !error) {
          setError('Request took too long. Please try refreshing.');
        }
      }, 15000); // 15 seconds max loading time
      
      return () => clearTimeout(safetyTimeout);
    }
  }, [loading, studios.length, error]);

  // Simplified render with better error handling
  return (
    <div className="relative" style={{ maxWidth: "250px" }}>
      {/* Main header showing selected studio */}
      <div 
        className="flex items-center justify-between bg-gray-100 px-3 py-2 rounded-full cursor-pointer border border-gray-200 hover:border-green-400 transition-colors"
        onClick={toggleDropdown}
      >
        <div className="flex items-center">
          <MapPin className="text-green-500 mr-2 flex-shrink-0" size={18} />
          {loading && !selectedStudio ? (
            <div className="h-4 w-24 bg-gray-200 animate-pulse rounded"></div>
          ) : selectedStudio ? (
            <span className="font-medium text-sm text-gray-700 truncate">{selectedStudio.name}</span>
          ) : (
            <span className="text-gray-500 text-sm">Select location</span>
          )}
        </div>
        {isDropdownOpen ? (
          <ChevronUp size={16} className="text-gray-500 flex-shrink-0 ml-1" />
        ) : (
          <ChevronDown size={16} className="text-gray-500 flex-shrink-0 ml-1" />
        )}
      </div>
      
      {/* Dropdown for studio selection */}
      {isDropdownOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
          <div className="p-2">
            <div className="flex justify-between items-center px-3 py-2 border-b">
              <h3 className="font-medium text-sm">Select Pickup Location</h3>
              <button 
                onClick={refreshStudios}
                className="text-xs text-blue-500 hover:text-blue-700 flex items-center"
                disabled={loading}
              >
                <span>Refresh</span>
                {loading && <RefreshCw size={12} className="ml-1 animate-spin" />}
              </button>
            </div>
            
            {error ? (
              <div className="px-3 py-2 text-sm text-red-500">
                {error}
                <button 
                  onClick={refreshStudios}
                  className="ml-2 text-blue-500 hover:underline"
                >
                  Try again
                </button>
              </div>
            ) : loading ? (
              // Loading skeleton
              <div className="animate-pulse space-y-2 p-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex flex-col space-y-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : studios.length === 0 ? (
              <div className="px-3 py-4 text-center">
                <p className="text-sm text-gray-500 mb-2">No studios available</p>
                <button 
                  onClick={refreshStudios}
                  className="text-xs text-blue-500 hover:underline"
                >
                  Refresh list
                </button>
              </div>
            ) : (
              studios.map(studio => (
                studio && studio._id ? (
                  <div
                    key={studio._id}
                    className={`flex items-center justify-between px-3 py-2 hover:bg-gray-100 cursor-pointer rounded ${
                      selectedStudio?._id === studio._id ? 'bg-green-50 border-l-4 border-green-500' : ''
                    }`}
                    onClick={() => handleStudioSelect(studio)}
                  >
                    <div className="flex flex-col overflow-hidden">
                      <span className="font-medium text-sm truncate">{studio.name || 'Unnamed Studio'}</span>
                      <span className="text-xs text-gray-600 truncate">{studio.address || 'No address'}</span>
                    </div>
                    {studio.distance !== null && (
                      <span className="text-xs text-gray-500 whitespace-nowrap">{studio.distance.toFixed(1)} km</span>
                    )}
                  </div>
                ) : null
              )).filter(Boolean) // Filter out any null elements
            )}
            
            {/* Network status indicator at bottom of dropdown */}
            <div className="border-t mt-2 pt-2 px-3 flex justify-between items-center text-xs text-gray-500">
              <span>{studios.length} location{studios.length !== 1 ? 's' : ''}</span>
              {loading && <span className="text-blue-500">Loading...</span>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudioLocationHeader;