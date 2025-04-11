import React, { useState, useEffect, useRef } from 'react';
import { MapPin, ChevronDown, ChevronUp } from 'lucide-react';

// Complete StudioLocationHeader with robust country filtering
const StudioLocationHeader = ({ selectedStudio, onStudioSelect }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [studios, setStudios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userCountry, setUserCountry] = useState(null);
  
  // Use refs to prevent unnecessary re-renders
  const fetchingRef = useRef(false);
  const hasFetchedRef = useRef(false);
  const locationRef = useRef(null);
  
  // Master list of country variations - comprehensive mapping for all common cases
  const COUNTRY_VARIATIONS = {
    // North America
    "united-states": ["united states", "united states of america", "usa", "us", "u.s.a", "u.s.", "états-unis", "etats-unis", "estados unidos", "amerika", "америка", "сша"],
    "canada": ["canada", "can", "ca", "канада"],
    "mexico": ["mexico", "méxico", "mexique", "mex", "mx", "мексика"],
    
    // Europe
    "united-kingdom": ["united kingdom", "uk", "great britain", "britain", "england", "royaume-uni", "grande-bretagne", "gbr", "gb", "u.k.", "британия", "великобритания"],
    "france": ["france", "république française", "republique francaise", "fr", "fra", "франция"],
    "germany": ["germany", "deutschland", "allemagne", "deu", "de", "германия"],
    "spain": ["spain", "españa", "espagne", "esp", "es", "испания"],
    "italy": ["italy", "italia", "italie", "ita", "it", "италия"],
    
    // Africa
    "tunisia": ["tunisia", "tunisie", "تونس", "tun", "tn", "tunesien", "тунис"],
    "morocco": ["morocco", "maroc", "المغرب", "mar", "ma", "marokko", "марокко"],
    "algeria": ["algeria", "algérie", "algerie", "الجزائر", "dza", "dz", "algerien", "алжир"],
    "egypt": ["egypt", "égypte", "egypte", "مصر", "egy", "eg", "ägypten", "египет"],
    
    // Asia
    "japan": ["japan", "日本", "japon", "jpn", "jp", "япония"],
    "china": ["china", "中国", "中國", "chine", "chn", "cn", "китай"],
    "india": ["india", "भारत", "inde", "ind", "in", "индия"],
    "russia": ["russia", "россия", "russie", "rus", "ru", "روسيا"]
  };
  
  // Compile a flattened lookup map for efficient matching
  const getCountryMappings = () => {
    const lookupMap = {};
    
    Object.entries(COUNTRY_VARIATIONS).forEach(([normalizedKey, variations]) => {
      // Add the normalized key as its own entry
      lookupMap[normalizedKey.toLowerCase().trim()] = normalizedKey;
      
      // Add all variations mapping to the normalized key
      variations.forEach(variation => {
        lookupMap[variation.toLowerCase().trim()] = normalizedKey;
      });
    });
    
    return lookupMap;
  };
  
  // Create the mapping once
  const countryLookupMap = getCountryMappings();

  // Get user location once on mount
  useEffect(() => {
    const getUserLocation = async () => {
      // Always try to get a fresh location first, instead of relying on cache
      if (navigator.geolocation) {
        console.log('Requesting fresh user location...');
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const location = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            };
            
            console.log('Fresh location obtained:', location);
            locationRef.current = location;
            localStorage.setItem('userLocationCache', JSON.stringify(location));
            
            // Get country from coordinates using reverse geocoding
            try {
              const country = await getCountryFromCoordinates(location.latitude, location.longitude);
              if (country) {
                console.log('Fresh country detected:', country);
                setUserCountry(country);
                localStorage.setItem('userCountry', country);
                
                // Fetch studios with the fresh country
                if (!hasFetchedRef.current) {
                  await fetchStudios(true);
                }
                return;
              }
            } catch (err) {
              console.error('Error getting country from fresh coordinates:', err);
            }
            
            // If fresh country detection failed, fall back to IP-based detection
            try {
              const ipSuccess = await getCountryFromIP();
              if (!ipSuccess) {
                // If all else fails, try cached values
                await tryUsingCache();
              }
            } catch (err) {
              console.error('Error in IP detection:', err);
              await tryUsingCache();
            }
          },
          async (error) => {
            console.error('Error getting fresh location:', error);
            // Try IP-based detection first
            try {
              const ipSuccess = await getCountryFromIP();
              if (!ipSuccess) {
                // If IP detection fails, try using cached values
                await tryUsingCache();
              }
            } catch (err) {
              console.error('Error in IP detection after geolocation failure:', err);
              await tryUsingCache();
            }
          },
          { timeout: 5000, maximumAge: 0 } // Request fresh location with no cache
        );
      } else {
        // No geolocation support, try IP-based detection
        try {
          const ipSuccess = await getCountryFromIP();
          if (!ipSuccess) {
            // If IP detection fails, try using cached values
            await tryUsingCache();
          }
        } catch (err) {
          console.error('Error in IP detection with no geolocation:', err);
          await tryUsingCache();
        }
      }
    };
    
    // Try IP-based location
    const getCountryFromIP = async () => {
      try {
        console.log('Trying IP-based country detection...');
        const response = await fetch('https://ipapi.co/json/');
        if (response.ok) {
          const data = await response.json();
          if (data.country_name) {
            console.log('IP-based country detected:', data.country_name);
            setUserCountry(data.country_name);
            localStorage.setItem('userCountry', data.country_name);
            
            if (data.latitude && data.longitude) {
              const location = {
                latitude: data.latitude,
                longitude: data.longitude
              };
              locationRef.current = location;
              localStorage.setItem('userLocationCache', JSON.stringify(location));
            }
            
            // Fetch studios with the IP-based country
            if (!hasFetchedRef.current) {
              await fetchStudios(true);
            }
            return true;
          }
        }
        return false;
      } catch (error) {
        console.error('Error getting country from IP:', error);
        return false;
      }
    };
    
    // Try using cached values as last resort
    const tryUsingCache = async () => {
      try {
        console.log('Trying cached location values as last resort...');
        const cachedLocation = localStorage.getItem('userLocationCache');
        const cachedCountry = localStorage.getItem('userCountry');
        
        if (cachedLocation) {
          locationRef.current = JSON.parse(cachedLocation);
          console.log('Using cached location:', locationRef.current);
          
          if (cachedCountry) {
            console.log('Using cached country:', cachedCountry);
            setUserCountry(cachedCountry);
            
            // Fetch studios with cached country
            if (!hasFetchedRef.current) {
              await fetchStudios(true);
            }
            return true;
          }
        }
        
        // If we got here, we have no location or country information
        // Fetch studios without filtering
        console.log('No location/country information available, fetching all studios');
        if (!hasFetchedRef.current) {
          await fetchStudios(true);
        }
        return false;
      } catch (e) {
        console.error('Error reading cached location:', e);
        // Clear potentially corrupted cache
        localStorage.removeItem('userLocationCache');
        localStorage.removeItem('userCountry');
        
        // Fetch studios without filtering
        if (!hasFetchedRef.current) {
          await fetchStudios(true);
        }
        return false;
      }
    };
    
    getUserLocation();
  }, []);
  
  // Get country from coordinates using a reverse geocoding service
  const getCountryFromCoordinates = async (latitude, longitude) => {
    try {
      // Try both OpenStreetMap and Google APIs for better reliability
      let country = null;
      
      // 1. Try OpenStreetMap first (free)
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=3&accept-language=en`
        );
        
        if (response.ok) {
          const data = await response.json();
          if (data.address && data.address.country) {
            country = data.address.country;
            console.log('Detected country from OSM:', country);
          }
        }
      } catch (error) {
        console.error('Error with OpenStreetMap geocoding:', error);
      }
      
      // 2. Fallback to Google if available and OSM failed
      if (!country && typeof google !== 'undefined' && google.maps && google.maps.Geocoder) {
        try {
          const geocoder = new google.maps.Geocoder();
          const results = await new Promise((resolve) => {
            geocoder.geocode(
              { location: { lat: parseFloat(latitude), lng: parseFloat(longitude) } },
              (results, status) => {
                resolve(status === 'OK' ? results : null);
              }
            );
          });
          
          if (results && results.length > 0) {
            // Find country component
            for (const result of results) {
              for (const component of result.address_components) {
                if (component.types.includes('country')) {
                  country = component.long_name;
                  console.log('Detected country from Google:', country);
                  break;
                }
              }
              if (country) break;
            }
          }
        } catch (error) {
          console.error('Error with Google geocoding:', error);
        }
      }
      
      // 3. Last resort hardcoded fallback for common coordinates
      if (!country) {
        // Rough country detection based on latitude/longitude ranges
        // This is very approximate and only for major countries
        const lat = parseFloat(latitude);
        const lng = parseFloat(longitude);
        
        // North America (USA)
        if (lat > 24 && lat < 50 && lng > -125 && lng < -66) {
          country = 'United States';
        }
        // Canada
        else if (lat > 49 && lat < 70 && lng > -140 && lng < -50) {
          country = 'Canada';
        }
        // UK
        else if (lat > 49 && lat < 59 && lng > -11 && lng < 2) {
          country = 'United Kingdom';
        }
        // France
        else if (lat > 41 && lat < 51 && lng > -5 && lng < 10) {
          country = 'France';
        }
        // Tunisia
        else if (lat > 30 && lat < 38 && lng > 7 && lng < 12) {
          country = 'Tunisia';
        }
        
        if (country) {
          console.log('Fallback country detection:', country);
        }
      }
      
      return country;
    } catch (error) {
      console.error('Error in all geocoding methods:', error);
      return null;
    }
  };
  
  // Function to match countries - handles all variations and formats
  const matchCountries = (country1, country2) => {
    if (!country1 || !country2) return false;
    
    // Normalize both countries
    const normalized1 = country1.toLowerCase().trim();
    const normalized2 = country2.toLowerCase().trim();
    
    console.log(`  Comparing '${normalized1}' with '${normalized2}'`);
    
    // 1. Direct match (already normalized)
    if (normalized1 === normalized2) {
      console.log(`  Direct match!`);
      return true;
    }
    
    // 2. Look up normalized keys
    const key1 = countryLookupMap[normalized1];
    const key2 = countryLookupMap[normalized2];
    
    console.log(`  Normalized keys: '${key1}' and '${key2}'`);
    
    // Special case for Tunisia/TN
    if ((normalized1 === 'tunisia' || normalized1 === 'tn' || normalized1 === 'tun') && 
        (normalized2 === 'tunisia' || normalized2 === 'tn' || normalized2 === 'tun')) {
      console.log(`  Special Tunisia match!`);
      return true;
    }
    
    // Special case for US/USA
    if ((normalized1 === 'us' || normalized1 === 'usa' || normalized1 === 'united states') && 
        (normalized2 === 'us' || normalized2 === 'usa' || normalized2 === 'united states')) {
      console.log(`  Special US match!`);
      return true;
    }
    
    // Special case for CA/Canada
    if ((normalized1 === 'ca' || normalized1 === 'canada') && 
        (normalized2 === 'ca' || normalized2 === 'canada')) {
      console.log(`  Special Canada match!`);
      return true;
    }
    
    // 3. If both have normalized keys and they match, it's a match
    if (key1 && key2 && key1 === key2) {
      console.log(`  Keys match!`);
      return true;
    }
    
    // 4. Check if normalized versions are the same even if not in mapping
    const cleanKey1 = normalized1.replace(/[^a-z0-9]/g, '');
    const cleanKey2 = normalized2.replace(/[^a-z0-9]/g, '');
    if (cleanKey1 && cleanKey2 && cleanKey1 === cleanKey2) {
      console.log(`  Clean keys match!`);
      return true;
    }
    
    // 5. Check if one contains the other (careful with this one - can give false positives)
    // Only use for longer country names (>3 chars) to avoid "US" matching "Russia"
    if (normalized1.length > 3 && normalized2.length > 3) {
      if (normalized1.includes(normalized2) || normalized2.includes(normalized1)) {
        console.log(`  Substring match!`);
        return true;
      }
    }
    
    console.log(`  No match`);
    return false;
  };
  
  // Calculate distance between coordinates
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    
    try {
      // Convert string coordinates to numbers if needed
      const latitude1 = typeof lat1 === 'string' ? parseFloat(lat1) : lat1;
      const longitude1 = typeof lon1 === 'string' ? parseFloat(lon1) : lon1;
      const latitude2 = typeof lat2 === 'string' ? parseFloat(lat2) : lat2;
      const longitude2 = typeof lon2 === 'string' ? parseFloat(lon2) : lon2;
      
      // Check for invalid numbers
      if (isNaN(latitude1) || isNaN(longitude1) || isNaN(latitude2) || isNaN(longitude2)) {
        return null;
      }
      
      const R = 6371; // Radius of the earth in km
      const dLat = (latitude2 - latitude1) * Math.PI / 180;
      const dLon = (longitude2 - longitude1) * Math.PI / 180;
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(latitude1 * Math.PI / 180) * Math.cos(latitude2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distance = R * c; // Distance in km
      
      // One more check to ensure we have a valid number
      return (isFinite(distance) && !isNaN(distance)) ? distance : null;
    } catch (err) {
      console.error('Error calculating distance:', err);
      return null;
    }
  };
  
  // Toggle dropdown
  const toggleDropdown = () => {
    // If opening and we haven't fetched yet, fetch studios
    if (!isDropdownOpen && !hasFetchedRef.current) {
      fetchStudios();
    }
    setIsDropdownOpen(prev => !prev);
  };
  
  // Studio selection handler
  const handleStudioSelect = (studio) => {
    if (studio && studio._id) {
      console.log('Studio selected:', studio.name, 'Country:', studio.country);
      
      // If the user's country isn't set yet, try to set it from the selected studio
      if (!userCountry && studio.country) {
        console.log('Setting user country from selected studio:', studio.country);
        setUserCountry(studio.country);
        localStorage.setItem('userCountry', studio.country);
      }
      
      onStudioSelect(studio);
      
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
  
  // Fetch studios
  const fetchStudios = async (autoSelect = false) => {
    // Prevent concurrent fetches
    if (fetchingRef.current) return;
    
    try {
      fetchingRef.current = true;
      setLoading(true);
      setError(null);
      
      const response = await fetch('https://freezepix-database-server-c95d4dd2046d.herokuapp.com/api/studios');
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Process the data
      const studiosArray = Array.isArray(data) ? data : [data];
      
      // Debug logging to see studio data
      console.log('Studio data countries:', studiosArray.map(s => s?.country || 'unknown'));
      console.log('User country:', userCountry);
      
      const activeStudios = studiosArray.filter(studio => studio && studio.isActive);
      
      // Add distance if location is available
      let studiosWithDistance = activeStudios;
      
      if (locationRef.current) {
        studiosWithDistance = activeStudios.map(studio => {
          if (!studio || !studio.coordinates) {
            return { ...studio, distance: null };
          }
          
          const distance = calculateDistance(
            locationRef.current.latitude,
            locationRef.current.longitude,
            studio.coordinates?.latitude || null,
            studio.coordinates?.longitude || null
          );
          
          // Ensure distance is a valid number before adding it
          return { 
            ...studio, 
            distance: (distance !== null && !isNaN(distance) && isFinite(distance)) ? distance : null 
          };
        });
        
        // Filter by user's country if available
        if (userCountry) {
          const beforeFilter = studiosWithDistance.length;
          
          // Apply the country filtering with robust matching
          const filteredStudios = studiosWithDistance.filter(studio => {
            if (!studio || !studio.country) return false;
            
            // Debug logging to trace the filtering
            console.log(`Checking ${studio.name} (${studio.country}) against user country ${userCountry}`);
            
            // Use our robust matching function
            const matches = matchCountries(userCountry, studio.country);
            console.log(`  Match result: ${matches ? 'MATCHED' : 'NOT MATCHED'}`);
            return matches;
          });
          
          // Only apply filtering if we found at least one match
          // This prevents showing no studios if country detection fails
          if (filteredStudios.length > 0) {
            studiosWithDistance = filteredStudios;
            console.log(`Country filtering: ${beforeFilter} studios → ${studiosWithDistance.length} studios in ${userCountry}`);
          } else {
            console.log(`No studios matched country ${userCountry}, showing all studios`);
          }
        }
        
        // Sort by distance
        studiosWithDistance.sort((a, b) => {
          if (a.distance === null && b.distance === null) return 0;
          if (a.distance === null) return 1;
          if (b.distance === null) return -1;
          return a.distance - b.distance;
        });
      }
      
      // Set studios
      setStudios(studiosWithDistance);
      hasFetchedRef.current = true;
      
      // Auto-select nearest studio if requested
      if (autoSelect && studiosWithDistance.length > 0 && !selectedStudio) {
        const nearestStudio = studiosWithDistance[0];
        if (nearestStudio && nearestStudio._id) {
          console.log('Auto-selecting studio:', nearestStudio.name, 'Country:', nearestStudio.country);
          handleStudioSelect(nearestStudio);
        }
      }
    } catch (err) {
      console.error('Error fetching studios:', err);
      setError('Failed to load studios. Please try again.');
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  };
  
  // Refresh button handler
  const handleRefresh = (e) => {
    e.stopPropagation();
    hasFetchedRef.current = false;
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
                          -- km
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