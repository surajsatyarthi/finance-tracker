import { NextRequest, NextResponse } from 'next/server'
import { DatabaseUpdater } from '@/scripts/statement-analyzer/db-updater'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const lastFourDigits = searchParams.get('lastFour')
        const cardName = searchParams.get('cardName')

        if (!lastFourDigits && !cardName) {
            return NextResponse.json(
                { error: 'Either lastFour or cardName is required' },
                { status: 400 }
            )
        }

        const updater = new DatabaseUpdater()
        await updater.connect()

        const card = await updater.findCard(lastFourDigits || '', cardName || undefined)

        await updater.disconnect()

        if (!card) {
            return NextResponse.json(
                { error: 'Card not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            cardId: card.id,
            cardName: card.name,
            currentBalance: Number(card.current_balance),
            creditLimit: Number(card.credit_limit)
        })

    } catch (error) {
        console.error('Error fetching card:', error)
        return NextResponse.json(
            { error: 'Failed to fetch card details' },
            { status: 500 }
        )
    }
}
