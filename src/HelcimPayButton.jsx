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
  const secretTokenRef = useRef(null);

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
          // Parse the event message if it's a string
          const parsedEventMessage = typeof event.data.eventMessage === 'string' 
            ? JSON.parse(event.data.eventMessage) 
            : event.data.eventMessage;

          console.log('Parsed event message:', parsedEventMessage);

          if (parsedEventMessage.data) {
            const paymentData = parsedEventMessage.data.data;
            console.log('Payment data:', paymentData);

            if (paymentData.status === 'APPROVED') {
              // Format the data for hash validation
              const rawDataResponse = {
                transactionId: paymentData.transactionId,
                amount: paymentData.amount,
                currency: paymentData.currency,
                status: paymentData.status,
                cardNumber: paymentData.cardNumber
              };

              // Log secret token before hash calculation
              console.log('Using secret token for hash:', secretTokenRef.current);

              // Calculate hash using the stored secret token
              const dataToHash = { ...rawDataResponse };
              const cleanedData = JSON.stringify(dataToHash);
              const calculatedHash = CryptoJS.SHA256(cleanedData + secretTokenRef.current)
                .toString(CryptoJS.enc.Hex);

              console.log('Generated hash with secret token:', calculatedHash);
              console.log('Received hash:', parsedEventMessage.data.hash);

              const successData = {
                data: rawDataResponse,
                hash: parsedEventMessage.data.hash,
                secretToken: secretTokenRef.current  // Include the secret token
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
      const response = await initializeHelcimPayCheckout({
        selectedCountry,
        total
      });
      
      console.log('Helcim initialization response:', response);
      
      setCheckoutToken(response.checkoutToken);
      secretTokenRef.current = response.secretToken;
      console.log('Stored secret token:', response.secretToken);

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