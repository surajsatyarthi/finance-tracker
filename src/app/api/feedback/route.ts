
import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { writeFile } from 'fs/promises'

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData()
        const message = formData.get('message') as string
        const file = formData.get('file') as File | null

        if (!message && !file) {
            return NextResponse.json({ error: 'Message or file is required' }, { status: 400 })
        }

        const timestamp = new Date().toLocaleString('en-IN')
        const userAgent = req.headers.get('user-agent') || 'Unknown Device'

        let imageLink = ''

        // Handle File Upload
        if (file) {
            const buffer = Buffer.from(await file.arrayBuffer())
            const filename = `screenshot_${Date.now()}_${file.name.replace(/\s/g, '_')}`
            const uploadDir = path.join(process.cwd(), 'public', 'feedback_uploads')

            // Ensure directory exists (redundant check but safe)
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true })
            }

            await writeFile(path.join(uploadDir, filename), buffer)
            imageLink = `![Screenshot](/feedback_uploads/${filename})`
        }

        // Append to Markdown File
        const feedbackEntry = `
## Feedback - ${timestamp}
**Device**: ${userAgent}
**Message**: 
${message || '(No text provided)'}

${imageLink}

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
