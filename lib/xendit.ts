import { Xendit } from "xendit-node";

/**
 * Xendit Configuration & Client
 * 
 * Environment Variables Required:
 * - XENDIT_SERVER_KEY: Secret key untuk server-side operations (WAJIB)
 * - XENDIT_CALLBACK_TOKEN: Token untuk verifikasi webhook dari Xendit (WAJIB)
 * - NEXT_PUBLIC_XENDIT_KEY: Public key untuk client-side (OPSIONAL)
 */

// ============================================
// Environment Variables Validation
// ============================================

/**
 * Validasi dan ambil XENDIT_SERVER_KEY
 * Digunakan untuk semua operasi server-side seperti create invoice, check status, dll
 */
export function getXenditServerKey(): string {
  const key = process.env.XENDIT_SERVER_KEY?.trim();
  
  if (!key || key.length === 0) {
    throw new Error(
      'XENDIT_SERVER_KEY tidak ditemukan atau kosong. ' +
      'Pastikan sudah di-set di file .env dengan format: XENDIT_SERVER_KEY=xnd_development_xxx'
    );
  }
  
  return key;
}

/**
 * Validasi dan ambil XENDIT_CALLBACK_TOKEN
 * Digunakan untuk verifikasi webhook callback dari Xendit
 */
export function getXenditCallbackToken(): string {
  const token = process.env.XENDIT_CALLBACK_TOKEN?.trim();
  
  if (!token || token.length === 0) {
    throw new Error(
      'XENDIT_CALLBACK_TOKEN tidak ditemukan atau kosong. ' +
      'Pastikan sudah di-set di file .env dengan format: XENDIT_CALLBACK_TOKEN=your_token_here'
    );
  }
  
  return token;
}

/**
 * Ambil NEXT_PUBLIC_XENDIT_KEY (opsional)
 * Digunakan untuk operasi client-side jika diperlukan
 */
export function getXenditPublicKey(): string | null {
  return process.env.NEXT_PUBLIC_XENDIT_KEY?.trim() || null;
}

// ============================================
// Xendit Client Initialization
// ============================================

let xenditClient: Xendit | null = null;

/**
 * Get atau initialize Xendit client (singleton pattern)
 * Menggunakan lazy initialization untuk menghindari error saat build time
 */
export function getXenditClient(): Xendit {
  if (!xenditClient) {
    const secretKey = getXenditServerKey();
    xenditClient = new Xendit({ secretKey });
  }
  return xenditClient;
}

// ============================================
// Helper Functions
// ============================================

/**
 * Create Basic Auth header untuk Xendit API
 * Format: Basic base64(server_key:)
 */
export function getXenditAuthHeader(): string {
  const serverKey = getXenditServerKey();
  return `Basic ${Buffer.from(serverKey + ':').toString('base64')}`;
}

/**
 * Verify webhook callback token
 * @param receivedToken - Token yang diterima dari header x-callback-token
 * @returns true jika valid, false jika tidak
 */
export function verifyCallbackToken(receivedToken: string | null): boolean {
  if (!receivedToken) {
    return false;
  }
  
  try {
    const expectedToken = getXenditCallbackToken();
    return receivedToken === expectedToken;
  } catch (error) {
    console.error('Error verifying callback token:', error);
    return false;
  }
}

/**
 * Map Xendit invoice status ke internal order status
 * @param xenditStatus - Status dari Xendit (PAID, EXPIRED, PENDING, dll)
 * @returns Internal order status (paid, cancelled, pending)
 */
export function mapXenditStatusToOrderStatus(
  xenditStatus: string
): 'paid' | 'cancelled' | 'pending' | 'processing' {
  switch (xenditStatus?.toUpperCase()) {
    case 'PAID':
    case 'SETTLED':
      return 'paid';
    
    case 'EXPIRED':
    case 'FAILED':
      return 'cancelled';
    
    case 'PENDING':
      return 'pending';
    
    default:
      return 'pending';
  }
}

/**
 * Format nomor telepon untuk Xendit
 * Xendit memerlukan format: 62xxx (tanpa +)
 * @param phone - Nomor telepon input
 * @returns Formatted phone number atau null jika tidak valid
 */
export function formatPhoneForXendit(phone: string | undefined | null): string | null {
  if (!phone) return null;
  
  const cleaned = phone.trim().replace(/\s+/g, '');
  
  // Minimal 10 digit
  if (cleaned.length < 10) return null;
  
  // Ganti 0 di awal dengan 62
  if (cleaned.startsWith('0')) {
    return cleaned.replace(/^0/, '62');
  }
  
  // Jika sudah 62, return as is
  if (cleaned.startsWith('62')) {
    return cleaned;
  }
  
  // Jika dimulai dengan +62, hapus +
  if (cleaned.startsWith('+62')) {
    return cleaned.replace(/^\+/, '');
  }
  
  // Default: tambahkan 62 di depan
  return `62${cleaned}`;
}

/**
 * Validate minimum amount untuk Xendit
 * Xendit memerlukan minimum 1000 IDR
 */
export function validateXenditAmount(amount: number): number {
  const minAmount = 1000;
  const roundedAmount = Math.round(amount);
  
  if (roundedAmount < minAmount) {
    console.warn(`Amount ${roundedAmount} kurang dari minimum ${minAmount}, menggunakan ${minAmount}`);
    return minAmount;
  }
  
  return roundedAmount;
}

// ============================================
// Exports
// ============================================

// Export default client untuk backward compatibility
export default getXenditClient();
