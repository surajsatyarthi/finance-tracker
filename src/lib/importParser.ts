import Papa from 'papaparse'

export interface ImportRow {
    date: string
    description: string
    amount: number
    category: string
    type: 'income' | 'expense'
    paymentMethod?: string
    bankAccount?: string
}

export interface ImportResult {
    success: boolean
    imported: number
    failed: number
    errors: string[]
    data: ImportRow[]
}

export interface ColumnMapping {
    date?: string
    description?: string
    amount?: string
    category?: string
    type?: string
    paymentMethod?: string
    bankAccount?: string
}

/**
 * Parse CSV file and return structured data
 */
export const parseCSV = async (file: File): Promise<ImportResult> => {
    return new Promise((resolve) => {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const importResult: ImportResult = {
                    success: true,
                    imported: 0,
                    failed: 0,
                    errors: [],
                    data: []
                }

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                results.data.forEach((row: any, index: number) => {
                    try {
                        const parsed = parseRow(row)
                        if (parsed) {
                            importResult.data.push(parsed)
                            importResult.imported++
                        } else {
                            importResult.failed++
                            importResult.errors.push(`Row ${index + 1}: Invalid data format`)
                        }
                    } catch (error) {
                        importResult.failed++
                        importResult.errors.push(`Row ${index + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`)
                    }
                })

                importResult.success = importResult.failed === 0
                resolve(importResult)
            },
            error: (error) => {
                resolve({
                    success: false,
                    imported: 0,
                    failed: 0,
                    errors: [error.message],
                    data: []
                })
            }
        })
    })
}

/**
 * Parse a single row with flexible column mapping
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const parseRow = (row: any): ImportRow | null => {
    // Try to detect common column names
    const dateField = findField(row, ['date', 'Date', 'DATE', 'transaction_date', 'Transaction Date'])
    const descField = findField(row, ['description', 'Description', 'DESCRIPTION', 'desc', 'Desc', 'particulars', 'Particulars'])
    const amountField = findField(row, ['amount', 'Amount', 'AMOUNT', 'value', 'Value'])
    const categoryField = findField(row, ['category', 'Category', 'CATEGORY', 'type', 'Type'])
    const typeField = findField(row, ['transaction_type', 'Transaction Type', 'type', 'Type', 'income_expense'])

    if (!dateField || !descField || !amountField) {
        return null
    }

    // Parse amount - handle negative numbers as expenses
    let amount = parseFloat(amountField.replace(/[^0-9.-]/g, ''))
    let type: 'income' | 'expense' = 'expense'

    // Determine type from amount sign or explicit type field
    if (typeField) {
        const typeValue = typeField.toLowerCase()
        if (typeValue.includes('income') || typeValue.includes('credit')) {
            type = 'income'
        } else if (typeValue.includes('expense') || typeValue.includes('debit')) {
            type = 'expense'
        }
    } else if (amount < 0) {
        type = 'expense'
        amount = Math.abs(amount)
    } else if (amount > 0) {
        // Positive amount without type field - default to expense
        type = 'expense'
    }

    return {
        date: parseDate(dateField),
        description: descField.trim(),
        amount: Math.abs(amount),
        category: categoryField || 'Uncategorized',
        type,
        paymentMethod: findField(row, ['payment_method', 'Payment Method', 'method', 'Method']),
        bankAccount: findField(row, ['bank_account', 'Bank Account', 'account', 'Account'])
    }
}

/**
 * Find a field value from multiple possible column names
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const findField = (row: any, possibleNames: string[]): string | undefined => {
    for (const name of possibleNames) {
        if (row[name] !== undefined && row[name] !== null && row[name] !== '') {
            return String(row[name])
        }
    }
    return undefined
}

/**
 * Parse date from various formats
 */
const parseDate = (dateStr: string): string => {
    // Try to parse common date formats
    const formats = [
        // ISO format
        /^\d{4}-\d{2}-\d{2}$/,
        // DD/MM/YYYY
        /^\d{1,2}\/\d{1,2}\/\d{4}$/,
        // MM/DD/YYYY
        /^\d{1,2}\/\d{1,2}\/\d{4}$/,
        // DD-MM-YYYY
        /^\d{1,2}-\d{1,2}-\d{4}$/
    ]

    // If already in ISO format, return as is
    if (formats[0].test(dateStr)) {
        return dateStr
    }

    // Try to parse the date
    const date = new Date(dateStr)
    if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0]
    }

    // If parsing fails, try DD/MM/YYYY format
    const parts = dateStr.split(/[\/\-]/)
    if (parts.length === 3) {
        const [day, month, year] = parts
        const parsed = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
        if (!isNaN(parsed.getTime())) {
            return parsed.toISOString().split('T')[0]
        }
    }

    // Fallback to today's date
    return new Date().toISOString().split('T')[0]
}

/**
 * Validate import data before saving
 */
export const validateImportData = (data: ImportRow[]): { valid: boolean; errors: string[] } => {
    const errors: string[] = []

    data.forEach((row, index) => {
        if (!row.date) {
            errors.push(`Row ${index + 1}: Missing date`)
        }
        if (!row.description || row.description.trim() === '') {
            errors.push(`Row ${index + 1}: Missing description`)
        }
        if (!row.amount || row.amount <= 0) {
            errors.push(`Row ${index + 1}: Invalid amount`)
        }
        if (!row.type || (row.type !== 'income' && row.type !== 'expense')) {
            errors.push(`Row ${index + 1}: Invalid transaction type`)
        }
    })

    return {
        valid: errors.length === 0,
        errors
    }
}
