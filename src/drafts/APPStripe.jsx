import React from 'react';
import { memo, useState, useRef, useCallback, useEffect } from 'react';
import { Upload, ShoppingCart, Package, Camera, X , Loader } from 'lucide-react';
import { loadStripe } from "@stripe/stripe-js";
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import LanguageSelector from './components/LanguageSelector';
import photoprint4x6 from './assets/photoprint4x6.jpg';
import photoprint5x7 from './assets/photoprint5x7.jpg';
import photoprint8x10 from './assets/photoprint8x10.jpg';
import keychain from './assets/keychain.jpg';
import magnet from './assets/magnet.jpg';
import threeDFrame from './assets/3d_frame.jpg';
import Rectangle from './assets/rectangle.jpg';
import Heart from './assets/heart.jpg';
import imageCompression from 'browser-image-compression';
import { processImagesInBatches } from './imageProcessingUtils';
import {clearStateStorage} from './stateManagementUtils';
import Stripe from 'stripe';
//import { sendOrderConfirmation } from './utils/emailService';

import {
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  Elements,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

const stripePromise = loadStripe('pk_live_51Nefi9KmwKMSxU2Df5F2MRHCcFSbjZRPWRT2KwC6xIZgkmAtVLFbXW2Nu78jbPtI9ta8AaPHPY6WsYsIQEOuOkWK00tLJiKQsQ');

const initialCountries = [
  {name: 'United States', 
    value: 'USA', 
    currency: 'USD', 
    rate: 1, 
    size4x6: 0.49,        // Updated from 0.39
    size5x7: 1.99,        // Updated from 1.49
    size8x10: 4.99,       // Added new size
    crystal3d: 140, 
    keychain: 9.99, 
    keyring_magnet: 9.99 },
  { name: 'Canada', 
    value: 'CAN', 
    currency: 'CAD', 
    rate: 1, 
    size4x6: 0.49,        // Updated from 0.39
    size5x7: 1.99,        // Updated from 1.49
    size8x10: 4.99,       // Added new size
    crystal3d: 140, 
    keychain: 9.99, 
    keyring_magnet: 9.99  },
  { name: 'Tunisia', value: 'TUN', currency: 'TND', rate: 1, size10x15: 3, size15x22: 5, keychain: 15, keyring_magnet: 15 },
  { name: 'Germany', value: 'DEU', currency: 'EUR', rate: 1, size4x6: 0.39, size5x7: 1.49, crystal3d: 140, keychain: 9.99, keyring_magnet: 9.99, shippingFee: 9 },
  { name: 'France', value: 'FRA', currency: 'EUR', rate: 1, size4x6: 0.39, size5x7: 1.49, crystal3d: 140, keychain: 9.99, keyring_magnet: 9.99, shippingFee: 9 },
  { name: 'Italy', value: 'ITA', currency: 'EUR', rate: 1, size4x6: 0.39, size5x7: 1.49, crystal3d: 140, keychain: 9.99, keyring_magnet: 9.99, shippingFee: 9 },
  { name: 'Spain', value: 'ESP', currency: 'EUR', rate: 1, size4x6: 0.39, size5x7: 1.49, crystal3d: 140, keychain: 9.99, keyring_magnet: 9.99, shippingFee: 9 },
  { name: 'United Kingdom', value: 'GBR', currency: 'GBP', rate: 1, size4x6: 0.39, size5x7: 1.49, crystal3d: 140, keychain: 9.99, keyring_magnet: 9.99, shippingFee: 9 }
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

const EU_COUNTRIES = [
  'Austria', 'Belgium', 'Bulgaria', 'Croatia', 'Cyprus', 'Czech Republic',
  'Denmark', 'Estonia', 'Finland', 'France', 'Germany', 'Greece', 'Hungary',
  'Ireland', 'Italy', 'Latvia', 'Lithuania', 'Luxembourg', 'Malta',
  'Netherlands', 'Poland', 'Portugal', 'Romania', 'Slovakia', 'Slovenia',
  'Spain', 'Sweden'
];
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
    const { t } = useTranslation(); // Add this line to use translation
  
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
            <option value="">{t('form.select_state')}</option>
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
            <option value="">{t('form.select_province')}</option>
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
    const [paymentMethod, setPaymentMethod] = useState('credit'); // Default payment method

    const [orderSuccess, setOrderSuccess] = useState(false);
    const [isBillingAddressSameAsShipping, setIsBillingAddressSameAsShipping] = useState(true);
    const [isProcessingOrder, setIsProcessingOrder] = useState(false);
    const [showBookingPopup, setShowBookingPopup] = useState(false);
    const fileInputRef = useRef(null);
    const [error, setError] = useState(null);
    const [discountCode, setDiscountCode] = useState('');
    const [discountError, setDiscountError] = useState('');
    const [orderNote, setOrderNote] = useState('');
    const [showPolicyPopup, setShowPolicyPopup] = useState(false);
    const [currentOrderNumber, setCurrentOrderNumber] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isInteracProcessing, setIsInteracProcessing] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

const [interacReference, setInteracReference] = useState('');
    const [formData, setFormData] = useState({
      email: '',
      phone: '',
      shippingAddress: {
        firstName: '',
        lastName: '',
        address: '',
        city: '',
        postalCode: '',
        country: '',
        province: '',
        state: ''
      },
      billingAddress: {
        firstName: '',
        lastName: '',
        address: '',
        city: '',
        postalCode: '',
        country: '',
        province: '',
        state: ''
      },
      paymentMethod: 'cod'
    });
      const [isProductDetailsOpen, setIsProductDetailsOpen] = useState(false);
      const updateFormData = (field, value) => {
        setFormData(prev => ({
          ...prev,
          [field]: value
        }));
      };
      
      // Add a function to handle address updates
      const updateAddress = (type, field, value) => {
        setFormData(prev => ({
          ...prev,
          [`${type}Address`]: {
            ...prev[`${type}Address`],
            [field]: value
          }
        }));
      };

      const handlePhotoUpload = async (files) => {
        const newPhotos = await Promise.all(
          Array.from(files).map(async (file) => {
            const base64 = await convertImageToBase64(file);
            return {
              id: uuidv4(),
              file,
              base64,
              fileName: file.name,
              fileType: file.type,
              quantity: 1,
              size: '4x6', // default size
              productType: 'print' // default product type
            };
          })
        );
      
        setSelectedPhotos(prev => [...prev, ...newPhotos]);
      };
      
      // Function to update photo properties
      const updatePhotoProperties = (photoId, updates) => {
        setSelectedPhotos(prev =>
          prev.map(photo =>
            photo.id === photoId
              ? { ...photo, ...updates }
              : photo
          )
        );
      };

// Function to open the popup
const openProductDetails = () => {
    setIsProductDetailsOpen(true);
};

// Function to close the popup
const closeProductDetails = () => {
    setIsProductDetailsOpen(false);
};
    
      //Product Details popup
     const ProductDetailsPopup = ({ isOpen, onClose, selectedCountry }) => {
  const { t, i18n } = useTranslation();
  const [zoomedImage, setZoomedImage] = useState(null);
  
  const handleImageClick = (imageSrc) => {
    setZoomedImage(imageSrc);
  };

  const closeZoom = () => {
    setZoomedImage(null);
  };

  const translateCategory = (category) => {
    // Use the categories mapping from translation.json
    return t(`categories.${category}`, { defaultValue: category });
  };
  
  const translateProduct = (product) => {
    // Use the products mapping from translation.json
    return t(`products.${product}`, { defaultValue: product });
  };

  // Define product data with price formatting based on country
  const getProductData = (country) => {
    const countryInfo = initialCountries.find(c => c.value === country);
    if (!countryInfo) return [];

    const products = [
      {
        category: 'Photo Prints',
        product: '4x6 Size',
        country: countryInfo.name,
        price: countryInfo.currency === 'TND' 
          ? `${countryInfo.size10x15} TND`
          : `${countryInfo.currency} ${countryInfo.size4x6}`
      },
      {
        category: 'Photo Prints',
        product: '5x7 Size',
        country: countryInfo.name,
        price: countryInfo.currency === 'TND'
          ? `${countryInfo.size15x22} TND`
          : `${countryInfo.currency} ${countryInfo.size5x7}`
      }
    ];

    // Add 8x10" size after 5x7" only for USA and Canada
    if (country === 'USA' || country === 'CAN') {
      products.splice(2, 0, {
        category: 'Photo Prints',
        product: '8x10 Size',
        country: countryInfo.name,
        price: `${countryInfo.currency} ${countryInfo.size8x10}`
      });
    }

    // Add remaining products
    products.push(
      {
        category: 'Keychain',
        product: 'Keychain',
        country: countryInfo.name,
        price: `${countryInfo.currency} ${countryInfo.keychain}`
      },
      {
        category: 'Magnet',
        product: 'Magnet',
        country: countryInfo.name,
        price: `${countryInfo.currency} ${countryInfo.keyring_magnet}`
      }
    );

    // Only add 3D Frame if the country is not Tunisia
    if (country !== 'TUN') {
      products.push({
        category: '3D Frame',
        product: 'Rectangle',
        country: countryInfo.name,
        price: countryInfo.crystal3d 
          ? `${countryInfo.currency} ${countryInfo.crystal3d}`
          : 'N/A'
      },{
        category: '3D Frame',
        product: 'Heart',
        country: countryInfo.name,
        price: countryInfo.crystal3d 
          ? `${countryInfo.currency} ${countryInfo.crystal3d}`
          : 'N/A'
      });
    }

    return products;
};

  const getImageSrc = (product) => {
    const imageMap = {
      '4x6 Size': photoprint4x6,
      '5x7 Size': photoprint5x7,
      '8x10 Size': photoprint8x10,
      'Keychain': keychain,
      'Magnet': magnet,
      'Rectangle': Rectangle,
      'Heart' : Heart
    };
  
    return imageMap[product] || '';
  };

  if (!isOpen) return null;

  const productData = getProductData(selectedCountry);

  return (
    <>
      {zoomedImage && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="relative bg-white rounded-lg w-[94%] max-w-xl">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-bold">{t('productDetails.imagePreview')}</h2>
              <button
                onClick={closeZoom}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                aria-label="Close zoom"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-4">
              <img
                src={zoomedImage}
                alt={t('productDetails.imagePreview')}
                className="w-full h-auto rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
      
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
        <div className="relative bg-white rounded-lg w-[94%] max-w-xl h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white p-4 border-b">
            <h2 className="text-lg font-bold">
              {t('productDetails.title')} {initialCountries.find(c => c.value === selectedCountry)?.name}
            </h2>
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-gray-200 rounded-full transition-colors"
              aria-label="Close"
            >
              <X size={24} />
            </button>
          </div>
          
          <div className="p-4">
  <div className="grid grid-cols-1 gap-4">
    {productData.map((product, index) => (
      <div key={index} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
        <div className="grid grid-cols-2 p-4 items-center">
          <div className="space-y-4">
            <div>
              <div className="text-xs font-medium text-gray-500 uppercase">
                {t('productDetails.category')}
              </div>
              <div className="text-sm">
                {translateCategory(product.category)}
              </div>
            </div>
            
            <div>
              <div className="text-xs font-medium text-gray-500 uppercase">
                {t('productDetails.product')}
              </div>
              <div className="text-sm">
                {translateProduct(product.product)}
              </div>
            </div>
            
            <div>
              <div className="text-xs font-medium text-gray-500 uppercase">
                {t('productDetails.price')}
              </div>
              <div className="text-sm">
                {product.price}
              </div>
            </div>
          </div>
          
          <div className="justify-self-center">
            {getImageSrc(product.product) && (
              <img
                src={getImageSrc(product.product)}
                alt={translateProduct(product.product)}
                className="h-32 w-32 object-cover cursor-pointer rounded-lg"
                onClick={() => handleImageClick(getImageSrc(product.product))}
              />
            )}
          </div>
        </div>
      </div>
    ))}
  </div>
</div>
        </div>
      </div>
    </>
  );
};
     // Add these helper functions at the beginning of your component
     const convertImageToBase64 = (file) => {
         return new Promise((resolve, reject) => {
             const reader = new FileReader();
             reader.onload = () => resolve(reader.result);
             reader.onerror = reject;
             reader.readAsDataURL(file);
         });
     };
     
     const base64ToFile = (base64String, fileName) => {
         const arr = base64String.split(',');
         const mime = arr[0].match(/:(.*?);/)[1];
         const bstr = atob(arr[1]);
         let n = bstr.length;
         const u8arr = new Uint8Array(n);
         while (n--) {
             u8arr[n] = bstr.charCodeAt(n);
         }
         return new File([u8arr], fileName, { type: mime });
     };
     
     // Modify the save state useEffect to handle image conversion
     useEffect(() => {
         const saveState = async () => {
             try {
                 const photosWithBase64 = await Promise.all(
                     selectedPhotos.map(async (photo) => {
                         if (photo.file && !photo.base64) {
                             const base64 = await convertImageToBase64(photo.file);
                             return {
                                 ...photo,
                                 base64,
                                 // Store original file properties we need
                                 fileName: photo.file.name,
                                 fileType: photo.file.type,
                             };
                         }
                         return photo;
                     })
                 );
     
                 const stateToSave = {
                     showIntro,
                     selectedCountry,
                     selectedPhotos: photosWithBase64,
                     activeStep,
                     formData
                 };
                 localStorage.setItem('freezepixState', JSON.stringify(stateToSave));
             } catch (error) {
                 console.error('Error saving state:', error);
             }
         };
     
         saveState();
     }, [showIntro, selectedCountry, selectedPhotos, activeStep, formData]);
     
     // Modify the load state useEffect to handle image reconstruction
     useEffect(() => {
         const loadState = async () => {
             const savedState = localStorage.getItem('freezepixState');
             if (savedState) {
                 try {
                     const parsedState = JSON.parse(savedState);
                     
                     // Reconstruct files from base64
                     const photosWithFiles = parsedState.selectedPhotos.map(photo => {
                         if (photo.base64) {
                             const file = base64ToFile(photo.base64, photo.fileName);
                             return {
                                 ...photo,
                                 file,
                                 preview: photo.base64, // Use base64 as preview URL
                             };
                         }
                         return photo;
                     });
     
                     setShowIntro(parsedState.showIntro);
                     setSelectedCountry(parsedState.selectedCountry);
                     setSelectedPhotos(photosWithFiles);
                     setActiveStep(parsedState.activeStep);
                     setFormData(parsedState.formData);
                 } catch (error) {
                     console.error('Error loading saved state:', error);
                     localStorage.removeItem('freezepixState');
                 }
             }
         };
     
         loadState();
     }, []);

     // Add cleanup for preview URLs
useEffect(() => {
  return () => {
      // Cleanup preview URLs when component unmounts
      selectedPhotos.forEach(photo => {
          if (photo.preview && !photo.preview.startsWith('data:')) {
              URL.revokeObjectURL(photo.preview);
          }
      });
  };
}, [selectedPhotos]);

// Add this effect to update prices when country changes
// Update the useEffect for country change
useEffect(() => {
    if (selectedCountry) {
        const country = initialCountries.find(c => c.value === selectedCountry);
        if (!country) return;

        // Update prices for all photos when country changes
        setSelectedPhotos(prevPhotos => 
            prevPhotos.map(photo => ({
                ...photo,
                price: calculateItemPrice({ 
                    size: photo.size || '10x15',
                    quantity: photo.quantity || 1
                }, country)
            }))
        );

        // Update form data
        setFormData(prev => ({
            ...prev,
            shippingAddress: {
                ...prev.shippingAddress,
                country: selectedCountry,
                state: '',
                province: ''
            },
            billingAddress: {
                ...prev.billingAddress,
                country: selectedCountry,
                state: '',
                province: ''
            },
            paymentMethod: selectedCountry === 'TUN' ? 'cod' : 'credit'
        }));
    }
}, [selectedCountry]);

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
      case '8x10' : return country.size8x10;
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
const convertFileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

//email send 
const sendOrderConfirmationEmail = async (orderData) => {
  try {
    // Helper function to get product description
    const getProductDescription = (photo) => {
      switch (photo.productType) {
        case 'photo_print':
          return `Print - ${photo.size}`;
        case '3d_frame':
          return '3D Crystal Frame';
        case 'keychain':
          return 'Photo Keychain';
        case 'keyring_magnet':
          return 'Keyring Magnet';
        default:
          return 'Custom Product';
      }
    };

    // Create order summary with detailed product information
    const emailOrderData = {
          // Initialize with empty array if photos are missing
      orderNumber: orderData.orderNumber || 'N/A',
      email: orderData.email || 'N/A',
      shippingAddress: {
        firstName: orderData?.shippingAddress?.firstName || '',
        lastName: orderData?.shippingAddress?.lastName || '',
        address: orderData?.shippingAddress?.address || '',
        city: orderData?.shippingAddress?.city || '',
        state: orderData?.shippingAddress?.state || '',
        province: orderData?.shippingAddress?.province || '',
        postalCode: orderData?.shippingAddress?.postalCode || '',
        country: orderData?.shippingAddress?.country || ''
      },
      phone: orderData.phone || 'N/A',
      orderNote: orderData.orderNote || '',
      paymentMethod: orderData.paymentMethod || 'N/A',
      selectedPhotos: orderData.selectedPhotos || [],
      totalAmount: orderData.totalAmount || 0,
      currency: orderData.currency || 'USD'
    };

    console.log('Sending order summary email:', JSON.stringify(emailOrderData, null, 2));
//.
    const response = await fetch('https://freezepix-email-service-80156ac7d026.herokuapp.com/send-order-confirmation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(emailOrderData)
    });

    const responseData = await response.json().catch(e => null);
    
    if (!response.ok) {
      throw {
        message: `Email service error: ${responseData?.message || response.statusText}`,
        status: response.status,
        response: responseData
      };
    }

    return responseData;
  } catch (error) {
    console.error('Detailed email service error:', {
      message: error.message,
      status: error.status,
      response: error.response,
      stack: error.stack
    });
    throw error;
  }
};

const handlePaymentMethodChange = (event) => {
  setPaymentMethod(event.target.value);
};



    // Inside the FreezePIX component, modify the order success handling:

// Utility function for image optimization
const optimizeImage = async (file, maxSizeMB = 1, maxWidthOrHeight = 1920) => {
  try {
    const options = {
      maxSizeMB,
      maxWidthOrHeight,
      useWebWorker: true,
      fileType: 'image/jpeg'
    };
    return await imageCompression(file, options);
  } catch (error) {
    console.error('Image optimization error:', error);
    return file; // Return original file if optimization fails
  }
};

// Storage optimization utility
const optimizePhotoForStorage = (photo) => {
  // Keep only essential data for storage
  return {
    id: photo.id,
    thumbnail: photo.thumbnail,
    price: photo.price,
    quantity: photo.quantity,
    size: photo.size,
    // Store minimal metadata, drop large file data
    metadata: {
      name: photo.file?.name,
      lastModified: photo.file?.lastModified,
      type: photo.file?.type
    }
  };
};

// Enhanced state storage with cleanup
const saveStateWithCleanup = async (state) => {
  try {
    // Optimize photos before storage
    const optimizedState = {
      ...state,
      selectedPhotos: state.selectedPhotos?.map(optimizePhotoForStorage)
    };

    // Calculate approximate size
    const stateSize = new Blob([JSON.stringify(optimizedState)]).size;
    
    // If approaching quota (5MB typical limit), clean up old data
    if (stateSize > 4 * 1024 * 1024) { // 4MB threshold
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('freezepixState_old_')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
    }

    const compressedState = LZString.compressToUTF16(JSON.stringify(optimizedState));
    localStorage.setItem(STORAGE_KEY, compressedState);
    
    return true;
  } catch (error) {
    if (error.name === 'QuotaExceededError') {
      // Emergency cleanup - remove everything except current order
      Object.keys(localStorage).forEach(key => {
        if (key !== STORAGE_KEY) {
          localStorage.removeItem(key);
        }
      });
      // Try one more time after cleanup
      try {
        return await saveStateWithCleanup(state);
      } catch (retryError) {
        console.error('Failed to save state even after cleanup:', retryError);
        return false;
      }
    }
    return false;
  }
};

// Optimized order submission with better chunking and progress tracking
const submitOrderWithOptimizedChunking = async (orderData) => {
  const { orderItems } = orderData;
  const results = [];
  const CHUNK_SIZE = 6; // Reduced chunk size
  const CONCURRENT_CHUNKS = 2; // Number of chunks to process simultaneously
  
  // Split items into smaller chunks
  const chunks = [];
  for (let i = 0; i < orderItems.length; i += CHUNK_SIZE) {
    chunks.push(orderItems.slice(i, i + CHUNK_SIZE));
  }

  // Process chunks with controlled concurrency
  for (let i = 0; i < chunks.length; i += CONCURRENT_CHUNKS) {
    const currentChunks = chunks.slice(i, i + CONCURRENT_CHUNKS);
    const chunkPromises = currentChunks.map((chunk, index) => {
      return axios.post(
        'https://freezepix-database-server-c95d4dd2046d.herokuapp.com/api/orders/chunk',
        { ...orderData, orderItems: chunk },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 30000,
          retries: 2,
          retryDelay: 1000
        }
      ).catch(async (error) => {
        // Implement exponential backoff for retries
        let retryCount = 0;
        const maxRetries = 2;
        
        while (retryCount < maxRetries) {
          try {
            await new Promise(resolve => 
              setTimeout(resolve, Math.pow(2, retryCount) * 1000)
            );
            return await axios.post(
              'https://freezepix-database-server-c95d4dd2046d.herokuapp.com/api/orders/chunk',
              { ...orderData, orderItems: chunk },
              {
                headers: { 'Content-Type': 'application/json' },
                timeout: 45000
              }
            );
          } catch (retryError) {
            retryCount++;
            if (retryCount === maxRetries) throw retryError;
          }
        }
      });
    });

    // Wait for current batch of chunks to complete
    const chunkResults = await Promise.allSettled(chunkPromises);
    
    // Process results and update progress
    chunkResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        results.push(result.value.data);
      } else {
        console.error(`Failed to process chunk ${i + index}:`, result.reason);
        throw result.reason;
      }
    });

    // Update progress
    const progress = Math.round(((i + currentChunks.length) / chunks.length) * 100);
    if (typeof orderData.onProgress === 'function') {
      orderData.onProgress(progress);
    }
  }

  return results;
};
const CheckoutForm = ({ orderData, onSuccess, onError }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if this is a redirect back from Checkout
    const query = new URLSearchParams(window.location.search);
    
    if (query.get('success')) {
      const sessionId = query.get('session_id');
      validatePayment(sessionId);
    }

    if (query.get('canceled')) {
      setError('Order canceled -- continue to shop around and checkout when you\'re ready.');
    }
  }, []);

  // Add this function to calculate Canadian taxes
