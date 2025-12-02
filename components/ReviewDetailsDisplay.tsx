'use client';

import { DollarSign, Car, Clock, Sparkles, Wifi, Heart, ThumbsUp, CheckCircle } from 'lucide-react';
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
      return 'bg-green-50 text-green-700 border-green-200';
    }
    if (value.includes('good') || value === 'moderate' || value === 'short') {
      return 'bg-blue-50 text-blue-700 border-blue-200';
    }
    if (value.includes('average') || value === 'moderate') {
      return 'bg-yellow-50 text-yellow-700 border-yellow-200';
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
      <div className="flex items-center space-x-2 space-x-reverse px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:shadow-sm transition-all">
        <div className="p-1.5 bg-[emerald-600]/10 rounded-md flex-shrink-0">
          <Icon className="w-3 h-3 text-[emerald-600]" />
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-[10px] text-slate-500 block mb-0.5 leading-tight">{label}</span>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded border inline-block ${getColor(value)}`}>
            {translatedValue}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="mt-3 pt-3 border-t border-gray-200">
      <h4 className="text-xs font-bold text-slate-700 mb-2.5 flex items-center space-x-1.5 space-x-reverse">
        <div className="p-1 bg-[emerald-600]/10 rounded">
          <Sparkles className="w-3 h-3 text-[emerald-600]" />
        </div>
        <span>تفاصيل التقييم</span>
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {details.priceRange && (
          <DetailItem icon={DollarSign} label="نطاق الأسعار" value={details.priceRange} keyName="priceRange" />
        )}
        {details.parking && (
          <DetailItem icon={Car} label="موقف السيارات" value={details.parking} keyName="parking" />
        )}
        {details.waitTime && (
          <DetailItem icon={Clock} label="وقت الانتظار" value={details.waitTime} keyName="waitTime" />
        )}
        {details.cleanliness && (
          <DetailItem icon={Sparkles} label="النظافة" value={details.cleanliness} keyName="cleanliness" />
        )}
        {details.service && (
          <DetailItem icon={Heart} label="جودة الخدمة" value={details.service} keyName="service" />
        )}
        {details.accessibility && (
          <DetailItem icon={CheckCircle} label="سهولة الوصول" value={details.accessibility} keyName="accessibility" />
        )}
        {details.wifi && (
          <DetailItem icon={Wifi} label="جودة الإنترنت" value={details.wifi} keyName="wifi" />
        )}
        {details.atmosphere && (
          <DetailItem icon={Sparkles} label="الأجواء" value={details.atmosphere} keyName="atmosphere" />
        )}
        {details.valueForMoney && (
          <DetailItem icon={ThumbsUp} label="القيمة مقابل المال" value={details.valueForMoney} keyName="valueForMoney" />
        )}
      </div>
      {(details.recommendToFriend || details.visitAgain) && (
        <div className="mt-2.5 pt-2.5 border-t border-gray-200 flex flex-wrap gap-1.5">
          {details.recommendToFriend && (
            <div className="flex items-center space-x-1.5 space-x-reverse px-2.5 py-1 bg-green-50 text-green-700 rounded-full border border-green-200">
              <CheckCircle className="w-3 h-3 fill-current" />
              <span className="text-xs font-semibold">ينصح به للأصدقاء</span>
            </div>
          )}
          {details.visitAgain && (
            <div className="flex items-center space-x-1.5 space-x-reverse px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-200">
              <CheckCircle className="w-3 h-3 fill-current" />
              <span className="text-xs font-semibold">سأعود مرة أخرى</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
