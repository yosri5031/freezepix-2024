import React, { useState, useEffect, useRef } from 'react';
import { MapPin, ChevronDown, ChevronUp } from 'lucide-react';

// Improved StudioLocationHeader with better geolocation and studio selection
const StudioLocationHeader = ({ selectedStudio, onStudioSelect }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [studios, setStudios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userCountry, setUserCountry] = useState(null);
  const [allStudios, setAllStudios] = useState([]);
  
  // Use refs to prevent unnecessary re-renders
  const locationRef = useRef(null);
  const hasFetchedRef = useRef(false);
  const lastRefreshTimeRef = useRef(0);
  
  // Try to detect user location - improved method
  useEffect(() => {
    const detectUserLocation = async () => {
      try {
        // Check if we have a recent location in localStorage (less than 1 hour old)
        const locationCache = localStorage.getItem('userLocationCache');
        const locationTimestamp = parseInt(localStorage.getItem('userLocationTimestamp') || '0', 10);
        const now = Date.now();
        const ONE_HOUR = 60 * 60 * 1000;
        
        if (locationCache && (now - locationTimestamp < ONE_HOUR)) {
          console.log('Using cached location, age:', (now - locationTimestamp) / 1000, 'seconds');
          const parsedLocation = JSON.parse(locationCache);
          locationRef.current = parsedLocation;
          
          // Get country from cached location if needed
          if (!userCountry) {
            const savedCountry = localStorage.getItem('userCountry');
            if (savedCountry) {
              console.log('Using saved country:', savedCountry);
              setUserCountry(savedCountry);
            }
          }
          
          return;
        }
        
        // Try to get user location from browser
        if (navigator.geolocation) {
          console.log('Requesting fresh user location...');
          
          // Promise-based geolocation
          const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 5000,
              maximumAge: 0
            });
          });
          
          console.log('Fresh location obtained:', position.coords);
          
          // Save coordinates for distance calculation
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          
          // Store location with timestamp
          locationRef.current = location;
          localStorage.setItem('userLocationCache', JSON.stringify(location));
          localStorage.setItem('userLocationTimestamp', now.toString());
          
          // Use the coordinates to estimate country
          const country = estimateCountryFromCoordinates(
            position.coords.latitude, 
            position.coords.longitude
          );
          
          if (country) {
            console.log('Estimated country:', country);
            setUserCountry(country);
            localStorage.setItem('userCountry', country);
          }
          
          // Force a refresh of the studio list with the new location
          hasFetchedRef.current = false;
          fetchAllStudios();
        } else {
          // No geolocation support, try browser language
          tryBrowserLanguage();
        }
      } catch (error) {
        console.error('Error detecting location:', error);
        tryBrowserLanguage();
      }
    };
    
    // Try to get country from browser language
    const tryBrowserLanguage = () => {
      try {
        // Get browser language code
        const language = navigator.language || navigator.userLanguage;
        if (language) {
          // Extract country code (e.g., 'en-US' -> 'US')
          const parts = language.split('-');
          if (parts.length > 1) {
            const countryCode = parts[1].toUpperCase();
            console.log('Country from browser language:', countryCode);
            setUserCountry(countryCode);
            localStorage.setItem('userCountry', countryCode);
          }
        }
      } catch (error) {
        console.error('Error getting browser language:', error);
      }
    };
    
    // Simple function to estimate country from coordinates
    const estimateCountryFromCoordinates = (latitude, longitude) => {
      // Country bounding boxes - improved accuracy
      const countryBounds = [
        // North America
        { name: 'US', minLat: 24.396308, maxLat: 49.384358, minLng: -125.000000, maxLng: -66.934570 },
        { name: 'CA', minLat: 41.676556, maxLat: 83.110626, minLng: -141.001944, maxLng: -52.636291 },
        
        // Europe
        { name: 'UK', minLat: 49.674, maxLat: 61.061, minLng: -8.623, maxLng: 1.759 },
        { name: 'France', minLat: 41.333, maxLat: 51.124, minLng: -5.143, maxLng: 9.560 },
        { name: 'Germany', minLat: 47.270, maxLat: 55.058, minLng: 5.866, maxLng: 15.039 },
        { name: 'Italy', minLat: 36.619, maxLat: 47.095, minLng: 6.626, maxLng: 18.520 },
        { name: 'Spain', minLat: 36.000, maxLat: 43.792, minLng: -9.301, maxLng: 3.322 },
        
        // Africa
        { name: 'Tunisia', minLat: 30.231, maxLat: 37.543, minLng: 7.524, maxLng: 11.590 },
        
        // Asia & Oceania
        { name: 'JP', minLat: 30.970, maxLat: 45.523, minLng: 129.705, maxLng: 145.817 },
        { name: 'SG', minLat: 1.236, maxLat: 1.466, minLng: 103.602, maxLng: 104.031 },
        { name: 'AU', minLat: -43.651, maxLat: -10.584, minLng: 112.911, maxLng: 153.639 },
        { name: 'RU', minLat: 41.186, maxLat: 81.857, minLng: 19.638, maxLng: 180.000 },
        { name: 'CN', minLat: 18.155, maxLat: 53.557, minLng: 73.556, maxLng: 134.773 }
      ];
    
      // Check if coordinates are within any country bounds
      for (const country of countryBounds) {
        if (
          latitude >= country.minLat && latitude <= country.maxLat &&
          longitude >= country.minLng && longitude <= country.maxLng
        ) {
          return country.name;
        }
      }
    
      // If not in bounds, find nearest country center
      const countryCenters = [
        { name: 'US', lat: 37.0902, lng: -95.7129 },
        { name: 'CA', lat: 56.1304, lng: -106.3468 },
        { name: 'Tunisia', lat: 34.0, lng: 9.0 },
        { name: 'UK', lat: 55.3781, lng: -3.4360 },
        { name: 'France', lat: 46.2276, lng: 2.2137 },
        { name: 'Germany', lat: 51.1657, lng: 10.4515 },
        { name: 'Italy', lat: 41.8719, lng: 12.5674 },
        { name: 'Spain', lat: 40.4637, lng: -3.7492 },
        { name: 'JP', lat: 36.2048, lng: 138.2529 },
        { name: 'SG', lat: 1.3521, lng: 103.8198 },
        { name: 'AU', lat: -25.2744, lng: 133.7751 },
        { name: 'RU', lat: 61.5240, lng: 105.3188 },
        { name: 'CN', lat: 35.8617, lng: 104.1954 }
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
          closestCountry = country.name;
        }
      }
      
      return closestCountry;
    };
    
    detectUserLocation();
  }, []);
  
  // Fetch studios function - separated from useEffect for clarity
  const fetchAllStudios = async () => {
    // Prevent multiple simultaneous fetches
    if (loading) return;
    
    // Throttle refreshes to prevent infinite loops
    const now = Date.now();
    const TEN_SECONDS = 10 * 1000;
    if ((now - lastRefreshTimeRef.current) < TEN_SECONDS && lastRefreshTimeRef.current !== 0) {
      console.log('Throttling refresh, last refresh was', (now - lastRefreshTimeRef.current) / 1000, 'seconds ago');
      return;
    }
    
    try {
      console.log('Fetching all studios...');
      setLoading(true);
      lastRefreshTimeRef.current = now;
      
      const response = await fetch('https://freezepix-database-server-c95d4dd2046d.herokuapp.com/api/studios');
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Process the data
      const studiosArray = Array.isArray(data) ? data : [];
      const activeStudios = studiosArray.filter(studio => studio && studio.isActive);
      
      // Log all studio countries for debugging
      console.log('Studio data countries:', activeStudios.map(s => s?.country || 'unknown'));
      
      // Store all studios
      setAllStudios(activeStudios);
      hasFetchedRef.current = true;
      
      // Calculate distances if we have user location
 // Calculate distances if we have user location
 let studiosWithDistance = activeStudios;
 if (locationRef.current) {
   studiosWithDistance = calculateDistances(activeStudios, locationRef.current);
   
   // Sort by distance first - THIS IS VERY IMPORTANT!
   studiosWithDistance.sort((a, b) => {
     if (a.distance === undefined || a.distance === null) return 1;
     if (b.distance === undefined || b.distance === null) return -1;
     return a.distance - b.distance;
   });
   
   console.log('Studios sorted by distance:', 
     studiosWithDistance.map(s => `${s.name}: ${s.distance ? s.distance.toFixed(1) : 'unknown'} km`)
   );
 }
 
 // Apply country filtering ONLY if we have user country AND there are studios in that country
 let filteredStudios = studiosWithDistance;
 if (userCountry) {
   const countryMatches = filterStudiosByCountry(studiosWithDistance, userCountry);
   // Only use filtered if we found matches
   if (countryMatches.length > 0) {
     filteredStudios = countryMatches;
     console.log(`Found ${countryMatches.length} studios in ${userCountry}`);
   } else {
     console.log(`No studios found in ${userCountry}, showing all studios sorted by distance`);
   }
 }
      // Set studios for display
      setStudios(filteredStudios);
      
      // If no studio is selected yet, select the nearest one
      if (!selectedStudio && filteredStudios.length > 0) {
        const nearestStudio = filteredStudios[0];
        console.log('Auto-selecting nearest studio:', nearestStudio.name, 
          nearestStudio.distance ? `(${nearestStudio.distance.toFixed(1)} km)` : '');
        
        // Set country from selected studio if not set
        if (nearestStudio.country && !userCountry) {
          console.log('Setting country from nearest studio:', nearestStudio.country);
          setUserCountry(nearestStudio.country);
          localStorage.setItem('userCountry', nearestStudio.country);
        }
        
        // Call parent handler to select this studio
        if (onStudioSelect) {
          onStudioSelect(nearestStudio);
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
  
  // Fetch studios on mount or when dependencies change
  useEffect(() => {
    // Only fetch if we haven't already, or if user country changed
    if (!hasFetchedRef.current) {
      fetchAllStudios();
    }
  }, [selectedStudio, userCountry]);
  
  // Calculate distances between user and studios with improved error handling
  const calculateDistances = (studios, userLocation) => {
    if (!userLocation || !userLocation.latitude || !userLocation.longitude) {
      return studios;
    }
    
    return studios.map(studio => {
      if (!studio.coordinates || 
          typeof studio.coordinates.latitude === 'undefined' || 
          typeof studio.coordinates.longitude === 'undefined') {
        return { ...studio, distance: Infinity }; // Use Infinity to push to bottom when sorting
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
  
  // Filter studios by country - robust function with better normalization
  const filterStudiosByCountry = (studios, country) => {
    if (!country || !studios || studios.length === 0) {
      return studios;
    }
    
    console.log(`Filtering ${studios.length} studios by country: ${country}`);
    
    // Normalize country codes for comparison
    const normalizeCountry = (countryStr) => {
      if (!countryStr) return '';
      
      const normalized = countryStr.toLowerCase().trim();
      
      // Map common country names/codes to consistent values
      if (normalized === 'tunisia' || normalized === 'tn' || normalized === 'tun') {
        return 'tunisia';
      }
      if (normalized === 'us' || normalized === 'usa' || normalized === 'united states') {
        return 'us';
      }
      if (normalized === 'ca' || normalized === 'can' || normalized === 'canada') {
        return 'ca';
      }
      if (normalized === 'uk' || normalized === 'united kingdom' || normalized === 'gb') {
        return 'uk';
      }
      
      return normalized;
    };
    
    const normalizedUserCountry = normalizeCountry(country);
    
    // Filter studios by normalized country
    const filteredStudios = studios.filter(studio => {
      const normalizedStudioCountry = normalizeCountry(studio.country);
      return normalizedStudioCountry === normalizedUserCountry;
    });
    
    console.log(`Found ${filteredStudios.length} studios matching country ${country}`);
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
      
      // If the user's country isn't set yet, try to set it from the selected studio
      if (studio.country && !userCountry) {
        console.log('Setting user country from selected studio:', studio.country);
        setUserCountry(studio.country);
        localStorage.setItem('userCountry', studio.country);
      }
      
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
  
  // Set filter by country (for dropdown menu)
  const setCountryFilter = (country) => {
    if (country === null) {
      // Show all studios
      setUserCountry(null);
      localStorage.removeItem('userCountry');
      setStudios(allStudios);
    } else {
      // Filter by country
      setUserCountry(country);
      localStorage.setItem('userCountry', country);
      
      // Filter studios
      const filtered = filterStudiosByCountry(allStudios, country);
      if (filtered.length > 0) {
        setStudios(filtered);
      } else {
        // If no studios match, show all studios
        setStudios(allStudios);
      }
    }
  };
  
  // Refresh button handler
  const handleRefresh = (e) => {
    e.stopPropagation();
    
    // Clear cache flags to force refresh
    hasFetchedRef.current = false;
    
    // For a full refresh, also clear location cache to get fresh position
    localStorage.removeItem('userLocationCache');
    localStorage.removeItem('userLocationTimestamp');
    
    // Re-detect location then fetch studios
    const refreshAll = async () => {
      try {
        setLoading(true);
        
        // Get fresh geolocation if available
        if (navigator.geolocation) {
          try {
            const position = await new Promise((resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
              });
            });
            
            const location = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            };
            
            // Update location ref and cache
            locationRef.current = location;
            localStorage.setItem('userLocationCache', JSON.stringify(location));
            localStorage.setItem('userLocationTimestamp', Date.now().toString());
            
            console.log('Updated user location on refresh:', location);
          } catch (locError) {
            console.log('Could not get fresh location, using cached if available');
          }
        }
        
        // Now fetch studios with updated location
        await fetchAllStudios();
      } catch (err) {
        console.error('Error during full refresh:', err);
        setError('Failed to refresh. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    refreshAll();
  };

  // Set base width for the component
  const baseWidth = 250;
  // Calculate dropdown width (1.3x the base width)
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
            <span className="font-medium text-sm text-gray-700 truncate">{selectedStudio.name}</span>
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
      
      {/* Dropdown - 1.3x wider than the parent */}
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
                className="text-xs text-blue-500 hover:text-blue-700"
                disabled={loading}
              >
                {loading ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
            
            {/* Country filter buttons */}
            <div className="flex flex-wrap gap-1 px-3 py-2 border-b">
              <button 
                onClick={() => setCountryFilter('CA')}
                className={`text-xs px-2 py-1 rounded ${userCountry?.toLowerCase() === 'ca' || userCountry?.toLowerCase() === 'canada' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
              >
                Canada
              </button>

              <button 
                onClick={() => setCountryFilter('US')}
                className={`text-xs px-2 py-1 rounded ${userCountry?.toLowerCase() === 'us' || userCountry?.toLowerCase() === 'usa' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
              >
                USA
              </button>

              <button 
                onClick={() => setCountryFilter('Tunisia')}
                className={`text-xs px-2 py-1 rounded ${userCountry?.toLowerCase() === 'tunisia' || userCountry?.toLowerCase() === 'tn' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
              >
                Tunisia
              </button>
              
              <button 
                onClick={() => setCountryFilter(null)}
                className={`text-xs px-2 py-1 rounded ${!userCountry ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}
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
                        <span className="text-xs text-gray-600 break-words">{studio.address || 'No address'}</span>
                      </div>
                      {studio.distance !== null && studio.distance !== undefined && studio.distance !== Infinity ? (
                        <span className="text-xs text-gray-500 whitespace-nowrap flex-shrink-0">
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