// DiscountLinkGenerator.js
import React, { useState, useEffect } from 'react';
import { Copy, Share2, Check, ExternalLink } from 'lucide-react';

const DiscountLinkGenerator = ({ 
  discountCode, 
  discountDetails, 
  selectedStudio = null,
  baseUrl = window.location.origin 
}) => {
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  // Generate the shareable URL with discount code
  useEffect(() => {
    if (discountCode) {
      const params = new URLSearchParams();
      params.set('discount', discountCode);
      
      // If there's a selected studio, include it in the URL
      if (selectedStudio) {
        const studioSlug = selectedStudio.slug || generateStudioSlug(selectedStudio.name);
        // Include studio in path and discount as query param
        setShareUrl(`${baseUrl}/${studioSlug}?${params.toString()}`);
      } else {
        // Just discount code
        setShareUrl(`${baseUrl}?${params.toString()}`);
      }
    }
  }, [discountCode, selectedStudio, baseUrl]);

  // Helper function to generate studio slug
  const generateStudioSlug = (studioName) => {
    if (!studioName) return '';
    return studioName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  // Copy to clipboard function
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Share using Web Share API if available
  const handleShare = async () => {
    const shareData = {
      title: `FreezePIX - ${discountCode} Discount`,
      text: `Get ${getDiscountDisplayText(discountDetails)} off your photo prints!`,
      url: shareUrl
    };

    if (navigator.share && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Share failed:', err);
        // Fallback to copy
        handleCopyLink();
      }
    } else {
      // Fallback to copy
      handleCopyLink();
    }
  };

  // Get discount display text
  const getDiscountDisplayText = (details) => {
    if (!details) return discountCode;
    
    if (details.valueType === 'percentage') {
      return `${Math.abs(parseFloat(details.value))}%`;
    } else {
      return `${Math.abs(parseFloat(details.value))} off`;
    }
  };

  if (!discountCode) return null;

  return (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium text-green-800">
            Share Your Discount
          </h4>
          <p className="text-sm text-green-600">
            {discountCode} - {getDiscountDisplayText(discountDetails)} discount
          </p>
        </div>
        <div className="text-green-500">
          <Share2 size={24} />
        </div>
      </div>

      {/* Generated URL Display */}
      <div className="bg-white border rounded-lg p-3">
        <div className="flex items-center justify-between">
          <div className="flex-1 mr-2">
            <p className="text-xs text-gray-500 mb-1">Shareable Link:</p>
            <p className="text-sm font-mono text-gray-700 break-all">
              {shareUrl}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCopyLink}
              className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                copied 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
              title="Copy link"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              <span className="text-xs">
                {copied ? 'Copied!' : 'Copy'}
              </span>
            </button>
            
            <button
              onClick={handleShare}
              className="flex items-center gap-1 px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors"
              title="Share link"
            >
              <Share2 size={16} />
              <span className="text-xs">Share</span>
            </button>
          </div>
        </div>
      </div>

      {/* Preview of what happens when link is clicked 
      <div className="text-xs text-gray-600 bg-gray-50 rounded p-2">
        <strong>When someone clicks this link:</strong>
        <ul className="mt-1 ml-4 list-disc space-y-1">
          <li>The discount code "{discountCode}" will be automatically applied</li>
          {selectedStudio && (
            <li>Your studio "{selectedStudio.name}" will be pre-selected</li>
          )}
          <li>They can immediately start uploading photos with the discount active</li>
        </ul>
      </div>*/}
    </div>
  );
};

export default DiscountLinkGenerator;