import React, { useState, useEffect } from 'react';
import axios from 'axios';

const fetchDiscountCodes = async () => {
  try {
    const response = await axios.get('https://freezepix-database-server-c95d4dd2046d.herokuapp.com/api/discount-codes');
    return response.data;
  } catch (error) {
    console.error('Error fetching discount codes:', error);
    return [];
  }
};

const DiscountCodesProvider = ({ children }) => {
  const [discountCodes, setDiscountCodes] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const codes = await fetchDiscountCodes();
      setDiscountCodes(codes);
    };

    fetchData();
  }, []);

  return <>{children(discountCodes)}</>;
};

export default DiscountCodesProvider;