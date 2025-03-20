import React from 'react';
import { memo, useState, useRef, useCallback, useEffect } from 'react';
import { Upload, ShoppingCart, Package, Camera, X , Loader, MapPin, Clock, Phone, Mail,aperture } from 'lucide-react';
import './index.css'; 
import { loadStripe } from "@stripe/stripe-js";
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import LanguageSelector from './components/LanguageSelector';
import photoprint4x6 from './assets/photoprint4x6.jpg';
import photoprint5x7 from './assets/photoprint5x7.jpg';
import photoprint8x10 from './assets/photoprint8x10.jpg';
import photoprint4x4 from './assets/photoprint4x4.jpg';
import size35x45 from './assets/passport.jpg';
import keychain from './assets/kc2.png';
import magnet from './assets/magnet.jpg';
import threeDFrame from './assets/3d_frame.jpg';
import Rectangle from './assets/rectangle.jpg';
import Heart from './assets/heart.jpg';
import imageCompression from 'browser-image-compression';
import { processImagesInBatches } from './imageProcessingUtils';
import {clearStateStorage} from './stateManagementUtils';
import Stripe from 'stripe';
import { Routes, Route, useLocation } from 'react-router-dom';
import CryptoJS from 'crypto-js';
import { useLanguage } from './contexts/LanguageContext'; // Adjust the import depending on your file structure
const stripe = new Stripe('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', {
  apiVersion: 'latest' // Recommended to specify version
});
//import { sendOrderConfirmation } from './utils/emailService'..;

import {HelcimPayButton } from './HelcimPayButton';
import { initializeHelcimPayCheckout } from './helcimService';
const initialCountries = [
  {name: 'United States', 
    value: 'US', 
    currency: 'USD', 
    rate: 1, 
    size4x6: 0.49,        // Updated from 0.39
    size5x7: 2.99,        // Updated from 1.49
    size8x10: 4.99,
    size4x4: 3.99,
    crystal3d: 140, 
    keychain: 29.99, 
    keyring_magnet: 29.99 },
  { name: 'Canada', 
    value: 'CA', 
    currency: 'CAD', 
    rate: 1, 
    size4x6: 0.49,        // Updated from 0.49
    size5x7: 2.99,        // Updated from 2.99
    size8x10: 4.99,
    size4x4: 0.39,       // Added new size
    crystal3d: 140, 
    keychain: 29.99, 
    keyring_magnet: 29.99  },
{ name: 'Tunisia', value: 'TN', currency: 'TND', rate: 1, size10x15: 3.00, size15x22: 5.00,size35x45: 1.25, keychain: 15.00, keyring_magnet: 15.00 },
  
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
    // 1. Initialize translation hook correctly
    const { t } = useTranslation();
  
   
  
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
          placeholder={t('placeholder.firstName', 'First Name')} // Add fallback text
          value={data.firstName || ''}
          onChange={handleInputChange('firstName')}
          className="p-2 border rounded"
        />
        <input
          type="text"
          inputMode="text"
          placeholder={t('placeholder.lastName', 'Last Name')}
          value={data.lastName || ''}
          onChange={handleInputChange('lastName')}
          className="p-2 border rounded"
        />
        <input
          type="text"
          inputMode="text"
          placeholder={t('placeholder.address', 'Address')}
          value={data.address || ''}
          onChange={handleInputChange('address')}
          className="col-span-2 p-2 border rounded"
        />
        <input
          type="text"
          inputMode="text"
          placeholder={t('placeholder.city', 'City')}
          value={data.city || ''}
          onChange={handleInputChange('city')}
          className="p-2 border rounded"
        />
  
        {(data.country === 'USA' || data.country === 'US') && (
          <select
            value={data.state || ''}
            onChange={handleInputChange('state')}
            className="p-2 border rounded"
          >
            <option value="">{t('form.select_state', 'Select State')}</option>
            {US_STATES.map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
        )}
  
        {(data.country === 'CAN' || data.country === 'CA') && (
          <select
            value={data.province || ''}
            onChange={handleInputChange('province')}
            className="p-2 border rounded"
          >
            <option value="">{t('form.select_province', 'Select Province')}</option>
            {CANADIAN_PROVINCES.map(province => (
              <option key={province} value={province}>{province}</option>
            ))}
          </select>
        )}
  
        <input
          type="text"
          inputMode="text"
          placeholder={data.country === 'USA' 
            ? t('placeholder.zipCode', 'ZIP Code')
            : t('placeholder.postalCode', 'Postal Code')}
          value={data.postalCode || ''}
          onChange={handleInputChange('postalCode')}
          className="p-2 border rounded"
        />
  
        <div className="col-span-2 p-2 border rounded bg-gray-100">
          {initialCountries.find(c => c.value === data.country)?.name || 
            t('form.country_not_selected', 'Country not selected')}
        </div>
      </div>
    );
  };
  
  
  // Add this function before the FreezePIX component


