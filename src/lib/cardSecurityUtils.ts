/**
 * PCI DSS-Compliant Card Security Utilities
 * 
 * CREATED: Phase 1 - Security (Dec 26, 2025)
 * PURPOSE: Implement industry-standard masking for sensitive card data
 * 
 * SECURITY STANDARD: PCI DSS (Payment Card Industry Data Security Standard)
 * 
 * These utilities implement industry-standard masking for sensitive card data.
 * 
 * PCI DSS Requirements:
 * - Requirement 3.3: Mask PAN (Primary Account Number) when displayed
 *   → Show first 6 + last 4 digits maximum, mask the rest
 * - Requirement 3.2: DO NOT store CVV/CVC after authorization
 *   → CVV should be deleted after initial use in production apps
 * 
 * USAGE EXAMPLES:
 *   maskCardNumber('4315812748438017') → '431581 XXXX XX80 17' (PCI-compliant)
 *   maskCVV('458') → 'XXX' (always masked)
 *   getRealCardNumber('4315812748438017') → '4315 8127 4843 8017' (for copy button only)
 * 
 * USED IN:
 *   - src/app/(auth)/accounts/page.tsx (Lines 165-190)
 *   - src/app/(auth)/credit-cards/page.tsx (Lines 227-273)
 * 
 * WARNING: This app stores CVV for personal use only.
 * For production financial apps, CVV MUST be deleted after first viewing.
 */

/**
 * PCI-compliant card number masking
 * 
 * Standard: Show first 6 digits (BIN/IIN) + last 4 digits, mask middle
 * Example: 4315812748438017 → 431581XXXXXX8017
 * 
 * @param cardNumber - Full card number from database (16 digits)
 * @returns Masked card number with first 6 + last 4 visible
 */
export function maskCardNumber(cardNumber: string | undefined): string {
    if (!cardNumber) return 'XXXX XXXX XXXX XXXX';

    // Remove any existing spaces or formatting
    const cleaned = cardNumber.replace(/\s/g, '');

    // Validate length
    if (cleaned.length < 10) return 'XXXX XXXX XXXX XXXX';
    if (cleaned.length !== 16 && cleaned.length !== 15) {
        console.warn(`Invalid card number length: ${cleaned.length} digits`);
    }

    // PCI-compliant masking: first 6 + last 4
    const first6 = cleaned.slice(0, 6);
    const last4 = cleaned.slice(-4);
    const middleLength = cleaned.length - 10; // Usually 6 for 16-digit cards
    const masked = 'X'.repeat(middleLength);

    // Format with spaces (4-4-4-4 pattern)
    const full = `${first6}${masked}${last4}`;
    return full.match(/.{1,4}/g)?.join(' ') || full;
}

/**
 * CVV should NEVER be displayed in production apps (PCI DSS 3.2)
 * 
 * WARNING: For personal use only. Production apps must:
 * 1. Delete CVV from database after authorization
 * 2. Never display CVV on screen
 * 
 * This function returns masked CVV for display purposes only.
 * 
 * @param cvv - CVV from database (should not exist in production!)
 * @returns Always returns "XXX" (masked)
 */
export function maskCVV(cvv: string | undefined): string {
    // PCI DSS: CVV must never be stored or displayed
    // For personal dev use, we mask it completely
    return 'XXX';
}

/**
 * Get real card number for clipboard copy (with user warning)
 * 
 * NOTE: In production, copying real PAN should require re-authentication
 * and be logged for PCI compliance audit trail.
 * 
 * @param cardNumber - Full card number
 * @returns Formatted card number for copying
 */
export function getRealCardNumber(cardNumber: string | undefined): string {
    if (!cardNumber) return '';
    const cleaned = cardNumber.replace(/\s/g, '');
    // Format with spaces
    return cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
}

/**
 * Get real CVV for clipboard copy
 * 
 * WARNING: In production, this should:
 * 1. Not exist (CVV should not be stored)
 * 2. Require re-authentication
 * 3. Be logged for security audit
 * 
 * @param cvv - Real CVV from database
 * @returns Real CVV (personal use only)
 */
export function getRealCVV(cvv: string | undefined): string {
    if (!cvv) return '';
    // WARNING: Violates PCI DSS 3.2 - for personal dev use only
    return cvv;
}

/**
 * Mask account number (privacy protection, not PCI-regulated)
 * 
 * Shows first 4 + last 4 digits for account numbers
 * Example: 127272011115502 → 1272XXXXX5502
 * 
 * @param accountNumber - Full account number
 * @returns Masked account number
 */
export function maskAccountNumber(accountNumber: string | undefined): string {
    if (!accountNumber) return '-';

    const cleaned = accountNumber.replace(/\s/g, '');
    if (cleaned.length < 8) return accountNumber; // Too short to mask meaningfully

    const first4 = cleaned.slice(0, 4);
    const last4 = cleaned.slice(-4);
    const middleLength = cleaned.length - 8;
    const masked = 'X'.repeat(middleLength);

    return `${first4}${masked}${last4}`;
}
