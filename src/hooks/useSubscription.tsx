import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface SubscriptionData {
  isPremium: boolean;
  subscriptionStatus: 'trial' | 'active' | 'expired' | 'cancelled';
  trialEndDate: Date | null;
  subscriptionEndDate: Date | null;
  trialDaysLeft: number;
  subscriptionDaysLeft: number;
  isTrialActive: boolean;
  hasAccess: boolean; // trial ativo ou premium
  planType?: 'monthly' | 'yearly';
}

export const useSubscription = () => {
  const { user } = useAuth();
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData>({
    isPremium: false,
    subscriptionStatus: 'trial',
    trialEndDate: null,
    subscriptionEndDate: null,
    trialDaysLeft: 0,
    subscriptionDaysLeft: 0,
    isTrialActive: false,
    hasAccess: false,
  });
  const [loading, setLoading] = useState(true);

  const fetchSubscriptionData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // Get profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('is_premium, subscription_status, trial_end_date')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile data:', profileError);
        return;
      }

      // Get active subscription data
      const { data: subscriptionData, error: subscriptionError } = await supabase
        .from('subscriptions')
        .select('expires_at, plan_type')
        .eq('user_id', user.id)
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(1);

      if (subscriptionError) {
        console.error('Error fetching subscription data:', subscriptionError);
      }

      const now = new Date();
      const trialEndDate = profileData.trial_end_date ? new Date(profileData.trial_end_date) : null;
      const subscriptionEndDate = subscriptionData?.[0]?.expires_at ? new Date(subscriptionData[0].expires_at) : null;
      
      const trialDaysLeft = trialEndDate 
        ? Math.max(0, Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
        : 0;
      
      const subscriptionDaysLeft = subscriptionEndDate 
        ? Math.max(0, Math.ceil((subscriptionEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
        : 0;
      
      const isTrialActive = false; // Removido: trialEndDate ? trialEndDate > now : false;
      const isPremium = profileData.is_premium || false;
      const hasAccess = isPremium; // Removido: || isTrialActive;
      
      console.log('Subscription status:', {
        isPremium,
        hasAccess,
        subscriptionStatus: profileData.subscription_status,
        userId: user.id
      });

      setSubscriptionData({
        isPremium,
        subscriptionStatus: isPremium ? 'active' : 'expired',
        trialEndDate,
        subscriptionEndDate,
        trialDaysLeft,
        subscriptionDaysLeft,
        isTrialActive,
        hasAccess,
        planType: subscriptionData?.[0]?.plan_type as 'monthly' | 'yearly' | undefined,
      });
    } catch (error) {
      console.error('Error in fetchSubscriptionData:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptionData();
  }, [user]);

  const refreshSubscription = () => {
    fetchSubscriptionData();
  };

  return {
    ...subscriptionData,
    loading,
    refreshSubscription,
  };
};