'use client';

import { DollarSign, Car, Clock, Sparkles, Heart, ThumbsUp, Circle, Check } from 'lucide-react';
import { Review } from '@/types';

interface ReviewDetailsDisplayProps {
  review: Review;
}

export default function ReviewDetailsDisplay({ review }: ReviewDetailsDisplayProps) {
  if (!review.reviewDetails) return null;

  const details = review.reviewDetails;

  const translateValue = (key: string, value: string): string => {
    const translations: { [key: string]: { [key: string]: string } } = {
      priceRange: {
        very_cheap: 'رخيص جداً',
        cheap: 'رخيص',
        moderate: 'متوسط',
        expensive: 'غالي',
        very_expensive: 'غالي جداً',
      },
      parking: {
        easy: 'سهل جداً',
        moderate: 'متوسط',
        difficult: 'صعب',
        not_available: 'غير متوفر',
      },
      waitTime: {
        none: 'لا يوجد انتظار',
        short: 'قصير',
        moderate: 'متوسط',
        long: 'طويل',
        very_long: 'طويل جداً',
      },
      cleanliness: {
        excellent: 'ممتاز',
        good: 'جيد',
        average: 'متوسط',
        poor: 'ضعيف',
      },
      service: {
        excellent: 'ممتاز',
        good: 'جيد',
        average: 'متوسط',
        poor: 'ضعيف',
      },
      accessibility: {
        excellent: 'ممتاز',
        good: 'جيد',
        average: 'متوسط',
        poor: 'ضعيف',
      },
      wifi: {
        excellent: 'ممتاز',
        good: 'جيد',
        average: 'متوسط',
        poor: 'ضعيف',
        not_available: 'غير متوفر',
      },
      atmosphere: {
        excellent: 'ممتاز',
        good: 'جيد',
        average: 'متوسط',
        poor: 'ضعيف',
      },
      valueForMoney: {
        excellent: 'ممتاز',
        good: 'جيد',
        average: 'متوسط',
        poor: 'ضعيف',
      },
    };
    return translations[key]?.[value] || value;
  };

  const getColor = (value: string) => {
    if (value.includes('excellent') || value === 'easy' || value === 'none' || value === 'very_cheap' || value === 'cheap') {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
    if (value.includes('good') || value === 'moderate' || value === 'short') {
      return 'bg-slate-50 text-slate-700 border-slate-200';
    }
    if (value.includes('average') || value === 'moderate') {
      return 'bg-amber-50 text-amber-700 border-amber-200';
    }
    if (value.includes('poor') || value === 'difficult' || value === 'long' || value === 'very_long' || value === 'expensive' || value === 'very_expensive' || value === 'not_available') {
      return 'bg-red-50 text-red-700 border-red-200';
    }
    return 'bg-gray-50 text-slate-700 border-gray-200';
  };

  const DetailItem = ({ icon: Icon, label, value, keyName }: { icon: any; label: string; value: string; keyName: string }) => {
    if (!value) return null;
    const translatedValue = translateValue(keyName, value);
    return (
      <div className="flex items-center space-x-1 space-x-reverse px-2 py-1 rounded-lg border bg-white hover:shadow-sm transition-all">
        <Icon className="w-3 h-3 flex-shrink-0" style={{ color: getIconColor(value) }} />
        <span className="text-[10px] text-slate-500 whitespace-nowrap">{label}:</span>
        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded whitespace-nowrap ${getColor(value)}`}>
          {translatedValue}
        </span>
      </div>
    );
  };

  const getIconColor = (value: string) => {
    if (value.includes('excellent') || value === 'easy' || value === 'none' || value === 'very_cheap' || value === 'cheap') {
      return '#10b981'; // emerald-600
    }
    if (value.includes('good') || value === 'moderate' || value === 'short') {
      return '#64748b'; // slate-500
    }
    if (value.includes('average') || value === 'moderate') {
      return '#f59e0b'; // amber-500
    }
    if (value.includes('poor') || value === 'difficult' || value === 'long' || value === 'very_long' || value === 'expensive' || value === 'very_expensive' || value === 'not_available') {
      return '#ef4444'; // red-500
    }
    return '#64748b'; // slate-500
  };

  // Collect all details
  const detailItems = [];
  if (details.priceRange) detailItems.push({ icon: DollarSign, label: 'السعر', value: details.priceRange, keyName: 'priceRange' });
  if (details.parking) detailItems.push({ icon: Car, label: 'موقف', value: details.parking, keyName: 'parking' });
  if (details.waitTime) detailItems.push({ icon: Clock, label: 'انتظار', value: details.waitTime, keyName: 'waitTime' });
  if (details.cleanliness) detailItems.push({ icon: Sparkles, label: 'نظافة', value: details.cleanliness, keyName: 'cleanliness' });
  if (details.service) detailItems.push({ icon: Heart, label: 'خدمة', value: details.service, keyName: 'service' });
  if (details.valueForMoney) detailItems.push({ icon: ThumbsUp, label: 'قيمة', value: details.valueForMoney, keyName: 'valueForMoney' });

  if (detailItems.length === 0 && !details.recommendToFriend && !details.visitAgain) return null;

  return (
    <div className="mt-2.5 pt-2.5 border-t border-gray-100">
      {detailItems.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 mb-2">
          {detailItems.map((item, idx) => (
            <DetailItem key={idx} icon={item.icon} label={item.label} value={item.value} keyName={item.keyName} />
          ))}
        </div>
      )}
      {(details.recommendToFriend || details.visitAgain) && (
        <div className="flex flex-wrap items-center gap-1.5">
          {details.recommendToFriend && (
            <div className="flex items-center space-x-1 space-x-reverse px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200 shadow-sm">
              <div className="relative w-2.5 h-2.5 flex-shrink-0 flex items-center justify-center">
                <Circle className="w-2.5 h-2.5 text-emerald-700 fill-emerald-700" strokeWidth={0} />
                <Check className="absolute w-1.5 h-1.5 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-[10px] font-semibold whitespace-nowrap">أنصح به</span>
            </div>
          )}
          {details.visitAgain && (
            <div className="flex items-center space-x-1 space-x-reverse px-2 py-0.5 bg-slate-50 text-slate-700 rounded-full border border-slate-200 shadow-sm">
              <div className="relative w-2.5 h-2.5 flex-shrink-0 flex items-center justify-center">
                <Circle className="w-2.5 h-2.5 text-slate-700 fill-slate-700" strokeWidth={0} />
                <Check className="absolute w-1.5 h-1.5 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-[10px] font-semibold whitespace-nowrap">سأعود</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
