import React, { useState, useEffect, useRef } from 'react';
import { initializeHelcimPayCheckout, removeHelcimPayIframe, setupHelcimGlobals } from './helcimService';

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
  const processingTimeoutRef = useRef(null);
  const isMobileRef = useRef(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));

  // Reset all states and cleanup
  const resetStates = () => {
    setScriptLoaded(true);
    setLocalProcessing(false);
    setIsProcessingOrder(false);
    setLoading(false);
    if (processingTimeoutRef.current) {
      clearTimeout(processingTimeoutRef.current);
      processingTimeoutRef.current = null;
    }
  };

  // Set up global function and reset states on unmount
  useEffect(() => {
    setupHelcimGlobals();
    
    return () => {
      resetStates();
    };
  }, [setIsProcessingOrder]);

  // Load Helcim Pay script
  useEffect(() => {
    const loadScript = () => {
      // Check if script is already loaded
      if (document.querySelector('script[src="https://secure.helcim.app/helcim-pay/services/start.js"]')) {
        console.log('Helcim Pay script already loaded');
        setScriptLoaded(true);
        return;
      }
      
      console.log('Loading Helcim Pay script');
      scriptRef.current = document.createElement('script');
      scriptRef.current.src = 'https://secure.helcim.app/helcim-pay/services/start.js';
      scriptRef.current.async = true;
      
      scriptRef.current.onload = () => {
        console.log('Helcim Pay script loaded successfully');
        setScriptLoaded(true);
      };
      
      scriptRef.current.onerror = () => {
        console.error('Failed to load Helcim Pay script');
        setError('Failed to load payment system');
        resetStates();
      };

      document.head.appendChild(scriptRef.current);
    };

    // Handle Helcim window closure
    const handleHelcimClose = () => {
      console.log('Helcim window closed');
      resetStates();
    };

    // Handle browser back button
    const handlePopState = () => {
      console.log('Browser back button pressed');
      resetStates();
    };

    // Handle page visibility change (user switches tabs or apps)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log('Page hidden');
        processingTimeoutRef.current = setTimeout(resetStates, 10000);
      } else if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
      }
    };

    loadScript();
    
    window.addEventListener('removeHelcimPayIframe', handleHelcimClose);
    window.addEventListener('popstate', handlePopState);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('removeHelcimPayIframe', handleHelcimClose);
      window.removeEventListener('popstate', handlePopState);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      resetStates();
    };
  }, [setError, setIsProcessingOrder]);

  // Handle messages from the Helcim iframe
  useEffect(() => {
    const handleHelcimResponse = async (event) => {
      // Ignore messages from other origins
      if (event.origin !== 'https://secure.helcim.app') {
        return;
      }
      
      let eventData;
      try {
        // Handle different message formats
        if (typeof event.data === 'string') {
          eventData = JSON.parse(event.data);
        } else if (event.data.eventStatus) {
          eventData = event.data;
        } else {
          return; // Not a Helcim message
        }
        
        console.log('Received Helcim response:', eventData);
      } catch (error) {
        console.error('Failed to parse Helcim message:', error);
        return;
      }

      // Handle payment aborted by user
      if (eventData.eventStatus === 'ABORTED') {
        console.log('Payment aborted by user');
        setPaymentStatus({
          success: false,
          message: 'Payment Cancelled',
          details: eventData.eventMessage || 'The payment was cancelled'
        });
        setError('Payment was cancelled');
        resetStates();
        
        // Clean up the iframe
        if (window.removeHelcimPayIframe) {
          try {
            window.removeHelcimPayIframe();
          } catch (error) {
            console.error('Error removing Helcim iframe:', error);
          }
        }
        return;
      }

      // Handle successful payment
      if (eventData.eventStatus === 'SUCCESS') {
        try {
          let parsedEventMessage;
          try {
            // Parse event message, handling different formats
            parsedEventMessage = typeof eventData.eventMessage === 'string' 
              ? JSON.parse(eventData.eventMessage) 
              : eventData.eventMessage;
            
            // Additional mobile browser compatibility check
            if (typeof parsedEventMessage === 'string') {
              parsedEventMessage = JSON.parse(parsedEventMessage);
            }
          } catch (parseError) {
            console.error('Parse error:', parseError);
            resetStates();
            throw new Error('Invalid payment response format');
          }
      
          // Extract payment data
          const paymentData = parsedEventMessage.data?.data;
          console.log('Parsed payment data:', paymentData);
      
          if (!paymentData) {
            throw new Error('Payment data missing from response');
          }
      
          if (paymentData.status === 'APPROVED') {
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
            resetStates();
            throw new Error(`Transaction not approved: ${paymentData.status}`);
          }
        } catch (error) {
          console.error('Error processing payment success:', error);
          setError(error.message || 'Failed to process payment');
          resetStates();
        }
      }
    };

    window.addEventListener('message', handleHelcimResponse);
    return () => window.removeEventListener('message', handleHelcimResponse);
  }, [onPaymentSuccess, setError, setIsProcessingOrder]);

  // Handle payment button click
  const handlePayment = async () => {
    setLocalProcessing(true);
    setLoading(true);
    setIsProcessingOrder(true);
    setError(null);
    
    try {
      // Check if the Helcim script is loaded
      if (!scriptLoaded || !window.appendHelcimPayIframe) {
        throw new Error(isMobileRef.current ? 
          'Please wait for the payment system to load on your mobile device.' : 
          'Payment system is still loading. Please try again in a moment.');
      }
  
      // Calculate correct totals before initialization
      const { total: calculatedTotal } = calculateTotals ? calculateTotals() : { total };
      
      // Initialize the Helcim payment
      const response = await initializeHelcimPayCheckout({
        selectedCountry,
        total: calculatedTotal || total
      });
      
      console.log('Helcim initialization response:', response);
      
      if (!response.checkoutToken) {
        throw new Error('Failed to get valid checkout token');
      }
  
      setCheckoutToken(response.checkoutToken);
      secretTokenRef.current = response.secretToken;
  
      // Set timeout to detect if iframe fails to open
      const timeoutDuration = isMobileRef.current ? 20000 : 10000;
      
      processingTimeoutRef.current = setTimeout(() => {
        if (!document.querySelector('.helcim-pay-iframe')) {
          resetStates();
          setError(isMobileRef.current ? 
            'Payment window failed to open on mobile. Please try again or use a desktop browser.' : 
            'Payment window failed to open. Please try again.');
        }
      }, timeoutDuration);
  
      // Add delay for mobile browsers
      const appendDelay = isMobileRef.current ? 1500 : 500;
      
      setTimeout(() => {
        if (window.appendHelcimPayIframe) {
          window.appendHelcimPayIframe(response.checkoutToken, true);
        } else {
          throw new Error('Payment system not ready. Please refresh and try again.');
        }
      }, appendDelay);
  
    } catch (error) {
      console.error('Payment Initialization Error:', error);
      setPaymentStatus({
        success: false,
        message: 'Payment Initialization Failed',
        details: error.message
      });
      setError(error.message);
      resetStates();
    }
  };

  const buttonDisabled = disabled || localProcessing || loading || !scriptLoaded || isProcessing;
  const buttonText = loading 
    ? 'Loading...' 
    : localProcessing 
      ? 'Processing...' 
      : !scriptLoaded
        ? 'Loading Payment System...'
        : 'Pay Now';

  return (
    <div className="helcim-pay-container">
      <button 
        onClick={handlePayment}
        className="w-full px-6 py-2 bg-yellow-400 text-black rounded-lg font-medium hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
          {paymentStatus.details && typeof paymentStatus.details === 'string' && (
            <p className="text-sm mt-1">{paymentStatus.details}</p>
          )}
        </div>
      )}
    </div>
  );
};

export { HelcimPayButton };