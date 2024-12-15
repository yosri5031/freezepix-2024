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
  }) => {
    const [checkoutToken, setCheckoutToken] = useState(null);
    const [secretToken, setSecretToken] = useState(null);
    const [paymentStatus, setPaymentStatus] = useState(null);
  
    // Helcim Pay API configuration
    const API_TOKEN = process.env.REACT_APP_HELCIM_API_TOKEN || 'aM2T3NEpnksEOKIC#ajd%!-IE.TRXEqUIi_Ct8P.K18z1L%aV3zTl*R4PHoDco%y';
    const HELCIM_API_URL = 'https://api.helcim.com/v2/helcim-pay/initialize';
  
  
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
  
    // Listen for payment response events
    useEffect(() => {
      const handlePaymentResponse = (event) => {
        // Validate the event is from Helcim Pay.js
        if (event.data.eventName === `helcim-pay-js-${checkoutToken}`) {
          if (event.data.eventStatus === 'ABORTED') {
            setPaymentStatus({
              success: false,
              message: 'Transaction Aborted',
              details: event.data.eventMessage
            });
          }
  
          if (event.data.eventStatus === 'SUCCESS') {
            // Validate the transaction response
            console.log(event.data.eventMessage);
            validateTransaction(event.data.eventMessage);
          }
        }
      };
  
      window.addEventListener('message', handlePaymentResponse);
  
      return () => {
        window.removeEventListener('message', handlePaymentResponse);
      };
    }, [checkoutToken]);
  
    // Initialize Helcim Pay Checkout
    
  
    // Validate Transaction
    const validateTransaction = async (eventMessage) => {
      try {
        // Updated hash generation function
        const generateHash = (data, token) => {
          const payload = JSON.stringify(data);
          // Use HMAC-SHA256 for hashing
          return CryptoJS.HmacSHA256(payload, token).toString();
        };
  
        // Get the transaction details from the event message
        const transactionData = {
          amount: total,
          currency: selectedCountry === 'TN' ? 'TND' : selectedCountry === 'CA' ? 'CAD' : 'USD',
          transactionId: eventMessage.data.transactionId,
          timestamp: eventMessage.data.timestamp
        };
  
        // Generate hash using the secret token
        const localHash = generateHash(transactionData, secretToken);
  
        // Verify the transaction with your backend
        const verificationResponse = await axios.post('https://freezepix-database-server-c95d4dd2046d.herokuapp.com/api/verify-helcim-payment', {
          transactionData,
          hash: eventMessage.hash,
          localHash
        });
  
        if (verificationResponse.data.verified) {
          setPaymentStatus({
            success: true,
            message: 'Payment Successful',
            details: eventMessage.data
          });
  
          if (onPaymentSuccess) {
            onPaymentSuccess(eventMessage.data);
          }
  
          removeHelcimPayIframe();
        } else {
          throw new Error('Transaction verification failed');
        }
      } catch (error) {
        setPaymentStatus({
          success: false,
          message: 'Transaction Validation Error',
          details: error.message
        });
      }
    };
  
  
    // Remove Helcim Pay iframe
    const removeHelcimPayIframe = () => {
      const frame = document.getElementById('helcimPayIframe');
      if (frame instanceof HTMLIFrameElement) {
        frame.remove();
      }
    };
  
    // Handle Payment Initialization
    const handlePayment = async () => {
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
      }
    };
  
    return (
      <div className="helcim-pay-container">
        <button 
          onClick={handlePayment}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          disabled={disabled || isProcessing}
        >
          {isProcessing 
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