const FreezePIX = () => {
 



    const [showIntro, setShowIntro] = useState(true);
    const [selectedCountry, setSelectedCountry] = useState('');
    const [selectedPhotos, setSelectedPhotos] = useState([]); // Correct
    const [activeStep, setActiveStep] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState('helcim'); // Default payment method

    const [orderSuccess, setOrderSuccess] = useState(false);
    const [isBillingAddressSameAsShipping, setIsBillingAddressSameAsShipping] = useState(true);
    const [isProcessingOrder, setIsProcessingOrder] = useState(false);
    const [showBookingPopup, setShowBookingPopup] = useState(false);
    const fileInputRef = useRef(null);
    const [error, setError] = useState(null);
    const [discountCode, setDiscountCode] = useState('');
    const [discountError, setDiscountError] = useState('');
    const [availableDiscounts, setAvailableDiscounts] = useState([]);
    const [selectedStudio, setSelectedStudio] = useState(null);
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
      name:'',
      shippingAddress: {
        firstName: '',
        lastName: '',
        address: '',
        city: '',
        postalCode: '',
        country: selectedCountry, // Initialize with selectedCountry
        province: '',
        state: ''
      },
      billingAddress: {
        firstName: '',
        lastName: '',
        address: '',
        city: '',
        postalCode: '',
        country: selectedCountry, // Initialize with selectedCountry
        province: '',
        state: ''
      },
      paymentMethod: 'cod'
    });
      const [isProductDetailsOpen, setIsProductDetailsOpen] = useState(false);

      useEffect(() => {
        setFormData(prev => ({
          ...prev,
          shippingAddress: {
            ...prev.shippingAddress,
            country: selectedCountry
          },
          billingAddress: {
            ...prev.billingAddress,
            country: selectedCountry
          }
        }));
      }, [selectedCountry]);

      useEffect(() => {
        const fetchDiscountCodes = async () => {
          setIsLoading(true);
          try {
            const response = await axios.get('https://freezepix-database-server-c95d4dd2046d.herokuapp.com/api/discount-codes');
            // Filter only active discounts and check dates
            const activeDiscounts = response.data.filter(discount => {
              const now = new Date();
              const startDate = new Date(discount.startDate);
              const endDate = discount.endDate ? new Date(discount.endDate) : null;
              
              return discount.isActive && 
                     (!endDate || endDate > now) && 
                     startDate <= now;
            });
            setAvailableDiscounts(activeDiscounts);
          } catch (error) {
            console.error('Error fetching discount codes:', error);
          } finally {
            setIsLoading(false);
          }
        };
    
        fetchDiscountCodes();
      }, []);

      useEffect(() => {
        const savedPhotos = localStorage.getItem('uploadedPhotos');
        if (savedPhotos) {
          try {
            const parsedPhotos = JSON.parse(savedPhotos);
            const restoredPhotos = parsedPhotos.map(photo => ({
              ...photo,
              file: base64ToFile(photo.base64, photo.fileName),
              preview: photo.base64
            }));
            setSelectedPhotos(restoredPhotos);
          } catch (error) {
            console.error('Error restoring photos:', error);
          }
        }
      }, []);

      // Add this useEffect in your component to handle the return from Stripe
      useEffect(() => {
        const validateStripePayment = async () => {
          const sessionId = new URLSearchParams(window.location.search).get('session_id');
          const pendingOrder = sessionStorage.getItem('pendingOrder');
          
          if (sessionId && pendingOrder) {
            try {
              const response = await fetch('https://freezepix-database-server-c95d4dd2046d.herokuapp.com/api/validate-payment', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  sessionId,
                  orderNumber: JSON.parse(pendingOrder).orderNumber
                }),
              });
              
              const result = await response.json();
              
              if (result.success) {
                const orderData = JSON.parse(pendingOrder).orderData;
                
                // Add chunk-based order submission here
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
                      throw new Error('Order submission failed');
                    }
                    // Exponential backoff
                    await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount)));
                  }
                }
     
                // Send confirmation email with retry mechanism
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
     
                // Update UI state
                setOrderSuccess(true);
                setSelectedPhotos([]);
                setError(null);
                
                // Clear session storage
                sessionStorage.removeItem('pendingOrder');
                sessionStorage.removeItem('stripeSessionId');
     
                // Log successful order creation
                console.log('Order created successfully:', {
                  orderNumber: orderData.orderNumber,
                  totalItems: orderData.orderItems.length,
                  responses
                });
              } else {
                setError('Payment verification failed');
                setOrderSuccess(false);
              }
            } catch (error) {
              console.error('Payment validation or order submission error:', error);
              setError('Failed to verify payment or submit order');
              setOrderSuccess(false);
            }
          }
        };
     
        validateStripePayment();
     }, []);

     const location = useLocation();
     const { changeLanguage } = useLanguage(); 
     useEffect(() => {
      // Set selected country and language when the pathname changes
      if (location.pathname === '/TN') {
        setSelectedCountry('TN'); // Set Tunisia as the selected country
        changeLanguage('ar'); // Set language to Arabic
      }
    }, [location.pathname, changeLanguage]); // Run when pathname or changeLanguage changes
  
    // Alternatively, set selected country and language only on initial render if needed
    useEffect(() => {
      if (location.pathname === '/TN') {
        setSelectedCountry('TN');
        changeLanguage('ar');
      }
    }, []); // Runs only once when the component mounts

     const calculateDiscountValue = (code) => {
      const discountRule = availableDiscounts.find(
        discount => discount.code.toUpperCase() === code.toUpperCase()
      );
  
      if (!discountRule) return 0;
  
      let discountValue = 0;
      if (discountRule.valueType === 'percentage') {
        discountValue = Math.abs(parseFloat(discountRule.value)) / 100;
      } else if (discountRule.valueType === 'fixed_amount') {
        discountValue = Math.abs(parseFloat(discountRule.value));
      }
  
      return discountValue;
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
      const getDayName = (day) => {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return days[day];
      };

      const StudioSelector = ({ onStudioSelect, selectedCountry, selectedStudio }) => {
        const [studios, setStudios] = useState([]);
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState(null);
      
        // Country code mapping object
        const countryVariations = {
          'TN': ['TN', 'TUN', 'TUNISIA', 'TUNISIE'],
          'US': ['US', 'USA', 'UNITED STATES', 'UNITED STATES OF AMERICA'],
          'CA': ['CA', 'CAN', 'CANADA']
        };
      
        // Function to get all possible country variations
        const getCountryVariations = (countryCode) => {
          const normalizedCountryCode = countryCode?.toUpperCase();
          // Find the key that contains this country code in its variations
          const matchingKey = Object.keys(countryVariations).find(key => 
            countryVariations[key].includes(normalizedCountryCode) || key === normalizedCountryCode
          );
          return matchingKey ? countryVariations[matchingKey] : [normalizedCountryCode];
        };
      
        useEffect(() => {
          const fetchStudios = async () => {
            try {
              const response = await axios.get('https://freezepix-database-server-c95d4dd2046d.herokuapp.com/api/studios');
              const studiosData = Array.isArray(response.data) ? response.data : [response.data];
              
              // Get all possible variations of the selected country
              const countryVariants = getCountryVariations(selectedCountry);
              console.log('Searching for country variants:', countryVariants);
      
              // Filter studios by any matching country variant
              const filteredStudios = studiosData.filter(studio => {
                const studioCountry = studio.country.toUpperCase();
                return countryVariants.some(variant => 
                  studioCountry === variant || 
                  studioCountry.includes(variant)
                );
              });
              
              console.log('Found studios:', filteredStudios);
              setStudios(filteredStudios);
              setLoading(false);
            } catch (error) {
              console.error('Error fetching studios:', error);
              setError(error.message);
              setLoading(false);
            }
          };
      
          if (selectedCountry) {
            fetchStudios();
          }
        }, [selectedCountry]);
      
        const getDayName = (day) => {
          const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
          return days[day];
        };
      
        // Get the appropriate language for translations
        const getLanguageCode = (countryCode) => {
          const normalizedCountryCode = countryCode?.toUpperCase();
          if (countryVariations['TN'].includes(normalizedCountryCode)) return 'ar';
          if (countryVariations['CA'].includes(normalizedCountryCode)) return 'fr';
          return 'fr'; // default to French
        };
      
        if (loading) {
          return (
            <div className="flex justify-center items-center min-h-[200px]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
            </div>
          );
        }
      
        if (error) {
          return (
            <div className="text-red-500 text-center p-4">
              Error loading studios: {error}
            </div>
          );
        }
      
        if (studios.length === 0) {
          return (
            <div className="text-center text-gray-500 py-8">
              No studios available in your region.
            </div>
          );
        }
      
        const languageCode = getLanguageCode(selectedCountry);
      
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-medium">Select Pickup Location</h2>
      
            <div className="grid gap-4 md:grid-cols-2">
              {studios.map(studio => (
                <div
                  key={studio._id}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedStudio?._id === studio._id
                      ? 'border-yellow-400 bg-yellow-50'
                      : 'hover:border-gray-400'
                  }`}
                  onClick={() => onStudioSelect(studio)}
                >
                  <h3 className="font-medium text-lg mb-2">
                    {studio.translations?.[languageCode]?.name || studio.name}
                  </h3>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <MapPin size={16} />
                      <span>
                        {studio.translations?.[languageCode]?.address || studio.address}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Phone size={16} />
                      <span dir="ltr">{studio.phone}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Mail size={16} />
                      <span>{studio.email}</span>
                    </div>
      
                    <div className="border-t pt-2 mt-2">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock size={16} />
                        <span className="font-medium">Operating Hours:</span>
                      </div>
                      <div className="grid grid-cols-1 gap-1">
                        {studio.operatingHours
                          .sort((a, b) => a.day - b.day) // Sort by day
                          .map(hours => (
                          <div key={hours._id} className="flex justify-between text-xs">
                            <span>{getDayName(hours.day)}</span>
                            <span dir="ltr">
                              {hours.isClosed ? 'Closed' : `${hours.openTime} - ${hours.closeTime}`}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
      
                    <div className="text-xs text-gray-500 mt-2">
                      {studio.translations?.[languageCode]?.description || studio.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
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
    
    let products = []; // Define products array outside if statements
  
    if (country === 'USA' || country === 'CAN' || country === 'US' || country === 'CA') {
      products = [
        {
        category: 'Photo Prints',
        product: '4x4 Size',
        country: countryInfo.name,
        price: `${countryInfo.currency} ${countryInfo.size4x4}`
        },
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
    } 
  
    if (country === 'TN') {
      products = [
        {
          category: 'Photo Prints',
          product: 'Format 10x15 cm',
          country: countryInfo.name,
          price: countryInfo.currency === 'TND' 
            ? `${countryInfo.size10x15} TND`
            : `${countryInfo.currency} ${countryInfo.size4x6}`
        },
        {
          category: 'Photo Prints',
          product: 'Format 15x23 cm',
          country: countryInfo.name,
          price: countryInfo.currency === 'TND'
            ? `${countryInfo.size15x22} TND`
            : `${countryInfo.currency} ${countryInfo.size5x7}`
        },
        {
          category: 'Photo Prints',
          product: 'Format 3.5 x 4.5 cm',
          country: countryInfo.name,
          price: countryInfo.currency === 'TND'
            ? `${countryInfo.size35x45} TND`
            : `${countryInfo.currency} ${countryInfo.size5x7}`
        }
      ];
    } 
  
    // Add 8x10" size after 5x7" only for USA and Canada
    if (country === 'USA' || country === 'CAN' || country === 'US' || country === 'CA') {
      products.splice(3, 0, {
        category: 'Photo Prints',
        product: '8x10 Size',
        country: countryInfo.name,
        price: `${countryInfo.currency} ${countryInfo.size8x10}`
      });
     
    }
  
    return products;
  };

  const getImageSrc = (product) => {
    const imageMap = {
      '4x6 Size': photoprint4x6,
      'Format 10.16 x 15.24 cm': photoprint4x6,
      '5x7 Size': photoprint5x7,
      'Format 12.7 x 17.78 cm': photoprint5x7,
      '8x10 Size': photoprint8x10,
      '4x4 Size': photoprint4x4,
      'Format 3.5 x 4.5 cm': size35x45,
      'Format 10x15 cm':photoprint4x6,
      'Format 15x23 cm':photoprint5x7,
      'Keychain': keychain,
      'Keychain and Magnet': keychain,
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
              {t('productDetails.title')}
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
     const convertImageToBase64 = async (file) => {
      // If already a base64 string, return it
      if (typeof file === 'string' && file.startsWith('data:image/')) {
        return file;
      }
    
      // If not a valid File/Blob, throw error
      if (!(file instanceof Blob || file instanceof File)) {
        throw new Error('Invalid file format');
      }
    
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64String = reader.result;
          // Validate base64 format
          if (typeof base64String === 'string' && base64String.startsWith('data:image/')) {
            resolve(base64String);
          } else {
            reject(new Error('Invalid base64 format'));
          }
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
      });
    };
    
     
    const base64ToFile = (base64String, fileName) => {
      try {
        // Validate base64 string
        if (!base64String || typeof base64String !== 'string') {
          throw new Error('Invalid base64 string');
        }
    
        if (!base64String.startsWith('data:image/')) {
          throw new Error('Invalid image format');
        }
    
        const arr = base64String.split(',');
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        
        return new File([u8arr], fileName, { type: mime });
      } catch (error) {
        console.error('Error converting base64 to file:', error);
        throw error;
      }
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

     useEffect(() => {
      const restorePhotos = async () => {
        const savedPhotos = localStorage.getItem('uploadedPhotos');
        if (savedPhotos) {
          try {
            const parsedPhotos = JSON.parse(savedPhotos);
            const restoredPhotos = parsedPhotos.map(photo => {
              // Validate base64 data
              if (!photo.base64 || !photo.base64.startsWith('data:image/')) {
                throw new Error('Invalid saved image data');
              }
    
              return {
                ...photo,
                file: base64ToFile(photo.base64, photo.fileName),
                preview: photo.base64 // Use base64 as preview
              };
            });
            setSelectedPhotos(restoredPhotos);
          } catch (error) {
            console.error('Error restoring photos:', error);
            localStorage.removeItem('uploadedPhotos'); // Clear invalid data
          }
        }
      };
    
      restorePhotos();
    }, []);
     
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
            state: prev.shippingAddress.country === selectedCountry ? prev.shippingAddress.state : '', // Preserve state
            province: prev.shippingAddress.country === selectedCountry ? prev.shippingAddress.province : '' // Preserve province
          },
          billingAddress: {
            ...prev.billingAddress,
            country: selectedCountry,
            state: prev.billingAddress.country === selectedCountry ? prev.billingAddress.state : '', // Preserve state
            province: prev.billingAddress.country === selectedCountry ? prev.billingAddress.province : '' // Preserve province
          },
          paymentMethod: (selectedCountry === 'TUN' || selectedCountry === 'TN') ? 'cod' : 'helcim'
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
      case '4x4': return country.size4x4;
      case '10x15': return country.size10x15;
      case '15x22': return country.size15x22;
      case '3.5x4.5': return country.size35x45;
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
      orderNumber: orderData.orderNumber || 'N/A',
      email: orderData.email || 'N/A',
      pickupStudio: {
        name: orderData?.pickupStudio?.name || '',
        address: orderData?.pickupStudio?.address || '',
        city: orderData?.pickupStudio?.city || '',
        country: orderData?.pickupStudio?.country || ''
      },
      phone: orderData.phone || 'N/A',
      orderNote: orderData.orderNote || '',
      paymentMethod: 'in_store',
      selectedPhotos: orderData.selectedPhotos || [],
      totalAmount: orderData.totalAmount || 0,
      currency: orderData.currency || 'USD'
    };

    console.log('Sending order summary email:', JSON.stringify(emailOrderData, null, 2));

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

const processImageForUpload = async (photo) => {
  try {
    // If the image is already a base64 string, validate and return it
    if (typeof photo.file === 'string' && photo.file.startsWith('data:image/')) {
      return photo.file;
    }

    // If we have a File object, convert it to base64
    if (photo.file instanceof File || photo.file instanceof Blob) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(photo.file);
      });
    }

    throw new Error('Invalid image format');
  } catch (error) {
    console.error('Image processing error:', error);
    throw error;
  }
};

// Optimized order submission with better chunking and progress tracking

const submitOrderWithOptimizedChunking = async (orderData) => {
  try {
    const { orderItems } = orderData;
    
    // Prepare the base order data with required fields
    const baseOrderData = {
      ...orderData,
      shippingFee: 0, // Set to 0 for local pickup
      shippingMethod: 'local_pickup',
      deliveryMethod: 'pickup',
      status: 'Waiting for CSR approval',
      paymentMethod: 'in_store',
      paymentStatus: 'pending'
    };

    // Process items
    const processedItems = await Promise.all(orderItems.map(async (item) => {
      let imageData;
      try {
        if (item.base64) {
          imageData = item.base64;
        } else if (item.file) {
          imageData = await convertImageToBase64(item.file);
        } else {
          throw new Error('No valid image data found');
        }

        return {
          ...item,
          file: imageData,
          productType: item.productType || 'photo_print',
          size: item.size || 'default',
          quantity: item.quantity || 1,
          price: item.price || 0
        };
      } catch (error) {
        console.error(`Error processing item ${item.id}:`, error);
        throw error;
      }
    }));

    // Split into chunks
    const CHUNK_SIZE = 6;
    const chunks = [];
    for (let i = 0; i < processedItems.length; i += CHUNK_SIZE) {
      chunks.push(processedItems.slice(i, i + CHUNK_SIZE));
    }

    const results = await Promise.all(chunks.map(async (chunk) => {
      try {
        const response = await axios.post(
          'https://freezepix-database-server-c95d4dd2046d.herokuapp.com/api/orders/chunk',
          {
            ...baseOrderData,
            orderItems: chunk
          },
          {
            withCredentials: true,
            timeout: 45000,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
        return response.data;
      } catch (error) {
        console.error('Chunk upload error:', error.response?.data || error);
        throw error;
      }
    }));

    return results;
  } catch (error) {
    console.error('Order submission error:', error);
    throw error;
  }
};






const handlePayment = async (stripePaymentMethod, amount, currency, metadata) => {
  try {
    const checkoutSessionResponse = await axios.post(
      'https://freezepix-database-server-c95d4dd2046d.herokuapp.com/api/create-checkout-session',
      {
        orderItems: metadata.orderItems,
        email: metadata.email,
        currency,
        amount,
        shippingAddress: metadata.shippingAddress,
        orderNumber: metadata.orderNumber,
        shippingFee: metadata.shippingFee,
        metadata: {
          ...metadata,
          originalPaymentMethod: stripePaymentMethod
        },
        success_url: `${window.location.origin}/order-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${window.location.origin}/order-failed`
      },
      {
        timeout: 15000,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    const sessionId = checkoutSessionResponse.data.sessionId;

    if (!sessionId) {
      throw new Error('Failed to create checkout session');
    }

    const stripe = await loadStripe('pk_live_51Nefi9KmwKMSxU2Df5F2MRHCcFSbjZRPWRT2KwC6xIZgkmAtVLFbXW2Nu78jbPtI9ta8AaPHPY6WsYsIQEOuOkWK00tLJiKQsQ');

    const { error } = await stripe.redirectToCheckout({
      sessionId: sessionId
    });

    if (error) {
      console.error('Checkout redirection error:', error);
      throw error;
    }

  } catch (error) {
    console.error('Checkout Session Error:', error);
    throw error;
  }
};

// Create a success page component (OrderSuccess.js)
const OrderSuccess = () => {
  const [isValidating, setIsValidating] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const validatePayment = async () => {
      try {
        const queryParams = new URLSearchParams(window.location.search);
        const sessionId = queryParams.get('session_id');

        if (!sessionId) {
          throw new Error('No session ID found');
        }

        const response = await axios.post(
          'https://freezepix-database-server-c95d4dd2046d.herokuapp.com/api/validate-payment',
          { sessionId }
        );

        if (response.data.success) {
          setOrderSuccess(true);
          // Additional success actions like clearing cart, showing success message, etc.
        } else {
          throw new Error(response.data.error || 'Payment validation failed');
        }
      } catch (error) {
        console.error('Payment validation error:', error);
        setError(error.message);
      } finally {
        setIsValidating(false);
      }
    };

    validatePayment();
  }, []);

  if (isValidating) {
    return <div>Validating your payment...</div>;
  }

  if (error) {
    return (
      <div>
        <h2>Payment Error</h2>
        <p>{error}</p>
       
      </div>
    );
  }

  return (
    <div>
      <h2>Order Successful!</h2>
      {/* Add order success content */}
    </div>
  );
};
// Handle Stripe payment if not COD
const handleCheckout = async (paymentMethod) => {
  let orderData = null;
  let orderNumber = null;

  try {
    setIsProcessingOrder(true);
    setOrderSuccess(false);
    setError(null);
    setUploadProgress(0);

    // Generate order number
    orderNumber = generateOrderNumber();
    setCurrentOrderNumber(orderNumber);
    
    // Calculate order totals
    const { total, currency, subtotal, shippingFee, taxAmount, discount } = calculateTotals();
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

    // Prepare checkout data
    const checkoutData = {
      orderItems: optimizedPhotosWithPrices.map(photo => ({
        id: photo.id,
        quantity: photo.quantity,
        size: photo.size,
        price: photo.price,
        productType: photo.productType
      })),
      customerDetails: {
        name: formData.name,
        email: formData.email,
        country: selectedCountry
      },
      orderSummary: {
        total,
        currency: country.currency,
        subtotal,
        shippingFee,
        taxAmount,
        discount
      },
      paymentMethodId: paymentMethod.id  // Include Stripe payment method ID
    };

    // Create payment intent on backend
    const paymentResponse = await fetch('https://freezepix-database-server-c95d4dd2046d.herokuapp.com/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(checkoutData)
    });

    const paymentResult = await paymentResponse.json();

    // Confirm payment on client side
    if (paymentResult.clientSecret) {
      const confirmPayment = await stripe.confirmCardPayment(paymentResult.clientSecret, {
        payment_method: paymentMethod.id
      });

      if (confirmPayment.error) {
        throw confirmPayment.error;
      }
    }

    // Construct order data
    orderData = {
      orderNumber,
      email: formData.email,
      phone: formData.phone,
      shippingAddress: {
        firstName: formData.shippingAddress.firstName,
        lastName: formData.shippingAddress.lastName,
        address: formData.shippingAddress.address,
        city: formData.shippingAddress.city,
        postalCode: formData.shippingAddress.postalCode,
        country: formData.shippingAddress.country,
        province: formData.shippingAddress.province,
        state: formData.shippingAddress.state
      },
      billingAddress: isBillingAddressSameAsShipping
        ? formData.shippingAddress
        : formData.billingAddress,
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
      totalAmount: total,
      subtotal,
      shippingFee,
      taxAmount,
      discount,
      currency: country.currency,
      orderNote: orderNote || '',
      paymentMethod: 'helcim',
      stripePaymentId: paymentMethod.id,
      paymentStatus: 'paid',
      customerDetails: {
        name: formData.name,
        country: selectedCountry
      },
      selectedCountry,
      discountCode: discountCode || null,
      createdAt: new Date().toISOString()
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

    // Send confirmation email
    await sendOrderConfirmationEmail({
      ...orderData,
      orderItems: orderData.orderItems.map(item => ({
        ...item,
        file: undefined,
        thumbnail: item.thumbnail
      }))
    });

    setOrderSuccess(true);
    console.log('Order created successfully:', {
      orderNumber,
      totalItems: orderData.orderItems.length,
      responses
    });

    // Cleanup
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

  } catch (error) {
    console.error('Order Processing Error:', error);

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
        context: 'handleCheckout',
        timestamp: new Date().toISOString()
      });
    }

    // Save error state for recovery
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
// Stripe payment handler function
const createStripeCheckoutSession = async (orderData) => {
  console.log('Order Data:', orderData);
  const { shippingAddress } = orderData;
  const convertCountryCode = (address) => {
    if (!address) return address;

    const countryCodeMap = {
      'USA': 'US',
      'CAN': 'CA',
      'TUN': 'TN',
      'DEU': 'DE',
      'FRA': 'FR',
      'ITA': 'IT',
      'GBR': 'GB',
      'ESP': 'ES',
      'United States': 'US',
      'Canada': 'CA',
      'Tunisia': 'TN',
      'Germany': 'DE',
      'France': 'FR',
      'Italy': 'IT',
      'Spain': 'ES',
      'United Kingdom': 'GB'
      // Add more mappings if needed
    };

    return {
      ...address,
      country: countryCodeMap[address.country] || address.country
    };
  };
  const shippingAddressWithCorrectCode = {
    ...shippingAddress,
    country: convertCountryCode(shippingAddress.country)
  };

  const maxRetries = 3;
  let currentTry = 0;
  while (currentTry < maxRetries) {
  try {
    

    const response = await fetch(
      'https://freezepix-database-server-c95d4dd2046d.herokuapp.com/api/create-checkout-session',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // Pass orderItems as is (backend will format line items)
          orderItems: orderData.orderItems.map(item => ({
            price: item.price, // Backend handles price formatting
            productType: item.productType,
            size: item.size,
            thumbnail: item.thumbnail,
            quantity: item.quantity,
          })),
          // Send shippingFee as a separate field
          shippingFee: orderData.shippingFee,
          taxAmount: orderData.taxAmount,
          discount: orderData.discount,
          discountCode: orderData.discountCode,
          customerEmail: orderData.email,
          orderNumber: orderData.orderNumber,
          customerName: orderData.customerDetails.name,
          shippingAddress: orderData.shippingAddress, // Ensure this is correctly formatted
          currency: orderData.currency.toLowerCase(),
          success_url: `${window.location.origin}/order-success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${window.location.origin}/cart`,
        }),
      }
    );
  
    // Check for HTTP errors
    if (!response.ok) {
      const errorDetails = await response.text(); // Capture server error details
      console.error('Failed to create checkout session. Response:', errorDetails);
      throw new Error(`Failed to create checkout session: ${errorDetails}`);
    }
  
    // Parse the response JSON
    const session = await response.json();
  
    // Debugging: Log the session response
    console.log('Checkout session created:', session);
  
    // Redirect to Stripe Checkout in the top-level browser context
    if (session.url) {
      if (window.top) {
        // Redirect if running inside an iframe
        window.top.location.href = session.url;
      } else {
        // Redirect normally if running outside an iframe
        window.location.href = session.url;
      }
    } else {
      throw new Error('Checkout session URL is missing from the response.');
    }
  } catch (error) {
    // Log and rethrow the error
    console.error('Error creating checkout session:', error);
    throw error;
  }

};
};

const formIsValid = (formData) => {
  // Basic form validation
  if (!formData) return false;

  return true;
};

const handleOrderSuccess = async ({
  paymentMethod,
  formData,
  selectedCountry,
  selectedPhotos,
  orderNote,
  discountCode,
  selectedStudio
}) => {
  try {
    if (!formData?.email || !formData?.phone || !formData?.name) {
      throw new Error('Please provide all required contact information');
    }

    if (!selectedStudio) {
      throw new Error('Please select a pickup location');
    }

    const orderNumber = generateOrderNumber();
    setCurrentOrderNumber(orderNumber);
    
    const { total, currency, subtotal, taxAmount, discount } = calculateTotals();

    const orderData = {
      orderNumber,
      email: formData.email,
      phone: formData.phone,
      name: formData.name,
      pickupStudio: {
        id: selectedStudio._id,
        name: selectedStudio.name,
        address: selectedStudio.address,
        city: selectedStudio.city,
        country: selectedStudio.country
      },
      orderItems: selectedPhotos.map(photo => ({
        id: photo.id,
        file: photo.base64 || photo.file,
        quantity: photo.quantity,
        size: photo.size,
        price: photo.price,
        productType: photo.productType
      })),
      totalAmount: total,
      currency: initialCountries.find(c => c.value === selectedCountry)?.currency || 'USD',
      orderNote: orderNote || '',
      paymentMethod: 'in_store',
      status: 'Waiting for CSR approval',
      paymentStatus: 'pending',
      shippingFee: 0,
      shippingMethod: 'local_pickup',
      deliveryMethod: 'pickup',
      taxAmount,
      discount,
      subtotal,
      customerDetails: {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        country: selectedCountry
      },
      discountCode: discountCode || null,
      createdAt: new Date().toISOString()
    };

    setIsProcessingOrder(true);

    // Submit order first
    const response = await submitOrderWithOptimizedChunking(orderData);
    
    if (response) {
      // Prepare email data
      const emailOrderData = {
        orderNumber: orderData.orderNumber,
        email: orderData.email,
        pickupStudio: orderData.pickupStudio,
        phone: orderData.phone,
        orderNote: orderData.orderNote,
        paymentMethod: orderData.paymentMethod,
        selectedPhotos: orderData.orderItems,
        totalAmount: orderData.totalAmount,
        currency: orderData.currency
      };

      try {
        // Send confirmation email
        await sendOrderConfirmationEmail(emailOrderData);
        console.log('Order confirmation email sent successfully');
      } catch (emailError) {
        console.error('Failed to send order confirmation email:', emailError);
        // Don't throw here - we still want to complete the order process
        // but maybe notify the user about email issues
        setError('Order placed successfully but confirmation email could not be sent. Please save your order number.');
      }

      // Complete the order process
      setOrderSuccess(true);
      setSelectedPhotos([]);
      setError(null);
      clearStateStorage();
    }

  } catch (error) {
    console.error('Order Processing Error:', error);
    setError(error.message);
    setOrderSuccess(false);
  } finally {
    setIsProcessingOrder(false);
  }
};

const [secretToken, setSecretToken] = useState(null);

const handleSecretTokenReceived = (token) => {
  setSecretToken(token);
};

const handleHelcimPaymentSuccess = async (paymentData) => {
  const generateOrderNumber = () => {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 999999).toString().padStart(6, '0');
    const prefix = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `FPX-${prefix}-${timestamp.slice(-6)}${random}`;
  };

  // Add verification before proceeding
  const verifyOrderNumber = async (orderNum) => {
    try {
      const response = await axios.get(
        `https://freezepix-database-server-c95d4dd2046d.herokuapp.com/api/orders/verify/${orderNum}`
      );
      return !response.data.exists;
    } catch (error) {
      console.error('Order number verification failed:', error);
      return false;
    }
  };

  // Generate and verify order number
  let orderNumber;
  let isUnique = false;
  let attempts = 0;
  const maxAttempts = 5;

  while (!isUnique && attempts < maxAttempts) {
    orderNumber = generateOrderNumber();
    try {
      isUnique = await verifyOrderNumber(orderNumber);
      if (isUnique) break;
    } catch (error) {
      console.error('Verification attempt failed:', error);
    }
    attempts++;
    await new Promise(resolve => setTimeout(resolve, 100)); // Small delay between attempts
  }

  if (!isUnique) {
    throw new Error('Failed to generate unique order number after multiple attempts');
  }
  setCurrentOrderNumber(orderNumber);

  const country = initialCountries.find(c => c.value === selectedCountry);

  // Rest of your existing code...
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
  const { taxAmount,shippingFee } = calculateTotals();


  try {
    console.log('Payment Success Handler - Processing payment:', paymentData);
    setIsProcessingOrder(true);
    
    const orderData = {
      orderNumber,
      email: formData.email,
      phone: formData.phone,
      shippingAddress: formData.billingAddress,
      billingAddress: formData.billingAddress,
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
      totalAmount: paymentData.amount,
      subtotal: paymentData.amount - (paymentData.amount > 69.99 ? 0 : 20),
      shippingFee: shippingFee, //shipping Same as invoice
      taxAmount: taxAmount, // tax same as invoice
      discount: 0,
      currency: paymentData.currency,
      orderNote: "",
      paymentMethod: "helcim",
      customerDetails: {
        name: formData.billingAddress.firstName,
        country: selectedCountry
      },
      selectedCountry
    };

    // Add timestamp to ensure uniqueness
    orderData.createdAt = new Date().toISOString();

    console.log('Submitting order with data:', orderData);

    // Submit order with optimized chunking
    const maxRetries = 3;
    let retryCount = 0;
    let orderSubmitted = false;

    while (retryCount < maxRetries && !orderSubmitted) {
      try {
        const orderResponse = await submitOrderWithOptimizedChunking(orderData);
        if (orderResponse ) {
          orderSubmitted = true;
          console.log('Order submitted successfully:', orderResponse);
          
          // Send confirmation email
          try {
            await sendOrderConfirmationEmail({
              ...orderData,
              paymentDetails: {
                ...orderData.paymentDetails,
                cardLastFour: paymentData.cardNumber?.slice(-4)
              }
            });
            console.log('Confirmation email sent successfully');
          } catch (emailError) {
            console.error('Failed to send confirmation email:', emailError);
            // Continue with success flow even if email fails
          }

          // Update UI state
          setOrderSuccess(true);
          setSelectedPhotos([]);
          setError(null);
          window.removeHelcimPayIframe(); // Assuming this function exists

          
          // Clear session storage
          clearStateStorage();
          break;
        }
        throw new Error('Order submission failed');
      } catch (error) {
        console.error(`Order submission attempt ${retryCount + 1} failed:`, error);
        retryCount++;
        if (retryCount === maxRetries) {
          throw error;
        }
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount)));
      }
    }
  } catch (error) {
    console.error('Payment processing error:', error);
    setError(error.response?.data?.error || 'Failed to process payment or submit order');
    setOrderSuccess(false);
  } finally {
    setIsProcessingOrder(false);
  }
};

