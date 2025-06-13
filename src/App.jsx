import React from 'react';
import { memo, useState, useRef, useCallback, useEffect } from 'react';
import { Upload, ShoppingCart, Package, Camera, X , Loader, MapPin, Clock, Phone, Mail,aperture,AlertCircle, Navigation, Check, ChevronDown, ChevronUp,Calendar ,ChevronLeft , Store, Truck, Printer   } from 'lucide-react';
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
import phototunisia from './assets/phototunisia.jpeg';
import imageCompression from 'browser-image-compression';
import { processImagesInBatches } from './imageProcessingUtils';
import {clearStateStorage} from './stateManagementUtils';
import {ShareUrl} from './StudioUrlShare';
import StudioLocationHeader from './components/studiolocationheader';
import GiftCardInput from './components/giftcard';
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
import DiscountLinkGenerator from './DiscountLinkGenerator';
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
    keyring_magnet: 29.99,
    freeShippingThreshold: 50,
    shippingFee: 15 },
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
    keyring_magnet: 29.99,
    freeShippingThreshold: 50,
    shippingFee: 15  },
  { name: 'Tunisia', 
    value: 'TN', 
    currency: 'TND', 
    rate: 1, 
    size10x15: 3.00, 
    size15x22: 5.00,
    size35x45: 1.25, 
    keychain: 15.00, 
    keyring_magnet: 15.00,
    freeShippingThreshold: 25,
    shippingFee: 8 },
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
    default: 0.0 // 19% TVA
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
        placeholder={(data.country === 'USA' || data.country === 'US') 
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
  
  // Function to generate studio slug - Pickup your photo prints from nearest Studio
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

// Add these helper functions before the FreezePIX component
const getTunisiaPricing = (size, quantity) => {
  const pricingTable = {
    '10x15': {
      '1-4': 3.00,
      '5-24': 2.40,
      '25-49': 2.00,
      '50-74': 1.50,
      '75+': 1.25
    },
    '15x22': { // 15x23 cm in display
      '1-4': 5.00,
      '5-24': 4.00,
      '25-49': 3.50,
      '50-74': 2.50,
      '75+': 2.00
    }
  };

  const pricing = pricingTable[size];
  if (!pricing) return 0;

  if (quantity <= 4) return pricing['1-4'];
  if (quantity <= 24) return pricing['5-24'];
  if (quantity <= 49) return pricing['25-49'];
  if (quantity <= 74) return pricing['50-74'];
  return pricing['75+'];
};

// Helper function to get pricing tier name for display
const getTunisiaPricingTier = (quantity) => {
  if (quantity <= 4) return '1-4';
  if (quantity <= 24) return '5-24';
  if (quantity <= 49) return '25-49';
  if (quantity <= 74) return '50-74';
  return '75+';
};



  // FreezePIX Printing APP - Order Photo Prints Online from anywhere in Canada And United States
const FreezePIX = () => {
 

    const [showIntro, setShowIntro] = useState(false);
    const [selectedCountry, setSelectedCountry] = useState('');
    const [selectedPhotos, setSelectedPhotos] = useState([]); // Correct
    const [activeStep, setActiveStep] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState('cod'); // Default payment method
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
    const [activePaymentTab, setActivePaymentTab] = useState('discount');

const [appliedGiftCard, setAppliedGiftCard] = useState(null);
const [giftCardError, setGiftCardError] = useState('');
const [isGiftCardLoading, setIsGiftCardLoading] = useState(false);

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
      const [hasLoadedCache, setHasLoadedCache] = useState(false);
      const [initialLoadComplete, setInitialLoadComplete] = useState(false);
      const [isScrolled, setIsScrolled] = useState(false);

      const saveStateTimeoutRef = useRef(null);
      const detectUserLocation = async () => {
        try {
          // First try browser geolocation for the most accurate results
          if (navigator.geolocation) {
            try {
              console.log('Requesting geolocation from browser...');
              const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(
                  resolve, 
                  reject, 
                  { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
                );
              });
              
              console.log('Geolocation successful:', position.coords);
              
              // Find nearest country from coordinates
              const nearestCountry = findNearestCountry(
                position.coords.latitude, 
                position.coords.longitude
              );
              
              console.log('Nearest country determined from coordinates:', nearestCountry);
              
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
          
          // Fallback to server-side detection
          console.log('Falling back to IP-based location detection');
          const response = await fetch('https://freezepix-database-server-c95d4dd2046d.herokuapp.com/api/geo-location', {
            method: 'GET',
            headers: { 'Accept': 'application/json' },
            credentials: 'include'
          });
      
          if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
          }
      
          const data = await response.json();
          console.log('IP-based location data:', data);
          
          // Make sure we map the country code correctly
          const countryCode = data.country_code;
          return {
            country: countryCode,
            language: data.languages?.split(',')[0] || 'en',
            method: 'ip'
          };
        } catch (error) {
          console.warn('All location detection methods failed:', error);
          // Default fallback
          return {
            country: 'US',
            language: navigator.language?.split('-')[0] || 'en',
            method: 'fallback'
          };
        }
      };
      
      // shipping coutries for freezepix printing app
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

      const captureSourceUrl = () => {
        // Get the full source URL where user came from
        const sourceUrl = document.referrer || window.location.href;
        
        // Store it for the session (not localStorage to avoid persistence)
        if (!sessionStorage.getItem('sourceVisitUrl')) {
          sessionStorage.setItem('sourceVisitUrl', sourceUrl);
        }
        
        return sessionStorage.getItem('sourceVisitUrl');
      };
      
      // Call this when component mounts
      useEffect(() => {
        captureSourceUrl();
      }, []);

// Add this useEffect for scroll detection
useEffect(() => {
  const handleScroll = () => {
    setIsScrolled(window.scrollY > 100);
  };
  window.addEventListener('scroll', handleScroll);
  return () => window.removeEventListener('scroll', handleScroll);
}, []);

    // REPLACEMENT 1: Photo price updates (only when needed)
useEffect(() => {
  if (!selectedCountry || !selectedPhotos.length) return;
  
  const country = initialCountries.find(c => c.value === selectedCountry);
  if (!country) return;
  
  setSelectedPhotos(prevPhotos => {
    const updatedPhotos = prevPhotos.map(photo => {
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
          default: newPrice = country.size4x6;
        }
      } else if (photo.productType === '3d_frame') {
        newPrice = country.crystal3d;
      } else if (photo.productType === 'keychain') {
        newPrice = country.keychain;
      } else if (photo.productType === 'keyring_magnet') {
        newPrice = country.keyring_magnet;
      }
      
      // Only update if price actually changed
      if (photo.price !== newPrice) {
        return { ...photo, price: newPrice, quantity: photo.quantity || 1 };
      }
      return photo;
    });
    
    // Only update state if something actually changed
    const hasChanges = updatedPhotos.some((photo, index) => 
      photo.price !== prevPhotos[index]?.price
    );
    
    return hasChanges ? updatedPhotos : prevPhotos;
  });
}, [selectedCountry, selectedPhotos.length]); // More specific dependency

// REPLACEMENT 2: Form data updates (separate from photos)
useEffect(() => {
  if (!selectedCountry) return;
  
  setFormData(prev => {
    // Check if update is actually needed
    if (prev.shippingAddress.country === selectedCountry && 
        prev.billingAddress.country === selectedCountry) {
      return prev;
    }
    
    return {
      ...prev,
      shippingAddress: {
        ...prev.shippingAddress,
        country: selectedCountry,
        state: prev.shippingAddress.country === selectedCountry ? prev.shippingAddress.state : '',
        province: prev.shippingAddress.country === selectedCountry ? prev.shippingAddress.province : ''
      },
      billingAddress: {
        ...prev.billingAddress,
        country: selectedCountry,
        state: prev.billingAddress.country === selectedCountry ? prev.billingAddress.state : '',
        province: prev.billingAddress.country === selectedCountry ? prev.billingAddress.province : ''
      },
      paymentMethod: (selectedCountry === 'TUN' || selectedCountry === 'TN') ? 'cod' : 'helcim'
    };
  });
}, [selectedCountry]);

// REPLACEMENT 3: Load cached photos (only once)
useEffect(() => {
  const loadAndFixCachedPhotos = async () => {
    if (hasLoadedCache || !selectedCountry) return;
    
    try {
      const uploadedPhotos = localStorage.getItem('uploadedPhotos');
      const savedState = localStorage.getItem('freezepixState');
      
      if (uploadedPhotos) {
        const parsedPhotos = JSON.parse(uploadedPhotos);
        if (Array.isArray(parsedPhotos) && parsedPhotos.length > 0) {
          const restoredPhotos = parsedPhotos.map(photo => {
            if (!photo.base64 || !photo.base64.startsWith('data:image/')) {
              return null;
            }
            
            let fileObj = null;
            try {
              if (photo.fileName && photo.base64) {
                fileObj = base64ToFile(photo.base64, photo.fileName);
              }
            } catch (e) {
              console.warn('Could not convert base64 to file:', e);
            }
            
            let fixedPhoto = {
              ...photo,
              file: fileObj,
              preview: photo.base64
            };
            
            // Fix prices for current country
            const country = initialCountries.find(c => c.value === selectedCountry);
            if (country) {
              let newPrice = 0;
              if (selectedCountry === 'TN' || selectedCountry === 'TUN') {
                switch (fixedPhoto.size) {
                  case '10x15': newPrice = country.size10x15 || 3.00; break;
                  case '15x22': newPrice = country.size15x22 || 5.00; break;
                  case '3.5x4.5': newPrice = country.size35x45 || 1.25; break;
                  default: 
                    newPrice = country.size10x15 || 3.00;
                    fixedPhoto.size = '10x15';
                }
              } else {
                switch (fixedPhoto.size) {
                  case '4x6': newPrice = country.size4x6; break;
                  case '5x7': newPrice = country.size5x7; break;
                  case '8x10': newPrice = country.size8x10; break;
                  case '4x4': newPrice = country.size4x4; break;
                  default: newPrice = country.size4x6;
                }
              }
              fixedPhoto.price = newPrice;
              fixedPhoto.productType = fixedPhoto.productType || 'photo_print';
              fixedPhoto.quantity = fixedPhoto.quantity || 1;
            }
            
            return fixedPhoto;
          }).filter(Boolean);
          
          if (restoredPhotos.length > 0) {
            setSelectedPhotos(restoredPhotos);
          }
        }
      }
      
      setHasLoadedCache(true);
    } catch (error) {
      console.error('Error loading cached photos:', error);
      setHasLoadedCache(true);
    }
  };

  loadAndFixCachedPhotos();
}, [selectedCountry, hasLoadedCache]);

// REPLACEMENT 4: Initial country detection (only once)
useEffect(() => {
  const setInitialCountryAndLanguage = async () => {
    if (initialLoadComplete || selectedCountry || isLoading) return;
    
    try {
      setIsLoading(true);
      setInitialLoadComplete(true);
      
      const locationData = await detectUserLocation();
      
      if (locationData?.country) {
        const mappedCountry = mapCountryCode(locationData.country);
        
        if (initialCountries.some(c => c.value === mappedCountry)) {
          setSelectedCountry(mappedCountry);
        } else {
          setSelectedCountry('US');
        }
      } else {
        setSelectedCountry('US');
      }
    } catch (error) {
      console.error('Error in country/language setup:', error);
      setSelectedCountry('US');
    } finally {
      setIsLoading(false);
    }
  };

  setInitialCountryAndLanguage();
}, [initialLoadComplete, selectedCountry, isLoading]);

