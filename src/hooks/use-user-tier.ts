import { useQuery } from '@tanstack/react-query';
import { ProfilesService } from '@/lib/api/profiles';
import type { UserTier } from '@/types/common';

const profilesService = new ProfilesService();

const tierHierarchy: Record<UserTier, number> = {
  'free': 0,
  'premium': 1,
  'enterprise': 2,
};

const tierBatchLimits: Record<UserTier, number> = {
  'free': 0,
  'premium': 10,
  'enterprise': 50,
};

export function useUserTier() {
  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => profilesService.getCurrentProfile(),
  });

  const hasRequiredTier = (requiredTier: UserTier) => {
    if (!profile) return false;
    return tierHierarchy[profile.tier] >= tierHierarchy[requiredTier];
  };

  const canUseBatchMeasurements = () => {
    return hasRequiredTier('premium');
  };

  const getBatchSizeLimit = () => {
    if (!profile) return 0;
    return tierBatchLimits[profile.tier];
  };

  return {
    tier: profile?.tier,
    isLoading,
    hasRequiredTier,
    canUseBatchMeasurements,
    getBatchSizeLimit,
  };
} 