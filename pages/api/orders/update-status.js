import connectDB from '../../../utils/db';
import Order from '../../../models/Order';

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectDB();
    
    const { orderId, status } = req.body;
    
    const order = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error('Status update failed:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}