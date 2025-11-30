/**
 * Format a date to relative time in Arabic
 * Examples: "قبل دقيقة", "قبل ساعتين", "قبل 3 أيام", "Jan 15, 2024"
 */
export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const reviewDate = new Date(date);
  const diffInMs = now.getTime() - reviewDate.getTime();
  const diffInSeconds = Math.floor(diffInMs / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  // Less than 1 minute
  if (diffInSeconds < 60) {
    return 'الآن';
  }

  // Less than 1 hour - show minutes
  if (diffInMinutes < 60) {
    if (diffInMinutes === 1) {
      return 'قبل دقيقة';
    } else if (diffInMinutes === 2) {
      return 'قبل دقيقتين';
    } else if (diffInMinutes <= 10) {
      return `قبل ${diffInMinutes} دقائق`;
    } else {
      return `قبل ${diffInMinutes} دقيقة`;
    }
  }

  // Less than 24 hours - show hours
  if (diffInHours < 24) {
    if (diffInHours === 1) {
      return 'قبل ساعة';
    } else if (diffInHours === 2) {
      return 'قبل ساعتين';
    } else if (diffInHours <= 10) {
      return `قبل ${diffInHours} ساعات`;
    } else {
      return `قبل ${diffInHours} ساعة`;
    }
  }

  // More than 24 hours - show date
  return reviewDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

