
// This file is deprecated and will be removed
// It's kept as a placeholder to prevent import errors

import { useState } from 'react';

export type RealtimeEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*';

interface UseRealtimeOptions {
  table: string;
  event?: RealtimeEvent;
  schema?: string;
  filter?: string;
  callback?: (payload: any) => void;
  showToasts?: boolean;
}

// This is a stub implementation that doesn't actually subscribe to realtime events
export function useRealtime({
  // Parameters are kept to maintain API compatibility
  table,
  event = '*',
  schema = 'public',
  filter,
  callback,
  showToasts = false
}: UseRealtimeOptions) {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [lastEvent, setLastEvent] = useState<any>(null);

  // No subscriptions are set up
  // This function now returns dummy values for API compatibility
  return { isSubscribed: false, lastEvent: null };
}
