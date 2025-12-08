
import Papa from 'papaparse'
import { Transaction } from '@/types/finance'

export interface ParsedTransaction {
    date: string
    description: string
    amount: number
    type: 'income' | 'expense'
    originalRow: any
    status: 'matched' | 'unmatched' | 'new'
    matchConfidence?: number
    matchedTransactionId?: string
}

export const parseStatementCSV = (file: File): Promise<ParsedTransaction[]> => {
    return new Promise((resolve, reject) => {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                try {
                    const parsed = results.data.map((row: any) => normalizeRow(row)).filter(t => t !== null) as ParsedTransaction[]
                    resolve(parsed)
                } catch (error) {
                    reject(error)
                }
            },
            error: (error) => {
                reject(error)
            }
        })
    })
}

// Helper to normalize different bank formats
// Targeted for standard columns but robust enough for common variations
const normalizeRow = (row: any): ParsedTransaction | null => {
    // 1. Detect Date
    const dateStr = row['Date'] || row['Transaction Date'] || row['Value Date'] || Object.values(row).find(v => isDate(v as string))
    if (!dateStr) return null

    // 2. Detect Description
    const description = row['Description'] || row['Narration'] || row['Particulars'] || row['Remarks'] || 'Unknown Transaction'

    // 3. Detect Amount & Type
    let amount = 0
    let type: 'income' | 'expense' = 'expense'

    // HDFC/Common style: "Debit Amount" and "Credit Amount" columns
    if (row['Debit'] || row['Debit Amount'] || row['Withdrawal Amount']) {
        const debit = parseFloat((row['Debit'] || row['Debit Amount'] || row['Withdrawal Amount'] || '0').replace(/,/g, ''))
        if (debit > 0) {
            amount = debit
            type = 'expense'
        }
    }

    if (row['Credit'] || row['Credit Amount'] || row['Deposit Amount']) {
        const credit = parseFloat((row['Credit'] || row['Credit Amount'] || row['Deposit Amount'] || '0').replace(/,/g, ''))
        if (credit > 0) {
            amount = credit
            type = 'income'
        }
    }

    // Single "Amount" column style (negative = debit usually, or separate "Type" column)
    if (amount === 0 && (row['Amount'] || row['Transaction Amount'])) {
        const rawAmt = parseFloat((row['Amount'] || row['Transaction Amount']).replace(/,/g, ''))
        if (row['Type'] === 'Dr' || row['CR/DR'] === 'DR' || rawAmt < 0) {
            amount = Math.abs(rawAmt)
            type = 'expense'
        } else {
            amount = Math.abs(rawAmt)
            type = 'income'
        }
    }

    if (amount === 0) return null // Skip invalid rows

    return {
        date: parseDate(dateStr),
        description: description.trim(),
        amount: amount,
        type: type,
        originalRow: row,
        status: 'unmatched'
    }
}

// Simple date parser ( DD/MM/YYYY or YYYY-MM-DD )
const parseDate = (dateStr: string): string => {
    try {
        const parts = dateStr.split(/[-/]/)
        // Assumption: DD/MM/YYYY if parts[0] is > 1900? No, usually YYYY-MM-DD has year first.
        // DD/MM/YYYY -> parts[2] is year.
        if (parts.length === 3) {
            if (parts[2].length === 4) {
                // DD/MM/YYYY
                return `${parts[2]}-${parts[1]}-${parts[0]}`
            } else if (parts[0].length === 4) {
                // YYYY-MM-DD
                return dateStr
            }
        }
        return new Date(dateStr).toISOString().split('T')[0]
    } catch (e) {
        return new Date().toISOString().split('T')[0] // Fallback
    }
}


// Reconciliation Logic
// Matches based on Amount (Exact) and Date (+/- 3 days)
export const reconcileTransactions = (
    parsed: ParsedTransaction[],
    existing: Transaction[]
): ParsedTransaction[] => {
    // Optimization: Create a map or sorted list if performance becomes an issue.
    // For personal finance (<10k txns), O(N*M) is acceptable vs complexity.

    return parsed.map(pTx => {
        // Filter potential candidates by Amount and Type first
        const candidates = existing.filter(eTx =>
            eTx.amount === pTx.amount &&
            eTx.type === pTx.type
        )

        // Check date proximity
        const match = candidates.find(cTx => {
            const pDate = new Date(pTx.date)
            const cDate = new Date(cTx.date)
            const diffTime = Math.abs(pDate.getTime() - cDate.getTime())
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
            return diffDays <= 3
        })

        if (match) {
            return {
                ...pTx,
                status: 'matched',
                matchConfidence: 100,
                matchedTransactionId: match.id
            }
        }

        return {
            ...pTx,
            status: 'new'
        }
    })
}

const isDate = (val: string): boolean => {
    if (!val || typeof val !== 'string') return false
    return !isNaN(Date.parse(val)) || /^\d{2}[-/]\d{2}[-/]\d{4}$/.test(val)
}

