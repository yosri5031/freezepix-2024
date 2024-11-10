// src/utils/emailService.js
const sendOrderConfirmation = async (orderDetails) => {
  try {
    const response = await fetch('/api/send-order-confirmation', {
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
      throw new Error(errorData?.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error sending order confirmation:', error);
    throw error;
  }
};

export { sendOrderConfirmation };