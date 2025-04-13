import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MapPin, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';

// Improved StudioLocationHeader with better studio auto-selection
const StudioLocationHeader = ({ selectedStudio, onStudioSelect, selectedCountry }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [studios, setStudios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userCountry, setUserCountry] = useState(null);
  const [allStudios, setAllStudios] = useState([]);
  const [hasAutoSelected, setHasAutoSelected] = useState(false);
  
  // Use refs to manage state that shouldn't trigger re-renders
  const locationRef = useRef(null);
  const fetchTimeoutRef = useRef(null);
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
  
  // Use the selectedCountry prop from parent when available
  useEffect(() => {
    if (selectedCountry) {
      const normalized = normalizeCountryCode(selectedCountry);
      console.log('Using selected country from props:', normalized);
      setUserCountry(normalized);
    }
  }, [selectedCountry]);
  
  // Detect user location on component mount
  useEffect(() => {
    const detectUserLocation = async () => {
      try {
        // Check for cached location (max 1 hour old)
        const locationCache = localStorage.getItem('userLocationCache');
        const locationTimestamp = parseInt(localStorage.getItem('userLocationTimestamp') || '0', 10);
        const now = Date.now();
        const ONE_HOUR = 60 * 60 * 1000;
        
        if (locationCache && (now - locationTimestamp < ONE_HOUR)) {
          console.log('Using cached location data, age:', Math.round((now - locationTimestamp) / 1000), 'seconds');
          const parsedLocation = JSON.parse(locationCache);
          locationRef.current = parsedLocation;
          
          // Get country from cached location if needed
          if (!userCountry && !selectedCountry) {
            const savedCountry = localStorage.getItem('userCountry');
            if (savedCountry) {
              console.log('Using saved country from localStorage:', savedCountry);
              setUserCountry(savedCountry);
            }
          }
          
          // Fetch studios with the cached location
          fetchAllStudios(parsedLocation);
          return;
        }
        
        // Try to get new user location from browser
        if (navigator.geolocation) {
          console.log('Requesting fresh user location...');
          
          navigator.geolocation.getCurrentPosition(
            (position) => {
              console.log('Geolocation success:', position.coords);
              
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
              fetchAllStudios(location);
              
              // Use the coordinates to estimate country if not already set
              if (!userCountry && !selectedCountry) {
                const country = estimateCountryFromCoordinates(
                  position.coords.latitude, 
                  position.coords.longitude
                );
                
                if (country) {
                  console.log('Estimated country from coordinates:', country);
                  setUserCountry(country);
                  localStorage.setItem('userCountry', country);
                }
              }
            },
            (error) => {
              console.warn('Geolocation error:', error);
              // Use browser language as fallback
              tryBrowserLanguage();
              // Still fetch studios even without location
              fetchAllStudios(null);
            },
            { 
              enableHighAccuracy: true, 
              timeout: 10000, 
              maximumAge: 60000 
            }
          );
        } else {
          console.log('Geolocation not supported');
          tryBrowserLanguage();
          fetchAllStudios(null);
        }
      } catch (error) {
        console.error('Error in location detection:', error);
        fetchAllStudios(null);
      }
    };
    
    // Try to get country from browser language
    const tryBrowserLanguage = () => {
      if (userCountry || selectedCountry) return;
      
      try {
        // Get browser language code
        const language = navigator.language || navigator.userLanguage;
        if (language) {
          // Extract country code (e.g., 'en-US' -> 'US')
          const parts = language.split('-');
          if (parts.length > 1) {
            const countryCode = parts[1].toUpperCase();
            console.log('Detected country from browser language:', countryCode);
            setUserCountry(countryCode);
            localStorage.setItem('userCountry', countryCode);
          }
        }
      } catch (error) {
        console.error('Error getting browser language:', error);
      }
    };
    
    // Start the detection process
    detectUserLocation();
    
    // Clear any pending timeouts on unmount
    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, []);
  
  // Fetch all studios from the API
  const fetchAllStudios = async (userLocation = null) => {
    // Prevent multiple simultaneous fetches
    if (loading) return;
    
    // Throttle refreshes 
    const now = Date.now();
    const FIVE_SECONDS = 5 * 1000;
    if ((now - lastRefreshTimeRef.current) < FIVE_SECONDS && lastRefreshTimeRef.current !== 0) {
      console.log('Throttling studio refresh, last refresh was', 
                 Math.round((now - lastRefreshTimeRef.current) / 1000), 'seconds ago');
      return;
    }
    
    try {
      console.log('Fetching all studios...');
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
      
      // Store all studios
      setAllStudios(activeStudios);
      
      // Calculate distances if we have user location
      let studiosWithDistance = activeStudios;
      if (userLocation || locationRef.current) {
        const locationToUse = userLocation || locationRef.current;
        studiosWithDistance = calculateDistances(activeStudios, locationToUse);
        
        // Sort by distance
        studiosWithDistance.sort((a, b) => {
          // Handle undefined/Infinity distances (push to the end)
          if (a.distance === undefined || a.distance === null || !isFinite(a.distance)) return 1;
          if (b.distance === undefined || b.distance === null || !isFinite(b.distance)) return -1;
          return a.distance - b.distance;
        });
      }
      
      // Apply country filtering if we have user country
      let filteredStudios = studiosWithDistance;
      const countryToUse = selectedCountry || userCountry;
      
      if (countryToUse) {
        const normalizedCountry = normalizeCountryCode(countryToUse);
        const countryMatches = filterStudiosByCountry(studiosWithDistance, normalizedCountry);
        
        // Only use filtered list if we found matches
        if (countryMatches.length > 0) {
          filteredStudios = countryMatches;
          console.log(`Found ${countryMatches.length} studios in ${normalizedCountry}`);
        } else {
          console.log(`No studios found in ${normalizedCountry}, showing all studios`);
        }
      }
      
      // Set studios for display
      setStudios(filteredStudios);
      
      // Auto-select nearest studio if none selected yet and we haven't already done so
      if (!selectedStudio && filteredStudios.length > 0 && !hasAutoSelected) {
        const nearestStudio = filteredStudios[0];
        console.log('Auto-selecting nearest studio:', nearestStudio.name, 
          nearestStudio.distance ? `(${nearestStudio.distance.toFixed(1)} km)` : '');
        
        // Call parent handler to select this studio
        if (onStudioSelect) {
          onStudioSelect(nearestStudio);
          // Mark that we've done auto-selection
          setHasAutoSelected(true);
        }
        
        // Save to localStorage
        try {
          localStorage.setItem('selectedStudio', JSON.stringify(nearestStudio));
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
  
  // Estimate country from coordinates - simplified with better country data
  const estimateCountryFromCoordinates = (latitude, longitude) => {
    // Country bounding boxes for major countries
    const countryBounds = [
      { code: 'US', minLat: 24.396308, maxLat: 49.384358, minLng: -125.000000, maxLng: -66.934570 },
      { code: 'CA', minLat: 41.676556, maxLat: 83.110626, minLng: -141.001944, maxLng: -52.636291 },
      { code: 'GB', minLat: 49.674, maxLat: 61.061, minLng: -8.623, maxLng: 1.759 },
      { code: 'FR', minLat: 41.333, maxLat: 51.124, minLng: -5.143, maxLng: 9.560 },
      { code: 'DE', minLat: 47.270, maxLat: 55.058, minLng: 5.866, maxLng: 15.039 },
      { code: 'IT', minLat: 36.619, maxLat: 47.095, minLng: 6.626, maxLng: 18.520 },
      { code: 'ES', minLat: 36.000, maxLat: 43.792, minLng: -9.301, maxLng: 3.322 },
      { code: 'TN', minLat: 30.231, maxLat: 37.543, minLng: 7.524, maxLng: 11.590 },
      { code: 'JP', minLat: 30.970, maxLat: 45.523, minLng: 129.705, maxLng: 145.817 },
      { code: 'SG', minLat: 1.236, maxLat: 1.466, minLng: 103.602, maxLng: 104.031 },
      { code: 'AU', minLat: -43.651, maxLat: -10.584, minLng: 112.911, maxLng: 153.639 },
      { code: 'RU', minLat: 41.186, maxLat: 81.857, minLng: 19.638, maxLng: 180.000 },
      { code: 'CN', minLat: 18.155, maxLat: 53.557, minLng: 73.556, maxLng: 134.773 }
    ];
  
    // Check if coordinates are within any country bounds
    for (const country of countryBounds) {
      if (
        latitude >= country.minLat && latitude <= country.maxLat &&
        longitude >= country.minLng && longitude <= country.maxLng
      ) {
        return country.code;
      }
    }
  
    // Fallback to nearest country center if not in bounds
    const countryCenters = [
      { code: 'US', lat: 37.0902, lng: -95.7129 },
      { code: 'CA', lat: 56.1304, lng: -106.3468 },
      { code: 'TN', lat: 34.0, lng: 9.0 },
      { code: 'GB', lat: 55.3781, lng: -3.4360 },
      { code: 'FR', lat: 46.2276, lng: 2.2137 },
      { code: 'DE', lat: 51.1657, lng: 10.4515 },
      { code: 'IT', lat: 41.8719, lng: 12.5674 },
      { code: 'ES', lat: 40.4637, lng: -3.7492 },
      { code: 'JP', lat: 36.2048, lng: 138.2529 },
      { code: 'SG', lat: 1.3521, lng: 103.8198 },
      { code: 'AU', lat: -25.2744, lng: 133.7751 },
      { code: 'RU', lat: 61.5240, lng: 105.3188 },
      { code: 'CN', lat: 35.8617, lng: 104.1954 }
    ];
  
    let closestCountry = null;
    let minDistance = Infinity;
  
    for (const country of countryCenters) {
      const distance = calculateDistance(
        latitude, longitude,
        country.lat, country.lng
      );
      
      if (distance < minDistance) {
        minDistance = distance;
        closestCountry = country.code;
      }
    }
    
    return closestCountry;
  };
  
  // Filter studios by country - more consistent standardization
  const filterStudiosByCountry = (studios, country) => {
    if (!country || !studios || studios.length === 0) {
      return studios;
    }
    
    // Normalize the country code
    const normalizedUserCountry = normalizeCountryCode(country);
    
    if (!normalizedUserCountry) {
      return studios;
    }
    
    console.log(`Filtering ${studios.length} studios by country: ${normalizedUserCountry}`);
    
    // Filter studios by normalized country
    const filteredStudios = studios.filter(studio => {
      if (!studio.country) return false;
      const normalizedStudioCountry = normalizeCountryCode(studio.country);
      return normalizedStudioCountry === normalizedUserCountry;
    });
    
    console.log(`Found ${filteredStudios.length} studios matching country ${normalizedUserCountry}`);
    return filteredStudios;
  };
  
  // Toggle dropdown
  const toggleDropdown = () => {
    setIsDropdownOpen(prev => !prev);
  };
  
  // Studio selection handler
  const handleStudioSelect = (studio) => {
    if (studio && studio._id) {
      console.log('Studio selected:', studio.name, 'Country:', studio.country, 
        studio.distance ? `Distance: ${studio.distance.toFixed(1)} km` : '');
      
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
  
  // Set filter by country
  const setCountryFilter = (country) => {
    if (country === null) {
      // Show all studios
      setUserCountry(null);
      localStorage.removeItem('userCountry');
      setStudios(allStudios);
    } else {
      // Filter by country
      const normalizedCountry = normalizeCountryCode(country);
      setUserCountry(normalizedCountry);
      localStorage.setItem('userCountry', normalizedCountry);
      
      // Filter studios
      const filtered = filterStudiosByCountry(allStudios, normalizedCountry);
      setStudios(filtered.length > 0 ? filtered : allStudios);
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
              
              console.log('Updated user location:', location);
              
              // Now fetch studios with updated location
              fetchAllStudios(location);
            },
            (error) => {
              console.warn('Could not get updated location:', error);
              // Fetch anyway with existing location
              fetchAllStudios(locationRef.current);
            },
            { 
              enableHighAccuracy: true, 
              timeout: 10000, 
              maximumAge: 0 
            }
          );
        } else {
          // Just refresh studios with existing location
          fetchAllStudios(locationRef.current);
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
  
  // Define available country filters for UI
  const countryFilters = useMemo(() => [
    { code: 'CA', name: 'Canada' },
    { code: 'US', name: 'USA' },
    { code: 'TN', name: 'Tunisia' },
    { code: 'GB', name: 'UK' },
    { code: 'DE', name: 'Germany' },
    { code: 'FR', name: 'France' }
  ], []);

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
                {userCountry ? (
                  <div className="flex items-center">
                    Studios in {userCountry}
                    <span className="ml-1 text-xs text-gray-500">
                      ({studios.length})
                    </span>
                  </div>
                ) : 'Select Pickup Location'}
              </h3>
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
            
            {/* Country filter buttons */}
            <div className="flex flex-wrap gap-1 px-3 py-2 border-b">
              {countryFilters.map(country => (
                <button 
                  key={country.code}
                  onClick={() => setCountryFilter(country.code)}
                  className={`text-xs px-2 py-1 rounded ${
                    userCountry?.toUpperCase() === country.code.toUpperCase() 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {country.name}
                </button>
              ))}
              
              <button 
                onClick={() => setCountryFilter(null)}
                className={`text-xs px-2 py-1 rounded ${
                  !userCountry 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                All
              </button>
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
                  {userCountry 
                    ? `No studios available in ${userCountry}` 
                    : 'No studios available'}
                </p>
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
                      <div className="flex flex-col flex-grow mr-2">
                        <span className="font-medium text-sm">{studio.name || 'Unnamed Studio'}</span>
                        <span className="text-xs text-gray-600 truncate">{studio.address || 'No address'}</span>
                      </div>
                      {studio.distance !== undefined && studio.distance !== null && studio.distance !== Infinity ? (
                        <span className="text-xs bg-green-50 text-green-600 px-1.5 py-0.5 rounded-full whitespace-nowrap flex-shrink-0">
                          {studio.distance.toFixed(1)} km
                        </span>
                      ) : (
                        <span className="text-xs text-gray-500 whitespace-nowrap flex-shrink-0">
                          {studio.country || '--'}
                        </span>
                      )}
                    </div>
                  ) : null
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudioLocationHeader;