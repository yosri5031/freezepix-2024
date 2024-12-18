import React, { useState, useEffect, useRef } from 'react';
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
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const secretTokenRef = useRef(null);
  const scriptRef = useRef(null);

  // Load Helcim Pay.js script
  useEffect(() => {
    const loadScript = () => {
      scriptRef.current = document.createElement('script');
      scriptRef.current.src = 'https://secure.helcim.app/helcim-pay/services/start.js';
      scriptRef.current.async = true;
      
      scriptRef.current.onload = () => {
        console.log('Helcim Pay.js script loaded successfully');
        setScriptLoaded(true);
      };
      
      scriptRef.current.onerror = () => {
        console.error('Failed to load Helcim Pay.js script');
        setError('Failed to load payment system');
      };

      document.head.appendChild(scriptRef.current);
    };

    // Check if script is already loaded
    if (!document.querySelector('script[src="https://secure.helcim.app/helcim-pay/services/start.js"]')) {
      loadScript();
    } else {
      setScriptLoaded(true);
    }

    return () => {
      if (scriptRef.current) {
        document.head.removeChild(scriptRef.current);
      }
    };
  }, [setError]);

  useEffect(() => {
    const handleHelcimResponse = (event) => {
      console.log('Received message:', event.data);

      if (event.data.eventStatus === 'ABORTED') {
        setPaymentStatus({
          success: false,
          message: 'Payment Aborted',
          details: event.data.eventMessage
        });
        setError('Payment was aborted: ' + event.data.eventMessage);
        return;
      }

      if (event.data && event.data.eventStatus === 'SUCCESS') {
        try {
          const parsedEventMessage = typeof event.data.eventMessage === 'string' 
            ? JSON.parse(event.data.eventMessage) 
            : event.data.eventMessage;

          console.log('Parsed event message:', parsedEventMessage);

          if (parsedEventMessage.data) {
            const paymentData = parsedEventMessage.data.data;
            console.log('Payment data:', paymentData);

            if (paymentData.status === 'APPROVED') {
              const rawDataResponse = {
                transactionId: paymentData.transactionId,
                amount: paymentData.amount,
                currency: paymentData.currency,
                status: paymentData.status,
                cardNumber: paymentData.cardNumber
              };

              console.log('Using secret token for hash:', secretTokenRef.current);

              const dataToHash = { ...rawDataResponse };
              const cleanedData = JSON.stringify(dataToHash);
              const calculatedHash = CryptoJS.SHA256(cleanedData + secretTokenRef.current)
                .toString(CryptoJS.enc.Hex);

              console.log('Generated hash with secret token:', calculatedHash);
              console.log('Received hash:', parsedEventMessage.data.hash);

              const successData = {
                data: rawDataResponse,
                hash: parsedEventMessage.data.hash,
                secretToken: secretTokenRef.current
              };

              console.log('Calling onPaymentSuccess with:', successData);
              
              setPaymentStatus({
                success: true,
                message: 'Payment Successful',
                details: paymentData
              });

              onPaymentSuccess(successData);
            }
          }
        } catch (error) {
          console.error('Error parsing Helcim response:', error);
          setError('Error processing payment response');
        }
      }
    };

    window.addEventListener('message', handleHelcimResponse);
    return () => window.removeEventListener('message', handleHelcimResponse);
  }, [onPaymentSuccess, setError]);

  const handlePayment = async () => {
    setLoading(true);
    try {
      if (!scriptLoaded) {
        throw new Error('Payment system is still loading. Please try again in a moment.');
      }

      if (!window.appendHelcimPayIframe) {
        throw new Error('Payment system not properly initialized. Please refresh the page and try again.');
      }

      const response = await initializeHelcimPayCheckout({
        selectedCountry,
        total
      });
      
      console.log('Helcim initialization response:', response);
      
      if (!response.checkoutToken) {
        throw new Error('Failed to get valid checkout token');
      }

      setCheckoutToken(response.checkoutToken);
      secretTokenRef.current = response.secretToken;
      console.log('Stored secret token:', response.secretToken);

      // Add a small delay to ensure the script is fully initialized
      setTimeout(() => {
        if (window.appendHelcimPayIframe) {
          window.appendHelcimPayIframe(response.checkoutToken, true);
        } else {
          throw new Error('Payment system not ready. Please try again.');
        }
      }, 500);

    } catch (error) {
      console.error('Payment Initialization Error:', error);
      setPaymentStatus({
        success: false,
        message: 'Payment Initialization Failed',
        details: error.message
      });
      setError(error.message);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }
  };

  return (
    <div className="helcim-pay-container">
      <button 
        onClick={handlePayment}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        disabled={disabled || isProcessing || loading || !scriptLoaded}
      >
        {loading 
          ? 'Loading...' 
          : isProcessing 
            ? 'Processing...' 
            : !scriptLoaded
              ? 'Loading Payment System...'
              : 'Pay Order'
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