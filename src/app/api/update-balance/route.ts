import { NextRequest, NextResponse } from 'next/server'
import { DatabaseUpdater } from '@/scripts/statement-analyzer/db-updater'
import { StatementData } from '@/scripts/statement-analyzer/types'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const statementData = body.statementData as StatementData

        if (!statementData) {
            return NextResponse.json(
                { error: 'No statement data provided' },
                { status: 400 }
            )
        }

        // Update the database
        const updater = new DatabaseUpdater()
        await updater.connect()

        const result = await updater.updateCardBalance(statementData)

        await updater.disconnect()

        if (result.success) {
            return NextResponse.json({
                success: true,
                message: result.message,
                previousBalance: result.previousBalance,
                newBalance: result.newBalance
            })
        } else {
            return NextResponse.json(
                { error: result.message },
                { status: 400 }
            )
        }

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
        console.error('❌ Balance update error:', errorMessage, error)

        return NextResponse.json(
            {
                error: 'Failed to update balance',
                message: errorMessage,
                ...(process.env.NODE_ENV === 'development' && { stack: error instanceof Error ? error.stack : undefined })
            },
            { status: 500 }
        )
    }
}
