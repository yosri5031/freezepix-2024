import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { initializeHelcimPayCheckout } from './helcimService';

const HelcimPayButton = ({ 
    onPaymentSuccess,
    isProcessing,
    disabled,
    formData, 
    selectedCountry, 
    selectedPhotos,
    orderNote,
    discountCode,
    calculateTotals,
    TAX_RATES,
    initialCountries,
    customerData
  }) => {
    const [checkoutToken, setCheckoutToken] = useState(null);
    const [secretToken, setSecretToken] = useState(null);
    const [paymentStatus, setPaymentStatus] = useState(null);
  
    // Helcim Pay API configuration
    const API_TOKEN = process.env.REACT_APP_HELCIM_API_TOKEN || 'aM2T3NEpnksEOKIC#ajd%!-IE.TRXEqUIi_Ct8P.K18z1L%aV3zTl*R4PHoDco%y';
    const HELCIM_API_URL = 'https://api.helcim.com/v2/helcim-pay/initialize';
  
    // Calculate total using the passed function
    const { total, subtotalsBySize } = calculateTotals({
      selectedPhotos,
      selectedCountry,
      discountCode,
      TAX_RATES,
      initialCountries
    });
  
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
        // Generate hash for validation (this would typically be done server-side)
        const generateHash = (data, secretToken) => {
          const jsonData = JSON.stringify(data);
          // In a real implementation, use a secure hashing method
          // This is a simplified example
          return window.crypto.subtle.digest(
            'SHA-256', 
            new TextEncoder().encode(jsonData + secretToken)
          );
        };
  
        // Validate response
        const localHash = await generateHash(eventMessage.data, secretToken);
        const remoteHash = eventMessage.hash;
  
        // Compare hashes (simplified)
        if (localHash === remoteHash) {
          setPaymentStatus({
            success: true,
            message: 'Payment Successful',
            details: eventMessage.data
          });
  
          // Call onPaymentSuccess callback
          if (onPaymentSuccess) {
            onPaymentSuccess(eventMessage.data);
          }
  
          // Remove Helcim Pay iframe
          removeHelcimPayIframe();
        } else {
          setPaymentStatus({
            success: false,
            message: 'Transaction Validation Failed',
            details: 'Hash mismatch'
          });
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
            
            // Use billing address if different from shipping, otherwise use shipping address
            const billingAddress = formData.isBillingAddressSameAsShipping 
              ? formData.shippingAddress 
              : formData.billingAddress;
      
            if (!billingAddress) {
              throw new Error('Billing address information is required');
            }
      
            const response = await initializeHelcimPayCheckout({
              ...formData,
              billingAddress: billingAddress
            });
            
              // Open Helcim Pay modal
        if (window.appendHelcimPayIframe && checkoutToken) {
            window.appendHelcimPayIframe(checkoutToken, true);
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