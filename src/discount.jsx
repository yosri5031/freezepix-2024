// Frontend Context Provider
import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const DiscountCodesContext = createContext([]);

export const fetchDiscountCodes = async () => {
  try {
    const response = await axios.get('https://freezepix-database-server-c95d4dd2046d.herokuapp.com/api/discount-codes');
    
    // Handle different response scenarios
    if (!response.data) return [];
    
    // If response.data is a string, try to parse it
    if (typeof response.data === 'string') {
      try {
        const parsed = JSON.parse(response.data);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        console.error('Error parsing discount codes:', e);
        return [];
      }
    }
    
    // If response.data is already an object/array
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('Error fetching discount codes:', error);
    return [];
  }
};

export const DiscountCodesProvider = ({ children }) => {
  const [discountCodes, setDiscountCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const codes = await fetchDiscountCodes();
        setDiscountCodes(codes);
        setError(null);
      } catch (err) {
        setError(err.message);
        setDiscountCodes([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  return (
    <DiscountCodesContext.Provider 
      value={{ discountCodes, loading, error }}
    >
      {children}
    </DiscountCodesContext.Provider>
  );
};

// Custom hook with loading and error states
export const useDiscountCodes = () => {
  const context = useContext(DiscountCodesContext);
  if (context === undefined) {
    throw new Error('useDiscountCodes must be used within a DiscountCodesProvider');
  }
  return context;
};

export default fetchDiscountCodes;