const CheckoutButton = ({ 
  onCheckout, 
  isProcessing, 
  disabled,
  formData,
  selectedCountry,
  selectedPhotos,
  orderNote,
  discountCode,
  isBillingAddressSameAsShipping
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    try {
      if (!formData?.email || !formData?.shippingAddress?.address) {
        throw new Error('Please fill in all required fields');
      }

      setIsLoading(true);
      
      await onCheckout({
        paymentMethod: (selectedCountry === 'TUN' || selectedCountry === 'TN') ? 'cod' : 'credit',
        formData,
        selectedCountry,
        selectedPhotos,
        orderNote,
        discountCode,
        isBillingAddressSameAsShipping
      });
    } catch (error) {
      console.error('Checkout error:', error);
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      className={`checkout-button ${isLoading || isProcessing ? 'loading' : ''}`}
      style={{
        padding: '10px 20px',
        backgroundColor: '#3498db',
        color: '#fff',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '16px',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        outline: 'none',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        transition: 'background-color 0.3s',
      }}
      onClick={handleClick}
      disabled={disabled || isLoading || isProcessing}
    >
      {isLoading || isProcessing ? 'Processing...' : 
      (selectedCountry === 'TUN' || selectedCountry === 'TN') ? 'Place Order (COD)' : 'Checkout'}
    </button>
);
};  

const validateDiscountCode = (code) => {
  if (!code) return false;

  const upperCode = code.toUpperCase();
  const validDiscount = availableDiscounts.find(discount => {
    const isMatchingCode = discount.code.toUpperCase() === upperCode;
    const now = new Date();
    const startDate = new Date(discount.startDate);
    const endDate = discount.endDate ? new Date(discount.endDate) : null;
    
    return isMatchingCode && 
           discount.isActive && 
           (!endDate || endDate > now) && 
           startDate <= now;
  });

  if (!validDiscount) {
    setDiscountError('Invalid discount code');
    return false;
  }

  setDiscountError('');
  return true;
};

const getDiscountDisplay = () => {
  const discountRule = availableDiscounts.find(
    discount => discount.code.toUpperCase() === discountCode.toUpperCase()
  );

  if (!discountRule) return '0%';

  if (discountRule.valueType === 'percentage') {
    return `${discountRule.value}%`;
  } else {
    return `${discountRule.value} ${country?.currency}`;
  }
};


    
const handleDiscountCode = (value) => {
  const upperValue = value.toUpperCase();
  setDiscountCode(upperValue);
  
  if (upperValue) {
    const isValid = validateDiscountCode(upperValue);
    const discountAmount = isValid ? 
      (discountCode ? subtotal * calculateDiscountValue(upperValue) : 0) : 
      0;
    onDiscountChange(discountAmount);
  } else {
    setDiscountError('');
    onDiscountChange(0);
  }
};
    
      const handleBack = () => {
        if (activeStep === 0) {
          setShowIntro(true);
        } else {
          setActiveStep(prev => prev - 1);
        }
      };

    const useBackButton = ({ activeStep, setActiveStep, setShowIntro }) => {
  useEffect(() => {
    // Handle the popstate event (triggered by back button)
    const handleBackButton = (event) => {
      // Prevent default behavior
      event.preventDefault();
      
      // Replicate the same logic as the UI back button
      if (activeStep === 0) {
        setShowIntro(true);
      } else {
        setActiveStep(prev => prev - 1);
      }
    };

    // Push a new state to history stack when component mounts
    window.history.pushState(null, '', window.location.pathname);

    // Add event listener for popstate (back button)
    window.addEventListener('popstate', handleBackButton);

    // Cleanup
    return () => {
      window.removeEventListener('popstate', handleBackButton);
    };
  }, [activeStep, setActiveStep, setShowIntro]);
};

useBackButton({ activeStep, setActiveStep, setShowIntro });

const handleNext = async () => {
  try {
    switch (activeStep) {
      case 0:
        // Validate photos
        if (!selectedPhotos || selectedPhotos.length === 0) {
          throw new Error('Please select at least one photo');
        }
        setActiveStep(prev => prev + 1);
        break;

      case 1:
        // Validate studio selection
        if (!selectedStudio) {
          throw new Error('Please select a pickup location');
        }
        setActiveStep(prev => prev + 1);
        break;

      case 2:
        // Validate contact information and process order
        if (!formData.email || !formData.phone || !formData.name) {
          throw new Error('Please provide all required contact information');
        }

        setIsLoading(true);
        await handleOrderSuccess({
          paymentMethod: 'in_store', // or whatever payment method
          formData,
          selectedCountry,
          selectedPhotos,
          orderNote,
          discountCode,
          selectedStudio
        });
        break;

      default:
        setActiveStep(prev => prev + 1);
        break;
    }
    setError(null);
  } catch (error) {
    console.error('Error in handleNext:', error);
    setError(error.message);
  } finally {
    setIsLoading(false);
  }
};

const processImageData = async (imageData) => {
  // Log for debugging
  console.log('Processing image data:', {
    type: typeof imageData,
    isBlob: imageData instanceof Blob,
    isFile: imageData instanceof File,
    isString: typeof imageData === 'string'
  });

  try {
    // If it's already a base64 string
    if (typeof imageData === 'string' && imageData.startsWith('data:image/')) {
      return imageData;
    }

    // If it's a File or Blob
    if (imageData instanceof Blob || imageData instanceof File) {
      const reader = new FileReader();
      return new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(imageData);
      });
    }

    throw new Error('Unsupported image format');
  } catch (error) {
    console.error('Image processing error:', error);
    throw error;
  }
};

