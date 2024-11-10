// src/pages/api/send-order-confirmation.js
import { createTransport } from 'nodemailer';

// Create transporter outside the handler to reuse the connection
const transporter = createTransport({
  host: 'smtppro.zoho.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER || 'lab@freezepix.com',
    pass: process.env.EMAIL_PASSWORD || 'Freeze2024+'
  }
});

// Add CORS headers helper (useful for development)
const setCorsHeaders = (res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );
};

export default async function handler(req, res) {
  // Handle CORS
  setCorsHeaders(res);
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const {
      orderNumber,
      email,
      totalAmount,
      currency,
      shippingAddress,
      selectedPhotos,
      orderNote
    } = req.body;

    // Basic validation
    if (!email || !orderNumber || !shippingAddress) {
      return res.status(400).json({ 
        message: 'Missing required fields' 
      });
    }

    // Create HTML table for order items
    const itemsTable = selectedPhotos.map(photo => `
      <tr>
        <td>${photo.productType === 'photo_print' ? `${photo.size} Print` : '3D Crystal'}</td>
        <td>${photo.quantity}</td>
      </tr>
    `).join('');

    const emailContent = `
      <h2>Order Confirmation - FreezePIX</h2>
      <p>Thank you for your order! Here are your order details:</p>
      
      <h3>Order Information:</h3>
      <p>Order Number: ${orderNumber}</p>
      <p>Total Amount: ${totalAmount} ${currency}</p>
      
      <h3>Items Ordered:</h3>
      <table border="1" cellpadding="5">
        <tr>
          <th>Item</th>
          <th>Quantity</th>
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
      from: 'lab@freezepix.com',
      to: email,
      subject: `FreezePIX Order Confirmation - ${orderNumber}`,
      html: emailContent
    });

    // Send notification to admin
    await transporter.sendMail({
      from: 'lab@freezepix.com',
      to: 'lab@freezepix.com',
      cc: 'info@freezepix.com',
      subject: `New Order Received - ${orderNumber}`,
      html: emailContent
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ 
      message: 'Failed to send email', 
      error: error.message 
    });
  }
}