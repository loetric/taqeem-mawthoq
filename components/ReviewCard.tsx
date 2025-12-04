'use client';

import { Star, CheckCircle, ThumbsUp, Flag, Award } from 'lucide-react';
import { Review } from '@/types';
import { formatRelativeTime } from '@/lib/dateUtils';
import { getCurrentUser } from '@/lib/auth';
import { useToast } from '@/components/Toast';
import ReportReviewModal from '@/components/ReportReviewModal';
import { useState } from 'react';
import Link from 'next/link';

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
          <div className="flex-1 min-w-0">
            <div className="user-profile-container-sm mb-2">
              <Link
                href={`/profile/${review.userId}`}
                className="relative hover:opacity-80 transition cursor-pointer flex-shrink-0"
              >
                {review.userAvatar ? (
                  <img
                    src={review.userAvatar}
                    alt={review.userName}
                    className="user-avatar-sm"
                  />
                ) : (
                  <div className="user-avatar-placeholder-sm">
                    {review.userName.charAt(0)}
                  </div>
                )}
              </Link>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 space-x-reverse flex-wrap">
                  <Link
                    href={`/profile/${review.userId}`}
                    className="user-name-sm hover:text-emerald-600 transition"
                  >
                    {review.userName}
                  </Link>
                </div>
              </div>
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

