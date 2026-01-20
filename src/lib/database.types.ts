export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          role: 'operator' | 'technician' | 'admin'
          full_name: string | null
          email: string | null
          created_at: string
        }
        Insert: {
          id: string
          role?: 'operator' | 'technician' | 'admin'
          full_name?: string | null
          email?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          role?: 'operator' | 'technician' | 'admin'
          full_name?: string | null
          email?: string | null
          created_at?: string
        }
      }
      machines: {
        Row: {
          id: string
          code: string
          name: string
          brand: string | null
          model: string | null
          serial_number: string | null
          year_of_manufacture: number | null
          location: string
          description: string | null
          main_image_url: string | null
          qr_code_uuid: string
          created_at: string
        }
        Insert: {
          id?: string
          code: string
          name: string
          brand?: string | null
          model?: string | null
          serial_number?: string | null
          year_of_manufacture?: number | null
          location: string
          description?: string | null
          main_image_url?: string | null
          qr_code_uuid?: string
          created_at?: string
        }
        Update: {
          id?: string
          code?: string
          name?: string
          brand?: string | null
          model?: string | null
          serial_number?: string | null
          year_of_manufacture?: number | null
          location?: string
          description?: string | null
          main_image_url?: string | null
          qr_code_uuid?: string
          created_at?: string
        }
      }
      checkins: {
        Row: {
          id: string
          user_id: string
          machine_id: string
          shift_start: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          machine_id: string
          shift_start?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          machine_id?: string
          shift_start?: string
          created_at?: string
        }
      }
    }
  }
}
