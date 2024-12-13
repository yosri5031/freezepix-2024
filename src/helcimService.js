import axios from 'axios';

const API_TOKEN = 'aM2T3NEpnksEOKIC#ajd%!-IE.TRXEqUIi_Ct8P.K18z1L%aV3zTl*R4PHoDco%y';
const HELCIM_API_URL = 'https://api.helcim.com/v2/helcim-pay/initialize';

export const initializeHelcimPayCheckout = async ({
  formData,
  selectedCountry,
  total,
  subtotalsBySize
}) => {
  try {
    const response = await axios.post(
      `${HELCIM_API_URL}`,
      {
        amount: total,
        currency: selectedCountry === 'CA' ? 'CAD' : 'USD',
        customer: {
          name: `${formData.shippingAddress?.firstName} ${formData.shippingAddress?.lastName}`,
          email: formData.email,
          phone: formData.phone,
          address: {
            street: formData.shippingAddress?.address,
            city: formData.shippingAddress?.city,
            province: formData.shippingAddress?.state || formData.shippingAddress?.province,
            country: selectedCountry,
            postalCode: formData.shippingAddress?.postalCode
          }
        },
        orderDetails: {
          subtotals: subtotalsBySize,
          items: Object.entries(subtotalsBySize).map(([size, amount]) => ({
            name: `Photo Print - ${size}`,
            amount: amount
          }))
        }
      },
      {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      checkoutToken: response.data.token,
      secretToken: response.data.secretToken
    };
  } catch (error) {
    console.error('Helcim initialization error:', error);
    throw new Error('Failed to initialize Helcim payment: ' + (error.response?.data?.message || error.message));
  }
};