import axios from 'axios';

const API_TOKEN = 'aM2T3NEpnksEOKIC#ajd%!-IE.TRXEqUIi_Ct8P.K18z1L%aV3zTl*R4PHoDco%y';
const HELCIM_API_URL = 'https://api.helcim.com/v2/helcim-pay/initialize';

export const initializeHelcimPayCheckout = async ({
    orderData,
    selectedCountry,
    total,
    subtotalsBySize
  }) => {
    try {
      const response = await axios.post('https://freezepix-database-server-c95d4dd2046d.herokuapp.com/api/initialize-payment', {
        customerData: {
          name: `${orderData.billingAddress?.firstName} ${orderData.billingAddress?.lastName}`,
          email: orderData.email,
          phone: orderData.phone,
          address: {
            street: orderData.billingAddress?.address,
            city: orderData.billingAddress?.city,
            province: orderData.billingAddress?.state || orderData.billingAddress?.province,
            country: selectedCountry,
            postalCode: orderData.billingAddress?.postalCode
          }
        },
        selectedPhotos: subtotalsBySize,
        selectedCountry: selectedCountry,
        total: total
      });
  
      return {
        checkoutToken: response.data.checkoutToken,
        secretToken: response.data.secretToken
      };
    } catch (error) {
      console.error('Helcim initialization error:', error);
      throw new Error('Failed to initialize Helcim payment: ' + (error.response?.data?.message || error.message));
    }
  };