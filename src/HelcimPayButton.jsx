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
  const [localProcessing, setLocalProcessing] = useState(false);
  const secretTokenRef = useRef(null);
  const scriptRef = useRef(null);
  const iframeCheckInterval = useRef(null);

  const resetPaymentStates = () => {
    setLocalProcessing(false);
    setIsProcessingOrder(false);
    setError(null);
    if (window.removeHelcimPayIframe) {
      try {
        window.removeHelcimPayIframe();
      } catch (error) {
        console.error('Error removing Helcim iframe:', error);
      }
    }
  };

  // Monitor Helcim iframe visibility
  const startIframeCheck = () => {
    if (iframeCheckInterval.current) {
      clearInterval(iframeCheckInterval.current);
    }

    iframeCheckInterval.current = setInterval(() => {
      const helcimIframe = document.querySelector('iframe[id^="helcim-pay-iframe"]');
      if (!helcimIframe && localProcessing) {
        console.log('Helcim iframe not found, resetting payment state');
        resetPaymentStates();
        clearInterval(iframeCheckInterval.current);
      }
    }, 500);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (iframeCheckInterval.current) {
        clearInterval(iframeCheckInterval.current);
      }
      resetPaymentStates();
    };
  }, []);

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
    const handleHelcimResponse = async (event) => {
      // Only process messages from Helcim
      if (!event.data || !event.data.eventStatus) {
        return;
      }

      console.log('Received Helcim response:', event.data);

      if (event.data.eventStatus === 'ABORTED') {
        console.log('Payment aborted by user');
        setPaymentStatus({
          success: false,
          message: 'Payment Cancelled',
          details: event.data.eventMessage
        });
        resetPaymentStates();
        return;
      }

      if (event.data.eventStatus === 'SUCCESS') {
        try {
          let parsedEventMessage;
          try {
            parsedEventMessage = typeof event.data.eventMessage === 'string' 
              ? JSON.parse(event.data.eventMessage) 
              : event.data.eventMessage;
      
            if (typeof parsedEventMessage.data === 'string') {
              parsedEventMessage.data = JSON.parse(parsedEventMessage.data);
            }
          } catch (parseError) {
            console.error('Error parsing event message:', parseError);
            throw new Error('Invalid payment response format');
          }
      
          const paymentData = parsedEventMessage.data.data;
          console.log('Parsed payment data:', paymentData);
      
          if (paymentData && paymentData.status === 'APPROVED') {
            const paymentDetails = {
              transactionId: paymentData.transactionId || paymentData.cardToken,
              amount: paymentData.amount,
              currency: paymentData.currency,
              status: paymentData.status,
              cardNumber: paymentData.cardNumber,
              cardHolderName: paymentData.cardHolderName,
              approvalCode: paymentData.approvalCode,
              invoiceNumber: paymentData.invoiceNumber,
              dateCreated: paymentData.dateCreated
            };
      
            console.log('Payment approved, proceeding with success handler:', paymentDetails);
            await onPaymentSuccess(paymentDetails);
            setPaymentStatus({
              success: true,
              message: 'Payment Successful',
              details: paymentDetails
            });
          } else {
            throw new Error('Transaction not approved');
          }
        } catch (error) {
          console.error('Error processing payment success:', error);
          setError(error.message || 'Failed to process payment');
          resetPaymentStates();
        }
      }
    };

    window.addEventListener('message', handleHelcimResponse);
    return () => window.removeEventListener('message', handleHelcimResponse);
  }, [onPaymentSuccess, setError, setIsProcessingOrder]);

  const handlePayment = async () => {
    setLocalProcessing(true);
    setLoading(true);
    setIsProcessingOrder(true);
    setError(null);
    
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

      setTimeout(() => {
        if (window.appendHelcimPayIframe) {
          window.appendHelcimPayIframe(response.checkoutToken, true);
          // Start monitoring iframe after it's appended
          startIframeCheck();
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
      resetPaymentStates();
    } finally {
      setLoading(false);
    }
  };

  const buttonDisabled = disabled || localProcessing || loading || !scriptLoaded || isProcessing;
  const buttonText = loading 
    ? 'Loading...' 
    : localProcessing 
      ? 'Processing...' 
      : !scriptLoaded
        ? 'Loading Payment System...'
        : 'Pay Order';

  return (
    <div className="helcim-pay-container">
      <button 
        onClick={handlePayment}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={buttonDisabled}
      >
        {buttonText}
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