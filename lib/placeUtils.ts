import { Place } from '@/types';

export type PlaceStatus = 'open' | 'closed' | 'closing_soon';

export function getPlaceStatus(place: Place): { status: PlaceStatus; message: string; color: string } {
  if (!place.hours) {
    return { status: 'open', message: 'مفتوح', color: 'green' };
  }

  const now = new Date();
  const currentDay = getDayName(now.getDay());
  const currentTime = now.getHours() * 60 + now.getMinutes(); // Convert to minutes

  const todayHours = place.hours[currentDay];
  
  if (!todayHours || todayHours.closed) {
    return { status: 'closed', message: 'مغلق', color: 'red' };
  }

  // Parse opening and closing times
  const [openHour, openMin] = todayHours.open.split(':').map(Number);
  const [closeHour, closeMin] = todayHours.close.split(':').map(Number);
  
  const openTime = openHour * 60 + openMin;
  let closeTime = closeHour * 60 + closeMin;
  let comparisonCurrentTime = currentTime;

  // Handle operating hours that pass midnight (e.g., 18:00 - 02:00)
  if (closeTime <= openTime) {
    closeTime += 24 * 60;
    if (comparisonCurrentTime < openTime) {
      comparisonCurrentTime += 24 * 60;
    }
  }

  // Check if currently open
  if (comparisonCurrentTime >= openTime && comparisonCurrentTime < closeTime) {
    // Check if closing within 30 minutes
    const minutesUntilClose = closeTime - comparisonCurrentTime;
    if (minutesUntilClose <= 30) {
      return { 
        status: 'closing_soon', 
        message: `يغلق خلال ${minutesUntilClose} دقيقة`, 
        color: 'orange' 
      };
    }
    return { status: 'open', message: 'مفتوح', color: 'green' };
  }

  return { status: 'closed', message: 'مغلق', color: 'red' };
}

function getDayName(dayIndex: number): string {
  const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  return days[dayIndex];
}

