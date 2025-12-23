import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';

interface FoundingSlots {
  totalSpots: number;
  spotsTaken: number;
  spotsRemaining: number;
  loading: boolean;
  error: boolean;
}

export const useDiamondSpots = (): FoundingSlots => {
  const [spots, setSpots] = useState<FoundingSlots>({
    totalSpots: 0,
    spotsTaken: 0,
    spotsRemaining: 0,
    loading: true,
    error: false,
  });

  useEffect(() => {
    const fetchSpots = async () => {
      try {
        // Fetch remaining and total counts via RPC functions
        const [remainingResult, totalResult] = await Promise.all([
          supabase.rpc('get_founding_slots_remaining'),
          supabase.rpc('get_founding_slots_total'),
        ]);

        if (remainingResult.error || totalResult.error) {
          // Hide count if data unavailable (per master plan: never show fallback numbers)
          setSpots({
            totalSpots: 0,
            spotsTaken: 0,
            spotsRemaining: 0,
            loading: false,
            error: true,
          });
          return;
        }

        const remaining = remainingResult.data ?? 0;
        const total = totalResult.data ?? 0;
        const taken = total - remaining;

        setSpots({
          totalSpots: total,
          spotsTaken: taken,
          spotsRemaining: remaining,
          loading: false,
          error: false,
        });
      } catch {
        // Hide count on error
        setSpots(prev => ({ ...prev, loading: false, error: true }));
      }
    };

    fetchSpots();

    // Subscribe to real-time changes on founding_slots table
    const channel = supabase
      .channel('founding-slots-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'founding_slots',
        },
        () => {
          // Refetch when slots change
          fetchSpots();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return spots;
};

// Function to claim a founding slot
export const claimFoundingSlot = async (userId: string): Promise<{
  success: boolean;
  error?: string;
  message?: string;
}> => {
  const { data, error } = await supabase.rpc('claim_founding_slot', {
    user_id: userId,
  });

  if (error) {
    return {
      success: false,
      error: 'server_error',
      message: error.message,
    };
  }

  return data;
};
