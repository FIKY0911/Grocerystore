/**
 * Xendit Type Definitions
 * 
 * Type definitions untuk Xendit API responses dan payloads
 */

// ============================================
// Invoice Types
// ============================================

export interface XenditInvoiceCustomer {
  given_names: string;
  email: string;
  mobile_number?: string;
  surname?: string;
  addresses?: Array<{
    city?: string;
    country?: string;
    postal_code?: string;
    state?: string;
    street_line1?: string;
    street_line2?: string
>;
}

export interface XenditInvoiceItem {
  name: string;
  quantity: number;
  price: number;
  category?: string;
  url?: string;
}

export interface XenditInvoiceFee {
  type: string;
  value: number;
}

export interface XenditInvoicePayload {
  external_id: string;
  amount: number;
  payer_email: string;
  description: string;
  customer?: XenditInvoiceCustomer;
  customer_notification_preference?: {
    invoice_created?: string[];
    invoice_reminder?: string[];
    invoice_paid?: string[];
    invoice_expired?: string[];
  };
  success_redirect_url?: string;
  failure_redirect_url?: string;
  payment_methods?: string[];
  currency?: 'IDR' | 'PHP' | 'USD' | 'SGD' | 'MYR' | 'THB' | 'VND';
  invoice_duration?: number;
  items?: XenditInvoiceItem[];
  fees?: XenditInvoiceFee[];
  should_send_email?: boolean;
  should_authenticate_credit_card?: boolean;
  locale?: 'en' | 'id';
}

export interface XenditInvoiceResponse {
  id: string;
  external_id: string;
  user_id: string;
  status: 'PENDING' | 'PAID' | 'SETTLED' | 'EXPIRED';
  merchant_name: string;
  merchant_profile_picture_url: string;
  amount: number;
  payer_email: string;
  description: string;
  expiry_date: string;
  invoice_url: string;
  available_banks: Array<{
    bank_code: string;
    collection_type: string;
    transfer_amount: number;
    bank_branch: string;
    account_holder_name: string;
    identity_amount: number;
  }>;
  available_retail_outlets: Array<{
    retail_outlet_name: string;
    payment_code: string;
    transfer_amount: number;
  }>;
  available_ewallets: Array<{
    ewallet_type: string;
  }>;
  available_qr_codes: Array<{
    qr_code_type: string;
  }>;
  available_direct_debits: Array<{
    direct_debit_type: string;
  }>;
  available_paylaters: Array<{
    paylater_type: string;
  }>;
  should_exclude_credit_card: boolean;
  should_send_email: boolean;
  created: string;
  updated: string;
  currency: string;
  paid_amount?: number;
  paid_at?: string;
  payment_method?: string;
  payment_channel?: string;
  payment_destination?: string;
  fees?: XenditInvoiceFee[];
  items?: XenditInvoiceItem[];
  success_redirect_url?: string;
  failure_redirect_url?: string;
  customer?: XenditInvoiceCustomer;
}

// ============================================
// Webhook Types
// ============================================

export interface XenditWebhookPayload {
  id: string;
  external_id: string;
  user_id: string;
  status: 'PENDING' | 'PAID' | 'SETTLED' | 'EXPIRED';
  merchant_name: string;
  amount: number;
  paid_amount?: number;
  bank_code?: string;
  paid_at?: string;
  payer_email: string;
  description: string;
  adjusted_received_amount?: number;
  fees_paid_amount?: number;
  updated: string;
  created: string;
  currency: string;
  payment_method?: string;
  payment_channel?: string;
  payment_destination?: string;
  payment_id?: string;
}

// ============================================
// Order Status Types
// ============================================

export type OrderStatus = 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export type XenditStatus = 'PENDING' | 'PAID' | 'SETTLED' | 'EXPIRED' | 'FAILED';
