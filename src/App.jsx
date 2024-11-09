import React, { useState, useRef, useCallback } from 'react';
import { Upload, ShoppingCart, Package, Camera, X } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import {
  CardElement,
  Elements,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

const stripePromise = loadStripe('pk_test_51QHmgQRvhgQx4g20FEvJ97UMmtc7QcW4yGdmbDN49M75MnwQBb5ZO408FI6Tq1w9NKuWr6yQoMDBqS5FrIEEfdlr00swKtIShp');

const initialCountries = [
    { name: 'United States', value: 'USA', currency: 'USD', rate: 1, size4x6: 0.39, size5x7: 1.49, crystalRectangle: 100, crystalHeart: 100 },
    { name: 'Canada', value: 'CAN', currency: 'CAD', rate: 1, size4x6: 0.39, size5x7: 1.49, crystalRectangle: 100, crystalHeart: 100 },
    { name: 'Tunisia', value: 'TUN', currency: 'TND', rate: 1, size10x15: 2, size15x22: 4 }
];

// Product Category Selection Component
const ProductCategorySelection = ({ onSelect }) => {
    return (
      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => onSelect('photos')}
          className="p-6 border rounded-lg hover:bg-gray-50 text-center"
        >
          <img src="https://i.imgur.com/DEXREVR.png" alt="Photo Print" className="w-24 h-24 mx-auto mb-4" />
          <div className="font-medium">Photo Prints</div>
        </button>
        <button 
          onClick={() => onSelect('crystal')}
          className="p-6 border rounded-lg hover:bg-gray-50 text-center"
        >
          <img src="https://i.imgur.com/YyD0Fp1.png" alt="3D Crystal" className="w-24 h-24 mx-auto mb-4" />
          <div className="font-medium">3D Crystal</div>
        </button>
      </div>
    );
  };
  
  // Crystal Product Selection Component
  const CrystalProductSelection = ({ onSelect }) => {
    const products = [
      {
        id: 'rectangle',
        name: 'Rectangle Personalized Freezepix',
        image: 'https://i.imgur.com/BK69Ry3.png',
        description: `Each freezepix is custom-made with your chosen photo, making it a truly personalized keepsake that holds immense sentimental value...`,
        specs: 'Rectangle: 3 x 3.5 x 3 inches'
      },
      {
        id: 'heart',
        name: 'Heart Personalized Freezepix',
        image: 'https://i.imgur.com/C8q347r.png',
        description: `Each freezepix is custom-made with your chosen photo, making it a truly personalized keepsake that holds immense sentimental value...`,
        specs: 'Heart: 4 x 3.5 x 2.5 inches'
      }
    ];
  
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {products.map(product => (
          <div key={product.id} className="border rounded-lg p-4">
            <img src={product.image} alt={product.name} className="w-full h-48 object-contain mb-4" />
            <h3 className="text-lg font-medium mb-2">{product.name}</h3>
            <p className="text-sm text-gray-600 mb-4">{product.description}</p>
            <p className="text-sm font-medium mb-4">{product.specs}</p>
            <button
              onClick={() => onSelect(product.id)}
              className="w-full py-2 bg-yellow-400 text-black rounded hover:bg-yellow-500"
            >
              Select This Design
            </button>
          </div>
        ))}
      </div>
    );
  };
  
  // Modified AddressForm Component
  const AddressForm = ({ type, data, onChange }) => {
    const handleInputChange = (field) => (e) => {
      const newValue = e.target.value;
      onChange({
        ...data,
        [field]: newValue
      });
    };
  
    return (
      <div className="grid grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="First Name"
          value={data.firstName || ''}
          onChange={handleInputChange('firstName')}
          className="p-2 border rounded"
        />
        <input
          type="text"
          placeholder="Last Name"
          value={data.lastName || ''}
          onChange={handleInputChange('lastName')}
          className="p-2 border rounded"
        />
        <input
          type="text"
          placeholder="Address"
          value={data.address || ''}
          onChange={handleInputChange('address')}
          className="col-span-2 p-2 border rounded"
        />
        <input
          type="text"
          placeholder="City"
          value={data.city || ''}
          onChange={handleInputChange('city')}
          className="p-2 border rounded"
        />
        
        {data.country === 'USA' && (
          <input
            type="text"
            placeholder="State"
            value={data.state || ''}
            onChange={handleInputChange('state')}
            className="p-2 border rounded"
          />
        )}
        
        {data.country === 'CAN' && (
          <input
            type="text"
            placeholder="Province"
            value={data.province || ''}
            onChange={handleInputChange('province')}
            className="p-2 border rounded"
          />
        )}
        
        <input
          type="text"
          placeholder={data.country === 'USA' ? "ZIP Code" : "Postal Code"}
          value={data.postalCode || ''}
          onChange={handleInputChange('postalCode')}
          pattern="[A-Za-z0-9\s-]*"
          className="p-2 border rounded"
        />
        
        <input
          type="text"
          value={initialCountries.find(c => c.value === data.country)?.name || ''}
          disabled
          className="col-span-2 p-2 border rounded bg-gray-100"
        />
      </div>
    );
  };
  
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
  const [showIntro, setShowIntro] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null); // 'photos' or 'crystal'
  const [selectedCrystalType, setSelectedCrystalType] = useState(null); // 'rectangle' or 'heart'
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [activeStep, setActiveStep] = useState(0);
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    shippingAddress: {
      firstName: '',
      lastName: '',
      address: '',
      city: '',
      state: '',
      province: '',
      postalCode: '',
      country: ''
    }
  });

  // Product Selection Component
  const ProductSelection = () => (
    <div className="grid grid-cols-2 gap-4 mb-6">
      <button 
        onClick={() => setSelectedProduct('photos')}
        className={`p-6 border rounded-lg hover:bg-gray-50 text-center ${selectedProduct === 'photos' ? 'border-yellow-400' : ''}`}
      >
        <img src="/api/placeholder/96/96" alt="Photo Print" className="w-24 h-24 mx-auto mb-4" />
        <div className="font-medium">Photo Prints</div>
      </button>
      <button 
        onClick={() => setSelectedProduct('crystal')}
        className={`p-6 border rounded-lg hover:bg-gray-50 text-center ${selectedProduct === 'crystal' ? 'border-yellow-400' : ''}`}
      >
        <img src="/api/placeholder/96/96" alt="3D Crystal" className="w-24 h-24 mx-auto mb-4" />
        <div className="font-medium">3D Crystal</div>
      </button>
    </div>
  );

  // Crystal Selection Component
  const CrystalSelection = () => (
    <div className="grid grid-cols-2 gap-4 mb-6">
      <button 
        onClick={() => setSelectedCrystalType('rectangle')}
        className={`p-6 border rounded-lg hover:bg-gray-50 text-center ${selectedCrystalType === 'rectangle' ? 'border-yellow-400' : ''}`}
      >
        <img src="/api/placeholder/96/96" alt="Rectangle Crystal" className="w-24 h-24 mx-auto mb-4" />
        <div className="font-medium">Rectangle Crystal</div>
      </button>
      <button 
        onClick={() => setSelectedCrystalType('heart')}
        className={`p-6 border rounded-lg hover:bg-gray-50 text-center ${selectedCrystalType === 'heart' ? 'border-yellow-400' : ''}`}
      >
        <img src="/api/placeholder/96/96" alt="Heart Crystal" className="w-24 h-24 mx-auto mb-4" />
        <div className="font-medium">Heart Crystal</div>
      </button>
    </div>
  );

  const handleAddressChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      shippingAddress: {
        ...prev.shippingAddress,
        [field]: value
      }
    }));
  };

 

  // ... Rest of your component (intro screen, success screen, etc.)

  const validateDiscountCode = (code) => {
    const totalItems = selectedPhotos.reduce((sum, photo) => sum + photo.quantity, 0);
    const validCodes = ['B2B', 'MOHAMED'];
    const upperCode = code.toUpperCase();
    
    if (code && !validCodes.includes(upperCode)) {
      setDiscountError('Invalid discount code');
      return false;
    } else if (totalItems < 10) {
      setDiscountError('Minimum 10 items required for discount');
      return false;
    } else {
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

  const handleNext = () => {
    if (activeStep === 2) {
      if (selectedCountry === 'TUN') {
        setOrderSuccess(true);
      }
    } else {
      setActiveStep(prev => prev + 1);
    }
  };

// Modified calculateTotals function
const calculateTotals = (selectedPhotos, selectedCrystal, selectedCountry, discountCode) => {
const country = initialCountries.find(c => c.value === selectedCountry);

let subtotal = 0;
let itemizedList = [];

if (selectedCrystal) {
  // Crystal product pricing
  const price = selectedCrystal === 'rectangle' ? country.crystalRectangle : country.crystalHeart;
  subtotal = price;
  itemizedList.push({
    name: `${selectedCrystal === 'rectangle' ? 'Rectangle' : 'Heart'} Crystal`,
    quantity: 1,
    price: price,
    total: price
  });
} else {
  // Photo prints pricing
  const photosBySize = {
    '4x6': selectedPhotos.filter(p => p.size === '4x6'),
    '5x7': selectedPhotos.filter(p => p.size === '5x7'),
    '10x15': selectedPhotos.filter(p => p.size === '10x15'),
    '15x22': selectedPhotos.filter(p => p.size === '15x22')
  };

  Object.entries(photosBySize).forEach(([size, photos]) => {
    const quantity = photos.reduce((sum, photo) => sum + photo.quantity, 0);
    if (quantity > 0) {
      const price = country[`size${size.replace('x', '')}`];
      const total = quantity * price;
      subtotal += total;
      itemizedList.push({
        name: `${size} Photos`,
        quantity,
        price,
        total
      });
    }
  });
}

const shippingFee = selectedCountry === 'TUN' ? 8 : 9;
let discount = 0;

if ((discountCode === 'B2B' || discountCode === 'MOHAMED') && !selectedCrystal) {
  const totalItems = selectedPhotos.reduce((sum, photo) => sum + photo.quantity, 0);
  if (totalItems >= 10) {
    discount = subtotal * 0.3;
    subtotal -= discount;
  }
}

const total = subtotal + shippingFee;

return {
  itemizedList,
  subtotal,
  shippingFee,
  discount,
  total
};
};

const renderInvoice = () => {
  const { itemizedList, subtotal, shippingFee, total, discount } = calculateTotals(
    selectedPhotos,
    selectedCrystal,
    selectedCountry,
    discountCode
  );
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
            onChange={(e) => handleDiscountCode(e.target.value.toUpperCase())}
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
        
        {/* Itemized List */}
        {itemizedList.map((item, index) => (
          <div key={index} className="flex justify-between py-2">
            <span>{item.name} ({item.quantity} × {item.price.toFixed(2)} {country?.currency})</span>
            <span>{item.total.toFixed(2)} {country?.currency}</span>
          </div>
        ))}

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

        {/* Discount (if applicable) */}
        {discount > 0 && (
          <div className="flex justify-between py-2 text-green-600">
            <span>Discount (30%)</span>
            <span>-{discount.toFixed(2)} {country?.currency}</span>
          </div>
        )}

        {/* Total */}
        <div className="flex justify-between py-2 border-t font-bold">
          <span>Total</span>
          <span>{total.toFixed(2)} {country?.currency}</span>
        </div>
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


const handleFileChange = (event) => {
  const files = Array.from(event.target.files);
  const newPhotos = files.map(file => ({
    id: Math.random().toString(36).substr(2, 9),
    file,
    preview: URL.createObjectURL(file),
    size: selectedCountry === 'TUN' ? '10x15' : '4x6',
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
data={formData.shippingAddress}
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
                />
                <label htmlFor="sameAddress">Billing address same as shipping</label>
              </div>

              {!isBillingAddressSameAsShipping && (
                <>
                  <h2 className="text-xl font-medium">Billing Address</h2>
                  <AddressForm
                    type="billing"
                    data={formData.billingAddress}
                    onChange={(newAddress) => setFormData(prevData => ({
                      ...prevData,
                      billingAddress: newAddress
                    }))}

                    /*type="shipping"
                     data={formData.shippingAddress}
                      onChange={(newAddress) => setFormData(prevData => ({
                      ...prevData,
                    shippingAddress: newAddress,
                   billingAddress: isBillingAddressSameAsShipping ? newAddress : prevData.billingAddress*/
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
          
          

          {selectedCountry !== 'TUN' && (
            <Elements stripe={stripePromise}>
              <PaymentForm onPaymentSuccess={() => setOrderSuccess(true)} />
            </Elements>
          )}
        </div>
      );

    default:
      return null;
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
            </div>
          </div>
          
          {/* Archive Policy */}
          <div className="border-t text-center py-3">
            <p className="text-xs text-gray-500">
              Archive policy: All pictures will be achieved in our database 60 days after the order is shipped.
            </p>
          </div>
        </div>
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          {/* Stepper */}
          <div className="flex items-center justify-between mb-8">
            {['Select Product', 'Shipping Details', 'Payment'].map((step, index) => (
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
              onClick={() => activeStep === 0 ? setShowIntro(true) : setActiveStep(prev => prev - 1)}
              className="px-6 py-2 rounded bg-gray-100 hover:bg-gray-200"
            >
              {activeStep === 0 ? 'Back' : 'Previous'}
            </button>
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreezePIX;