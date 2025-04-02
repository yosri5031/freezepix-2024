import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Helper function to generate studio slug
const generateStudioSlug = (studioName) => {
  if (!studioName) return '';
  
  return studioName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

const StudioUrlShare = ({ studio }) => {
  const [copied, setCopied] = useState(false);
  const { t } = useTranslation();
  
  if (!studio) return null;
  
  const slug = studio.slug || generateStudioSlug(studio.name);
  const studioUrl = `${window.location.origin}/${slug}`;

  const copyToClipboard = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    navigator.clipboard.writeText(studioUrl)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy URL:', err);
      });
  };

  return (
    <div 
      className="mt-3 p-2 bg-gray-50 rounded-lg border border-gray-200"
      onClick={(e) => e.stopPropagation()} // Prevent clicks from selecting the studio again
    >
      <div className="text-xs text-gray-500 mb-1">{t('pickup.share_studio')}</div>
      <div className="flex items-center gap-1">
        <input
          type="text"
          value={studioUrl}
          readOnly
          className="text-xs bg-white border rounded py-1 px-2 flex-grow"
          onClick={(e) => e.target.select()}
        />
        <button
          onClick={copyToClipboard}
          className="flex items-center justify-center p-1 bg-gray-100 hover:bg-gray-200 rounded"
          title={t('pickup.copy_url')}
        >
          {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
        </button>
      </div>
    </div>
  );
};

export default StudioUrlShare;