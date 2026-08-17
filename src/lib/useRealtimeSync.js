'use client';

import { useEffect } from 'react';
import { supabase } from './supabase-client';

/**
 * Custom React hook to subscribe to real-time changes across Supabase tables
 * @param {Array<string>} tables - List of tables to watch (e.g. ['orders', 'gst_applications'])
 * @param {Function} onEvent - Callback when an INSERT / UPDATE / DELETE happens
 */
export function useRealtimeSync(tables = [], onEvent) {
  useEffect(() => {
    if (!supabase || !tables || tables.length === 0 || typeof onEvent !== 'function') return;

    const channelName = `realtime-admin-${tables.join('-')}-${Date.now()}`;
    const channel = supabase.channel(channelName);

    tables.forEach((table) => {
      channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table,
        },
        (payload) => {
          console.log(`[Realtime Sync] ${table} event:`, payload.eventType, payload);
          onEvent(payload, table);
        }
      );
    });

    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        // console.log(`[Realtime Sync] Subscribed to [${tables.join(', ')}]`);
      }
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [JSON.stringify(tables), onEvent]);
}
