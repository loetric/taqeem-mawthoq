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
  // compact prop removed for unified dimensions
}

export default function PlaceCard({ place, userLocation }: PlaceCardProps) {
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

  // Unified dimensions - remove compact mode for consistency
  const cardHeight = 'h-full';
  const imageHeight = 'h-40'; // Fixed 160px for all cards
  const contentPadding = 'p-4'; // Fixed padding
  const titleSize = 'text-lg'; // Fixed title size
  const starSize = 'w-3.5 h-3.5'; // Fixed star size
  const iconSize = 'w-3.5 h-3.5'; // Fixed icon size
  const textSize = 'text-sm'; // Fixed text size
  const smallTextSize = 'text-xs'; // Fixed small text size

  return (
    <Link href={`/places/${place.id}`} className="block h-full">
      <div className={`card-unified ${cardHeight} flex flex-col place-card-container`}>
        {/* Image - Fixed height for all cards */}
        <div className={`${imageHeight} w-full bg-gradient-to-br from-emerald-600 to-emerald-700 relative overflow-hidden flex-shrink-0 place-card-image`}>
          {place.imageUrl ? (
            <img
              src={place.imageUrl}
              alt={place.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <MapPin className="icon-2xl text-white opacity-50" />
            </div>
          )}
          {/* Verified Badge on Image */}
          {place.verified && (
            <div className="absolute top-2 left-2 bg-emerald-600/95 backdrop-blur-sm text-white shadow-lg px-3 py-1.5 rounded-full text-xs font-bold">
              <span>تم التحقق</span>
            </div>
          )}
        </div>
        
        {/* Content - Fixed padding for all cards */}
        <div className={`${contentPadding} flex flex-col flex-1 place-card-content`}>
          {/* Name - Fixed size */}
          <div className="mb-2">
            <h3 className={`${titleSize} font-bold text-gray-800 leading-tight line-clamp-2`}>
              {place.name}
            </h3>
          </div>
          
          {/* Category and Status */}
          <div className="mb-3 flex items-center space-x-2 space-x-reverse flex-wrap gap-2">
            {place.category && (
              <span className="badge-category">
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
              <Circle className={`icon-xs fill-current ${
                placeStatus.status === 'open' ? 'text-green-600' : 
                placeStatus.status === 'closing_soon' ? 'text-orange-600' : 'text-red-600'
              }`} />
              <span>{placeStatus.message}</span>
            </div>
          </div>

          {/* Stats Row - Fixed spacing */}
          <div className="pt-3 border-t border-gray-100 mt-auto">
            <div className="flex items-center justify-between gap-3">
              {/* Stars and Rating */}
              <div className="rating-stars-unified flex-shrink-0">
                <div className="flex items-center space-x-0.5 space-x-reverse">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`icon-xs ${
                        i < Math.floor(avgRating)
                          ? 'text-amber-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className={`text-slate-700 font-bold ${textSize} min-w-[28px]`}>
                  {avgRating > 0 ? avgRating.toFixed(1) : '0.0'}
                </span>
              </div>
              
              {/* Reviews Count */}
              <div className="flex items-center space-x-1 space-x-reverse text-slate-600 flex-shrink-0">
                <MessageSquare className="icon-xs icon-secondary" />
                <span className={`${smallTextSize} font-semibold whitespace-nowrap`}>{reviews.length}</span>
              </div>
              
              {/* Distance */}
              {distance !== null && (
                <div className="flex items-center space-x-1 space-x-reverse text-slate-600 flex-shrink-0">
                  <Navigation className="icon-xs icon-secondary" />
                  <span className={`${smallTextSize} font-medium whitespace-nowrap`}>{distance.toFixed(1)} كم</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
