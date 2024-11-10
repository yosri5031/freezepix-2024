// src/utils/send-order-confirmation.js
import { createTransport } from 'nodemailer';

// Move credentials to environment variables
const transporter = createTransport({
  host: 'smtppro.zoho.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Add CORS headers helper
const setCorsHeaders = (res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );
};

// Validate incoming order data
const validateOrderData = (data) => {
  const {
    email,
    orderNumber,
    shippingAddress,
    selectedPhotos,
    totalAmount,
    currency
  } = data;

  if (!email || !orderNumber || !shippingAddress || !selectedPhotos || !totalAmount || !currency) {
    throw new Error('Missing required fields');
  }

  // Validate shipping address fields
  const requiredAddressFields = ['firstName', 'lastName', 'address', 'city', 'postalCode', 'country'];
  for (const field of requiredAddressFields) {
    if (!shippingAddress[field]) {
      throw new Error(`Missing required shipping address field: ${field}`);
    }
  }

  // Validate photos array
  if (!Array.isArray(selectedPhotos) || selectedPhotos.length === 0) {
    throw new Error('No photos selected');
  }

  return true;
};

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '4mb'
    },
    externalResolver: true
  },
};

export default async function handler(req, res) {
  setCorsHeaders(res);
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const orderData = req.body;

    // Validate the incoming data
    validateOrderData(orderData);

    const {
      orderNumber,
      email,
      totalAmount,
      currency,
      shippingAddress,
      selectedPhotos,
      orderNote,
      phone, // Added to match form data
      paymentMethod // Added to match form data
    } = orderData;

    // Create HTML table for order items
    const itemsTable = selectedPhotos.map(photo => `
      <tr>
        <td>${photo.productType === 'photo_print' ? `${photo.size} Print` : '3D Crystal'}</td>
        <td>${photo.quantity}</td>
        <td>${photo.price} ${currency}</td>
      </tr>
    `).join('');

    const emailContent = `
      <h2>Order Confirmation - FreezePIX</h2>
      <p>Thank you for your order! Here are your order details:</p>
      
      <h3>Order Information:</h3>
      <p>Order Number: ${orderNumber}</p>
      <p>Total Amount: ${totalAmount} ${currency}</p>
      <p>Payment Method: ${paymentMethod === 'cod' ? 'Cash on Delivery' : 'Credit Card'}</p>
      <p>Contact Phone: ${phone}</p>
      
      <h3>Items Ordered:</h3>
      <table border="1" cellpadding="5">
        <tr>
          <th>Item</th>
          <th>Quantity</th>
          <th>Price</th>
        </tr>
        ${itemsTable}
      </table>
      
      <h3>Shipping Address:</h3>
      <p>
        ${shippingAddress.firstName} ${shippingAddress.lastName}<br>
        ${shippingAddress.address}<br>
        ${shippingAddress.city}, ${shippingAddress.state || shippingAddress.province || ''} ${shippingAddress.postalCode}<br>
        ${shippingAddress.country}
      </p>
      
      ${orderNote ? `<h3>Order Note:</h3><p>${orderNote}</p>` : ''}
      
      <p>Your order will be processed within 48 hours. We'll send you tracking information once your order ships.</p>
      
      <p>Best regards,<br>FreezePIX Team</p>
    `;

    // Send email to customer
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: `FreezePIX Order Confirmation - ${orderNumber}`,
      html: emailContent
    });

    // Send notification to admin
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL,
      cc: process.env.CC_EMAIL,
      subject: `Freezepix App New Order Received - ${orderNumber}`,
      html: emailContent
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error processing order:', error);
    return res.status(500).json({ 
      message: 'Failed to process order', 
      error: error.message 
    });
  }
}