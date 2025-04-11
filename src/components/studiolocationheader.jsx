import React, { useState, useEffect, useRef } from 'react';
import { MapPin, ChevronDown, ChevronUp } from 'lucide-react';

// Enhanced StudioLocationHeader with wider dropdown and improved text wrapping
const StudioLocationHeader = ({ selectedStudio, onStudioSelect }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [studios, setStudios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Use refs to prevent unnecessary re-renders
  const fetchingRef = useRef(false);
  const hasFetchedRef = useRef(false);
  const locationRef = useRef(null);
  
  // Get user location once on mount
  useEffect(() => {
    const getUserLocation = () => {
      try {
        // Try to get cached location first
        const cachedLocation = localStorage.getItem('userLocationCache');
        
        if (cachedLocation) {
          locationRef.current = JSON.parse(cachedLocation);
          
          // If we have a cached location but no selected studio, fetch and select nearest
          if (!selectedStudio && !hasFetchedRef.current) {
            fetchStudios(true);
          }
          return;
        }
      } catch (e) {
        console.error('Error reading cached location:', e);
      }
      
      // Get fresh location if no cache
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const location = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            };
            
            locationRef.current = location;
            localStorage.setItem('userLocationCache', JSON.stringify(location));
            
            // If no studio is selected yet, fetch and select the nearest
            if (!selectedStudio && !hasFetchedRef.current) {
              fetchStudios(true);
            }
          },
          (error) => {
            console.error('Error getting location:', error);
          },
          { timeout: 10000 }
        );
      }
    };
    
    getUserLocation();
  }, [selectedStudio]);
  
  // Calculate distance between coordinates
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    
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
          
          return { ...studio, distance };
        });
        
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
  // Calculate dropdown width (1.5x the base width)
  const dropdownWidth = baseWidth * 1.5;

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
      
      {/* Dropdown - Now 1.5x wider than the parent */}
      {isDropdownOpen && (
        <div 
          className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto"
          style={{ width: `${dropdownWidth}px` }}
        >
          <div className="p-2">
            <div className="flex justify-between items-center px-3 py-2 border-b">
              <h3 className="font-medium text-sm">Select Pickup Location</h3>
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
                <p className="px-3 text-sm text-gray-500">No studios available</p>
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
                      {studio.distance !== null && (
                        <span className="text-xs text-gray-500 whitespace-nowrap flex-shrink-0">
                          {studio.distance.toFixed(1)} km
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