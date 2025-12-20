import { Client } from 'pg'
import dotenv from 'dotenv'
import path from 'path'
import { StatementData, UpdateResult } from './types'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL

/**
 * Database updater for statement data
 */
export class DatabaseUpdater {
    private client: Client
    private userId: string | null = null

    constructor() {
        this.client = new Client({ connectionString })
    }

    async connect() {
        await this.client.connect()

        // Get user ID
        const result = await this.client.query(
            `SELECT id FROM auth.users WHERE email = 'surajstoic@gmail.com'`
        )
        this.userId = result.rows[0]?.id || null
    }

    async disconnect() {
        await this.client.end()
    }

    /**
     * Find card by last 4 digits or name
     */
    async findCard(lastFourDigits: string, cardName?: string): Promise<any | null> {
        if (!this.userId) throw new Error('Not connected')

        let query = `
      SELECT id, name, current_balance, credit_limit
      FROM credit_cards
      WHERE user_id = $1
    `
        const params = [this.userId]

        if (lastFourDigits) {
            query += ` AND (last_four_digits = $2 OR card_number LIKE $3)`
            params.push(lastFourDigits, `%${lastFourDigits}`)
        } else if (cardName) {
            query += ` AND name LIKE $2`
            params.push(`%${cardName}%`)
        }

        const result = await this.client.query(query, params)
        return result.rows[0] || null
    }

    /**
     * Update card balance
     */
    async updateCardBalance(
        statementData: StatementData
    ): Promise<UpdateResult> {
        if (!this.userId) throw new Error('Not connected')

        try {
            // Find the card
            const card = await this.findCard(
                statementData.lastFourDigits,
                statementData.cardName
            )

            if (!card) {
                return {
                    success: false,
                    previousBalance: 0,
                    newBalance: 0,
                    message: `Card not found: ${statementData.cardName} ending in ${statementData.lastFourDigits}`
                }
            }

            const previousBalance = Number(card.current_balance)
            const newBalance = statementData.totalAmountDue

            // Update the balance
            await this.client.query(
                `UPDATE credit_cards SET current_balance = $1 WHERE id = $2`,
                [newBalance, card.id]
            )

            return {
                success: true,
                cardId: card.id,
                previousBalance,
                newBalance,
                message: `Updated ${card.name}: ₹${previousBalance.toLocaleString('en-IN')} → ₹${newBalance.toLocaleString('en-IN')}`
            }
        } catch (error) {
            return {
                success: false,
                previousBalance: 0,
                newBalance: 0,
                message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
            }
        }
    }

    /**
     * Preview what would be updated (dry run)
     */
    async previewUpdate(statementData: StatementData): Promise<string> {
        if (!this.userId) throw new Error('Not connected')

        const card = await this.findCard(
            statementData.lastFourDigits,
            statementData.cardName
        )

        if (!card) {
            return `❌ Card not found: ${statementData.cardName} ending in ${statementData.lastFourDigits}`
        }

        const previousBalance = Number(card.current_balance)
        const newBalance = statementData.totalAmountDue
        const difference = newBalance - previousBalance

        let preview = `\n📋 Update Preview:\n`
        preview += `━`.repeat(70) + `\n`
        preview += `Card: ${card.name}\n`
        preview += `Current Balance: ₹${previousBalance.toLocaleString('en-IN')}\n`
        preview += `Statement Balance: ₹${newBalance.toLocaleString('en-IN')}\n`
        preview += `Difference: ${difference >= 0 ? '+' : ''}₹${difference.toLocaleString('en-IN')}\n`
        preview += `\n`
        preview += `Statement Details:\n`
        preview += `  Previous Balance: ₹${statementData.previousBalance.toLocaleString('en-IN')}\n`
        preview += `  New Charges: ₹${statementData.newCharges.toLocaleString('en-IN')}\n`
        preview += `  Payments/Credits: ₹${statementData.paymentsCredits.toLocaleString('en-IN')}\n`
        preview += `  Due Date: ${statementData.dueDate}\n`

        if (statementData.emis && statementData.emis.length > 0) {
            preview += `\nEMIs: ${statementData.emis.length} active\n`
        }

        return preview
    }
}
