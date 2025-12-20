import { BaseParser } from './base-parser'
import { StatementData, EMIDetail } from '../types'

/**
 * Parser for Indusind Bank credit card statements
 * Supports: Platinum Aura Edge, Rupay, and other Indusind cards
 */
export class IndusindParser extends BaseParser {
    constructor() {
        super('Indusind Bank')
    }

    parseStatement(text: string): StatementData {
        // Extract card name
        let cardName = 'Indusind'
        if (text.includes('Platinum Aura Edge')) cardName = 'Indusind Platinum Aura Edge'
        else if (text.includes('Rupay')) cardName = 'Indusind Rupay'

        // Extract last 4 digits
        const cardMatch = text.match(/Card Number[:\s]*X+(\d{4})/)
        const lastFour = cardMatch ? cardMatch[1] : ''

        // Extract dates
        const topSection = text.substring(0, 2000)
        const dateRegex = /(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2}),?\s+(\d{4})/g
        const allDates: string[] = []
        let dateMatch
        while ((dateMatch = dateRegex.exec(topSection)) !== null) {
            allDates.push(`${dateMatch[1]} ${dateMatch[2]}, ${dateMatch[3]}`)
        }

        const statementDate = allDates[0] ? this.parseDate(allDates[0]) : ''
        const dueDate = allDates[1] ? this.parseDate(allDates[1]) : ''

        // Extract balances - Indusind uses "Total Outstanding"
        const prevBalMatch = text.match(/Previous (?:Balance|Outstanding)[:\s]*₹?\s*([0-9,]+\.?\d*)/i)
        const purchasesMatch = text.match(/(?:Purchases|Transactions)[:\s]*₹?\s*([0-9,]+\.?\d*)/i)
        const paymentsMatch = text.match(/(?:Payments|Credits)[:\s]*₹?\s*([0-9,]+\.?\d*)/i)
        const totalDueMatch = text.match(/Total Outstanding[:\s]*₹?\s*([0-9,]+\.?\d*)/i)
        const minDueMatch = text.match(/Minimum (?:Amount )?[Dd]ue[:\s]*₹?\s*([0-9,]+\.?\d*)/i)

        const previousBalance = prevBalMatch ? this.extractAmount(prevBalMatch[1]) : 0
        const newCharges = purchasesMatch ? this.extractAmount(purchasesMatch[1]) : 0
        const paymentsCredits = paymentsMatch ? this.extractAmount(paymentsMatch[1]) : 0
        const totalAmountDue = totalDueMatch ? this.extractAmount(totalDueMatch[1]) : 0
        const minimumAmountDue = minDueMatch ? this.extractAmount(minDueMatch[1]) : 0

        // Extract credit limits
        const creditLimitMatch = text.match(/Credit Limit[:\s]*₹?\s*([0-9,]+\.?\d*)/i)
        const availableCreditMatch = text.match(/Available Credit[:\s]*₹?\s*([0-9,]+\.?\d*)/i)

        const creditLimit = creditLimitMatch ? this.extractAmount(creditLimitMatch[1]) : 0
        const availableCredit = availableCreditMatch ? this.extractAmount(availableCreditMatch[1]) : 0

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
            emis: []
        }
    }
}
