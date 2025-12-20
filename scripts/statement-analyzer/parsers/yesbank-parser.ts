import { BaseParser } from './base-parser'
import { StatementData, EMIDetail } from '../types'

/**
 * Parser for YES Bank (Pop) credit card statements
 */
export class YESBankParser extends BaseParser {
    constructor() {
        super('YES Bank')
    }

    parseStatement(text: string): StatementData {
        // Extract card name
        let cardName = 'YES Bank Pop'
        if (text.includes('Pop YES Bank')) cardName = 'Pop YES Bank'

        // Extract card number (last 4 digits)
        const cardMatch = text.match(/Card Number[:\s]*X{12}(\d{4})/)
        const lastFour = cardMatch ? cardMatch[1] : ''

        // Extract dates from top section
        const topSection = text.substring(0, 2000)
        const dateRegex = /(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2}),?\s+(\d{4})/g
        const allDates: string[] = []
        let dateMatch
        while ((dateMatch = dateRegex.exec(topSection)) !== null) {
            allDates.push(`${dateMatch[1]} ${dateMatch[2]}, ${dateMatch[3]}`)
        }

        const statementDate = allDates[0] ? this.parseDate(allDates[0]) : ''
        const dueDate = allDates[1] ? this.parseDate(allDates[1]) : ''

        // Extract balances
        const prevBalMatch = text.match(/Previous Balance[:\s]*₹?\s*([0-9,]+\.?\d*)/i)
        const purchasesMatch = text.match(/(?:Purchases|New Charges)[:\s]*₹?\s*([0-9,]+\.?\d*)/i)
        const paymentsMatch = text.match(/(?:Payments|Credits)[:\s]*₹?\s*([0-9,]+\.?\d*)/i)
        const totalDueMatch = text.match(/Total (?:Amount )?[Dd]ue[:\s]*₹?\s*([0-9,]+\.?\d*)/i)
        const minDueMatch = text.match(/Minimum (?:Amount )?[Dd]ue[:\s]*₹?\s*([0-9,]+\.?\d*)/i)

        const previousBalance = prevBalMatch ? this.extractAmount(prevBalMatch[1]) : 0
        const newCharges = purchasesMatch ? this.extractAmount(purchasesMatch[1]) : 0
        const paymentsCredits = paymentsMatch ? this.extractAmount(paymentsMatch[1]) : 0
        const totalAmountDue = totalDueMatch ? this.extractAmount(totalDueMatch[1]) : 0
        const minimumAmountDue = minDueMatch ? this.extractAmount(minDueMatch[1]) : 0

        // Extract credit limits
        const creditLimitMatch = text.match(/Credit Limit[:\s]*₹?\s*([0-9,]+\.?\d*)/i)
        const availableCreditMatch = text.match(/Available (?:Credit|Limit)[:\s]*₹?\s*([0-9,]+\.?\d*)/i)

        const creditLimit = creditLimitMatch ? this.extractAmount(creditLimitMatch[1]) : 0
        const availableCredit = availableCreditMatch ? this.extractAmount(availableCreditMatch[1]) : creditLimit - totalAmountDue

        // Extract EMIs
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
            cashLimit: 0,
            emis
        }
    }

    private extractEMIs(text: string): EMIDetail[] {
        const emis: EMIDetail[] = []

        // Look for EMI section
        const emiSection = text.match(/EMI.*?Details([\s\S]*?)(?:Important|Page \d+ of|\n\n\n)/i)
        if (!emiSection) return emis

        const emiText = emiSection[1]

        // YES Bank EMI pattern
        const lines = emiText.split('\n').filter(line => line.trim())

        for (const line of lines) {
            const emiMatch = line.match(/([0-9,]+\.?\d*)\s+([0-9,]+\.?\d*)\s+(\d+)/)
            if (emiMatch) {
                emis.push({
                    description: 'EMI',
                    creationDate: '',
                    finishDate: '',
                    totalInstallments: parseInt(emiMatch[3]) || 0,
                    pendingInstallments: parseInt(emiMatch[3]) || 0,
                    emiAmount: this.extractAmount(emiMatch[1]),
                    outstandingAmount: this.extractAmount(emiMatch[2])
                })
            }
        }

        return emis
    }
}
