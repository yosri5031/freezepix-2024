import React, { useState } from 'react';
import axios from 'axios';
import { Loader, AlertCircle, Check } from 'lucide-react';

const GiftCardInput = ({ 
    onGiftCardApplied, 
    onGiftCardRemoved,
    isLoading, 
    error,
    setError, // Make sure to pass this prop from parent
    appliedGiftCard 
  }) => {
    const [giftCardCode, setGiftCardCode] = useState('');
    const [validating, setValidating] = useState(false);
  
    const handleApplyGiftCard = async () => {
      if (!giftCardCode || giftCardCode.trim() === '') return;
      
      // Clear any previous errors
      if (setError) setError('');
      
      setValidating(true);
      
      try {
        // Call your backend to validate the gift card with Shopify
        const response = await axios.post(
          'https://freezepix-database-server-c95d4dd2046d.herokuapp.com/api/validate-gift-card',
          { code: giftCardCode.trim() }
        );
        
        if (response.data.success) {
          onGiftCardApplied({
            code: giftCardCode.trim(),
            balance: response.data.balance,
            currencyCode: response.data.currencyCode,
            id: response.data.id
          });
        } else {
          // Pass the specific error message from the API
          if (setError && response.data.error) {
            setError(response.data.error);
          } else {
            setError('Invalid gift card');
          }
          onGiftCardApplied(null);
        }
      } catch (error) {
        console.error('Gift card validation error:', error);
        
        // Handle network or server errors
        if (setError) {
          if (error.response?.data?.error) {
            setError(error.response.data.error);
          } else {
            setError('Failed to validate gift card. Please try again.');
          }
        }
        
        onGiftCardApplied(null);
      } finally {
        setValidating(false);
        setGiftCardCode('');
      }
    };
  
    const handleRemoveGiftCard = () => {
      onGiftCardRemoved();
      setGiftCardCode('');
      // Clear any errors when removing a gift card
      if (setError) setError('');
    };
  
    if (appliedGiftCard) {
      return (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2">
                <Check size={16} className="text-green-500" />
                <span className="font-medium">Gift Card Applied</span>
              </div>
              <div className="text-sm text-gray-600 mt-1">
                <span className="font-medium">Balance:</span> {appliedGiftCard.balance} {appliedGiftCard.currencyCode}
              </div>
            </div>
            <button
              onClick={handleRemoveGiftCard}
              className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100"
            >
              Remove
            </button>
          </div>
        </div>
      );
    }
  
    return (
      <div className="space-y-2">
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Enter gift card code"
            value={giftCardCode}
            onChange={(e) => setGiftCardCode(e.target.value)}
            className={`w-full p-2 border rounded ${error ? 'border-red-500' : ''}`}
          />
          <button
            onClick={handleApplyGiftCard}
            disabled={validating || isLoading || !giftCardCode}
            className={`px-4 py-2 rounded relative overflow-hidden transition-all duration-300 ${
              validating || isLoading || !giftCardCode
                ? 'bg-gray-200 cursor-not-allowed'
                : 'bg-emerald-500 hover:bg-emerald-600 text-white'
            }`}
          >
            {validating ? (
              <Loader size={16} className="animate-spin" />
            ) : (
              'Apply'
            )}
          </button>
        </div>
        {error && (
          <p className="text-red-500 text-sm flex items-center gap-1">
            <AlertCircle size={14} />
            {error}
          </p>
        )}
      </div>
    );
  };
  
  export default GiftCardInput;