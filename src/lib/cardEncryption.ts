/**
 * Offset Encryption Utility
 * Adds +1 to each digit before storage
 * App displays offset values - user subtracts 1 manually when needed
 */

/**
 * Apply +1 offset to a numeric string (for storage and display)
 * Example: "1234" -> "2345"
 * Example: "203" -> "204", "112" -> "223"
 */
export function applyOffset(value: string): string {
    return value
        .split('')
        .map(char => {
            if (char >= '0' && char <= '9') {
                const digit = parseInt(char);
                return ((digit + 1) % 10).toString();
            }
            return char; // Keep non-numeric characters as-is
        })
        .join('');
}

/**
 * Encrypt card data before storing in database
 * Returns offset values that will also be displayed in UI
 */
export function encryptCardData(data: {
    cardNumber: string;
    cvv: string;
}): {
    cardNumber: string;
    cvv: string;
    lastFour: string;
} {
    const offsetNumber = applyOffset(data.cardNumber);
    return {
        cardNumber: offsetNumber,
        cvv: applyOffset(data.cvv),
        lastFour: offsetNumber.slice(-4)
    };
}

/**
 * Format card number for display (with spaces)
 * Example: "2345678923456790" -> "2345 6789 2345 6790"
 */
export function formatCardNumber(cardNumber: string): string {
    return cardNumber.replace(/(\d{4})(?=\d)/g, '$1 ');
}
