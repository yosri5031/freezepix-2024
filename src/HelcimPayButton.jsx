import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { initializeHelcimPayCheckout } from './helcimService';
import CryptoJS from 'crypto-js'; // Add this import for proper hashing


const HelcimPayButton = ({ 
  onPaymentSuccess,
  isProcessing,
  disabled,
  selectedCountry, 
  calculateTotals,
  total, 
  setOrderSuccess,
  setError,
  setIsProcessingOrder
}) => {
  const [checkoutToken, setCheckoutToken] = useState(null);
  const [secretToken, setSecretToken] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [loading, setLoading] = useState(false); // Add loading state

  // Load Helcim Pay.js script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://secure.helcim.app/helcim-pay/services/start.js';
    script.async = true;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  // Handle Payment Initialization
  const handlePayment = async () => {
    setLoading(true); // Set loading state to true
    try {
      const response = await initializeHelcimPayCheckout({
        selectedCountry,
        total
      });
      
      setCheckoutToken(response.checkoutToken);
      setSecretToken(response.secretToken);

      if (window.appendHelcimPayIframe && response.checkoutToken) {
        window.appendHelcimPayIframe(response.checkoutToken, true);
      } else {
        throw new Error('Helcim Pay.js not loaded or checkout token missing');
      }
    } catch (error) {
      console.error('Payment Initialization Error:', error);
      setPaymentStatus({
        success: false,
        message: 'Payment Initialization Failed',
        details: error.message
      });
    } finally {
      setLoading(false); // Set loading state back to false after payment initialization
    }
  };

  return (
    <div className="helcim-pay-container">
      <button 
        onClick={handlePayment}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        disabled={disabled || isProcessing || loading} // Disable button when loading
      >
        {loading 
          ? 'Loading...' 
          : isProcessing 
            ? 'Processing...' 
            : `Helcim Pay ( ${selectedCountry === 'TN' ? 'TND' : selectedCountry === 'CA' ? 'CAD' : 'USD'} ${total.toFixed(2)} )`
        }
      </button>

      {paymentStatus && (
        <div 
          className={`
            mt-4 p-3 rounded 
            ${paymentStatus.success 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
            }
          `}
        >
          <p>{paymentStatus.message}</p>
          {paymentStatus.details && (
            <p className="text-sm mt-1">
              {typeof paymentStatus.details === 'object'
                ? JSON.stringify(paymentStatus.details)
                : paymentStatus.details}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export { HelcimPayButton };