import React from 'react';
import { memo, useState, useRef, useCallback, useEffect } from 'react';
import { Upload, ShoppingCart, Package, Camera, X , Loader, MapPin, Clock, Phone, Mail,aperture, Navigation, Check, ChevronDown, ChevronUp,Calendar ,ChevronLeft , Store  } from 'lucide-react';
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
import {ShareUrl} from './StudioUrlShare';
import StudioLocationHeader from './components/studiolocationheader';
import Stripe from 'stripe';
import { Routes, Route, useLocation } from 'react-router-dom';
import { 
  convertImageToBase64, 
  base64ToFile, 
  savePhotosToStorage, 
  loadPhotosFromStorage,
  clearPhotoStorage 
} from './imageHandlingUtils';
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
    size4x6: 0.6,
    size5x7: 2.99,
    size8x10: 4.20,
    size4x4: 0.55,
    crystal3d: 140, 
    keychain: 29.99, 
    keyring_magnet: 29.99 },
  { name: 'Canada', 
    value: 'CA', 
    currency: 'CAD', 
    rate: 1, 
    size4x6: 0.6,
    size5x7: 2.99,
    size8x10: 4.20,
    size4x4: 0.55,
    crystal3d: 140, 
    keychain: 29.99, 
    keyring_magnet: 29.99  },
  { name: 'Tunisia', 
    value: 'TN', 
    currency: 'TND', 
    rate: 1, 
    size10x15: 3.00, 
    size15x22: 5.00,
    size35x45: 1.25, 
    keychain: 15.00, 
    keyring_magnet: 15.00 },
  // Added European countries
  { name: 'United Kingdom', 
    value: 'GB', 
    currency: 'GBP', 
    rate: 0.78, 
    size4x6: 0.39,
    size5x7: 2.49,
    size8x10: 3.99,
    size4x4: 3.29,
    crystal3d: 110, 
    keychain: 24.99, 
    keyring_magnet: 24.99 },
  { name: 'Germany', 
    value: 'DE', 
    currency: 'EUR', 
    rate: 0.91, 
    size4x6: 0.45,
    size5x7: 2.79,
    size8x10: 4.59,
    size4x4: 3.59,
    crystal3d: 129, 
    keychain: 27.99, 
    keyring_magnet: 27.99 },
  { name: 'France', 
    value: 'FR', 
    currency: 'EUR', 
    rate: 0.91, 
    size4x6: 0.45,
    size5x7: 2.79,
    size8x10: 4.59,
    size4x4: 3.59,
    crystal3d: 129, 
    keychain: 27.99, 
    keyring_magnet: 27.99 },
  { name: 'Italy', 
    value: 'IT', 
    currency: 'EUR', 
    rate: 0.91, 
    size4x6: 0.45,
    size5x7: 2.79,
    size8x10: 4.59,
    size4x4: 3.59,
    crystal3d: 129, 
    keychain: 27.99, 
    keyring_magnet: 27.99 },
  { name: 'Spain', 
    value: 'ES', 
    currency: 'EUR', 
    rate: 0.91, 
    size4x6: 0.45,
    size5x7: 2.79,
    size8x10: 4.59,
    size4x4: 3.59,
    crystal3d: 129, 
    keychain: 27.99, 
    keyring_magnet: 27.99 },
  // Added APAC countries
  { name: 'Australia', 
    value: 'AU', 
    currency: 'AUD', 
    rate: 1.5, 
    size4x6: 0.69,
    size5x7: 3.99,
    size8x10: 6.99,
    size4x4: 5.49,
    crystal3d: 190, 
    keychain: 39.99, 
    keyring_magnet: 39.99 },
  { name: 'Japan', 
    value: 'JP', 
    currency: 'JPY', 
    rate: 149, 
    size4x6: 60,
    size5x7: 350,
    size8x10: 670,
    size4x4: 520,
    crystal3d: 18000, 
    keychain: 3800, 
    keyring_magnet: 3800 },
  { name: 'Singapore', 
    value: 'SG', 
    currency: 'SGD', 
    rate: 1.34, 
    size4x6: 0.65,
    size5x7: 3.79,
    size8x10: 6.29,
    size4x4: 4.99,
    crystal3d: 175, 
    keychain: 36.99, 
    keyring_magnet: 36.99 },
    // Add Russia
{ name: 'Russia', 
  value: 'RU', 
  currency: 'RUB', 
  rate: 92.5, // Exchange rate to USD (approx.)
  size4x6: 45,
  size5x7: 275,
  size8x10: 460,
  size4x4: 370,
  crystal3d: 12950, 
  keychain: 2775, 
  keyring_magnet: 2775 },

