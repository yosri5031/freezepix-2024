import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { initializeHelcimPayCheckout } from './helcimService';
import CryptoJS from 'crypto-js';

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
  const [loading, setLoading] = useState(false);

  // Handle Helcim payment response
  useEffect(() => {
    const handleHelcimResponse = (event) => {
      console.log('Received message:', event.data); // Debug log

      // Check for different possible response formats
      const helcimResponse = event.data.helcimPay || event.data;
      
      if (helcimResponse) {
        console.log('Helcim response:', helcimResponse); // Debug log

        if (helcimResponse.status === 'success' || helcimResponse.success) {
          console.log('Payment successful, processing response...'); // Debug log
          
          const responseData = helcimResponse.data || helcimResponse;
          const dataString = JSON.stringify(responseData);
          const hash = CryptoJS.HmacSHA256(dataString, secretToken).toString();

          console.log('Prepared payment data:', { data: responseData, hash }); // Debug log

          // Update payment status
          setPaymentStatus({
            success: true,
            message: 'Payment Successful',
            details: responseData
          });

          // Call onPaymentSuccess
          onPaymentSuccess({
            data: responseData,
            hash: hash
          });

        } else if (helcimResponse.status === 'error' || helcimResponse.error) {
          console.log('Payment failed:', helcimResponse); // Debug log
          const errorMessage = helcimResponse.message || helcimResponse.error || 'Payment failed';
          
          setPaymentStatus({
            success: false,
            message: 'Payment Failed',
            details: errorMessage
          });
          
          setError('Payment failed: ' + errorMessage);
        }
      }
    };

    window.addEventListener('message', handleHelcimResponse);

    // Debug log for initialization
    console.log('Event listener initialized with secretToken:', secretToken);

    return () => {
      window.removeEventListener('message', handleHelcimResponse);
    };
  }, [onPaymentSuccess, secretToken, setError]);

  // Load Helcim Pay.js script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://secure.helcim.app/helcim-pay/services/start.js';
    script.async = true;
    
    script.onload = () => {
      console.log('Helcim Pay.js script loaded'); // Debug log
    };
    
    script.onerror = (error) => {
      console.error('Error loading Helcim Pay.js:', error); // Debug log
    };

    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  // Handle Payment Initialization
  const handlePayment = async () => {
    setLoading(true);
    try {
      console.log('Initializing payment with:', { selectedCountry, total }); // Debug log
      
      const response = await initializeHelcimPayCheckout({
        selectedCountry,
        total
      });
      
      console.log('Initialization response:', response); // Debug log

      setCheckoutToken(response.checkoutToken);
      setSecretToken(response.secretToken);

      if (window.appendHelcimPayIframe && response.checkoutToken) {
        console.log('Appending Helcim iframe with token:', response.checkoutToken); // Debug log
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
      setTimeout(() => {
        setLoading(false);
      }, 5000);
    }
  };

  return (
    <div className="helcim-pay-container">
      <button 
        onClick={handlePayment}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        disabled={disabled || isProcessing || loading}
      >
        {loading 
          ? 'Loading...' 
          : isProcessing 
            ? 'Processing...' 
            : ` Pay Order `
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