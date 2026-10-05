import { createClient } from '@supabase/supabase-js';
import { Channel } from '../types/channel';
import initialChannelsData from '../data/initialChannels.json';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://bvcqkqxcxcqpnhbwaslp.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2Y3FrcXhjeGNxcG5oYndhc2xwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEzODc0MTgsImV4cCI6MjA5Njk2MzQxOH0._0S5fjPuyOvmFOs7dYEuJ6CxbsDnUrDPNZ8J_hCStxE';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const LOCAL_STORAGE_KEY = 'tvlegal5_custom_channels_v1';
const FAVORITES_KEY = 'tvlegal5_favorites_v1';
const RECENT_KEY = 'tvlegal5_recent_watched_v1';

// Get stored channels from localStorage if any custom edits were saved locally
function getLocalCustomChannels(): Channel[] | null {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to parse local channels', e);
  }
  return null;
}

export function saveLocalChannels(channels: Channel[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(channels));
  } catch (e) {
    console.warn('Failed to save channels locally', e);
  }
}

// Fetch all channels: Supabase -> localStorage -> bundled JSON seed
export async function fetchAllChannels(): Promise<Channel[]> {
  try {
    const { data, error } = await supabase
      .from('channels')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true });

    if (!error && data && data.length > 0) {
      // Merge with any locally added channels that might not be in supabase yet
      const localChannels = getLocalCustomChannels();
      if (localChannels && localChannels.length > 0) {
        // If local has extra or modified items, merge intelligently
        const dbIds = new Set(data.map(c => c.id));
        const customLocalOnly = localChannels.filter(c => !dbIds.has(c.id));
        const combined = [...customLocalOnly, ...data];
        saveLocalChannels(combined);
        return combined;
      }
      saveLocalChannels(data);
      return data;
    }
  } catch (err) {
    console.warn('Supabase fetch error, fallback to cache:', err);
  }

  // Fallback 1: localStorage
  const cached = getLocalCustomChannels();
  if (cached && cached.length > 0) {
    return cached;
  }

  // Fallback 2: bundled JSON seed (220 channels)
  const seed = (initialChannelsData as Channel[]) || [];
  saveLocalChannels(seed);
  return seed;
}

// Add a channel (Supabase + localStorage fallback)
export async function createChannel(newChannel: Omit<Channel, 'id' | 'created_at' | 'updated_at'>): Promise<Channel> {
  const channelToInsert: Channel = {
    ...newChannel,
    id: crypto.randomUUID ? crypto.randomUUID() : `chan_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  try {
    const { data, error } = await supabase
      .from('channels')
      .insert([channelToInsert])
      .select()
      .single();

    if (!error && data) {
      return data;
    }
  } catch (err) {
    console.warn('Supabase insert failed, storing locally:', err);
  }

  // Update local cache
  const existing = getLocalCustomChannels() || (initialChannelsData as Channel[]);
  const updated = [channelToInsert, ...existing];
  saveLocalChannels(updated);

  return channelToInsert;
}

// Update a channel
export async function updateChannel(id: string, updates: Partial<Channel>): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('channels')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (!error) {
      // Also update local cache
      const existing = getLocalCustomChannels() || (initialChannelsData as Channel[]);
      const updated = existing.map(c => c.id === id ? { ...c, ...updates, updated_at: new Date().toISOString() } : c);
      saveLocalChannels(updated);
      return true;
    }
  } catch (err) {
    console.warn('Supabase update failed, saving locally:', err);
  }

  // Local fallback
  const existing = getLocalCustomChannels() || (initialChannelsData as Channel[]);
  const updated = existing.map(c => c.id === id ? { ...c, ...updates, updated_at: new Date().toISOString() } : c);
  saveLocalChannels(updated);
  return true;
}

// Delete a channel
export async function deleteChannel(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('channels')
      .delete()
      .eq('id', id);

    if (!error) {
      const existing = getLocalCustomChannels() || (initialChannelsData as Channel[]);
      const updated = existing.filter(c => c.id !== id);
      saveLocalChannels(updated);
      return true;
    }
  } catch (err) {
    console.warn('Supabase delete failed, removing locally:', err);
  }

  // Local fallback
  const existing = getLocalCustomChannels() || (initialChannelsData as Channel[]);
  const updated = existing.filter(c => c.id !== id);
  saveLocalChannels(updated);
  return true;
}

// Favorites helper
export function getFavoriteIds(): string[] {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function toggleFavorite(channelId: string): string[] {
  const current = getFavoriteIds();
  const index = current.indexOf(channelId);
  let updated: string[];
  if (index >= 0) {
    updated = current.filter(id => id !== channelId);
  } else {
    updated = [...current, channelId];
  }
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
  return updated;
}

// Recently watched helper
export function getRecentWatchedIds(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addRecentWatched(channelId: string): void {
  try {
    const current = getRecentWatchedIds().filter(id => id !== channelId);
    const updated = [channelId, ...current].slice(0, 15);
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
}
