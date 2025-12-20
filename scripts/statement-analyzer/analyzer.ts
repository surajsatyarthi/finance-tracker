#!/usr/bin/env tsx

import { ICICIParser } from './parsers/icici-parser'
import { DatabaseUpdater } from './db-updater'
import * as readline from 'readline'

/**
 * Main CLI tool for statement analysis
 */
async function main() {
    const args = process.argv.slice(2)

    if (args.length === 0) {
        console.log(`
📄 Statement Analyzer - Usage:

  npx tsx scripts/statement-analyzer/analyzer.ts <path-to-pdf>

Example:
  npx tsx scripts/statement-analyzer/analyzer.ts /path/to/statement.pdf

Supported Banks:
  ✅ ICICI (Amazon Pay, Adani One, etc.)
  🚧 RBL, HDFC, Indusind, SBI, Axis (coming soon)
`)
        process.exit(0)
    }

    const pdfPath = args[0]

    console.log('\n🔍 Analyzing Statement...')
    console.log('='.repeat(70))

    try {
        // Step 1: Parse the PDF
        const parser = new ICICIParser()  // TODO: Auto-detect bank
        const parseResult = await parser.analyze(pdfPath)

        if (!parseResult.success || !parseResult.data) {
            console.log(`\n❌ Failed to parse: ${parseResult.error}`)
            process.exit(1)
        }

        console.log(`\n✅ Successfully parsed ${parseResult.bankName} statement!`)

        const data = parseResult.data

        // Step 2: Display extracted data
        console.log(`\n📋 Extracted Data:`)
        console.log('━'.repeat(70))
        console.log(`Card: ${data.cardName}`)
        console.log(`Last 4 Digits: ${data.lastFourDigits}`)
        console.log(`Statement Date: ${data.statementDate || 'N/A'}`)
        console.log(`Due Date: ${data.dueDate || 'N/A'}`)
        console.log(`\nTotal Amount Due: ₹${data.totalAmountDue.toLocaleString('en-IN')}`)
        console.log(`Minimum Amount Due: ₹${data.minimumAmountDue.toLocaleString('en-IN')}`)
        console.log(`Credit Limit: ₹${data.creditLimit.toLocaleString('en-IN')}`)

        // Step 3: Connect to database and preview update
        const updater = new DatabaseUpdater()
        await updater.connect()

        const preview = await updater.previewUpdate(data)
        console.log(preview)

        // Step 4: Ask for confirmation
        const answer = await askQuestion('\n❓ Update database with this balance? (y/n): ')

        if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
            const result = await updater.updateCardBalance(data)

            if (result.success) {
                console.log(`\n✅ ${result.message}`)
            } else {
                console.log(`\n❌ ${result.message}`)
            }
        } else {
            console.log('\n⏭️  Skipped database update')
        }

        await updater.disconnect()
        console.log('\n' + '='.repeat(70))

    } catch (error) {
        console.error(`\n❌ Error: ${error}`)
        process.exit(1)
    }
}

/**
 * Helper to ask questions in CLI
 */
function askQuestion(query: string): Promise<string> {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    })

    return new Promise(resolve => {
        rl.question(query, (answer) => {
            rl.close()
            resolve(answer)
        })
    })
}

// Run the CLI
main()
