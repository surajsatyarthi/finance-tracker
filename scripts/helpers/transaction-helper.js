/**
 * Transaction Helper Module
 * Standardized functions for adding transactions to the finance tracker
 * Handles all database constraints and enum values
 */

const { createClient } = require('@supabase/supabase-js');

// Valid enum values based on database constraints
const VALID_PAYMENT_METHODS = ['cash', 'upi', 'card', 'bank_transfer', 'cheque'];
const VALID_TRANSACTION_TYPES = ['income', 'expense'];

/**
 * Add a transaction to the database
 * @param {Object} supabase - Supabase client
 * @param {Object} options - Transaction options
 * @param {string} options.userId - User ID
 * @param {number} options.amount - Transaction amount
 * @param {string} options.type - Transaction type ('income' or 'expense')
 * @param {string} options.categoryId - Category ID
 * @param {string} options.description - Transaction description
 * @param {string} options.paymentMethod - Payment method (cash/upi/card/bank_transfer/cheque)
 * @param {string} options.date - Transaction date (YYYY-MM-DD)
 * @param {string} [options.accountId] - Optional account ID
 * @param {boolean} [options.isRecurring=false] - Whether transaction is recurring
 * @returns {Promise<Object>} Created transaction
 */
async function addTransaction(supabase, options) {
    const {
        userId,
        amount,
        type,
        categoryId,
        description,
        paymentMethod,
        date,
        accountId = null,
        isRecurring = false
    } = options;

    // Validate inputs
    if (!VALID_TRANSACTION_TYPES.includes(type)) {
        throw new Error(`Invalid type: ${type}. Must be one of: ${VALID_TRANSACTION_TYPES.join(', ')}`);
    }

    if (!VALID_PAYMENT_METHODS.includes(paymentMethod)) {
        throw new Error(`Invalid payment method: ${paymentMethod}. Must be one of: ${VALID_PAYMENT_METHODS.join(', ')}`);
    }

    // Insert transaction
    // NOTE: Do NOT set month/year - they are auto-generated from date column
    const { data, error } = await supabase
        .from('transactions')
        .insert([{
            user_id: userId,
            account_id: accountId,
            amount,
            type,
            category_id: categoryId,
            description,
            payment_method: paymentMethod,
            date,
            is_recurring: isRecurring
        }])
        .select()
        .single();

    if (error) {
        throw new Error(`Transaction insert failed: ${error.message}`);
    }

    return data;
}

/**
 * Update credit card balance after a transaction
 * @param {Object} supabase - Supabase client
 * @param {string} cardId - Credit card ID
 * @param {number} amount - Amount to add to balance
 * @returns {Promise<Object>} Updated card
 */
async function updateCardBalance(supabase, cardId, amount) {
    // Get current balance
    const { data: card, error: fetchError } = await supabase
        .from('credit_cards')
        .select('id, current_balance')
        .eq('id', cardId)
        .single();

    if (fetchError) {
        throw new Error(`Card not found: ${fetchError.message}`);
    }

    const newBalance = (card.current_balance || 0) + amount;

    // Update balance
    const { data, error } = await supabase
        .from('credit_cards')
        .update({ current_balance: newBalance })
        .eq('id', cardId)
        .select()
        .single();

    if (error) {
        throw new Error(`Balance update failed: ${error.message}`);
    }

    return data;
}

/**
 * Add a credit card transaction record
 * @param {Object} supabase - Supabase client
 * @param {Object} options - Transaction options
 * @param {string} options.userId - User ID
 * @param {string} options.cardId - Credit card ID
 * @param {number} options.amount - Transaction amount
 * @param {string} options.description - Description
 * @param {string} options.date - Transaction date
 * @param {string} [options.type='purchase'] - Transaction type
 * @returns {Promise<Object>} Created record
 */
async function addCreditCardTransaction(supabase, options) {
    const {
        userId,
        cardId,
        amount,
        description,
        date,
        type = 'purchase'
    } = options;

    const { data, error } = await supabase
        .from('credit_card_transactions')
        .insert([{
            user_id: userId,
            credit_card_id: cardId,
            amount,
            type,
            description,
            transaction_date: date
        }])
        .select()
        .single();

    if (error) {
        throw new Error(`Credit card transaction failed: ${error.message}`);
    }

    return data;
}

/**
 * Find or create a category
 * @param {Object} supabase - Supabase client
 * @param {string} userId - User ID
 * @param {string} categoryName - Category name
 * @param {string} type - Category type ('income' or 'expense')
 * @param {string} [color='#8B5CF6'] - Category color
 * @returns {Promise<Object>} Category
 */
async function findOrCreateCategory(supabase, userId, categoryName, type, color = '#8B5CF6') {
    // Try to find existing
    const { data: existing } = await supabase
        .from('categories')
        .select('id, name')
        .eq('user_id', userId)
        .eq('type', type)
        .ilike('name', `%${categoryName}%`)
        .single();

    if (existing) {
        return existing;
    }

    // Create new
    const { data, error } = await supabase
        .from('categories')
        .insert([{
            user_id: userId,
            name: categoryName,
            type,
            color
        }])
        .select()
        .single();

    if (error) {
        throw new Error(`Category creation failed: ${error.message}`);
    }

    return data;
}

module.exports = {
    addTransaction,
    updateCardBalance,
    addCreditCardTransaction,
    findOrCreateCategory,
    VALID_PAYMENT_METHODS,
    VALID_TRANSACTION_TYPES
};
