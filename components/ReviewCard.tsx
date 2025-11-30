'use client';

import { Star, CheckCircle, ThumbsUp, Flag } from 'lucide-react';
import { Review } from '@/types';
import { formatRelativeTime } from '@/lib/dateUtils';
import { getCurrentUser } from '@/lib/auth';
import { useToast } from '@/components/Toast';
import ReportReviewModal from '@/components/ReportReviewModal';
import { useState } from 'react';

interface ReviewCardProps {
  review: Review;
}

export default function ReviewCard({ review }: ReviewCardProps) {
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

  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-6 mb-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center space-x-2 space-x-reverse mb-1">
              <h4 className="font-bold text-gray-800">{review.userName}</h4>
              {review.isExpert && (
                <div className="flex items-center space-x-1 space-x-reverse bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs">
                  <CheckCircle className="w-3 h-3" />
                  <span>خبير</span>
                </div>
              )}
              {review.verified && (
                <div className="flex items-center space-x-1 space-x-reverse bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs">
                  <CheckCircle className="w-3 h-3" />
                  <span>موثق</span>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-1 space-x-reverse">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${
                    i < review.rating
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
          <span className="text-[9px] text-gray-400">
            {formatRelativeTime(review.createdAt)}
          </span>
        </div>
        <p className="text-gray-700 leading-relaxed mb-3">{review.comment}</p>
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <span className="text-[9px] text-gray-400">{formatRelativeTime(review.createdAt)}</span>
          <div className="flex items-center space-x-2 space-x-reverse">
            {currentUser && currentUser.id !== review.userId && (
              <>
                {review.likes && review.likes.length > 0 && (
                  <div className="flex items-center space-x-1 space-x-reverse text-xs text-gray-500">
                    <ThumbsUp className="w-3.5 h-3.5 text-gray-400" />
                    <span>{review.likes.length}</span>
                  </div>
                )}
                <button
                  onClick={() => {
                    setReportReviewModal({
                      isOpen: true,
                      reviewId: review.id,
                      reviewUserName: review.userName,
                    });
                  }}
                  className="flex items-center space-x-1 space-x-reverse text-xs text-gray-500 hover:text-red-500 hover:bg-red-50 px-2 py-1 rounded-lg transition-all"
                  title="الإبلاغ عن التقييم"
                >
                  <Flag className="w-3.5 h-3.5" />
                </button>
              </>
            )}
            {(!currentUser || currentUser.id === review.userId) && review.likes && review.likes.length > 0 && (
              <div className="flex items-center space-x-1 space-x-reverse text-xs text-gray-500">
                <ThumbsUp className="w-3.5 h-3.5 text-gray-400" />
                <span>{review.likes.length}</span>
              </div>
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

