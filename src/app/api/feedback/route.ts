
import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { writeFile } from 'fs/promises'

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData()
        const message = formData.get('message') as string
        const files = formData.getAll('files') as File[]

        if (!message && files.length === 0) {
            return NextResponse.json({ error: 'Message or file is required' }, { status: 400 })
        }

        const timestamp = new Date().toLocaleString('en-IN')
        const userAgent = req.headers.get('user-agent') || 'Unknown Device'

        let imageLinks = ''

        // Handle File Uploads
        if (files.length > 0) {
            const uploadDir = path.join(process.cwd(), 'public', 'feedback_uploads')

            // Ensure directory exists
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true })
            }

            for (const file of files) {
                if (file.size > 0 && file.name) {
                    const buffer = Buffer.from(await file.arrayBuffer())
                    const filename = `screenshot_${Date.now()}_${file.name.replace(/\s/g, '_')}`

                    await writeFile(path.join(uploadDir, filename), buffer)
                    imageLinks += `\n![Screenshot](/feedback_uploads/${filename})`
                }
            }
        }

        // Append to Markdown File
        const feedbackEntry = `
## Feedback - ${timestamp}
**Device**: ${userAgent}
**Message**: 
${message || '(No text provided)'}

${imageLinks}

---
`
        const feedbackFile = path.join(process.cwd(), 'MOBILE_FEEDBACK.md')
        fs.appendFileSync(feedbackFile, feedbackEntry)

        return NextResponse.json({ success: true, message: 'Feedback saved' })
    } catch (error) {
        console.error('Error saving feedback:', error)
        return NextResponse.json({ error: 'Failed to save feedback' }, { status: 500 })
    }
}
