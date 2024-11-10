// Main handler component
const usePaymentSubmission = (stripe, elements, cartItems, formData, setLoading, setError, onSuccess) => {
    const [orderStatus, setOrderStatus] = useState('');
  
    const handleSubmit = async (event) => {
      event.preventDefault();
      setLoading(true);
      setError('');
      setOrderStatus('Processing payment...');
  
      try {
        // Handle cash on delivery
        if (formData.paymentMethod === 'cod') {
          await handleCashOnDelivery();
          return;
        }
  
        // Handle credit card payment
        if (!stripe || !elements) {
          throw new Error('Stripe has not been initialized');
        }
  
        // Create Stripe payment method
        setOrderStatus('Creating payment method...');
        const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
          type: 'card',
          card: elements.getElement(CardElement),
        });
  
        if (stripeError) {
          throw new Error(stripeError.message);
        }
  
        // Calculate total amount
        const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        // Generate order number
        const orderNumber = generateOrderNumber();
  
        // Send order confirmation email
        setOrderStatus('Sending order confirmation...');
        const response = await fetch('/api/send-order-confirmation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            orderNumber,
            email: formData.email,
            phone: formData.phone,
            shippingAddress: formData.shippingAddress,
            billingAddress: formData.billingAddress,
            selectedPhotos: cartItems,
            totalAmount,
            currency: 'USD', // Or your dynamic currency
            paymentMethod: 'credit',
            paymentDetails: {
              paymentMethodId: paymentMethod.id,
              last4: paymentMethod.card?.last4
            }
          }),
        });
  
        const emailResult = await response.json();
        if (!emailResult.success) {
          throw new Error('Failed to send order confirmation');
        }
  
        // Call success handler
        setOrderStatus('Order completed successfully!');
        onSuccess({
          orderNumber,
          paymentMethod: paymentMethod.id,
          totalAmount
        });
  
      } catch (error) {
        console.error('Payment error:', error);
        setError(error.message || 'An error occurred during payment processing');
        setOrderStatus('');
      } finally {
        setLoading(false);
      }
    };
  
    // Handle cash on delivery orders
    const handleCashOnDelivery = async () => {
      try {
        const orderNumber = generateOrderNumber();
        const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
        const response = await fetch('/api/send-order-confirmation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            orderNumber,
            email: formData.email,
            phone: formData.phone,
            shippingAddress: formData.shippingAddress,
            billingAddress: formData.billingAddress,
            selectedPhotos: cartItems,
            totalAmount,
            currency: 'TND', // For Tunisia
            paymentMethod: 'cod'
          }),
        });
  
        const result = await response.json();
        if (!result.success) {
          throw new Error('Failed to process COD order');
        }
  
        setOrderStatus('Order completed successfully!');
        onSuccess({
          orderNumber,
          paymentMethod: 'cod',
          totalAmount
        });
  
      } catch (error) {
        console.error('COD error:', error);
        setError(error.message || 'An error occurred while processing your order');
        setOrderStatus('');
      }
    };
  
    return {
      handleSubmit,
      orderStatus
    };
  };
  
  export default usePaymentSubmission;