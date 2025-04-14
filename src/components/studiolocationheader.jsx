import React, { useState, useEffect, useRef } from 'react';
import { MapPin, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';

// Simplified StudioLocationHeader that focuses on showing the nearest location
const StudioLocationHeader = ({ selectedStudio, onStudioSelect, selectedCountry }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [studios, setStudios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasAutoSelected, setHasAutoSelected] = useState(false);
  const [nearestStudio, setNearestStudio] = useState(null);
  
  // Use refs to manage state that shouldn't trigger re-renders
  const locationRef = useRef(null);
  const lastRefreshTimeRef = useRef(0);
  
  // Normalize country codes consistently
  const normalizeCountryCode = (code) => {
    if (!code) return null;
    
    const countryMap = {
      'USA': 'US',
      'United States': 'US',
      'CAN': 'CA',
      'Canada': 'CA',
      'TUN': 'TN',
      'Tunisia': 'TN',
      'UK': 'GB',
      'United Kingdom': 'GB',
      'DEU': 'DE',
      'Germany': 'DE',
      'FRA': 'FR',
      'France': 'FR',
      'ITA': 'IT',
      'Italy': 'IT',
      'ESP': 'ES',
      'Spain': 'ES',
      'RUS': 'RU',
      'Russia': 'RU',
      'CHN': 'CN',
      'China': 'CN'
    };
    
    return countryMap[code] || code;
  };
  
  // Fetch studios and auto-select nearest one
  useEffect(() => {
    // Don't do anything if there's already a selected studio
    if (selectedStudio) return;
    
    const detectLocationAndFetchStudios = async () => {
      try {
        // Check for cached location (max 1 hour old)
        const locationCache = localStorage.getItem('userLocationCache');
        const locationTimestamp = parseInt(localStorage.getItem('userLocationTimestamp') || '0', 10);
        const now = Date.now();
        const ONE_HOUR = 60 * 60 * 1000;
        
        if (locationCache && (now - locationTimestamp < ONE_HOUR)) {
          console.log('Using cached location data');
          const parsedLocation = JSON.parse(locationCache);
          locationRef.current = parsedLocation;
          
          // Fetch studios with the cached location
          fetchStudios(parsedLocation);
          return;
        }
        
        // Try to get new user location from browser
        if (navigator.geolocation) {
          console.log('Requesting fresh user location...');
          
          navigator.geolocation.getCurrentPosition(
            (position) => {
              console.log('Geolocation success');
              
              // Save coordinates for distance calculation
              const location = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
              };
              
              // Store location with timestamp
              locationRef.current = location;
              localStorage.setItem('userLocationCache', JSON.stringify(location));
              localStorage.setItem('userLocationTimestamp', now.toString());
              
              // Fetch studios with the new location
              fetchStudios(location);
            },
            (error) => {
              console.warn('Geolocation error:', error);
              // Still fetch studios even without location
              fetchStudios(null);
            },
            { 
              enableHighAccuracy: true, 
              timeout: 10000, 
              maximumAge: 60000 
            }
          );
        } else {
          console.log('Geolocation not supported');
          fetchStudios(null);
        }
      } catch (error) {
        console.error('Error in location detection:', error);
        fetchStudios(null);
      }
    };
    
    detectLocationAndFetchStudios();
  }, [selectedStudio, selectedCountry]);
  
  // Fetch studios with filtering by selected country
  const fetchStudios = async (userLocation = null) => {
    // Prevent multiple simultaneous fetches
    if (loading) return;
    
    // Throttle refreshes 
    const now = Date.now();
    const FIVE_SECONDS = 5 * 1000;
    if ((now - lastRefreshTimeRef.current) < FIVE_SECONDS && lastRefreshTimeRef.current !== 0) {
      console.log('Throttling studio refresh');
      return;
    }
    
    try {
      console.log('Fetching studios...');
      setLoading(true);
      lastRefreshTimeRef.current = now;
      
      const response = await fetch('https://freezepix-database-server-c95d4dd2046d.herokuapp.com/api/studios');
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Process the studio data
      const studiosArray = Array.isArray(data) ? data : [];
      const activeStudios = studiosArray.filter(studio => 
        studio && 
        studio.isActive !== false && // Consider undefined as active too
        studio._id // Make sure it has an ID
      );
      
      // Filter by selectedCountry if it exists
      let countryFilteredStudios = activeStudios;
      if (selectedCountry) {
        const normalizedSelectedCountry = normalizeCountryCode(selectedCountry);
        const countryStudios = activeStudios.filter(studio => {
          if (!studio.country) return false;
          const normalizedStudioCountry = normalizeCountryCode(studio.country);
          return normalizedStudioCountry === normalizedSelectedCountry;
        });
        
        // Only use filtered list if we found matches
        if (countryStudios.length > 0) {
          countryFilteredStudios = countryStudios;
        }
      }
      
      // Calculate distances if we have user location
      let studiosWithDistance = countryFilteredStudios;
      if (userLocation || locationRef.current) {
        const locationToUse = userLocation || locationRef.current;
        studiosWithDistance = calculateDistances(countryFilteredStudios, locationToUse);
        
        // Sort by distance
        studiosWithDistance.sort((a, b) => {
          // Handle undefined/Infinity distances (push to the end)
          if (a.distance === undefined || a.distance === null || !isFinite(a.distance)) return 1;
          if (b.distance === undefined || b.distance === null || !isFinite(b.distance)) return -1;
          return a.distance - b.distance;
        });
      }
      
      // Set studios for display
      setStudios(studiosWithDistance);
      
      // Store the nearest studio first
      if (studiosWithDistance.length > 0) {
        setNearestStudio(studiosWithDistance[0]);
      }
      
      // Auto-select nearest studio if none selected yet
      if (!selectedStudio && studiosWithDistance.length > 0 && !hasAutoSelected) {
        const nearest = studiosWithDistance[0];
        
        // Call parent handler to select this studio
        if (onStudioSelect) {
          onStudioSelect(nearest);
          // Mark that we've done auto-selection
          setHasAutoSelected(true);
        }
        
        // Save to localStorage
        try {
          localStorage.setItem('selectedStudio', JSON.stringify(nearest));
          localStorage.setItem('isPreselectedFromUrl', 'false');
        } catch (e) {
          console.error('Error saving studio to localStorage:', e);
        }
      }
    } catch (err) {
      console.error('Error fetching studios:', err);
      setError('Failed to load studios. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Calculate distances between user and studios
  const calculateDistances = (studios, userLocation) => {
    if (!userLocation || !userLocation.latitude || !userLocation.longitude) {
      return studios;
    }
    
    return studios.map(studio => {
      if (!studio.coordinates || 
          typeof studio.coordinates.latitude === 'undefined' || 
          typeof studio.coordinates.longitude === 'undefined') {
        return { ...studio, distance: Infinity };
      }
      
      try {
        const distance = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          studio.coordinates.latitude,
          studio.coordinates.longitude
        );
        
        return {
          ...studio,
          distance: (distance !== null && !isNaN(distance) && isFinite(distance)) 
            ? distance 
            : Infinity
        };
      } catch (error) {
        console.error('Error calculating distance for studio:', studio.name, error);
        return { ...studio, distance: Infinity };
      }
    });
  };
  
  // Calculate distance between coordinates (Haversine formula)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    try {
      // Convert to numbers if they're strings
      const latitude1 = typeof lat1 === 'string' ? parseFloat(lat1) : lat1;
      const longitude1 = typeof lon1 === 'string' ? parseFloat(lon1) : lon1;
      const latitude2 = typeof lat2 === 'string' ? parseFloat(lat2) : lat2;
      const longitude2 = typeof lon2 === 'string' ? parseFloat(lon2) : lon2;
      
      // Check for invalid values
      if (isNaN(latitude1) || isNaN(longitude1) || isNaN(latitude2) || isNaN(longitude2)) {
        return Infinity;
      }
      
      // Calculate distance using Haversine formula
      const R = 6371; // Earth radius in km
      const dLat = (latitude2 - latitude1) * Math.PI / 180;
      const dLon = (longitude2 - longitude1) * Math.PI / 180;
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(latitude1 * Math.PI / 180) * Math.cos(latitude2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distance = R * c;
      
      return isFinite(distance) ? distance : Infinity;
    } catch (error) {
      console.error('Distance calculation error:', error);
      return Infinity;
    }
  };
  
  // Toggle dropdown
  const toggleDropdown = () => {
    setIsDropdownOpen(prev => !prev);
  };
  
  // Studio selection handler
  const handleStudioSelect = (studio) => {
    if (studio && studio._id) {
      // Call parent handler
      if (onStudioSelect) {
        onStudioSelect(studio);
      }
      
      // Save to localStorage
      try {
        localStorage.setItem('selectedStudio', JSON.stringify(studio));
        localStorage.setItem('isPreselectedFromUrl', 'false');
      } catch (e) {
        console.error('Error saving studio to localStorage:', e);
      }
      
      setIsDropdownOpen(false);
    }
  };
  
  // Refresh button handler
  const handleRefresh = (e) => {
    e.stopPropagation();
    
    // Clear cache to force refresh
    localStorage.removeItem('userLocationCache');
    localStorage.removeItem('userLocationTimestamp');
    
    // Re-detect location and fetch studios
    const refreshAll = async () => {
      try {
        setLoading(true);
        
        // Get fresh geolocation if available
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const location = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
              };
              
              // Update location ref and cache
              locationRef.current = location;
              localStorage.setItem('userLocationCache', JSON.stringify(location));
              localStorage.setItem('userLocationTimestamp', Date.now().toString());
              
              // Now fetch studios with updated location
              fetchStudios(location);
            },
            (error) => {
              console.warn('Could not get updated location:', error);
              // Fetch anyway with existing location
              fetchStudios(locationRef.current);
            },
            { 
              enableHighAccuracy: true, 
              timeout: 10000, 
              maximumAge: 0 
            }
          );
        } else {
          // Just refresh studios with existing location
          fetchStudios(locationRef.current);
        }
      } catch (err) {
        console.error('Error during refresh:', err);
        setError('Failed to refresh. Please try again.');
        setLoading(false);
      }
    };
    
    refreshAll();
  };

  // Set base width for the component
  const baseWidth = 250;
  // Calculate dropdown width
  const dropdownWidth = baseWidth * 1.3;

  return (
    <div className="relative" style={{ width: `${baseWidth}px` }}>
      {/* Header button */}
      <div 
        className="flex items-center justify-between bg-gray-100 px-3 py-2 rounded-full cursor-pointer border border-gray-200 hover:border-green-400 transition-colors"
        onClick={toggleDropdown}
      >
        <div className="flex items-center">
          <MapPin className="text-green-500 mr-2" size={18} />
          {selectedStudio ? (
            <span className="font-medium text-sm text-gray-700 truncate max-w-[180px]">
              {selectedStudio.name}
            </span>
          ) : loading ? (
            <span className="text-gray-500 text-sm">Loading...</span>
          ) : (
            <span className="text-gray-500 text-sm">Select location</span>
          )}
        </div>
        {isDropdownOpen ? (
          <ChevronUp size={16} className="text-gray-500" />
        ) : (
          <ChevronDown size={16} className="text-gray-500" />
        )}
      </div>
      
      {/* Dropdown */}
      {isDropdownOpen && (
        <div 
          className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto"
          style={{ width: `${dropdownWidth}px` }}
        >
          <div className="p-2">
            <div className="flex justify-between items-center px-3 py-2 border-b">
              <h3 className="font-medium text-sm">
                Pick-up Locations
                <span className="ml-1 text-xs text-gray-500">
                  ({studios.length})
                </span>
              </h3>
              <div className="flex items-center space-x-2">
                {selectedCountry && (
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                    {selectedCountry}
                  </span>
                )}
                <button 
                  onClick={handleRefresh}
                  className="text-xs flex items-center text-blue-500 hover:text-blue-700"
                  disabled={loading}
                >
                  {loading ? (
                    'Loading...'
                  ) : (
                    <>
                      <RefreshCw size={12} className="mr-1" />
                      Refresh
                    </>
                  )}
                </button>
              </div>
            </div>
            
            {/* Studios list */}
            <div className="py-2">
              {error ? (
                <p className="px-3 text-sm text-red-500">{error}</p>
              ) : loading ? (
                <div className="animate-pulse space-y-2 p-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-10 bg-gray-200 rounded"></div>
                  ))}
                </div>
              ) : studios.length === 0 ? (
                <p className="px-3 text-sm text-gray-500">
                  No studios available
                </p>
              ) : (
                <>
                  {/* Nearest studio highlight - always at the top */}
                  {nearestStudio && nearestStudio.distance !== undefined && (
                    <div className="mb-2 px-3 py-1">
                      <div className="text-xs font-medium text-green-600 uppercase mb-1">Nearest Location:</div>
                      <div
                        className={`flex items-center justify-between px-3 py-2 bg-green-50 hover:bg-green-100 cursor-pointer rounded border border-green-200 ${
                          selectedStudio?._id === nearestStudio._id ? 'border-l-4 border-green-500' : ''
                        }`}
                        onClick={() => handleStudioSelect(nearestStudio)}
                      >
                        <div className="flex flex-col flex-grow mr-2">
                          <span className="font-medium text-sm">{nearestStudio.name || 'Unnamed Studio'}</span>
                          <span className="text-xs text-gray-600 truncate">{nearestStudio.address || 'No address'}</span>
                        </div>
                        <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full whitespace-nowrap flex-shrink-0 font-medium">
                          {nearestStudio.distance.toFixed(1)} km
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {/* Divider between nearest and all locations */}
                  {nearestStudio && (
                    <div className="px-3 py-1">
                      <div className="text-xs font-medium text-gray-500 uppercase">All Locations:</div>
                    </div>
                  )}
                  
                  {/* All studios list */}
                  {studios.map(studio => (
                    studio && studio._id ? (
                      <div
                        key={studio._id}
                        className={`flex items-center justify-between px-3 py-2 hover:bg-gray-100 cursor-pointer rounded ${
                          selectedStudio?._id === studio._id ? 'bg-yellow-50 border-l-4 border-yellow-500' : ''
                        }`}
                        onClick={() => handleStudioSelect(studio)}
                      >
                        <div className="flex flex-col flex-grow mr-2">
                          <span className="font-medium text-sm">{studio.name || 'Unnamed Studio'}</span>
                          <span className="text-xs text-gray-600 truncate">{studio.address || 'No address'}</span>
                        </div>
                        {studio.distance !== undefined && studio.distance !== null && studio.distance !== Infinity ? (
                          <span className="text-xs bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded-full whitespace-nowrap flex-shrink-0">
                            {studio.distance.toFixed(1)} km
                          </span>
                        ) : null}
                      </div>
                    ) : null
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudioLocationHeader;