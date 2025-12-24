import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://zzwouesueadoqrlmteyh.supabase.co'
const serviceRoleKey = 'sb_secret_TMpPmiUzgw8SzAsM32-goQ_Z-71SMMs'

const supabase = createClient(supabaseUrl, serviceRoleKey)

async function addGroceryTransaction() {
    try {
        // Get user ID from existing card
        const { data: cardData } = await supabase
            .from('credit_cards')
            .select('user_id')
            .limit(1)
            .single()

        if (!cardData) {
            console.error('No cards found')
            return
        }

        const userId = cardData.user_id
        console.log('User ID:', userId)

        // Get Groceries category
        const { data: category } = await supabase
            .from('categories')
            .select('id, name')
            .eq('user_id', userId)
            .eq('type', 'expense')
            .ilike('name', '%Groceries%')
            .maybeSingle()

        console.log('Category:', category)

        // Add transaction for yesterday
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        const dateStr = yesterday.toISOString().split('T')[0]

        const { data: transaction, error } = await supabase
            .from('transactions')
            .insert({
                user_id: userId,
                amount: 209,
                type: 'expense',
                description: 'Groceries - Kotak Debit',
                date: dateStr,
                category_id: category?.id || null,
                subcategory: 'Groceries',
                payment_method: 'card'
            })
            .select()
            .single()

        if (error) {
            console.error('Error:', error)
            return
        }

        console.log('✅ Transaction added!')
        console.log('Amount: ₹209')
        console.log('Date:', dateStr, '(yesterday)')
        console.log('Category: Groceries')
        console.log('Payment: Kotak Debit Card')

    } catch (error) {
        console.error('Error:', error)
    }
}

addGroceryTransaction()
