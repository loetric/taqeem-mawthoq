'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Star, FileText, Circle, Navigation } from 'lucide-react';
import { Place } from '@/types';
import { dataStore } from '@/lib/data';
import { getPlaceStatus } from '@/lib/placeUtils';

interface PlaceCardProps {
  place: Place;
  userLocation?: { lat: number; lng: number } | null;
  compact?: boolean;
}

export default function PlaceCard({ place, userLocation, compact = false }: PlaceCardProps) {
  const router = useRouter();
  const [distance, setDistance] = useState<number | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Get images array (use images if available, otherwise fallback to imageUrl)
  const images = place.images && place.images.length > 0 
    ? place.images 
    : (place.imageUrl ? [place.imageUrl] : []);
  
  const hasMultipleImages = images.length > 1;
  
  const reviews = dataStore.getReviewsByPlace(place.id);
  const avgRating = dataStore.getAverageRating(place.id);
  const placeStatus = getPlaceStatus(place);

  const handleCardClick = () => {
    router.push(`/places/${place.id}`);
  };

  const goToNextImage = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setCurrentImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  const goToPrevImage = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

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
    <div className="block h-full place-card-link cursor-pointer" onClick={handleCardClick}>
      <div className={`place-card-unified ${compact ? 'place-card-compact' : ''}`}>
        {/* Image Section - Swipe to navigate */}
        <div className="place-card-image-wrapper relative">
          {images.length > 0 ? (
            <div className="place-card-images-container relative">
              <img
                src={images[currentImageIndex]}
                alt={`${place.name} - صورة ${currentImageIndex + 1}`}
                className="place-card-single-image"
                draggable={false}
              />
              
              {/* Multiple images UI */}
              {hasMultipleImages && (
                <>
                  {/* Image counter */}
                  <div className="place-card-image-counter">
                    {currentImageIndex + 1}/{images.length}
                  </div>
                  
                  {/* Right tap zone - previous image (RTL) */}
                  <div 
                    className="absolute top-0 right-0 w-2/5 h-full z-10"
                    onClick={goToPrevImage}
                    onTouchEnd={goToPrevImage}
                  />
                  {/* Left tap zone - next image (RTL) */}
                  <div 
                    className="absolute top-0 left-0 w-2/5 h-full z-10"
                    onClick={goToNextImage}
                    onTouchEnd={goToNextImage}
                  />
                  
                  {/* Image Indicators - Dots */}
                  <div className="place-card-image-indicators">
                    {images.map((_, index) => (
                      <button
                        key={index}
                        type="button"
                        className={`place-card-image-indicator ${
                          index === currentImageIndex ? 'active' : ''
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          setCurrentImageIndex(index);
                        }}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
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
            {/* Rating with Single Star - Yellow Background */}
            <div className="flex items-center gap-1 bg-yellow-100 px-2 py-1 rounded-lg border border-yellow-200">
              <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
              <span className="text-sm font-bold text-yellow-800">
                {avgRating > 0 ? avgRating.toFixed(1) : '0.0'}
              </span>
            </div>
            
            {/* Reviews Count */}
            <div className="place-card-stat-item">
              <FileText className="icon-xs place-card-stat-icon" />
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
    </div>
  );
}
