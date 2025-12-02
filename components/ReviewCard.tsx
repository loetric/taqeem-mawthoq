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
      <div className="reviewCard-container">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="user-profile-container-sm mb-1">
              <h4 className="user-name-sm">{review.userName}</h4>
              {review.isExpert && (
                <div className="badge-expert">
                  <CheckCircle className="icon-xs" />
                  <span>خبير</span>
                </div>
              )}
              {review.verified && (
                <div className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full text-xs font-bold">
                  <span>موثق</span>
                </div>
              )}
            </div>
            <div className="rating-stars-unified">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`icon-md ${
                    i < review.rating
                      ? 'text-amber-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
          <span className="text-xs text-slate-400">
            {formatRelativeTime(review.createdAt)}
          </span>
        </div>
        <p className="text-slate-700 leading-relaxed mb-3">{review.comment}</p>
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <span className="text-xs text-slate-400">{formatRelativeTime(review.createdAt)}</span>
          <div className="flex items-center space-x-2 space-x-reverse">
            {currentUser && currentUser.id !== review.userId && (
              <>
                {review.likes && review.likes.length > 0 && (
                  <div className="flex items-center space-x-1 space-x-reverse text-xs text-slate-500">
                    <ThumbsUp className="icon-xs icon-muted" />
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
                  className="flex items-center space-x-1 space-x-reverse text-xs text-slate-500 hover:text-red-500 hover:bg-red-50 px-2 py-1 rounded-lg transition-all"
                  title="الإبلاغ عن التقييم"
                >
                  <Flag className="icon-xs" />
                </button>
              </>
            )}
            {(!currentUser || currentUser.id === review.userId) && review.likes && review.likes.length > 0 && (
              <div className="flex items-center space-x-1 space-x-reverse text-xs text-slate-500">
                <ThumbsUp className="icon-xs icon-muted" />
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

