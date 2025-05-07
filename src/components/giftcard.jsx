import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader, AlertCircle, Check, ChevronDown, ChevronUp } from 'lucide-react';

const GiftCardInput = ({ 
    onGiftCardApplied, 
    onGiftCardRemoved,
    isLoading, 
    error,
    appliedGiftCard 
  }) => {
    const [giftCardCode, setGiftCardCode] = useState('');
    const [validating, setValidating] = useState(false);
    const [debugInfo, setDebugInfo] = useState(null);
    const [showDebug, setShowDebug] = useState(false);
  
    // Log debug info to console whenever it changes
    useEffect(() => {
      if (debugInfo) {
        console.log('Gift Card Debug Information:', debugInfo);
      }
    }, [debugInfo]);
  
    const handleApplyGiftCard = async () => {
      if (!giftCardCode || giftCardCode.trim() === '') return;
      
      setValidating(true);
      setDebugInfo(null); // Clear previous debug info
      
      try {
        // Call your backend to validate the gift card with Shopify
        const response = await axios.post(
          'https://freezepix-database-server-c95d4dd2046d.herokuapp.com/api/validate-gift-card',
          { code: giftCardCode.trim(),
            autoEnable: true
           }
        );
        
        // Save debug info regardless of success/failure
        if (response.data.debug) {
          setDebugInfo(response.data.debug);
        }
        
        if (response.data.success) {
          onGiftCardApplied({
            code: giftCardCode.trim(),
            balance: response.data.balance,
            currencyCode: response.data.currencyCode,
            id: response.data.id
          });
        } else {
          // Pass error message to parent component
          const errorMessage = response.data.error || 'Invalid gift card';
          onGiftCardApplied(null, errorMessage);
        }
      } catch (error) {
        console.error('Gift card validation error:', error);
        
        // Check for debug info in error response
        if (error.response?.data?.debug) {
          setDebugInfo(error.response.data.debug);
        }
        
        // Handle network or server errors
        const errorMessage = error.response?.data?.error || 'Failed to validate gift card';
        onGiftCardApplied(null, errorMessage);
      } finally {
        setValidating(false);
        setGiftCardCode('');
      }
    };
  
    const handleRemoveGiftCard = () => {
      onGiftCardRemoved();
      setGiftCardCode('');
      setDebugInfo(null); // Clear debug info when removing gift card
    };

    const renderDebugInfo = () => {
      if (!debugInfo) return null;
      
      return (
        <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded text-xs font-mono">
          <div 
            className="flex justify-between items-center cursor-pointer" 
            onClick={() => setShowDebug(!showDebug)}
          >
            <h4 className="font-medium text-sm">Debug Information</h4>
            {showDebug ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
          
          {showDebug && (
            <div className="mt-2 space-y-2 overflow-auto max-h-96">
              <div>
                <p><strong>Input Code:</strong> "{debugInfo.inputCode}"</p>
                <p><strong>Trimmed Code:</strong> "{debugInfo.trimmedCode}"</p>
                <p><strong>Code Length:</strong> {debugInfo.codeLength}</p>
                <p><strong>Trimmed Length:</strong> {debugInfo.trimmedLength}</p>
              </div>
              
              <div>
                <p className="font-medium mb-1">Steps:</p>
                <ul className="list-disc pl-5">
                  {debugInfo.steps?.map((step, index) => (
                    <li key={index} className="mb-1">
                      <strong>{step.step}:</strong> {step.details}
                      {step.matches && (
                        <ul className="list-circle pl-5 mt-1">
                          {step.matches.map((match, i) => (
                            <li key={i}>
                              Last chars: {match.lastChars}, 
                              Enabled: {String(match.enabled)}, 
                              Balance: {match.balance}
                            </li>
                          ))}
                        </ul>
                      )}
                      {step.cardDetails && (
                        <div className="pl-5 mt-1">
                          <p>ID: {step.cardDetails.id}</p>
                          <p>Last Chars: {step.cardDetails.lastCharacters}</p>
                          <p>Enabled: {String(step.cardDetails.enabled)}</p>
                          <p>Balance: {step.cardDetails.balance} {step.cardDetails.currency}</p>
                          {step.cardDetails.expiresOn && (
                            <p>Expires: {step.cardDetails.expiresOn}</p>
                          )}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
              
              {debugInfo.cardsFound !== undefined && (
                <p><strong>Cards Found:</strong> {debugInfo.cardsFound}</p>
              )}
              
              {debugInfo.totalCardsInSystem !== undefined && (
                <p><strong>Total Cards in System:</strong> {debugInfo.totalCardsInSystem}</p>
              )}
              
              {debugInfo.cardsWithMatchingLastChars !== undefined && (
                <p><strong>Cards with Matching Last Chars:</strong> {debugInfo.cardsWithMatchingLastChars}</p>
              )}
              
              {debugInfo.error && (
                <div className="text-red-500 mt-2">
                  <p><strong>Error:</strong> {debugInfo.error}</p>
                </div>
              )}
            </div>
          )}
        </div>
      );
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
        
        {/* Debug information section */}
        {renderDebugInfo()}
      </div>
    );
  };
  
  export default GiftCardInput;