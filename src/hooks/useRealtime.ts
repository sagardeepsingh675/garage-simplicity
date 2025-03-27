
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/lib/toast';

export type RealtimeEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*';

interface UseRealtimeOptions {
  table: string;
  event?: RealtimeEvent;
  schema?: string;
  filter?: string;
  callback?: (payload: any) => void;
  showToasts?: boolean;
}

export function useRealtime({
  table,
  event = '*',
  schema = 'public',
  filter,
  callback,
  showToasts = false
}: UseRealtimeOptions) {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [lastEvent, setLastEvent] = useState<any>(null);

  useEffect(() => {
    // Create a channel with a specific name related to the table
    const channel = supabase
      .channel(`${table}-changes`)
      .on('postgres_changes', {
        event,
        schema,
        table,
        filter
      }, (payload) => {
        console.log(`Realtime update on ${table}:`, payload);
        setLastEvent(payload);
        
        if (showToasts) {
          const eventType = payload.eventType;
          const resourceName = table.charAt(0).toUpperCase() + table.slice(1, -1); // Convert 'customers' to 'Customer'
          
          if (eventType === 'INSERT') {
            toast.success(`${resourceName} created`);
          } else if (eventType === 'UPDATE') {
            toast.success(`${resourceName} updated`);
          } else if (eventType === 'DELETE') {
            toast.success(`${resourceName} deleted`);
          }
        }
        
        if (callback) {
          callback(payload);
        }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsSubscribed(true);
          console.log(`Subscribed to ${table} changes`);
        }
      });
      
    return () => {
      supabase.removeChannel(channel);
      setIsSubscribed(false);
    };
  }, [table, event, schema, filter, callback, showToasts]);

  return { isSubscribed, lastEvent };
}
