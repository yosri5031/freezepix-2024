// utils/emailService.js
import { createTransport } from 'nodemailer';

const transporter = createTransport({
  host: 'smtppro.zoho.com',
  port: 587,
  secure: true,
  auth: {
    user: 'lab@freezepix.com',
    pass: process.env.EMAIL_PASSWORD // Store password in environment variable
  }
});

const sendOrderConfirmation = async (orderDetails) => {
  const {
    orderNumber,
    email,
    totalAmount,
    currency,
    shippingAddress,
    selectedPhotos,
    orderNote
  } = orderDetails;

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
};

export default { sendOrderConfirmation };