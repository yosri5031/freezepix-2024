import React from 'react';
import { memo, useState, useRef, useCallback, useEffect } from 'react';
import { Upload, ShoppingCart, Package, Camera, X , Loader } from 'lucide-react';
import { loadStripe } from "@stripe/stripe-js";
//import { sendOrderConfirmation } from './utils/emailService';
import {
  CardElement,
  Elements,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

const stripePromise = loadStripe('pk_test_51QHmgQRvhgQx4g20FEvJ97UMmtc7QcW4yGdmbDN49M75MnwQBb5ZO408FI6Tq1w9NKuWr6yQoMDBqS5FrIEEfdlr00swKtIShp');

const initialCountries = [
    { name: 'United States', value: 'USA', currency: 'USD', rate: 1, size4x6: 0.39, size5x7: 1.49, crystal3d: 140,keychain: 9.99,
      keyring_magnet: 9.99 },
    { name: 'Canada', value: 'CAN', currency: 'CAD', rate: 1, size4x6: 0.39, size5x7: 1.49, crystal3d: 140,keychain: 9.99,
      keyring_magnet: 9.99 },
    { name: 'Tunisia', value: 'TUN', currency: 'TND', rate: 1, size10x15: 3, size15x22: 5,keychain: 15,
      keyring_magnet: 15 }
];

const TAX_RATES = {
  'TN': { // Tunisia
    default: 19.0 // 19% TVA
  },
  'CA': { // Canada
    'British Columbia': { GST: 5.0, PST: 7.0 },
    'Alberta': { GST: 5.0 },
    'New Brunswick': { HST: 15.0 },
    'Newfoundland and Labrador': { HST: 15.0 },
    'Northwest Territories': { GST: 5.0 },
    'Nova Scotia': { HST: 15.0 },
    'Nunavut': { GST: 5.0 },
    'Prince Edward Island': { HST: 15.0 },
    'Quebec': { GST: 5.0, QST: 9.975 },
    'Saskatchewan': { GST: 5.0, PST: 6.0 },
    'Yukon': { GST: 5.0 },
    'Ontario': { HST: 13.0 }
  }
};

// Add these arrays for US states and Canadian provinces
const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 
  'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 
  'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 
  'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 
  'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 
  'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 
  'Wisconsin', 'Wyoming'
];

const CANADIAN_PROVINCES = [
  'Alberta', 'British Columbia', 'Manitoba', 'New Brunswick', 'Newfoundland and Labrador',
  'Northwest Territories', 'Nova Scotia', 'Nunavut', 'Ontario', 'Prince Edward Island',
  'Quebec', 'Saskatchewan', 'Yukon'
];

const BookingPopup = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="relative bg-white rounded-lg w-[95%] max-w-xl h-[90vh] max-h-[600px] m-auto">
        <button 
          onClick={onClose}
          className="absolute top-2 right-2 p-2 hover:bg-gray-100 rounded-full z-10 bg-white shadow-md"
          aria-label="Close"
        >
          <X size={24} />
        </button>
        
        <iframe
          src="https://freezepix.setmore.com/"
          title="Book Photography Service"
          className="w-full h-full rounded-lg"
          style={{ maxWidth: '100%', maxHeight: '100%' }}
        />
      </div>
    </div>
  );
};

  // 1. Fix for country visibility in AddressForm component
  const AddressForm = ({ type, data, onChange }) => {
    const handleInputChange = (field) => (e) => {
      const newValue = e.target.value;
      const caretPosition = e.target.selectionStart;
      const scrollPosition = e.target.scrollTop;
    
      onChange({
        ...data,
        [field]: newValue
      });
    
      setTimeout(() => {
        e.target.selectionStart = caretPosition;
        e.target.selectionEnd = caretPosition;
        e.target.scrollTop = scrollPosition;
      }, 0);
    };
  
    return (
      <div className="grid grid-cols-2 gap-4">
        <input
          type="text"
          inputMode="text"
          placeholder="First Name"
          value={data.firstName || ''}
          onChange={handleInputChange('firstName')}
          className="p-2 border rounded"
        />
        <input
          type="text"
          inputMode="text"
          placeholder="Last Name"
          value={data.lastName || ''}
          onChange={handleInputChange('lastName')}
          className="p-2 border rounded"
        />
        <input
          type="text"
          inputMode="text"
          placeholder="Address"
          value={data.address || ''}
          onChange={handleInputChange('address')}
          className="col-span-2 p-2 border rounded"
        />
        <input
          type="text"
          inputMode="text"
          placeholder="City"
          value={data.city || ''}
          onChange={handleInputChange('city')}
          className="p-2 border rounded"
        />
        
        {/* Fix for state/province visibility */}
        {data.country === 'USA' && (
        <select
          value={data.state || ''}
          onChange={handleInputChange('state')}
          className="p-2 border rounded"
        >
          <option value="">Select State</option>
          {US_STATES.map(state => (
            <option key={state} value={state}>{state}</option>
          ))}
        </select>
      )}
      
      {data.country === 'CAN' && (
        <select
          value={data.province || ''}
          onChange={handleInputChange('province')}
          className="p-2 border rounded"
        >
          <option value="">Select Province</option>
          {CANADIAN_PROVINCES.map(province => (
            <option key={province} value={province}>{province}</option>
          ))}
        </select>
      )}
        
        {/* Fix for postal code input */}
        <input
          type="text"
          inputMode="text"
          placeholder={data.country === 'USA' ? "ZIP Code" : "Postal Code"}
          value={data.postalCode || ''}
          onChange={handleInputChange('postalCode')}
          className="p-2 border rounded"
        />
        
        {/* Fix for country visibility */}
        <div className="col-span-2 p-2 border rounded bg-gray-100">
          {initialCountries.find(c => c.value === data.country)?.name || 'Country not selected'}
        </div>
      </div>
    );
  };
  