const convertToBase64 = async (file) => {
  return new Promise((resolve, reject) => {
    // Check if it's already a base64 string
    if (typeof file === 'string' && file.startsWith('data:')) {
      resolve(file);
      return;
    }

    // Check if it's a Blob or File
    if (file instanceof Blob || file instanceof File) {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
      return;
    }

    reject(new Error('Invalid file format'));
  });
};

const handleFileChange = async (event) => {
  try {
    const files = Array.from(event.target.files);
    
    const newPhotos = await Promise.all(files.map(async (file) => {
      if (!file.type.startsWith('image/')) {
        throw new Error(`Invalid file type: ${file.type}`);
      }

      const base64Data = await convertImageToBase64(file);
      
      return {
        id: uuidv4(),
        file: file,
        base64: base64Data,
        fileName: file.name,
        fileType: file.type,
        preview: URL.createObjectURL(file),
        productType: 'photo_print',
        size: (selectedCountry === 'TUN' || selectedCountry === 'TN') ? '10x15' : '4x6',
        quantity: 1
      };
    }));

    setSelectedPhotos(prev => [...prev, ...newPhotos]);

    // Save to localStorage
    const storageSafePhotos = newPhotos.map(({ id, base64, fileName, fileType, productType, size, quantity }) => ({
      id,
      base64,
      fileName,
      fileType,
      productType,
      size,
      quantity
    }));
    
    localStorage.setItem('uploadedPhotos', JSON.stringify(storageSafePhotos));
  } catch (error) {
    console.error('File upload error:', error);
    setError(error.message);
  }
};



  const updateProductType = (photoId, newType) => {
    setSelectedPhotos((selectedPhotos || []).map(photo =>
      photo.id === photoId ? {
        ...photo,
        productType: newType,
        size: newType === 'photo_print' ? ((selectedCountry === 'TUN' || selectedCountry === 'TN') ? '10x15' : '4x6') : null,
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
        '4x4': 0,
        '3.5x4.5':0,
        '3d_frame': 0,
        'keychain': 0,
        'keyring_magnet': 0
    };

    const subtotalsBySize = {
        '4x6': 0,
        '5x7': 0,
        '10x15': 0,
        '15x22': 0,
        '8x10': 0,
        '4x4': 0,
        '3.5x4.5':0,
        '3d_frame': 0,
        'keychain': 0,
        'keyring_magnet': 0
    };

    // Count quantities and calculate subtotals for each size/product
    selectedPhotos.forEach(photo => {
        if (photo.productType === 'photo_print') {
            quantities[photo.size] += photo.quantity || 1;
            if (selectedCountry === 'TUN' || selectedCountry === 'TN') {
                if (photo.size === '10x15') {
                    subtotalsBySize[photo.size] += (photo.quantity || 1) * country.size10x15;
                } else if (photo.size === '15x22') {
                    subtotalsBySize[photo.size] += (photo.quantity || 1) * country.size15x22;
                } else if (photo.size === '3.5x4.5') {
                  subtotalsBySize[photo.size] += (photo.quantity || 1) * country.size35x45;
              }

            } else {
                if (photo.size === '4x6') {
                    subtotalsBySize[photo.size] += (photo.quantity || 1) * country.size4x6;
                } else if (photo.size === '5x7') {
                    subtotalsBySize[photo.size] += (photo.quantity || 1) * country.size5x7;
                } else if ((selectedCountry === 'USA' || selectedCountry === 'CAN' || selectedCountry === 'CA' || selectedCountry === 'US') && photo.size === '8x10') {
                    subtotalsBySize[photo.size] += (photo.quantity || 1) * country.size8x10;
                }
                else if ((selectedCountry === 'USA' || selectedCountry === 'CAN' || selectedCountry === 'CA' || selectedCountry === 'US') && photo.size === '4x4') {
                  subtotalsBySize[photo.size] += (photo.quantity || 1) * country.size4x4;
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

    const subtotal = Object.values(subtotalsBySize).reduce((acc, curr) => acc + curr, 0);
    console.log('Subtotal before discount:', subtotal);

    // Calculate shipping fee based on country
    let shippingFee = 0;
    const isOrderOverThreshold = subtotal >= 50;
    const isOrderOver999 = subtotal >= 999;

    if (isOrderOver999 && (['USA', 'US', 'CAN', 'CA', 'TUN', 'TN'].includes(selectedCountry))) {
        shippingFee = 0;
    } else if (!isOrderOverThreshold) {
        if (selectedCountry === 'TUN' || selectedCountry === 'TN') {
            shippingFee = 0;
        } else if (selectedCountry === 'USA' || selectedCountry === 'US') {
            shippingFee = 0;
        } else if (selectedCountry === 'CAN' || selectedCountry === 'CA') {
            shippingFee = 0;
        } else if (selectedCountry === 'GBR' || selectedCountry === 'GB') {
            shippingFee = 0;
        } else if (['DEU', 'FRA', 'ITA', 'ESP', 'DE', 'FR', 'IT', 'ES'].includes(selectedCountry)) {
            shippingFee = 0;
        }
    }

    // Calculate discount if applicable - must be synch from admin
    const discount = discountCode ? subtotal * calculateDiscountValue(discountCode) : 0;
    console.log('Calculated discount amount:', discount);

    let taxAmount = 0;
    // Calculate tax on pre-discount amount
    const taxableAmount = subtotal + shippingFee;
    console.log('Taxable amount:', taxableAmount);

    if (selectedCountry === 'TUN' || selectedCountry === 'TN') {
        taxAmount = taxableAmount * 0.19; // 19% TVA for Tunisia
    } else if (selectedCountry === 'CAN' || selectedCountry === 'CA') {
        const province = formData.shippingAddress.province;
        const provinceTaxes = TAX_RATES['CA'][province];

        if (provinceTaxes) {
            if (provinceTaxes.HST) {
                taxAmount = taxableAmount * (provinceTaxes.HST / 100);
            } else {
                // Calculate GST
                if (provinceTaxes.GST) {
                    taxAmount += taxableAmount * (provinceTaxes.GST / 100);
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

    console.log('Tax amount:', taxAmount);
    // Calculate total (apply discount after tax)
    const total = subtotal + shippingFee + taxAmount - discount;
    console.log('Final total:', total);

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
//..
  const renderStepContent = () => {
    const currency_curr = selectedCountry ? selectedCountry.currency : 'USD'; // USD as fallback
    const { total } = calculateTotals();
const countryCodeMap = {
  'USA': 'US',
  'CAN': 'CA',
  'TUN': 'TN', 
  'DEU': 'DE',
  'FRA': 'FR',
  'ITA': 'IT',
  'GBR': 'GB',
  'ESP': 'ES',
  'United States': 'US',
  'Canada': 'CA',
  'Tunisia': 'TN',
  'Germany': 'DE',
  'France': 'FR',
  'Italy': 'IT',
  'Spain': 'ES',
  'United Kingdom': 'GB'
};

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
  {(['USA', 'CAN', 'DEU', 'FRA', 'ITA', 'ESP', 'GBR','US','CA','DE','FR','IT','ES','GB'].includes(selectedCountry)) && (
    <select
      value={photo.productType}
      onChange={(e) => updateProductType(photo.id, e.target.value)}
      className="w-full p-1 border rounded"
      style={{ display: 'none' }} // Hide the select element
    >
      <option value="photo_print">{t('produits.photo_print')}</option>
    </select>
  )}

  {/* Product Type Selection for Tunisia */}
  {(selectedCountry === 'TUN' || selectedCountry === 'TN') && (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1" style={{ display: 'none' }}>
        {t('produits.product')}
      </label>
      <select
        value={photo.productType}
        onChange={(e) => updateProductType(photo.id, e.target.value)}
        className="w-full p-1 border rounded"
        style={{ display: 'none' }} // Hide the select element
      >
        <option value="photo_print">{t('produits.photo_print')}</option>
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
    {(selectedCountry === 'TUN' || selectedCountry === 'TN') ? (
        <>
            <option value="3.5x4.5">3.5x4.5 cm</option>
            <option value="10x15">10x15 cm</option>
            <option value="15x22">15x23 cm</option>
        </>
    ) : selectedCountry === 'USA' || selectedCountry === 'CAN' || selectedCountry === 'US' || selectedCountry === 'CA' ? (
        <>
            <option value="4x4"> 4x4"</option>
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
        {photo.size === '3.5x4.5' ? (
            // Generate options for multiples of 4 up to 96
            [...Array(24)].map((_, i) => {
                const quantity = (i + 1) * 4;
                return (
                    <option key={quantity} value={quantity}>
                        {quantity}
                    </option>
                );
            })
        ) : (
            // Regular quantity options (1-99) for other sizes
            [...Array(99)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                    {i + 1}
                </option>
            ))
        )}
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
          <StudioSelector
            onStudioSelect={setSelectedStudio}
            selectedCountry={selectedCountry}
            selectedStudio={selectedStudio}
          />
        );

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-medium">{t('buttons.review')}</h2>
            
              {/* Contact Information */}
              <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-3">{t('validation.contact_info')}</h3>
              <div className="space-y-4">
              <input
                  type="text"
                  placeholder={t('placeholder.name')}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2 border rounded"
                />

                <input
                  type="email"
                  placeholder={t('placeholder.email')}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-2 border rounded"
                />
                <input
                  type="tel"
                  placeholder={t('placeholder.phone')}
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>

            {/* Order Items Summary */}
            {renderInvoice()}
  
            {/* Pickup Details */}
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-3">{t('pickup.details')}</h3>
              {selectedStudio && (
                <div className="space-y-2">
                  <p className="font-medium">{selectedStudio.name}</p>
                  <p>{selectedStudio.address}</p>
                  <p>{selectedStudio.city}, {selectedStudio.country}</p>
                  <p className="text-sm text-gray-600">
                    {t('pickup.contact')}: {selectedStudio.phone}
                  </p>
                  <div className="mt-4">
                    <p className="font-medium mb-2">{t('pickup.hours')}:</p>
                    {selectedStudio.operatingHours.map((hours, index) => (
                      <p key={index} className="text-sm">
                        {getDayName(hours.day)}: {hours.isClosed ? 
                          t('pickup.closed') : 
                          `${hours.openTime} - ${hours.closeTime}`}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
  
          
  
            {/* Order Note */}
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-3">{t('produits.note')}</h3>
              <textarea
                placeholder={t('placeholder.order_note')}
                value={orderNote}
                onChange={(e) => setOrderNote(e.target.value)}
                className="w-full p-2 border rounded"
                rows={3}
              />
            </div>
  
           
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
        
  
        {/* Contact Information 
        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-3">{t('validation.contact_info')}</h3>
          <p className="text-gray-600">{formData.email}</p>
          <p className="text-gray-600">{formData.phone}</p>
        </div>*/}
  
        {/* Shipping Address 
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
  
        {/* Billing Address (if different from shipping) 
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
        )} */}
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
  {selectedCountry === 'TUN' || selectedCountry === 'TN' ? (
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
      {quantities['3.5x4.5'] > 0 && (
        <div className="flex justify-between py-2">
          <span>3.5x4.5 cm Photos ({quantities['3.5x4.5']} × {country?.size35x45.toFixed(2)} {country?.currency})</span>
          <span>{subtotalsBySize['3.5x4.5'].toFixed(2)} {country?.currency}</span>
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
      {(selectedCountry === 'USA' || selectedCountry === 'CAN' || selectedCountry === 'CA' || selectedCountry === 'US') && quantities['8x10'] > 0 && (
        <div className="flex justify-between py-2">
          <span>8x10" Photos ({quantities['8x10']} × {country?.size8x10.toFixed(2)} {country?.currency})</span>
          <span>{subtotalsBySize['8x10'].toFixed(2)} {country?.currency}</span>
        </div>
      )}
      {(selectedCountry === 'USA' || selectedCountry === 'CAN' || selectedCountry === 'CA' || selectedCountry === 'US') && quantities['4x4'] > 0 && (
        <div className="flex justify-between py-2">
          <span>4x4" Photo Magnets ({quantities['4x4']} × {country?.size4x4.toFixed(2)} {country?.currency})</span>
          <span>{subtotalsBySize['4x4'].toFixed(2)} {country?.currency}</span>
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
    
    if (selectedCountry === 'TUN' || selectedCountry === 'TN') {
        taxAmount = taxableAmount * 0.19;
    } else if (selectedCountry === 'CAN' || selectedCountry === 'CA' && formData.shippingAddress.province) {
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

        {/* Shipping Fee 
        <div className="flex justify-between py-2">
          <span>{t('order.shipping_fee')}</span>
          <span>{shippingFee.toFixed(2)} {country?.currency}</span>
        </div>*/}

        {/* Tax for Tunisia */}
        {(selectedCountry === 'TUN' || selectedCountry === 'TN') && (
          <div className="flex justify-between py-2">
            <span>TVA (19%)</span>
            <span>{taxAmount.toFixed(2)} {country?.currency}</span>
          </div>
        )}

        {/* Tax for Canada */}
        {selectedCountry === 'CAN' || selectedCountry === 'CA' && formData.shippingAddress.province && (
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
    <span>
      {t('order.discount')} ({getDiscountDisplay()})
    </span>
    <span>
      -{Math.abs(discount).toFixed(2)} {country?.currency}
    </span>
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
        photo.id === photoId ? {
            ...photo,
            size: newSize,
            // If changing to 3.5x4.5 size, adjust quantity to nearest multiple of 4
            quantity: newSize === '3.5x4.5' ? Math.ceil(photo.quantity / 4) * 4 : photo.quantity
        } : photo
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
    localStorage.removeItem('uploadedPhotos');
    localStorage.removeItem('freezepixState');
    setSelectedPhotos([]); // Clear the uploaded photos
    setSelectedCountry(country);
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
      
    case 1: // Studio Selection step
      return selectedStudio !== null;
      
    case 2: // Review Order step
      return formData.email && formData.phone;

    default:
      return false;
  }
};
const { t } = useTranslation();

  
if (showIntro) {
  return (
    <Routes>
      <Route path="/*" element={
        <div className="app-container bg-gray-50">
          <div className="main-content flex items-center justify-center">
            <div className="grid-container">
              <div className="bg-white rounded-lg shadow-lg overflow-hidden max-w-6xl w-full mx-auto">
                <div className="text-center p-8 space-y-6">
                  {/* Logo Section */}
                  <div className="flex justify-between items-center px-4">
                    <div className="text-4xl font-bold tracking-tight">
                      <span className="text-black">freeze</span>
                      <span className="text-yellow-400">PIX</span>
                    </div>
                    <LanguageSelector />
                  </div>

                  <div className="text-sm italic text-gray-600 mb-8">
                    {t('intro.welcome')}
                  </div>
                  
                  <div className="space-y-6 max-w-3xl mx-auto">
                    <h2 className="text-2xl font-semibold text-gray-800">
                      {t('intro.title')}
                    </h2>
                    
                    <p className="text-gray-600">
                      {t('intro.subtitle')}
                    </p>
          
                    <div className="grid grid-cols-3 gap-8 py-4">
                      <div className="text-center">
                        <Camera className="w-12 h-12 mx-auto mb-2 text-yellow-400" />
                        <div className="text-sm text-gray-600">{t('navigation.choose_photos')}</div>
                      </div>
                      <div className="text-center">
                        <Package className="w-12 h-12 mx-auto mb-2 text-yellow-400" />
                        <div className="text-sm text-gray-600">{t('navigation.select_sizes')}</div>
                      </div>
                      <div className="text-center">
                        <ShoppingCart className="w-12 h-12 mx-auto mb-2 text-yellow-400" />
                        <div className="text-sm text-gray-600">{t('navigation.quick_checkout')}</div>
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <p className="text-gray-600 mt-2">{t('navigation.location')}</p>
                    </div>
                    
                    <div className="max-w-xl mx-auto space-y-4">
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
                            handleStartPrinting();
                          }
                        }}
                        disabled={!selectedCountry}
                        className="w-full px-6 py-3 bg-yellow-400 text-black font-semibold rounded-lg shadow-md hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {t('buttons.start_printing')}
                      </button>
      
                     {/*  <div className="text-center">
                        <button 
                          onClick={() => setShowBookingPopup(true)} 
                          className="text-sm text-gray-600 hover:text-yellow-600 underline"
                        >
                          {t('buttons.book_service')}
                        </button>
                      </div>*/}
                    </div>
                  </div>
                </div>
                
                {/* Archive Policy */}
                <div className="border-t text-center py-3">
                  <p className="text-xs text-gray-500">
                    {t('intro.archive_policy')}
                  </p>
                </div>
              </div>
            </div>

            {/* Booking Popup */}
            {showBookingPopup && (
              <div className="modal-container">
                <div className="modal-content relative max-w-4xl h-[90vh] max-h-[600px]">
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
      } />
    </Routes>
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
            {t('order.success_details')} {formData.email}
          </p>
          <div className="mt-4">
            <p className="font-medium">{t('order.details')}:</p>
            <p>{t('order.order_number')}: {currentOrderNumber}</p>
            <p>{t('order.total_amount')}: {calculateTotals().total.toFixed(2)} {initialCountries.find((c) => c.value === selectedCountry)?.currency}</p>
            
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="font-medium">{t('pickup.location')}:</p>
              <p>{selectedStudio.name}</p>
              <p>{selectedStudio.address}</p>
              <p>{selectedStudio.city}, {selectedStudio.country}</p>
              <p className="text-sm text-gray-600 mt-2">{t('pickup.payment_notice')}</p>
            </div>
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
            {['Upload Photos', ' Studio Selection', 'Review Order'].map((step, index) => (
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
        {activeStep === 0 ? t('buttons.home') : t('buttons.back')}
      </button>

      {(activeStep !== 2 || selectedCountry === 'TUN' || selectedCountry === 'TN' || paymentMethod === 'interac') && (
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
      ? t('buttons.processing')
      : activeStep === 2 
        ? t('buttons.place_order')
        : t('buttons.next')
    }
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