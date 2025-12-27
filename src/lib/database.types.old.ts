export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      accounts: {
        Row: {
          account_number: string | null
          balance: number | null
          card_cvv: string | null
          card_expiry_month: number | null
          card_expiry_year: number | null
          card_number: string | null
          created_at: string | null
          currency: string | null
          customer_id: string | null
          id: string
          ifsc_code: string | null
          is_active: boolean | null
          name: string
          type: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          account_number?: string | null
          balance?: number | null
          card_cvv?: string | null
          card_expiry_month?: number | null
          card_expiry_year?: number | null
          card_number?: string | null
          created_at?: string | null
          currency?: string | null
          customer_id?: string | null
          id?: string
          ifsc_code?: string | null
          is_active?: boolean | null
          name: string
          type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          account_number?: string | null
          balance?: number | null
          card_cvv?: string | null
          card_expiry_month?: number | null
          card_expiry_year?: number | null
          card_number?: string | null
          created_at?: string | null
          currency?: string | null
          customer_id?: string | null
          id?: string
          ifsc_code?: string | null
          is_active?: boolean | null
          name?: string
          type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "accounts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_financial_summary"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "accounts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: unknown
          new_values: Json | null
          old_values: Json | null
          record_id: string
          table_name: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          record_id: string
          table_name: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string
          table_name?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_financial_summary"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      budgets: {
        Row: {
          category_id: string | null
          category_name: string
          created_at: string | null
          id: string
          month: number
          monthly_limit: number
          remaining_amount: number | null
          spent_amount: number | null
          updated_at: string | null
          user_id: string | null
          year: number
        }
        Insert: {
          category_id?: string | null
          category_name: string
          created_at?: string | null
          id?: string
          month: number
          monthly_limit: number
          remaining_amount?: number | null
          spent_amount?: number | null
          updated_at?: string | null
          user_id?: string | null
          year: number
        }
        Update: {
          category_id?: string | null
          category_name?: string
          created_at?: string | null
          id?: string
          month?: number
          monthly_limit?: number
          remaining_amount?: number | null
          spent_amount?: number | null
          updated_at?: string | null
          user_id?: string | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "budgets_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budgets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_financial_summary"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "budgets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          color: string | null
          created_at: string | null
          id: string
          name: string
          parent_category_id: string | null
          type: string
          user_id: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          id?: string
          name: string
          parent_category_id?: string | null
          type: string
          user_id?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          id?: string
          name?: string
          parent_category_id?: string | null
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_category_id_fkey"
            columns: ["parent_category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "categories_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_financial_summary"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "categories_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_card_transactions: {
        Row: {
          amount: number
          created_at: string | null
          credit_card_id: string | null
          description: string | null
          emi_amount: number | null
          emi_months: number | null
          emi_remaining: number | null
          id: string
          interest_rate: number | null
          transaction_date: string
          type: string
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          credit_card_id?: string | null
          description?: string | null
          emi_amount?: number | null
          emi_months?: number | null
          emi_remaining?: number | null
          id?: string
          interest_rate?: number | null
          transaction_date: string
          type: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          credit_card_id?: string | null
          description?: string | null
          emi_amount?: number | null
          emi_months?: number | null
          emi_remaining?: number | null
          id?: string
          interest_rate?: number | null
          transaction_date?: string
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "credit_card_transactions_credit_card_id_fkey"
            columns: ["credit_card_id"]
            isOneToOne: false
            referencedRelation: "credit_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_card_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_financial_summary"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "credit_card_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_cards: {
        Row: {
          annual_fee: number | null
          bank: string | null
          benefits: Json | null
          card_network: string | null
          card_number: string | null
          card_type: string | null
          cashback_rate: number | null
          created_at: string | null
          credit_limit: number | null
          current_balance: number | null
          cvv: string | null
          due_date: number | null
          expiry_date: string | null
          id: string
          is_active: boolean | null
          last_four_digits: string | null
          last_statement_amount: number | null
          last_statement_date: string | null
          name: string
          partner_merchants: string[] | null
          reward_point_value: number | null
          reward_points_expiry_months: number | null
          reward_points_rate: number | null
          statement_date: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          annual_fee?: number | null
          bank?: string | null
          benefits?: Json | null
          card_network?: string | null
          card_number?: string | null
          card_type?: string | null
          cashback_rate?: number | null
          created_at?: string | null
          credit_limit?: number | null
          current_balance?: number | null
          cvv?: string | null
          due_date?: number | null
          expiry_date?: string | null
          id?: string
          is_active?: boolean | null
          last_four_digits?: string | null
          last_statement_amount?: number | null
          last_statement_date?: string | null
          name: string
          partner_merchants?: string[] | null
          reward_point_value?: number | null
          reward_points_expiry_months?: number | null
          reward_points_rate?: number | null
          statement_date?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          annual_fee?: number | null
          bank?: string | null
          benefits?: Json | null
          card_network?: string | null
          card_number?: string | null
          card_type?: string | null
          cashback_rate?: number | null
          created_at?: string | null
          credit_limit?: number | null
          current_balance?: number | null
          cvv?: string | null
          due_date?: number | null
          expiry_date?: string | null
          id?: string
          is_active?: boolean | null
          last_four_digits?: string | null
          last_statement_amount?: number | null
          last_statement_date?: string | null
          name?: string
          partner_merchants?: string[] | null
          reward_point_value?: number | null
          reward_points_expiry_months?: number | null
          reward_points_rate?: number | null
          statement_date?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "credit_cards_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_financial_summary"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "credit_cards_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback: {
        Row: {
          created_at: string
          id: string
          images: string[] | null
          message: string | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          images?: string[] | null
          message?: string | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          images?: string[] | null
          message?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      fixed_deposits: {
        Row: {
          account_number: string | null
          auto_renew: boolean | null
          bank_name: string
          created_at: string | null
          id: string
          interest_earned: number | null
          interest_rate: number
          is_active: boolean | null
          maturity_amount: number | null
          maturity_date: string
          principal_amount: number
          start_date: string
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          account_number?: string | null
          auto_renew?: boolean | null
          bank_name: string
          created_at?: string | null
          id?: string
          interest_earned?: number | null
          interest_rate: number
          is_active?: boolean | null
          maturity_amount?: number | null
          maturity_date: string
          principal_amount: number
          start_date: string
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          account_number?: string | null
          auto_renew?: boolean | null
          bank_name?: string
          created_at?: string | null
          id?: string
          interest_earned?: number | null
          interest_rate?: number
          is_active?: boolean | null
          maturity_amount?: number | null
          maturity_date?: string
          principal_amount?: number
          start_date?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      goals: {
        Row: {
          category: string | null
          created_at: string | null
          current_amount: number | null
          id: string
          is_completed: boolean | null
          name: string
          priority: string | null
          progress_percentage: number | null
          target_amount: number
          target_date: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          current_amount?: number | null
          id?: string
          is_completed?: boolean | null
          name: string
          priority?: string | null
          progress_percentage?: number | null
          target_amount: number
          target_date?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          current_amount?: number | null
          id?: string
          is_completed?: boolean | null
          name?: string
          priority?: string | null
          progress_percentage?: number | null
          target_amount?: number
          target_date?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "goals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_financial_summary"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "goals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      investments: {
        Row: {
          amount_invested: number
          created_at: string
          current_value: number
          id: string
          is_active: boolean | null
          name: string
          purchase_date: string | null
          quantity: number | null
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_invested?: number
          created_at?: string
          current_value?: number
          id?: string
          is_active?: boolean | null
          name: string
          purchase_date?: string | null
          quantity?: number | null
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_invested?: number
          created_at?: string
          current_value?: number
          id?: string
          is_active?: boolean | null
          name?: string
          purchase_date?: string | null
          quantity?: number | null
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      loan_payments: {
        Row: {
          amount: number
          balance_after_payment: number
          created_at: string | null
          id: string
          interest_amount: number
          loan_id: string | null
          payment_date: string
          principal_amount: number
          user_id: string | null
        }
        Insert: {
          amount: number
          balance_after_payment: number
          created_at?: string | null
          id?: string
          interest_amount: number
          loan_id?: string | null
          payment_date: string
          principal_amount: number
          user_id?: string | null
        }
        Update: {
          amount?: number
          balance_after_payment?: number
          created_at?: string | null
          id?: string
          interest_amount?: number
          loan_id?: string | null
          payment_date?: string
          principal_amount?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "loan_payments_loan_id_fkey"
            columns: ["loan_id"]
            isOneToOne: false
            referencedRelation: "loans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loan_payments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_financial_summary"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "loan_payments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      loans: {
        Row: {
          created_at: string | null
          current_balance: number
          emi_amount: number | null
          emis_paid: number | null
          emis_remaining: number | null
          end_date: string | null
          id: string
          interest_rate: number | null
          is_active: boolean | null
          linked_credit_card_id: string | null
          name: string
          next_emi_date: string | null
          principal_amount: number
          start_date: string
          total_emis: number | null
          type: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          current_balance: number
          emi_amount?: number | null
          emis_paid?: number | null
          emis_remaining?: number | null
          end_date?: string | null
          id?: string
          interest_rate?: number | null
          is_active?: boolean | null
          linked_credit_card_id?: string | null
          name: string
          next_emi_date?: string | null
          principal_amount: number
          start_date: string
          total_emis?: number | null
          type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          current_balance?: number
          emi_amount?: number | null
          emis_paid?: number | null
          emis_remaining?: number | null
          end_date?: string | null
          id?: string
          interest_rate?: number | null
          is_active?: boolean | null
          linked_credit_card_id?: string | null
          name?: string
          next_emi_date?: string | null
          principal_amount?: number
          start_date?: string
          total_emis?: number | null
          type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "loans_linked_credit_card_id_fkey"
            columns: ["linked_credit_card_id"]
            isOneToOne: false
            referencedRelation: "credit_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loans_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_financial_summary"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "loans_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      pay_later_services: {
        Row: {
          available_amount: number | null
          created_at: string | null
          credit_limit: number | null
          current_due: number | null
          due_schedule: string | null
          id: string
          interest_rate: number | null
          last_used: string | null
          next_due_date: string | null
          penalty_fee: number | null
          service_code: string | null
          service_name: string
          status: string | null
          updated_at: string | null
          used_amount: number | null
          user_id: string
        }
        Insert: {
          available_amount?: number | null
          created_at?: string | null
          credit_limit?: number | null
          current_due?: number | null
          due_schedule?: string | null
          id?: string
          interest_rate?: number | null
          last_used?: string | null
          next_due_date?: string | null
          penalty_fee?: number | null
          service_code?: string | null
          service_name: string
          status?: string | null
          updated_at?: string | null
          used_amount?: number | null
          user_id: string
        }
        Update: {
          available_amount?: number | null
          created_at?: string | null
          credit_limit?: number | null
          current_due?: number | null
          due_schedule?: string | null
          id?: string
          interest_rate?: number | null
          last_used?: string | null
          next_due_date?: string | null
          penalty_fee?: number | null
          service_code?: string | null
          service_name?: string
          status?: string | null
          updated_at?: string | null
          used_amount?: number | null
          user_id?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          account_id: string | null
          amount: number
          category_id: string | null
          created_at: string | null
          date: string
          description: string | null
          from_account_id: string | null
          id: string
          is_recurring: boolean | null
          is_transfer: boolean | null
          month: number | null
          payment_method: string | null
          recurring_pattern: Json | null
          subcategory: string | null
          tags: string[] | null
          to_account_id: string | null
          transfer_reference_id: string | null
          type: string
          updated_at: string | null
          user_id: string | null
          year: number | null
        }
        Insert: {
          account_id?: string | null
          amount: number
          category_id?: string | null
          created_at?: string | null
          date: string
          description?: string | null
          from_account_id?: string | null
          id?: string
          is_recurring?: boolean | null
          is_transfer?: boolean | null
          month?: number | null
          payment_method?: string | null
          recurring_pattern?: Json | null
          subcategory?: string | null
          tags?: string[] | null
          to_account_id?: string | null
          transfer_reference_id?: string | null
          type: string
          updated_at?: string | null
          user_id?: string | null
          year?: number | null
        }
        Update: {
          account_id?: string | null
          amount?: number
          category_id?: string | null
          created_at?: string | null
          date?: string
          description?: string | null
          from_account_id?: string | null
          id?: string
          is_recurring?: boolean | null
          is_transfer?: boolean | null
          month?: number | null
          payment_method?: string | null
          recurring_pattern?: Json | null
          subcategory?: string | null
          tags?: string[] | null
          to_account_id?: string | null
          transfer_reference_id?: string | null
          type?: string
          updated_at?: string | null
          user_id?: string | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_from_account_id_fkey"
            columns: ["from_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_to_account_id_fkey"
            columns: ["to_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_financial_summary"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_sessions: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          ip_address: unknown
          is_active: boolean | null
          session_token: string
          updated_at: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          id?: string
          ip_address?: unknown
          is_active?: boolean | null
          session_token: string
          updated_at?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          ip_address?: unknown
          is_active?: boolean | null
          session_token?: string
          updated_at?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_financial_summary"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          default_currency: string | null
          email: string
          id: string
          name: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          default_currency?: string | null
          email: string
          id?: string
          name?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          default_currency?: string | null
          email?: string
          id?: string
          name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      user_financial_summary: {
        Row: {
          active_credit_cards: number | null
          active_goals: number | null
          active_loans: number | null
          email: string | null
          net_worth: number | null
          total_assets: number | null
          total_liabilities: number | null
          updated_at: string | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      check_data_integrity: {
        Args: never
        Returns: {
          count: number
          issue: string
          table_name: string
        }[]
      }
      check_rate_limit: {
        Args: { max_ops?: number; table_name: string }
        Returns: boolean
      }
      cleanup_expired_sessions: { Args: never; Returns: number }
      get_account_balance_with_transfers: {
        Args: { p_account_id: string }
        Returns: number
      }
      process_transfer_transaction: {
        Args: {
          p_amount: number
          p_date?: string
          p_description?: string
          p_from_account_id: string
          p_to_account_id: string
          p_user_id: string
        }
        Returns: Json
      }
      sanitize_sensitive_data: {
        Args: { data: Json; table_name: string }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
