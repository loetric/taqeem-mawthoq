'use client';

import { Star, CheckCircle, Heart, Flag, MapPin } from 'lucide-react';
import { Review } from '@/types';
import { formatRelativeTime } from '@/lib/dateUtils';
import { getCurrentUser } from '@/lib/auth';
import { useToast } from '@/components/Toast';
import ReportReviewModal from '@/components/ReportReviewModal';
import { useState } from 'react';
import Link from 'next/link';
import { dataStore } from '@/lib/data';

interface ReviewCardProps {
  review: Review;
  showPlaceName?: boolean; // Optional prop to show place name
}

export default function ReviewCard({ review, showPlaceName = true }: ReviewCardProps) {
  const currentUser = getCurrentUser();
  const { showToast, ToastContainer } = useToast();
  const [reportReviewModal, setReportReviewModal] = useState<{
    isOpen: boolean;
    reviewId: string;
    reviewUserName: string;
  }>({
    isOpen: false,
    reviewId: '',
    reviewUserName: '',
  });

  // Get place information
  const place = review.placeId ? dataStore.getPlace(review.placeId) : null;

  const handleLikeReview = () => {
    if (!currentUser) {
      showToast('يجب تسجيل الدخول أولاً', 'error');
      return;
    }
    
    const allReviews = dataStore.getAllReviews();
    const reviewToUpdate = allReviews.find(r => r.id === review.id);
    if (reviewToUpdate) {
      if (!reviewToUpdate.likes) reviewToUpdate.likes = [];
      const index = reviewToUpdate.likes.indexOf(currentUser.id);
      if (index > -1) {
        reviewToUpdate.likes.splice(index, 1);
      } else {
        reviewToUpdate.likes.push(currentUser.id);
      }
      showToast(index > -1 ? 'تم إلغاء الإعجاب' : 'تم الإعجاب بالتقييم', 'success');
      // Force re-render by updating state
      window.location.reload();
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all overflow-hidden">
        {/* Header */}
        <div className="p-3 sm:p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-start gap-2">
              <Link
                href={`/profile/${review.userId}`}
                className="relative flex-shrink-0 hover:opacity-80 transition cursor-pointer"
              >
                {review.userAvatar ? (
                  <img
                    src={review.userAvatar}
                    alt={review.userName}
                    className="w-8 h-8 rounded-full object-cover border-2 border-gray-200"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                    {review.userName.charAt(0)}
                  </div>
                )}
              </Link>
              <div className="flex-1 min-w-0">
                <div className="review-card-user-info">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Link
                      href={`/profile/${review.userId}`}
                      className="font-semibold text-xs text-gray-800 hover:text-emerald-600 transition"
                    >
                      {review.userName}
                    </Link>
                    {review.verified && (
                      <span className="bg-emerald-500/95 text-white px-2 py-0.5 rounded-full text-[9px] font-bold shadow-sm">
                        تم التحقق
                      </span>
                    )}
                  </div>
                  <div className="text-[9px] text-gray-400">{formatRelativeTime(review.createdAt)}</div>
                  {showPlaceName && place && (
                    <Link
                      href={`/places/${place.id}`}
                      className="flex items-center gap-1 text-[9px] text-emerald-600 hover:text-emerald-700 font-medium"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MapPin className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{place.name}</span>
                    </Link>
                  )}
                </div>
              </div>
            </div>
            {/* Rating Badge */}
            <div className="flex items-center gap-0.5 bg-yellow-50 px-1.5 py-0.5 rounded border border-yellow-200">
              <Star className="w-3.5 h-3.5 text-yellow-500 fill-current" />
              <span className="text-xs font-bold text-yellow-700">{review.rating}.0</span>
            </div>
          </div>
          
          {/* Comment */}
          <p className="text-gray-700 text-sm leading-relaxed">{review.comment}</p>
        </div>
        
        {/* Footer Actions */}
        <div className="px-3 py-1.5 border-t border-gray-100 flex items-center justify-between">
          <button
            onClick={handleLikeReview}
            className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded transition-all active:scale-125 ${
              review.likes?.includes(currentUser?.id || '')
                ? 'text-rose-500'
                : 'text-gray-400 hover:text-rose-500'
            }`}
          >
            <Heart className={`w-4 h-4 transition-transform ${review.likes?.includes(currentUser?.id || '') ? 'fill-current animate-pulse' : 'hover:scale-110'}`} />
            <span className="font-semibold">{review.likes?.length || 0}</span>
          </button>
          <div className="flex items-center gap-0.5">
            {currentUser && currentUser.id !== review.userId && (
              <button
                onClick={() => {
                  setReportReviewModal({
                    isOpen: true,
                    reviewId: review.id,
                    reviewUserName: review.userName,
                  });
                }}
                className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-red-500 hover:bg-red-50/50 px-2 py-1 rounded-md transition-all"
              >
                <Flag className="w-3 h-3" />
                <span>إبلاغ</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <ToastContainer />
      <ReportReviewModal
        isOpen={reportReviewModal.isOpen}
        reviewUserName={reportReviewModal.reviewUserName}
        onConfirm={(reason) => {
          showToast('تم الإبلاغ عن التقييم. شكراً لملاحظاتك.', 'success');
          setReportReviewModal({ ...reportReviewModal, isOpen: false });
        }}
        onCancel={() => setReportReviewModal({ ...reportReviewModal, isOpen: false })}
      />
    </>
  );
}

