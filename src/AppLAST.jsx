import React, { useState, useRef } from "react";
import { Upload, ShoppingCart, Package, Camera, X } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import {
  CardElement,
  Elements,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

// Initialize Stripe - Replace with your test publishable key
const stripePromise = loadStripe('pk_test_51QHmgQRvhgQx4g20FEvJ97UMmtc7QcW4yGdmbDN49M75MnwQBb5ZO408FI6Tq1w9NKuWr6yQoMDBqS5FrIEEfdlr00swKtIShp');
// initial countries
const initialCountries = [
    { name: 'United States', value: 'USA', currency: 'USD', rate: 1, size4x6: 0.39, size5x7: 1.49 },
    { name: 'Canada', value: 'CAN', currency: 'CAD', rate: 1, size4x6: 0.39, size5x7: 1.49 },
    { name: 'Tunisia', value: 'TUN', currency: 'TND', rate: 2.25, size4x6: 0.89, size5x7: 3.35 }
  ];

// Payment form component
const PaymentForm = ({ onPaymentSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: elements.getElement(CardElement),
    });

    if (error) {
      console.log('[error]', error);
    } else {
      console.log('[PaymentMethod]', paymentMethod);
      // Here you would typically send the paymentMethod.id to your server
      onPaymentSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 border rounded">
        <CardElement />
      </div>
      <button 
        type="submit" 
        disabled={!stripe}
        className="w-full py-2 bg-yellow-400 text-black rounded hover:bg-yellow-500"
      >
        Pay Now
      </button>
    </form>
  );
};

const FreezePIX = () => {
  // State Management
  const [showIntro, setShowIntro] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [activeStep, setActiveStep] = useState(0);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [isBillingAddressSameAsShipping, setIsBillingAddressSameAsShipping] = useState(true);
  const fileInputRef = useRef(null);

  // Constants with updated 4x6 price (16 photos)
  const initialCountries = [
    { name: 'United States', value: 'USA', currency: 'USD', rate: 1, size4x6: 0.39, size5x7: 1.49 },
    { name: 'Canada', value: 'CAN', currency: 'CAD', rate: 1, size4x6: 0.39, size5x7: 1.49 },
    { name: 'Tunisia', value: 'TUN', currency: 'TND', rate: 2.25, size4x6: 0.89, size5x7: 3.35 }
  ];

  const [formData, setFormData] = useState({
    email: '',
    shippingAddress: {
      firstName: '',
      lastName: '',
      address: '',
      city: '',
      postalCode: '',
      country: selectedCountry
    },
    billingAddress: {
      firstName: '',
      lastName: '',
      address: '',
      city: '',
      postalCode: '',
      country: selectedCountry
    },
    paymentMethod: selectedCountry === 'TUN' ? 'cod' : 'credit'
  });

// Handle back navigation
const handleBack = () => {
    if (activeStep === 0) {
      setShowIntro(true);
    } else {
      setActiveStep(prev => prev - 1);
    }
  };

  // Handle next step and order placement
  const handleNext = () => {
    if (activeStep === 2) {
      if (selectedCountry === 'TUN') {
        setOrderSuccess(true);
      }
      // For other countries, payment is handled by Stripe component
    } else {
      setActiveStep(prev => prev + 1);
    }
  };

  // Calculate totals with size-based invoice
  const calculateTotals = () => {
    const country = initialCountries.find(c => c.value === selectedCountry);
    
    // Group photos by size
    const photosBySize = {
      '4x6': selectedPhotos.filter(p => p.size === '4x6'),
      '5x7': selectedPhotos.filter(p => p.size === '5x7')
    };
  
    // Calculate quantities for each size (per individual photo)
    const quantities = {
      '4x6': photosBySize['4x6'].reduce((sum, photo) => sum + photo.quantity, 0),
      '5x7': photosBySize['5x7'].reduce((sum, photo) => sum + photo.quantity, 0)
    };
  
    // Calculate subtotals by size (per individual photo)
    const subtotalsBySize = {
      '4x6': quantities['4x6'] * (country.size4x6), // 0.39 USD/CAD or 0.89 TND per photo
      '5x7': quantities['5x7'] * country.size5x7    // 1.49 USD/CAD or 3.35 TND per photo
    };
  
    const subtotal = subtotalsBySize['4x6'] + subtotalsBySize['5x7'];
    const shippingFee = selectedCountry === 'TUN' ? 8 : 9;
    const total = subtotal + shippingFee;
  
    return { 
      subtotalsBySize, 
      subtotal, 
      shippingFee, 
      total,
      quantities
    };
  };

  // Render Success Screen
  if (orderSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-xl w-full">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center space-y-6">
            <div className="text-green-500 text-5xl">✓</div>
            <h2 className="text-2xl font-bold">Thank you for your order!</h2>
            <p className="text-gray-600">
              Your order has been successfully placed and will be processed within 48 hours.
              A confirmation email with tracking details will be sent to {formData.email}.
            </p>
            <div className="mt-4">
              <p className="font-medium">Order Details:</p>
              <p>Order Number: {Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
              <p>Total Amount: {calculateTotals().total.toFixed(2)} {initialCountries.find(c => c.value === selectedCountry)?.currency}</p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500"
            >
              Place New Order
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Step 3: Invoice Section
  const renderInvoice = () => {
    const { subtotalsBySize, subtotal, shippingFee, total, quantities } = calculateTotals();
    const country = initialCountries.find(c => c.value === selectedCountry);
    
    return (
      <div className="space-y-6">
        {/* Contact Information */}
        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-3">Contact Information</h3>
          <p className="text-gray-600">{formData.email}</p>
        </div>
  
        {/* Shipping Address */}
        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-3">Shipping Address</h3>
          <div className="text-gray-600">
            <p>{formData.shippingAddress.firstName} {formData.shippingAddress.lastName}</p>
            <p>{formData.shippingAddress.address}</p>
            <p>{formData.shippingAddress.city}, {formData.shippingAddress.postalCode}</p>
            <p>{country.name}</p>
          </div>
        </div>
  
        {/* Billing Address */}
        {!isBillingAddressSameAsShipping && formData.paymentMethod !== 'cod' && (
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-3">Billing Address</h3>
            <div className="text-gray-600">
              <p>{formData.billingAddress.firstName} {formData.billingAddress.lastName}</p>
              <p>{formData.billingAddress.address}</p>
              <p>{formData.billingAddress.city}, {formData.billingAddress.postalCode}</p>
              <p>{country.name}</p>
            </div>
          </div>
        )}
  
        {/* Order Details */}
        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-3">Order Summary</h3>
          
          {/* 4x6 Photos */}
          {quantities['4x6'] > 0 && (
            <div className="flex justify-between py-2">
              <span>4x6" Photos ({quantities['4x6']} × {country.size4x6.toFixed(2)} {country.currency})</span>
              <span>{subtotalsBySize['4x6'].toFixed(2)} {country.currency}</span>
            </div>
          )}
          
          {/* 5x7 Photos */}
          {quantities['5x7'] > 0 && (
            <div className="flex justify-between py-2">
              <span>5x7" Photos ({quantities['5x7']} × {country.size5x7.toFixed(2)} {country.currency})</span>
              <span>{subtotalsBySize['5x7'].toFixed(2)} {country.currency}</span>
            </div>
          )}
          
          {/* Subtotal */}
          <div className="flex justify-between py-2 border-t">
            <span>Subtotal</span>
            <span>{subtotal.toFixed(2)} {country.currency}</span>
          </div>
  
          {/* Shipping Fee */}
          <div className="flex justify-between py-2">
            <span>Shipping Fee</span>
            <span>{shippingFee.toFixed(2)} {country.currency}</span>
          </div>
          
          {/* Total */}
          <div className="flex justify-between py-2 border-t font-bold">
            <span>Total</span>
            <span>{total.toFixed(2)} {country.currency}</span>
          </div>
        </div>
  
        {/* Additional Information */}
        <div className="text-sm text-gray-600">
          <p>* Prices shown in {country.currency}</p>
          {selectedCountry === 'TUN' && (
            <p>* Prices converted at rate: 1 CAD = 2.25 TND</p>
          )}
        </div>
      </div>
    );
  };
  

  // Payment Section with Stripe
  const renderPayment = () => {
    if (selectedCountry === 'TUN') {
      return (
        <div className="p-4 border rounded">
          <p className="text-lg font-medium">Cash on Delivery</p>
          <p className="text-gray-600">Payment will be collected upon delivery</p>
        </div>
      );
    }

    return (
      <Elements stripe={stripePromise}>
        <PaymentForm onPaymentSuccess={() => setOrderSuccess(true)} />
      </Elements>
    );
  };

  // Modified shipping/billing address form with disabled country
  const AddressForm = ({ type, data, onChange }) => (
    <div className="grid grid-cols-2 gap-4">
      <input
        placeholder="First Name"
        value={data.firstName}
        onChange={(e) => onChange({ ...data, firstName: e.target.value })}
        className="p-2 border rounded"
      />
      <input
        placeholder="Last Name"
        value={data.lastName}
        onChange={(e) => onChange({ ...data, lastName: e.target.value })}
        className="p-2 border rounded"
      />
      <input
        placeholder="Address"
        value={data.address}
        onChange={(e) => onChange({ ...data, address: e.target.value })}
        className="col-span-2 p-2 border rounded"
      />
      <input
        placeholder="City"
        value={data.city}
        onChange={(e) => onChange({ ...data, city: e.target.value })}
        className="p-2 border rounded"
      />
      <input
        placeholder="Postal Code"
        value={data.postalCode}
        onChange={(e) => onChange({ ...data, postalCode: e.target.value })}
        className="p-2 border rounded"
      />
      <input
        value={initialCountries.find(c => c.value === selectedCountry)?.name}
        disabled
        className="col-span-2 p-2 border rounded bg-gray-100"
      />
    </div>
  );

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    const newPhotos = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: URL.createObjectURL(file),
      size: '4x6',
      quantity: 1
    }));
    setSelectedPhotos([...selectedPhotos, ...newPhotos]);
  };

  const removePhoto = (photoId) => {
    setSelectedPhotos(selectedPhotos.filter(photo => photo.id !== photoId));
  };

  const updatePhotoSize = (photoId, newSize) => {
    setSelectedPhotos(selectedPhotos.map(photo =>
      photo.id === photoId ? { ...photo, size: newSize } : photo
    ));
  };

  const updatePhotoQuantity = (photoId, newQuantity) => {
    if (newQuantity > 0 && newQuantity <= 99) {
      setSelectedPhotos(selectedPhotos.map(photo =>
        photo.id === photoId ? { ...photo, quantity: newQuantity } : photo
      ));
    }
  };

  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
    setShowIntro(false);
  };

  const validateStep = () => {
    switch (activeStep) {
      case 0:
        return selectedPhotos.length > 0;
      case 1:
        return formData.email && 
               formData.shippingAddress.firstName && 
               formData.shippingAddress.lastName && 
               formData.shippingAddress.address && 
               formData.shippingAddress.city && 
               formData.shippingAddress.postalCode;
      case 2:
        return true; // Payment validation handled by Stripe
      default:
        return false;
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-medium">Select Photos</h2>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-400 text-black rounded hover:bg-yellow-500"
              >
                <Upload size={20} />
                Add Photos
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                multiple
                accept="image/*"
                className="hidden"
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {selectedPhotos.map(photo => (
                <div key={photo.id} className="relative border rounded-lg p-2">
                  <img
                    src={photo.preview}
                    alt="preview"
                    className="w-full h-40 object-cover rounded"
                  />
                  <button
                    onClick={() => removePhoto(photo.id)}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full"
                  >
                    <X size={16} />
                  </button>
                  <div className="mt-2 space-y-2">
                    <select
                      value={photo.size}
                      onChange={(e) => updatePhotoSize(photo.id, e.target.value)}
                      className="w-full p-1 border rounded"
                    >
                        <option value="" disabled>
Size    </option>
                      <option value="4x6">4x6"</option>
                      <option value="5x7">5x7"</option>
                    </select>
                    <div className="space-y-2">
  <select
    value={photo.quantity}
    onChange={(e) => updatePhotoQuantity(photo.id, parseInt(e.target.value))}
    className="w-full p-1 border rounded"
  >
    <option value="" disabled>
      Quantity
    </option>
    {[...Array(100).keys()].map(num => (
      <option key={num + 1} value={num + 1}>{num + 1}</option>
    ))}
  </select>
</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-xl font-medium">Contact Information</h2>
              <input
                type="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-2 border rounded"
              />
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-medium">Shipping Address</h2>
              <AddressForm
                type="shipping"
                data={formData.shippingAddress}
                onChange={(newAddress) => setFormData({
                  ...formData,
                  shippingAddress: newAddress,
                  billingAddress: isBillingAddressSameAsShipping ? newAddress : formData.billingAddress
                })}
              />
            </div>

            {formData.paymentMethod !== 'cod' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isBillingAddressSameAsShipping}
                    onChange={(e) => setIsBillingAddressSameAsShipping(e.target.checked)}
                    id="sameAddress"
                  />
                  <label htmlFor="sameAddress">Billing address same as shipping</label>
                </div>

                {!isBillingAddressSameAsShipping && (
                  <>
                    <h2 className="text-xl font-medium">Billing Address</h2>
                    <AddressForm
                      type="billing"
                      data={formData.billingAddress}
                      onChange={(newAddress) => setFormData({
                        ...formData,
                        billingAddress: newAddress
                      })}
                    />
                  </>
                )}
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-medium">Review & Payment</h2>
            {renderInvoice()}
            {renderPayment()}
          </div>
        );

      default:
        return null;
    }
  };

  // Render intro screen or main application
  if (showIntro) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-xl w-full mx-4">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="text-center p-8 space-y-6">
              {/* Logo Section */}
              <div className="flex justify-center mb-6">
                <div className="text-4xl font-bold tracking-tight">
                  <span className="text-black">freeze</span>
                  <span className="text-yellow-400">PIX</span>
                </div>
              </div>
              <div className="text-sm italic text-gray-600 mb-8">
                the photography company
              </div>
              
              <div className="space-y-6 max-w-md mx-auto">
                <h2 className="text-2xl font-semibold text-gray-800">
                  Transform Your Digital Memories Into Beautiful Prints
                </h2>
                
                <p className="text-gray-600">
                  Get high-quality prints delivered straight to your door. Easy ordering, fast delivery, and stunning results.
                </p>
      
                <div className="flex justify-center space-x-4 py-4">
                  <div className="text-center">
                    <Camera className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
                    <div className="text-sm text-gray-600">Choose Photos</div>
                  </div>
                  <div className="text-center">
                    <Package className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
                    <div className="text-sm text-gray-600">Select Sizes</div>
                  </div>
                  <div className="text-center">
                    <ShoppingCart className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
                    <div className="text-sm text-gray-600">Quick Checkout</div>
                  </div>
                </div>
                
                <div className="text-center">
                  <p className="text-gray-600 mt-2">Choose your shipping country to continue</p>
                </div>
                
                <div className="space-y-2">
                  {initialCountries.map(country => (
                    <button
                      key={country.value}
                      onClick={() => handleCountrySelect(country.value)}
                      className="w-full p-4 text-left border rounded-lg hover:bg-gray-50"
                    >
                      <div className="font-medium">{country.name}</div>
                      
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main application layout
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          {/* Stepper */}
          <div className="flex items-center justify-between mb-8">
            {['Upload Photos', 'Shipping Details', 'Payment'].map((step, index) => (
              <div key={step} className="flex items-center">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center
                  ${activeStep >= index ? 'bg-yellow-400' : 'bg-gray-200'}
                `}>
                  {index === 0 && <Camera size={16} />}
                  {index === 1 && <Package size={16} />}
                  {index === 2 && <ShoppingCart size={16} />}
                </div>
                {index < 2 && (
                  <div className={`h-1 w-full ${activeStep > index ? 'bg-yellow-400' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>

          {/* Step Content */}
          {renderStepContent()}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
         <button
              onClick={handleBack}
              className="px-6 py-2 rounded bg-gray-100 hover:bg-gray-200"
            >
              {activeStep === 0 ? 'Home' : 'Back'}
            </button>
            {selectedCountry === 'TUN' ? (
  <button
    onClick={handleNext}
    disabled={!validateStep()}
    className={`px-6 py-2 rounded ${
      validateStep()
        ? 'bg-yellow-400 hover:bg-yellow-500'
        : 'bg-gray-200 cursor-not-allowed'
    }`}
  >
    {activeStep === 2 ? 'Place Order' : 'Next'}
  </button>
) : activeStep < 2 ? (
  <button
    onClick={() => setActiveStep(prev => prev + 1)}
    disabled={!validateStep()}
    className={`px-6 py-2 rounded ${
      validateStep()
        ? 'bg-yellow-400 hover:bg-yellow-500'
        : 'bg-gray-200 cursor-not-allowed'
    }`}
  >
    Next
  </button>
) : null}
          </div>
        </div>
      </div>
    </div>
    
  );
};

export default FreezePIX;