'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MapPin, Star, MessageSquare, Circle, Navigation } from 'lucide-react';
import { Place } from '@/types';
import { dataStore } from '@/lib/data';
import { getPlaceStatus } from '@/lib/placeUtils';

interface PlaceCardProps {
  place: Place;
  userLocation?: { lat: number; lng: number } | null;
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

  return (
    <Link href={`/places/${place.id}`} className="block h-full place-card-link">
      <div className="place-card-unified">
        {/* Image Section - Fixed height */}
        <div className="place-card-image-wrapper">
          {place.imageUrl ? (
            <img
              src={place.imageUrl}
              alt={place.name}
              className="place-card-image-content"
            />
          ) : (
            <div className="place-card-image-placeholder">
              <MapPin className="icon-2xl text-white/60" />
            </div>
          )}
          
          {/* Verified Badge */}
          {place.verified && (
            <div className="place-card-verified-badge">
              <span>تم التحقق</span>
            </div>
          )}
        </div>
        
        {/* Content Section */}
        <div className="place-card-content-wrapper">
          {/* Title */}
          <h3 className="place-card-title">
            {place.name}
          </h3>
          
          {/* Category and Status Badges */}
          <div className="place-card-badges">
            {place.category && (
              <span className="place-card-category-badge">
                {place.category}
              </span>
            )}
            <div className={`place-card-status-badge ${
              placeStatus.status === 'open' 
                ? 'place-card-status-open' 
                : placeStatus.status === 'closing_soon'
                ? 'place-card-status-closing'
                : 'place-card-status-closed'
            }`}>
              <Circle className="icon-xs fill-current" />
              <span>{placeStatus.message}</span>
            </div>
          </div>

          {/* Stats Section */}
          <div className="place-card-stats">
            {/* Rating with Stars */}
            <div className="place-card-stat-item">
              <div className="place-card-stars">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`icon-xs place-card-star ${
                      i < Math.floor(avgRating)
                        ? 'place-card-star-filled'
                        : 'place-card-star-empty'
                    }`}
                  />
                ))}
              </div>
              <span className="place-card-rating-text">
                {avgRating > 0 ? avgRating.toFixed(1) : '0.0'}
              </span>
            </div>
            
            {/* Reviews Count */}
            <div className="place-card-stat-item">
              <MessageSquare className="icon-xs place-card-stat-icon" />
              <span className="place-card-stat-text">{reviews.length}</span>
            </div>
            
            {/* Distance */}
            {distance !== null && (
              <div className="place-card-stat-item">
                <Navigation className="icon-xs place-card-stat-icon" />
                <span className="place-card-stat-text">{distance.toFixed(1)} كم</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