// REPLACEMENT 5: Debounced save state (prevents excessive saves)
useEffect(() => {
  if (saveStateTimeoutRef.current) {
    clearTimeout(saveStateTimeoutRef.current);
  }
  
  saveStateTimeoutRef.current = setTimeout(async () => {
    try {
      const photosWithBase64 = await Promise.all(
        selectedPhotos.map(async (photo) => {
          if (photo.file && !photo.base64) {
            const base64 = await convertImageToBase64(photo.file);
            return { ...photo, base64, fileName: photo.file.name, fileType: photo.file.type };
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
  }, 1000); // 1 second debounce

  return () => {
    if (saveStateTimeoutRef.current) {
      clearTimeout(saveStateTimeoutRef.current);
    }
  };
}, [showIntro, selectedCountry, selectedPhotos, activeStep, formData]);

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
      const [hasAutoSetLanguage, setHasAutoSetLanguage] = useState(false);

useEffect(() => {
  // Auto-change to French when Tunisia is FIRST selected (respects manual changes)
  if ((selectedCountry === 'TN' || selectedCountry === 'TUN') && !hasAutoSetLanguage) {
    changeLanguage('fr');
    setHasAutoSetLanguage(true);
  }
  // Reset flag when leaving Tunisia
  else if (selectedCountry !== 'TN' && selectedCountry !== 'TUN') {
    setHasAutoSetLanguage(false);
  }
}, [selectedCountry, hasAutoSetLanguage]); 

      useEffect(() => {
        const handleUrlDiscount = () => {
          const urlParams = new URLSearchParams(window.location.search);
          const urlDiscountCode = urlParams.get('discount');
          
          if (urlDiscountCode) {
            console.log('Found discount code in URL:', urlDiscountCode);
            
            // Set the discount code immediately
            setDiscountCode(urlDiscountCode.toUpperCase());
            
            // Apply the discount code - don't wait for country
            handleDiscountCode(urlDiscountCode.toUpperCase());
            
            // Mark that this was applied from URL
            localStorage.setItem('discountAppliedFromUrl', 'true');
            localStorage.setItem('urlDiscountCode', urlDiscountCode.toUpperCase());
            
            // Optional: Clean the URL after applying discount
            const newUrl = window.location.pathname + (window.location.pathname.includes('/') ? '' : '/');
            window.history.replaceState({}, document.title, newUrl);
          }
        };
      
        // Run immediately when component mounts, don't wait for selectedCountry
        handleUrlDiscount();
      }, []); // Remove selectedCountry dependency

      useEffect(() => {
        if (discountCode && availableDiscounts.length > 0) {
          const { discount } = calculateTotals();
          if (discount > 0) {
            // Discount is working, clear any error
            setDiscountError('');
          }
        }
      }, [discountCode, availableDiscounts, selectedPhotos, selectedCountry]);
      
      // 2. Add this function to handle sharing with discount
      const generateDiscountShareUrl = (code, studio = null) => {
        const baseUrl = window.location.origin;
        const params = new URLSearchParams();
        params.set('discount', code);
        
        if (studio) {
          const studioSlug = studio.slug || generateStudioSlug(studio.name);
          return `${baseUrl}/${studioSlug}?${params.toString()}`;
        } else {
          return `${baseUrl}?${params.toString()}`;
        }
      };

   // In your fetchShopifyPriceRules function
const fetchShopifyPriceRules = async () => {
  console.log('Fetching price rules...');
  try {
    const response = await axios.get('https://freezepix-database-server-c95d4dd2046d.herokuapp.com/api/price-rules');
    console.log('Price rules response:', response);
    
    if (response.data.price_rules && response.data.price_rules.length > 0) {
      console.log('Found price rules:', response.data.price_rules.length);
      console.log('First rule example:', response.data.price_rules[0]);
      return response.data.price_rules;
    } else {
      console.log('No price rules found.');
      return [];
    }
  } catch (error) {
    console.error('Error fetching price rules:', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    return [];
  }
};

const handleGiftCardApplied = (giftCard, errorMsg = '') => {
  setAppliedGiftCard(giftCard);
  setGiftCardError(errorMsg); // Set the error message from the API
};

const handleGiftCardRemoved = () => {
  setAppliedGiftCard(null);
  setGiftCardError('');
};

//  useEffect that fetches discount codes
useEffect(() => {
  const fetchDiscountCodes = async () => {
    setIsLoading(true);
    try {
      // Fetch price rules from Shopify API instead of database
      const priceRules = await fetchShopifyPriceRules();
      
      // Transform price rules into the format your application expects
      const activeDiscounts = priceRules.map(rule => ({
        code: rule.title,
        isActive: rule.status === 'active',
        valueType: rule.value_type === 'percentage' ? 'percentage' : 'fixed_amount',
        value: Math.abs(parseFloat(rule.value)),
        startDate: rule.starts_at,
        endDate: rule.ends_at
      })).filter(discount => {
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
    // Calculate the correct price if it's missing or incorrect
    if (!photo.price || photo.price === 0) {
      let price = 0;
      if (photo.productType === 'photo_print') {
        // Special handling for Tunisia
        if (countryCode === 'TN' || countryCode === 'TUN') {
          switch (photo.size) {
            case '10x15': price = country.size10x15 || 3.00; break;
            case '15x22': price = country.size15x22 || 5.00; break;
            case '3.5x4.5': price = country.size35x45 || 1.25; break;
            default: 
              price = country.size10x15 || 3.00; // Default to 10x15 for Tunisia
              photo.size = '10x15'; // Fix the size if it's wrong
          }
        } else {
          // Handle other countries
          switch (photo.size) {
            case '4x6': price = country.size4x6; break;
            case '5x7': price = country.size5x7; break;
            case '8x10': price = country.size8x10; break;
            case '4x4': price = country.size4x4; break;
            default: price = country.size4x6; // Default to 4x6 price
          }
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
      
      const getDayName = (day, t = null) => {
        // Fallback day names in English
        const fallbackDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        
        // If no translation function provided, return English fallback
        if (!t || typeof t !== 'function') {
          return fallbackDays[day] || 'Unknown';
        }
        
        // Translation keys for each day
        const dayKeys = [
          'days.sunday',    // 0
          'days.monday',    // 1  
          'days.tuesday',   // 2
          'days.wednesday', // 3
          'days.thursday',  // 4
          'days.friday',    // 5
          'days.saturday'   // 6
        ];
        
        try {
          return t(dayKeys[day], { defaultValue: fallbackDays[day] });
        } catch (error) {
          console.error('Translation error for day:', day, error);
          return fallbackDays[day] || 'Unknown';
        }
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


      // Enhanced StudioSelector with fixed handleStudioSelection function - select your pickup studio
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
  const { i18n } = useTranslation(); // Add this line

  // Number of studios to show initially
  const INITIAL_DISPLAY_COUNT = 4;

  const getDayName = (day) => {
    // Add safety check for t function
    if (!t || typeof t !== 'function') {
      console.error('Translation function not available');
      const fallbackDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      return fallbackDays[day] || 'Unknown';
    }
    
    const dayKeys = [
      'days.sunday',    // 0
      'days.monday',    // 1  
      'days.tuesday',   // 2
      'days.wednesday', // 3
      'days.thursday',  // 4
      'days.friday',    // 5
      'days.saturday'   // 6
    ];
    
    const fallbackDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    try {
      return t(dayKeys[day], { defaultValue: fallbackDays[day] });
    } catch (error) {
      console.error('Translation error for day:', day, error);
      return fallbackDays[day] || 'Unknown';
    }
  };
  
  // Calculate distance between two geographical coordinates
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
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
              studio.coordinates?.latitude || studio.locationData?.latitude || 0,
              studio.coordinates?.longitude || studio.locationData?.longitude|| 0
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
  {selectedStudio.operatingHours
    ?.sort((a, b) => a.day - b.day)
    .map(hours => {
      // Instant day translation without t()
      const dayNames = {
        en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        fr: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
        ar: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
      };
      
      const currentLang = i18n.language || 'en'; // Get current language
      const dayName = dayNames[currentLang]?.[hours.day] || dayNames.en[hours.day];
      
      const closedText = {
        en: 'Closed',
        fr: 'Fermé', 
        ar: 'مغلق'
      };
      
      return (
        <div key={hours.day} className="flex justify-between text-xs">
          <span>{dayName}</span>
          <span dir="ltr">
            {hours.isClosed ? 
              (closedText[currentLang] || 'Closed') 
              : `${hours.openTime} - ${hours.closeTime}`
            }
          </span>
        </div>
      );
    })}
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
      

const SizeSelector = ({ photo, onSizeChange, selectedCountry }) => {
  const [showSizePreview, setShowSizePreview] = useState(null);
  
  const sizeOptions = (selectedCountry === 'TUN' || selectedCountry === 'TN') ? [
    { value: '10x15', label: '10x15 cm', width: 35, height: 53 },
    { value: '15x22', label: '15x23 cm', width: 42, height: 64 }
  ] : [
    { value: '4x4', label: '4x4"', width: 40, height: 40 },
    { value: '4x6', label: '4x6"', width: 35, height: 53 },
    { value: '5x7', label: '5x7"', width: 40, height: 56 },
    { value: '8x10', label: '8x10"', width: 46, height: 58 }
  ];

  const handleSizeClick = (sizeOption) => {
    onSizeChange(photo.id, sizeOption.value);
    setShowSizePreview(sizeOption);
    
    setTimeout(() => {
      setShowSizePreview(null);
    }, 2000);
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">
      {t('produits.size')}
      </label>
      
      {showSizePreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full text-center">
            <h3 className="text-lg font-medium mb-4">
              {showSizePreview.label} Preview
            </h3>
            <div className="flex justify-center mb-4">
              <div 
                className="border-2 border-gray-300 bg-gray-100 flex items-center justify-center"
                style={{ 
                  width: `${showSizePreview.width * 3}px`, 
                  height: `${showSizePreview.height * 3}px`,
                  maxWidth: '200px',
                  maxHeight: '200px'
                }}
              >
                <img 
                  src={photo.preview} 
                  alt="Size preview"
                  className="w-full h-full object-cover rounded"
                />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Actual size: {showSizePreview.label}
            </p>
            <button 
              onClick={() => setShowSizePreview(null)}
              className="px-4 py-2 bg-yellow-400 text-black rounded hover:bg-yellow-500"
            >
              Close
            </button>
          </div>
        </div>
      )}
      
      <div className="space-y-2">
        {sizeOptions.map((sizeOption) => (
          <button
            key={sizeOption.value}
            onClick={() => handleSizeClick(sizeOption)}
            className={`w-full p-2.5 border-2 rounded-lg transition-all hover:shadow-md ${
              photo.size === sizeOption.value
                ? 'border-yellow-400 bg-yellow-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div 
                  className={`border-2 flex items-center justify-center text-xs font-bold flex-shrink-0 rounded ${
                    photo.size === sizeOption.value
                      ? 'border-yellow-400 bg-yellow-100 text-yellow-800'
                      : 'border-gray-300 bg-gray-50 text-gray-600'
                  }`}
                  style={{ 
                    width: `${sizeOption.width}px`, 
                    height: `${sizeOption.height}px` 
                  }}
                >
                  📷
                </div>
                
                <span className="text-sm font-medium">
                  {sizeOption.label}
                </span>
              </div>
              
              <div className="flex-shrink-0">
                {photo.size === sizeOption.value ? (
                  <div className="w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center">
                    <Check size={12} className="text-black font-bold" />
                  </div>
                ) : (
                  <div className="w-5 h-5 border-2 border-gray-300 rounded-full bg-white" />
                )}
              </div>
            </div>
          </button>
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
    
      //Product Details popup - Custom Photo Printing Size
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
          return t(`categories.${category}`, { defaultValue: category });
        };
        
        const translateProduct = (product) => {
          return t(`products.${product}`, { defaultValue: product });
        };
      
        const getProductData = (country) => {
          const countryInfo = initialCountries.find(c => c.value === country);
          if (!countryInfo) return [];
          
          let products = [];
      
          if (country !== 'TUN' && country !== 'TN') {
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
              },
              {
                category: 'Photo Prints',
                product: '8x10 Size',
                country: countryInfo.name,
                price: `${countryInfo.currency} ${countryInfo.size8x10}`
              }
            ];
          } 
      
          if (country === 'TN' || country === 'TUN') {
            products = [
              {
                category: 'Photo Prints',
                product: 'Format 10x15 cm',
                country: countryInfo.name,
                hasPricingTable: true,
                pricingTiers: [
                  { range: '1-4', price: '3.00', label: t('productDetails.qty_1_4') },
                  { range: '5-24', price: '2.40', label: t('productDetails.qty_5_24') },
                  { range: '25-49', price: '2.00', label: t('productDetails.qty_25_49') },
                  { range: '50-74', price: '1.50', label: t('productDetails.qty_50_74') },
                  { range: '75+', price: '1.25', label: t('productDetails.qty_75_plus') }
                ]
              },
              {
                category: 'Photo Prints',
                product: 'Format 15x23 cm',
                country: countryInfo.name,
                hasPricingTable: true,
                pricingTiers: [
                  { range: '1-4', price: '5.00', label: t('productDetails.qty_1_4') },
                  { range: '5-24', price: '4.00', label: t('productDetails.qty_5_24') },
                  { range: '25-49', price: '3.50', label: t('productDetails.qty_25_49') },
                  { range: '50-74', price: '2.50', label: t('productDetails.qty_50_74') },
                  { range: '75+', price: '2.00', label: t('productDetails.qty_75_plus') }
                ]
              }
            ];
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
            'Format 10x15 cm': photoprint4x6,
            'Format 15x23 cm': photoprint5x7,
            'Keychain': keychain,
            'Keychain and Magnet': keychain,
            'Magnet': magnet,
            'Rectangle': Rectangle,
            'Heart': Heart
          };
      
          return imageMap[product] || '';
        };
      
        if (!isOpen) return null;
      
        const productData = getProductData(selectedCountry);
        const isTunisia = selectedCountry === 'TN' || selectedCountry === 'TUN';
      
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
                  {/* Size comparison image for Tunisia at the top */}
                  {isTunisia && (
                    <div className="mb-6">
                      <img 
                        src={phototunisia} 
                        alt="Available Photo Sizes"
                        className="w-full h-auto rounded-lg shadow-sm" 
                      />
                    </div>
                  )}
      
                  <div className="grid grid-cols-1 gap-4">
                    {productData.map((product, index) => (
                      <div key={index} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                        <div className="p-4">
                          {/* Product Header */}
                          <div className="grid grid-cols-2 items-center mb-4">
                            <div className="space-y-3">
                              <div>
                                <div className="text-xs font-medium text-gray-500 uppercase">
                                  {t('productDetails.category')}
                                </div>
                                <div className="text-sm font-medium">
                                  {translateCategory(product.category)}
                                </div>
                              </div>
                              
                              <div>
                                <div className="text-xs font-medium text-gray-500 uppercase">
                                  {t('productDetails.product')}
                                </div>
                                <div className="text-sm font-medium">
                                  {translateProduct(product.product)}
                                </div>
                              </div>
                            </div>
                            
                            {/* Only show individual product images for non-Tunisia countries */}
                            {!isTunisia && (
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
                            )}
                          </div>
      
                          {/* Pricing Section */}
                          <div>
                            <div className="text-xs font-medium text-gray-500 uppercase mb-2">
                              {t('productDetails.pricing')}
                            </div>
                            
                            {product.hasPricingTable ? (
                              <div className="bg-gray-50 rounded-lg p-3">
                                <div className="space-y-2">
                                  {product.pricingTiers.map((tier, tierIndex) => (
                                    <div key={tierIndex} className="flex justify-between items-center py-1">
                                      <span className="text-sm text-gray-700">
                                        {tier.label}
                                      </span>
                                      <span className="text-sm font-medium text-blue-600">
                                        {tier.price} TND {t('productDetails.per_photo')}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                                <div className="mt-2 pt-2 border-t border-gray-200">
                                  <p className="text-xs text-gray-500">
                                    {t('productDetails.bulk_discount_note')}
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <div className="text-sm text-gray-600">
                                {product.pricing || product.price}
                              </div>
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
  const isTunisia = selectedCountry === 'TN' || selectedCountry === 'TUN';
  
  // Calculate the correct total and check if gift card fully covers it
  const { total: calculatedTotal } = appliedGiftCard ? calculateTotalsWithGiftCard() : calculateTotals();
  const isGiftCardFullyCovering = appliedGiftCard && calculatedTotal <= 0;
  
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
      {activeStep === 1 ? (
        isGiftCardFullyCovering ? (
          // Gift card fully covers order - show direct "Place Order" button
          <button
            onClick={handleGiftCardOnlyOrder}
            disabled={isProcessingOrder || !validatePaymentForm()}
            className={`px-6 py-2 rounded relative overflow-hidden transition-all duration-300 ${
              isProcessingOrder || !validatePaymentForm()
                ? 'bg-gray-200 cursor-not-allowed'
                : 'bg-emerald-500 hover:bg-emerald-600 text-white'
            }`}
            type="button"
          >
            <div className="flex items-center justify-center gap-2 relative z-10">
              {isProcessingOrder ? (
                <Loader size={18} className="animate-spin" />
              ) : (
                <Check size={18} />
              )}
              <span className="font-bold tracking-wide">
                {isProcessingOrder 
                  ? (t('order.processing') || 'Processing...') 
                  : (t('order.place_order') || 'Place Order')
                }
              </span>
            </div>
          </button>
        ) : isTunisia ? (
          // Tunisia COD - Direct order placement without Helcim - ADDED FALLBACK TEXT
          <button
            onClick={handleTunisiaCODOrder}
            disabled={isProcessingOrder || !validatePaymentForm()}
            className={`px-6 py-2 rounded relative overflow-hidden transition-all duration-300 ${
              isProcessingOrder || !validatePaymentForm()
                ? 'bg-gray-200 cursor-not-allowed'
                : 'bg-yellow-400 hover:bg-yellow-500'
            }`}
            type="button"
          >
            <div className="flex items-center justify-center gap-2 relative z-10">
              {isProcessingOrder ? (
                <Loader size={18} className="animate-spin" />
              ) : (
                <Package size={18} />
              )}
              <span className="text-black font-bold tracking-wide">
                {/* FIXED: Added fallback text for missing translation */}
                {isProcessingOrder 
                  ? (t('order.processing') || 'Processing...') 
                  : (t('order.place_cod_order') || 'Place Order (COD)')
                }
              </span>
            </div>
          </button>
        ) : paymentMethod === 'helcim' ? (
          // Regular Helcim payment flow for other countries
          <div className="helcim-payment-wrapper">
            <HelcimPayButton 
              onPaymentSuccess={handleHelcimPaymentSuccess}
              isProcessing={isProcessingOrder}
              disabled={!validatePaymentForm()} 
              selectedCountry={selectedCountry}
              total={calculatedTotal}  
              setOrderSuccess={setOrderSuccess}
              setError={setError}
              setIsProcessingOrder={setIsProcessingOrder}
              onSecretTokenReceived={handleSecretTokenReceived}
            />
          </div>
        ) : (
          // Regular "Next/Print" button for other cases
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
              <span className="text-black font-bold tracking-wide">{t('order.print_button')}</span>
              <div className="relative">
                {/* FreezeFIX custom printer icon */}
                <svg width="28" height="26" viewBox="0 0 28 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="4" y="6" width="20" height="10" rx="2" fill="black" />
                  <path d="M7 6V2H21V6" fill="none" stroke="black" strokeWidth="2" />
                  <rect x="7" y="16" width="14" height="6" fill="white" />
                  <rect x="18" y="8" width="2" height="2" fill="#FFCC00" />
                  <rect x="20" y="8" width="2" height="2" fill="#FFCC00" />
                  <rect x="20" y="10" width="2" height="2" fill="#FFCC00" />
                  <rect x="8" y="9" width="2" height="2" fill="#444" />
                  <rect x="11" y="9" width="3" height="2" fill="#444" />
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
        )
      ) : (
        // Not on checkout step - show standard button
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
          <span className="text-black font-bold tracking-wide">{t('order.print_button')}</span>
          <div className="relative">
              {/* FreezeFIX custom printer icon (same as above) */}
              <svg width="28" height="26" viewBox="0 0 28 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="4" y="6" width="20" height="10" rx="2" fill="black" />
                <path d="M7 6V2H21V6" fill="none" stroke="black" strokeWidth="2" />
                <rect x="7" y="16" width="14" height="6" fill="white" />
                <rect x="18" y="8" width="2" height="2" fill="#FFCC00" />
                <rect x="20" y="8" width="2" height="2" fill="#FFCC00" />
                <rect x="20" y="10" width="2" height="2" fill="#FFCC00" />
                <rect x="8" y="9" width="2" height="2" fill="#444" />
                <rect x="11" y="9" width="3" height="2" fill="#444" />
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
// Add this new function to handle Tunisia COD orders
const handleTunisiaCODOrder = async () => {
  const startTime = Date.now();
  
  try {
    setIsProcessingOrder(true);
    setOrderSuccess(false);
    setError(null);
    setUploadProgress(0);

    console.log('Tunisia SPEED: Starting lightning fast processing...');

    // ULTRA-FAST validation
    if (!formData?.email || !formData?.phone || !formData?.name) {
      throw new Error('Please fill in all required contact information');
    }

    if (deliveryMethod === 'pickup' && !selectedStudio) {
      throw new Error('Please select a pickup location');
    }

    const orderNumber = generateOrderNumber();
    setCurrentOrderNumber(orderNumber);
    
    const { total, currency, subtotal, shippingFee, taxAmount, discount } = calculateTotals();
    const country = initialCountries.find(c => c.value === selectedCountry);

    // LIGHTNING FAST photo processing - DEFINED HERE
    const processPhotosWithProgress = async () => {
      try {
        const compressedPhotos = await Promise.all(
          selectedPhotos.map(async (photo, index) => {
            const progress = ((index + 1) / selectedPhotos.length) * 15; // Only 15% for processing
            setUploadProgress(Math.round(progress));

            let imageData;
            if (photo.base64) {
              imageData = photo.base64;
            } else if (photo.file) {
              // LIGHTNING FAST compression
              const compressedFile = await imageCompression(photo.file, {
                maxSizeMB: 0.75, // Balanced size for speed
                maxWidthOrHeight: 1000, // Slightly smaller for speed
                useWebWorker: true,
                fileType: 'image/jpeg',
                initialQuality: 0.70, // Good quality but fast
                alwaysKeepResolution: false
              });
              imageData = await convertImageToBase64(compressedFile);
            }

            return {
              ...photo,
              file: imageData,
              price: photo.price || calculateItemPrice(photo, country),
              productType: photo.productType || 'photo_print',
              size: photo.size || '10x15',
              quantity: photo.quantity || 1
            };
          })
        );
        return compressedPhotos;
      } catch (processError) {
        console.error('Tunisia SPEED: Photo processing error:', processError);
        throw new Error('Failed to process photos');
      }
    };

    // CALL the photo processing
    const optimizedPhotosWithPrices = await processPhotosWithProgress();

    const orderData = {
      orderNumber,
      email: formData.email,
      phone: formData.phone,
      name: formData.name || '',
      
      ...(deliveryMethod === 'pickup' ? {
        pickupStudio: selectedStudio ? {
          studioId: selectedStudio._id || null,
          name: selectedStudio.name || 'Unspecified Studio',
          address: selectedStudio.address || 'Not Specified',
          city: selectedStudio.city || 'Not Specified',
          country: selectedStudio.country || selectedCountry
        } : null
      } : {
        shippingAddress: {
          firstName: formData.shippingAddress.firstName || '',
          lastName: formData.shippingAddress.lastName || '',
          address: formData.shippingAddress.address || '',
          city: formData.shippingAddress.city || '',
          postalCode: formData.shippingAddress.postalCode || '',
          country: formData.shippingAddress.country || selectedCountry,
          province: formData.shippingAddress.province || '',
          state: formData.shippingAddress.state || ''
        }
      }),
      
      orderItems: optimizedPhotosWithPrices,
      totalAmount: Number(total) || 0,
      subtotal: Number(subtotal) || 0,
      shippingFee: Number(shippingFee) || 0,
      taxAmount: Number(taxAmount) || 0,
      discount: discount || 0,
      discountCode: discountCode || null,
      currency: country.currency,
      orderNote: orderNote || '',
      paymentMethod: 'cod',
      paymentStatus: 'pending',
      status: 'Waiting for CSR approval',
      deliveryMethod,
      customerDetails: {
        name: formData.name || '',
        email: formData.email,
        phone: formData.phone,
        country: selectedCountry
      },
      selectedCountry,
      createdAt: new Date().toISOString()
    };

    // LIGHTNING FAST order submission
    console.log('Tunisia SPEED: Submitting order...');
    const responses = await submitTunisiaBiggerChunks(orderData);

    // FIRE-AND-FORGET email (don't wait for it)
    sendOrderConfirmationEmail({
      ...orderData,
      orderItems: orderData.orderItems.map(item => ({
        ...item,
        file: undefined,
        thumbnail: item.thumbnail
      }))
    }).catch(emailError => {
      console.warn('Tunisia SPEED: Email failed but order succeeded:', emailError.message);
    });

    const totalTime = Date.now() - startTime;
    console.log(`Tunisia SPEED: TOTAL TIME: ${totalTime}ms (${(totalTime/1000).toFixed(1)}s)`);

    setOrderSuccess(true);
    setSelectedPhotos([]);
    clearStateStorage();
    
    console.log('Tunisia SPEED: Order completed successfully:', {
      orderNumber,
      totalItems: orderData.orderItems.length,
      totalTime: `${(totalTime/1000).toFixed(1)}s`
    });

  } catch (error) {
    const totalTime = Date.now() - startTime;
    console.error(`Tunisia SPEED: Order failed after ${totalTime}ms:`, error);
    
    let errorMessage = 'Failed to place order';
    if (error.response?.data?.error) {
      errorMessage = error.response.data.error;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    setError(errorMessage);
    setOrderSuccess(false);
  } finally {
    setIsProcessingOrder(false);
    setUploadProgress(0);
  }
};

const submitTunisiaBiggerChunks = async (orderData) => {
  const { orderItems } = orderData;
  
  // MASSIVE CHUNKS for 24 images
  const TUNISIA_CHUNK_SIZE = 24; // ALL 24 images in 1 chunk!
  const TUNISIA_TIMEOUT = 180000; // 3 minutes timeout for big chunk
  const CHUNK_DELAY = 1000; // 1 second delay
  
  const baseOrderData = {
    ...orderData,
    shippingFee: orderData.shippingFee || 0,
    shippingMethod: orderData.deliveryMethod === 'shipping' ? 'shipping' : 'local_pickup',
    deliveryMethod: orderData.deliveryMethod || 'pickup',
    status: 'Waiting for CSR approval',
    paymentMethod: 'cod',
    paymentStatus: 'pending',
    tunisiaSpeedMode: true,
    massiveChunk: true, // Flag for server to handle big chunks
    ...(orderData.deliveryMethod !== 'shipping' && orderData.pickupStudio 
      ? { pickupStudio: orderData.pickupStudio } 
      : { pickupStudio: null })
  };

  // Split into MASSIVE chunks (probably just 1 chunk for 24 images)
  const chunks = [];
  for (let i = 0; i < orderItems.length; i += TUNISIA_CHUNK_SIZE) {
    chunks.push(orderItems.slice(i, i + TUNISIA_CHUNK_SIZE));
  }

  console.log(`Tunisia MASSIVE: ${chunks.length} chunks of up to ${TUNISIA_CHUNK_SIZE} items`);

  const results = [];
  const startTime = Date.now();

  for (let i = 0; i < chunks.length; i++) {
    const chunkStartTime = Date.now();
    const chunk = chunks[i];
    const chunkProgress = 20 + ((i + 1) / chunks.length) * 70;
    setUploadProgress(Math.round(chunkProgress));

    let retryCount = 0;
    const maxRetries = 2; // More retries for massive chunks

    while (retryCount <= maxRetries) {
      try {
        console.log(`Tunisia MASSIVE: Uploading chunk ${i + 1}/${chunks.length} with ${chunk.length} items, attempt ${retryCount + 1}`);
        
        const response = await axios.post(
          'https://freezepix-database-server-c95d4dd2046d.herokuapp.com/api/orders/chunk',
          {
            ...baseOrderData,
            orderItems: chunk
          },
          {
            withCredentials: true,
            timeout: TUNISIA_TIMEOUT,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );

        const chunkTime = Date.now() - chunkStartTime;
        results.push(response.data);
        console.log(`Tunisia MASSIVE: Chunk ${i + 1} with ${chunk.length} items completed in ${chunkTime}ms`);
        
        // Small delay between massive chunks
        if (i < chunks.length - 1) {
          await new Promise(resolve => setTimeout(resolve, CHUNK_DELAY));
        }
        
        break;
        
      } catch (error) {
        retryCount++;
        const chunkTime = Date.now() - chunkStartTime;
        console.error(`Tunisia MASSIVE: Chunk ${i + 1} failed after ${chunkTime}ms:`, error.message);
        
        if (retryCount <= maxRetries) {
          // Shorter wait for retry
          console.log(`Tunisia MASSIVE: Retrying chunk ${i + 1} after 2 seconds...`);
          await new Promise(resolve => setTimeout(resolve, 2000));
        } else {
          throw new Error(`Tunisia MASSIVE: Chunk ${i + 1} failed after ${maxRetries + 1} attempts: ${error.message}`);
        }
      }
    }
  }

  const totalTime = Date.now() - startTime;
  console.log(`Tunisia MASSIVE: All ${orderItems.length} items completed in ${totalTime}ms (${(totalTime/1000).toFixed(1)}s)`);

  if (results.length !== chunks.length) {
    throw new Error(`Tunisia: Upload incomplete: ${results.length}/${chunks.length} chunks`);
  }

  return results;
};

const optimizeImageHighQuality = async (file) => {
  try {
    // TUNISIA: Best balance of quality and speed
    const options = {
      maxSizeMB: 1.2, // Generous file size for high quality
      maxWidthOrHeight: 1400, // Even higher resolution
      useWebWorker: true,
      fileType: 'image/jpeg',
      initialQuality: 0.85, // Very high quality
      alwaysKeepResolution: true // Keep original resolution when possible
    };
    
    return await imageCompression(file, options);
  } catch (error) {
    console.error('Tunisia high-quality optimization error:', error);
    return file; // Return original if optimization fails
  }
};

const processTunisiaOrderParallel = async (orderData) => {
  try {
    // Process multiple operations in parallel for speed
    const [
      orderSubmission,
      emailPreparation
    ] = await Promise.allSettled([
      // Main order submission
      submitTunisiaBiggerChunks(orderData),
      
      // Prepare email data in parallel
      Promise.resolve({
        ...orderData,
        orderItems: orderData.orderItems.map(item => ({
          ...item,
          file: undefined,
          thumbnail: item.thumbnail
        }))
      })
    ]);

    if (orderSubmission.status === 'fulfilled') {
      console.log('Tunisia: Order submitted successfully');
      
      // Send email after order success (don't wait for it)
      if (emailPreparation.status === 'fulfilled') {
        sendOrderConfirmationEmail(emailPreparation.value).catch(emailError => {
          console.warn('Tunisia: Email failed but order succeeded:', emailError.message);
        });
      }
      
      return orderSubmission.value;
    } else {
      throw orderSubmission.reason;
    }
  } catch (error) {
    console.error('Tunisia parallel processing error:', error);
    throw error;
  }
};

// Add this new function for Tunisia order submission
const submitTunisiaOrderWithImprovedChunking = async (orderData) => {
  const { orderItems } = orderData;
  
  // Smaller chunks and longer timeout for Tunisia
  const TUNISIA_CHUNK_SIZE = 2; // Much smaller chunks
  const TUNISIA_TIMEOUT = 90000; // 90 seconds timeout
  
  const baseOrderData = {
    ...orderData,
    shippingFee: orderData.shippingFee || 0,
    shippingMethod: orderData.deliveryMethod === 'shipping' ? 'shipping' : 'local_pickup',
    deliveryMethod: orderData.deliveryMethod || 'pickup',
    status: 'Waiting for CSR approval',
    paymentMethod: 'cod',
    paymentStatus: 'pending',
    ...(orderData.deliveryMethod !== 'shipping' && orderData.pickupStudio 
      ? { pickupStudio: orderData.pickupStudio } 
      : { pickupStudio: null })
  };

  // Split into very small chunks
  const chunks = [];
  for (let i = 0; i < orderItems.length; i += TUNISIA_CHUNK_SIZE) {
    chunks.push(orderItems.slice(i, i + TUNISIA_CHUNK_SIZE));
  }

  console.log(`Tunisia: Submitting order in ${chunks.length} chunks of ${TUNISIA_CHUNK_SIZE} items each`);

  // Submit chunks sequentially (not in parallel) to reduce server load
  const results = [];
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const chunkProgress = 40 + ((i + 1) / chunks.length) * 60; // Remaining 60% for upload
    setUploadProgress(Math.round(chunkProgress));

    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount <= maxRetries) {
      try {
        console.log(`Tunisia: Uploading chunk ${i + 1}/${chunks.length}, attempt ${retryCount + 1}`);
        
        const response = await axios.post(
          'https://freezepix-database-server-c95d4dd2046d.herokuapp.com/api/orders/chunk',
          {
            ...baseOrderData,
            orderItems: chunk
          },
          {
            withCredentials: true,
            timeout: TUNISIA_TIMEOUT,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );

        results.push(response.data);
        console.log(`Tunisia: Chunk ${i + 1} uploaded successfully`);
        
        // Longer delay between chunks for Tunisia to prevent server overload
        if (i < chunks.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
        break; // Success, exit retry loop
        
      } catch (error) {
        retryCount++;
        console.error(`Tunisia: Chunk ${i + 1} attempt ${retryCount} failed:`, error.message);
        
        if (retryCount <= maxRetries) {
          // Exponential backoff with longer delays for Tunisia
          const backoffDelay = Math.min(3000 * Math.pow(2, retryCount - 1), 20000);
          console.log(`Tunisia: Retrying chunk ${i + 1} after ${backoffDelay}ms delay...`);
          await new Promise(resolve => setTimeout(resolve, backoffDelay));
        } else {
          throw new Error(`Tunisia: Failed to upload chunk ${i + 1} after ${maxRetries + 1} attempts: ${error.message}`);
        }
      }
    }
  }

  if (results.length !== chunks.length) {
    throw new Error(`Tunisia: Upload incomplete: ${results.length}/${chunks.length} chunks uploaded`);
  }

  console.log(`Tunisia: Order upload completed successfully: ${results.length} chunks uploaded`);
  return results;
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

      const calculateItemPrice = (photo, country, allPhotos) => {
        if (!photo || !country) return 0;
      
        if (photo.productType === 'photo_print') {
          // Calculate total quantity for the specific size
          const totalQuantityForSize = allPhotos
            .filter(p => p.size === photo.size && p.productType === 'photo_print')
            .reduce((sum, p) => sum + (p.quantity || 1), 0);
      
          // Use the pricing function for Tunisia
          if (selectedCountry === 'TUN' || selectedCountry === 'TN') {
            return getTunisiaPricing(photo.size, totalQuantityForSize);
          } else {
            // Existing logic for other countries
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

    // Helper function to normalize country codes for Tunisia
    const normalizeTunisiaCountryCode = (country) => {
      if (!country) return null;
      const normalizedCountry = country.toLowerCase().trim();
      const tunisiaVariants = ['tn', 'tun', 'tunisia', 'tunisie'];
      return tunisiaVariants.includes(normalizedCountry) ? 'TN' : country.toUpperCase();
    };

    // Helper function to get Tunisia studios that accept shipping
    const getTunisiaShippingStudios = async () => {
      try {
        const response = await fetch('https://freezepix-database-server-c95d4dd2046d.herokuapp.com/api/studios', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          signal: AbortSignal.timeout(30000)
        });

        if (response.ok) {
          const studios = await response.json();
          return studios.filter(studio => 
            studio.country === 'TN' && 
            studio.acceptsShipping === true && 
            studio.isActive === true &&
            studio.owner?.email
          );
        }
        
        return [];
      } catch (error) {
        console.error('Error fetching Tunisia shipping studios:', error);
        return [];
      }
    };

    // Helper function to generate studio owner email content
    const generateStudioEmailContent = (studio, orderData, isFrench = false) => {
      const texts = isFrench ? {
        newOrder: '🔔 Nouvelle commande à préparer',
        actionRequired: '⚠️ Action requise',
        prepareOrder: 'Veuillez préparer cette commande pour expédition.',
        orderDetails: 'Détails de la commande',
        orderNumber: 'Numéro de commande :',
        customerEmail: 'Email du client :',
        customerPhone: 'Téléphone du client :',
        paymentMethod: 'Méthode de paiement :',
        deliveryMethod: 'Méthode de livraison :',
        totalAmount: 'Montant total :',
        shippingLocation: 'Adresse de livraison',
        customerNote: 'Note du client',
        disclaimer: 'Ceci est une notification automatique du système FreezePIX.'
      } : {
        newOrder: '🔔 New Shipping Order to Fulfill',
        actionRequired: '⚠️ Action Required',
        prepareOrder: 'Please prepare this order for shipping to customer.',
        orderDetails: 'Order Details',
        orderNumber: 'Order Number:',
        customerEmail: 'Customer Email:',
        customerPhone: 'Customer Phone:',
        paymentMethod: 'Payment Method:',
        deliveryMethod: 'Delivery Method:',
        totalAmount: 'Total Amount:',
        shippingLocation: 'Shipping Address',
        customerNote: 'Customer Note',
        disclaimer: 'This is an automated notification from FreezePIX system.'
      };
      
      const formattedAmount = orderData.totalAmount?.toFixed(2) || '0.00';
      const currency = orderData.currency || 'USD';
      const shippingAddress = orderData.shippingAddress || {};
      
      return `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; line-height: 1.6;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">${texts.newOrder}</h1>
            <p style="margin: 5px 0 0 0; font-size: 16px;">FreezePIX - ${studio.name}</p>
          </div>
          
          <div style="background-color: white; padding: 20px; border: 1px solid #ddd; border-top: none;">
            <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107; margin-bottom: 20px;">
              <h3 style="color: #856404; margin-top: 0; font-size: 18px;">${texts.actionRequired}</h3>
              <p style="color: #856404; margin-bottom: 0; font-weight: bold;">${texts.prepareOrder}</p>
            </div>
            
            <h3 style="color: #333; border-bottom: 2px solid #f0f0f0; padding-bottom: 10px;">${texts.orderDetails}</h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <tr>
                <td style="padding: 10px; font-weight: bold; border: 1px solid #ddd; background-color: #f8f9fa;">${texts.orderNumber}</td>
                <td style="padding: 10px; border: 1px solid #ddd; font-family: monospace; font-size: 16px; color: #dc3545;">${orderData.orderNumber}</td>
              </tr>
              <tr>
                <td style="padding: 10px; font-weight: bold; border: 1px solid #ddd; background-color: #f8f9fa;">${texts.customerEmail}</td>
                <td style="padding: 10px; border: 1px solid #ddd;"><a href="mailto:${orderData.email}" style="color: #007bff;">${orderData.email}</a></td>
              </tr>
              <tr>
                <td style="padding: 10px; font-weight: bold; border: 1px solid #ddd; background-color: #f8f9fa;">${texts.customerPhone}</td>
                <td style="padding: 10px; border: 1px solid #ddd;"><a href="tel:${orderData.phone}" style="color: #007bff; font-weight: bold;">${orderData.phone}</a></td>
              </tr>
              <tr>
                <td style="padding: 10px; font-weight: bold; border: 1px solid #ddd; background-color: #f8f9fa;">${texts.deliveryMethod}</td>
                <td style="padding: 10px; border: 1px solid #ddd;">Shipping</td>
              </tr>
              <tr>
                <td style="padding: 10px; font-weight: bold; border: 1px solid #ddd; background-color: #f8f9fa;">${texts.totalAmount}</td>
                <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; color: #28a745; font-size: 18px;">${formattedAmount} ${currency}</td>
              </tr>
            </table>
            
            <h3 style="color: #333; border-bottom: 2px solid #f0f0f0; padding-bottom: 10px;">${texts.shippingLocation}</h3>
            <div style="background-color: #e9ecef; padding: 15px; border-radius: 8px; border: 1px solid #ddd;">
              <p style="margin: 0; font-size: 16px;">
                <strong style="color: #495057;">${shippingAddress.firstName || ''} ${shippingAddress.lastName || ''}</strong><br>
                ${shippingAddress.address || ''}<br>
                ${shippingAddress.city || ''}, ${shippingAddress.postalCode || ''}<br>
                ${shippingAddress.country || ''}
              </p>
            </div>
            
            ${orderData.orderNote ? `
              <h3 style="color: #333; border-bottom: 2px solid #f0f0f0; padding-bottom: 10px;">${texts.customerNote}</h3>
              <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107;">
                <p style="margin: 0; font-style: italic; color: #856404;">"${orderData.orderNote}"</p>
              </div>
            ` : ''}
            
            <div style="border-top: 1px solid #eee; padding-top: 15px; margin-top: 20px;">
              <p style="margin: 0; font-size: 12px; color: #6c757d; text-align: center;">
                ${texts.disclaimer}
              </p>
            </div>
          </div>
        </div>
      `;
    };

    // Helper function to generate plain text version for studio emails
    const generateStudioPlainTextVersion = (studio, orderData, isFrench = false) => {
      const texts = isFrench ? {
        newOrder: 'NOUVELLE COMMANDE À PRÉPARER',
        actionRequired: 'ACTION REQUISE',
        orderDetails: 'DÉTAILS DE LA COMMANDE',
        orderNumber: 'Numéro de commande',
        customerEmail: 'Email du client',
        customerPhone: 'Téléphone du client',
        totalAmount: 'Montant total',
        shippingAddress: 'Adresse de livraison',
        customerNote: 'Note du client'
      } : {
        newOrder: 'NEW SHIPPING ORDER TO FULFILL',
        actionRequired: 'ACTION REQUIRED',
        orderDetails: 'ORDER DETAILS',
        orderNumber: 'Order Number',
        customerEmail: 'Customer Email',
        customerPhone: 'Customer Phone',
        totalAmount: 'Total Amount',
        shippingAddress: 'Shipping Address',
        customerNote: 'Customer Note'
      };
      
      const formattedAmount = orderData.totalAmount?.toFixed(2) || '0.00';
      const currency = orderData.currency || 'USD';
      const shippingAddress = orderData.shippingAddress || {};
      
      return `
${texts.newOrder}
FreezePIX - ${studio.name}

${texts.actionRequired}
Please prepare this order for shipping to customer.

${texts.orderDetails}
${texts.orderNumber}: ${orderData.orderNumber}
${texts.customerEmail}: ${orderData.email}
${texts.customerPhone}: ${orderData.phone}
${texts.totalAmount}: ${formattedAmount} ${currency}

${texts.shippingAddress}:
${shippingAddress.firstName || ''} ${shippingAddress.lastName || ''}
${shippingAddress.address || ''}
${shippingAddress.city || ''}, ${shippingAddress.postalCode || ''}
${shippingAddress.country || ''}

${orderData.orderNote ? `${texts.customerNote}: "${orderData.orderNote}"` : ''}

This is an automated notification from FreezePIX system.
      `.trim();
    };

    // Helper function to send studio owner notification directly via nodemailer
    const sendStudioNotification = async (studio, orderData) => {
      try {
        const studioInTunisia = studio.country === 'TN';
        const studioSubjectPrefix = studioInTunisia ? '🚀 Nouvelle Commande Expédition' : '🚀 New Shipping Order';
        
        const studioEmailContent = generateStudioEmailContent(studio, orderData, studioInTunisia);
        const studioPlainText = generateStudioPlainTextVersion(studio, orderData, studioInTunisia);

        // Send directly to studio notification endpoint
        const studioNotificationData = {
          studioOwnerEmail: studio.owner.email,
          studioName: studio.name,
          orderNumber: orderData.orderNumber,
          customerEmail: orderData.email,
          customerPhone: orderData.phone,
          shippingAddress: orderData.shippingAddress,
          totalAmount: orderData.totalAmount,
          currency: orderData.currency,
          orderNote: orderData.orderNote,
          emailContent: studioEmailContent,
          plainTextContent: studioPlainText,
          subject: `${studioSubjectPrefix} #${orderData.orderNumber} - ${studio.name}`,
          isStudioNotification: true
        };

        const response = await fetch('https://freezepix-database-server-c95d4dd2046d.herokuapp.com/send-studio-notification', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(studioNotificationData),
          signal: AbortSignal.timeout(60000)
        });

        if (response.ok) {
          return { success: true, studio: studio.name, email: studio.owner.email };
        } else {
          const errorData = await response.json().catch(() => null);
          throw new Error(`HTTP ${response.status}: ${errorData?.message || response.statusText}`);
        }

      } catch (error) {
        console.error(`Failed to notify studio ${studio.name}:`, error);
        return { success: false, studio: studio.name, error: error.message };
      }
    };

    // Create order summary with detailed product information
    const emailOrderData = {
      orderNumber: orderData.orderNumber || 'N/A',
      email: orderData.email || 'N/A',
      
      // Robust handling of pickup studio for pickup orders
      ...(orderData.deliveryMethod === 'pickup' ? {
        pickupStudio: {
          name: orderData?.pickupStudio?.name || 'Unspecified Studio',
          address: orderData?.pickupStudio?.address || 'Not Specified',
          city: orderData?.pickupStudio?.city || 'Not Specified',
          country: orderData?.pickupStudio?.country || orderData.selectedCountry
        }
      } : {}),
      
      // Robust handling of shipping address for shipping orders
      ...(orderData.deliveryMethod === 'shipping' ? {
        shippingAddress: {
          firstName: orderData?.shippingAddress?.firstName || '',
          lastName: orderData?.shippingAddress?.lastName || '',
          address: orderData?.shippingAddress?.address || '',
          city: orderData?.shippingAddress?.city || '',
          postalCode: orderData?.shippingAddress?.postalCode || '',
          country: orderData?.shippingAddress?.country || orderData.selectedCountry,
          province: orderData?.shippingAddress?.province || '',
          state: orderData?.shippingAddress?.state || ''
        }
      } : {}),
      
      phone: orderData.phone || 'N/A',
      orderNote: orderData.orderNote || '',
      paymentMethod: orderData.paymentMethod || 'helcim',
      orderItems: orderData.orderItems || [],
      totalAmount: orderData.totalAmount || 0,
      currency: orderData.currency || 'USD',
      deliveryMethod: orderData.deliveryMethod || 'pickup',
      subtotal: orderData.subtotal || 0,
      shippingFee: orderData.shippingFee || 0,
      taxAmount: orderData.taxAmount || 0,
      discount: orderData.discount || 0
    };

    console.log('Sending order confirmation email for customer and admin...');

    // Send main email (customer + admin) - this uses existing backend logic
    const response = await fetch('https://freezepix-database-server-c95d4dd2046d.herokuapp.com/send-order-confirmation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(emailOrderData),
      signal: AbortSignal.timeout(90000)
    });

    const responseData = await response.json().catch(e => null);
    
    if (!response.ok) {
      const errorType = response.status === 500 ? 'SERVER_ERROR' : 
                       response.status === 403 ? 'AUTH_ERROR' : 
                       response.status === 429 ? 'RATE_LIMIT' : 'UNKNOWN';
      
      throw {
        message: `Email service error: ${responseData?.message || response.statusText}`,
        status: response.status,
        type: errorType,
        response: responseData,
        isEmailError: true
      };
    }

    console.log('Main emails sent successfully (customer + admin)');

    // NEW LOGIC: Handle Tunisia shipping studio owner notifications
    let tunisiaShippingNotifications = {
      attempted: false,
      success: false,
      studiosNotified: 0,
      errors: []
    };

    // Check if this is a shipping order to Tunisia
    if (orderData.deliveryMethod === 'shipping' && orderData.shippingAddress?.country) {
      const normalizedShippingCountry = normalizeTunisiaCountryCode(orderData.shippingAddress.country);
      
      if (normalizedShippingCountry === 'TN') {
        console.log('Processing Tunisia shipping order - notifying studio owners...');
        tunisiaShippingNotifications.attempted = true;
        
        try {
          // Get Tunisia studios that accept shipping
          const tunisiaStudios = await getTunisiaShippingStudios();
          
          if (tunisiaStudios.length > 0) {
            console.log(`Found ${tunisiaStudios.length} Tunisia studios that accept shipping`);
            
            // Send individual emails to each studio owner using the new method
            const studioNotificationPromises = tunisiaStudios.map(studio => 
              sendStudioNotification(studio, emailOrderData)
            );

            // Wait for all studio notifications to complete
            const studioResults = await Promise.allSettled(studioNotificationPromises);
            
            // Process results
            studioResults.forEach((result) => {
              if (result.status === 'fulfilled' && result.value.success) {
                tunisiaShippingNotifications.studiosNotified++;
                console.log(`Studio notification sent to: ${result.value.email} (${result.value.studio})`);
              } else {
                const errorMsg = result.status === 'rejected' 
                  ? result.reason?.message || result.reason 
                  : result.value.error;
                tunisiaShippingNotifications.errors.push(errorMsg);
                console.error(`Failed to notify studio: ${errorMsg}`);
              }
            });

            tunisiaShippingNotifications.success = tunisiaShippingNotifications.studiosNotified > 0;
            console.log(`Tunisia shipping notifications completed: ${tunisiaShippingNotifications.studiosNotified}/${tunisiaStudios.length} successful`);
            
          } else {
            console.warn('No Tunisia studios found that accept shipping');
            tunisiaShippingNotifications.errors.push('No Tunisia studios found that accept shipping');
          }
          
        } catch (error) {
          console.error('Error processing Tunisia shipping notifications:', error);
          tunisiaShippingNotifications.errors.push(error.message);
        }
      }
    }

    // Return comprehensive response
    return {
      ...responseData,
      tunisiaShippingNotifications
    };

  } catch (error) {
    // Enhanced error logging with classification
    const errorDetails = {
      message: error.message,
      status: error.status,
      type: error.type || 'UNKNOWN',
      response: error.response,
      stack: error.stack,
      isEmailError: error.isEmailError || false,
      timestamp: new Date().toISOString()
    };
    
    console.error('Detailed email service error:', errorDetails);
    
    // Don't throw the error - just log it and continue with order success
    // The order was already created successfully
    return {
      success: false,
      error: error.message,
      shouldRetry: error.status >= 500 && error.status < 600 // Retry on 5xx errors
    };
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
    
    const baseOrderData = {
      ...orderData,
      shippingFee: orderData.shippingFee || 0,
      shippingMethod: orderData.deliveryMethod === 'shipping' ? 'shipping' : 'local_pickup',
      deliveryMethod: orderData.deliveryMethod || 'pickup',
      status: paymentMethod === 'helcim' ? 'Processing' : 'Waiting for CSR approval',
      paymentMethod: paymentMethod,
      paymentStatus: paymentMethod === 'helcim' ? 'paid' : 'pending',
      // Only include pickupStudio if it's a pickup order
      ...(orderData.deliveryMethod !== 'shipping' && orderData.pickupStudio 
        ? { pickupStudio: orderData.pickupStudio } 
        : { pickupStudio: null })
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

    // HERE WE MUST ntegrate order notif to studio owner...
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
        const compressedPhotos = await Promise.all(
          selectedPhotos.map(async (photo, index) => {
            const progress = ((index + 1) / selectedPhotos.length) * 15; // Only 15% for processing
            setUploadProgress(Math.round(progress));
    
            let imageData;
            if (photo.base64) {
              imageData = photo.base64;
            } else if (photo.file) {
              // LIGHTNING FAST compression
              const compressedFile = await imageCompression(photo.file, {
                maxSizeMB: 0.5, // Balanced size for speed
                maxWidthOrHeight: 1000, // Slightly smaller for speed
                useWebWorker: true,
                fileType: 'image/jpeg',
                initialQuality: 0.75, // Good quality but fast
                alwaysKeepResolution: false
              });
              imageData = await convertImageToBase64(compressedFile);
            }
    
            return {
              ...photo,
              file: imageData,
              price: photo.price || calculateItemPrice(photo, country),
              productType: photo.productType || 'photo_print',
              size: photo.size || '10x15',
              quantity: photo.quantity || 1
            };
          })
        );
        return compressedPhotos;
      } catch (processError) {
        console.error('Tunisia SPEED: Photo processing error:', processError);
        throw new Error('Failed to process photos');
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
    const { 
      total, 
      originalTotal,
      currency, 
      subtotal, 
      shippingFee, 
      taxAmount, 
      discount,
      giftCardAmount,
      remainingGiftCardBalance,
      paymentMethod: calculatedPaymentMethod
    } = calculateTotalsWithGiftCard();

    const country = initialCountries.find(c => c.value === selectedCountry);

    // Determine the payment method based on delivery and selected payment option
       let finalPaymentMethod = calculatedPaymentMethod;


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

      // ========== CAPTURE SOURCE URL ==========
      const sourceVisitUrl = captureSourceUrl();
      console.log('Captured source visit URL:', sourceVisitUrl);

    // Construct order data
    const orderData = {
      orderNumber,
      email: formData.email,
      phone: formData.phone,
      name: formData.name || '',
       // ========== ADD SOURCE URL TO ORDER DATA ==========
       sourceVisitUrl: sourceVisitUrl, 
        // Add gift card information
        giftCard: appliedGiftCard ? {
          id: appliedGiftCard.id,
          code: appliedGiftCard.code,
          amountUsed: giftCardAmount,
          remainingBalance: remainingGiftCardBalance
        } : null,
      // ONLY include pickupStudio if delivery method is pickup
   // Always include pickupStudio for pickup orders, with robust fallback
   ...(deliveryMethod === 'pickup' ? {
    pickupStudio: selectedStudio ? {
      studioId: selectedStudio._id || null,
      name: selectedStudio.name || 'Unspecified Studio',
      address: selectedStudio.address || 'Not Specified',
      city: selectedStudio.city || 'Not Specified',
      country: selectedStudio.country || selectedCountry
    } : {
      studioId: null,
      name: 'Unspecified Studio',
      address: 'Not Specified',
      city: 'Not Specified',
      country: selectedCountry
    }
  } : {}),
  
  // Always include shipping address for shipping orders, with robust fallback
  ...(deliveryMethod === 'shipping' ? {
    shippingAddress: {
      firstName: formData.shippingAddress.firstName || formData.billingAddress.firstName || '',
      lastName: formData.shippingAddress.lastName || formData.billingAddress.lastName ||'',
      address: formData.shippingAddress.address || formData.billingAddress.address || '',
      city: formData.shippingAddress.city || formData.billingAddress.city || '',
      postalCode: formData.shippingAddress.postalCode || formData.billingAddress.postalCode ||'',
      country: formData.shippingAddress.country || formData.billingAddress.country || selectedCountry,
      province: formData.shippingAddress.province || formData.billingAddress.province || '',
      state: formData.shippingAddress.state || formData.billingAddress.state || ''
    }
  } : {}),
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
      giftCardAmount: giftCardAmount || 0,
      discount: calculateTotals().discount || 0,
      discountCode: discountCode || null,
      discountAmount: calculateTotals().discount || 0,
      discountDetails: discountCode ? availableDiscounts.find(
        rule => rule.title.toUpperCase() === discountCode.toUpperCase()
      ) : null,
      currency: country.currency,
      orderNote: orderNote || '',
      paymentMethod: 'helcim',
      status: finalPaymentMethod === 'helcim' ? 'Processing' : 'Waiting for CSR approval',
      paymentStatus: finalPaymentMethod === 'helcim' ? 'paid' : 'pending',
      deliveryMethod: deliveryMethod,
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

// Handle gift card payment scenario
if (appliedGiftCard) {
  const giftCardAmount = Math.min(appliedGiftCard.balance, originalTotal);
  const remainingBalance = Math.max(0, originalTotal - giftCardAmount);
  
  console.log('Processing order with gift card payment:', {
    giftCardCode: appliedGiftCard.code,
    giftCardAmount,
    originalTotal,
    remainingBalance
  });
  
  // Update order data with gift card information
  orderData = {
    ...orderData,
    giftCard: {
      id: appliedGiftCard.id,
      code: appliedGiftCard.code,
      amountUsed: giftCardAmount,
      remainingBalance: appliedGiftCard.balance - giftCardAmount,
      currencyCode: appliedGiftCard.currencyCode
    },
    originalTotal: originalTotal
  };
  
  // If fully covered by gift card, no need for additional payment
  if (remainingBalance === 0) {
    console.log('Order fully covered by gift card, updating gift card balance');
    
    try {
      // Update gift card balance on Shopify
      const giftCardUpdateResponse = await axios.post(
        'https://freezepix-database-server-c95d4dd2046d.herokuapp.com/api/update-gift-card',
        {
          giftCardId: appliedGiftCard.id,
          amountUsed: giftCardAmount,
          orderNumber: orderData.orderNumber
        }
      );
      
      if (giftCardUpdateResponse.data.success) {
        console.log('Gift card updated successfully:', giftCardUpdateResponse.data);
        
        // Store transaction ID from Shopify response
        if (giftCardUpdateResponse.data.transaction?.id) {
          orderData.giftCard.transactionId = giftCardUpdateResponse.data.transaction.id;
        }
        
        // Set payment method and status for gift card only payment
        orderData.paymentMethod = 'gift_card';
        orderData.paymentStatus = 'paid';
        orderData.status = 'Processing';
      } else {
        console.error('Failed to update gift card:', giftCardUpdateResponse.data);
        throw new Error('Gift card update failed');
      }
    } catch (giftCardError) {
      console.error('Gift card update error:', giftCardError);
      throw new Error(`Gift card update failed: ${giftCardError.message}`);
    }
  }
}

// Continue with regular payment methods if needed
if (total > 0) {
  if (paymentMethod === 'helcim') {
    try {
      // Initialize Helcim payment
      const helcimResponse = await initializeHelcimPayCheckout({
        formData,
        selectedCountry,
        total, // This is now the remaining amount after gift card
        subtotalsBySize,
        selectedStudio,
        // Pass gift card info for display in Helcim checkout
        giftCard: appliedGiftCard ? {
          code: appliedGiftCard.code,
          amountApplied: giftCardAmount,
          originalTotal: originalTotal
        } : null
      });

      if (!helcimResponse?.checkoutToken) {
        throw new Error('Failed to initialize Helcim payment');
      }

      // Store Helcim payment data
      orderData = {
        ...orderData,
        paymentMethod: appliedGiftCard ? 'helcim+gift_card' : 'helcim',
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
        
        // If gift card was used, update its balance on Shopify after successful Helcim payment
        if (appliedGiftCard && giftCardAmount > 0) {
          try {
            const giftCardUpdateResponse = await axios.post(
              'https://freezepix-database-server-c95d4dd2046d.herokuapp.com/api/update-gift-card',
              {
                giftCardId: appliedGiftCard.id,
                amountUsed: giftCardAmount,
                orderNumber: orderData.orderNumber
              }
            );
            
            if (giftCardUpdateResponse.data.success) {
              console.log('Gift card updated successfully after Helcim payment:', giftCardUpdateResponse.data);
              
              // Store transaction ID from Shopify response
              if (giftCardUpdateResponse.data.transaction?.id) {
                orderData.giftCard.transactionId = giftCardUpdateResponse.data.transaction.id;
              }
            } else {
              console.error('Failed to update gift card after Helcim payment:', giftCardUpdateResponse.data);
              // Log error but continue with order processing
            }
          } catch (giftCardError) {
            console.error('Gift card update error after Helcim payment:', giftCardError);
            // Log error but continue with order processing
          }
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
        
        // Comprehensive metadata - now includes gift card info
        metadata: {
          orderNumber: orderNumber,
          discountCode: discountCode || 'none',
          discount: discount || 0,
          taxAmount: taxAmount || 0,
          shippingFee: shippingFee || 0,
          totalAmount: total,
          originalAmount: originalTotal || total,
          giftCardApplied: appliedGiftCard ? appliedGiftCard.code : 'none',
          giftCardAmount: giftCardAmount || 0
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
        orderData: orderData,
        giftCardId: appliedGiftCard?.id,
        giftCardAmount: giftCardAmount || 0
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
                  orderNumber: orderData.orderNumber,
                  hasGiftCard: !!appliedGiftCard
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
        country: selectedCountry,
        hasGiftCard: !!appliedGiftCard
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

// Add this function to handle orders paid entirely with gift cards
// Add better error handling to the gift card order function
const handleGiftCardOnlyOrder = async () => {
  try {
    setIsProcessingOrder(true);
    setOrderSuccess(false);
    setError(null);
    
    // Get order calculations with gift card applied
    const { 
      subtotal, 
      taxAmount, 
      shippingFee, 
      discount, 
      total, 
      originalTotal,
      giftCardAmount 
    } = calculateTotalsWithGiftCard();
    
    // Verify gift card covers entire purchase
    if (total > 0) {
      throw new Error(t('errors.gift_card_insufficient'));
    }
    
    // Generate order number
    const orderNumber = generateOrderNumber();
    setCurrentOrderNumber(orderNumber);
    
    // Get country info
    const country = initialCountries.find(c => c.value === selectedCountry);
    
    // Process photos
    const optimizedPhotosWithPrices = await processImagesInBatches(
      selectedPhotos.map(photo => ({
        ...photo,
        price: photo.price || calculateItemPrice(photo, country)
      })),
      (progress) => {
        setUploadProgress(Math.round(progress));
      }
    );
    
    // IMPORTANT: Update gift card balance on Shopify FIRST, before creating order
    let giftCardUpdateResult = null;
    try {
      console.log('Updating gift card balance:', {
        giftCardId: appliedGiftCard.id,
        amountUsed: giftCardAmount,
        orderNumber
      });
      
      const giftCardUpdateResponse = await axios.post(
        'https://freezepix-database-server-c95d4dd2046d.herokuapp.com/api/update-gift-card',
        {
          giftCardId: appliedGiftCard.id,
          amountUsed: giftCardAmount,
          orderNumber
        }
      );
      
      console.log('Gift card update response:', giftCardUpdateResponse.data);
      
      if (!giftCardUpdateResponse.data.success) {
        throw new Error(giftCardUpdateResponse.data.error || t('errors.gift_card_update_failed'));
      }
      
      giftCardUpdateResult = giftCardUpdateResponse.data;
    } catch (giftCardError) {
      console.error('Gift card update error:', giftCardError);
      throw new Error(
        giftCardError.response?.data?.error || 
        giftCardError.message || 
        t('errors.gift_card_update_failed')
      );
    }
    
    // Construct order data
    const orderData = {
      orderNumber,
      email: formData.email,
      phone: formData.phone,
      name: formData.name || '',
      
      // Add gift card information with additional details from update response
      giftCard: {
        id: appliedGiftCard.id,
        code: appliedGiftCard.code,
        amountUsed: giftCardAmount,
        remainingBalance: giftCardUpdateResult?.remainingBalance || 0,
        transaction: giftCardUpdateResult?.transaction || null,
        currencyCode: appliedGiftCard.currencyCode
      },
      
      // Handle pickup or shipping based on delivery method
      ...(deliveryMethod === 'pickup' ? {
        pickupStudio: selectedStudio ? {
          studioId: selectedStudio._id || null,
          name: selectedStudio.name || 'Unspecified Studio',
          address: selectedStudio.address || 'Not Specified',
          city: selectedStudio.city || 'Not Specified',
          country: selectedStudio.country || selectedCountry
        } : null
      } : {
        shippingAddress: {
          firstName: formData.shippingAddress.firstName || '',
          lastName: formData.shippingAddress.lastName || '',
          address: formData.shippingAddress.address || '',
          city: formData.shippingAddress.city || '',
          postalCode: formData.shippingAddress.postalCode || '',
          country: formData.shippingAddress.country || selectedCountry,
          province: formData.shippingAddress.province || '',
          state: formData.shippingAddress.state || ''
        }
      }),
      
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
      
      totalAmount: originalTotal,
      subtotal,
      shippingFee,
      taxAmount,
      giftCardAmount,
      discount,
      discountCode: discountCode || null,
      currency: country.currency,
      orderNote: orderNote || '',
      
      paymentMethod: 'gift_card', // Set payment method to gift_card
      paymentStatus: 'paid',      // Order is already paid in full
      status: 'Processing',       // Set initial status
      
      deliveryMethod,
      customerDetails: {
        name: formData.name || '',
        email: formData.email,
        phone: formData.phone,
        country: selectedCountry
      },
      selectedCountry,
      createdAt: new Date().toISOString()
    };
    
    // Submit order with retry mechanism - reusing your existing function
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
    try {
      await sendOrderConfirmationEmail({
        ...orderData,
        orderItems: orderData.orderItems.map(item => ({
          ...item,
          file: undefined,
          thumbnail: item.thumbnail
        }))
      });
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // Continue with success flow even if email fails
    }

    // Update UI
    setOrderSuccess(true);
    setSelectedPhotos([]);
    clearStateStorage();
    console.log('Gift card order created successfully:', {
      orderNumber,
      totalItems: orderData.orderItems.length,
      giftCardAmount
    });
    
  } catch (error) {
    console.error('Gift card order error:', error);
    
    // More descriptive error message
    let errorMessage = '';
    if (error.response?.data?.error) {
      errorMessage = error.response.data.error;
      if (error.response.data.details?.message) {
        errorMessage += ': ' + error.response.data.details.message;
      }
    } else {
      errorMessage = error.message || t('errors.gift_card_order_failed');
    }
    
    setError(errorMessage);
    setOrderSuccess(false);
  } finally {
    setIsProcessingOrder(false);
    setUploadProgress(0);
  }
};

const [secretToken, setSecretToken] = useState(null);

const handleSecretTokenReceived = (token) => {
  setSecretToken(token);
};

// Replace the processPhotosWithProgress function in handleHelcimPaymentSuccess

const handleHelcimPaymentSuccess = async (paymentData) => {
  // Generate order number with verification (keep existing code)
  const generateOrderNumber = () => {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 999999).toString().padStart(6, '0');
    const prefix = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `FPX-${prefix}-${timestamp.slice(-6)}${random}`;
  };

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
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  if (!isUnique) {
    throw new Error('Failed to generate unique order number after multiple attempts');
  }
  setCurrentOrderNumber(orderNumber);

  const country = initialCountries.find(c => c.value === selectedCountry);

  // IMPROVED PHOTO PROCESSING FOR CANADA
  const processPhotosWithProgress = async () => {
    try {
      console.log('Starting photo processing for Canada...');
      
      // Canada-specific processing settings
      const isCanada = selectedCountry === 'CA' || selectedCountry === 'CAN';
      
      const optimizedPhotosWithPrices = await Promise.all(
        selectedPhotos.map(async (photo, index) => {
          try {
            const progress = ((index + 1) / selectedPhotos.length) * 30; // 30% for processing
            setUploadProgress(Math.round(progress));
            
            console.log(`Processing photo ${index + 1}/${selectedPhotos.length} for Canada`);
            
            let imageData;
            
            if (photo.base64) {
              // Already base64, use as-is
              imageData = photo.base64;
              console.log(`Photo ${index + 1}: Using existing base64 data`);
            } else if (photo.file) {
              // Need to process the file
              console.log(`Photo ${index + 1}: Processing file for Canada`);
              
              // Canada-optimized compression settings
              const compressionOptions = isCanada ? {
                maxSizeMB: 1.2,        // Larger file size for better quality
                maxWidthOrHeight: 1200, // Higher resolution for Canada
                useWebWorker: true,
                fileType: 'image/jpeg',
                initialQuality: 0.75,   // Higher quality for Canada
                alwaysKeepResolution: false
              } : {
                maxSizeMB: 1.0,
                maxWidthOrHeight: 1200,
                useWebWorker: true,
                fileType: 'image/jpeg',
                initialQuality: 0.75,
                alwaysKeepResolution: false
              };
              
              try {
                // Compress with retry logic for Canada
                let compressedFile;
                let compressionAttempts = 0;
                const maxCompressionAttempts = 3;
                
                while (compressionAttempts < maxCompressionAttempts) {
                  try {
                    compressedFile = await imageCompression(photo.file, compressionOptions);
                    console.log(`Photo ${index + 1}: Compression successful on attempt ${compressionAttempts + 1}`);
                    break;
                  } catch (compressionError) {
                    compressionAttempts++;
                    console.warn(`Photo ${index + 1}: Compression attempt ${compressionAttempts} failed:`, compressionError);
                    
                    if (compressionAttempts === maxCompressionAttempts) {
                      // Use original file if compression fails
                      console.log(`Photo ${index + 1}: Using original file after compression failures`);
                      compressedFile = photo.file;
                    } else {
                      // Reduce quality for retry
                      compressionOptions.initialQuality = Math.max(0.5, compressionOptions.initialQuality - 0.1);
                      compressionOptions.maxSizeMB = Math.min(compressionOptions.maxSizeMB + 0.5, 3.0);
                    }
                  }
                }
                
                // Convert to base64
                imageData = await convertImageToBase64(compressedFile);
                console.log(`Photo ${index + 1}: Successfully converted to base64`);
                
              } catch (processingError) {
                console.error(`Photo ${index + 1}: Processing failed, using original:`, processingError);
                // Fallback: try to use original file
                imageData = await convertImageToBase64(photo.file);
              }
            } else {
              throw new Error(`Photo ${index + 1}: No valid image data found`);
            }

            const processedPhoto = {
              ...photo,
              file: imageData,
              price: photo.price || calculateItemPrice(photo, country),
              productType: photo.productType || 'photo_print',
              size: photo.size || '4x6',
              quantity: photo.quantity || 1
            };
            
            console.log(`Photo ${index + 1}: Processing completed successfully`);
            return processedPhoto;
            
          } catch (photoError) {
            console.error(`Error processing photo ${index + 1}:`, photoError);
            // Don't throw error for individual photo, continue with others
            return {
              ...photo,
              file: photo.base64 || null, // Use existing base64 if available
              price: photo.price || calculateItemPrice(photo, country),
              productType: photo.productType || 'photo_print',
              size: photo.size || '4x6',
              quantity: photo.quantity || 1,
              processingError: true
            };
          }
        })
      );
      
      // Filter out photos that failed completely
      const validPhotos = optimizedPhotosWithPrices.filter(photo => photo.file !== null);
      
      if (validPhotos.length === 0) {
        throw new Error('No photos could be processed successfully');
      }
      
      if (validPhotos.length < selectedPhotos.length) {
        console.warn(`Warning: Only ${validPhotos.length} out of ${selectedPhotos.length} photos processed successfully`);
      }
      
      console.log(`Canada photo processing completed: ${validPhotos.length} photos ready`);
      return validPhotos;
      
    } catch (processError) {
      console.error('Canada photo processing error:', processError);
      throw new Error(`Photo processing failed: ${processError.message}`);
    }
  };

  const optimizedPhotosWithPrices = await processPhotosWithProgress();
  const { taxAmount, shippingFee } = calculateTotals();

  try {
    console.log('Payment Success Handler - Processing payment for Canada:', paymentData);
    setIsProcessingOrder(true);
    
      // ========== CAPTURE SOURCE URL ==========
      const sourceVisitUrl = captureSourceUrl();
      console.log('Captured source visit URL:', sourceVisitUrl);

    const orderData = {
      orderNumber,
      email: formData.email,
      phone: formData.phone,
      name: formData.name || '',

       // ========== ADD SOURCE URL TO ORDER DATA ==========
       sourceVisitUrl: sourceVisitUrl, // Add this line
      
      // Robust handling of pickup studio for pickup orders
      ...(deliveryMethod === 'pickup' ? {
        pickupStudio: selectedStudio ? {
          studioId: selectedStudio._id || null,
          name: selectedStudio.name || 'Unspecified Studio',
          address: selectedStudio.address || 'Not Specified',
          city: selectedStudio.city || 'Not Specified',
          country: selectedStudio.country || selectedCountry
        } : {
          studioId: null,
          name: 'Unspecified Studio',
          address: 'Not Specified',
          city: 'Not Specified',
          country: selectedCountry
        }
      } : {}),
      
      // Robust handling of shipping address for shipping orders
      ...(deliveryMethod === 'shipping' ? {
        shippingAddress: {
          firstName: formData.shippingAddress.firstName || formData.billingAddress.firstName || '',
          lastName: formData.shippingAddress.lastName || formData.billingAddress.lastName || '',
          address: formData.shippingAddress.address || formData.billingAddress.address || '',
          city: formData.shippingAddress.city || formData.billingAddress.city || '',
          postalCode: formData.shippingAddress.postalCode || formData.billingAddress.postalCode || '',
          country: formData.shippingAddress.country || formData.billingAddress.country || selectedCountry,
          province: formData.shippingAddress.province || formData.billingAddress.province || '',
          state: formData.shippingAddress.state || formData.billingAddress.state || ''
        }
      } : {}),
      
      // Fallback to billing address if no specific shipping address
      billingAddress: {
        firstName: formData.billingAddress.firstName || '',
        lastName: formData.billingAddress.lastName || '',
        address: formData.billingAddress.address || '',
        city: formData.billingAddress.city || '',
        postalCode: formData.billingAddress.postalCode || '',
        country: formData.billingAddress.country || selectedCountry,
        province: formData.billingAddress.province || '',
        state: formData.billingAddress.state || ''
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
      
      totalAmount: Number(paymentData.amount) || 0,
      subtotal: Number(paymentData.amount) || 0,
      shippingFee: Number(shippingFee) || 0,
      taxAmount: Number(taxAmount) || 0,
      discount: calculateTotals().discount || 0,
      discountCode: discountCode || null,
      discountAmount: calculateTotals().discount || 0,
      discountDetails: discountCode ? availableDiscounts.find(
        rule => rule.title.toUpperCase() === discountCode.toUpperCase()
      ) : null,
      currency: paymentData.currency,
      orderNote: "",
      paymentMethod: "helcim",
      deliveryMethod: deliveryMethod || 'pickup',
      customerDetails: {
        name: formData.name || '',
        email: formData.email,
        phone: formData.phone,
        country: selectedCountry
      },
      selectedCountry,
      createdAt: new Date().toISOString()
    };

    // Add timestamp to ensure uniqueness
    orderData.createdAt = new Date().toISOString();

    console.log('Submitting Canada order with data:', orderData);

    // CANADA-SPECIFIC ORDER SUBMISSION with better error handling
    const maxRetries = 3;
    let retryCount = 0;
    let orderSubmitted = false;

    while (retryCount < maxRetries && !orderSubmitted) {
      try {
        console.log(`Canada order submission attempt ${retryCount + 1}/${maxRetries}`);
        
        // Use optimized chunking specifically for Canada
        let orderResponse;
        
        if (selectedCountry === 'CA' || selectedCountry === 'CAN') {
          // Canada-specific submission
          orderResponse = await submitCanadaOrderOptimized(orderData);
        } else {
          // Regular submission
          orderResponse = await submitOrderWithOptimizedChunking(orderData);
        }
        
        if (orderResponse && orderResponse.length > 0) {
          orderSubmitted = true;
          console.log('Canada order submitted successfully:', orderResponse);
          
          // Send confirmation email
          try {
            await sendOrderConfirmationEmail({
              ...orderData,
              paymentDetails: {
                ...orderData.paymentDetails,
                cardLastFour: paymentData.cardNumber?.slice(-4)
              }
            });
            console.log('Canada confirmation email sent successfully');
          } catch (emailError) {
            console.error('Failed to send Canada confirmation email:', emailError);
            // Continue with success flow even if email fails
          }

          // Update UI state
          setOrderSuccess(true);
          setSelectedPhotos([]);
          setError(null);
          
          // Clear session storage
          clearStateStorage();
          break;
        }
        throw new Error('Canada order submission failed - empty response');
      } catch (error) {
        console.error(`Canada order submission attempt ${retryCount + 1} failed:`, error);
        retryCount++;
        if (retryCount === maxRetries) {
          throw new Error(`Canada order submission failed after ${maxRetries} attempts: ${error.message}`);
        }
        await new Promise(resolve => setTimeout(resolve, 2000 * Math.pow(2, retryCount)));
      }
    }
  } catch (error) {
    console.error('Canada payment processing error:', error);
    setError(`Payment processing failed for Canada: ${error.message}`);
    setOrderSuccess(false);
  } finally {
    setIsProcessingOrder(false);
  }
};

// ADD this new Canada-specific order submission function
const submitCanadaOrderOptimized = async (orderData) => {
  try {
    const { orderItems } = orderData;
    
    // Canada-optimized settings
    const CANADA_CHUNK_SIZE = 15; // Smaller chunks for Canada
    const CANADA_TIMEOUT = 160000; // 2 minutes timeout
    
    const baseOrderData = {
      ...orderData,
      shippingFee: orderData.shippingFee || 0,
      shippingMethod: orderData.deliveryMethod === 'shipping' ? 'shipping' : 'local_pickup',
      deliveryMethod: orderData.deliveryMethod || 'pickup',
      status: 'Processing',
      paymentMethod: 'helcim',
      paymentStatus: 'paid',
      canadaOptimized: true, // Flag for server
      ...(orderData.deliveryMethod !== 'shipping' && orderData.pickupStudio 
        ? { pickupStudio: orderData.pickupStudio } 
        : { pickupStudio: null })
    };

    // Split into Canada-optimized chunks
    const chunks = [];
    for (let i = 0; i < orderItems.length; i += CANADA_CHUNK_SIZE) {
      chunks.push(orderItems.slice(i, i + CANADA_CHUNK_SIZE));
    }

    console.log(`Canada: Submitting order in ${chunks.length} chunks of ${CANADA_CHUNK_SIZE} items each`);

    const results = [];
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const chunkProgress = 40 + ((i + 1) / chunks.length) * 50; // Remaining 50% for upload
      setUploadProgress(Math.round(chunkProgress));

      let retryCount = 0;
      const maxRetries = 2;

      while (retryCount <= maxRetries) {
        try {
          console.log(`Canada: Uploading chunk ${i + 1}/${chunks.length}, attempt ${retryCount + 1}`);
          
          const response = await axios.post(
            'https://freezepix-database-server-c95d4dd2046d.herokuapp.com/api/orders/chunk',
            {
              ...baseOrderData,
              orderItems: chunk
            },
            {
              withCredentials: true,
              timeout: CANADA_TIMEOUT,
              headers: {
                'Content-Type': 'application/json'
              }
            }
          );

          results.push(response.data);
          console.log(`Canada: Chunk ${i + 1} uploaded successfully`);
          
          // Delay between chunks for Canada
          if (i < chunks.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
          
          break; // Success, exit retry loop
          
        } catch (error) {
          retryCount++;
          console.error(`Canada: Chunk ${i + 1} attempt ${retryCount} failed:`, error.message);
          
          if (retryCount <= maxRetries) {
            const backoffDelay = 2000 * Math.pow(2, retryCount - 1);
            console.log(`Canada: Retrying chunk ${i + 1} after ${backoffDelay}ms delay...`);
            await new Promise(resolve => setTimeout(resolve, backoffDelay));
          } else {
            throw new Error(`Canada: Failed to upload chunk ${i + 1} after ${maxRetries + 1} attempts: ${error.message}`);
          }
        }
      }
    }

    if (results.length !== chunks.length) {
      throw new Error(`Canada: Upload incomplete: ${results.length}/${chunks.length} chunks uploaded`);
    }

    console.log(`Canada: Order upload completed successfully: ${results.length} chunks uploaded`);
    return results;
    
  } catch (error) {
    console.error('Canada order submission error:', error);
    throw error;
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
  if (!discountCode || availableDiscounts.length === 0) {
    return '';
  }
  
  const discountRule = availableDiscounts.find(
    discount => discount.title && discount.title.toUpperCase() === discountCode.toUpperCase()
  );

  if (!discountRule) {
    return '';
  }

  // Make sure to use valueType (not value_type) to match API response
  const valueType = discountRule.valueType;
  const value = discountRule.value;

  if (valueType === 'percentage') {
    return `${Math.abs(parseFloat(value))}%`;  // Display as percentage
  } else {
    return `${Math.abs(parseFloat(value))} ${country?.currency}`;  // Display as fixed amount
  }
}

const initializeDiscounts = async () => {
  if (availableDiscounts.length === 0) {
    setIsLoading(true);
    try {
      const priceRules = await fetchShopifyPriceRules();
      
      const activeDiscounts = priceRules.map(rule => ({
        code: rule.title,
        isActive: rule.status === 'active',
        valueType: rule.value_type === 'percentage' ? 'percentage' : 'fixed_amount',
        value: Math.abs(parseFloat(rule.value)),
        startDate: rule.starts_at,
        endDate: rule.ends_at
      })).filter(discount => {
        const now = new Date();
        const startDate = new Date(discount.startDate);
        const endDate = discount.endDate ? new Date(discount.endDate) : null;
        
        return discount.isActive && 
               (!endDate || endDate > now) && 
               startDate <= now;
      });
      
      setAvailableDiscounts(activeDiscounts);
      
      // Log available discounts for debugging
      console.log('Available discount codes:', activeDiscounts);
    } catch (error) {
      console.error('Error initializing discounts:', error);
    } finally {
      setIsLoading(false);
    }
  }
};
    
// Updated handleDiscountCode function that fixes the "discountRule is not defined" error
const handleDiscountCode = (value) => {
  const upperValue = value.toUpperCase();
  setDiscountCode(upperValue);
  
  // Clear discount error if empty code
  if (!upperValue) {
    setDiscountError('');
    return;
  }
  
  setIsLoading(true);
  
  // Fetch price rules and validate
  fetchShopifyPriceRules()
    .then(priceRules => {
      console.log('Fetched price rules:', priceRules);
      
      // Update available discounts
      setAvailableDiscounts(priceRules);
      
      // Find matching rule
      const matchingRule = priceRules.find(
        rule => rule.title && rule.title.toUpperCase() === upperValue
      );
      
      // If no matching rule found
      if (!matchingRule) {
        console.log('No matching discount found for:', upperValue);
        setDiscountError('Invalid discount code');
        setIsLoading(false);
        return;
      }
      
      console.log('Found discount rule:', matchingRule);
      
      // Now validate the dates on the matching rule
      const now = new Date();
      const startDate = safelyParseDate(matchingRule.startsAt || matchingRule.starts_at);
      const endDate = safelyParseDate(matchingRule.endsAt || matchingRule.ends_at);
      
      // Check if the discount is active based on dates
      if (startDate && !isNaN(startDate.getTime()) && now < startDate) {
        setDiscountError('This discount code is not active yet');
        setIsLoading(false);
        return;
      }
      
      // Check end date validation
      if (endDate) {
        if (!isNaN(endDate.getTime()) && now > endDate) {
          setDiscountError('This discount code has expired');
          setIsLoading(false);
          return;
        }
      }
      
      // If we made it here, the discount is valid
      console.log('Discount code is valid:', upperValue);
      setDiscountError('');
      setIsLoading(false);
    })
    .catch(error => {
      console.error('Error validating discount code:', error);
      setDiscountError('Unable to validate discount code');
      setIsLoading(false);
    });
};




// Add this helper function
const safelyParseDate = (dateString) => {
  if (!dateString) return null;
  
  try {
    const parsedDate = new Date(dateString);
    // Check if date is valid
    if (isNaN(parsedDate.getTime())) {
      console.error('Invalid date:', dateString);
      return null;
    }
    return parsedDate;
  } catch (error) {
    console.error('Error parsing date:', dateString, error);
    return null;
  }
};


const isDiscountApplicable = (code) => {
  if (!code || availableDiscounts.length === 0) return false;
  
  const upperCode = code.toUpperCase();
  const discountRule = availableDiscounts.find(discount => 
    discount.title.toUpperCase() === upperCode
  );
  
  if (!discountRule) return false;
  
  const now = new Date();
  const startDate = new Date(discountRule.starts_at);
  const endDate = discountRule.ends_at ? new Date(discountRule.ends_at) : null;
  
  return discountRule.status === 'active' && 
         now >= startDate && 
         (!endDate || now <= endDate);
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
  
    // FIRST: Count all quantities by size/product type
    selectedPhotos.forEach(photo => {
      if (photo.productType === 'photo_print') {
        quantities[photo.size] += photo.quantity || 1;
      } else if (photo.productType === '3d_frame') {
        quantities['3d_frame'] += photo.quantity || 1;
      } else if (photo.productType === 'keychain') {
        quantities['keychain'] += photo.quantity || 1;
      } else if (photo.productType === 'keyring_magnet') {
        quantities['keyring_magnet'] += photo.quantity || 1;
      }
    });
    
    // SECOND: Calculate subtotals using total quantities for pricing tiers
    selectedPhotos.forEach(photo => {
      if (photo.productType === 'photo_print') {
        if (selectedCountry === 'TUN' || selectedCountry === 'TN') {
          // For Tunisia: use total quantity for this size to determine price tier
          const totalQuantityForSize = quantities[photo.size];
          const pricePerUnit = getTunisiaPricing(photo.size, totalQuantityForSize);
          subtotalsBySize[photo.size] += (photo.quantity || 1) * pricePerUnit;
        } else {
          // For other countries: use fixed pricing
          if (photo.size === '4x6') {
            subtotalsBySize[photo.size] += (photo.quantity || 1) * country.size4x6;
          } else if (photo.size === '5x7') {
            subtotalsBySize[photo.size] += (photo.quantity || 1) * country.size5x7;
          } else if (photo.size === '8x10') {
            subtotalsBySize[photo.size] += (photo.quantity || 1) * country.size8x10;
          } else if (photo.size === '4x4') {
            subtotalsBySize[photo.size] += (photo.quantity || 1) * country.size4x4;
          }
        }
      } else if (photo.productType === '3d_frame') {
        subtotalsBySize['3d_frame'] += (photo.quantity || 1) * country.crystal3d;
      } else if (photo.productType === 'keychain') {
        subtotalsBySize['keychain'] += (photo.quantity || 1) * country.keychain;
      } else if (photo.productType === 'keyring_magnet') {
        subtotalsBySize['keyring_magnet'] += (photo.quantity || 1) * country.keyring_magnet;
      }
    });
  
    const subtotal = Object.values(subtotalsBySize).reduce((acc, curr) => acc + curr, 0);
    
    // Calculate shipping fee based on country and delivery method
    let shippingFee = 8;
    const isTunisiaFreeShipping = subtotal >= 25;
    const isOtherCountriesFreeShipping = subtotal >= 50;
    
    if (deliveryMethod === 'shipping') {
      if (selectedCountry === 'TUN' || selectedCountry === 'TN') {
        if (isTunisiaFreeShipping) {
          shippingFee = 8;
        } else {
          shippingFee = 8;
        }
      } else {
        if (isOtherCountriesFreeShipping) {
          shippingFee = 0;
        } else {
          // Apply shipping fees based on country
          if (selectedCountry === 'USA' || selectedCountry === 'US') {
            shippingFee = 15;
          } else if (selectedCountry === 'CAN' || selectedCountry === 'CA') {
            shippingFee = 15;
          } else if (selectedCountry === 'GBR' || selectedCountry === 'GB') {
            shippingFee = 20;
          } else if (['DEU', 'FRA', 'ITA', 'ESP', 'DE', 'FR', 'IT', 'ES'].includes(selectedCountry)) {
            shippingFee = 20;
          } else if (['AUS', 'AU'].includes(selectedCountry)) {
            shippingFee = 25;
          } else if (['JPN', 'JP'].includes(selectedCountry)) {
            shippingFee = 2500;
          } else if (['SGP', 'SG'].includes(selectedCountry)) {
            shippingFee = 20;
          } else if (['AE', 'ARE'].includes(selectedCountry)) {
            shippingFee = 25;
          } else if (['SA', 'SAU'].includes(selectedCountry)) {
            shippingFee = 30;
          } else if (['BR', 'BRA'].includes(selectedCountry)) {
            shippingFee = 35;
          } else if (['MX', 'MEX'].includes(selectedCountry)) {
            shippingFee = 200;
          } else if (['RU', 'RUS'].includes(selectedCountry)) {
            shippingFee = 800;
          } else if (['CN', 'CHN'].includes(selectedCountry)) {
            shippingFee = 60;
          } else {
            shippingFee = 25;
          }
        }
      }
    }
  
    const preDiscountTotal = subtotal + shippingFee;
    
    // Calculate discount
    let discount = 0;
    if (discountCode && availableDiscounts.length > 0) {
      const discountRule = availableDiscounts.find(
        rule => rule.title && rule.title.toUpperCase() === discountCode.toUpperCase()
      );
      
      if (discountRule) {
        const valueType = discountRule.valueType || discountRule.value_type;
        const value = discountRule.value;
        
        if (valueType === 'percentage') {
          const percentageValue = Math.abs(parseFloat(value)) / 100;
          discount = preDiscountTotal * percentageValue;
        } else if (valueType === 'fixed_amount') {
          discount = Math.abs(parseFloat(value));
        }
      }
    }
  
    const taxableAmount = preDiscountTotal - discount;
    
    // Calculate tax
    let taxAmount = 0;
    let appliedProvince = null;
    let appliedTaxRates = null;
  
    if (selectedCountry === 'TUN' || selectedCountry === 'TN') {
      taxAmount = 0; // No tax for Tunisia
    } else if (selectedCountry === 'CAN' || selectedCountry === 'CA') {
      let province;
      
      if (deliveryMethod === 'pickup') {
        province = detectCanadianProvince(selectedStudio);
      } else {
        province = formData.shippingAddress.province;
      }
      
      if (province && TAX_RATES['CA'][province]) {
        appliedProvince = province;
        appliedTaxRates = TAX_RATES['CA'][province];
        
        if (appliedTaxRates.HST) {
          taxAmount = taxableAmount * (appliedTaxRates.HST / 100);
        } else {
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
        taxAmount = taxableAmount * 0.05; // 5% GST default
      }
    } else if (TAX_RATES[selectedCountry] && TAX_RATES[selectedCountry].default) {
      taxAmount = taxableAmount * (TAX_RATES[selectedCountry].default / 100);
    }
  
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
      appliedTaxRates,
      discountDetails: discountCode ? availableDiscounts.find(
        rule => rule.title.toUpperCase() === discountCode.toUpperCase()
      ) : null
    };
  };

const calculateTotalsWithGiftCard = () => {
  const country = initialCountries.find(c => c.value === selectedCountry);
  // Keep existing calculation code
  const { 
    subtotalsBySize, 
    subtotal, 
    shippingFee, 
    total: originalTotal, 
    quantities, 
    discount, 
    taxAmount, 
    preDiscountTotal,
    appliedProvince, 
    appliedTaxRates 
  } = calculateTotals();

  // Calculate gift card application
  let giftCardAmount = 0;
  let remainingBalance = 0;
  let finalTotal = originalTotal;

  if (appliedGiftCard) {
    giftCardAmount = Math.min(appliedGiftCard.balance, originalTotal);
    finalTotal = Math.max(0, originalTotal - giftCardAmount);
    remainingBalance = appliedGiftCard.balance - giftCardAmount;
  }

  return {
    subtotalsBySize,
    subtotal,
    taxAmount,
    shippingFee,
    total: finalTotal,
    originalTotal,
    quantities,
    discount,
    preDiscountTotal,
    appliedProvince,
    appliedTaxRates,
    giftCardAmount,
    remainingGiftCardBalance: remainingBalance,
    paymentMethod: finalTotal === 0 ? 'gift_card' : 'helcim+gift_card'
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
                   <SizeSelector 
    photo={photo}
    onSizeChange={updatePhotoSize}
    selectedCountry={selectedCountry}
  />
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
                  type="text"
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
                      
                 
                      {/* Payment Method for Pickup - FIXED FOR TUNISIA */}
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
                                <p className="font-medium">{t('payment.credit_card') || 'Credit Card'}</p>
                                <p className="text-sm text-gray-600">{t('payment.credit_pickup_description') || 'Pay securely with your credit card'}</p>
                              </div>
                            </label>
                          </div>
                        </div>
                      )}

                      {/* FOR TUNISIA - Show COD notice instead */}
                      {(selectedCountry === 'TUN' || selectedCountry === 'TN') && (
                        <div className="mt-4 border-t pt-4">
                          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <div className="flex items-center gap-2">
                              <Package size={20} className="text-yellow-600" />
                              <div>
                                <p className="font-medium text-yellow-800">
                                  {t('payment.cash_on_delivery') || 'Cash on Delivery'}
                                </p>
                                <p className="text-sm text-yellow-700">
                                  {t('payment.cod_description') || 'Pay when you receive your order'}
                                </p>
                              </div>
                            </div>
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
                  {(selectedCountry !== 'TUN' && selectedCountry !== 'TN') && (
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
                                        )}

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

// render photo prints invoice

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
    appliedTaxRates,
    discountDetails,
    giftCardAmount = 0,
    originalTotal
  } = appliedGiftCard ? calculateTotalsWithGiftCard() : calculateTotals();
  const country = initialCountries.find(c => c.value === selectedCountry);
  
  const getPricingTierLabel = (quantity) => {
    if (quantity <= 4) return t('order.qty_1_4');
    if (quantity <= 24) return t('order.qty_5_24');
    if (quantity <= 49) return t('order.qty_25_49');
    if (quantity <= 74) return t('order.qty_50_74');
    return t('order.qty_75_plus');
  }; 
  
  return (
    <div className="space-y-6">
      {/* Discount Code Section + gift cards */}
      <div className="border rounded-lg p-4">
        
        {/* Tabs for Discount and Gift Card */}
        <div className="flex border-b mb-4">
          <button 
            className={`px-4 py-2 ${activePaymentTab === 'discount' ? 'border-b-2 border-yellow-400 font-medium' : 'text-gray-500'}`}
            onClick={() => setActivePaymentTab('discount')}
          >
            {t('order.discount_code')}
          </button>
        </div>
        
        {/* Discount Code Form */}
        {activePaymentTab === 'discount' && (
          <div className="space-y-4">
            {/* Discount Code Input */}
            <div className="space-y-2">
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder=""
                  value={discountCode}
                  onChange={(e) => handleDiscountCode(e.target.value.toUpperCase())}
                  className={`w-full p-2 border rounded ${discountError ? 'border-red-500' : ''}`}
                />
                {isLoading && (
                  <div className="flex items-center px-2">
                    <Loader size={20} className="animate-spin text-yellow-400" />
                  </div>
                )}
              </div>
              {discountError && (
                <p className="text-red-500 text-sm">{discountError}</p>
              )}
              {discountCode && !discountError && discount > 0 && (
                <p className="text-green-500 text-sm">
                  {t('order.discount_applied')}: {getDiscountDisplay()}
                </p>
              )}
            </div>

            {/* Discount Link Generator when discount is successfully applied */}
            {discountCode && !discountError && discount > 0 && (
              <DiscountLinkGenerator
                discountCode={discountCode}
                discountDetails={availableDiscounts.find(
                  rule => rule.title && rule.title.toUpperCase() === discountCode.toUpperCase()
                )}
                selectedStudio={selectedStudio}
                baseUrl={window.location.origin}
              />
            )}
          </div>
        )}
        
        {/* Gift Card Form */}
        {activePaymentTab === 'giftcard' && (
          <GiftCardInput
            onGiftCardApplied={handleGiftCardApplied}
            onGiftCardRemoved={handleGiftCardRemoved}
            isLoading={false}
            error={giftCardError}
            setError={setGiftCardError}
            appliedGiftCard={appliedGiftCard}
          />
        )}
      </div>
        
      {/* Order Summary */}
      <div className="border rounded-lg p-4">
        <h3 className="font-medium mb-3">{t('order.summary')}</h3>
        
        {/* Photo Prints */}
        {selectedCountry === 'TUN' || selectedCountry === 'TN' ? (
          <>
            {quantities['10x15'] > 0 && (
              <div className="space-y-1 border-b pb-3 mb-3">
                <div className="flex justify-between">
                  <div className="flex flex-col">
                    <span className="font-medium">{t('products.10x15_photos')}</span>
                    <span className="text-sm text-gray-600">
                      {quantities['10x15']} {t('order.units')} • {getPricingTierLabel(quantities['10x15'])}
                    </span>
                    <span className="text-sm text-blue-600">
                      {getTunisiaPricing('10x15', quantities['10x15']).toFixed(2)} TND {t('order.per_photo')}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{subtotalsBySize['10x15'].toFixed(2)} {country?.currency}</div>
                    <div className="text-sm text-gray-500">
                      {quantities['10x15']} × {getTunisiaPricing('10x15', quantities['10x15']).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {quantities['15x22'] > 0 && (
              <div className="space-y-1 border-b pb-3 mb-3">
                <div className="flex justify-between">
                  <div className="flex flex-col">
                    <span className="font-medium">{t('products.15x23_photos')}</span>
                    <span className="text-sm text-gray-600">
                      {quantities['15x22']} {t('order.units')} • {getPricingTierLabel(quantities['15x22'])}
                    </span>
                    <span className="text-sm text-blue-600">
                      {getTunisiaPricing('15x22', quantities['15x22']).toFixed(2)} TND {t('order.per_photo')}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{subtotalsBySize['15x22'].toFixed(2)} {country?.currency}</div>
                    <div className="text-sm text-gray-500">
                      {quantities['15x22']} × {getTunisiaPricing('15x22', quantities['15x22']).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {quantities['3.5x4.5'] > 0 && (
              <div className="flex justify-between py-2 border-b">
                <div className="flex flex-col">
                  <span className="font-medium">{t('products.35x45_photos')}</span>
                  <span className="text-sm text-gray-600">{quantities['3.5x4.5']} {t('order.units')}</span>
                </div>
                <div className="text-right">
                  <div className="font-medium">{subtotalsBySize['3.5x4.5'].toFixed(2)} {country?.currency}</div>
                  <div className="text-sm text-gray-500">
                    {quantities['3.5x4.5']} × {country?.size35x45?.toFixed(2) || '1.25'}
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            {quantities['4x6'] > 0 && (
              <div className="flex justify-between py-2">
                <span>{t('products.4x6_photos')} ({quantities['4x6']} × {country?.size4x6.toFixed(2)} {country?.currency})</span>
                <span>{subtotalsBySize['4x6'].toFixed(2)} {country?.currency}</span>
              </div>
            )}
            {quantities['5x7'] > 0 && (
              <div className="flex justify-between py-2">
                <span>{t('products.5x7_photos')} ({quantities['5x7']} × {country?.size5x7.toFixed(2)} {country?.currency})</span>
                <span>{subtotalsBySize['5x7'].toFixed(2)} {country?.currency}</span>
              </div>
            )}
            {(selectedCountry !== 'TN' && selectedCountry !== 'TUN') && quantities['8x10'] > 0 && (
              <div className="flex justify-between py-2">
                <span>{t('products.8x10_photos')} ({quantities['8x10']} × {country?.size8x10.toFixed(2)} {country?.currency})</span>
                <span>{subtotalsBySize['8x10'].toFixed(2)} {country?.currency}</span>
              </div>
            )}
            {(selectedCountry !== 'TN' && selectedCountry !== 'TUN') && quantities['4x4'] > 0 && (
              <div className="flex justify-between py-2">
                <span>{t('products.4x4_photos')} ({quantities['4x4']} × {country?.size4x4.toFixed(2)} {country?.currency})</span>
                <span>{subtotalsBySize['4x4'].toFixed(2)} {country?.currency}</span>
              </div>
            )}
          </>
        )}

        {/* 3D Frame Items */}
        {quantities['3d_frame'] > 0 && (
          <div className="flex justify-between py-2">
            <span>{t('products.3d_crystal_frame')} ({quantities['3d_frame']} × {country?.crystal3d.toFixed(2)} {country?.currency})</span>
            <span>{subtotalsBySize['3d_frame'].toFixed(2)} {country?.currency}</span>
          </div>
        )}

        {/* Keychain Items */}
        {quantities['keychain'] > 0 && (
          <div className="flex justify-between py-2">
            <span>{t('products.keychains')} ({quantities['keychain']} × {country?.keychain.toFixed(2)} {country?.currency})</span>
            <span>{subtotalsBySize['keychain'].toFixed(2)} {country?.currency}</span>
          </div>
        )}

        {/* Keyring/Magnet Items */}
        {quantities['keyring_magnet'] > 0 && (
          <div className="flex justify-between py-2">
            <span>{t('products.keyring_magnets')} ({quantities['keyring_magnet']} × {country?.keyring_magnet.toFixed(2)} {country?.currency})</span>
            <span>{subtotalsBySize['keyring_magnet'].toFixed(2)} {country?.currency}</span>
          </div>
        )}

        {/* Subtotal */}
        <div className="flex justify-between py-2 border-t mt-3">
          <span>{t('produits.subtotal')}</span>
          <span>{subtotal.toFixed(2)} {country?.currency}</span>
        </div>

        {/* Shipping Fee */}
        <div className="flex justify-between py-2">
          <span>{deliveryMethod === 'pickup' ? t('order.pickup_fee') : t('order.shipping_fee')}</span>
          <span>{shippingFee.toFixed(2)} {country?.currency}</span>
        </div>
        
        {/* Discount - Now positioned AFTER subtotal and shipping */}
        {discount > 0 && discountDetails && (
          <div className="flex justify-between py-2 text-green-600">
            <span>
              {t('order.discount')} (
              {discountDetails.valueType === 'percentage' || discountDetails.value_type === 'percentage'
                ? `${Math.abs(parseFloat(discountDetails.value))}%` 
                : `${Math.abs(parseFloat(discountDetails.value))} ${country?.currency}`
              })
              {discountDetails.title && ` - ${discountDetails.title}`}
            </span>
            <span>
              -{Math.abs(discount).toFixed(2)} {country?.currency}
            </span>
          </div>
        )}

        {/* Enhanced Canada tax - using our improved detection */}
        {(selectedCountry === 'CAN' || selectedCountry === 'CA') && (
          <div className="flex justify-between py-2">
            <div className="flex flex-col">
              <span>{t('order.tax')}{appliedProvince ? ` (${appliedProvince})` : ''}</span>
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
                    return 'GST (5%)';
                  } else {
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
            <span>{t('order.tax')} ({TAX_RATES[selectedCountry].default}%)</span>
            <span>{taxAmount.toFixed(2)} {country?.currency}</span>
          </div>
        )}

        {/* Gift Card Section */}
        {appliedGiftCard && giftCardAmount > 0 && (
          <div className="flex justify-between py-2 text-emerald-600">
            <span>
              {t('order.gift_card')} ({appliedGiftCard.code})
            </span>
            <span>
              -{giftCardAmount.toFixed(2)} {country?.currency}
            </span>
          </div>
        )}

        {/* Final Total */}
        <div className="flex justify-between py-2 border-t font-bold text-lg">
          <span>
            {t('produits.total')}
            {(selectedCountry === 'TUN' || selectedCountry === 'TN') && ' TTC'}
          </span>
          <span>{total.toFixed(2)} {country?.currency}</span>
        </div>

        {/* Payment Method Indicator */}
        {total === 0 && appliedGiftCard && (
          <div className="mt-2 p-2 bg-emerald-50 text-emerald-700 rounded text-sm">
            {t('order.fully_paid_gift_card')}
          </div>
        )}

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
const validatePaymentForm = () => {
  // Always validate basic contact information
  if (!formData.email || !formData.phone || !formData.name) {
    return false;
  }
  
  // If delivery method is pickup, we need a selected studio
  if (deliveryMethod === 'pickup') {
    return selectedStudio !== null;
  } 
  // If delivery method is shipping, validate shipping address
  else if (deliveryMethod === 'shipping') {
    const addr = formData.shippingAddress;
    const isShippingValid = addr.firstName && 
                          addr.lastName && 
                          addr.address && 
                          addr.city && 
                          addr.postalCode;
    
    // Additional validation for US/Canada
    if (selectedCountry === 'US' || selectedCountry === 'USA') {
      return isShippingValid && addr.state;
    } else if (selectedCountry === 'CA' || selectedCountry === 'CAN') {
      return isShippingValid && addr.province;
    }
    
    return isShippingValid;
  }
  
  return false;
};

const validateStep = () => {
  switch (activeStep) {
    case 0: // Photo Upload step
      return selectedPhotos.length > 0;
      
    case 1: // Delivery & Review step
      // For step navigation, we should use the same validation as the payment button
      // This ensures consistency between the "Next" button and the Helcim payment button
      return validatePaymentForm();

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
      
     {/* Shipping Progress Bar */}
{/* Product Pricing Table - Sticky only on step 0 (upload images) */}
{selectedPhotos.length > 0 && selectedCountry === 'TN' && (
  <div className={`
    ${activeStep === 0 ? 'sticky top-0 z-40 bg-white shadow-sm border-b' : ''}
    mb-6 py-3 transition-all duration-200
  `}>
    <div className="max-w-4xl mx-auto px-4">
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
          Photo Print Pricing (Tunisia)
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-white rounded-lg shadow-sm">
            <thead>
              <tr className="bg-yellow-100 border-b">
                <th className="px-4 py-3 text-left font-semibold text-gray-700 border-r">
                  Product
                </th>
                <th className="px-4 py-3 text-center font-semibold text-gray-700 border-r" colSpan="2">
                  Dimensions (cm)
                </th>
                <th className="px-4 py-3 text-center font-semibold text-gray-700" colSpan="3">
                  Pricing
                </th>
              </tr>
              <tr className="bg-yellow-50 border-b">
                <th className="px-4 py-2 text-left font-medium text-gray-600 border-r">
                  Photo Print
                </th>
                <th className="px-4 py-2 text-center font-medium text-gray-600 border-r">
                  Width
                </th>
                <th className="px-4 py-2 text-center font-medium text-gray-600 border-r">
                  Length
                </th>
                <th className="px-4 py-2 text-center font-medium text-gray-600 border-r">
                  1 - 24
                </th>
                <th className="px-4 py-2 text-center font-medium text-gray-600 border-r">
                  25 - 74
                </th>
                <th className="px-4 py-2 text-center font-medium text-gray-600">
                  75+
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-700 border-r bg-yellow-50">
                  Standard
                </td>
                <td className="px-4 py-3 text-center text-gray-600 border-r">10.0</td>
                <td className="px-4 py-3 text-center text-gray-600 border-r">15.0</td>
                <td className="px-4 py-3 text-center font-semibold text-blue-600 border-r">
                  2.500 TND
                </td>
                <td className="px-4 py-3 text-center font-semibold text-green-600 border-r">
                  2.000 TND
                </td>
                <td className="px-4 py-3 text-center font-semibold text-purple-600">
                  1.500 TND
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-700 border-r bg-yellow-50">
                  Large
                </td>
                <td className="px-4 py-3 text-center text-gray-600 border-r">15.0</td>
                <td className="px-4 py-3 text-center text-gray-600 border-r">23.0</td>
                <td className="px-4 py-3 text-center font-semibold text-blue-600 border-r">
                  3.500 TND
                </td>
                <td className="px-4 py-3 text-center font-semibold text-green-600 border-r">
                  3.000 TND
                </td>
                <td className="px-4 py-3 text-center font-semibold text-purple-600">
                  2.500 TND
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
       
      </div>
    </div>
  </div>
)}


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
              
              {deliveryMethod === 'pickup' && selectedStudio && (
  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
    <p className="font-medium">{t('pickup.location')}:</p>
    <p>{selectedStudio.name}</p>
    <p>{selectedStudio.address}</p>
    <p>{selectedStudio.city}, {selectedStudio.country}</p>
  </div>
)}
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