import React, { useState, useEffect } from 'react';
import axios from 'axios';
// Initialize Helcim Pay Checkout
const initializeHelcimPayCheckout = async () => {
    const requestPayload = {
        customerRequest: {
          billingAddress: {
            name: `${formData.shippingAddress.firstName} ${formData.shippingAddress.lastName}`,
            street1: formData.shippingAddress.address,
            city: formData.shippingAddress.city,
            province: formData.shippingAddress.province,
            country: formData.shippingAddress.country,
            postalCode: formData.shippingAddress.postalCode,
            email: formData.email
          },
          customerCode: `CUST-${Date.now()}`,
          contactName: `${formData.shippingAddress.firstName} ${formData.shippingAddress.lastName}`
        },
        invoiceRequest: {
          lineItems: Object.entries(subtotalsBySize)
            .filter(([_, amount]) => amount > 0)
            .map(([size, amount]) => ({
              description: size,
              quantity: 1,
              price: amount,
              total: amount
            })),
          invoiceNumber: `INV-${Date.now()}`
        },
        paymentType: 'purchase',
        amount: total, // Use the calculated total
        currency: selectedCountry === 'TN' ? 'TND' : selectedCountry === 'CA' ? 'CAD' : 'USD',
        paymentMethod: 'cc-ach'
      };

    try {
      const response = await axios.post(HELCIM_API_URL, requestPayload, {
        headers: {
          'accept': 'application/json',
          'api-token': API_TOKEN,
          'content-type': 'application/json'
        }
      });

      // Store checkout and secret tokens
      setCheckoutToken(response.data.checkoutToken);
      setSecretToken(response.data.secretToken);

      return response.data;
    } catch (error) {
      console.error('Initialization Error:', error);
      setPaymentStatus({
        success: false,
        message: 'Payment Initialization Failed',
        details: error.message
      });
      throw error;
    }
  };

const HelcimPayButton = () => {
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
          validateTransaction(event.data.eventMessage);
        }
      }
    };

    window.addEventListener('message', handlePaymentResponse);

    return () => {
      window.removeEventListener('message', handlePaymentResponse);
    };
  }, [checkoutToken]);

  

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
      // Initialize checkout
      await initializeHelcimPayCheckout();

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
          : `Pay ${selectedCountry === 'TN' ? 'TND' : selectedCountry === 'CA' ? 'CAD' : 'USD'} ${total.toFixed(2)}`
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

export  {HelcimPayButton,initializeHelcimPayCheckout};