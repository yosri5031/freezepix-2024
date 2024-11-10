// src/utils/emailService.js
const sendOrderConfirmation = async (orderDetails) => {
    try {
      const response = await fetch('./send-order-confirmation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(orderDetails),
        credentials: 'same-origin'
      });
  
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.message || `HTTP error! status: ${response.status}`;
        console.error('Error in response:', errorMessage);
        throw new Error(errorMessage);
    }

    const data = await response.json();
    return data;
} catch (error) {
    console.error('Error sending order confirmation:', error);
    throw error;
}
};

export { sendOrderConfirmation };