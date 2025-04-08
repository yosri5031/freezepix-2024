import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MapPin, ChevronDown, ChevronUp } from 'lucide-react';
import axios from 'axios';

// Studio Header Component with enhanced refresh and return handling
const StudioLocationHeader = ({ 
  selectedStudio, 
  onStudioSelect, 
  selectedCountry 
}) => {
  const [studios, setStudios] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const lastLocationUpdateRef = useRef(Date.now());
  const locationExpiryTime = 30 * 60 * 1000; // 30 minutes in milliseconds
  
  // Calculate distance between coordinates
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) {
      return Number.MAX_SAFE_INTEGER; // Return max distance if coordinates missing
    }
    
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in km
  };

  // Get user's location with caching
  const getUserLocation = useCallback(() => {
    // Try to load cached location first
    const cachedLocation = localStorage.getItem('userLocationCache');
    const cachedTimestamp = localStorage.getItem('userLocationTimestamp');
    
    if (cachedLocation && cachedTimestamp) {
      const timestamp = parseInt(cachedTimestamp, 10);
      const now = Date.now();
      
      // If cache is fresh (less than 30 minutes old)
      if (now - timestamp < locationExpiryTime) {
        try {
          const parsedLocation = JSON.parse(cachedLocation);
          setUserLocation(parsedLocation);
          lastLocationUpdateRef.current = timestamp;
          return; // Use cached location and don't request new one
        } catch (e) {
          console.error('Error parsing cached location:', e);
          // Continue to get fresh location if parsing fails
        }
      }
    }
    
    // Get fresh location if no cache or cache expired
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          
          // Update state
          setUserLocation(location);
          
          // Update cache
          localStorage.setItem('userLocationCache', JSON.stringify(location));
          localStorage.setItem('userLocationTimestamp', Date.now().toString());
          lastLocationUpdateRef.current = Date.now();
        },
        (error) => {
          console.error('Error getting location:', error);
          // Still use cached location even if expired, if we have it
          if (cachedLocation) {
            try {
              const parsedLocation = JSON.parse(cachedLocation);
              setUserLocation(parsedLocation);
            } catch (e) {
              console.error('Error parsing cached location as fallback:', e);
            }
          }
        },
        { maximumAge: locationExpiryTime, timeout: 10000 }
      );
    }
  }, []);

  // Fetch studios and pre-select closest one
  const fetchAndSelectStudio = useCallback(async () => {
    try {
      setLoading(true);
      
      // Check if we have a studio from URL (don't override)
      const isPreselectedFromUrl = localStorage.getItem('isPreselectedFromUrl') === 'true';
      if (isPreselectedFromUrl && selectedStudio) {
        setLoading(false);
        return;
      }
      
      const response = await axios.get('https://freezepix-database-server-c95d4dd2046d.herokuapp.com/api/studios');
      let studiosData = Array.isArray(response.data) ? response.data : [response.data];
      
      // Filter to active studios only
      studiosData = studiosData.filter(studio => studio.isActive);

      // Add distance if user location is available
      if (userLocation) {
        studiosData = studiosData.map(studio => ({
          ...studio,
          distance: calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            studio.coordinates?.latitude || 0,
            studio.coordinates?.longitude || 0
          )
        }));

        // Sort by distance
        studiosData.sort((a, b) => a.distance - b.distance);
      }
      
      setStudios(studiosData);
      
      // Auto-select closest studio if none is selected
      if (!selectedStudio && studiosData.length > 0) {
        onStudioSelect(studiosData[0]);
        // Store in localStorage
        localStorage.setItem('selectedStudio', JSON.stringify(studiosData[0]));
        localStorage.setItem('isPreselectedFromUrl', 'false');
        console.log('Auto-selected closest studio:', studiosData[0].name);
      }
    } catch (error) {
      console.error('Error fetching studios:', error);
    } finally {
      setLoading(false);
    }
  }, [userLocation, selectedStudio, onStudioSelect]);

  // Initial load - get location and fetch studios
  useEffect(() => {
    getUserLocation();
  }, [getUserLocation]);

  // When user location changes, fetch studios
  useEffect(() => {
    if (userLocation) {
      fetchAndSelectStudio();
    }
  }, [userLocation, fetchAndSelectStudio]);

  // Handle visibility change (user returns to app)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const now = Date.now();
        // If location data is older than expiry time, refresh it
        if (now - lastLocationUpdateRef.current > locationExpiryTime) {
          console.log('App returned to foreground, updating location data');
          getUserLocation();
          // fetchAndSelectStudio will be triggered by userLocation change
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [getUserLocation]);
  
  // Toggle dropdown
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };
  
  // Handle studio selection
  const handleStudioSelect = (studio) => {
    onStudioSelect(studio);
    localStorage.setItem('selectedStudio', JSON.stringify(studio));
    localStorage.setItem('isPreselectedFromUrl', 'false');
    setIsDropdownOpen(false);
  };

  return (
    <div className="relative" style={{ maxWidth: "250px" }}>
      {/* Main header showing selected studio - Sobeys style */}
      <div 
        className="flex items-center justify-between bg-gray-100 px-3 py-2 rounded-full cursor-pointer border border-gray-200 hover:border-green-400 transition-colors"
        onClick={toggleDropdown}
      >
        <div className="flex items-center">
          <MapPin className="text-green-500 mr-2 flex-shrink-0" size={18} />
          {loading ? (
            <div className="h-4 w-24 bg-gray-200 animate-pulse rounded"></div>
          ) : selectedStudio ? (
            <span className="font-medium text-sm text-gray-700">{selectedStudio.name}</span>
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
            <h3 className="font-medium px-3 py-2 border-b text-sm">Select Pickup Location</h3>
            {studios.map(studio => (
              <div
                key={studio._id}
                className={`flex items-center justify-between px-3 py-2 hover:bg-gray-100 cursor-pointer rounded ${
                  selectedStudio?._id === studio._id ? 'bg-green-50 border-l-4 border-green-500' : ''
                }`}
                onClick={() => handleStudioSelect(studio)}
              >
                <div className="flex flex-col overflow-hidden">
                  <span className="font-medium text-sm truncate">{studio.name}</span>
                  <span className="text-xs text-gray-600 truncate">{studio.address}</span>
                </div>
                {studio.distance !== undefined && (
                  <span className="text-xs text-gray-500 whitespace-nowrap">{studio.distance.toFixed(1)} km</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudioLocationHeader;