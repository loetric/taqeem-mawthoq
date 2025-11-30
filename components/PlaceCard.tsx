'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MapPin, Star, MessageSquare, CheckCircle, Circle, Navigation } from 'lucide-react';
import { Place } from '@/types';
import { dataStore } from '@/lib/data';
import { getPlaceStatus } from '@/lib/placeUtils';

interface PlaceCardProps {
  place: Place;
  userLocation?: { lat: number; lng: number } | null;
  compact?: boolean; // For suggested places - shorter and wider
}

export default function PlaceCard({ place, userLocation, compact = false }: PlaceCardProps) {
  const [distance, setDistance] = useState<number | null>(null);
  
  const reviews = dataStore.getReviewsByPlace(place.id);
  const avgRating = dataStore.getAverageRating(place.id);
  const placeStatus = getPlaceStatus(place);

  useEffect(() => {
    if (userLocation && place.location) {
      const dist = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        place.location.lat,
        place.location.lng
      );
      setDistance(dist);
    }
  }, [userLocation, place.location]);

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  return (
    <Link href={`/places/${place.id}`} className="block h-full">
      <div className={`bg-white rounded-xl shadow-sm hover:shadow-md border border-gray-100 transition-all duration-300 overflow-hidden h-full flex flex-col ${
        compact ? 'max-w-[280px]' : ''
      }`}>
        {/* Image - Fixed height */}
        <div className={`${compact ? 'h-32' : 'h-40'} w-full bg-gradient-to-br from-[#0ea5e9] to-[#0284c7] relative overflow-hidden flex-shrink-0`}>
          {place.imageUrl ? (
            <img
              src={place.imageUrl}
              alt={place.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <MapPin className={`${compact ? 'w-10 h-10' : 'w-12 h-12'} text-white opacity-50`} />
            </div>
          )}
          {/* Verified Badge on Image */}
          {place.verified && (
            <div className="absolute top-2 left-2 flex items-center space-x-1 space-x-reverse bg-green-500/95 backdrop-blur-sm text-white px-2 py-1 rounded-full text-[10px] font-bold shadow-lg">
              <CheckCircle className="w-2.5 h-2.5 fill-current" />
              <span>تم التحقق</span>
            </div>
          )}
        </div>
        
        {/* Content - Fixed padding */}
        <div className={`${compact ? 'p-3' : 'p-4'} flex flex-col flex-1`}>
          {/* Name - Full display */}
          <div className="mb-2">
            <h3 className={`${compact ? 'text-base' : 'text-lg'} font-bold text-gray-800 leading-tight line-clamp-2`}>
              {place.name}
            </h3>
          </div>
          
          {/* Category and Status */}
          <div className={`${compact ? 'mb-2' : 'mb-3'} flex items-center space-x-2 space-x-reverse flex-wrap gap-2`}>
            {place.category && (
              <span className="inline-block bg-[#0ea5e9]/10 text-[#0ea5e9] text-xs px-2.5 py-1 rounded-full font-semibold">
                {place.category}
              </span>
            )}
            <div className={`flex items-center space-x-1 space-x-reverse text-xs px-2 py-1 rounded-full font-semibold ${
              placeStatus.status === 'open' 
                ? 'bg-green-100 text-green-700' 
                : placeStatus.status === 'closing_soon'
                ? 'bg-orange-100 text-orange-700'
                : 'bg-red-100 text-red-700'
            }`}>
              <Circle className={`w-2 h-2 fill-current ${
                placeStatus.status === 'open' ? 'text-green-600' : 
                placeStatus.status === 'closing_soon' ? 'text-orange-600' : 'text-red-600'
              }`} />
              <span>{placeStatus.message}</span>
            </div>
          </div>

          {/* Stats Row - All on same line with proper spacing */}
          <div className={`${compact ? 'pt-2' : 'pt-3'} border-t border-gray-100 mt-auto`}>
            <div className="flex items-center justify-between gap-3">
              {/* Stars and Rating */}
              <div className="flex items-center space-x-1.5 space-x-reverse flex-shrink-0">
                <div className="flex items-center space-x-0.5 space-x-reverse">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`${compact ? 'w-3 h-3' : 'w-3.5 h-3.5'} ${
                        i < Math.floor(avgRating)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className={`text-gray-700 font-bold ${compact ? 'text-xs' : 'text-sm'} min-w-[28px]`}>
                  {avgRating > 0 ? avgRating.toFixed(1) : '0.0'}
                </span>
              </div>
              
              {/* Reviews Count */}
              <div className="flex items-center space-x-1 space-x-reverse text-gray-600 flex-shrink-0">
                <MessageSquare className={`${compact ? 'w-3 h-3' : 'w-3.5 h-3.5'}`} />
                <span className={`${compact ? 'text-[10px]' : 'text-xs'} font-semibold whitespace-nowrap`}>{reviews.length}</span>
              </div>
              
              {/* Distance */}
              {distance !== null && (
                <div className="flex items-center space-x-1 space-x-reverse text-gray-600 flex-shrink-0">
                  <Navigation className={`${compact ? 'w-3 h-3' : 'w-3.5 h-3.5'}`} />
                  <span className={`${compact ? 'text-[10px]' : 'text-xs'} font-medium whitespace-nowrap`}>{distance.toFixed(1)} كم</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