const FreezePIX = () => {
 

    const [showIntro, setShowIntro] = useState(true);
    const [selectedCountry, setSelectedCountry] = useState('');
    const [selectedPhotos, setSelectedPhotos] = useState([]); // Correct
    const [activeStep, setActiveStep] = useState(0);
    const [orderSuccess, setOrderSuccess] = useState(false);
    const [isBillingAddressSameAsShipping, setIsBillingAddressSameAsShipping] = useState(true);
    const [isProcessingOrder, setIsProcessingOrder] = useState(false);
    const [showBookingPopup, setShowBookingPopup] = useState(false);
    const fileInputRef = useRef(null);
  
    const [discountCode, setDiscountCode] = useState('');
    const [discountError, setDiscountError] = useState('');
    const [orderNote, setOrderNote] = useState('');
    const [showPolicyPopup, setShowPolicyPopup] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        phone: '',
        shippingAddress: {
          firstName: '',
          lastName: '',
          address: '',
          city: '',
          postalCode: '',
          country: selectedCountry, // Initialize with selected country
          province: '',
          state: '',
        },
        billingAddress: {
          firstName: '',
          lastName: '',
          address: '',
          city: '',
          postalCode: '',
          country: selectedCountry, // Initialize with selected country
          province: '',
          state: '',
        },
        paymentMethod: selectedCountry === 'TUN' ? 'cod' : 'credit'
      });
      
     

      const updateStandardSize = (photoId, standardSize) => {
        setSelectedPhotos(prevPhotos => 
          prevPhotos.map(photo => 
            photo.id === photoId 
              ? { ...photo, standardSize } 
              : photo
          )
        );
      };
      const generateOrderNumber = () => {
        const timestamp = Date.now().toString();
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `FPX-${timestamp.slice(-6)}${random}`;
      };

     const calculateItemPrice = (photo, country) => {
  if (photo.productType === 'photo_print') {
    switch (photo.size) {
      case '4x6': return country.size4x6;
      case '5x7': return country.size5x7;
      case '10x15': return country.size10x15;
      case '15x22': return country.size15x22;
      default: return 0;
    }
  } else if (photo.productType === '3d_frame') {
    return country.crystal3d; // Assuming same pricing as 3D crystal
  } else if (['keychain', 'keyring_magnet'].includes(photo.productType)) {
    return country.value === 'TUN' ? 15 : 9.99;
  }
  return 0;
};
    // Inside the FreezePIX component, modify the order success handling:
    const handleOrderSuccess = async (stripePaymentMethod = null) => {
      try {
        setIsProcessingOrder(true);
        setOrderSuccess(false);
        const orderNumber = generateOrderNumber();
        const { total, currency } = calculateTotals();
        const country = initialCountries.find(c => c.value === selectedCountry);
    
        const photosWithPrices = (selectedPhotos || []).map(photo => ({
          ...photo,
          price: calculateItemPrice(photo, country),
          currency: country.currency
        }));
    
        const orderData = {
          orderNumber,
          email: formData.email,
          phone: formData.phone,
          shippingAddress: formData.shippingAddress,
          billingAddress: isBillingAddressSameAsShipping ? formData.shippingAddress : formData.billingAddress,
          orderItems: photosWithPrices,
          totalAmount: total,
          currency: country.currency,
          orderNote,
          paymentMethod: selectedCountry === 'TUN' ? 'cod' : 'credit',
          stripePaymentId: stripePaymentMethod
        };
    
        // Create the order on the server
        const response = await fetch('https://freezepix-database-server-c95d4dd2046d.herokuapp.com/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(orderData)
        });
    
        if (!response.ok) {
          throw new Error('Failed to create order');
        }
    
        const createdOrder = await response.json();
    
        // Send order confirmation email
        await fetch('https://freezepix-email-service-80156ac7d026.herokuapp.com/send-order-confirmation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(createdOrder)
        });
    
        // Send order notification email to admin
        await sendOrderNotification(createdOrder);
    
        setOrderSuccess(true);
      } catch (error) {
        console.error('Order processing failed:', error);
        setOrderSuccess(false);
      } finally {
        setIsProcessingOrder(false);
      }
    };


    const PaymentForm = ({ onPaymentSuccess }) => {
      const stripe = useStripe();
      const elements = useElements();
      const [isProcessing, setIsProcessing] = useState(false);
      const [error, setError] = useState(null);
      
      const handleSubmit = async (event) => {
        event.preventDefault();
        
        if (!stripe || !elements) {
          return;
        }
        
        setIsProcessing(true);
        setError(null);
        
        try {
          const { error, paymentMethod } = await stripe.createPaymentMethod({
            type: 'card',
            card: elements.getElement(CardElement),
          });
          
          if (error) {
            setError('Payment processing failed. Please try again.');
            return;
          }
          
          await onPaymentSuccess(paymentMethod?.id);
        } catch (err) {
          setError('Payment processing failed. Please try again.');
        } finally {
          setIsProcessing(false);
        }
      };
      
      return (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-4 border rounded">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': {
                      color: '#aab7c4',
                    },
                  },
                  invalid: {
                    color: '#9e2146',
                  },
                },
              }}
            />
          </div>
          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}
          <button
            type="submit"
            disabled={!stripe || isProcessing}
            className="w-full py-2 bg-yellow-400 text-black rounded hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <span className="flex items-center justify-center gap-2">
                <Loader className="animate-spin" size={16} />
                Processing Payment...
              </span>
            ) : (
              'Pay Now'
            )}
          </button>
        </form>
      );
    };
  

      const validateDiscountCode = (code) => {
        const totalItems = selectedPhotos.reduce((sum, photo) => sum + photo.quantity, 0);
        const validCodes = ['B2B', 'MOHAMED'];
        const upperCode = code.toUpperCase();
        
        if (code && !validCodes.includes(upperCode)) {
          setDiscountError('Invalid discount code');
          return false;
        } //else if (totalItems < 10) {
          //setDiscountError('Minimum 10 items required for discount');
          //return false;
        //} 
        else {
          setDiscountError('');
          return true;
        }
      };
    
      const handleDiscountCode = (value) => {
        setDiscountCode(value);
        if (value) {
          validateDiscountCode(value);
        } else {
          setDiscountError('');
        }
      };
    
      const handleBack = () => {
        if (activeStep === 0) {
          setShowIntro(true);
        } else {
          setActiveStep(prev => prev - 1);
        }
      };
    
      const handleNext = async () => {
        if (activeStep === 2) {
          if (selectedCountry === 'TUN') {
            // For Tunisia COD orders, directly call handleOrderSuccess
            await handleOrderSuccess();
          }
          // For other countries, the PaymentForm component will handle the order submission
        } else {
          setActiveStep(prev => prev + 1);
        }
      };
  
      const handleFileChange = (event) => {
        const files = Array.from(event.target.files);
        const newPhotos = files.map(file => ({
          id: Math.random().toString(36).substr(2, 9),
          file,
          preview: URL.createObjectURL(file),
          productType: 'photo_print',
          size: selectedCountry === 'TUN' ? '10x15' : '4x6',
          crystalShape: null,
          quantity: 1
        }));
        setSelectedPhotos(prevPhotos => [...(prevPhotos || []), ...newPhotos]);
      };

  const updateProductType = (photoId, newType) => {
    setSelectedPhotos((selectedPhotos || []).map(photo =>
      photo.id === photoId ? {
        ...photo,
        productType: newType,
        size: newType === 'photo_print' ? (selectedCountry === 'TUN' ? '10x15' : '4x6') : null,
        crystalShape: newType === '3d_crystal' ? 'rectangle' : null
      } : photo
    ));
  };

  const updateCrystalShape = (photoId, newShape) => {
    setSelectedPhotos((selectedPhotos || []).map(photo =>
      photo.id === photoId ? { ...photo, crystalShape: newShape } : photo
    ));
  };

  const calculateTotals = () => {
    const country = initialCountries.find(c => c.value === selectedCountry);
    const quantities = {
      '4x6': 0,
      '5x7': 0,
      '10x15': 0,
      '15x22': 0,
      '3d_frame': 0,
      'keychain': 0,
      'keyring_magnet': 0
    };
  
    const subtotalsBySize = {
      '4x6': 0,
      '5x7': 0,
      '10x15': 0,
      '15x22': 0,
      '3d_frame': 0,
      'keychain': 0,
      'keyring_magnet': 0
    };
  
    // Count quantities and calculate subtotals for each size/product
    selectedPhotos.forEach(photo => {
      if (photo.productType === 'photo_print') {
        quantities[photo.size] += photo.quantity || 1;
        if (selectedCountry === 'TUN') {
          if (photo.size === '10x15') {
            subtotalsBySize[photo.size] += (photo.quantity || 1) * country.size10x15;
          } else if (photo.size === '15x22') {
            subtotalsBySize[photo.size] += (photo.quantity || 1) * country.size15x22;
          }
        } else {
          if (photo.size === '4x6') {
            subtotalsBySize[photo.size] += (photo.quantity || 1) * country.size4x6;
          } else if (photo.size === '5x7') {
            subtotalsBySize[photo.size] += (photo.quantity || 1) * country.size5x7;
          }
        }
      } else if (photo.productType === '3d_frame') {
        quantities['3d_frame'] += photo.quantity || 1;
        subtotalsBySize['3d_frame'] += (photo.quantity || 1) * country.crystal3d;
      } else if (photo.productType === 'keychain') {
        quantities['keychain'] += photo.quantity || 1;
        subtotalsBySize['keychain'] += (photo.quantity || 1) * country.keychain;
      } else if (photo.productType === 'keyring_magnet') {
        quantities['keyring_magnet'] += photo.quantity || 1;
        subtotalsBySize['keyring_magnet'] += (photo.quantity || 1) * country.keyring_magnet;
      }
    });
  
    // Calculate subtotal
    const subtotal = Object.values(subtotalsBySize).reduce((acc, curr) => acc + curr, 0);
  
    // Calculate shipping fee based on country
    let shippingFee = 0;
    if (selectedCountry === 'TUN') {
      shippingFee = 8; // 8 TND for Tunisia
    } else if (selectedCountry === 'USA') {
      shippingFee = subtotal >= 35 ? 0 : 4.99; // Free shipping over $35, otherwise $4.99
    } else if (selectedCountry === 'CAN') {
      shippingFee = subtotal >= 35 ? 0 : 4.99; // Free shipping over $35, otherwise $4.99
    }
  
    // Calculate discount if applicable
    const discount = (discountCode.toUpperCase() === 'B2B' || discountCode.toUpperCase() === 'MOHAMED') ? subtotal * 0.5 : 0;
    // Calculate tax based on location
    let taxAmount = 0;
    if (selectedCountry === 'TUN') {
      // 19% TVA for Tunisia
      taxAmount = subtotal * 0.19;
    } else if (selectedCountry === 'CAN') {
      const province = formData.shippingAddress.province;
      const provinceTaxes = TAX_RATES['CA'][province];
      
      if (provinceTaxes) {
        if (provinceTaxes.HST) {
          taxAmount = subtotal * (provinceTaxes.HST / 100);
        } else {
          // Calculate GST
          if (provinceTaxes.GST) {
            taxAmount += subtotal * (provinceTaxes.GST / 100);
          }
          // Calculate PST or QST
          if (provinceTaxes.PST) {
            taxAmount += subtotal * (provinceTaxes.PST / 100);
          }
          if (provinceTaxes.QST) {
            taxAmount += subtotal * (provinceTaxes.QST / 100);
          }
        }
      }
    }
    // Calculate total
    const total = subtotal + shippingFee + taxAmount - discount;
  
    return {
      subtotalsBySize,
      subtotal,
      taxAmount,
      shippingFee,
      total,
      quantities,
      discount
    };
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
  {(selectedPhotos || []).map(photo => (
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
        {/* Product Type Selection for US/Canada */}
        {(['USA', 'CAN'].includes(selectedCountry)) && (
          <select
            value={photo.productType}
            onChange={(e) => updateProductType(photo.id, e.target.value)}
            className="w-full p-1 border rounded"
          >
            <option value="photo_print">Photo Print</option>
            <option value="3d_frame">3D Frame</option>
            <option value="keychain">Keychain</option>
            <option value="keyring_magnet">Keyring and Magnet</option>
          </select>
        )}

        {/* Product Type Selection for Tunisia */}
        {selectedCountry === 'TUN' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product
            </label>
          <select
            value={photo.productType}
            onChange={(e) => updateProductType(photo.id, e.target.value)}
            className="w-full p-1 border rounded"
          >
            <option value="photo_print">Photo Print</option>
            <option value="keyring_magnet">Keyring and Magnet</option>
            <option value="keychain">Keychain</option>
          </select>
          </div>
        )}

        {/* Size selection for photo prints */}
        {photo.productType === 'photo_print' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Size
            </label>
          <select
            value={photo.size}
            onChange={(e) => updatePhotoSize(photo.id, e.target.value)}
            className="w-full p-1 border rounded"
          >
            {selectedCountry === 'TUN' ? (
              <>
                <option value="10x15">10x15 cm</option>
                <option value="15x22">15x22 cm</option>
              </>
            ) : (
              <>
                <option value="4x6">4x6"</option>
                <option value="5x7">5x7"</option>
              </>
            )}
          </select>
          </div>
        )}

        {/* Crystal shape selection for 3D frame */}
        {photo.productType === '3d_frame' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Shape
            </label>
          <select
            value={photo.crystalShape}
            onChange={(e) => updateCrystalShape(photo.id, e.target.value)}
            className="w-full p-1 border rounded"
          >
            <option value="rectangle">Rectangle</option>
            <option value="heart">Heart</option>
          </select>
          </div>
        )}

        {/* Standard Size selection for Keychain and Keyring & Magnet */}
        {(['keychain', 'keyring_magnet'].includes(photo.productType)) && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Size
            </label>
            <select
              value={photo.standardSize || 'standard'}
              onChange={(e) => updateStandardSize(photo.id, e.target.value)}
              className="w-full p-1 border rounded"
            >
              <option value="standard">Standard</option>
            </select>
          </div>
        )}

        {/* Quantity selection */}
        <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantity
            </label>
        <select
          value={photo.quantity}
          onChange={(e) => updatePhotoQuantity(photo.id, parseInt(e.target.value))}
          className="w-full p-1 border rounded"
        >
          {[...Array(99)].map((_, i) => (
            <option key={i + 1} value={i + 1}>{i + 1}</option>
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
            <input
              type="tel"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full p-2 border rounded"
            />
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-medium">Shipping Address</h2>
            <AddressForm
              type="shipping"
              data={{
                ...formData.shippingAddress,
                country: selectedCountry // Ensure country is passed
              }}
              onChange={(newAddress) => setFormData(prevData => ({
                ...prevData,
                shippingAddress: newAddress,
                billingAddress: isBillingAddressSameAsShipping ? newAddress : prevData.billingAddress
              }))}
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
                  className="rounded border-gray-300"
                />
                <label htmlFor="sameAddress" className="text-sm">
                  Billing address same as shipping
                </label>
              </div>

              {!isBillingAddressSameAsShipping && (
                <>
                  <h2 className="text-xl font-medium">Billing Address</h2>
                  <AddressForm
                    type="billing"
                    data={{
                      ...formData.billingAddress,
                      country: selectedCountry // Ensure country is passed
                    }}
                    onChange={(newAddress) => setFormData(prevData => ({
                      ...prevData,
                      billingAddress: newAddress
                    }))}
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
  
          {selectedCountry === 'TUN' ? (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-center text-gray-600">
                  Your order will be processed as Cash on Delivery (COD)
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-center text-gray-600">
                  Please complete your payment to place the order
                </p>
              </div>
              <Elements stripe={stripePromise}>
                <PaymentForm onPaymentSuccess={handleOrderSuccess} />
              </Elements>
            </div>
          )}
        </div>
      );

    default:
      return null;
    }
  };

  const renderInvoice = () => {
    const { subtotalsBySize, subtotal, shippingFee, total, quantities, discount } = calculateTotals();
    const country = initialCountries.find(c => c.value === selectedCountry);
    
    return (
      <div className="space-y-6">
        
  
        {/* Contact Information */}
        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-3">Contact Information</h3>
          <p className="text-gray-600">{formData.email}</p>
          <p className="text-gray-600">{formData.phone}</p>
        </div>
  
        {/* Shipping Address */}
        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-3">Shipping Address</h3>
          <div className="text-gray-600">
            <p>{formData.shippingAddress.firstName} {formData.shippingAddress.lastName}</p>
            <p>{formData.shippingAddress.address}</p>
            <p>{formData.shippingAddress.city}, {formData.shippingAddress.postalCode}</p>
            {formData.shippingAddress.state && <p>{formData.shippingAddress.state}</p>}
            {formData.shippingAddress.province && <p>{formData.shippingAddress.province}</p>}
            <p>{country?.name}</p>
          </div>
        </div>
  
        {/* Billing Address (if different from shipping) */}
        {!isBillingAddressSameAsShipping && formData.paymentMethod !== 'cod' && (
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-3">Billing Address</h3>
            <div className="text-gray-600">
              <p>{formData.billingAddress.firstName} {formData.billingAddress.lastName}</p>
              <p>{formData.billingAddress.address}</p>
              <p>{formData.billingAddress.city}, {formData.billingAddress.postalCode}</p>
              {formData.billingAddress.state && <p>{formData.billingAddress.state}</p>}
              {formData.billingAddress.province && <p>{formData.billingAddress.province}</p>}
              <p>{country?.name}</p>
            </div>
          </div>
        )}
   {/* Discount Code Section */}
   <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-3">Discount Code</h3>
          <div className="space-y-2">
            <input
  type="text"
  placeholder="Enter discount code"
  value={discountCode}
  onChange={(e) => handleDiscountCode(e.target.value.toUpperCase())} // Convert input to uppercase
  className={`w-full p-2 border rounded ${discountError ? 'border-red-500' : ''}`}
/>
            {discountError && (
              <p className="text-red-500 text-sm">{discountError}</p>
            )}
          </div>
        </div>
        
      {/* Order Summary */}
<div className="border rounded-lg p-4">
  <h3 className="font-medium mb-3">Order Summary</h3>
  
  {/* Photo Prints */}
  {selectedCountry === 'TUN' ? (
    <>
      {quantities['10x15'] > 0 && (
        <div className="flex justify-between py-2">
          <span>10x15 cm Photos ({quantities['10x15']} × {country?.size10x15.toFixed(2)} {country?.currency})</span>
          <span>{subtotalsBySize['10x15'].toFixed(2)} {country?.currency}</span>
        </div>
      )}
      {quantities['15x22'] > 0 && (
        <div className="flex justify-between py-2">
          <span>15x22 cm Photos ({quantities['15x22']} × {country?.size15x22.toFixed(2)} {country?.currency})</span>
          <span>{subtotalsBySize['15x22'].toFixed(2)} {country?.currency}</span>
        </div>
      )}
    </>
  ) : (
    <>
      {quantities['4x6'] > 0 && (
        <div className="flex justify-between py-2">
          <span>4x6" Photos ({quantities['4x6']} × {country?.size4x6.toFixed(2)} {country?.currency})</span>
          <span>{subtotalsBySize['4x6'].toFixed(2)} {country?.currency}</span>
        </div>
      )}
      {quantities['5x7'] > 0 && (
        <div className="flex justify-between py-2">
          <span>5x7" Photos ({quantities['5x7']} × {country?.size5x7.toFixed(2)} {country?.currency})</span>
          <span>{subtotalsBySize['5x7'].toFixed(2)} {country?.currency}</span>
        </div>
      )}
    </>
  )}

  {/* 3D Frame Items */}
  {quantities['3d_frame'] > 0 && (
    <div className="flex justify-between py-2">
      <span>3D Crystal Frame ({quantities['3d_frame']} × {country?.crystal3d.toFixed(2)} {country?.currency})</span>
      <span>{(quantities['3d_frame'] * country?.crystal3d).toFixed(2)} {country?.currency}</span>
    </div>
  )}

  {/* Keychain Items */}
  {quantities['keychain'] > 0 && (
    <div className="flex justify-between py-2">
      <span>Keychains ({quantities['keychain']} × {country?.keychain.toFixed(2)} {country?.currency})</span>
      <span>{(quantities['keychain'] * country?.keychain).toFixed(2)} {country?.currency}</span>
    </div>
  )}

  {/* Keyring/Magnet Items */}
  {quantities['keyring_magnet'] > 0 && (
    <div className="flex justify-between py-2">
      <span>Keyring/Magnets ({quantities['keyring_magnet']} × {country?.keyring_magnet.toFixed(2)} {country?.currency})</span>
      <span>{(quantities['keyring_magnet'] * country?.keyring_magnet).toFixed(2)} {country?.currency}</span>
    </div>
  )}

  {/* Calculations and Summary */}
  {(() => {
    // Calculate tax amount
    let taxAmount = 0;
    
    if (selectedCountry === 'TUN') {
      taxAmount = subtotal * 0.19;
    } else if (selectedCountry === 'CAN' && formData.shippingAddress.province) {
      const provinceTaxes = TAX_RATES['CA'][formData.shippingAddress.province];
      if (provinceTaxes) {
        if (provinceTaxes.HST) {
          taxAmount = subtotal * (provinceTaxes.HST / 100);
        } else {
          if (provinceTaxes.GST) taxAmount += subtotal * (provinceTaxes.GST / 100);
          if (provinceTaxes.PST) taxAmount += subtotal * (provinceTaxes.PST / 100);
          if (provinceTaxes.QST) taxAmount += subtotal * (provinceTaxes.QST / 100);
        }
      }
    }

    // Calculate final total
    const finalTotal = subtotal + shippingFee + taxAmount - discount;

    return (
      <>
        {/* Subtotal */}
        <div className="flex justify-between py-2 border-t">
          <span>Subtotal</span>
          <span>{subtotal.toFixed(2)} {country?.currency}</span>
        </div>

        {/* Shipping Fee */}
        <div className="flex justify-between py-2">
          <span>Shipping Fee</span>
          <span>{shippingFee.toFixed(2)} {country?.currency}</span>
        </div>

        {/* Tax for Tunisia */}
        {selectedCountry === 'TUN' && (
          <div className="flex justify-between py-2">
            <span>TVA (19%)</span>
            <span>{taxAmount.toFixed(2)} {country?.currency}</span>
          </div>
        )}

        {/* Tax for Canada */}
        {selectedCountry === 'CAN' && formData.shippingAddress.province && (
          <div className="flex justify-between py-2">
            <div className="flex flex-col">
              <span>Tax</span>
              <span className="text-sm text-gray-600">
                {(() => {
                  const provinceTaxes = TAX_RATES['CA'][formData.shippingAddress.province];
                  if (provinceTaxes) {
                    if (provinceTaxes.HST) {
                      return `HST (${provinceTaxes.HST}%)`;
                    }
                    return [
                      provinceTaxes.GST && `GST (${provinceTaxes.GST}%)`,
                      provinceTaxes.PST && `PST (${provinceTaxes.PST}%)`,
                      provinceTaxes.QST && `QST (${provinceTaxes.QST}%)`
                    ].filter(Boolean).join(' + ');
                  }
                  return '';
                })()}
              </span>
            </div>
            <span>{taxAmount.toFixed(2)} {country?.currency}</span>
          </div>
        )}

        {/* Discount */}
        {discount > 0 && (
          <div className="flex justify-between py-2 text-green-600">
            <span>Discount (50%)</span>
            <span>-{discount.toFixed(2)} {country?.currency}</span>
          </div>
        )}

        {/* Final Total */}
        <div className="flex justify-between py-2 border-t font-bold">
          <span>Total</span>
          <span>{finalTotal.toFixed(2)} {country?.currency}</span>
        </div>
      </>
    );
  })()}
</div>
        
      {/* Order Note */}
      <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-3">Order Note</h3>
          <textarea
            placeholder="Add any special instructions (optional)"
            value={orderNote}
            onChange={(e) => setOrderNote(e.target.value)}
            className="w-full p-2 border rounded"
            rows={3}
          />
        </div>
      </div>
    );
  };

  // ... (Keep remaining component code) ...
  const handleShippingAddressChange = (field, value) => {
    setFormData((prevData) => ({
      ...prevData,
      shippingAddress: {
        ...prevData.shippingAddress,
        [field]: value
      }
    }));
  };

  const handleBillingAddressChange = (field, value) => {
    setFormData((prevData) => ({
      ...prevData,
      billingAddress: {
        ...prevData.billingAddress,
        [field]: value
      }
    }));
  };
  const removePhoto = (photoId) => {
    setSelectedPhotos(selectedPhotos.filter(photo => photo.id !== photoId));
  };
  const updatePhotoSize = (photoId, newSize) => {
    setSelectedPhotos((selectedPhotos || []).map(photo =>
      photo.id === photoId ? { ...photo, size: newSize } : photo
    ));
  };

  const updatePhotoQuantity = (photoId, newQuantity) => {
    if (newQuantity > 0 && newQuantity <= 99) {
      setSelectedPhotos((selectedPhotos || []).map(photo =>
        photo.id === photoId ? { ...photo, quantity: newQuantity } : photo
      ));
    }
  };

  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
    setFormData(prevData => ({
      ...prevData,
      shippingAddress: {
        ...prevData.shippingAddress,
        country: country
      },
      billingAddress: {
        ...prevData.billingAddress,
        country: country
      }
    }));
    setShowIntro(false);
  };
  const validateStep = () => {
    switch (activeStep) {
      case 0:
        return selectedPhotos.length > 0;
      case 1:
        return formData.email && 
               formData.phone && 
               formData.shippingAddress.firstName && 
               formData.shippingAddress.lastName && 
               formData.shippingAddress.address && 
               formData.shippingAddress.city && 
               formData.shippingAddress.postalCode &&
               (selectedCountry !== 'USA' || formData.shippingAddress.state) &&
               (selectedCountry !== 'CAN' || formData.shippingAddress.province);
      case 2:
        return true;
      default:
        return false;
    }
  };

  

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
  
                {/* Book Now Button */}
                <div className="text-center mt-6">
                  <button 
                    onClick={() => setShowBookingPopup(true)} 
                    className="inline-block px-6 py-3 bg-yellow-400 text-black font-semibold rounded-lg shadow-md hover:bg-yellow-500"
                  >
                    Book a Photography Service
                  </button>
                </div>
              </div>
            </div>
            
            {/* Archive Policy */}
            <div className="border-t text-center py-3">
              <p className="text-xs text-gray-500">
                Archive policy: All pictures will be achieved in our database 60 days after the order is shipped.
              </p>
            </div>
          </div>

          {/* Booking Popup */}
          {showBookingPopup && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
              <div className="relative bg-white rounded-lg w-[95%] max-w-xl h-[90vh] max-h-[600px] m-auto">
                <button 
                  onClick={() => setShowBookingPopup(false)}
                  className="absolute top-2 right-2 p-2 hover:bg-gray-100 rounded-full z-10 bg-white shadow-md"
                  aria-label="Close"
                >
                  <X size={24} />
                </button>
                
                <iframe
                  src="https://freezepix.setmore.com/"
                  title="Book Photography Service"
                  className="w-full h-full rounded-lg"
                  style={{ maxWidth: '100%', maxHeight: '100%' }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (orderSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-xl w-full">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center space-y-6">
            <div className="text-green-500 text-5xl">✓</div>
            <h2 className="text-2xl font-bold">Thank you for your order!</h2>
            <p className="text-gray-600">
              Your order has been successfully placed and will be processed within 48 hours.
              A confirmation email has been sent to {formData.email}.
            </p>
            <div className="mt-4">
              <p className="font-medium">Order Details:</p>
              <p>Order Number: {generateOrderNumber()}</p>
              <p>Total Amount: {calculateTotals().total.toFixed(2)} {initialCountries.find(c => c.value === selectedCountry)?.currency}</p>
              {selectedCountry === 'TUN' && (
                <p className="text-gray-600 mt-2">
                  Payment Method: Cash on Delivery
                </p>
              )}
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
  
  {/* Only show Next/Place Order button if:
      1. Not on payment page (activeStep !== 2), or
      2. On payment page AND it's a Tunisia order (COD payment) */}
  {(activeStep !== 2 || selectedCountry === 'TUN') && (
    <button
      onClick={handleNext}
      disabled={!validateStep()}
      className={`px-6 py-2 rounded ${
        validateStep()
          ? 'bg-yellow-400 hover:bg-yellow-500'
          : 'bg-gray-200 cursor-not-allowed'
      }`}
    >
      {activeStep === 2 && selectedCountry === 'TUN' ? 'Place Order' : 'Next'}
    </button>
  )}
</div>

        </div>
      </div>
      {showBookingPopup && (
        <BookingPopup onClose={() => setShowBookingPopup(false)} />
      )}
    </div>
    
  );
};

export default FreezePIX;