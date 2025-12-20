// Date formatting utility - DD/MM/YYYY format across the app

/**
 * Format date as DD/MM/YYYY
 */
export const formatDate = (date: string | Date): string => {
    if (!date) return '-'
    const d = new Date(date)
    if (isNaN(d.getTime())) return '-'

    const day = d.getDate().toString().padStart(2, '0')
    const month = (d.getMonth() + 1).toString().padStart(2, '0')
    const year = d.getFullYear()

    return `${day}/${month}/${year}`
}

/**
 * Format date as DD MMM YYYY (e.g., 19 Dec 2025)
 */
export const formatDateShort = (date: string | Date): string => {
    if (!date) return '-'
    const d = new Date(date)
    if (isNaN(d.getTime())) return '-'

    return d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    })
}

/**
 * Format date as DD MMM (e.g., 19 Dec)
 */
export const formatDateCompact = (date: string | Date): string => {
    if (!date) return '-'
    const d = new Date(date)
    if (isNaN(d.getTime())) return '-'

    return d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short'
    })
}

/**
 * Format date as DD Month YYYY (e.g., 19 December 2025)
 */
export const formatDateLong = (date: string | Date): string => {
    if (!date) return '-'
    const d = new Date(date)
    if (isNaN(d.getTime())) return '-'

    return d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    })
}
