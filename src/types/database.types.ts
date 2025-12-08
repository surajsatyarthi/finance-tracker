// Auto-generated database types from Supabase schema
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
      accounts: {
        Row: {
          id: string
          user_id: string
          name: string
          type: string
          balance: number
          currency: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          type?: string
          balance?: number
          currency?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          type?: string
          balance?: number
          currency?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "accounts_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      budgets: {
        Row: {
          id: string
          user_id: string
          category_id: string | null
          category_name: string
          monthly_limit: number
          year: number
          month: number
          spent_amount: number
          remaining_amount: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category_id?: string | null
          category_name: string
          monthly_limit: number
          year: number
          month: number
          spent_amount?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          category_id?: string | null
          category_name?: string
          monthly_limit?: number
          year?: number
          month?: number
          spent_amount?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "budgets_category_id_fkey"
            columns: ["category_id"]
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budgets_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      categories: {
        Row: {
          id: string
          user_id: string
          name: string
          type: string
          parent_category_id: string | null
          color: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          type: string
          parent_category_id?: string | null
          color?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          type?: string
          parent_category_id?: string | null
          color?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_category_id_fkey"
            columns: ["parent_category_id"]
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "categories_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      credit_cards: {
        Row: {
          id: string
          user_id: string
          name: string
          bank: string | null
          card_type: string | null
          last_four_digits: string | null
          credit_limit: number | null
          current_balance: number
          statement_date: number | null
          due_date: number | null
          annual_fee: number | null
          cashback_rate: number | null
          reward_points_rate: number | null
          reward_point_value: number | null
          reward_points_expiry_months: number | null
          partner_merchants: string[] | null
          benefits: Json | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          bank?: string | null
          card_type?: string | null
          last_four_digits?: string | null
          credit_limit?: number | null
          current_balance?: number
          statement_date?: number | null
          due_date?: number | null
          annual_fee?: number | null
          cashback_rate?: number | null
          reward_points_rate?: number | null
          reward_point_value?: number | null
          reward_points_expiry_months?: number | null
          partner_merchants?: string[] | null
          benefits?: Json | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          bank?: string | null
          card_type?: string | null
          last_four_digits?: string | null
          credit_limit?: number | null
          current_balance?: number
          statement_date?: number | null
          due_date?: number | null
          annual_fee?: number | null
          cashback_rate?: number | null
          reward_points_rate?: number | null
          reward_point_value?: number | null
          reward_points_expiry_months?: number | null
          partner_merchants?: string[] | null
          benefits?: Json | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_cards_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      credit_card_transactions: {
        Row: {
          id: string
          user_id: string
          credit_card_id: string
          amount: number
          type: string
          description: string | null
          transaction_date: string
          emi_months: number | null
          emi_amount: number | null
          emi_remaining: number | null
          interest_rate: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          credit_card_id: string
          amount: number
          type: string
          description?: string | null
          transaction_date: string
          emi_months?: number | null
          emi_amount?: number | null
          emi_remaining?: number | null
          interest_rate?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          credit_card_id?: string
          amount?: number
          type?: string
          description?: string | null
          transaction_date?: string
          emi_months?: number | null
          emi_amount?: number | null
          emi_remaining?: number | null
          interest_rate?: number | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_card_transactions_credit_card_id_fkey"
            columns: ["credit_card_id"]
            referencedRelation: "credit_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_card_transactions_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      goals: {
        Row: {
          id: string
          user_id: string
          name: string
          target_amount: number
          current_amount: number
          target_date: string | null
          category: string | null
          priority: string
          is_completed: boolean
          progress_percentage: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          target_amount: number
          current_amount?: number
          target_date?: string | null
          category?: string | null
          priority?: string
          is_completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          target_amount?: number
          current_amount?: number
          target_date?: string | null
          category?: string | null
          priority?: string
          is_completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "goals_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      loans: {
        Row: {
          id: string
          user_id: string
          name: string
          type: string
          principal_amount: number
          current_balance: number
          interest_rate: number
          emi_amount: number
          total_emis: number
          emis_paid: number
          emis_remaining: number | null
          start_date: string
          end_date: string | null
          next_emi_date: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          type?: string
          principal_amount: number
          current_balance: number
          interest_rate: number
          emi_amount: number
          total_emis: number
          emis_paid?: number
          start_date: string
          end_date?: string | null
          next_emi_date?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          type?: string
          principal_amount?: number
          current_balance?: number
          interest_rate?: number
          emi_amount?: number
          total_emis?: number
          emis_paid?: number
          start_date?: string
          end_date?: string | null
          next_emi_date?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "loans_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      loan_payments: {
        Row: {
          id: string
          user_id: string
          loan_id: string
          amount: number
          principal_amount: number
          interest_amount: number
          payment_date: string
          balance_after_payment: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          loan_id: string
          amount: number
          principal_amount: number
          interest_amount: number
          payment_date: string
          balance_after_payment: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          loan_id?: string
          amount?: number
          principal_amount?: number
          interest_amount?: number
          payment_date?: string
          balance_after_payment?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "loan_payments_loan_id_fkey"
            columns: ["loan_id"]
            referencedRelation: "loans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loan_payments_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          account_id: string | null
          amount: number
          type: string
          category_id: string | null
          subcategory: string | null
          description: string | null
          payment_method: string
          date: string
          month: number | null
          year: number | null
          is_recurring: boolean
          recurring_pattern: Json | null
          tags: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          account_id?: string | null
          amount: number
          type: string
          category_id?: string | null
          subcategory?: string | null
          description?: string | null
          payment_method?: string
          date: string
          is_recurring?: boolean
          recurring_pattern?: Json | null
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          account_id?: string | null
          amount?: number
          type?: string
          category_id?: string | null
          subcategory?: string | null
          description?: string | null
          payment_method?: string
          date?: string
          is_recurring?: boolean
          recurring_pattern?: Json | null
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_account_id_fkey"
            columns: ["account_id"]
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_category_id_fkey"
            columns: ["category_id"]
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      },
      investments: {
        Row: {
          id: string
          user_id: string
          name: string
          type: string
          amount_invested: number
          current_value: number
          quantity: number | null
          purchase_date: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          type: string
          amount_invested: number
          current_value: number
          quantity?: number | null
          purchase_date?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          type?: string
          amount_invested?: number
          current_value?: number
          quantity?: number | null
          purchase_date?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "investments_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      },
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          default_currency: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name?: string | null
          default_currency?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          default_currency?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}