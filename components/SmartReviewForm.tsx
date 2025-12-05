'use client';

import { useState } from 'react';
import { Star, DollarSign, Car, Clock, Sparkles, Heart, ThumbsUp, CheckCircle, Circle, Check, ChevronDown, ChevronUp, Accessibility } from 'lucide-react';
import { Place } from '@/types';
import { useToast } from '@/components/Toast';

interface SmartReviewFormProps {
  place: Place;
  onSubmit: (data: {
    rating: number;
    comment: string;
    reviewDetails?: {
      priceRange?: 'very_cheap' | 'cheap' | 'moderate' | 'expensive' | 'very_expensive';
      parking?: 'easy' | 'moderate' | 'difficult' | 'not_available';
      waitTime?: 'none' | 'short' | 'moderate' | 'long' | 'very_long';
      cleanliness?: 'excellent' | 'good' | 'average' | 'poor';
      service?: 'excellent' | 'good' | 'average' | 'poor';
      accessibility?: 'excellent' | 'good' | 'average' | 'poor';
      wifi?: 'excellent' | 'good' | 'average' | 'poor' | 'not_available';
      atmosphere?: 'excellent' | 'good' | 'average' | 'poor';
      valueForMoney?: 'excellent' | 'good' | 'average' | 'poor';
      recommendToFriend?: boolean;
      visitAgain?: boolean;
    };
  }) => void;
  onCancel: () => void;
}

