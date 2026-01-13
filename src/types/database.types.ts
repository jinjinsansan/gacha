export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          balance: string;
          created_at: string;
          deposit_address: string;
          email: string;
          id: string;
          updated_at: string;
        };
        Insert: {
          balance?: string;
          created_at?: string;
          deposit_address: string;
          email: string;
          id: string;
          updated_at?: string;
        };
        Update: {
          balance?: string;
          created_at?: string;
          deposit_address?: string;
          email?: string;
          id?: string;
          updated_at?: string;
        };
      };
      gacha_patterns: {
        Row: {
          base_result: boolean;
          currency: string;
          effect_1: string;
          effect_2: string;
          id: number;
          machine_color: string;
          prize_amount: string;
          weight: number;
          video_url: string;
        };
        Insert: {
          base_result: boolean;
          currency: string;
          effect_1: string;
          effect_2: string;
          id: number;
          machine_color: string;
          prize_amount: string;
          weight?: number;
          video_url: string;
        };
        Update: {
          base_result?: boolean;
          currency?: string;
          effect_1?: string;
          effect_2?: string;
          id?: number;
          machine_color?: string;
          prize_amount?: string;
          weight?: number;
          video_url?: string;
        };
      };
      transactions: {
        Row: {
          amount: string;
          created_at: string;
          gacha_history_id: string | null;
          id: string;
          status: string;
          tx_hash: string | null;
          type: string;
          user_id: string;
          wallet_address: string | null;
        };
        Insert: {
          amount: string;
          created_at?: string;
          gacha_history_id?: string | null;
          id?: string;
          status?: string;
          tx_hash?: string | null;
          type: string;
          user_id: string;
          wallet_address?: string | null;
        };
        Update: {
          amount?: string;
          created_at?: string;
          gacha_history_id?: string | null;
          id?: string;
          status?: string;
          tx_hash?: string | null;
          type?: string;
          user_id?: string;
          wallet_address?: string | null;
        };
      };
      gacha_history: {
        Row: {
          final_result: boolean;
          id: string;
          pattern_id: number;
          played_at: string;
          prize_amount: string;
          rtp_at_play: number;
          user_id: string;
        };
        Insert: {
          final_result: boolean;
          id?: string;
          pattern_id: number;
          played_at?: string;
          prize_amount?: string;
          rtp_at_play: number;
          user_id: string;
        };
        Update: {
          final_result?: boolean;
          id?: string;
          pattern_id?: number;
          played_at?: string;
          prize_amount?: string;
          rtp_at_play?: number;
          user_id?: string;
        };
      };
      campaign_codes: {
        Row: {
          code: string;
          created_at: string;
          current_uses: number;
          expires_at: string | null;
          id: string;
          is_active: boolean;
          max_uses: number;
          plays_granted: number;
        };
        Insert: {
          code: string;
          created_at?: string;
          current_uses?: number;
          expires_at?: string | null;
          id?: string;
          is_active?: boolean;
          max_uses: number;
          plays_granted?: number;
        };
        Update: {
          code?: string;
          created_at?: string;
          current_uses?: number;
          expires_at?: string | null;
          id?: string;
          is_active?: boolean;
          max_uses?: number;
          plays_granted?: number;
        };
      };
      code_redemptions: {
        Row: {
          code_id: string;
          id: string;
          redeemed_at: string;
          user_id: string;
        };
        Insert: {
          code_id: string;
          id?: string;
          redeemed_at?: string;
          user_id: string;
        };
        Update: {
          code_id?: string;
          id?: string;
          redeemed_at?: string;
          user_id?: string;
        };
      };
      system_settings: {
        Row: {
          key: string;
          updated_at: string;
          value: string;
        };
        Insert: {
          key: string;
          updated_at?: string;
          value: string;
        };
        Update: {
          key?: string;
          updated_at?: string;
          value?: string;
        };
      };
      admin_users: {
        Row: {
          created_at: string;
          id: string;
          role: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          role?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          role?: string | null;
          user_id?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

export type SupabaseTable<Row extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][Row];