const calculateCanadianTaxes = (province, subtotal) => {
  const taxes = TAX_RATES['CA'][province];
  let totalTax = 0;

  if (taxes) {
    if (taxes.HST) {
      totalTax = subtotal * (taxes.HST / 100);
    } else {
      if (taxes.GST) totalTax += subtotal * (taxes.GST / 100);
      if (taxes.PST) totalTax += subtotal * (taxes.PST / 100);
      if (taxes.QST) totalTax += subtotal * (taxes.QST / 100);
    }
  }

  return totalTax;
};

// Add this function to prepare order data
const prepareOrderData = () => {
  const subtotal = calculateSubtotal();
  const shippingFee = calculateShippingFee();
  let tax = 0;
  let orderNumber = null;
  // Generate order number
  orderNumber = generateOrderNumber();
  setCurrentOrderNumber(orderNumber);

  if (formData.shippingAddress.country === 'CAN') {
    tax = calculateCanadianTaxes(formData.shippingAddress.province, subtotal);
  }

  const total = subtotal + shippingFee + tax;

  return {
    orderNumber,
      email: formData.email,
      phone: formData.phone,
      shippingAddress: formData.shippingAddress,
      billingAddress: isBillingAddressSameAsShipping
        ? formData.shippingAddress
        : formData.billingAddress,
    orderItems: selectedPhotos.map(photo => ({
      id: photo.id,
      quantity: photo.quantity,
      size: photo.size,
      productType: photo.productType,
      fileName: photo.fileName
    })),
    customerInfo: {
      email: formData.email,
      phone: formData.phone,
      shippingAddress: formData.shippingAddress,
      billingAddress: isBillingAddressSameAsShipping 
        ? formData.shippingAddress 
        : formData.billingAddress
    },
    orderDetails: {
      subtotal,
      tax,
      shippingFee,
      total,
      currency: initialCountries.find(c => c.value === selectedCountry)?.currency,
      paymentMethod: paymentMethod
    },
    orderNote: orderNote,
    discountCode: discountCode
  };
};

