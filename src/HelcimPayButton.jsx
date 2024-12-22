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
  const paymentWindowRef = useRef(null);

  const resetPaymentStates = (reason = '') => {
    console.log('Resetting payment states:', reason);
    setLocalProcessing(false);
    setIsProcessingOrder(false);
    setError(null);
    setPaymentStatus(null);
    setCheckoutToken(null);
    
    // Clear any existing intervals
    if (iframeCheckInterval.current) {
      clearInterval(iframeCheckInterval.current);
      iframeCheckInterval.current = null;
    }

    // Remove iframe if it exists
    if (window.removeHelcimPayIframe) {
      try {
        window.removeHelcimPayIframe();
      } catch (error) {
        console.error('Error removing Helcim iframe:', error);
      }
    }

    // Force cleanup of any remaining iframes
    const existingIframe = document.querySelector('iframe[id^="helcim-pay-iframe"]');
    if (existingIframe) {
      existingIframe.remove();
    }
  };

  // Enhanced iframe monitoring
  const startPaymentMonitoring = () => {
    if (iframeCheckInterval.current) {
      clearInterval(iframeCheckInterval.current);
    }

    let previousIframeExists = false;
    iframeCheckInterval.current = setInterval(() => {
      const helcimIframe = document.querySelector('iframe[id^="helcim-pay-iframe"]');
      const currentIframeExists = !!helcimIframe;

      // Detect when iframe disappears
      if (previousIframeExists && !currentIframeExists && localProcessing) {
        console.log('Payment window closed - iframe disappeared');
        resetPaymentStates('iframe-disappeared');
      }

      // Check iframe visibility
      if (helcimIframe) {
        const isVisible = helcimIframe.offsetParent !== null;
        if (!isVisible && localProcessing) {
          console.log('Payment window closed - iframe hidden');
          resetPaymentStates('iframe-hidden');
        }
      }

      previousIframeExists = currentIframeExists;
    }, 100); // More frequent checks
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      resetPaymentStates('component-unmount');
    };
  }, []);

  // Handle visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && localProcessing) {
        // Short delay to allow for DOM updates
        setTimeout(() => {
          const helcimIframe = document.querySelector('iframe[id^="helcim-pay-iframe"]');
          if (!helcimIframe) {
            console.log('Payment window closed - visibility change');
            resetPaymentStates('visibility-change');
          }
        }, 100);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [localProcessing]);

  // Handle back button
  useEffect(() => {
    const handleBackButton = (event) => {
      const isBackArrow = (element) => {
        return element?.classList?.contains('fa-arrow-left') ||
               element?.getAttribute('data-icon') === 'arrow-left';
      };

      let target = event.target;
      while (target) {
        if (isBackArrow(target)) {
          console.log('Back arrow clicked');
          resetPaymentStates('back-button');
          break;
        }
        target = target.parentElement;
      }
    };

    document.addEventListener('click', handleBackButton);
    return () => document.removeEventListener('click', handleBackButton);
  }, []);

  // Handle ESC key
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && localProcessing) {
        console.log('ESC key pressed');
        resetPaymentStates('esc-key');
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [localProcessing]);

  // Load Helcim script
  useEffect(() => {
    const loadScript = () => {
      scriptRef.current = document.createElement('script');
      scriptRef.current.src = 'https://secure.helcim.app/helcim-pay/services/start.js';
      scriptRef.current.async = true;
      
      scriptRef.current.onload = () => {
        console.log('Helcim Pay.js script loaded');
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

  // Handle Helcim messages
  useEffect(() => {
    const handleHelcimResponse = async (event) => {
      if (!event.data || !event.data.eventStatus) {
        return;
      }

      console.log('Helcim response:', event.data);

      if (event.data.eventStatus === 'ABORTED') {
        console.log('Payment explicitly aborted');
        resetPaymentStates('helcim-abort');
        return;
      }

      if (event.data.eventStatus === 'SUCCESS') {
        try {
          let parsedEventMessage = typeof event.data.eventMessage === 'string' 
            ? JSON.parse(event.data.eventMessage) 
            : event.data.eventMessage;
    
          if (typeof parsedEventMessage.data === 'string') {
            parsedEventMessage.data = JSON.parse(parsedEventMessage.data);
          }
    
          const paymentData = parsedEventMessage.data.data;
          
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
          console.error('Payment processing error:', error);
          resetPaymentStates('payment-error');
        }
      }
    };

    window.addEventListener('message', handleHelcimResponse);
    return () => window.removeEventListener('message', handleHelcimResponse);
  }, [onPaymentSuccess, setError, setIsProcessingOrder]);

  const handlePayment = async () => {
    resetPaymentStates('new-payment');
    setLocalProcessing(true);
    setLoading(true);
    setIsProcessingOrder(true);
    
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
      
      if (!response.checkoutToken) {
        throw new Error('Failed to get valid checkout token');
      }

      setCheckoutToken(response.checkoutToken);
      secretTokenRef.current = response.secretToken;

      setTimeout(() => {
        if (window.appendHelcimPayIframe) {
          window.appendHelcimPayIframe(response.checkoutToken, true);
          startPaymentMonitoring();
        } else {
          throw new Error('Payment system not ready. Please try again.');
        }
      }, 500);

    } catch (error) {
      console.error('Payment Initialization Error:', error);
      resetPaymentStates('initialization-error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="helcim-pay-container">
      <button 
        onClick={handlePayment}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={disabled || localProcessing || loading || !scriptLoaded || isProcessing}
      >
        {loading 
          ? 'Loading...' 
          : localProcessing 
            ? 'Processing...' 
            : !scriptLoaded
              ? 'Loading Payment System...'
              : 'Pay Order'
        }
      </button>

      {paymentStatus && (
        <div 
          className={`mt-4 p-3 rounded ${
            paymentStatus.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
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