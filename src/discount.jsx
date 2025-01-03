// DiscountCodesContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const DiscountCodesContext = createContext([]);

export const fetchDiscountCodes = async () => {
  try {
    const response = await axios.get('https://freezepix-database-server-c95d4dd2046d.herokuapp.com/api/discount-codes');
    // Ensure we're working with an object, not a string
    const data = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching discount codes:', error);
    return [];
  }
};

export const DiscountCodesProvider = ({ children }) => {
  const [discountCodes, setDiscountCodes] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const codes = await fetchDiscountCodes();
        setDiscountCodes(codes);
      } catch (error) {
        console.error('Error fetching discount codes:', error);
      }
    };
    
    fetchData();
  }, []);

  // Return the context provider with a value prop
  return (
    <DiscountCodesContext.Provider value={discountCodes}>
      {children}
    </DiscountCodesContext.Provider>
  );
};

// Custom hook to use discount codes
export const useDiscountCodes = () => {
  const context = useContext(DiscountCodesContext);
  if (context === undefined) {
    throw new Error('useDiscountCodes must be used within a DiscountCodesProvider');
  }
  return context;
};

// Example usage in your component:
export const DiscountCodesList = () => {
  const discountCodes = useDiscountCodes();

  return (
    <div>
      {discountCodes.map((code) => (
        <div key={code.code}>
          <p>{code.code}</p>
          <p>{code.value}</p>
        </div>
      ))}
    </div>
  );
};

export default fetchDiscountCodes;