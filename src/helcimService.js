import axios from 'axios';

/**
 * Initialize Helcim Pay Checkout
 * @param {Object} options - Payment options
 * @param {string} options.selectedCountry - The selected country code
 * @param {number} options.total - The total payment amount
 * @returns {Promise<Object>} - The checkout token response
 */
export const initializeHelcimPayCheckout = async ({ selectedCountry, total }) => {
  try {
    console.log('Initializing Helcim Pay with:', { selectedCountry, total });
    
    // Validate input parameters
    if (!selectedCountry) {
      throw new Error('Country is required');
    }
    
    if (!total || isNaN(parseFloat(total)) || parseFloat(total) <= 0) {
      throw new Error('Valid payment amount is required');
    }
    
    // Map country code to currency
    const currencyMap = {
      'US': 'USD',
      'USA': 'USD',
      'CA': 'CAD',
      'CAN': 'CAD',
      'TN': 'TND',
      'TUN': 'TND',
      'GB': 'GBP',
      'DE': 'EUR',
      'FR': 'EUR',
      'IT': 'EUR',
      'ES': 'EUR',
      'AU': 'AUD',
      'JP': 'JPY',
      'SG': 'SGD',
      'AE': 'AED',
      'SA': 'SAR',
      'BR': 'BRL',
      'MX': 'MXN',
      'RU': 'RUB',
      'CN': 'CNY'
    };
    
    const currency = currencyMap[selectedCountry] || 'USD';
    
    // Format the amount to 2 decimal places
    const formattedAmount = parseFloat(total).toFixed(2);
    
    // Prepare request data
    const requestData = {
      amount: formattedAmount,
      currency: currency,
      paymentType: 'purchase',
      paymentMethod: 'cc',
      customStyling: {
        appearance: 'light',
        brandColor: 'fcd704'
      },
      logo: 'https://cdn.shopify.com/s/files/1/0671/1387/7804/files/Freezepix_Logo_VF_2.jpg?v=1738964599'
    };
    
    console.log('Sending Helcim request:', requestData);
    
    // Make request to your backend API
    const response = await axios.post(
      'https://freezepix-database-server-c95d4dd2046d.herokuapp.com/api/initialize-payment',
      requestData,
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 15000 // 15 second timeout
      }
    );
    
    console.log('Helcim response:', response.data);
    
    if (!response.data || !response.data.checkoutToken) {
      throw new Error('Invalid response from payment service');
    }
    
    return response.data;
  } catch (error) {
    console.error('Helcim initialization error:', error);
    throw new Error(`Failed to initialize Helcim payment: ${error.response?.data?.message || error.message}`);
  }
};

/**
 * Remove the Helcim Pay iframe from the DOM
 */
export const removeHelcimPayIframe = () => {
  try {
    const iframe = document.querySelector('.helcim-pay-iframe');
    if (iframe) {
      iframe.remove();
    }
    
    const backdrop = document.querySelector('.helcim-pay-backdrop');
    if (backdrop) {
      backdrop.remove();
    }
    
    // Dispatch event to notify components that iframe was removed
    window.dispatchEvent(new CustomEvent('removeHelcimPayIframe'));
    
    return true;
  } catch (error) {
    console.error('Error removing Helcim iframe:', error);
    return false;
  }
};

// Export a function to set up a global reference to the removeHelcimPayIframe function
export const setupHelcimGlobals = () => {
  window.removeHelcimPayIframe = removeHelcimPayIframe;
};