const calculateSubtotal = () => {
  const countryInfo = initialCountries.find(c => c.value === selectedCountry);
  
  return selectedPhotos.reduce((total, photo) => {
    let price = 0;
    
    switch (photo.productType) {
      case 'print':
        switch (photo.size) {
          case '4x6': price = countryInfo.size4x6; break;
          case '5x7': price = countryInfo.size5x7; break;
          case '8x10': price = countryInfo.size8x10; break;
          default: price = 0;
        }
        break;
      case 'keychain': price = countryInfo.keychain; break;
      case 'magnet': price = countryInfo.keyring_magnet; break;
      case '3d_frame': price = countryInfo.crystal3d; break;
      default: price = 0;
    }
    
    return total + (price * photo.quantity);
  }, 0);
};

// Helper function to calculate shipping fee
const calculateShippingFee = () => {
  const countryInfo = initialCountries.find(c => c.value === selectedCountry);
  return countryInfo?.shippingFee || 0;
};

  const validatePayment = async (sessionId) => {
    try {
      const response = await fetch('https://freezepix-database-server-c95d4dd2046d.herokuapp.com/api/validate-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      });

      const data = await response.json();
      
      if (data.success) {
        onSuccess(data.orderId);
      } else {
        onError(data.error);
      }
    } catch (err) {
      onError('Failed to validate payment');
    }
  };


  return (
    <div className="w-full max-w-md mx-auto">
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
      
      <button
        onClick={() => handleOrderSuccess(true)}
        disabled={loading}
        className={`w-full py-3 px-4 rounded-md text-white font-medium
          ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
      >
        {loading ? 'Processing...' : 'Proceed to Checkout'}
      </button>
    </div>
  );
};
const calculateCanadianTaxes = (province, subtotal) => {
  const provinceTaxes = TAX_RATES['CA'][province];
  let taxDetails = {};
  let totalTax = 0;

  if (provinceTaxes) {
    if (provinceTaxes.HST) {
      totalTax = subtotal * (provinceTaxes.HST / 100);
      taxDetails = { HST: provinceTaxes.HST, amount: totalTax };
    } else {
      let gstAmount = 0;
      let pstAmount = 0;
      let qstAmount = 0;

      if (provinceTaxes.GST) {
        gstAmount = subtotal * (provinceTaxes.GST / 100);
        taxDetails.GST = { rate: provinceTaxes.GST, amount: gstAmount };
        totalTax += gstAmount;
      }
      if (provinceTaxes.PST) {
        pstAmount = subtotal * (provinceTaxes.PST / 100);
        taxDetails.PST = { rate: provinceTaxes.PST, amount: pstAmount };
        totalTax += pstAmount;
      }
      if (provinceTaxes.QST) {
        qstAmount = subtotal * (provinceTaxes.QST / 100);
        taxDetails.QST = { rate: provinceTaxes.QST, amount: qstAmount };
        totalTax += qstAmount;
      }
    }
  }

  return { taxAmount: totalTax, taxDetails };
};
  // Add orderData state
  const [orderData, setOrderData] = useState({
    items: [],
    subtotal: 0,
    tax: 0,
    shipping: 0,
    total: 0,
    discounts: [],
    currency: 'USD'
  });

  // Function to update order data
  const updateOrderData = useCallback((updates) => {
    setOrderData(prevData => ({
      ...prevData,
      ...updates
    }));
  }, []);
const handleOrderSuccess = async (checkoutMode = false) => {
  let orderData = null;
  let orderNumber = null;
  let paymentIntent = null;
  const stripePromise = loadStripe('pk_live_51Nefi9KmwKMSxU2Df5F2MRHCcFSbjZRPWRT2KwC6xIZgkmAtVLFbXW2Nu78jbPtI9ta8AaPHPY6WsYsIQEOuOkWK00tLJiKQsQ');

  try {
    setIsProcessingOrder(true);
    setOrderSuccess(false);
    setError(null);
    setUploadProgress(0);

    // Validate Canadian province
    if (selectedCountry === 'CAN' && !formData.shippingAddress?.province) {
      throw new Error(t('errors.provinceRequired'));
    }

    // Generate order number
    orderNumber = generateOrderNumber();
    setCurrentOrderNumber(orderNumber);

    // Calculate order totals with tax handling
    const calculateTotals = () => {
      const country = initialCountries.find(c => c.value === selectedCountry);
      const subtotal = selectedPhotos.reduce((acc, photo) => {
        return acc + (calculateItemPrice(photo, country) * photo.quantity);
      }, 0);

      let taxAmount = 0;
      let taxDetails = {};

      if (selectedCountry === 'CAN' && formData.shippingAddress?.province) {
        const canadianTaxes = calculateCanadianTaxes(formData.shippingAddress.province, subtotal);
        taxAmount = canadianTaxes.taxAmount;
        taxDetails = canadianTaxes.taxDetails;
      }

      const shippingFee = country.shippingFee || 0;
    const discountAmount = (discountCode.toUpperCase() === 'B2B' || discountCode.toUpperCase() === 'MOHAMED') ? subtotal * 0.5 : (discountCode.toUpperCase() === 'MCF99') ? (subtotal + shippingFee) * 0.99 : 0;
      const total = subtotal + taxAmount + shippingFee - discountAmount;

      return {
        total,
        subtotal,
        taxAmount,
        taxDetails,
        shippingFee,
        currency: country.currency,
        discount: discountAmount
      };
    };

    const { total, currency, subtotal, shippingFee, taxAmount, taxDetails, discount } = calculateTotals();
    const country = initialCountries.find(c => c.value === selectedCountry);

    // Process photos with improved batch processing and error handling
    const processPhotosWithProgress = async () => {
      try {
        const optimizedPhotosWithPrices = await processImagesInBatches(
          selectedPhotos.map(photo => ({
            ...photo,
            price: photo.price || calculateItemPrice(photo, country)
          })),
          (progress) => {
            setUploadProgress(Math.round(progress));
            if (progress % 20 === 0) {
              saveStateWithCleanup({
                orderNumber,
                progress,
                timestamp: new Date().toISOString()
              });
            }
          }
        );
        return optimizedPhotosWithPrices;
      } catch (processError) {
        console.error('Photo processing error:', processError);
        throw new Error(t('errors.photoProcessingFailed'));
      }
    };

    const optimizedPhotosWithPrices = await processPhotosWithProgress();

    // Construct enhanced order data
    orderData = {
      orderNumber,
      email: formData.email,
      phone: formData.phone,
      shippingAddress: {
        ...formData.shippingAddress,
        country: selectedCountry,
        province: selectedCountry === 'CAN' ? formData.shippingAddress.province : undefined
      },
      billingAddress: isBillingAddressSameAsShipping
        ? { ...formData.shippingAddress }
        : {
            ...formData.billingAddress,
            country: selectedCountry,
            province: selectedCountry === 'CAN' ? formData.billingAddress.province : undefined
          },
      orderItems: optimizedPhotosWithPrices.map(photo => ({
        ...photo,
        file: photo.file,
        thumbnail: photo.thumbnail,
        id: photo.id,
        quantity: photo.quantity,
        size: photo.size,
        price: photo.price,
        productType: photo.productType
      })),
      pricing: {
        subtotal,
        tax: {
          amount: taxAmount,
          details: taxDetails
        },
        shipping: shippingFee,
        discount,
        total
      },
      currency: country.currency,
      orderNote: orderNote || '',
      paymentMethod: selectedCountry === 'TUN' ? 'cod' : 'credit',
      paymentStatus: selectedCountry === 'TUN' ? 'pending' : 'pending',
      customerDetails: {
        name: formData.name,
        country: selectedCountry
      },
      selectedCountry,
      discountCode: discountCode || null,
      createdAt: new Date().toISOString(),
      taxDetails: selectedCountry === 'CAN' ? taxDetails : undefined
    };

     // Submit order with retry mechanism
     const maxRetries = 3;
     let retryCount = 0;
     let responses;
 
     while (retryCount < maxRetries) {
       try {
         responses = await submitOrderWithOptimizedChunking(orderData);
         if (responses && responses.length > 0) {
           break;
         }
         throw new Error('Empty response received');
       } catch (submitError) {
         retryCount++;
         console.error(`Order submission attempt ${retryCount} failed:`, submitError);
         
         if (retryCount === maxRetries) {
           throw new Error(t('errors.orderSubmissionFailed'));
         }
         // Exponential backoff
         await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount)));
       }
     }
     if (orderData) {
      updateOrderData(orderData);
    }

     // Send confirmation email with retry
     let emailSent = false;
     retryCount = 0;
     
     while (retryCount < maxRetries && !emailSent) {
       try {
         await sendOrderConfirmationEmail({
           ...orderData,
           orderItems: orderData.orderItems.map(item => ({
             ...item,
             file: undefined,
             thumbnail: item.thumbnail
           }))
         });
         emailSent = true;
       } catch (emailError) {
         retryCount++;
         console.error(`Email sending attempt ${retryCount} failed:`, emailError);
         if (retryCount < maxRetries) {
           await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount)));
         }
       }
     }
 
     setOrderSuccess(true);
     console.log('Order created successfully:', {
       orderNumber,
       totalItems: orderData.orderItems.length,
       responses
     });
 
     // Cleanup
     try {
       clearStateChunks();
       await saveStateWithCleanup({
         orderNumber,
         orderDate: new Date().toISOString(),
         totalAmount: total,
         currency: country.currency,
         itemCount: orderData.orderItems.length,
         customerEmail: formData.email
       });
       setSelectedPhotos([]);
     } catch (cleanupError) {
       console.warn('Post-order cleanup warning:', cleanupError);
     }

  } catch (error) {
    console.error('Order Processing Error:', error);

    // Attempt to rollback/cleanup any partial processing
    try {
      if (paymentIntent?.id) {
        const stripe = await stripePromise;
        await stripe.cancelPaymentIntent(paymentIntent.id);
      }
    } catch (rollbackError) {
      console.error('Rollback failed:', rollbackError);
    }

    let errorMessage = t('errors.genericError');
    
    if (error.response?.data?.details) {
      errorMessage = error.response.data.details;
    } else if (error.response?.data?.error) {
      errorMessage = error.response.data.error;
    } else if (error.message) {
      errorMessage = error.message
        .replace('TypeError:', '')
        .replace('Error:', '')
        .trim();
    }

    setError(errorMessage);
    setOrderSuccess(false);

    if (typeof trackError === 'function') {
      trackError({
        error,
        orderNumber,
        context: 'handleOrderSuccess',
        timestamp: new Date().toISOString()
      });
    }

    try {
      await saveStateWithCleanup({
        failedOrderNumber: orderNumber,
        errorMessage,
        timestamp: new Date().toISOString(),
        recoveryData: {
          formData,
          selectedPhotos: selectedPhotos?.map(photo => ({
            id: photo.id,
            thumbnail: photo.thumbnail,
            price: photo.price,
            quantity: photo.quantity,
            size: photo.size
          }))
        }
      });
    } catch (storageError) {
      console.warn('Failed to save error state:', storageError);
    }

    throw error;

  } finally {
    setIsProcessingOrder(false);
    setUploadProgress(0);
    
    if (orderSuccess) {
      clearStateStorage();
    }
  }
};
  
  

const PaymentForm = ({ onPaymentSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const CARD_ELEMENT_OPTIONS = {
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
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isProcessing || !stripe || !elements) {
      return;
    }
  
    setIsProcessing(true);
    setError(null);
  
    try {
      // Create payment method
      const { error: methodError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: elements.getElement(CardNumberElement),
        billing_details: {
          address: {
            postal_code: postalCode,
          },
        },
      });
  
      if (methodError) {
        throw new Error(methodError.message);
      }
  
      // Process payment
      const paymentResult = await handlePayment(
        paymentMethod.id,
        amount,
        currency,
        { orderNumber, customerEmail }
      );
  
      // Handle successful payment
      if (paymentResult.success) {
        await onSubmit(paymentResult.paymentMethod, postalCode);
      }
  
    } catch (error) {
      setError(error.message);
      // Clear sensitive form fields on error
      elements.getElement(CardNumberElement).clear();
      elements.getElement(CardExpiryElement).clear();
      elements.getElement(CardCvcElement).clear();
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-col space-y-4">
        <div className="p-4 border rounded">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Card Number
          </label>
          <CardNumberElement options={CARD_ELEMENT_OPTIONS} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 border rounded">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expiration Date
            </label>
            <CardExpiryElement options={CARD_ELEMENT_OPTIONS} />
          </div>

          <div className="p-4 border rounded">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CVC
            </label>
            <CardCvcElement options={CARD_ELEMENT_OPTIONS} />
          </div>
        </div>
      </div>

      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}

      <button
        type="submit"
        disabled={!stripe || isProcessing || isProcessingOrder}
        className="w-full py-2 bg-yellow-400 text-black rounded hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isProcessing || isProcessingOrder ? (
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
        const validCodes = ['B2B', 'MOHAMED','MCF99'];
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
        // First check if the current step is valid
        if (!validateStep()) {
          setError('Please complete all required fields before proceeding');
          return;
        }
      
        try {
          if (activeStep === 2) {
            if (selectedCountry === 'TUN' || paymentMethod === 'interac') {
              setIsLoading(true);
              await handleOrderSuccess();
            } else {
              setActiveStep(prev => prev + 1);
            }
          } else {
            setError(null); // Clear any previous errors
            setActiveStep(prev => prev + 1);
          }
        } catch (error) {
          setError('An error occurred while processing your request');
          console.error('Error in handleNext:', error);
        } finally {
          setIsLoading(false);
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
        '8x10': 0,
        '3d_frame': 0, 
        'keychain': 0, 
        'keyring_magnet': 0 
    }; 

    const subtotalsBySize = { 
        '4x6': 0, 
        '5x7': 0, 
        '10x15': 0, 
        '15x22': 0, 
        '8x10' : 0,
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
              } else if ((selectedCountry === 'USA' || selectedCountry === 'CAN') && photo.size === '8x10') {
                  subtotalsBySize[photo.size] += (photo.quantity || 1) * country.size8x10;
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
    const isOrderOverThreshold = subtotal >= 50; // Base threshold value

    if (!isOrderOverThreshold) {
        if (selectedCountry === 'TUN') {
            shippingFee = 8; // 8 TND for Tunisia
        } else if (selectedCountry === 'USA') {
            shippingFee = 9; // 9$ for USA
        } else if (selectedCountry === 'CAN') {
            shippingFee = 9; // 9$ for Canada
        } else if (selectedCountry === 'GBR') {
            shippingFee = 9; // 9£ for United Kingdom
        } else if (['DEU', 'FRA', 'ITA', 'ESP'].includes(selectedCountry)) {
            shippingFee = 9; // 9€ for European countries
        }
    }

    // Calculate discount if applicable 
    const discount = (discountCode.toUpperCase() === 'B2B' || discountCode.toUpperCase() === 'MOHAMED') ? subtotal * 0.5 : (discountCode.toUpperCase() === 'MCF99') ? (subtotal + shippingFee) * 0.99 : 0;
    // Calculate tax based on location, including shipping fee 
    let taxAmount = 0; 
    const taxableAmount = subtotal + shippingFee; // Include shipping fee in tax calculation 
    if (selectedCountry === 'TUN') { 
        taxAmount = taxableAmount * 0.19; // 19% TVA for Tunisia 
    } else if (selectedCountry === 'CAN') { 
        const province = formData.shippingAddress.province; 
        const provinceTaxes = TAX_RATES['CA'][province]; 

        if (provinceTaxes) { 
            if (provinceTaxes.HST) { 
                taxAmount = taxableAmount * (provinceTaxes.HST / 100); 
            } else { 
                // Calculate GST 
                if (provinceTaxes.GST) { 
                    taxAmount += taxableAmount * (provinceTaxes.GST /  100); 
                } 
                // Calculate PST or QST 
                if (provinceTaxes.PST) { 
                    taxAmount += taxableAmount * (provinceTaxes.PST / 100); 
                } 
                if (provinceTaxes.QST) { 
                    taxAmount += taxableAmount * (provinceTaxes.QST / 100); 
                } 
            } 
        } 
    } 

    // Calculate total 
    const total = (taxableAmount + taxAmount) - discount; 

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
                <h2 className="text-xl font-medium">{t('form.select_photo')}</h2>
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2 bg-yellow-400 text-black rounded hover:bg-yellow-500"
                >
                    <Upload size={20} />
                    {t('buttons.add_photos')}
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
                            {(['USA', 'CAN', 'DEU', 'FRA', 'ITA', 'ESP', 'GBR'].includes(selectedCountry)) && (
                                <select
                                    value={photo.productType}
                                    onChange={(e) => updateProductType(photo.id, e.target.value)}
                                    className="w-full p-1 border rounded"
                                >
                                    <option value="photo_print">{t('produits.photo_print')}</option>
                                    <option value="3d_frame">{t('produits.3d_frame')}</option>
                                    <option value="keychain">{t('produits.keychain')}</option>
                                    <option value="keyring_magnet">{t('produits.magnet')}</option>
                                </select>
                            )}

                            {/* Product Type Selection for Tunisia */}
                            {selectedCountry === 'TUN' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {t('produits.product')}
                                    </label>
                                    <select
                                        value={photo.productType}
                                        onChange={(e) => updateProductType(photo.id, e.target.value)}
                                        className="w-full p-1 border rounded"
                                    >
                                        <option value="photo_print">{t('produits.photo_print')}</option>
                                        <option value="keyring_magnet">{t('produits.magnet')}</option>
                                        <option value="keychain">{t('produits.keychain')}</option>
                                    </select>
                                </div>
                            )}

                            {/* Size selection for photo prints */}
                            {photo.productType === 'photo_print' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {t('produits.size')}
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
    ) : selectedCountry === 'USA' || selectedCountry === 'CAN' ? (
        <>
            <option value="4x6">4x6"</option>
            <option value="5x7">5x7"</option>
            <option value="8x10">8x10"</option>
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
                                    <label class Name="block text-sm font-medium text-gray-700 mb-1">
                                        {t('produits.shape')}
                                    </label>
                                    <select
                                        value={photo.crystalShape}
                                        onChange={(e) => updateCrystalShape(photo.id, e.target.value)}
                                        className="w-full p-1 border rounded"
                                    >
                                        <option value="rectangle">{t('produits.rectangle')}</option>
                                        <option value="heart">{t('produits.heart')}</option>
                                    </select>
                                </div>
                            )}

                            {/* Standard Size selection for Keychain and Keyring & Magnet */}
                            {(['keychain', 'keyring_magnet'].includes(photo.productType)) && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {t('produits.size')}
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
                                    {t('produits.quantity')}
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

                            {/* Single Details button at the end */}
                            <button onClick={openProductDetails} className="text-sm text-blue-500 underline">
                            {t('produits.details')}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            <ProductDetailsPopup 
            isOpen={isProductDetailsOpen} 
            onClose={closeProductDetails} 
            selectedCountry={selectedCountry} 
        />
        </div>
    );
      case 1:
      return (
        <div className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-xl font-medium">        {t('validation.contact_info')}
            </h2>
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
            <h2 className="text-xl font-medium"> {t('form.shipping_a')}</h2>
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
                {t('form.same_address')}

                </label>
              </div>

              {!isBillingAddressSameAsShipping && (
                <>
                  <h2 className="text-xl font-medium">{t('form.billing_a')}</h2>
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
            <h2 className="text-xl font-medium">{t('buttons.review')}</h2>
            {renderInvoice()}
      
            {selectedCountry === 'TUN' ? (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-center text-gray-600">
                    {t('order.cod')}
                  </p>
                </div>
              </div>
            ) : selectedCountry === 'CAN' ? (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">{t('canada.options')}</h3>
                  
                  {/* Sélection du mode de paiement */}
                  <div className="mb-4">
                    <h4 className="font-medium">{t('canada.select')}</h4>
                    <label className="block">
                      <input
                        type="radio"
                        value="interac"
                        checked={paymentMethod === 'interac'}
                        onChange={handlePaymentMethodChange}
                        className="mr-2"
                      />
                      {t('canada.interac')}
                    </label>
                    <label className="block">
                      <input
                        type="radio"
                        value="credit"
                        checked={paymentMethod === 'credit'}
                        onChange={handlePaymentMethodChange}
                        className="mr-2"
                      />
                      {t('canada.credit')}
                    </label>
                  </div>
      
                  {/* Option de paiement Interac */}
                  {paymentMethod === 'interac' && (
                    <div className="border rounded-lg p-4 mb-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{t('canada.interac')}</h4>
                          <p className="text-sm text-gray-600">{t('canada.send')}</p>
                          <p className="font-bold">Info@freezepix.com</p>
                        </div>
                        <img 
                          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTp9FibB-R9ac8XXEootfuHyEdTuaeJ9bZiQQ&s" 
                          alt="Interac E-Transfer" 
                          className="h-12 w-auto"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        {t('canada.placing')}
                      </p>
                      {/* Bouton de commande pour Interac */}
                      
                    </div>
                  )}
      
                  {/* Option de paiement par carte de crédit */}
                  {paymentMethod === 'credit' && (
  <Elements stripe={stripePromise}>
   <CheckoutForm 
  orderData={orderData} 
  onSuccess={(orderId) => console.log('Payment successful:', orderId)} 
  onError={(error) => console.error('Payment failed:', error)} 
      processing={isProcessingOrder}
      paymentMethod={paymentMethod}
/>
  </Elements>
)}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-center text-gray-600">
                    {t('canada.message_c')}
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
    const { subtotalsBySize, subtotal, shippingFee, total, quantities, discount,taxAmount } = calculateTotals();
    const country = initialCountries.find(c => c.value === selectedCountry);
    
    return (
      <div className="space-y-6">
        
  
        {/* Contact Information */}
        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-3">{t('validation.contact_info')}</h3>
          <p className="text-gray-600">{formData.email}</p>
          <p className="text-gray-600">{formData.phone}</p>
        </div>
  
        {/* Shipping Address */}
        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-3">{t('form.shipping_a')}</h3>
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
            <h3 className="font-medium mb-3">{t('form.billing_a')}</h3>
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
          <h3 className="font-medium mb-3">{t('order.discount')}</h3>
          <div className="space-y-2">
            <input
  type="text"
  placeholder="xxxx"
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
  <h3 className="font-medium mb-3">{t('order.summary')}</h3>
  
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
      {(selectedCountry === 'USA' || selectedCountry === 'CAN') && quantities['8x10'] > 0 && (
        <div className="flex justify-between py-2">
          <span>8x10" Photos ({quantities['8x10']} × {country?.size8x10.toFixed(2)} {country?.currency})</span>
          <span>{subtotalsBySize['8x10'].toFixed(2)} {country?.currency}</span>
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
    const taxableAmount = subtotal + shippingFee; // Define taxable amount once
    
    if (selectedCountry === 'TUN') {
        taxAmount = taxableAmount * 0.19;
    } else if (selectedCountry === 'CAN' && formData.shippingAddress.province) {
        const provinceTaxes = TAX_RATES['CA'][formData.shippingAddress.province];
        if (provinceTaxes) {
            if (provinceTaxes.HST) {
                taxAmount = taxableAmount * (provinceTaxes.HST / 100); // Fixed: Include shipping fee in HST calculation
            } else {
                if (provinceTaxes.GST) taxAmount += taxableAmount * (provinceTaxes.GST / 100);
                if (provinceTaxes.PST) taxAmount += taxableAmount * (provinceTaxes.PST / 100);
                if (provinceTaxes.QST) taxAmount += taxableAmount * (provinceTaxes.QST / 100);
            }
        }
    }

    // Calculate final total
    const finalTotal = subtotal + shippingFee + taxAmount - discount;

    return (
      <>
        {/* Subtotal */}
        <div className="flex justify-between py-2 border-t">
          <span>{t('produits.subtotal')}</span>
          <span>{subtotal.toFixed(2)} {country?.currency}</span>
        </div>

        {/* Shipping Fee */}
        <div className="flex justify-between py-2">
          <span>{t('order.shipping_fee')}</span>
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
    <span>{t('order.discount')} ({discountCode.toUpperCase() === 'MCF99' ? '99%' : '50%'})</span>
    <span>-{discount.toFixed(2)} {country?.currency}</span>
  </div>
)}

        {/* Final Total */}
        <div className="flex justify-between py-2 border-t font-bold">
          <span>{t('produits.total')}</span>
          <span>{finalTotal.toFixed(2)} {country?.currency}</span>
        </div>
      </>
    );
  })()}
</div>
        
      {/* Order Note */}
      <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-3">{t('produits.note')}</h3>
          <textarea
            placeholder="...."
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
  };
  // Add a separate handler for the Start Printing button
const handleStartPrinting = () => {
  setShowIntro(false);
  setActiveStep(0);
};
const validateStep = () => {
  switch (activeStep) {
    case 0: // Upload Photos step
      return selectedPhotos.length > 0;
      
    case 1: // Shipping Information step
      // Simplified validation for required fields
      const shippingAddress = formData.shippingAddress;
      
      // Basic field validation
      const basicFieldsValid = Boolean(
        formData.email &&
        formData.phone &&
        shippingAddress.firstName &&
        shippingAddress.lastName &&
        shippingAddress.address &&
        shippingAddress.city &&
        shippingAddress.postalCode
      );

      // State/Province validation based on country
      const stateValid = 
        (selectedCountry !== 'USA' && selectedCountry !== 'CAN') || // Other countries don't need state
        (selectedCountry === 'USA' && shippingAddress.state) ||     // US needs state
        (selectedCountry === 'CAN' && shippingAddress.province);       // Canada needs province

      return basicFieldsValid && stateValid;

    case 2: // Payment step (if applicable)
      if (selectedCountry === 'TUN') {
        return true; // COD doesn't need additional validation
      }
      // Add any specific payment validation here if needed
      return true;

    default:
      return false;
  }
};
const { t } = useTranslation();

  
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
              {t('intro.welcome')}
              <p> <LanguageSelector /> </p>
              </div>
              
              <div className="space-y-6 max-w-md mx-auto">
                <h2 className="text-2xl font-semibold text-gray-800">
                {t('intro.title')}
                </h2>
                
                <p className="text-gray-600">
                {t('intro.subtitle')}                </p>
      
                <div className="flex justify-center space-x-4 py-4">
                  <div className="text-center">
                    <Camera className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
                    <div className="text-sm text-gray-600">{t('navigation.choose_photos')}</div>
                  </div>
                  <div className="text-center">
                    <Package className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
                    <div className="text-sm text-gray-600">{t('navigation.select_sizes')}</div>
                  </div>
                  <div className="text-center">
                    <ShoppingCart className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
                    <div className="text-sm text-gray-600">{t('navigation.quick_checkout')}</div>
                  </div>
                </div>
                
                <div className="text-center">
                  <p className="text-gray-600 mt-2">{t('navigation.location')}</p>
                </div>
                
                <div className="space-y-4">
                  <select 
                    className="w-full p-4 text-left border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    value={selectedCountry}
                    onChange={(e) => handleCountrySelect(e.target.value)}
                  >
                    <option value="">{t('navigation.select')}</option>
                    {initialCountries.map(country => (
                      <option key={country.value} value={country.value}>
                        {country.name} ({country.currency})
                      </option>
                    ))}
                  </select>
  
                  <button
  onClick={() => {
    if (selectedCountry) {
      handleCountrySelect(selectedCountry);
      handleStartPrinting(); // Call handleStartPrinting if selectedCountry is available
    }
  }}
  disabled={!selectedCountry}
  className="w-full px-6 py-3 bg-yellow-400 text-black font-semibold rounded-lg shadow-md hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
>
{t('buttons.start_printing')}
</button>
  
                  <div className="text-center">
                    <button 
                      onClick={() => setShowBookingPopup(true)} 
                      className="text-sm text-gray-600 hover:text-yellow-600 underline"
                    >
                      {t('buttons.book_service')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Archive Policy */}
            <div className="border-t text-center py-3">
              <p className="text-xs text-gray-500">
              {t('intro.archive_policy')}              </p>
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
            <h2 className="text-2xl font-bold">{t('order.success_message')}</h2>
            <p className="text-gray-600">
            {t('order.success_details')} {formData.email}.
            </p>
            <div className="mt-4">
              <p className="font-medium">Order Details:</p>
              <p> {t('order.order_number')}: {currentOrderNumber}</p>
              <p>{t('order.total_amount')}: {calculateTotals().total.toFixed(2)} {initialCountries.find(c => c.value === selectedCountry)?.currency}</p>
              {selectedCountry === 'TUN' && (
                <p className="text-gray-600 mt-2">
                 {t('order.payment_method')}
                </p>
              )}
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500"
            >
              {t('buttons.place_new')}
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
    2. On payment page AND it's either Tunisia order (COD) or Interac payment */}
{(activeStep !== 2 || selectedCountry === 'TUN' || paymentMethod === 'interac') && (
  <button 
    onClick={handleNext} 
    disabled={!validateStep()} 
    className={`px-6 py-2 rounded ${
      validateStep() 
        ? 'bg-yellow-400 hover:bg-yellow-500' 
        : 'bg-gray-200 cursor-not-allowed'
    }`} 
  >
    {isLoading 
      ? 'Processing...' 
      : (activeStep === 2 && (selectedCountry === 'TUN' || paymentMethod === 'interac') 
        ? 'Place Order' 
        : 'Next')}
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