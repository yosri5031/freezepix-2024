// src/utils/emailService.js

const sendOrderConfirmation = async (orderDetails) => {
    try {
      // Update the API path to match the new structure
      const response = await fetch('/api/send-order-confirmation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderDetails)
      });
  
      if (!response.ok) {
        throw new Error('Failed to send order confirmation');
      }
  
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error sending order confirmation:', error);
      throw error;
    }
  };
  
  export { sendOrderConfirmation };