export default function SmartReviewForm({ place, onSubmit, onCancel }: SmartReviewFormProps) {
  const { showToast } = useToast();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [priceRange, setPriceRange] = useState<string>('');
  const [parking, setParking] = useState<string>('');
  const [waitTime, setWaitTime] = useState<string>('');
  const [cleanliness, setCleanliness] = useState<string>('');
  const [service, setService] = useState<string>('');
  const [accessibility, setAccessibility] = useState<string>('');
  const [atmosphere, setAtmosphere] = useState<string>('');
  const [valueForMoney, setValueForMoney] = useState<string>('');
  const [recommendToFriend, setRecommendToFriend] = useState<boolean>(false);
  const [visitAgain, setVisitAgain] = useState<boolean>(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      showToast('الرجاء إدخال تعليق', 'warning');
      return;
    }

    const reviewDetails: any = {};
    if (priceRange) reviewDetails.priceRange = priceRange;
    if (parking) reviewDetails.parking = parking;
    if (waitTime) reviewDetails.waitTime = waitTime;
    if (cleanliness) reviewDetails.cleanliness = cleanliness;
    if (service) reviewDetails.service = service;
    if (accessibility) reviewDetails.accessibility = accessibility;
    if (atmosphere) reviewDetails.atmosphere = atmosphere;
    if (valueForMoney) reviewDetails.valueForMoney = valueForMoney;
    reviewDetails.recommendToFriend = recommendToFriend;
    reviewDetails.visitAgain = visitAgain;

    onSubmit({
      rating,
      comment,
      reviewDetails: Object.keys(reviewDetails).length > 0 ? reviewDetails : undefined,
    });
  };

  // Smart category detection
  const isRestaurant = place.category === 'مطعم' || place.placeType === 'restaurant';
  const isCafe = place.category === 'مقهى' || place.placeType === 'cafe';
  const isShopping = place.category === 'تسوق' || place.placeType === 'shopping';
  const isMedical = place.category === 'طبي' || place.category === 'مستشفى' || place.placeType === 'medical' || place.placeType === 'hospital';
  const isMunicipal = place.category === 'بلدية' || (place.placeType === 'other' && place.category === 'بلدية');
  const isGovernment = place.category === 'حكومي' || (place.placeType === 'other' && place.category === 'حكومي');
  const isEntertainment = place.category === 'ترفيه' || place.placeType === 'entertainment';
  const isHotel = place.category === 'فندق' || place.placeType === 'hotel';
  const isBeauty = place.category === 'جمال' || place.placeType === 'beauty';
  const isFitness = place.category === 'لياقة' || place.placeType === 'fitness';
  const isSchool = place.category === 'مدرسة' || place.placeType === 'school';

  // Smart field configuration based on category
  const getFieldsConfig = () => {
    // Restaurant & Cafe: Service, Price, Parking, Wait Time, Cleanliness, Value
    if (isRestaurant || isCafe) {
      return {
        essential: ['service', 'priceRange', 'parking'],
        advanced: ['waitTime', 'cleanliness', 'valueForMoney', 'atmosphere']
      };
    }
    // Shopping: Service, Price, Parking, Value
    if (isShopping) {
      return {
        essential: ['service', 'priceRange', 'parking'],
        advanced: ['valueForMoney']
      };
    }
    // Medical & Hospital: Service, Parking, Wait Time, Cleanliness, Accessibility
    if (isMedical) {
      return {
        essential: ['service', 'parking'],
        advanced: ['waitTime', 'cleanliness', 'accessibility']
      };
    }
    // Municipal & Government: Service, Parking, Wait Time, Accessibility
    if (isMunicipal || isGovernment) {
      return {
        essential: ['service', 'parking'],
        advanced: ['waitTime', 'accessibility']
      };
    }
    // Entertainment, Hotel, Beauty, Fitness: Service, Price, Parking, Cleanliness
    if (isEntertainment || isHotel || isBeauty || isFitness) {
      return {
        essential: ['service', 'priceRange', 'parking'],
        advanced: ['cleanliness']
      };
    }
    // School: Service, Parking, Accessibility
    if (isSchool) {
      return {
        essential: ['service', 'parking'],
        advanced: ['accessibility']
      };
    }
    // Default: Service, Parking
    return {
      essential: ['service', 'parking'],
      advanced: []
    };
  };

  const fieldsConfig = getFieldsConfig();

  const SelectOption = ({ value, label, selected, onChange }: { value: string; label: string; selected: string; onChange: (value: string) => void }) => (
    <button
      type="button"
      onClick={() => onChange(value)}
      className={`px-2 py-1 rounded-lg border transition-all text-xs ${
        selected === value
          ? 'border-emerald-600 bg-emerald-50 text-emerald-700 font-semibold'
          : 'border-gray-200 text-slate-600 hover:border-gray-300'
      }`}
    >
      {label}
    </button>
  );

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl p-4 sm:p-5 space-y-4 border border-gray-200 shadow-md">
      {/* Rating */}
      <div>
        <label className="block text-slate-700 font-semibold mb-2 text-sm">التقييم العام</label>
        <div className="flex items-center space-x-1.5 space-x-reverse justify-center">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className="focus:outline-none transform hover:scale-110 transition-transform"
            >
              <Star
                className={`w-6 h-6 sm:w-7 sm:h-7 ${
                  star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Essential Fields - Smart based on category */}
      <div className="space-y-3">
        {/* Service Quality - Always essential */}
        {fieldsConfig.essential.includes('service') && (
          <div>
            <label className="block text-slate-700 font-semibold mb-1.5 text-xs flex items-center space-x-1.5 space-x-reverse">
              <Heart className="w-3.5 h-3.5 text-emerald-600" />
              <span>جودة الخدمة</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              <SelectOption value="excellent" label="ممتاز" selected={service} onChange={setService} />
              <SelectOption value="good" label="جيد" selected={service} onChange={setService} />
              <SelectOption value="average" label="متوسط" selected={service} onChange={setService} />
              <SelectOption value="poor" label="ضعيف" selected={service} onChange={setService} />
            </div>
          </div>
        )}

        {/* Price Range */}
        {fieldsConfig.essential.includes('priceRange') && (
          <div>
            <label className="block text-slate-700 font-semibold mb-1.5 text-xs flex items-center space-x-1.5 space-x-reverse">
              <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
              <span>نطاق الأسعار</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              <SelectOption value="cheap" label="رخيص" selected={priceRange} onChange={setPriceRange} />
              <SelectOption value="moderate" label="متوسط" selected={priceRange} onChange={setPriceRange} />
              <SelectOption value="expensive" label="غالي" selected={priceRange} onChange={setPriceRange} />
            </div>
          </div>
        )}

        {/* Parking */}
        {fieldsConfig.essential.includes('parking') && (
          <div>
            <label className="block text-slate-700 font-semibold mb-1.5 text-xs flex items-center space-x-1.5 space-x-reverse">
              <Car className="w-3.5 h-3.5 text-emerald-600" />
              <span>موقف السيارات</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              <SelectOption value="easy" label="سهل" selected={parking} onChange={setParking} />
              <SelectOption value="moderate" label="متوسط" selected={parking} onChange={setParking} />
              <SelectOption value="difficult" label="صعب" selected={parking} onChange={setParking} />
              <SelectOption value="not_available" label="غير متوفر" selected={parking} onChange={setParking} />
            </div>
          </div>
        )}
      </div>

      {/* Advanced Options - Collapsible */}
      {fieldsConfig.advanced.length > 0 && (
        <div>
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full flex items-center justify-between p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-all text-xs text-slate-600"
          >
            <span className="font-semibold">خيارات إضافية (اختياري)</span>
            {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        
        {showAdvanced && fieldsConfig.advanced.length > 0 && (
          <div className="mt-3 space-y-3 pt-3 border-t border-gray-100">
            {/* Wait Time */}
            {fieldsConfig.advanced.includes('waitTime') && (
              <div>
                <label className="block text-slate-700 font-semibold mb-1.5 text-xs flex items-center space-x-1.5 space-x-reverse">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>وقت الانتظار</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  <SelectOption value="none" label="لا يوجد" selected={waitTime} onChange={setWaitTime} />
                  <SelectOption value="short" label="قصير" selected={waitTime} onChange={setWaitTime} />
                  <SelectOption value="moderate" label="متوسط" selected={waitTime} onChange={setWaitTime} />
                  <SelectOption value="long" label="طويل" selected={waitTime} onChange={setWaitTime} />
                </div>
              </div>
            )}

            {/* Cleanliness */}
            {fieldsConfig.advanced.includes('cleanliness') && (
              <div>
                <label className="block text-slate-700 font-semibold mb-1.5 text-xs flex items-center space-x-1.5 space-x-reverse">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>النظافة</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  <SelectOption value="excellent" label="ممتاز" selected={cleanliness} onChange={setCleanliness} />
                  <SelectOption value="good" label="جيد" selected={cleanliness} onChange={setCleanliness} />
                  <SelectOption value="average" label="متوسط" selected={cleanliness} onChange={setCleanliness} />
                  <SelectOption value="poor" label="ضعيف" selected={cleanliness} onChange={setCleanliness} />
                </div>
              </div>
            )}

            {/* Value for Money */}
            {fieldsConfig.advanced.includes('valueForMoney') && (
              <div>
                <label className="block text-slate-700 font-semibold mb-1.5 text-xs flex items-center space-x-1.5 space-x-reverse">
                  <ThumbsUp className="w-3.5 h-3.5 text-emerald-600" />
                  <span>القيمة مقابل المال</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  <SelectOption value="excellent" label="ممتاز" selected={valueForMoney} onChange={setValueForMoney} />
                  <SelectOption value="good" label="جيد" selected={valueForMoney} onChange={setValueForMoney} />
                  <SelectOption value="average" label="متوسط" selected={valueForMoney} onChange={setValueForMoney} />
                  <SelectOption value="poor" label="ضعيف" selected={valueForMoney} onChange={setValueForMoney} />
                </div>
              </div>
            )}

            {/* Accessibility */}
            {fieldsConfig.advanced.includes('accessibility') && (
              <div>
                <label className="block text-slate-700 font-semibold mb-1.5 text-xs flex items-center space-x-1.5 space-x-reverse">
                  <Accessibility className="w-3.5 h-3.5 text-emerald-600" />
                  <span>سهولة الوصول</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  <SelectOption value="excellent" label="ممتاز" selected={accessibility} onChange={setAccessibility} />
                  <SelectOption value="good" label="جيد" selected={accessibility} onChange={setAccessibility} />
                  <SelectOption value="average" label="متوسط" selected={accessibility} onChange={setAccessibility} />
                  <SelectOption value="poor" label="ضعيف" selected={accessibility} onChange={setAccessibility} />
                </div>
              </div>
            )}

            {/* Atmosphere */}
            {fieldsConfig.advanced.includes('atmosphere') && (
              <div>
                <label className="block text-slate-700 font-semibold mb-1.5 text-xs flex items-center space-x-1.5 space-x-reverse">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>الأجواء</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  <SelectOption value="excellent" label="ممتاز" selected={atmosphere} onChange={setAtmosphere} />
                  <SelectOption value="good" label="جيد" selected={atmosphere} onChange={setAtmosphere} />
                  <SelectOption value="average" label="متوسط" selected={atmosphere} onChange={setAtmosphere} />
                  <SelectOption value="poor" label="ضعيف" selected={atmosphere} onChange={setAtmosphere} />
                </div>
              </div>
            )}

            {/* Quick Questions */}
            <div className="space-y-1.5">
              <label className="block text-slate-700 font-semibold mb-1.5 text-xs">أسئلة سريعة</label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setRecommendToFriend(!recommendToFriend)}
                  className={`flex items-center space-x-1.5 space-x-reverse px-2 py-1 rounded-lg border transition-all text-xs ${
                    recommendToFriend
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                      : 'border-gray-200 text-slate-600 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="relative w-3.5 h-3.5 flex-shrink-0 flex items-center justify-center">
                    <Circle 
                      className={`w-3.5 h-3.5 transition-all ${
                        recommendToFriend 
                          ? 'text-emerald-700 fill-emerald-700' 
                          : 'text-slate-400'
                      }`}
                      strokeWidth={recommendToFriend ? 0 : 2}
                    />
                    {recommendToFriend && (
                      <Check className="absolute w-2 h-2 text-white" strokeWidth={3} />
                    )}
                  </div>
                  <span className="font-semibold">أنصح به</span>
                </button>
                <button
                  type="button"
                  onClick={() => setVisitAgain(!visitAgain)}
                  className={`flex items-center space-x-1.5 space-x-reverse px-2 py-1 rounded-lg border transition-all text-xs ${
                    visitAgain
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                      : 'border-gray-200 text-slate-600 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="relative w-3.5 h-3.5 flex-shrink-0 flex items-center justify-center">
                    <Circle 
                      className={`w-3.5 h-3.5 transition-all ${
                        visitAgain 
                          ? 'text-emerald-700 fill-emerald-700' 
                          : 'text-slate-400'
                      }`}
                      strokeWidth={visitAgain ? 0 : 2}
                    />
                    {visitAgain && (
                      <Check className="absolute w-2 h-2 text-white" strokeWidth={3} />
                    )}
                  </div>
                  <span className="font-semibold">سأعود</span>
                </button>
              </div>
            </div>
          </div>
        )}
        </div>
      )}

      {/* Comment */}
      <div>
        <label className="block text-slate-700 font-semibold mb-2 text-sm">تعليقك</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 transition-all text-sm resize-none"
          placeholder="اكتب مراجعتك هنا..."
          required
        />
      </div>

      {/* Submit Buttons */}
      <div className="flex space-x-2 space-x-reverse pt-2">
        <button
          type="submit"
          className="button-primary-unified flex-1 text-xs py-2.5"
        >
          إرسال التقييم
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="button-secondary-unified text-xs px-4 py-2.5"
        >
          إلغاء
        </button>
      </div>
    </form>
  );
}

