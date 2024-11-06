import React, { useState, useRef } from 'react';
import { Upload, ShoppingCart, Package, Camera, X } from 'lucide-react';

const FreezePIX = () => {
  // State Management
  const [showIntro, setShowIntro] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [activeStep, setActiveStep] = useState(0);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [isBillingAddressSameAsShipping, setIsBillingAddressSameAsShipping] = useState(true);
  const fileInputRef = useRef(null);

  // Constants
  const initialCountries = [
    { name: 'United States', value: 'USA', currency: 'USD', rate: 1, size4x6: 0.39, size5x7: 1.49 },
    { name: 'Canada', value: 'CAN', currency: 'CAD', rate: 1, size4x6: 0.39, size5x7: 1.49 },
    { name: 'Tunisia', value: 'TUN', currency: 'TND', rate: 2.25, size4x6: 0.89, size5x7: 3.35 }
  ];

  const getPricesByCurrency = (country) => {
    const currentCountry = initialCountries.find(c => c.value === country);
    return {
      '4x6': currentCountry?.size4x6.toFixed(2),
      '5x7': currentCountry?.size5x7.toFixed(2)
    };
  };

  const [formData, setFormData] = useState({
    email: '',
    shippingAddress: {
      firstName: '',
      lastName: '',
      address: '',
      city: '',
      postalCode: '',
      country: selectedCountry || ''
    },
    billingAddress: {
      firstName: '',
      lastName: '',
      address: '',
      city: '',
      postalCode: '',
      country: selectedCountry || ''
    },
    paymentMethod: ''
  });

  // Reset to home function
  const resetToHome = () => {
    setShowIntro(true);
    setSelectedCountry('');
    setSelectedPhotos([]);
    setActiveStep(0);
    setOrderSuccess(false);
    setIsBillingAddressSameAsShipping(true);
    setFormData({
      email: '',
      shippingAddress: {
        firstName: '',
        lastName: '',
        address: '',
        city: '',
        postalCode: '',
        country: ''
      },
      billingAddress: {
        firstName: '',
        lastName: '',
        address: '',
        city: '',
        postalCode: '',
        country: ''
      },
      paymentMethod: ''
    });
  };

  // Photo Upload Handler
  const handlePhotoSelect = (event) => {
    const files = Array.from(event.target.files);
    const newPhotos = files.map((file, index) => ({
      id: selectedPhotos.length + index + 1,
      preview: URL.createObjectURL(file),
      size: '4x6',
      quantity: 1
    }));
    setSelectedPhotos([...selectedPhotos, ...newPhotos]);
  };

  // Calculate Totals
  const calculateTotals = () => {
    const prices = getPricesByCurrency(selectedCountry);
    const subtotalsBySize = {
      '4x6': 0,
      '5x7': 0
    };

    selectedPhotos.forEach(photo => {
      subtotalsBySize[photo.size] += photo.quantity;
    });

    const subtotal = Object.entries(subtotalsBySize).reduce((acc, [size, quantity]) => {
      return acc + (quantity * parseFloat(prices[size]));
    }, 0);

    const shippingFee = selectedCountry === 'TUN' ? 8 : 9 * (initialCountries.find(c => c.value === selectedCountry)?.rate || 1);
    const total = subtotal + shippingFee;

    return { subtotalsBySize, subtotal, shippingFee, total };
  };

  // Steps array for progress tracking
  const steps = ['Select & Configure Photos', 'Shipping & Payment', 'Review & Pay'];

  // Render Welcome Screen
  if (showIntro) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="flex justify-center mb-6">
          <div className="text-4xl font-bold tracking-tight cursor-pointer" onClick={resetToHome}>
            <span className="text-black">freeze</span>
            <span className="text-yellow-400">PIX</span>
          </div>
        </div>
        <div className="text-sm italic text-gray-600 mb-8">the photography company</div>
        <div className="space-y-6 max-w-md w-full">
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
        </div>
        <div className="max-w-xl w-full">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center space-y-6">
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">
                  Select Your Shipping Country
                </label>
                <select
                  value={selectedCountry}
                  onChange={(e) => {
                    setSelectedCountry(e.target.value);
                    setFormData(prev => ({
                      ...prev,
                      shippingAddress: { ...prev.shippingAddress, country: e.target.value },
                      billingAddress: { ...prev.billingAddress, country: e.target.value }
                    }));
                    setIsBillingAddressSameAsShipping(true);
                    setFormData(prev => ({
                      ...prev,
                      paymentMethod: e.target.value === 'TUN' ? 'cod' : 'credit'
                    }));
                  }}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="">Select Shipping Country</option>
                  {initialCountries.map(country => (
                    <option key={country.value} value={country.value}>
                      {country.name} 
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => setShowIntro(false)}
                disabled={!selectedCountry}
                className="w-full py-3 px-4 bg-yellow-400 text-black rounded-lg font-medium 
                         hover:bg-yellow-500 transition-colors disabled:opacity-50"
              >
                Start Printing
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render Success Screen
  if (orderSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-xl w-full">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center space-y-6">
            <div className="text-green-500 text-5xl">✓</div>
            <h2 className="text-2xl font-bold">Order Successfully Placed!</h2>
            <p className="text-gray-600">
              Your order will be processed within 48 hours.
              A shipping tracking number will be sent to your email.
            </p>
            <button
              onClick={resetToHome}
              className="px-6 py-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500"
            >
              Place New Order
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main Application Layout
  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-6 md:p-8">
          <div className="text-2xl font-bold text-center mb-8">
            <span className="text-black">freeze</span>
            <span className="text-yellow-400">PIX</span>
          </div>

          {/* Progress Steps */}
          <div className="flex justify-between mb-8">
            {steps.map((step, index) => (
              <div key={step} className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center 
                              ${index <= activeStep ? 'bg-yellow-400 text-black' : 'bg-gray-200'}`}>
                  {index + 1}
                </div>
                <span className="text-sm mt-2">{step}</span>
              </div>
            ))}
          </div>

          {/* Step Content */}
          <div className="space-y-6">
            {/* Step 1: Photo Selection and Configuration */}
            {activeStep === 0 && (
              <div className="space-y-6">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoSelect}
                  accept="image/*"
                  multiple
                  className="hidden"
                />

                <button
                  onClick={() => fileInputRef.current.click()}
                  className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg
                           flex flex-col items-center justify-center text-gray-400 hover:text-gray-500"
                >
                  <Upload className="w-8 h-8 mb-2" />
                  <span>Upload Photos</span>
                </button>

                <div className="space-y-4">
                  {selectedPhotos.map((photo, index) => (
                    <div key={photo.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                      <img
                        src={photo.preview}
                        alt={`Photo ${index + 1}`}
                        className="w-24 h-24 object-cover rounded"
                      />
                      <div className="flex-1 flex items-center justify-between">
                        <div className="space-x-4">
                          <select
                            value={photo.size}
                            onChange={(e) => {
                              const newPhotos = [...selectedPhotos];
                              newPhotos[index].size = e.target.value;
                              setSelectedPhotos(newPhotos);
                            }}
                            className="p-2 border rounded"
                          >
                            {Object.entries(getPricesByCurrency(selectedCountry)).map(([size, price]) => (
                              <option key={size} value={size}>
                                {size}" - {price} {initialCountries.find(c => c.value === selectedCountry)?.currency}
                              </option>
                            ))}
                          </select>
                          <select
                            value={photo.quantity}
                            onChange={(e) => {
                              const newPhotos = [...selectedPhotos];
                              newPhotos[index].quantity = parseInt(e.target.value);
                              setSelectedPhotos(newPhotos);
                            }}
                            className="p-2 border rounded"
                          >
                            {[...Array(100)].map((_, i) => (
                              <option key={i + 1} value={i + 1}>
                                {i + 1}
                              </option>
                            ))}
                          </select>
                        </div>
                        <button
                          onClick={() => {
                            const newPhotos = selectedPhotos.filter((_, i) => i !== index);
                            setSelectedPhotos(newPhotos);
                          }}
                          className="p-1 text-red-500 hover:bg-red-50 rounded"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Shipping & Payment */}
            {activeStep === 1 && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Contact Information</h3>
                  <input
                    type="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-2 border rounded"
                  />
                </div>

                <div className="space-y-4" id="shipping">
                  <h3 className="font-medium">Shipping Address</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      placeholder="First Name"
                      value={formData.shippingAddress.firstName}
                      onChange={(e) => setFormData({
                        ...formData,
                        shippingAddress: { ...formData.shippingAddress, firstName: e.target.value }
                      })}
                      className="p-2 border rounded"
                    />
                    <input
                      placeholder="Last Name"
                      value={formData.shippingAddress.lastName}
                      onChange={(e) => setFormData({
                        ...formData,
                        shippingAddress: { ...formData.shippingAddress, lastName: e.target.value }
                      })}
                      className="p-2 border rounded"
                    />
                    <input
                      placeholder="Address"
                      value={formData.shippingAddress.address}
                      onChange={(e) => setFormData({
                        ...formData,
                        shippingAddress: { ...formData.shippingAddress, address: e.target.value }
                      })}
                      className="col-span-2 p-2 border rounded"
                    />
                    <input
                      placeholder="City"
                      value={formData.shippingAddress.city}
                      onChange={(e) => setFormData({
                        ...formData,
                        shippingAddress: { ...formData.shippingAddress, city: e.target.value }
                      })}
                      className="p-2 border rounded"
                    />
                    <input
                      placeholder="Postal Code"
                      value={formData.shippingAddress.postalCode}
                      onChange={(e) => setFormData({
                        ...formData,
                        shippingAddress: { ...formData.shippingAddress, postalCode: e.target.value }
                      })}
                      className="p-2 border rounded"
                    />
                    <select
                      value={formData.shippingAddress.country}
                      onChange={(e) => setFormData({
                        ...formData,
                        shippingAddress: { ...formData.shippingAddress, country: e.target.value }
                      })}
                      className="col-span-2 p-2 border rounded"
                    >
                      <option value="">Select Country</option>
                      {initialCountries.map(country => (
                        <option key={country.value} value={country.value}>
                          {country.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="sameAsBilling"
                    checked={isBillingAddressSameAsShipping}
                    onChange={(e) => setIsBillingAddressSameAsShipping(e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="sameAsBilling" className="text-sm">
                    Billing address same as shipping
                  </label>
                </div>

                {!isBillingAddressSameAsShipping && (
                  <div className="space-y-4" id="billing">
                    <h3 className="font-medium">Billing Address</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        placeholder="First Name"
                        value={formData.billingAddress.firstName}
                        onChange={(e) => setFormData({
                          ...formData,
                          billingAddress: { ...formData.billingAddress, firstName: e.target.value }
                        })}
                        className="p-2 border rounded"
                      />
                      <input
                        placeholder="Last Name"
                        value={formData.billingAddress.lastName}
                        onChange={(e) => setFormData({
                          ...formData,
                          billingAddress: { ...formData.billingAddress, lastName: e.target.value }
                        })}
                        className="p-2 border rounded"
                      />
                      <input
                        placeholder="Address"
                        value={formData.billingAddress.address}
                        onChange={(e) => setFormData({
                          ...formData,
                          billingAddress: { ...formData.billingAddress, address: e.target.value }
                        })}
                        className="col-span-2 p-2 border rounded"
                      />
                      <input
                        placeholder="City"
                        value={formData.billingAddress.city}
                        onChange={(e) => setFormData({
                          ...formData,
                          billingAddress: { ...formData.billingAddress, city: e.target.value }
                        })}
                        className="p-2 border rounded"
                      />
                      <input
                        placeholder="Postal Code"
                        value={formData.billingAddress.postalCode}
                        onChange={(e) => setFormData({
                          ...formData,
                          billingAddress: { ...formData.billingAddress, postalCode: e.target.value }
                        })}
                        className="p-2 border rounded"
                      />
                      <select
                        value={formData.billingAddress.country}
                        onChange={(e) => setFormData({
                          ...formData,
                          billingAddress: { ...formData.billingAddress, country: e.target.value }
                        })}
                        className="col-span-2 p-2 border rounded"
                      >
                        <option value="">Select Country</option>
                        {initialCountries.map(country => (
                          <option key={country.value} value={country.value}>
                            {country.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <h3 className="font-medium">Payment Method</h3>
                  <div className="space-y-2">
                    {selectedCountry === 'TUN' ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="cod"
                          value="cod"
                          checked={formData.paymentMethod === 'cod'}
                          onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                          className="rounded"
                        />
                        <label htmlFor="cod">Cash on Delivery</label>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="credit"
                          value="credit"
                          checked={formData.paymentMethod === 'credit'}
                          onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                          className="rounded"
                        />
                        <label htmlFor="credit">Credit Card</label>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Continue with Step 3 and the rest of the code... */}
            {/* Step 3: Review & Pay */}
            {activeStep === 2 && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Order Summary</h3>
                  <div className="divide-y">
                    {selectedPhotos.map((photo, index) => (
                      <div key={photo.id} className="py-2">
                        <div className="flex justify-between">
                          <span>Photo {index + 1} ({photo.size}") x {photo.quantity}</span>
                          <span>
                            {(getPricesByCurrency(selectedCountry)[photo.size] * photo.quantity).toFixed(2)} 
                            {initialCountries.find(c => c.value === selectedCountry)?.currency}
                          </span>
                        </div>
                      </div>
                    ))}
                    <div className="py-2">
                      <div className="flex justify-between font-medium">
                        <span>Shipping Fee</span>
                        <span>
                          {calculateTotals().shippingFee.toFixed(2)} 
                          {initialCountries.find(c => c.value === selectedCountry)?.currency}
                        </span>
                      </div>
                    </div>
                    <div className="py-2">
                      <div className="flex justify-between font-bold">
                        <span>Total</span>
                        <span>
                          {calculateTotals().total.toFixed(2)} 
                          {initialCountries.find(c => c.value === selectedCountry)?.currency}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Shipping Information</h3>
                  <div className="bg-gray-50 p-4 rounded">
                    <p>{formData.shippingAddress.firstName} {formData.shippingAddress.lastName}</p>
                    <p>{formData.shippingAddress.address}</p>
                    <p>{formData.shippingAddress.city}, {formData.shippingAddress.postalCode}</p>
                    <p>{initialCountries.find(c => c.value === formData.shippingAddress.country)?.name}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Payment Method</h3>
                  <div className="bg-gray-50 p-4 rounded">
                    <p>{formData.paymentMethod === 'credit' ? 'Credit Card' : 'Cash on Delivery'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <button
                onClick={() => setActiveStep(prev => Math.max(0, prev - 1))}
                className={`px-6 py-2 rounded-lg ${
                  activeStep === 0
                    ? 'bg-gray-200 cursor-not-allowed'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
                disabled={activeStep === 0}
              >
                Back
              </button>

              {activeStep === steps.length - 1 ? (
                <button
                  onClick={() => {
                    setTimeout(() => {
                      setOrderSuccess(true);
                    }, 1000);
                  }}
                  className="px-6 py-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500"
                >
                  Place Order
                </button>
              ) : (
                <button
                  onClick={() => {
                    if (activeStep === 0 && selectedPhotos.length === 0) {
                      alert('Please select at least one photo');
                      return;
                    }

                    if (activeStep === 1) {
                      const { email, shippingAddress, billingAddress, paymentMethod } = formData;
                      if (!email || !shippingAddress.firstName || !shippingAddress.lastName ||
                          !shippingAddress.address || !shippingAddress.city ||
                          !shippingAddress.postalCode || !shippingAddress.country || !paymentMethod) {
                        alert('Please fill in all required fields');
                        return;
                      }

                      if (!isBillingAddressSameAsShipping && (!billingAddress.firstName || !billingAddress.lastName || 
                          !billingAddress.address || !billingAddress.city || !billingAddress.postalCode || !billingAddress.country)) {
                        alert('Please fill in all required billing address fields');
                        return;
                      }
                    }

                    setActiveStep(prev => Math.min(steps.length - 1, prev + 1));
                  }}
                  className="px-6 py-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500"
                >
                  {activeStep === steps.length - 2 ? 'Review Order' : 'Next'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreezePIX;