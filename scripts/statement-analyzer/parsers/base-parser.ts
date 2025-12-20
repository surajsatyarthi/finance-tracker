import fs from 'fs'
import { execSync } from 'child_process'
import { StatementData, ParseResult } from '../types'

/**
 * Base parser class that all bank-specific parsers extend
 */
export abstract class BaseParser {
    protected bankName: string

    constructor(bankName: string) {
        this.bankName = bankName
    }

    /**
     * Read and convert PDF to text using pdftotext
     */
    async extractText(pdfPath: string): Promise<string> {
        try {
            // Create temporary text file path
            const txtPath = pdfPath.replace('.pdf', '.txt')

            // Run pdftotext command
            execSync(`pdftotext "${pdfPath}" "${txtPath}"`)

            // Read the text file
            const text = fs.readFileSync(txtPath, 'utf-8')

            // Clean up temp file
            fs.unlinkSync(txtPath)

            return text
        } catch (error) {
            throw new Error(`Failed to extract PDF text: ${error}`)
        }
    }

    /**
     * Parse statement text - must be implemented by each bank
     */
    abstract parseStatement(text: string): StatementData

    /**
     * Main entry point - extract and parse
     */
    async analyze(pdfPath: string): Promise<ParseResult> {
        try {
            console.log(`📄 Extracting text from PDF...`)
            const text = await this.extractText(pdfPath)

            console.log(`🔍 Parsing ${this.bankName} statement...`)
            const data = this.parseStatement(text)

            return {
                success: true,
                data,
                bankName: this.bankName
            }
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                bankName: this.bankName
            }
        }
    }

    /**
     * Utility: Extract text between two patterns
     */
    protected extractBetween(text: string, start: RegExp, end: RegExp): string {
        const startMatch = text.match(start)
        if (!startMatch) return ''

        const startIndex = text.indexOf(startMatch[0]) + startMatch[0].length
        const remainingText = text.substring(startIndex)

        const endMatch = remainingText.match(end)
        if (!endMatch) return remainingText.trim()

        const endIndex = remainingText.indexOf(endMatch[0])
        return remainingText.substring(0, endIndex).trim()
    }

    /**
     * Utility: Extract amount from string (handles ₹, commas, etc.)
     */
    protected extractAmount(text: string): number {
        const match = text.match(/[\d,]+\.?\d*/);
        if (!match) return 0

        const cleaned = match[0].replace(/,/g, '')
        return parseFloat(cleaned)
    }

    /**
     * Utility: Extract date in YYYY-MM-DD format
     */
    protected parseDate(dateStr: string): string {
        // Try various date formats
        const formats = [
            /(\d{2})\/(\d{2})\/(\d{4})/,  // DD/MM/YYYY
            /(\d{2})-(\d{2})-(\d{4})/,     // DD-MM-YYYY
            /(\d{1,2})\s+(\w+)\s+(\d{4})/  // DD Month YYYY
        ]

        for (const format of formats) {
            const match = dateStr.match(format)
            if (match) {
                if (format === formats[2]) {
                    // Handle month names
                    const months: { [key: string]: string } = {
                        'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
                        'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
                        'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
                    }
                    const monthStr = match[2].substring(0, 3)
                    return `${match[3]}-${months[monthStr]}-${match[1].padStart(2, '0')}`
                }
                // DD/MM/YYYY or DD-MM-YYYY
                return `${match[3]}-${match[2]}-${match[1]}`
            }
        }

        return dateStr // Return as-is if can't parse
    }
}
