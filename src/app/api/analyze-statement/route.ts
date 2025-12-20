import { NextRequest, NextResponse } from 'next/server'
import { writeFile, unlink } from 'fs/promises'
import { join } from 'path'
import { ICICIParser } from '@/scripts/statement-analyzer/parsers/icici-parser'

export async function POST(request: NextRequest) {
    try {
        // Get the uploaded file
        const formData = await request.formData()
        const file = formData.get('file') as File

        if (!file) {
            return NextResponse.json(
                { error: 'No file uploaded' },
                { status: 400 }
            )
        }

        // Validate file type
        if (!file.name.endsWith('.pdf')) {
            return NextResponse.json(
                { error: 'Only PDF files are supported' },
                { status: 400 }
            )
        }

        // Save file temporarily
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        const tempPath = join('/tmp', `statement-${Date.now()}.pdf`)
        await writeFile(tempPath, buffer)

        try {
            // Parse the statement
            const parser = new ICICIParser()
            const result = await parser.analyze(tempPath)

            // Clean up temp file
            await unlink(tempPath)

            if (!result.success || !result.data) {
                return NextResponse.json(
                    { error: result.error || 'Failed to parse statement' },
                    { status: 400 }
                )
            }

            // Return extracted data
            return NextResponse.json({
                success: true,
                data: result.data,
                bankName: result.bankName
            })

        } catch (parseError) {
            // Clean up temp file on error
            try {
                await unlink(tempPath)
            } catch { }

            throw parseError
        }

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
        console.error('❌ Statement analysis error:', errorMessage, error)

        return NextResponse.json(
            {
                error: 'Failed to analyze statement',
                message: errorMessage,
                ...(process.env.NODE_ENV === 'development' && { stack: error instanceof Error ? error.stack : undefined })
            },
            { status: 500 }
        )
    }
}
