import { BaseParser } from './base-parser'
import { StatementData, EMIDetail } from '../types'

/**
 * Parser for ICICI Bank credit card statements
 * Supports: Amazon Pay, Adani One, and other ICICI cards
 */
export class ICICIParser extends BaseParser {
    constructor() {
        super('ICICI Bank')
    }

    parseStatement(text: string): StatementData {
        // Extract card number (last 4 digits)
        const cardMatch = text.match(/(\d{4}X{8}\d{4})/);
        const lastFour = cardMatch ? cardMatch[1].slice(-4) : ''

        //Extract card name (Amazon Pay, Adani One, etc.)
        let cardName = 'ICICI'
        if (text.includes('Amazon Pay')) cardName = 'ICICI Amazon'
        else if (text.includes('Adani One')) cardName = 'ICICI Adani One'

        // Extract dates - Strategy: Find all dates in the first part of document
        // Dates appear as "December 5, 2025" or "December 23, 2025" near the top
        const topSection = text.substring(0, 2000) // Increased to ensure we catch both dates

        // Find all dates in "Month Day, Year" format in the top section
        const dateRegex = /(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2}),?\s+(\d{4})/g
        const allDates: string[] = []
        let dateMatch
        while ((dateMatch = dateRegex.exec(topSection)) !== null) {
            allDates.push(`${dateMatch[1]} ${dateMatch[2]}, ${dateMatch[3]}`)
        }

        // ICICI statements: First date is statement date, second is due date
        const statementDate = allDates[0] ? this.parseDate(allDates[0]) : ''
        const dueDate = allDates[1] ? this.parseDate(allDates[1]) : ''

        // Extract balances from STATEMENT SUMMARY section
        const prevBalMatch = text.match(/Previous Balance[^\d]*`?([\d,]+\.?\d*)/i)
        const purchasesMatch = text.match(/Purchases\s*\/\s*Charges[^\d]*`?([\d,]+\.?\d*)/i)
        const paymentsMatch = text.match(/Payments\s*\/\s*Credits[^\d]*`?([\d,]+\.?\d*)/i)
        const totalDueMatch = text.match(/Total Amount due[^\d]*`?([\d,]+\.?\d*)/i)
        const minDueMatch = text.match(/Minimum Amount due[^\d]*`?([\d,]+\.?\d*)/i)

        const previousBalance = prevBalMatch ? this.extractAmount(prevBalMatch[1]) : 0
        const newCharges = purchasesMatch ? this.extractAmount(purchasesMatch[1]) : 0
        const paymentsCredits = paymentsMatch ? this.extractAmount(paymentsMatch[1]) : 0
        const totalAmountDue = totalDueMatch ? this.extractAmount(totalDueMatch[1]) : 0
        const minimumAmountDue = minDueMatch ? this.extractAmount(minDueMatch[1]) : 0

        // Extract credit limits
        const creditLimitMatch = text.match(/Credit Limit[^\d]*`?([\d,]+\.?\d*)/i)
        const availableCreditMatch = text.match(/Available Credit[^\d]*`?([\d,]+\.?\d*)/i)
        const cashLimitMatch = text.match(/Cash Limit[^\d]*`?([\d,]+\.?\d*)/i)

        const creditLimit = creditLimitMatch ? this.extractAmount(creditLimitMatch[1]) : 0
        const availableCredit = availableCreditMatch ? this.extractAmount(availableCreditMatch[1]) : 0
        const cashLimit = cashLimitMatch ? this.extractAmount(cashLimitMatch[1]) : 0

        // Extract EMI details
        const emis = this.extractEMIs(text)

        return {
            cardName,
            lastFourDigits: lastFour,
            statementDate,
            dueDate,
            previousBalance,
            newCharges,
            paymentsCredits,
            totalAmountDue,
            minimumAmountDue,
            creditLimit,
            availableCredit,
            cashLimit,
            emis
        }
    }

    private extractEMIs(text: string): EMIDetail[] {
        const emis: EMIDetail[] = []

        // Look for EMI/PERSONAL LOAN section
        const emiSection = text.match(/EMI\s*\/\s*PERSONAL LOAN ON CREDIT CARDS([\s\S]*?)(?=\n\n|Page \d+ of|MOST IMPORTANT)/i)
        if (!emiSection) return emis

        const emiText = emiSection[1]

        // Extract EMI rows (simplified pattern matching)
        const emiRows = emiText.split('\n').filter(line => line.trim())

        // ICICI statements show EMIs in table format
        // We'll look for rows with specific patterns
        const emiPattern = /(\d{2}\/\d{2}\/\d{4})\s+(\d{2}\/\d{2}\/\d{4})\s+(\d+)\s+([\d,]+\.?\d*)\s+(\d+)\s+([\d,]+\.?\d*)\s+([\d,]+\.?\d*)/g

        let match
        let emiCount = 1
        while ((match = emiPattern.exec(emiText)) !== null) {
            const [_, creationDate, finishDate, totalInst, emiAmount, pendingInst, outstandingAmt, monthlyInst] = match

            emis.push({
                description: `EMI #${emiCount}`,
                creationDate: this.parseDate(creationDate),
                finishDate: this.parseDate(finishDate),
                totalInstallments: parseInt(totalInst),
                pendingInstallments: parseInt(pendingInst),
                emiAmount: this.extractAmount(monthlyInst),
                outstandingAmount: this.extractAmount(outstandingAmt)
            })

            emiCount++
        }

        return emis
    }
}
