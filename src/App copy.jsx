import React, { useState } from 'react';
import { Upload, ShoppingCart, Package, Camera, Plus, Minus, X } from 'lucide-react';

const FreezePIX = () => {
  const [showIntro, setShowIntro] = useState(true);
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [activeStep, setActiveStep] = useState(0);
  
  const TAX_RATE = 0.13; // 20% tax rate

  const printSizes = [
    { id: '4x6', name: '10 x 15 inches', price: 0.99 },
    { id: '5x7', name: '15 x 20 inches', price: 1.99 }
  ];

  const steps = ['Select Photos', 'Choose Sizes', 'Review Order', 'Shipping'];

  const handlePhotoSelect = () => {
    const newPhoto = {
      id: selectedPhotos.length + 1,
      name: `Photo ${selectedPhotos.length + 1}.jpg`,
      preview: '/api/placeholder/150/150',
      sizes: [] // Array to hold multiple size selections
    };
    setSelectedPhotos([...selectedPhotos, newPhoto]);
  };

  const togglePhotoSize = (photoId, sizeId) => {
    setSelectedPhotos(photos =>
      photos.map(photo => {
        if (photo.id === photoId) {
          const existingSizeIndex = photo.sizes.findIndex(s => s.sizeId === sizeId);
          if (existingSizeIndex === -1) {
            // Add new size with quantity 1
            return {
              ...photo,
              sizes: [...photo.sizes, { sizeId, quantity: 1 }]
            };
          }
          // Remove size if it exists
          return {
            ...photo,
            sizes: photo.sizes.filter(s => s.sizeId !== sizeId)
          };
        }
        return photo;
      })
    );
  };

  const updateQuantity = (photoId, sizeId, change) => {
    setSelectedPhotos(photos =>
      photos.map(photo => {
        if (photo.id === photoId) {
          return {
            ...photo,
            sizes: photo.sizes.map(size => {
              if (size.sizeId === sizeId) {
                const newQuantity = Math.max(1, size.quantity + change);
                return { ...size, quantity: newQuantity };
              }
              return size;
            })
          };
        }
        return photo;
      })
    );
  };

  const calculateSubtotal = () => {
    return selectedPhotos.reduce((total, photo) => {
      return total + photo.sizes.reduce((photoTotal, size) => {
        const priceInfo = printSizes.find(p => p.id === size.sizeId);
        return photoTotal + (priceInfo.price * size.quantity);
      }, 0);
    }, 0);
  };

  const calculateTax = (subtotal) => {
    return subtotal * TAX_RATE;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const tax = calculateTax(subtotal);
    return (subtotal + tax).toFixed(2);
  };

  const getTotalPrints = () => {
    return selectedPhotos.reduce((total, photo) => 
      total + photo.sizes.reduce((sizeTotal, size) => sizeTotal + size.quantity, 0), 0
    );
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

                <button
                  onClick={() => setShowIntro(false)}
                  className="w-full py-3 px-4 bg-yellow-400 text-black rounded-lg font-medium hover:bg-yellow-500 transition-colors"
                >
                  Start Printing
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg mb-6">
        <div className="p-6">
          <div className="flex justify-center items-center space-x-2 mb-6">
            <div className="text-2xl font-bold">
              <span className="text-black">freeze</span>
              <span className="text-yellow-400">PIX</span>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex justify-between mb-8">
            {steps.map((step, index) => (
              <div key={step} className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  index <= activeStep ? 'bg-yellow-400 text-black' : 'bg-gray-200'
                }`}>
                  {index + 1}
                </div>
                <span className="text-sm mt-2">{step}</span>
              </div>
            ))}
          </div>

          {/* Step Content */}
          <div className="space-y-6">
            {activeStep === 0 && (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-4">
                  {selectedPhotos.map(photo => (
                    <div key={photo.id} className="relative">
                      <img 
                        src={photo.preview} 
                        alt={photo.name}
                        className="w-32 h-32 object-cover rounded"
                      />
                      <span className="text-xs mt-1 block">{photo.name}</span>
                    </div>
                  ))}
                  <button 
                    onClick={handlePhotoSelect}
                    className="w-32 h-32 border-2 border-dashed border-gray-300 rounded flex flex-col items-center justify-center text-gray-400 hover:text-gray-500 hover:border-gray-400"
                  >
                    <Upload className="w-8 h-8 mb-2" />
                    <span className="text-sm">Add Photo</span>
                  </button>
                </div>
              </div>
            )}

            {activeStep === 1 && (
              <div className="space-y-6">
                {selectedPhotos.map(photo => (
                  <div key={photo.id} className="border rounded-lg p-4">
                    <div className="flex items-start space-x-4">
                      <img 
                        src={photo.preview} 
                        alt={photo.name}
                        className="w-24 h-24 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium mb-2">{photo.name}</h3>
                        <div className="space-y-2">
                          {printSizes.map(size => {
                            const selectedSize = photo.sizes.find(s => s.sizeId === size.id);
                            return (
                              <div key={size.id} className="flex items-center space-x-4">
                                <button
                                  onClick={() => togglePhotoSize(photo.id, size.id)}
                                  className={`px-3 py-1 rounded ${
                                    selectedSize ? 'bg-yellow-400 text-black' : 'bg-gray-100'
                                  }`}
                                >
                                  {size.name} - ${size.price}
                                </button>
                                {selectedSize && (
                                  <div className="flex items-center space-x-2">
                                    <button 
                                      onClick={() => updateQuantity(photo.id, size.id, -1)}
                                      className="p-1 hover:bg-gray-100 rounded"
                                    >
                                      <Minus className="w-4 h-4" />
                                    </button>
                                    <span className="text-sm font-medium">{selectedSize.quantity}</span>
                                    <button 
                                      onClick={() => updateQuantity(photo.id, size.id, 1)}
                                      className="p-1 hover:bg-gray-100 rounded"
                                    >
                                      <Plus className="w-4 h-4" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeStep === 2 && (
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>${calculateSubtotal().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Tax (13%)</span>
                      <span>${calculateTax(calculateSubtotal()).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg pt-2 border-t">
                      <span>Total (Tax included)</span>
                      <span>${calculateTotal()}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-medium">Order Details:</h3>
                  {selectedPhotos.map(photo => (
                    <div key={photo.id} className="border rounded p-4">
                      <div className="flex items-start space-x-4">
                        <img 
                          src={photo.preview} 
                          alt={photo.name}
                          className="w-20 h-20 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium">{photo.name}</h4>
                          <div className="space-y-1 mt-2">
                            {photo.sizes.map(size => {
                              const sizeInfo = printSizes.find(p => p.id === size.sizeId);
                              return (
                                <div key={size.sizeId} className="flex justify-between text-sm">
                                  <span>{sizeInfo.name}</span>
                                  <span>x{size.quantity}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeStep === 3 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="First Name"
                    className="p-2 border rounded"
                  />
                  <input
                    type="text"
                    placeholder="Last Name"
                    className="p-2 border rounded"
                  />
                  <input
                    type="text"
                    placeholder="Address Line 1"
                    className="p-2 border rounded col-span-2"
                  />
                  <input
                    type="text"
                    placeholder="City"
                    className="p-2 border rounded"
                  />
                  <input
                    type="text"
                    placeholder="Postal Code"
                    className="p-2 border rounded"
                  />
                  <select className="p-2 border rounded col-span-2">
                    <option value="">Select Country</option>
                    <option value="US">United States</option>
                    <option value="CA">Canada</option>
                    <option value="GB">United Kingdom</option>
                    <option value="AU">Australia</option>
                    <option value="FR">France</option>
                    <option value="DE">Germany</option>
                    <option value="IT">Italy</option>
                    <option value="ES">Spain</option>
                    <option value="NL">Netherlands</option>
                    <option value="BE">Belgium</option>
                  </select>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <button
                onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
                className={`px-4 py-2 rounded ${
                  activeStep === 0 ? 'invisible' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                Back
              </button>
              <button
                onClick={() => setActiveStep(Math.min(3, activeStep + 1))}
                className="px-4 py-2 bg-yellow-400 text-black rounded hover:bg-yellow-500"
              >
                {activeStep === 3 ? 'Place Order' : 'Continue'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreezePIX;