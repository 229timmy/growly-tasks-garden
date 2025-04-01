import { useQuery } from '@tanstack/react-query';
import { ProfilesService } from '@/lib/api/profiles';
import type { UserTier } from '@/types/common';
import { useEffect } from 'react';

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
  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      console.log('useUserTier: Fetching profile...');
      const result = await profilesService.getCurrentProfile();
      console.log('useUserTier: Profile fetch result:', result);
      return result;
    },
    refetchOnWindowFocus: true,
    refetchInterval: 60000,
    staleTime: 30000,
  });

  // Log information about the current tier for debugging
  useEffect(() => {
    if (profile) {
      console.log('useUserTier: Current user tier =', profile.tier);
      console.log('useUserTier: Full profile data =', profile);
    }
    if (error) {
      console.error('useUserTier: Error fetching profile =', error);
    }
  }, [profile, error]);

  // Returns true if the user's tier is higher or equal to the required tier
  const hasRequiredTier = (requiredTier: UserTier) => {
    console.log('useUserTier: Checking required tier:', requiredTier);
    console.log('useUserTier: Current profile:', profile);
    
    if (!profile || !profile.tier) {
      console.log('useUserTier: hasRequiredTier returning false - no profile or tier');
      return false;
    }
    
    const userTierLevel = tierHierarchy[profile.tier];
    const requiredTierLevel = tierHierarchy[requiredTier];
    
    console.log('useUserTier: User tier level:', userTierLevel);
    console.log('useUserTier: Required tier level:', requiredTierLevel);
    
    const hasAccess = userTierLevel >= requiredTierLevel;
    console.log(`useUserTier: hasRequiredTier(${requiredTier}) = ${hasAccess}`);
    return hasAccess;
  };

  // Returns true if the user can use batch measurement features (premium or higher)
  const canUseBatchMeasurements = () => {
    console.log('useUserTier: Checking batch measurements access');
    console.log('useUserTier: Current profile state:', profile);
    const result = hasRequiredTier('premium');
    console.log('useUserTier: canUseBatchMeasurements() =', result);
    return result;
  };

  // Get the batch size limit based on the user's tier
  const getBatchSizeLimit = () => {
    if (!profile || !profile.tier) {
      console.log('useUserTier: getBatchSizeLimit returning 0 - no profile or tier');
      return 0;
    }
    
    const limit = tierBatchLimits[profile.tier];
    console.log(`useUserTier: getBatchSizeLimit() = ${limit}`);
    return limit;
  };

  // FOR DEBUG ONLY: Force a specific tier - use with caution
  const setDebugTier = async (debugTier: UserTier) => {
    if (!profile) return;
    
    try {
      console.log(`useUserTier: Setting debug tier to ${debugTier}`);
      await profilesService.updateProfile(profile.id, { tier: debugTier });
    } catch (error) {
      console.error('useUserTier: Error setting debug tier:', error);
    }
  };

  return {
    tier: profile?.tier,
    isLoading,
    hasRequiredTier,
    canUseBatchMeasurements,
    getBatchSizeLimit,
    setDebugTier, // Only use for debugging
  };
} 