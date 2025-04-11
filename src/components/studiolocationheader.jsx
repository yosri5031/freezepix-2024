import React, { useState, useEffect, useRef } from 'react';
import { MapPin, ChevronDown, ChevronUp } from 'lucide-react';

// Simplified StudioLocationHeader with basic country detection
const StudioLocationHeader = ({ selectedStudio, onStudioSelect }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [studios, setStudios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userCountry, setUserCountry] = useState(null);
  const [allStudios, setAllStudios] = useState([]);
  
  // Use refs to prevent unnecessary re-renders
  const fetchingRef = useRef(false);
  const hasFetchedRef = useRef(false);
  const locationRef = useRef(null);
  
  // Try to detect user location - only basic method that doesn't use external APIs
  useEffect(() => {
    const detectUserCountry = async () => {
      try {
        // First check if we have a saved country
        const savedCountry = localStorage.getItem('userCountry');
        if (savedCountry) {
          console.log('Using saved country:', savedCountry);
          setUserCountry(savedCountry);
          return;
        }
        
        // Try to get user location from browser
        if (navigator.geolocation) {
          console.log('Requesting user location...');
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              console.log('Location obtained:', position.coords);
              
              // Save coordinates for distance calculation
              const location = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
              };
              locationRef.current = location;
              localStorage.setItem('userLocationCache', JSON.stringify(location));
              
              // Use the coordinates to estimate country
              // This is a simple approximation
              const country = estimateCountryFromCoordinates(
                position.coords.latitude, 
                position.coords.longitude
              );
              
              if (country) {
                console.log('Estimated country:', country);
                setUserCountry(country);
                localStorage.setItem('userCountry', country);
              }
            },
            (error) => {
              console.log('Error getting location:', error);
              // Use browser language as fallback
              tryBrowserLanguage();
            }
          );
        } else {
          // No geolocation support, try browser language
          tryBrowserLanguage();
        }
      } catch (error) {
        console.error('Error detecting country:', error);
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
      // Simple bounding boxes for common countries
      // Tunisia
      if (latitude > 30 && latitude < 38 && longitude > 7 && longitude < 12) {
        return 'Tunisia';
      }
      // USA (continental)
      if (latitude > 24 && latitude < 50 && longitude > -125 && longitude < -66) {
        return 'US';
      }
      // Canada (southern part)
      if (latitude > 42 && latitude < 70 && longitude > -140 && longitude < -52) {
        return 'CA';
      }
      // UK
      if (latitude > 49 && latitude < 60 && longitude > -10 && longitude < 2) {
        return 'UK';
      }
      // France
      if (latitude > 41 && latitude < 51 && longitude > -5 && longitude < 10) {
        return 'France';
      }
      
      return null;
    };
    
    detectUserCountry();
  }, []);
  
  // Fetch studios on mount
  useEffect(() => {
    const fetchAllStudios = async () => {
      if (hasFetchedRef.current) return;
      
      try {
        console.log('Fetching all studios...');
        setLoading(true);
        
        const response = await fetch('https://freezepix-database-server-c95d4dd2046d.herokuapp.com/api/studios');
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Process the data
        const studiosArray = Array.isArray(data) ? data : [data];
        const activeStudios = studiosArray.filter(studio => studio && studio.isActive);
        
        // Log all studio countries for debugging
        console.log('Studio data countries:', studiosArray.map(s => s?.country || 'unknown'));
        
        // Store all studios
        setAllStudios(activeStudios);
        hasFetchedRef.current = true;
        
        // Calculate distances if we have user location
        let studiosWithDistance = activeStudios;
        if (locationRef.current) {
          studiosWithDistance = calculateDistances(activeStudios, locationRef.current);
        }
        
        // Apply country filtering if we have a user country
        if (userCountry) {
          const filtered = filterStudiosByCountry(studiosWithDistance, userCountry);
          // Only use filtered if we found matches
          if (filtered.length > 0) {
            studiosWithDistance = filtered;
          }
        }
        
        // Set studios
        setStudios(studiosWithDistance);
        
        // If no studio is selected yet, select the nearest one
        if (!selectedStudio && studiosWithDistance.length > 0) {
          // Sort by distance if available
          if (locationRef.current) {
            studiosWithDistance.sort((a, b) => {
              if (a.distance === undefined || a.distance === null) return 1;
              if (b.distance === undefined || b.distance === null) return -1;
              return a.distance - b.distance;
            });
          }
          
          const firstStudio = studiosWithDistance[0];
          console.log('Auto-selecting first studio:', firstStudio.name);
          
          // Set country from selected studio if not set
          if (firstStudio.country && !userCountry) {
            console.log('Setting country from first studio:', firstStudio.country);
            setUserCountry(firstStudio.country);
            localStorage.setItem('userCountry', firstStudio.country);
          }
          
          // Call parent handler to select this studio
          if (onStudioSelect) {
            onStudioSelect(firstStudio);
          }
        }
      } catch (err) {
        console.error('Error fetching studios:', err);
        setError('Failed to load studios. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllStudios();
  }, [selectedStudio, onStudioSelect, userCountry]);
  
  // Calculate distances between user and studios
  const calculateDistances = (studios, userLocation) => {
    return studios.map(studio => {
      if (!studio.coordinates || !studio.coordinates.latitude || !studio.coordinates.longitude) {
        return { ...studio, distance: null };
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
          distance: distance !== null && !isNaN(distance) ? distance : null
        };
      } catch (error) {
        console.error('Error calculating distance:', error);
        return { ...studio, distance: null };
      }
    });
  };
  
  // Calculate distance between coordinates
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    try {
      // Convert to numbers if they're strings
      const latitude1 = typeof lat1 === 'string' ? parseFloat(lat1) : lat1;
      const longitude1 = typeof lon1 === 'string' ? parseFloat(lon1) : lon1;
      const latitude2 = typeof lat2 === 'string' ? parseFloat(lat2) : lat2;
      const longitude2 = typeof lon2 === 'string' ? parseFloat(lon2) : lon2;
      
      // Check for invalid values
      if (isNaN(latitude1) || isNaN(longitude1) || isNaN(latitude2) || isNaN(longitude2)) {
        return null;
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
      
      return isFinite(distance) ? distance : null;
    } catch (error) {
      console.error('Distance calculation error:', error);
      return null;
    }
  };
  
  // Filter studios by country - simplified but robust function
  const filterStudiosByCountry = (studios, country) => {
    if (!country || !studios || studios.length === 0) {
      return studios;
    }
    
    console.log(`Filtering ${studios.length} studios by country: ${country}`);
    
    // Simple direct matching function - handles the key country codes we need
    const matchCountry = (studio) => {
      if (!studio.country) return false;
      
      const normalizedStudioCountry = studio.country.toLowerCase().trim();
      const normalizedUserCountry = country.toLowerCase().trim();
      
      // Direct match
      if (normalizedStudioCountry === normalizedUserCountry) {
        return true;
      }
      
      // TUNISIA check (special case)
      if ((normalizedUserCountry === 'tunisia' || normalizedUserCountry === 'tn' || normalizedUserCountry === 'tun') &&
          (normalizedStudioCountry === 'tunisia' || normalizedStudioCountry === 'tn' || normalizedStudioCountry === 'tun')) {
        return true;
      }
      
      // US/USA check (special case)
      if ((normalizedUserCountry === 'us' || normalizedUserCountry === 'usa' || normalizedUserCountry === 'united states') &&
          (normalizedStudioCountry === 'us' || normalizedStudioCountry === 'usa' || normalizedStudioCountry === 'united states')) {
        return true;
      }
      
      // CANADA check (special case)
      if ((normalizedUserCountry === 'ca' || normalizedUserCountry === 'can' || normalizedUserCountry === 'canada') &&
          (normalizedStudioCountry === 'ca' || normalizedStudioCountry === 'can' || normalizedStudioCountry === 'canada')) {
        return true;
      }
      
      return false;
    };
    
    // Filter studios
    const filteredStudios = studios.filter(matchCountry);
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
      console.log('Studio selected:', studio.name, 'Country:', studio.country);
      
      // If the user's country isn't set yet, try to set it from the selected studio
      if (studio.country) {
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
    hasFetchedRef.current = false;
    
    // Refetch all studios
    const fetchStudios = async () => {
      try {
        setLoading(true);
        
        const response = await fetch('https://freezepix-database-server-c95d4dd2046d.herokuapp.com/api/studios');
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Process the data
        const studiosArray = Array.isArray(data) ? data : [data];
        const activeStudios = studiosArray.filter(studio => studio && studio.isActive);
        
        // Calculate distances if we have user location
        let studiosWithDistance = activeStudios;
        if (locationRef.current) {
          studiosWithDistance = calculateDistances(activeStudios, locationRef.current);
        }
        
        // Store all studios
        setAllStudios(studiosWithDistance);
        
        // Apply country filter if available
        if (userCountry) {
          const filtered = filterStudiosByCountry(studiosWithDistance, userCountry);
          if (filtered.length > 0) {
            setStudios(filtered);
          } else {
            setStudios(studiosWithDistance);
          }
        } else {
          setStudios(studiosWithDistance);
        }
      } catch (err) {
        console.error('Error refreshing studios:', err);
        setError('Failed to refresh studios. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchStudios();
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
                Refresh
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
            
            {/* Content */}
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
                      {studio.distance !== null && studio.distance !== undefined ? (
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