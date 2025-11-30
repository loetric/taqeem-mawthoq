import { Subscription, NotificationCriteria, User, Place } from '@/types';
import { dataStore } from './data';

export class SubscriptionService {
  canSendTargetedNotification(userId: string, placeId: string): boolean {
    const subscription = dataStore.getActiveSubscription(userId, placeId);
    if (!subscription) return false;

    const feature = subscription.features.find(f => f.type === 'targeted_notifications');
    return feature?.enabled === true;
  }

  getTargetedUsers(criteria: NotificationCriteria, place: Place): User[] {
    const allUsers = dataStore.getAllUsers();
    let filteredUsers = allUsers.filter(user => user.role === 'user');

    // Filter by location (radius)
    if (criteria.radius && criteria.location && place.location) {
      filteredUsers = filteredUsers.filter(user => {
        if (!user.location) return false;
        const distance = this.calculateDistance(
          criteria.location!.lat,
          criteria.location!.lng,
          user.location.lat,
          user.location.lng
        );
        return distance <= criteria.radius!;
      });
    }

    // Filter by gender
    if (criteria.gender && criteria.gender !== 'all') {
      filteredUsers = filteredUsers.filter(user => user.gender === criteria.gender);
    }

    // Filter by loyalty level
    if (criteria.loyaltyLevel) {
      filteredUsers = filteredUsers.filter(user => user.loyaltyPoints >= criteria.loyaltyLevel!);
    }

    // Filter by interests/categories
    if (criteria.interests && criteria.interests.length > 0) {
      filteredUsers = filteredUsers.filter(user => {
        const userCategories = user.preferences?.categories || [];
        return criteria.interests!.some(interest => userCategories.includes(interest));
      });
    }

    return filteredUsers;
  }

  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}

export const subscriptionService = new SubscriptionService();