// Add China
{ name: 'China', 
  value: 'CN', 
  currency: 'CNY', 
  rate: 7.2, // Exchange rate to USD (approx.)
  size4x6: 3.5,
  size5x7: 21.5,
  size8x10: 36,
  size4x4: 29,
  crystal3d: 1000, 
  keychain: 215, 
  keyring_magnet: 215 },
  // Added Middle East countries
  { name: 'United Arab Emirates', 
    value: 'AE', 
    currency: 'AED', 
    rate: 3.67, 
    size4x6: 1.79,
    size5x7: 10.99,
    size8x10: 17.99,
    size4x4: 14.59,
    crystal3d: 499, 
    keychain: 109.99, 
    keyring_magnet: 109.99 },
  { name: 'Saudi Arabia', 
    value: 'SA', 
    currency: 'SAR', 
    rate: 3.75, 
    size4x6: 1.85,
    size5x7: 11.25,
    size8x10: 18.75,
    size4x4: 14.99,
    crystal3d: 525, 
    keychain: 112.99, 
    keyring_magnet: 112.99 },
  // Added South American countries
  { name: 'Brazil', 
    value: 'BR', 
    currency: 'BRL', 
    rate: 5.26, 
    size4x6: 2.59,
    size5x7: 15.79,
    size8x10: 26.29,
    size4x4: 20.99,
    crystal3d: 735, 
    keychain: 157.99, 
    keyring_magnet: 157.99 },
  { name: 'Mexico', 
    value: 'MX', 
    currency: 'MXN', 
    rate: 18.3, 
    size4x6: 8.99,
    size5x7: 54.99,
    size8x10: 89.99,
    size4x4: 72.99,
    crystal3d: 2550, 
    keychain: 549.99, 
    keyring_magnet: 549.99 },
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
  },
  'GB': { // United Kingdom
    default: 20.0 // 20% VAT
  },
  'DE': { // Germany
    default: 19.0 // 19% VAT
  },
  'FR': { // France
    default: 20.0 // 20% VAT
  },
  'IT': { // Italy
    default: 22.0 // 22% VAT
  },
  'ES': { // Spain
    default: 21.0 // 21% VAT
  },
  'AU': { // Australia
    default: 10.0 // 10% GST
  },
  'JP': { // Japan
    default: 10.0 // 10% Consumption Tax
  },
  'RU': { // Russia
  default: 20.0 // 20% VAT
},
'CN': { // China
  default: 13.0 // 13% VAT
},
  'SG': { // Singapore
    default: 9.0 // 9% GST (recently raised)
  },
  'AE': { // UAE
    default: 5.0 // 5% VAT
  },
  'SA': { // Saudi Arabia
    default: 15.0 // 15% VAT
  },
  'BR': { // Brazil
    default: 17.0 // Simplified approximation for ICMS
  },
  'MX': { // Mexico
    default: 16.0 // 16% IVA
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

  const PhotoOptions = ({ onStudioSelect, activeStep, setActiveStep, setShowIntro }) => {
    const [showBookingForm, setShowBookingForm] = useState(false);
    const [showStudioList, setShowStudioList] = useState(false);
    const [studios, setStudios] = useState([]);
    const [selectedStudio, setSelectedStudio] = useState(null);
    const [formData, setFormData] = useState({
      name: '',
      phone: '',
      email: '',
      dateTime: '',
      studioId: ''
    });
  
    useEffect(() => {
      if (showStudioList) {
        fetchStudios();
      }
    }, [showStudioList]);
  
    const fetchStudios = async () => {
      try {
        const response = await fetch('https://freezepix-database-server-c95d4dd2046d.herokuapp.com/api/studios');
        if (!response.ok) throw new Error('Failed to fetch studios');
        const data = await response.json();
        setStudios(data);
      } catch (error) {
        console.error('Error fetching studios:', error);
      }
    };
  
    const handlePassportPhoto = () => {
      window.location.href = 'https://photo-passport-958d6e9780c3.herokuapp.com/';
    };
  
    // Fixed function to handle studio selection
    const handleStudioSelect = (e, studio) => {
      // Prevent the default behavior which causes page refresh
      e.preventDefault(); 
      e.stopPropagation();
      
      // Save selected studio to localStorage for persistence
      localStorage.setItem('selectedStudio', JSON.stringify(studio));
      
      // Set the local state
      setSelectedStudio(studio);
      
      // Call the parent's onStudioSelect function with the selected studio
      onStudioSelect(studio);
    };
    
    const handleSubmit = (e) => {
      e.preventDefault();
      // Here you would send the booking data including studioId
      console.log('Booking submitted:', formData);
      alert('Booking received! We will contact you shortly.');
      setShowBookingForm(false);
      setShowStudioList(false);
      setSelectedStudio(null);
    };
  
    const handleBack = (e) => {
      e.preventDefault();
      
      const isPreselected = localStorage.getItem('isPreselectedFromUrl') === 'true';
      
      // Special handling if we're at step 2 with a preselected studio
      if (activeStep === 2 && isPreselected) {
        setActiveStep(0); // Go back to upload photos
        return;
      }
      
      // Normal back button behavior
      if (activeStep === 0) {
        setShowIntro(true);
      } else {
        setActiveStep(prev => prev - 1);
      }
    };
  
    // Common header with back button
    const Header = () => (
      <div className="sticky top-0 z-50 bg-white rounded-xl shadow-sm mb-4">
        <div className="flex items-center p-4">
          <button 
            onClick={handleBack}
            className="flex items-center text-gray-600"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Back
          </button>
        </div>
      </div>
    );
  
    if (showStudioList) {
      return (
        <div className="min-h-screen bg-gray-50 p-4">
          <Header />
  
          <div className="max-w-md mx-auto">
            
            <h2 className="text-2xl font-bold mb-6">Select a Studio</h2>
            
            <div className="space-y-4">
              {studios.map((studio) => (
                <div 
                  key={studio._id}
                  onClick={(e) => handleStudioSelect(e, studio)}
                  className="bg-white rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-semibold">{studio.name}</h3>
                      <div className="flex items-center text-gray-600 mt-2">
                        <MapPin className="w-4 h-4 mr-2" />
                        <p>{studio.address}</p>
                      </div>
                      <p className="text-gray-600 mt-1">{studio.city}, {studio.country}</p>
                    </div>
                    <ChevronLeft className="w-6 h-6 text-gray-400 transform rotate-180" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }
  
    if (showBookingForm) {
      return (
        <div className="min-h-screen bg-gray-50 p-4">
          <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-6">
            <button 
              onClick={() => {
                setShowBookingForm(false);
                setShowStudioList(true);
              }}
              className="flex items-center text-gray-600 mb-4"
            >
              <ChevronLeft className="w-5 h-5 mr-1" />
              Back
            </button>
            
            <h2 className="text-2xl font-bold mb-6">Studio Booking</h2>
            
            {selectedStudio && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold">{selectedStudio.name}</h3>
                <p className="text-gray-600">{selectedStudio.address}</p>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-400 focus:ring focus:ring-yellow-200"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input
                  type="tel"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-400 focus:ring focus:ring-yellow-200"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-400 focus:ring focus:ring-yellow-200"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-400 focus:ring focus:ring-yellow-200"
                  value={formData.dateTime}
                  onChange={(e) => setFormData({...formData, dateTime: e.target.value})}
                />
              </div>
              
              <button
                type="submit"
                className="w-full bg-yellow-400 text-white py-2 px-4 rounded-md hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2"
              >
                Book Appointment
              </button>
            </form>
          </div>
        </div>
      );
    }
  
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-md mx-auto space-y-4">
          <h1 className="text-3xl font-bold text-center mb-8">Choose Your Option</h1>
          
          <div 
            onClick={handlePassportPhoto}
            className="bg-white rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Camera className="w-8 h-8 text-yellow-400 mr-4" />
                <div>
                  <h2 className="text-xl font-semibold">Take a Picture Now</h2>
                  <p className="text-gray-600">Instant passport photos</p>
                  <span className="inline-block mt-2 bg-red-100 text-red-800 text-sm font-medium px-2.5 py-0.5 rounded">
                    50% OFF
                  </span>
                </div>
              </div>
              <ChevronLeft className="w-6 h-6 text-gray-400 transform rotate-180" />
            </div>
          </div>
          
          <div 
            onClick={() => setShowStudioList(true)}
            className="bg-white rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Store className="w-8 h-8 text-yellow-400 mr-4" />
                <div>
                  <h2 className="text-xl font-semibold">Visit Our Studios</h2>
                  <p className="text-gray-600">Professional photo session</p>
                </div>
              </div>
              <ChevronLeft className="w-6 h-6 text-gray-400 transform rotate-180" />
            </div>
          </div>
        </div>
      </div>
    );
  };
  const parseStudioSlugFromUrl = () => {
    // Check if URL contains a path segment after the domain
    const pathSegments = window.location.pathname.split('/').filter(Boolean);
    
    if (pathSegments.length > 0) {
      // The last path segment is our potential studio slug
      return pathSegments[pathSegments.length - 1];
    }
    
    return null;
  };
  
  // Function to generate studio slug
  const generateStudioSlug = (studioName) => {
    if (!studioName) return '';
    
    return studioName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };
  
  // Function to update URL with studio slug without page reload
  const updateUrlWithStudio = (studio) => {
    if (!studio || !studio.name) return;
    
    const slug = studio.slug || generateStudioSlug(studio.name);
    const baseUrl = window.location.origin;
    const newUrl = `${baseUrl}/${slug}`;
    
    // Update browser URL without reloading the page
    window.history.pushState({ studioId: studio._id }, '', newUrl);
  };
const FreezePIX = () => {
 

    const [showIntro, setShowIntro] = useState(false);
    const [selectedCountry, setSelectedCountry] = useState('');
    const [selectedPhotos, setSelectedPhotos] = useState([]); // Correct
    const [activeStep, setActiveStep] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState('helcim'); // Default payment method
    const [showPhotoOptions, setShowPhotoOptions] = useState(false);
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
    const [deliveryMethod, setDeliveryMethod] = useState('pickup'); // 'pickup' or 'shipping'

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
    country: selectedCountry,
    province: '',
    state: ''
  },
  billingAddress: {
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    postalCode: '',
    country: selectedCountry,
    province: '',
    state: ''
  },
  paymentMethod: 'helcim'
});

      const [isProductDetailsOpen, setIsProductDetailsOpen] = useState(false);

      const findNearestCountry = (latitude, longitude) => {
        // Define country bounding boxes and center points
        const countries = [
          { code: 'US', center: { lat: 37.0902, lng: -95.7129 } },
          { code: 'CA', center: { lat: 56.1304, lng: -106.3468 } },
          { code: 'TN', center: { lat: 34.0, lng: 9.0 } },
          { code: 'GB', center: { lat: 55.3781, lng: -3.4360 } },
          { code: 'DE', center: { lat: 51.1657, lng: 10.4515 } },
          { code: 'FR', center: { lat: 46.2276, lng: 2.2137 } },
          { code: 'IT', center: { lat: 41.8719, lng: 12.5674 } },
          { code: 'ES', center: { lat: 40.4637, lng: -3.7492 } },
          { code: 'AU', center: { lat: -25.2744, lng: 133.7751 } },
          { code: 'JP', center: { lat: 36.2048, lng: 138.2529 } },
          { code: 'SG', center: { lat: 1.3521, lng: 103.8198 } },
          { code: 'RU', center: { lat: 61.5240, lng: 105.3188 } },
          { code: 'CN', center: { lat: 35.8617, lng: 104.1954 } },
          { code: 'AE', center: { lat: 23.4241, lng: 53.8478 } },
          { code: 'SA', center: { lat: 23.8859, lng: 45.0792 } },
          { code: 'BR', center: { lat: -14.2350, lng: -51.9253 } },
          { code: 'MX', center: { lat: 23.6345, lng: -102.5528 } }
        ];
        
        // Calculate distances to each country center
        const distances = countries.map(country => {
          const distance = calculateDistance(
            latitude, 
            longitude, 
            country.center.lat, 
            country.center.lng
          );
          return { code: country.code, distance };
        });
        
        // Sort by distance and return closest
        distances.sort((a, b) => a.distance - b.distance);
        console.log('Sorted country distances:', distances);
        
        return distances[0].code;
      };

   // Replace the existing detectUserLocation function in App.jsx with this improved version
const detectUserLocation = async () => {
  try {
    // First try to get browser geolocation (most accurate)
    if (navigator.geolocation) {
      try {
        // Create a promise-based geolocation request
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            resolve,
            reject,
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
          );
        });
        
        console.log('Browser geolocation successful:', position.coords);
        
        // Use coords to detect the closest country
        const nearestCountry = findNearestCountry(position.coords.latitude, position.coords.longitude);
        console.log('Nearest country from coordinates:', nearestCountry);
        
        return {
          country: nearestCountry,
          coordinates: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          },
          method: 'geolocation'
        };
      } catch (geoError) {
        console.warn('Browser geolocation failed:', geoError);
        // Fall through to IP-based detection
      }
    }
    
    // Fallback to server-side IP detection
    console.log('Falling back to IP-based location detection');
    const response = await fetch('https://freezepix-database-server-c95d4dd2046d.herokuapp.com/api/geo-location', {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('IP-based location:', data);
    
    return {
      country: data.country_code,
      language: data.languages?.split(',')[0] || 'en',
      method: 'ip'
    };
  } catch (error) {
    console.warn('All location detection methods failed:', error);
    return {
      country: 'US', // Default fallback
      language: navigator.language?.split('-')[0] || 'en',
      method: 'fallback'
    };
  }
};
      
      const mapCountryCode = (code) => {
        const countryMap = {
          'USA': 'US',
          'CAN': 'CA',
          'TUN': 'TN',
          'CA':'CA',
          'US':'US',
          'TN':'TN',
          'RUS': 'RU', // Add Russia
          'RU': 'RU',
          'CHN': 'CN', // Add China
          'CN': 'CN'
          // Add more mappings as needed
        };
        return countryMap[code] || code;
      };

      useEffect(() => {
        const handleStudioPreselection = async () => {
          const studioSlug = parseStudioSlugFromUrl();
          
          if (!studioSlug) return;
          
          setIsLoading(true);
          setError(null);
          
          try {
            // First try exact match on slug field
            const response = await axios.get(
              `https://freezepix-database-server-c95d4dd2046d.herokuapp.com/api/studios/by-slug/${studioSlug}`
            );
            
            if (response.data && response.data._id) {
              console.log('Studio preselected from URL:', response.data.name);
              
              // Set the selected studio
              setSelectedStudio(response.data);
              
              // If country is specified in studio data, set it
              if (response.data.country) {
                const countryCode = mapCountryCode(response.data.country);
                if (initialCountries.some(c => c.value === countryCode)) {
                  setSelectedCountry(countryCode);
                }
              }
              
              // Skip intro and go directly to upload photos step
              setShowIntro(false);
              setActiveStep(0); // Set to upload photos step
              
              // Mark this studio as preselected
              localStorage.setItem('preselectedStudio', JSON.stringify(response.data));
              localStorage.setItem('isPreselectedFromUrl', 'true');
            }
          } catch (error) {
            console.error('Failed to find studio by slug, trying fuzzy match:', error);
            
            try {
              // Fall back to search by name if slug doesn't match exactly
              const searchResponse = await axios.get(
                `https://freezepix-database-server-c95d4dd2046d.herokuapp.com/api/studios/search`,
                { params: { query: studioSlug.replace(/-/g, ' ') } }
              );
              
              if (searchResponse.data && searchResponse.data.length > 0) {
                console.log('Studio found by fuzzy search:', searchResponse.data[0].name);
                
                // Set the selected studio
                setSelectedStudio(searchResponse.data[0]);
                
                // Set country if available
                if (searchResponse.data[0].country) {
                  const countryCode = mapCountryCode(searchResponse.data[0].country);
                  if (initialCountries.some(c => c.value === countryCode)) {
                    setSelectedCountry(countryCode);
                  }
                }
                
                // Skip intro and go directly to upload photos step
                setShowIntro(false);
                setActiveStep(0); // Ensure we land on the upload photos step
                
                // Mark this studio as preselected
                localStorage.setItem('preselectedStudio', JSON.stringify(searchResponse.data[0]));
                localStorage.setItem('isPreselectedFromUrl', 'true');
              } else {
                setError('Studio not found');
              }
            } catch (searchError) {
              console.error('Failed to find studio by search:', searchError);
              setError('Studio not found');
            }
          } finally {
            setIsLoading(false);
          }
        };
        
        handleStudioPreselection();
      }, []);  // Run once on component mount

      // Add this useEffect in your FreezePIX component
    // Replace this useEffect in your FreezePIX component
useEffect(() => {
  const setInitialCountryAndLanguage = async () => {
    try {
      setIsLoading(true);
      // Get current language using the context hook
      const currentLanguage = language || 'en'; // Access from context or use default
      
      // First try to get stored location if it exists and is recent
      const storedLocation = localStorage.getItem('userLocationData');
      const locationTimestamp = parseInt(localStorage.getItem('userLocationTimestamp') || '0', 10);
      const now = Date.now();
      const ONE_HOUR = 60 * 60 * 1000;
      
      let locationData;
      
      // Use stored location if it's fresh (less than 1 hour old)
      if (storedLocation && (now - locationTimestamp < ONE_HOUR)) {
        try {
          locationData = JSON.parse(storedLocation);
          console.log('Using cached location data:', locationData);
        } catch (error) {
          console.warn('Failed to parse stored location, will detect fresh location');
          locationData = null;
        }
      }
      
      // If no valid stored location, detect new location
      if (!locationData) {
        locationData = await detectUserLocation();
        
        // Store the new location data with timestamp
        try {
          localStorage.setItem('userLocationData', JSON.stringify(locationData));
          localStorage.setItem('userLocationTimestamp', now.toString());
        } catch (storageError) {
          console.warn('Failed to cache location data:', storageError);
        }
      }
      
      if (locationData) {
        const mappedCountry = mapCountryCode(locationData.country);
        
        // Set the country if it's in our list of supported countries
        if (initialCountries.some(c => c.value === mappedCountry)) {
          console.log('Setting country based on geolocation:', mappedCountry);
          setSelectedCountry(mappedCountry);
          
          // Update form data with the country
          setFormData(prev => ({
            ...prev,
            shippingAddress: {
              ...prev.shippingAddress,
              country: mappedCountry
            },
            billingAddress: {
              ...prev.billingAddress,
              country: mappedCountry
            }
          }));
          
          // Set language based on country, but don't override user's active selection
          if (changeLanguage && !currentLanguage) { 
            // Map country to language preference
            let languageToUse = 'en'; // Default
            
            if (mappedCountry === 'TN') {
              languageToUse = 'ar';
            } else if (locationData.language === 'fr') {
              languageToUse = 'fr';
            }
            
            changeLanguage(languageToUse);
          }
        } else {
          console.log('Country from geolocation not supported:', mappedCountry);
          setSelectedCountry('US'); // Default to US if country not supported
        }
      }
    } catch (error) {
      console.error('Error detecting location:', error);
      setSelectedCountry('US'); // Default to US on error
    } finally {
      setIsLoading(false);
    }
  };

  setInitialCountryAndLanguage();
}, [language, changeLanguage]); // Only depend on language context
      
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

      const ensurePhotoPrices = (photos, countryCode) => {
        if (!photos || !photos.length || !countryCode) return photos;
        
        const country = initialCountries.find(c => c.value === countryCode);
        if (!country) return photos;
        
        return photos.map(photo => {
          // Calculate the correct price if it's missing
          if (!photo.price) {
            let price = 0;
            if (photo.productType === 'photo_print') {
              switch (photo.size) {
                case '4x6': price = country.size4x6; break;
                case '5x7': price = country.size5x7; break;
                case '8x10': price = country.size8x10; break;
                case '4x4': price = country.size4x4; break;
                case '10x15': price = country.size10x15 || country.size4x6; break;
                case '15x22': price = country.size15x22 || country.size5x7; break;
                case '3.5x4.5': price = country.size35x45; break;
                default: price = country.size4x6; // Default to 4x6 price
              }
            } else if (photo.productType === '3d_frame') {
              price = country.crystal3d;
            } else if (photo.productType === 'keychain') {
              price = country.keychain;
            } else if (photo.productType === 'keyring_magnet') {
              price = country.keyring_magnet;
            }
            
            return {...photo, price};
          }
          
          return photo;
        });
      };

      useEffect(() => {
  // Check if we should restore from uploadedPhotos or freezepixState
  const uploadedPhotos = localStorage.getItem('uploadedPhotos');
  const savedState = localStorage.getItem('freezepixState');
  
  // First try to restore from uploadedPhotos
  if (uploadedPhotos) {
    try {
      const parsedPhotos = JSON.parse(uploadedPhotos);
      if (Array.isArray(parsedPhotos) && parsedPhotos.length > 0) {
        console.log('Restoring photos from previous session:', parsedPhotos.length);
        const restoredPhotos = parsedPhotos.map(photo => {
          // Skip invalid entries
          if (!photo.base64 || !photo.base64.startsWith('data:image/')) {
            return null;
          }
          
          // Try to reconstruct file
          let fileObj = null;
          try {
            if (photo.fileName && photo.base64) {
              fileObj = base64ToFile(photo.base64, photo.fileName);
            }
          } catch (e) {
            console.warn('Could not convert base64 to file:', e);
          }
          
          return {
            ...photo,
            file: fileObj,
            preview: photo.base64
          };
        }).filter(Boolean);
        
        if (restoredPhotos.length > 0) {
          // Apply price fixing to ensure all prices are set correctly
          const photosWithPrices = ensurePhotoPrices(restoredPhotos, selectedCountry);
          setSelectedPhotos(photosWithPrices);
        }
      }
    } catch (error) {
      console.error('Error restoring uploaded photos:', error);
    }
  }
  // Then try freezepixState as fallback
  else if (savedState) {
    try {
      const parsedState = JSON.parse(savedState);
      if (parsedState.selectedPhotos && Array.isArray(parsedState.selectedPhotos) && parsedState.selectedPhotos.length > 0) {
        console.log('Restoring photos from saved state:', parsedState.selectedPhotos.length);
        
        // Process photos from freezepixState
        const restoredPhotos = parsedState.selectedPhotos.map(photo => {
          // Skip invalid entries
          if (!photo.base64 || !photo.base64.startsWith('data:image/')) {
            return null;
          }
          
          // Try to reconstruct file
          let fileObj = null;
          try {
            if (photo.fileName && photo.base64) {
              fileObj = base64ToFile(photo.base64, photo.fileName);
            }
          } catch (e) {
            console.warn('Could not convert base64 to file:', e);
          }
          
          return {
            ...photo,
            file: fileObj,
            preview: photo.base64
          };
        }).filter(Boolean);
        
        if (restoredPhotos.length > 0) {
          // Apply price fixing before setting state
          const countryToUse = parsedState.selectedCountry || selectedCountry;
          const photosWithPrices = ensurePhotoPrices(restoredPhotos, countryToUse);
          setSelectedPhotos(photosWithPrices);
          
          // Also restore other state if needed
          if (parsedState.selectedCountry) {
            setSelectedCountry(parsedState.selectedCountry);
          }
        }
      }
    } catch (error) {
      console.error('Error restoring from freezepixState:', error);
    }
  }
}, [selectedCountry]);

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
     const { language ,changeLanguage } = useLanguage(); 
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

      // Add this function to your FreezePIX component
      const handleStudioSelect = (studio) => {
        // Check if studio is a valid object
        if (!studio || !studio._id) {
          console.error('Invalid studio selected:', studio);
          return;
        }
        
        // Map studio country to correct country code
        const mapCountryCode = (countryName) => {
          const countryMap = {
            'United States': 'US',
            'USA': 'US',
            'Canada': 'CA',
            'CAN': 'CA',
            'Tunisia': 'TN',
            'TUN': 'TN',
            'United Kingdom': 'GB',
            'Germany': 'DE',
            'France': 'FR',
            'Italy': 'IT',
            'Spain': 'ES',
            'Australia': 'AU',
            'Japan': 'JP',
            'Singapore': 'SG',
            'United Arab Emirates': 'AE',
            'Saudi Arabia': 'SA',
            'Brazil': 'BR',
            'Mexico': 'MX',
            'Russia': 'RU',
            'China': 'CN'
          };
          
          return countryMap[countryName] || countryName;
        };
        
        // Determine country from studio
        const studioCountry = mapCountryCode(studio.country);
        
        // Validate that the country exists in our supported countries
        const validCountry = initialCountries.some(c => c.value === studioCountry);
        
        // Update studio and country
        setSelectedStudio(studio);
        
        // Only update country if it's a valid supported country
        if (validCountry) {
          setSelectedCountry(studioCountry);
        }
        
        // Update URL with studio slug (if needed)
        updateUrlWithStudio(studio);
        
        // Store in localStorage for persistence
        localStorage.setItem('selectedStudio', JSON.stringify(studio));
        
        // If this is a newly selected studio (not from URL), update flag
        if (localStorage.getItem('isPreselectedFromUrl') === 'true') {
          localStorage.setItem('isPreselectedFromUrl', 'false');
        }
        
        console.log('Studio selected:', studio.name, 'Country set to:', studioCountry);
      };
// Enhanced StudioSelector with fixed handleStudioSelection function
const StudioSelector = ({ onStudioSelect, selectedStudio, selectedCountry }) => {
  const [studios, setStudios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studioError, setStudioError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const [distanceFilter, setDistanceFilter] = useState(() => {
    const savedDistance = localStorage.getItem('studioDistanceFilter');
    return savedDistance ? parseInt(savedDistance) : 20; // Default to 20km
  });
  
  const studioSlug = parseStudioSlugFromUrl();
  const isPreselectedFromUrl = localStorage.getItem('isPreselectedFromUrl') === 'true';
  const { t } = useTranslation();
  
  // Number of studios to show initially
  const INITIAL_DISPLAY_COUNT = 4;
  
  // Calculate distance between two geographical coordinates
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in km
  };

  // Save distance filter to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('studioDistanceFilter', distanceFilter.toString());
  }, [distanceFilter]);

  // Function to handle studio selection - THIS is the missing function
  const handleStudioSelection = (e, studio) => {
    // Prevent default form submission behavior
    e.preventDefault();
    e.stopPropagation();
    
    // Update URL with studio slug
    updateUrlWithStudio(studio);
    
    // Save studio to localStorage
    localStorage.setItem('selectedStudio', JSON.stringify(studio));
    localStorage.setItem('isPreselectedFromUrl', 'false'); // Clear the URL preselection flag
    
    // Call the parent's onStudioSelect function
    onStudioSelect(studio);
  };
  
  // Get user's geolocation
  useEffect(() => {
    if (navigator.geolocation && !isPreselectedFromUrl) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          setStudioError('Please enable location services to find nearby studios');
        }
      );
    }
  }, [isPreselectedFromUrl]);

  // Fetch studios data
  useEffect(() => {
    const fetchStudios = async () => {
      try {
        // If we have a preselected studio from URL and it's already loaded in selectedStudio
        if (isPreselectedFromUrl && selectedStudio && selectedStudio._id) {
          console.log('Using preselected studio:', selectedStudio.name);
          
          // Use the preselected studio and also fetch others in the background
          setStudios([selectedStudio]);
          setLoading(false);
          
          // Still fetch all studios in the background
          const allStudiosResponse = await axios.get('https://freezepix-database-server-c95d4dd2046d.herokuapp.com/api/studios');
          let allStudios = Array.isArray(allStudiosResponse.data) ? allStudiosResponse.data : [allStudiosResponse.data];
          allStudios = allStudios.filter(studio => studio.isActive);
          
          // Make sure our preselected studio is at the top
          const otherStudios = allStudios.filter(studio => studio._id !== selectedStudio._id);
          setStudios([selectedStudio, ...otherStudios]);
          
          // Since we're preselected, we don't need to show the distance UI
          setShowAll(true);
          
          return;
        }
        
        // Normal fetch for all studios
        const response = await axios.get('https://freezepix-database-server-c95d4dd2046d.herokuapp.com/api/studios');
        let studiosData = Array.isArray(response.data) ? response.data : [response.data];
        
        studiosData = studiosData.filter(studio => studio.isActive);

        if (userLocation) {
          studiosData = studiosData.map(studio => ({
            ...studio,
            distance: calculateDistance(
              userLocation.latitude,
              userLocation.longitude,
              studio.coordinates?.latitude || 0,
              studio.coordinates?.longitude || 0
            )
          }));

          studiosData.sort((a, b) => a.distance - b.distance);
        }
        
        // If there's a preselected studio, make sure it's first in the list
        if (selectedStudio && selectedStudio._id) {
          const selectedIndex = studiosData.findIndex(s => s._id === selectedStudio._id);
          if (selectedIndex > 0) {
            const selected = studiosData.splice(selectedIndex, 1)[0];
            studiosData.unshift(selected);
          }
        }
        
        setStudios(studiosData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching studios:', error);
        setStudioError('Failed to fetch studios');
        setLoading(false);
      }
    };

    fetchStudios();
  }, [userLocation, selectedStudio, isPreselectedFromUrl]);

  // Filter studios based on distance (unless preselected)
  const filteredStudios = isPreselectedFromUrl 
    ? studios // If preselected, show all studios with preselected first
    : userLocation 
      ? studios.filter(studio => studio.distance <= distanceFilter)
      : studios;

  const displayedStudios = showAll ? filteredStudios : filteredStudios.slice(0, INITIAL_DISPLAY_COUNT);
  const hasMoreStudios = filteredStudios.length > INITIAL_DISPLAY_COUNT;
  const totalAvailableStudios = studios.length;
  const totalFilteredStudios = filteredStudios.length;
  const languageCode = navigator.language?.split('-')[0] || 'en';

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  if (studioError && !isPreselectedFromUrl) {
    return (
      <div className="text-red-500 text-center p-4">
        {studioError}
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-medium">{t('pickup.nearest_locations')}</h2>
        
        {/* Add this conditional notice for preselected studios */}
        {isPreselectedFromUrl && selectedStudio && (
          <div className="bg-yellow-100 p-2 rounded-lg text-sm">
            <p className="flex items-center">
              <Check size={16} className="mr-1 text-green-500" />
              {t('pickup.preselected_studio')}
            </p>
          </div>
        )}
        
        {/* Only show distance filter if not preselected */}
        {!isPreselectedFromUrl && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">{t('pickup.distance_filter')}:</span>
            <select 
              value={distanceFilter} 
              onChange={(e) => setDistanceFilter(Number(e.target.value))}
              className="p-2 border rounded text-sm"
            >
              <option value={20}>20 km</option>
              <option value={50}>50 km</option>
              <option value={100}>100 km</option>
              <option value={500}>500 km</option>
              <option value={1000000}>{t('pickup.show_all')}</option>
            </select>
          </div>
        )}
      </div>

      {/* Filter status message - only show if not preselected */}
      {!isPreselectedFromUrl && userLocation && (
        <div className="text-sm text-gray-600">
          {totalFilteredStudios === 0 
            ? t('pickup.no_locations_within', { distance: distanceFilter })
            : t('pickup.showing_locations', { 
                count: totalFilteredStudios,
                total: totalAvailableStudios,
                distance: distanceFilter < 1000000 ? `${distanceFilter} km` : t('pickup.any_distance')
              })
          }
        </div>
      )}

      {filteredStudios.length === 0 ? (
        <div className="p-6 text-center border rounded-lg bg-gray-50">
          <p className="mb-2 text-gray-700">{t('pickup.no_nearby_studios')}</p>
          <p className="text-sm text-gray-500">{t('pickup.try_increasing')}</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {displayedStudios.map(studio => (
            <div
              key={studio._id}
              className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                selectedStudio?._id === studio._id
                  ? 'border-yellow-400 bg-yellow-50'
                  : 'hover:border-gray-400'
              }`}
              onClick={(e) => handleStudioSelection(e, studio)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleStudioSelection(e, studio);
                }
              }}
            >
              {/* Studio information */}
              <div className="flex justify-between items-start">
                <h3 className="font-medium text-lg mb-2">
                  {studio.translations?.[languageCode]?.name || studio.name}
                </h3>
                {studio.distance !== undefined && !isPreselectedFromUrl && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Navigation size={16} className="mr-1" />
                    {studio.distance.toFixed(1)} km
                  </div>
                )}
              </div>
              
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
                    <span className="font-medium">{t('pickup.hours')}:</span>
                  </div>
                  <div className="grid grid-cols-1 gap-1">
                    {studio.operatingHours
                      .sort((a, b) => a.day - b.day)
                      .map(hours => (
                      <div key={hours.day} className="flex justify-between text-xs">
                        <span>{getDayName(hours.day)}</span>
                        <span dir="ltr">
                          {hours.isClosed ? t('pickup.closed') : `${hours.openTime} - ${hours.closeTime}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="text-xs text-gray-500 mt-2">
                  {studio.translations?.[languageCode]?.description || studio.description}
                </div>
              </div>
              
              {/* Add URL sharing for selected studio */}
              {selectedStudio?._id === studio._id && (
                <ShareUrl studio={studio} />
              )}
            </div>
          ))}
        </div>
      )}

      {hasMoreStudios && !isPreselectedFromUrl && (
        <div className="flex justify-center mt-4">
          <button
            onClick={(e) => {
              e.preventDefault();
              setShowAll(!showAll);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
          >
            {showAll ? (
              <>
                {t('pickup.show_less')}
                <ChevronUp size={20} />
              </>
            ) : (
              <>
                {t('pickup.show_more')}
                <ChevronDown size={20} />
              </>
            )}
          </button>
        </div>
      )}
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
  
    if (country !== 'TUN' || country !== 'TN') {
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
    if (country !== 'TUN' || country !== 'TN' ) {
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
      // Save ObjectURLs to clean up later
      const objectURLs = selectedPhotos
        .filter(photo => photo.preview && typeof photo.preview === 'string' && photo.preview.startsWith('blob:'))
        .map(photo => photo.preview);
      
      // Return cleanup function
      return () => {
        objectURLs.forEach(url => {
          URL.revokeObjectURL(url);
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
      prevPhotos.map(photo => {
        // Calculate the new price based on the product type and size
        let newPrice = 0;
        if (photo.productType === 'photo_print') {
          switch (photo.size) {
            case '4x6': newPrice = country.size4x6; break;
            case '5x7': newPrice = country.size5x7; break;
            case '8x10': newPrice = country.size8x10; break;
            case '4x4': newPrice = country.size4x4; break;
            case '10x15': newPrice = country.size10x15 || country.size4x6; break;
            case '15x22': newPrice = country.size15x22 || country.size5x7; break;
            case '3.5x4.5': newPrice = country.size35x45; break;
            default: newPrice = country.size4x6; // Default to 4x6 price
          }
        } else if (photo.productType === '3d_frame') {
          newPrice = country.crystal3d;
        } else if (photo.productType === 'keychain') {
          newPrice = country.keychain;
        } else if (photo.productType === 'keyring_magnet') {
          newPrice = country.keyring_magnet;
        }

        return {
          ...photo,
          price: newPrice,
          quantity: photo.quantity || 1
        };
      })
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

const renderNavigationButtons = () => {
  const isStepValid = validateStep();
  
  return (
    <div className="flex justify-between mt-8">
      {activeStep > 0 ? (
        <button
          onClick={handleBack}
          className="px-6 py-2 rounded bg-gray-100 hover:bg-gray-200"
          type="button"
        >
          {t('buttons.back')}
        </button>
      ) : (
        <div></div> // Empty div for layout consistency
      )}
      
      {/* Conditional rendering for payment button */}
      {activeStep === 1 && paymentMethod === 'helcim' ? (
        <div className="helcim-payment-wrapper">
          <HelcimPayButton 
            onPaymentSuccess={handleHelcimPaymentSuccess}
            isProcessing={isProcessingOrder}
            disabled={!formIsValid}
            selectedCountry={selectedCountry}
            total={calculateTotals().total} // Fix: use the total from calculateTotals
            setOrderSuccess={setOrderSuccess}
            setError={setError}
            setIsProcessingOrder={setIsProcessingOrder}
            onSecretTokenReceived={handleSecretTokenReceived}
          />
        </div>
      ) : (
        <button
          onClick={handleNext}
          disabled={!isStepValid}
          className={`px-6 py-2 rounded relative overflow-hidden transition-all duration-300 ${
            isStepValid
              ? 'bg-yellow-400 hover:bg-yellow-500'
              : 'bg-gray-200 cursor-not-allowed'
          }`}
          type="button"
        >
          <div className="flex items-center justify-center gap-2 relative z-10">
            <span className="text-black font-bold tracking-wide">Print</span>
            <div className="relative">
              {/* FreezeFIX custom printer icon */}
              <svg width="28" height="26" viewBox="0 0 28 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Main printer body - black like "freeze" */}
                <rect x="4" y="6" width="20" height="10" rx="2" fill="black" />
                
                {/* Paper input tray */}
                <path d="M7 6V2H21V6" fill="none" stroke="black" strokeWidth="2" />
                
                {/* Paper output */}
                <rect 
                  x="7" 
                  y="16" 
                  width="14" 
                  height="6"
                  fill="white" 
                />
                
                {/* FreezeFIX-style pixels on printer in yellow like "FIX" */}
                <rect x="18" y="8" width="2" height="2" fill="#FFCC00" />
                <rect x="20" y="8" width="2" height="2" fill="#FFCC00" />
                <rect x="20" y="10" width="2" height="2" fill="#FFCC00" />
                
                {/* Printer controls */}
                <rect x="8" y="9" width="2" height="2" fill="#444" />
                <rect x="11" y="9" width="3" height="2" fill="#444" />
                
                {/* Yellow pixel pattern on printed paper */}
                <rect x="9" y="17" width="2" height="2" fill="#FFCC00" />
                <rect x="11" y="17" width="2" height="2" fill="#FFCC00" />
                <rect x="9" y="19" width="2" height="2" fill="#FFCC00" />
                <rect x="16" y="18" width="2" height="2" fill="#FFCC00" />
                <rect x="18" y="18" width="1" height="1" fill="#FFCC00" />
                <rect x="16" y="20" width="1" height="1" fill="#FFCC00" />
              </svg>
            </div>
          </div>
        </button>
      )}
    </div>
  );
};

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
        if (!photo || !country) return 0;
        
        if (photo.productType === 'photo_print') {
          switch (photo.size) {
            case '4x6': return country.size4x6 || 0;
            case '5x7': return country.size5x7 || 0;
            case '8x10': return country.size8x10 || 0;
            case '4x4': return country.size4x4 || 0;
            case '10x15': return country.size10x15 || country.size4x6 || 0;
            case '15x22': return country.size15x22 || country.size5x7 || 0;
            case '3.5x4.5': return country.size35x45 || 0;
            default: return 0;
          }
        } else if (photo.productType === '3d_frame') {
          return country.crystal3d || 0;
        } else if (photo.productType === 'keychain') {
          return country.keychain || 0;
        } else if (photo.productType === 'keyring_magnet') {
          return country.keyring_magnet || 0;
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

    const response = await fetch('https://freezepix-database-server-c95d4dd2046d.herokuapp.com/send-order-confirmation', {
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
      shippingFee: orderData.shippingFee || 0,
      shippingMethod: orderData.deliveryMethod === 'shipping' ? 'shipping' : 'local_pickup',
      deliveryMethod: orderData.deliveryMethod || 'pickup',
      status: paymentMethod === 'helcim' ? 'Processing' : 'Waiting for CSR approval',
      paymentMethod: paymentMethod, // Ensure payment method is passed through
      paymentStatus: paymentMethod === 'helcim' ? 'paid' : 'pending'
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
  const navigate = navigate();

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
      'United Kingdom': 'GB',
      'Russia': 'RU',     // Add Russia
      'RUS': 'RU',
      'China': 'CN',      // Add China
      'CHN': 'CN'
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
  selectedStudio,
  isBillingAddressSameAsShipping,
  stripePaymentMethod = null,
  helcimPaymentData = null
}) => {
  let orderData = null;
  let orderNumber = null;
  let paymentIntent = null;

  try {
    // Validate required fields first
    if (!formData?.email || 
      !formData?.shippingAddress?.firstName ||
      !formData?.shippingAddress?.lastName ||
      !formData?.shippingAddress?.address ||
      !formData?.shippingAddress?.city ||
      !formData?.shippingAddress?.postalCode) {
      throw new Error('Missing required shipping information');
    }

    if (deliveryMethod === 'pickup' && !selectedStudio) {
      throw new Error('Please select a pickup location');
    }

    if (!formIsValid(formData)) {
      throw new Error('Please fill in all required fields correctly');
    }

    const getStripeCountryCode = (countryCode) => {
      const countryMappings = {
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
      return countryMappings[countryCode] || countryCode;
    };

    // Format shipping address for Stripe
    const shippingAddress = {
      line1: formData.shippingAddress?.address || '',
      city: formData.shippingAddress?.city || '',
      state: formData.shippingAddress?.state || formData.shippingAddress?.province || '',
      postal_code: formData.shippingAddress?.postalCode || '',
      country: selectedCountry || '',
      name: `${formData.shippingAddress?.firstName || ''} ${formData.shippingAddress?.lastName || ''}`,
      phone: formData.phone || ''
    };

    // Format billing address
    const billingAddress = isBillingAddressSameAsShipping 
      ? shippingAddress
      : {
          line1: formData.billingAddress.address,
          city: formData.billingAddress.city,
          state: formData.billingAddress.state || formData.billingAddress.province || '',
          postal_code: formData.billingAddress.postalCode,
          country: formData.billingAddress.country || selectedCountry,
          name: `${formData.billingAddress.firstName} ${formData.billingAddress.lastName}`,
          phone: formData.phone || ''
        };

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

    // Determine the payment method based on delivery and selected payment option
    let finalPaymentMethod;
    if (deliveryMethod === 'pickup') {
      finalPaymentMethod = paymentMethod === 'helcim' ? 'helcim' : 'in_store';
    } else {
      finalPaymentMethod = paymentMethod;
    }

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

    // Construct order data
    orderData = {
      orderNumber,
      email: formData.email,
      phone: formData.phone,
      pickupStudio: deliveryMethod === 'pickup' ? {
        id: selectedStudio._id,
        name: selectedStudio.name,
        address: selectedStudio.address,
        city: selectedStudio.city,
        country: selectedStudio.country,
        province: selectedStudio.province || ''
      } : null,
      shippingAddress: deliveryMethod === 'shipping' ? formData.shippingAddress : null,
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
      totalAmount: Number(total) || 0,
      subtotal: Number(subtotal) || 0,
      shippingFee: Number(shippingFee) || 0,
      taxAmount: Number(taxAmount) || 0,
      discount: Number(discount) || 0,
      currency: country.currency,
      orderNote: orderNote || '',
      paymentMethod: 'helcim',
      status: finalPaymentMethod === 'helcim' ? 'Processing' : 'Waiting for CSR approval',
      paymentStatus: finalPaymentMethod === 'helcim' ? 'paid' : 'pending',
      deliveryMethod: deliveryMethod,
      stripePaymentId: stripePaymentMethod,
      paymentIntentId: paymentIntent?.id,
      customerDetails: {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        country: selectedCountry
      },
      selectedCountry,
      discountCode: discountCode || null,
      createdAt: new Date().toISOString()
    };

    const subtotalsBySize = selectedPhotos.reduce((acc, photo) => {
      const size = photo.size;
      const amount = (photo.price || 0) * (photo.quantity || 1);
      acc[size] = (acc[size] || 0) + amount;
      return acc;
    }, {});

    // If this is a Helcim payment but doesn't have token/transaction data
    // We should not submit the order directly as it will be submitted after successful payment
    if (finalPaymentMethod === 'helcim' && !helcimPaymentData?.transactionId) {
      console.log('Preparing Helcim payment, order will be submitted after payment completion');
      setIsProcessingOrder(false);
      return orderData; // Return order data for Helcim processing
    }

    if (paymentMethod === 'helcim') {
      try {
        // Initialize Helcim payment
        const helcimResponse = await initializeHelcimPayCheckout({
          formData,
          selectedCountry,
          total,
          subtotalsBySize,
          selectedStudio
        });

        if (!helcimResponse?.checkoutToken) {
          throw new Error('Failed to initialize Helcim payment');
        }

        // Store Helcim payment data
        orderData = {
          ...orderData,
          paymentMethod: 'helcim',
          helcimPaymentId: helcimResponse.checkoutToken,
          paymentStatus: helcimPaymentData?.success ? 'paid' : 'pending'
        };

        // If payment was successful, proceed with order processing
        if (helcimPaymentData?.success) {
          // Validate Helcim payment response
          const isValid = await validateHelcimPayment(helcimPaymentData, helcimResponse.secretToken);
          if (!isValid) {
            throw new Error('Invalid Helcim payment validation');
          }
        } else {
          throw new Error('Helcim payment not completed');
        }

      } catch (helcimError) {
        console.error('Helcim payment error:', helcimError);
        throw new Error(`Helcim payment failed: ${helcimError.message}`);
      }
    }

    if (paymentMethod === 'credit') {
      let checkoutSession = null;
  
      try {
        console.log('Discount Code:', discountCode);
        console.log('Tax Amount:', taxAmount);
        const getStripeCouponId = (code) => {
          const coupons = {
            'MOHAMED': 'promo_1QOzC2KmwKMSxU2Dzexmr58J',
            'B2B': 'promo_1QOz9yKmwKMSxU2Duc7WtDlu',
            'MCF99': 'promo_1QOzCvKmwKMSxU2D0ItOujrd'
          };
          return coupons[code?.toUpperCase()];
        };
        
        const stripeOrderData = {
          ...orderData,
          line_items: [
            // Regular items
            ...orderData.orderItems.map(item => ({
              price_data: {
                currency: orderData.currency.toLowerCase(),
                product_data: {
                  name: `Photo Print - ${item.size}`,
                },
                unit_amount: Math.round(item.price * 100), // Convert to cents
              },
              quantity: item.quantity,
            })),
            
            // Shipping fee (if applicable)
            ...(shippingFee > 0 ? [{
              price_data: {
                currency: orderData.currency.toLowerCase(),
                product_data: {
                  name: 'Shipping Fee',
                },
                unit_amount: Math.round(shippingFee * 100), // Convert to cents
              },
              quantity: 1,
            }] : []),
            
            // Tax (explicitly added)
            ...(taxAmount > 0 ? [{
              price_data: {
                currency: orderData.currency.toLowerCase(),
                product_data: {
                  name: 'Sales Tax',
                },
                unit_amount: Math.round(taxAmount * 100), // Convert to cents
              },
              quantity: 1,
            }] : []),
          ],
          
          mode: 'payment',
          customer_email: formData.email,
          
          // Comprehensive metadata
          metadata: {
            orderNumber: orderNumber,
            discountCode: discountCode || 'none',
            discount: discount || 0,
            taxAmount: taxAmount || 0,
            shippingFee: shippingFee || 0,
            totalAmount: total
          },
          
          // Success and cancel URLs
          success_url: `${window.location.origin}/order-success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${window.location.origin}/order-cancel`,
        };
      
        console.log('Stripe Order Data:', stripeOrderData);
      
        checkoutSession = await createStripeCheckoutSession(stripeOrderData);
        
        if (!checkoutSession?.url) {
          //throw new Error('Invalid checkout session response: Missing URL');
        }
  
        // Save order data to session storage before redirect
        sessionStorage.setItem('pendingOrder', JSON.stringify({
          orderNumber: orderData.orderNumber,
          orderData: orderData
        }));
        sessionStorage.setItem('stripeSessionId', checkoutSession.id);
        
        // Enhanced iframe detection and redirect handling
        const handleRedirect = (url) => {
          return new Promise((resolve, reject) => {
            // Set a timeout for redirect failure
            const timeoutId = setTimeout(() => {
              reject(new Error('Redirect timeout after 5000ms'));
            }, 5000);
  
            try {
              // Check if we're in an iframe
              const isInIframe = window.self !== window.top;
              
              if (isInIframe) {
                // First try: Direct parent redirect with try-catch
                try {
                  window.parent.location.href = url;
                  clearTimeout(timeoutId);
                  resolve(true);
                } catch (directRedirectError) {
                  console.warn('Direct parent redirect failed, attempting postMessage:', directRedirectError);
                  
                  // Second try: postMessage with confirmation
                  const messageHandler = (event) => {
                    if (event.data?.type === 'STRIPE_REDIRECT_CONFIRMED') {
                      window.removeEventListener('message', messageHandler);
                      clearTimeout(timeoutId);
                      resolve(true);
                    }
                  };
  
                  window.addEventListener('message', messageHandler);
                  
                  // Send message to parent with all necessary data
                  window.parent.postMessage({
                    type: 'STRIPE_REDIRECT',
                    url: url,
                    sessionId: checkoutSession.id,
                    orderNumber: orderData.orderNumber
                  }, '*');
  
                  // Don't resolve here - wait for confirmation or timeout
                }
              } else {
                // Not in iframe, do regular redirect
                window.location.href = url;
                clearTimeout(timeoutId);
                resolve(true);
              }
            } catch (error) {
              clearTimeout(timeoutId);
              reject(new Error(`Redirect failed: ${error.message}`));
            }
          });
        };
  
        try {
          await handleRedirect(checkoutSession.url);
          return; // Successful redirect
        } catch (redirectError) {
          console.error('Redirect failed:', redirectError);
          throw new Error(`Failed to redirect to payment page: ${redirectError.message}`);
        }
  
      } catch (stripeError) {
        console.error('Stripe checkout error:', stripeError);
        
        // Enhanced error logging with null check for checkoutSession
        const errorDetails = {
          message: stripeError.message,
          isInIframe: window.self !== window.top,
          sessionData: checkoutSession || 'Session creation failed',
          timestamp: new Date().toISOString(),
          orderNumber: orderData.orderNumber,
          paymentMethod: paymentMethod,
          country: selectedCountry
        };
        
        console.error('Detailed checkout error:', errorDetails);
        
        // Save error state for recovery with more context
        try {
          await saveStateWithCleanup({
            checkoutError: errorDetails,
            recoveryData: {
              orderNumber: orderData.orderNumber,
              timestamp: new Date().toISOString(),
              lastAttemptedStep: checkoutSession ? 'redirect' : 'session_creation'
            }
          });
        } catch (storageError) {
          console.warn('Failed to save checkout error state:', storageError);
        }
        
        // Set more specific error message based on the failure point
        const errorMessage = checkoutSession 
          ? 'Payment redirect failed. Please try again.'
          : 'Unable to initialize payment. Please try again.';
        
        setError(errorMessage);
        throw stripeError;
      }
    }

    // Helper function to validate Helcim payment
    const validateHelcimPayment = async (paymentData, secretToken) => {
      try {
        // Generate hash for validation
        const generateHash = (data, secretToken) => {
          const jsonData = JSON.stringify(data);
          return window.crypto.subtle.digest(
            'SHA-256', 
            new TextEncoder().encode(jsonData + secretToken)
          );
        };

        const localHash = await generateHash(paymentData.data, secretToken);
        const remoteHash = paymentData.hash;

        return localHash === remoteHash;
      } catch (error) {
        console.error('Payment validation error:', error);
        return false;
      }
    };

    // Helper function to cancel Helcim payment
    const cancelHelcimPayment = async (paymentId) => {
      try {
        await axios.post(
          `${HELCIM_API_URL}/cancel`,
          { paymentId },
          {
            headers: {
              'accept': 'application/json',
              'api-token': API_TOKEN,
              'content-type': 'application/json'
            }
          }
        );
      } catch (error) {
        console.error('Failed to cancel Helcim payment:', error);
        throw error;
      }
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

    throw error; // Re-throw to be handled by the form

  } finally {
    setIsProcessingOrder(false);
    setUploadProgress(0);
    
    if (orderSuccess) {
      clearStateStorage();
    }
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
      pickupStudio: deliveryMethod === 'pickup' ? {
        id: selectedStudio._id,
        name: selectedStudio.name,
        address: selectedStudio.address,
        city: selectedStudio.city,
        country: selectedStudio.country
      } : null,
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
      totalAmount: Number(paymentData.amount) || 0,
      subtotal: Number(paymentData.amount) - (paymentData.amount > 69.99 ? 0 : 20),
      shippingFee: Number(shippingFee) || 0, //shipping Same as invoice
      taxAmount: Number(taxAmount), // tax same as invoice
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
          // Store current state in history state object to preserve it
          const saveCurrentState = () => {
            const state = {
              activeStep,
              selectedStudio: localStorage.getItem('selectedStudio'),
              distanceFilter: localStorage.getItem('studioDistanceFilter')
            };
            window.history.replaceState(state, '', window.location.pathname);
          };
          
          saveCurrentState();
          
          // Handle the popstate event (triggered by back button)
          const handleBackButton = (event) => {
            // Prevent default behavior
            event.preventDefault();
            
            // Get saved state if available
            const savedState = event.state;
            
            // Restore distance filter if available
            if (savedState?.distanceFilter) {
              localStorage.setItem('studioDistanceFilter', savedState.distanceFilter);
            }
            
            // Replicate the same logic as the UI back button
            if (activeStep === 0) {
              setShowIntro(true);
            } else {
              setActiveStep(prev => prev - 1);
            }
          };
      
          // Push a new state to history stack when component mounts or changes step
          window.history.pushState({ activeStep }, '', window.location.pathname);
      
          // Add event listener for popstate (back button)
          window.addEventListener('popstate', handleBackButton);
      
          // Cleanup
          return () => {
            window.removeEventListener('popstate', handleBackButton);
          };
        }, [activeStep, setActiveStep, setShowIntro]);
      };

useBackButton({ activeStep, setActiveStep, setShowIntro });

const handleNext = async (e) => {
  // Prevent default form submission behavior
  e.preventDefault();
  
  try {
    // Clear any previous errors
    setError(null);
    
    switch (activeStep) {
      case 0: // Photo Upload step
        // Validate photos
        if (!selectedPhotos || selectedPhotos.length === 0) {
          throw new Error('Please select at least one photo');
        }

        // Save selected photos to storage for persistence
        try {
          await savePhotosToStorage(selectedPhotos);
        } catch (storageError) {
          console.warn('Failed to save photos to storage:', storageError);
          // Continue despite storage error
        }
        
        // If studio is already selected (e.g., from URL parameter)
        if (selectedStudio) {
          // We can skip the studio selection step
          setActiveStep(1); // Go directly to checkout step
        } else {
          // Otherwise proceed to studio selection step (StudioSelector component handling)
          setActiveStep(1);
        }
        break;

      case 1: // Order Review & Contact Info step
        // Validate contact information
        if (!formData.email || !formData.phone || !formData.name) {
          throw new Error('Please provide all required contact information');
        }
        
        // Validate studio selection for pickup
        if (deliveryMethod === 'pickup' && !selectedStudio) {
          throw new Error('Please select a pickup location');
        }

        // Set processing state
        setIsLoading(true);
        
        // For regular order (no credit card) or COD
        if (paymentMethod === 'in_store' || paymentMethod === 'cod') {
          // Process order
          await handleOrderSuccess({
            paymentMethod: deliveryMethod === 'pickup' ? 'in_store' : paymentMethod,
            formData,
            selectedCountry,
            selectedPhotos,
            orderNote,
            discountCode,
            selectedStudio
          });
        }
        // For Helcim payments, the payment button handles this case
        
        break;

      default:
        console.warn(`Unknown step: ${activeStep}`);
        break;
    }
  } catch (error) {
    console.error('Error in handleNext:', error);
    setError(error.message || 'An unexpected error occurred');
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

      // Generate unique ID
      const photoId = uuidv4();
      
      // Create both preview URL and base64 in parallel
      const [preview, base64] = await Promise.all([
        // Create object URL for immediate display
        Promise.resolve(URL.createObjectURL(file)),
        // Generate base64 for storage
        convertImageToBase64(file)
      ]);
      
      return {
        id: photoId,
        file: file,
        base64: base64, // Store base64 for persistence
        fileName: file.name,
        fileType: file.type,
        preview: preview, // Use object URL for display
        productType: 'photo_print',
        size: (selectedCountry === 'TUN' || selectedCountry === 'TN') ? '10x15' : '4x6',
        quantity: 1
      };
    }));

    // Add new photos to existing ones
    setSelectedPhotos(prev => [...prev, ...newPhotos]);
    
    // Reset the file input to allow selecting the same files again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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

  const detectCanadianProvince = (studio) => {
    if (!studio) return null;
    
    console.log('Detecting province for studio:', {
      name: studio.name,
      address: studio.address,
      city: studio.city
    });
    
    // First check if province is directly available in the studio object
    if (studio.province) {
      console.log('Province found directly in studio object:', studio.province);
      return studio.province;
    }
    
    // Create search text from address and city
    const searchText = `${studio.address || ''} ${studio.city || ''}`.toLowerCase();
    console.log('Search text for province detection:', searchText);
    
    // First check for exact province names with word boundaries
    // This is important for Quebec which can be confused with other terms
    if (/ quebec\b/i.test(searchText) || / québec\b/i.test(searchText) || /\bqc\b/i.test(searchText)) {
      console.log('Exact match found for Quebec');
      return 'Quebec';
    }
    
    // For other provinces, we need to handle full names and abbreviations
    const provincePatterns = [
      { province: 'Alberta', patterns: [/\balbert(a)?\b/i, /\bab\b/i] },
      { province: 'British Columbia', patterns: [/british\s+columbia/i, /\bbc\b/i, /\bcolombie/i] },
      { province: 'Manitoba', patterns: [/\bmanitoba\b/i, /\bmb\b/i] },
      { province: 'New Brunswick', patterns: [/new\s+brunswick/i, /\bnb\b/i, /nouveau-brunswick/i] },
      { province: 'Newfoundland and Labrador', patterns: [/newfoundland/i, /labrador/i, /\bnl\b/i] },
      { province: 'Northwest Territories', patterns: [/northwest territories/i, /\bnt\b/i] },
      { province: 'Nova Scotia', patterns: [/nova\s+scotia/i, /\bns\b/i] },
      { province: 'Nunavut', patterns: [/\bnunavut\b/i, /\bnu\b/i] },
      { province: 'Ontario', patterns: [/\bontario\b/i, /\bon\b/i] },
      { province: 'Prince Edward Island', patterns: [/prince edward/i, /\bpei\b/i, /\bpe\b/i] },
      { province: 'Quebec', patterns: [/\bquebec\b/i, /\bquébec\b/i, /\bqc\b/i] },
      { province: 'Saskatchewan', patterns: [/\bsaskatchewan\b/i, /\bsk\b/i] },
      { province: 'Yukon', patterns: [/\byukon\b/i, /\byt\b/i] }
    ];
    
    // Test each pattern against the search text
    for (const { province, patterns } of provincePatterns) {
      if (patterns.some(pattern => pattern.test(searchText))) {
        console.log(`Found match for ${province} using pattern check`);
        return province;
      }
    }
    
    // Check postal code patterns as a fallback
    if (studio.postalCode) {
      const postalCode = studio.postalCode.toUpperCase().replace(/\s+/g, '');
      // First letter of postal code can indicate province
      const postalCodeMap = {
        'A': 'Newfoundland and Labrador',
        'B': 'Nova Scotia',
        'C': 'Prince Edward Island',
        'E': 'New Brunswick',
        'G': 'Quebec',
        'H': 'Quebec',
        'J': 'Quebec',
        'K': 'Ontario',
        'L': 'Ontario',
        'M': 'Ontario',
        'N': 'Ontario',
        'P': 'Ontario',
        'R': 'Manitoba',
        'S': 'Saskatchewan',
        'T': 'Alberta',
        'V': 'British Columbia',
        'X': 'Northwest Territories or Nunavut',
        'Y': 'Yukon'
      };
      
      if (postalCode.length > 0 && postalCodeMap[postalCode[0]]) {
        console.log(`Found province from postal code starting with ${postalCode[0]}`);
        return postalCodeMap[postalCode[0]];
      }
    }
    
    // Try to extract province from city string
    // This is a fallback for addresses that don't explicitly state the province
    // but have city names that include the province
    if (studio.city) {
      const cityLower = studio.city.toLowerCase();
      
      // Check for "Montreal, Quebec" pattern
      const cityProvinceMatch = cityLower.match(/^(.+),\s*(.+)$/);
      if (cityProvinceMatch) {
        const potentialProvince = cityProvinceMatch[2].trim();
        
        // Check if this matches any known province names
        for (const { province, patterns } of provincePatterns) {
          if (patterns.some(pattern => pattern.test(potentialProvince))) {
            console.log(`Found province ${province} from city component: ${potentialProvince}`);
            return province;
          }
        }
      }
    }
  
    // Special case for Mount Royal, Quebec
    if (/mount royal/i.test(searchText) || /mont-royal/i.test(searchText)) {
      console.log('Found Mount Royal or Mont-Royal, assuming Quebec');
      return 'Quebec';
    }
    
    console.log('No province detected, returning null');
    return null;
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
    '3.5x4.5': 0,
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
    '3.5x4.5': 0,
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
        } else if ((selectedCountry !== 'TUN' || selectedCountry !== 'TN') && photo.size === '8x10') {
          subtotalsBySize[photo.size] += (photo.quantity || 1) * country.size8x10;
        }
        else if ((selectedCountry !== 'TUN' || selectedCountry !== 'TN') && photo.size === '4x4') {
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
  
  // Calculate shipping fee based on country and delivery method
  let shippingFee = 0;
  const isOrderOverThreshold = subtotal >= 50;
  const isOrderOver999 = subtotal >= 999;

  // Only apply shipping fee if delivery method is 'shipping'
  if (deliveryMethod === 'shipping') {
    if (isOrderOver999 && (['USA', 'US', 'CAN', 'CA', 'TUN', 'TN'].includes(selectedCountry))) {
      shippingFee = 0;
    } else if (!isOrderOverThreshold) {
      if (selectedCountry === 'TUN' || selectedCountry === 'TN') {
        shippingFee = 8;
      } else if (selectedCountry === 'USA' || selectedCountry === 'US') {
        shippingFee = 15;
      } else if (selectedCountry === 'CAN' || selectedCountry === 'CA') {
        shippingFee = 15;
      } else if (selectedCountry === 'GBR' || selectedCountry === 'GB') {
        shippingFee = 20;
      } else if (['DEU', 'FRA', 'ITA', 'ESP', 'DE', 'FR', 'IT', 'ES'].includes(selectedCountry)) {
        shippingFee = 20;
      }
    }
  }

  // Combine subtotal and shipping before calculating discount
  const preDiscountTotal = subtotal + shippingFee;
  
  // Calculate discount if applicable (now applies to subtotal + shipping)
  const discount = discountCode ? preDiscountTotal * calculateDiscountValue(discountCode) : 0;

  // Calculate taxable amount AFTER discount is applied
  const taxableAmount = preDiscountTotal - discount;
  
  // Calculate tax
  let taxAmount = 0;
  let appliedProvince = null;
  let appliedTaxRates = null;

  // Apply tax calculation for Tunisia
  if (selectedCountry === 'TUN' || selectedCountry === 'TN') {
    taxAmount = taxableAmount * 0.19; // 19% TVA for Tunisia
  } 
  // Enhanced tax calculation for Canada - both for pickup and shipping
  else if (selectedCountry === 'CAN' || selectedCountry === 'CA') {
    // Get province based on delivery method
    let province;
    
    if (deliveryMethod === 'pickup') {
      // For pickup, detect province from studio information
      province = detectCanadianProvince(selectedStudio);
      
      // Log detected province for debugging
      console.log('Detected province from studio:', {
        studio: selectedStudio?.name,
        address: selectedStudio?.address,
        detectedProvince: province
      });
    } else {
      // If shipping, get province from shipping address
      province = formData.shippingAddress.province;
    }
    
    // Apply taxes if we have a valid province
    if (province && TAX_RATES['CA'][province]) {
      appliedProvince = province;
      appliedTaxRates = TAX_RATES['CA'][province];
      
      if (appliedTaxRates.HST) {
        // Apply Harmonized Sales Tax (HST)
        taxAmount = taxableAmount * (appliedTaxRates.HST / 100);
      } else {
        // Apply GST and PST/QST separately
        if (appliedTaxRates.GST) {
          taxAmount += taxableAmount * (appliedTaxRates.GST / 100);
        }
        
        if (appliedTaxRates.PST) {
          taxAmount += taxableAmount * (appliedTaxRates.PST / 100);
        }
        
        if (appliedTaxRates.QST) {
          taxAmount += taxableAmount * (appliedTaxRates.QST / 100);
        }
      }
    } else {
      // Default to GST only if province is unknown
      taxAmount = taxableAmount * 0.05; // 5% GST
    }
  }
  // Apply taxes for other countries with tax rates
  else if (TAX_RATES[selectedCountry] && TAX_RATES[selectedCountry].default) {
    taxAmount = taxableAmount * (TAX_RATES[selectedCountry].default / 100);
  }

  // Calculate total with the correct order: subtotal + shipping - discount + tax
  const total = taxableAmount + taxAmount;

  return {
    subtotalsBySize,
    subtotal,
    taxAmount,
    shippingFee,
    total,
    quantities,
    discount,
    preDiscountTotal,
    appliedProvince,
    appliedTaxRates
  };
};

//..
const renderStepContent = () => {
  const currency_curr = selectedCountry ? selectedCountry.currency : 'USD'; // USD as fallback
  const { total } = calculateTotals();
  
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
                        ) : selectedCountry !== 'TUN' || selectedCountry !== 'TN' ? (
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
      
            {/* Delivery Method Selection */}
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-3">{t('order.delivery_method')}</h3>
              <div className="space-y-3">
                <label className="flex items-center space-x-3 p-2 border rounded hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    name="deliveryMethod"
                    value="pickup"
                    checked={deliveryMethod === 'pickup'}
                    onChange={() => setDeliveryMethod('pickup')}
                    className="h-4 w-4 text-yellow-400 focus:ring-yellow-500"
                  />
                  <div>
                    <p className="font-medium">{t('order.studio_pickup')}</p>
                    <p className="text-sm text-gray-600">{t('order.pickup_description')}</p>
                  </div>
                </label>
                
                <label className="flex items-center space-x-3 p-2 border rounded hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    name="deliveryMethod"
                    value="shipping"
                    checked={deliveryMethod === 'shipping'}
                    onChange={() => setDeliveryMethod('shipping')}
                    className="h-4 w-4 text-yellow-400 focus:ring-yellow-500"
                  />
                  <div>
                    <p className="font-medium">{t('order.shipping_to_address')}</p>
                    <p className="text-sm text-gray-600">{t('order.shipping_description')}</p>
                  </div>
                </label>
              </div>
            </div>
      
            {/* Conditional rendering based on delivery method */}
            {deliveryMethod === 'pickup' ? (
              // Studio Pickup Section
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-3">{t('pickup.details')}</h3>
                
                {selectedStudio ? (
                  // Show selected studio details when already selected
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start mb-4">
              <h4 className="font-semibold text-lg">{selectedStudio.name}</h4>
      
      {/* Add distance display if available - highlighted in green similar to screenshot */}
      {selectedStudio.distance !== undefined && (
        <div className="bg-green-100 text-green-600 font-medium py-1 px-3 rounded-full text-sm flex items-center">
          <Navigation size={14} className="mr-1" />
          {selectedStudio.distance.toFixed(1)} km
        </div>
      )}
    </div>
    
    <div className="space-y-2 text-sm text-gray-600">
      <div className="flex items-center gap-2">
        <MapPin size={16} />
        <span>{selectedStudio.address}</span>
      </div>
      
      <div className="flex items-center gap-2">
        <Phone size={16} />
        <span dir="ltr">{selectedStudio.phone}</span>
      </div>
      <div className="flex items-center gap-2">
        <Mail size={16} />
        <span>{selectedStudio.email}</span>
      </div>
                      
                      <div className="border-t pt-2 mt-2">
                        <div className="flex items-center gap-2 mb-1">
                          <Clock size={16} />
                          <span className="font-medium">{t('pickup.hours')}:</span>
                        </div>
                        <div className="grid grid-cols-1 gap-1">
                          {selectedStudio.operatingHours
                            ?.sort((a, b) => a.day - b.day)
                            .map(hours => (
                            <div key={hours.day} className="flex justify-between text-xs">
                              <span>{getDayName(hours.day)}</span>
                              <span dir="ltr">
                                {hours.isClosed ? t('pickup.closed') : `${hours.openTime} - ${hours.closeTime}`}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Payment Method for Pickup - NEW ADDITION */}
                      {(selectedCountry !== 'TUN' && selectedCountry !== 'TN') && (
                        <div className="mt-4 border-t pt-4">
                          <h3 className="font-medium mb-3">{t('order.payment_method')}</h3>
                          <div className="space-y-3">
                           
                            
                            <label className="flex items-center space-x-3 p-2 border rounded hover:bg-gray-50 cursor-pointer">
                              <input
                                type="radio"
                                name="pickupPaymentMethod"
                                value="helcim"
                                checked={paymentMethod === 'helcim'}
                                onChange={() => setPaymentMethod('helcim')}
                                className="h-4 w-4 text-yellow-400 focus:ring-yellow-500"
                              />
                              <div>
                                <p className="font-medium">{t('payment.credit_card')}</p>
                                <p className="text-sm text-gray-600">{t('payment.credit_pickup_description')}</p>
                              </div>
                            </label>
                          </div>
                        </div>
                      )}
                      
                     
                    </div>
                  </div>
                ) : (
                  // Show studio selector when no studio is selected
                  <StudioSelector 
                    onStudioSelect={handleStudioSelect}
                    selectedStudio={selectedStudio}
                    selectedCountry={selectedCountry}
                  />
                )}
              </div>
            ) : (
              // Shipping Address Section
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-3">{t('form.shipping_a')}</h3>
                <AddressForm
                  type="shipping"
                  data={formData.shippingAddress}
                  onChange={(newAddress) => setFormData({
                    ...formData,
                    shippingAddress: newAddress
                  })}
                />
                
                {/* Billing Address Toggle */}
                <div className="mt-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isBillingAddressSameAsShipping}
                      onChange={() => setIsBillingAddressSameAsShipping(!isBillingAddressSameAsShipping)}
                      className="h-4 w-4 text-yellow-400 focus:ring-yellow-500"
                    />
                    <span className="text-sm">{t('form.billing_same')}</span>
                  </label>
                </div>
                
                {/* Show Billing Address if different from shipping */}
                {!isBillingAddressSameAsShipping && (
                  <div className="mt-4">
                    <h3 className="font-medium mb-3">{t('form.billing_a')}</h3>
                    <AddressForm
                      type="billing"
                      data={formData.billingAddress}
                      onChange={(newAddress) => setFormData({
                        ...formData,
                        billingAddress: newAddress
                      })}
                    />
                  </div>
                )}
                
                {/* Payment Method for Shipping */}
                <div className="mt-6">
                  <h3 className="font-medium mb-3">{t('order.payment_method')}</h3>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3 p-2 border rounded hover:bg-gray-50 cursor-pointer">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="helcim"
                        checked={paymentMethod === 'helcim'}
                        onChange={() => setPaymentMethod('helcim')}
                        className="h-4 w-4 text-yellow-400 focus:ring-yellow-500"
                      />
                      <div>
                        <p className="font-medium">{t('payment.credit_card')}</p>
                        <p className="text-sm text-gray-600">{t('payment.credit_description')}</p>
                      </div>
                    </label>
                    
                    {/* Only show COD option for Tunisia */}
                    {(selectedCountry === 'TUN' || selectedCountry === 'TN') && (
                      <label className="flex items-center space-x-3 p-2 border rounded hover:bg-gray-50 cursor-pointer">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="cod"
                          checked={paymentMethod === 'cod'}
                          onChange={() => setPaymentMethod('cod')}
                          className="h-4 w-4 text-yellow-400 focus:ring-yellow-500"
                        />
                        <div>
                          <p className="font-medium">{t('payment.cash_on_delivery')}</p>
                          <p className="text-sm text-gray-600">{t('payment.cod_description')}</p>
                        </div>
                      </label>
                    )}
                  </div>
                </div>
              </div>
            )}
      
            {/* Order Items Summary */}
            {renderInvoice()}
      
            {/* Order Note */}
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-3">{t('produits.note')}</h3>
              <textarea
                value={orderNote}
                onChange={(e) => setOrderNote(e.target.value)}
                className="w-full p-2 border rounded"
                rows={3}
              />
            </div>
      
            {/* Show Helcim Pay Button for credit card payments (for both shipping and pickup) */}
           
          </div>
        );
      
      default:
        return null;
  }
};



const renderInvoice = () => {
  const { 
    subtotalsBySize, 
    subtotal, 
    shippingFee, 
    total, 
    quantities, 
    discount, 
    taxAmount, 
    preDiscountTotal,
    appliedProvince, 
    appliedTaxRates 
  } = calculateTotals();
  
  const country = initialCountries.find(c => c.value === selectedCountry);
  
  return (
    <div className="space-y-6">
      {/* Discount Code Section - Moved to top before summary as requested */}
      <div className="border rounded-lg p-4">
        <h3 className="font-medium mb-3">{t('order.discount')}</h3>
        <div className="space-y-2">
          <input
            type="text"
            placeholder="xxxx"
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
            {(selectedCountry !== 'TN' || selectedCountry !== 'TUN') && quantities['8x10'] > 0 && (
              <div className="flex justify-between py-2">
                <span>8x10" Photos ({quantities['8x10']} × {country?.size8x10.toFixed(2)} {country?.currency})</span>
                <span>{subtotalsBySize['8x10'].toFixed(2)} {country?.currency}</span>
              </div>
            )}
            {(selectedCountry !== 'TN' || selectedCountry !== 'TUN')  && quantities['4x4'] > 0 && (
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

        {/* Subtotal */}
        <div className="flex justify-between py-2 border-t">
          <span>{t('produits.subtotal')}</span>
          <span>{subtotal.toFixed(2)} {country?.currency}</span>
        </div>

        {/* Shipping Fee */}
        <div className="flex justify-between py-2">
          <span>{deliveryMethod === 'pickup' ? t('order.pickup_fee') : t('order.shipping_fee')}</span>
          <span>{shippingFee.toFixed(2)} {country?.currency}</span>
        </div>
        
        {/* Discount - Now positioned AFTER subtotal and shipping */}
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

        {/* Tax for applicable regions - Now calculated based on (subtotal + shipping - discount) */}
        {/* Tunisia tax */}
        {(selectedCountry === 'TUN' || selectedCountry === 'TN') && (
          <div className="flex justify-between py-2">
            <span>TVA (19%)</span>
            <span>{taxAmount.toFixed(2)} {country?.currency}</span>
          </div>
        )}

        {/* Enhanced Canada tax - using our improved detection */}
        {(selectedCountry === 'CAN' || selectedCountry === 'CA') && (
          <div className="flex justify-between py-2">
            <div className="flex flex-col">
              <span>Tax{appliedProvince ? ` (${appliedProvince})` : ''}</span>
              <span className="text-sm text-gray-600">
                {(() => {
                  if (appliedTaxRates) {
                    if (appliedTaxRates.HST) {
                      return `HST (${appliedTaxRates.HST}%)`;
                    }
                    return [
                      appliedTaxRates.GST && `GST (${appliedTaxRates.GST}%)`,
                      appliedTaxRates.PST && `PST (${appliedTaxRates.PST}%)`,
                      appliedTaxRates.QST && `QST (${appliedTaxRates.QST}%)`
                    ].filter(Boolean).join(' + ');
                  } else if (deliveryMethod === 'pickup') {
                    // For pickup without detected province
                    return 'GST (5%)';
                  } else {
                    // For shipping without selected province
                    const province = formData.shippingAddress.province;
                    
                    if (province && TAX_RATES['CA'][province]) {
                      const provinceTaxes = TAX_RATES['CA'][province];
                      
                      if (provinceTaxes.HST) {
                        return `HST (${provinceTaxes.HST}%)`;
                      }
                      return [
                        provinceTaxes.GST && `GST (${provinceTaxes.GST}%)`,
                        provinceTaxes.PST && `PST (${provinceTaxes.PST}%)`,
                        provinceTaxes.QST && `QST (${provinceTaxes.QST}%)`
                      ].filter(Boolean).join(' + ');
                    }
                    return 'GST (5%)';
                  }
                })()}
              </span>
            </div>
            <span>{taxAmount.toFixed(2)} {country?.currency}</span>
          </div>
        )}

        {/* Display tax for other countries with tax rates */}
        {selectedCountry !== 'TUN' && selectedCountry !== 'TN' && 
         selectedCountry !== 'CAN' && selectedCountry !== 'CA' && 
         TAX_RATES[selectedCountry] && TAX_RATES[selectedCountry].default > 0 && (
          <div className="flex justify-between py-2">
            <span>{`Tax (${TAX_RATES[selectedCountry].default}%)`}</span>
            <span>{taxAmount.toFixed(2)} {country?.currency}</span>
          </div>
        )}

        {/* Final Total */}
        <div className="flex justify-between py-2 border-t font-bold">
          <span>{t('produits.total')}</span>
          <span>{total.toFixed(2)} {country?.currency}</span>
        </div>
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
    case 0: // Photo Upload step
      return selectedPhotos.length > 0;
      
    case 1: // Delivery & Review step
      // Basic validation for all orders
      if (!formData.email || !formData.phone || !formData.name) {
        return false;
      }
      
      // Validation specific to delivery method
      if (deliveryMethod === 'pickup') {
        // For pickup, we need a selected studio
        return selectedStudio !== null;
      } else if (deliveryMethod === 'shipping') {
        // Validate shipping address
        const addr = formData.shippingAddress;
        const isShippingValid = addr.firstName && 
                               addr.lastName && 
                               addr.address && 
                               addr.city && 
                               addr.postalCode;
        
        // Validate province/state for US/Canada
        if (selectedCountry === 'US' || selectedCountry === 'USA') {
          return isShippingValid && addr.state;
        } else if (selectedCountry === 'CA' || selectedCountry === 'CAN') {
          return isShippingValid && addr.province;
        }
        
        return isShippingValid;
      }
      return false;

    default:
      return false;
  }
};

const { t } = useTranslation();

const handleStepClick = (stepIndex) => {
  // Allow navigation to this step
  setActiveStep(stepIndex);
};

return (
  <div className="min-h-screen bg-gray-50 pb-24">
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg p-6">
                {/* New Header Organization */}
        <div className="mb-6">
          {/* First Row: Studio Location Header at top left */}
  <div className="mb-4 flex">
    <div className="w-auto">
      <StudioLocationHeader 
        selectedStudio={selectedStudio}
        onStudioSelect={handleStudioSelect}
        selectedCountry={selectedCountry}
      />
    </div>
  </div>
  
  {/* Second Row: Logo */}
  <div className="flex justify-center mb-4">
    <div className="text-2xl font-bold">
      <span className="text-black">freeze</span>
      <span className="text-yellow-400">PIX</span>
    </div>
  </div>
</div>

        {/* Stepper - Only 2 steps now */}
        <div className="flex items-center justify-center mb-8">
        <div className="flex items-center">
          <div 
            className={`
              w-8 h-8 rounded-full flex items-center justify-center 
              cursor-pointer hover:bg-yellow-500 transition-colors
              ${activeStep >= 0 ? 'bg-yellow-400' : 'bg-gray-200'}
            `}
            onClick={() => handleStepClick(0)}
          >
            <Camera 
              className={`
                ${activeStep >= 0 ? 'text-black' : 'text-gray-500'}
              `} 
              size={24} 
            />
          </div>
          <div className={`h-1 w-24 ${activeStep >= 1 ? 'bg-yellow-400' : 'bg-gray-200'}`} />
          <div 
            className={`
              w-8 h-8 rounded-full flex items-center justify-center 
              cursor-pointer hover:bg-yellow-500 transition-colors
              ${activeStep >= 1 ? 'bg-yellow-400' : 'bg-gray-200'}
            `}
            onClick={() => handleStepClick(1)}
          >
            <ShoppingCart 
              className={`
                ${activeStep >= 1 ? 'text-black' : 'text-gray-500'}
              `} 
              size={24} 
            />
          </div>
        </div>
      </div>
      
      {/* Render the current step's content */}


        {/* Error message if any */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Step Content */}
        {orderSuccess ? (
          // Order Success UI
          <div className="text-center space-y-6">
            <div className="text-green-500 text-5xl">✓</div>
            <h2 className="text-2xl font-bold">{t('order.success_message')}</h2>
            <p className="text-gray-600">
              {t('order.success_details')} {formData.email}
            </p>
            <div className="mt-4">
              <p className="font-medium">{t('order.details')}:</p>
              <p>{t('order.order_number')}: {currentOrderNumber}</p>
              
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="font-medium">{t('pickup.location')}:</p>
                {selectedStudio && (
                  <>
                    <p>{selectedStudio.name}</p>
                    <p>{selectedStudio.address}</p>
                    <p>{selectedStudio.city}, {selectedStudio.country}</p>
                  </>
                )}
              </div>
            </div>
            
            <button
              onClick={() => {
                setOrderSuccess(false);
                setError(null);
                setCurrentOrderNumber(null);
                setOrderNote('');
                setSelectedPhotos([]);
                setActiveStep(0);
                setFormData({
                  email: '',
                  phone: '',
                  name: '',
                  shippingAddress: { country: selectedCountry },
                  billingAddress: { country: selectedCountry }
                });
              }}
              className="px-6 py-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500"
            >
              {t('buttons.place_new')}
            </button>
          </div>
        ) : (
          // Render current step
          renderStepContent()
        )}

        {/* Navigation Buttons */}
        {!orderSuccess && renderNavigationButtons()}
              </div>
    </div>
    
  {/* Fixed bottom bar for country and language selection */}
<div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg z-50">
  <div className="max-w-4xl mx-auto px-4 py-2">
    <div className="grid grid-cols-2 gap-2 sm:gap-4">
      <div className="w-full">
        <select 
          className="w-full px-2 py-1 text-sm border rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-yellow-400"
          value={selectedCountry}
          onChange={(e) => setSelectedCountry(e.target.value)}
        >
          <option value="">{t('navigation.select')}</option>
          {initialCountries.map(country => (
            <option key={country.value} value={country.value} className="text-sm">
              {country.name} ({country.currency})
            </option>
          ))}
        </select>
      </div>
      
      {/* Modify LanguageSelector to match */}
      <LanguageSelector 
        className="text-sm" 
        iconClassName="w-4 h-4" 
      />
    </div>
  </div>
</div>
  </div>
);
};

export default FreezePIX;