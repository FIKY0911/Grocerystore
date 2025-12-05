// lib/utils/dateFormatter.ts

/**
 * Format tanggal ke format Indonesia
 * @param date - ISO string atau Date object
 * @param options - Opsi format tambahan
 * @returns Formatted date string
 */
export function formatDate(
  date: string | Date,
  options?: {
    includeTime?: boolean;
    short?: boolean;
  }
): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  if (options?.short) {
    return dateObj.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  const baseOptions: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "long",
    year: "numeric",
  };

  if (options?.includeTime) {
    baseOptions.hour = "2-digit";
    baseOptions.minute = "2-digit";
  }

  return dateObj.toLocaleDateString("id-ID", baseOptions);
}

/**
 * Hitung waktu relatif (contoh: "2 jam yang lalu")
 * @param date - ISO string atau Date object
 * @returns Relative time string
 */
export function getRelativeTime(date: string | Date): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) {
    return "Baru saja";
  } else if (diffMinutes < 60) {
    return `${diffMinutes} menit yang lalu`;
  } else if (diffHours < 24) {
    return `${diffHours} jam yang lalu`;
  } else if (diffDays < 7) {
    return `${diffDays} hari yang lalu`;
  } else {
    return formatDate(dateObj, { short: true });
  }
}

/**
 * Cek apakah tanggal sudah lewat
 * @param date - ISO string atau Date object
 * @returns Boolean
 */
export function isPastDate(date: string | Date): boolean {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj.getTime() < Date.now();
}

/**
 * Format countdown timer (contoh: "2 jam 30 menit")
 * @param date - ISO string atau Date object (target date)
 * @returns Countdown string
 */
export function getCountdown(date: string | Date): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = dateObj.getTime() - now.getTime();

  if (diffMs <= 0) {
    return "Kadaluarsa";
  }

  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) {
    return `${diffDays} hari ${diffHours % 24} jam`;
  } else if (diffHours > 0) {
    return `${diffHours} jam ${diffMinutes % 60} menit`;
  } else if (diffMinutes > 0) {
    return `${diffMinutes} menit`;
  } else {
    return `${diffSeconds} detik`;
  }
}

/**
 * Format untuk form input datetime-local
 * @param date - ISO string atau Date object
 * @returns Formatted string for datetime-local input
 */
export function toDateTimeLocalString(date: string | Date): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getDate()).padStart(2, "0");
  const hours = String(dateObj.getHours()).padStart(2, "0");
  const minutes = String(dateObj.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}
