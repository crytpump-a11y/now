import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Advertisement } from '../types';
import { X } from 'lucide-react';

interface AdvertisementDisplayProps {
  position: 'header' | 'sidebar' | 'footer';
  className?: string;
}

// Position-based styling configurations
const getPositionStyles = (position: 'header' | 'sidebar' | 'footer') => {
  switch (position) {
    case 'header':
      return {
        container: 'w-full max-w-4xl mx-auto',
        card: 'bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-4 mb-4 min-h-[120px] flex items-center',
        image: 'w-full h-24 object-cover rounded-md',
        content: 'flex-1'
      };
    case 'sidebar':
      return {
        container: 'w-full max-w-sm',
        card: 'bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-4 mb-4 min-h-[250px]',
        image: 'w-full h-32 object-cover rounded-md',
        content: 'space-y-3'
      };
    case 'footer':
      return {
        container: 'w-full max-w-3xl mx-auto',
        card: 'bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-3 mb-4 min-h-[90px] flex items-center',
        image: 'w-full h-16 object-cover rounded-md',
        content: 'flex-1'
      };
    default:
      return {
        container: 'w-full',
        card: 'bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-4 mb-4',
        image: 'w-full h-auto rounded-md object-cover',
        content: 'space-y-2'
      };
  }
};

const AdvertisementDisplay: React.FC<AdvertisementDisplayProps> = ({ position, className = '' }) => {
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [dismissedAds, setDismissedAds] = useState<string[]>([]);
  const styles = getPositionStyles(position);

  useEffect(() => {
    loadAdvertisements();
  }, []);

  const loadAdvertisements = () => {
    const loadAdsFromSupabase = async () => {
      try {
        const { data, error } = await supabase
          .from('advertisements')
          .select('*')
          .eq('position', position)
          .eq('is_active', true)
          .or(`end_date.is.null,end_date.gt.${new Date().toISOString()}`);
        
        if (!error && data) {
          const ads = data.map((ad: any) => ({
            id: ad.id,
            title: ad.title,
            content: ad.content,
            imageUrl: ad.image_url,
            targetUrl: ad.target_url,
            position: ad.position,
            isActive: ad.is_active,
            endDate: ad.end_date,
            createdAt: ad.created_at
          }));
          
          // Filter out dismissed ads
          const filteredAds = ads.filter((ad: Advertisement) => !dismissedAds.includes(ad.id));
          setAdvertisements(filteredAds);
        }
      } catch (error) {
        console.error('Error loading advertisements:', error);
      }
    };
    
    loadAdsFromSupabase();
  };

  const dismissAd = (adId: string) => {
    setDismissedAds(prev => [...prev, adId]);
    setAdvertisements(prev => prev.filter(ad => ad.id !== adId));
  };

  const handleAdClick = (ad: Advertisement) => {
    if (ad.targetUrl) {
      window.open(ad.targetUrl, '_blank');
    }
  };

  if (advertisements.length === 0) return null;

  return (
    <div className={`advertisement-container ${styles.container} ${className}`}>
      {advertisements.map((ad) => (
        <div
          key={ad.id}
          className={`relative ${styles.card} cursor-pointer hover:from-blue-600 hover:to-purple-700 transition-all duration-200 ${
            ad.targetUrl ? 'hover:shadow-lg transform hover:-translate-y-0.5' : ''
          }`}
          onClick={() => handleAdClick(ad)}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              dismissAd(ad.id);
            }}
            className="absolute top-2 right-2 text-white/80 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
          
          <div className={`pr-6 ${styles.content}`}>
            {position === 'header' || position === 'footer' ? (
              // Horizontal layout for header and footer
              <div className="flex items-center space-x-4">
                {ad.imageUrl && (
                  <div className="flex-shrink-0">
                    <img
                      src={ad.imageUrl}
                      alt={ad.title}
                      className={styles.image}
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className={`font-semibold mb-1 ${position === 'footer' ? 'text-base' : 'text-lg'}`}>
                    {ad.title}
                  </h3>
                  <p className={`text-white/90 leading-relaxed ${position === 'footer' ? 'text-xs' : 'text-sm'}`}>
                    {ad.content}
                  </p>
                  {ad.targetUrl && (
                    <div className="mt-2">
                      <span className="text-xs text-white/80 bg-white/20 px-2 py-1 rounded">
                        Detaylar için tıklayın
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // Vertical layout for sidebar
              <div>
                <h3 className="font-semibold text-lg mb-2">{ad.title}</h3>
                <p className="text-white/90 text-sm leading-relaxed mb-3">{ad.content}</p>
                
                {ad.imageUrl && (
                  <div className="mb-3">
                    <img
                      src={ad.imageUrl}
                      alt={ad.title}
                      className={styles.image}
                    />
                  </div>
                )}
                
                {ad.targetUrl && (
                  <div>
                    <span className="text-xs text-white/80 bg-white/20 px-2 py-1 rounded">
                      Detaylar için tıklayın
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdvertisementDisplay;