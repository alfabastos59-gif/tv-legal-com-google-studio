export interface Channel {
  id: string;
  name: string;
  url: string;
  category: string;
  thumbnail?: string | null;
  active: boolean;
  sort_order?: number;
  created_at?: string;
  updated_at?: string;
  source?: string | null;
}

export type CategoryName = string;
