// imageOptimizer.js
import imageCompression from 'browser-image-compression';

export const optimizeImage = async (file, maxSizeMB = 1, maxWidthOrHeight = 1920) => {
  try {
    const options = {
      maxSizeMB,
      maxWidthOrHeight,
      useWebWorker: true,
      fileType: 'image/jpeg'
    };
    return await imageCompression(file, options);
  } catch (error) {
    console.error('Image optimization error:', error);
    return file; // Return original file if optimization fails
  }
};

export const submitOrderInChunks = async (orderData, chunkSize = 5) => {
  const { orderItems } = orderData;
  const results = [];

  // Split order items into chunks
  for (let i = 0; i < orderItems.length; i += chunkSize) {
    const chunk = orderItems.slice(i, i + chunkSize);
    
    try {
      const chunkResult = await axios.post(
        'https://freezepix-database-server-c95d4dd2046d.herokuapp.com/api/orders', 
        { ...orderData, orderItems: chunk },
        { 
          headers: { 
            'Content-Type': 'application/json' 
          }, 
          timeout: 60000 
        }
      );
      
      results.push(chunkResult.data);
    } catch (error) {
      console.error(`Error submitting chunk starting at index ${i}:`, error);
      // Optionally, you might want to implement retry logic or handle partial failures
      throw error;
    }
  }

  return results;
};