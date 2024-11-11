// pages/api/orders/create.js
import formidable from 'formidable';
import connectDB from './db';
import Order from './Order';
import { uploadImage } from './cloudinary';

// Disable the default body parser to handle form data
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectDB();
    
    // Parse form data with formidable
    const form = new formidable.IncomingForm();
    form.multiples = true;
    
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    // Convert files object to array
    const fileArray = Object.values(files).map(file => file[0] || file);
    
    // Parse the orderData from fields
    const orderData = {
      ...fields,
      orderItems: JSON.parse(fields.orderItems),  // Assuming orderItems is sent as JSON string
      totalAmount: parseFloat(fields.totalAmount),
    };

    // Upload images to Cloudinary
    const uploadPromises = fileArray.map(file => uploadImage(file, orderData.orderNumber));
    const uploadedImages = await Promise.all(uploadPromises);
    
    // Add image URLs to order items
    orderData.orderItems = orderData.orderItems.map((item, index) => ({
      ...item,
      imageUrl: uploadedImages[index].url,
      imageId: uploadedImages[index].key
    }));
    
    // Create order in MongoDB
    const order = new Order(orderData);
    await order.save();
    
    res.status(201).json({ success: true, order });
  } catch (error) {
    console.error('Order creation failed:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}