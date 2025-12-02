'use client';

import { useState } from 'react';
import { Star, DollarSign, Car, Clock, Sparkles, Wifi, Heart, ThumbsUp, CheckCircle } from 'lucide-react';
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
  const [wifi, setWifi] = useState<string>('');
  const [atmosphere, setAtmosphere] = useState<string>('');
  const [valueForMoney, setValueForMoney] = useState<string>('');
  const [recommendToFriend, setRecommendToFriend] = useState<boolean>(false);
  const [visitAgain, setVisitAgain] = useState<boolean>(false);

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
    if (wifi) reviewDetails.wifi = wifi;
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

  const isRestaurant = place.category === 'مطعم' || place.placeType === 'restaurant';
  const isCafe = place.category === 'مقهى' || place.placeType === 'cafe';
  const isShopping = place.category === 'تسوق' || place.placeType === 'shopping';
  const isMedical = place.category === 'طبي' || place.category === 'مستشفى' || place.placeType === 'medical' || place.placeType === 'hospital';
  const isMunicipal = place.category === 'بلدية' || (place.placeType === 'other' && place.category === 'بلدية');
  const isGovernment = place.category === 'حكومي' || (place.placeType === 'other' && place.category === 'حكومي');

  const SelectOption = ({ value, label, selected, onChange, icon: Icon }: { value: string; label: string; selected: string; onChange: (value: string) => void; icon?: any }) => (
    <button
      type="button"
      onClick={() => onChange(value)}
      className={`flex items-center space-x-1.5 space-x-reverse px-3 py-1.5 rounded-lg border transition-all text-xs ${
        selected === value
          ? 'border-[emerald-600] bg-[emerald-600]/10 text-[emerald-600] font-semibold'
          : 'border-gray-200 text-slate-600 hover:border-gray-300'
      }`}
    >
      {Icon && <Icon className="w-3 h-3" />}
      <span>{label}</span>
    </button>
  );

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl p-4 space-y-4 border border-gray-200 shadow-md">
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
                className={`w-7 h-7 ${
                  star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Price Range - For restaurants, cafes, shopping */}
      {(isRestaurant || isCafe || isShopping) && (
        <div>
          <label className="block text-slate-700 font-semibold mb-2 flex items-center space-x-1.5 space-x-reverse text-sm">
            <DollarSign className="w-3.5 h-3.5 text-[emerald-600]" />
            <span>نطاق الأسعار</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <SelectOption value="very_cheap" label="رخيص جداً" selected={priceRange} onChange={setPriceRange} />
            <SelectOption value="cheap" label="رخيص" selected={priceRange} onChange={setPriceRange} />
            <SelectOption value="moderate" label="متوسط" selected={priceRange} onChange={setPriceRange} />
            <SelectOption value="expensive" label="غالي" selected={priceRange} onChange={setPriceRange} />
            <SelectOption value="very_expensive" label="غالي جداً" selected={priceRange} onChange={setPriceRange} />
          </div>
        </div>
      )}

      {/* Parking - For most places */}
      {!isMedical && (
        <div>
          <label className="block text-slate-700 font-semibold mb-2 flex items-center space-x-1.5 space-x-reverse text-sm">
            <Car className="w-3.5 h-3.5 text-[emerald-600]" />
            <span>سهولة إيجاد موقف سيارات</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <SelectOption value="easy" label="سهل جداً" selected={parking} onChange={setParking} />
            <SelectOption value="moderate" label="متوسط" selected={parking} onChange={setParking} />
            <SelectOption value="difficult" label="صعب" selected={parking} onChange={setParking} />
            <SelectOption value="not_available" label="غير متوفر" selected={parking} onChange={setParking} />
          </div>
        </div>
      )}

      {/* Wait Time - For restaurants, cafes, medical, municipal, government */}
      {(isRestaurant || isCafe || isMedical || isMunicipal || isGovernment) && (
        <div>
          <label className="block text-slate-700 font-semibold mb-2 flex items-center space-x-2 space-x-reverse">
            <Clock className="w-5 h-5 text-[emerald-600]" />
            <span>وقت الانتظار</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            <SelectOption value="none" label="لا يوجد انتظار" selected={waitTime} onChange={setWaitTime} />
            <SelectOption value="short" label="قصير" selected={waitTime} onChange={setWaitTime} />
            <SelectOption value="moderate" label="متوسط" selected={waitTime} onChange={setWaitTime} />
            <SelectOption value="long" label="طويل" selected={waitTime} onChange={setWaitTime} />
            <SelectOption value="very_long" label="طويل جداً" selected={waitTime} onChange={setWaitTime} />
          </div>
        </div>
      )}

      {/* Cleanliness - For restaurants, cafes, medical */}
      {(isRestaurant || isCafe || isMedical) && (
        <div>
          <label className="block text-slate-700 font-semibold mb-2 flex items-center space-x-2 space-x-reverse">
            <Sparkles className="w-5 h-5 text-[emerald-600]" />
            <span>النظافة</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <SelectOption value="excellent" label="ممتاز" selected={cleanliness} onChange={setCleanliness} />
            <SelectOption value="good" label="جيد" selected={cleanliness} onChange={setCleanliness} />
            <SelectOption value="average" label="متوسط" selected={cleanliness} onChange={setCleanliness} />
            <SelectOption value="poor" label="ضعيف" selected={cleanliness} onChange={setCleanliness} />
          </div>
        </div>
      )}

      {/* Service Quality - For most places */}
      <div>
        <label className="block text-slate-700 font-semibold mb-2 flex items-center space-x-2 space-x-reverse">
          <Heart className="w-5 h-5 text-[emerald-600]" />
          <span>جودة الخدمة</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <SelectOption value="excellent" label="ممتاز" selected={service} onChange={setService} />
          <SelectOption value="good" label="جيد" selected={service} onChange={setService} />
          <SelectOption value="average" label="متوسط" selected={service} onChange={setService} />
          <SelectOption value="poor" label="ضعيف" selected={service} onChange={setService} />
        </div>
      </div>

      {/* Accessibility - For municipal, government, medical */}
      {(isMunicipal || isGovernment || isMedical) && (
        <div>
          <label className="block text-slate-700 font-semibold mb-2 flex items-center space-x-2 space-x-reverse">
            <CheckCircle className="w-5 h-5 text-[emerald-600]" />
            <span>سهولة الوصول</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <SelectOption value="excellent" label="ممتاز" selected={accessibility} onChange={setAccessibility} />
            <SelectOption value="good" label="جيد" selected={accessibility} onChange={setAccessibility} />
            <SelectOption value="average" label="متوسط" selected={accessibility} onChange={setAccessibility} />
            <SelectOption value="poor" label="ضعيف" selected={accessibility} onChange={setAccessibility} />
          </div>
        </div>
      )}

      {/* WiFi - For cafes, restaurants */}
      {(isCafe || isRestaurant) && (
        <div>
          <label className="block text-slate-700 font-semibold mb-2 flex items-center space-x-2 space-x-reverse">
            <Wifi className="w-5 h-5 text-[emerald-600]" />
            <span>جودة الإنترنت</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            <SelectOption value="excellent" label="ممتاز" selected={wifi} onChange={setWifi} />
            <SelectOption value="good" label="جيد" selected={wifi} onChange={setWifi} />
            <SelectOption value="average" label="متوسط" selected={wifi} onChange={setWifi} />
            <SelectOption value="poor" label="ضعيف" selected={wifi} onChange={setWifi} />
            <SelectOption value="not_available" label="غير متوفر" selected={wifi} onChange={setWifi} />
          </div>
        </div>
      )}

      {/* Atmosphere - For restaurants, cafes */}
      {(isRestaurant || isCafe) && (
        <div>
          <label className="block text-slate-700 font-semibold mb-2 flex items-center space-x-2 space-x-reverse">
            <Sparkles className="w-5 h-5 text-[emerald-600]" />
            <span>الأجواء</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <SelectOption value="excellent" label="ممتاز" selected={atmosphere} onChange={setAtmosphere} />
            <SelectOption value="good" label="جيد" selected={atmosphere} onChange={setAtmosphere} />
            <SelectOption value="average" label="متوسط" selected={atmosphere} onChange={setAtmosphere} />
            <SelectOption value="poor" label="ضعيف" selected={atmosphere} onChange={setAtmosphere} />
          </div>
        </div>
      )}

      {/* Value for Money - For restaurants, cafes, shopping */}
      {(isRestaurant || isCafe || isShopping) && (
        <div>
          <label className="block text-slate-700 font-semibold mb-2 flex items-center space-x-2 space-x-reverse">
            <ThumbsUp className="w-5 h-5 text-[emerald-600]" />
            <span>القيمة مقابل المال</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <SelectOption value="excellent" label="ممتاز" selected={valueForMoney} onChange={setValueForMoney} />
            <SelectOption value="good" label="جيد" selected={valueForMoney} onChange={setValueForMoney} />
            <SelectOption value="average" label="متوسط" selected={valueForMoney} onChange={setValueForMoney} />
            <SelectOption value="poor" label="ضعيف" selected={valueForMoney} onChange={setValueForMoney} />
          </div>
        </div>
      )}

      {/* Quick Questions */}
      <div className="space-y-2">
        <label className="block text-slate-700 font-semibold mb-2 text-sm">أسئلة سريعة</label>
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setRecommendToFriend(!recommendToFriend)}
            className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all text-sm ${
              recommendToFriend
                ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                : 'border-gray-200 text-slate-600 hover:border-gray-300'
            }`}
          >
            <span className="font-semibold text-xs">هل تنصح به للأصدقاء؟</span>
            <CheckCircle className={`w-4 h-4 ${recommendToFriend ? 'fill-current' : ''}`} />
          </button>
          <button
            type="button"
            onClick={() => setVisitAgain(!visitAgain)}
            className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all text-sm ${
              visitAgain
                ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                : 'border-gray-200 text-slate-600 hover:border-gray-300'
            }`}
          >
            <span className="font-semibold text-xs">هل ستعود مرة أخرى؟</span>
            <CheckCircle className={`w-4 h-4 ${visitAgain ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      {/* Comment */}
      <div>
        <label className="block text-slate-700 font-semibold mb-2 text-sm">تعليقك</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[emerald-600] focus:border-[emerald-600] transition-all text-sm"
          placeholder="اكتب مراجعتك التفصيلية هنا..."
          required
        />
      </div>

      {/* Submit Buttons */}
      <div className="flex space-x-2 space-x-reverse">
        <button
          type="submit"
          className="button-primary-unified flex-1 text-xs"
        >
          إرسال التقييم
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="button-secondary-unified text-xs"
        >
          إلغاء
        </button>
      </div>
    </form>
  );
}

