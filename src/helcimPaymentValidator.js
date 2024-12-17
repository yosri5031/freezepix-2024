import axios from 'axios';

export const validateHelcimPayment = async (paymentData, orderData) => {
    try {
      // Step 1: Verify Helcim payment
      const response = await axios.post('https://freezepix-database-server-c95d4dd2046d.herokuapp.com/api/validate-helcim-payment', {
        paymentData: paymentData,
        orderNumber: orderData.orderNumber
      });
  
      if (!response.data.success) {
        throw new Error('Payment validation failed');
      }
  
      // Step 2: Submit order in chunks
      const chunkSize = 5; // Adjust based on your needs
      const orderItems = orderData.orderItems;
      const chunks = [];
  
      for (let i = 0; i < orderItems.length; i += chunkSize) {
        chunks.push(orderItems.slice(i, i + chunkSize));
      }
  
      const orderResults = [];
      for (const chunk of chunks) {
        const chunkResult = await axios.post('https://freezepix-database-server-c95d4dd2046d.herokuapp.com/api/orders/chunk', {
          orderNumber: orderData.orderNumber,
          items: chunk,
          customerInfo: orderData.customerInfo
        });
        orderResults.push(chunkResult.data);
      } 
     
      // Step 3: Send confirmation email
      await axios.post('https://freezepix-email-service-80156ac7d026.herokuapp.com/send-order-confirmation', {
        orderData: {
          ...orderData,
          orderItems: orderData.orderItems.map(item => ({
            ...item,
            file: undefined, // Remove file data
            thumbnail: item.thumbnail
          }))
        }
      });
  
      return {
        success: true,
        orderResults
      };
  
    } catch (error) {
      console.error('Payment processing error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  };
  