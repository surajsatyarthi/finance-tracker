import { ICICIParser } from './parsers/icici-parser'

/**
 * Test the ICICI parser with existing statements
 */
async function testICICIParser() {
    const parser = new ICICIParser()

    // Test with ICICI Amazon statement
    console.log('\n🧪 Testing ICICI Amazon Parser')
    console.log('='.repeat(70))

    try {
        const result = await parser.analyze('/Users/surajsatyarthi/Desktop/Fin/next_statement.pdf')

        if (result.success && result.data) {
            console.log('\n✅ Successfully parsed statement!')
            console.log('\n📋 Extracted Data:')
            console.log('━'.repeat(70))
            console.log(`Card: ${result.data.cardName}`)
            console.log(`Last 4 Digits: ${result.data.lastFourDigits}`)
            console.log(`Statement Date: ${result.data.statementDate}`)
            console.log(`Due Date: ${result.data.dueDate}`)
            console.log(`\nPrevious Balance: ₹${result.data.previousBalance.toLocaleString('en-IN')}`)
            console.log(`New Charges: ₹${result.data.newCharges.toLocaleString('en-IN')}`)
            console.log(`Payments/Credits: ₹${result.data.paymentsCredits.toLocaleString('en-IN')}`)
            console.log(`\nTotal Amount Due: ₹${result.data.totalAmountDue.toLocaleString('en-IN')}`)
            console.log(`Minimum Amount Due: ₹${result.data.minimumAmountDue.toLocaleString('en-IN')}`)
            console.log(`\nCredit Limit: ₹${result.data.creditLimit.toLocaleString('en-IN')}`)
            console.log(`Available Credit: ₹${result.data.availableCredit.toLocaleString('en-IN')}`)

            if (result.data.emis && result.data.emis.length > 0) {
                console.log(`\n📌 EMIs Found: ${result.data.emis.length}`)
                result.data.emis.forEach((emi, idx) => {
                    console.log(`\n  EMI #${idx + 1}:`)
                    console.log(`    Outstanding: ₹${emi.outstandingAmount.toLocaleString('en-IN')}`)
                    console.log(`    Monthly: ₹${emi.emiAmount.toLocaleString('en-IN')}`)
                    console.log(`    Pending: ${emi.pendingInstallments}/${emi.totalInstallments} installments`)
                })
            }

        } else {
            console.log(`\n❌ Failed to parse: ${result.error}`)
        }

    } catch (error) {
        console.error(`\n❌ Error: ${error}`)
    }

    console.log('\n' + '='.repeat(70))
}

// Run test
testICICIParser()
